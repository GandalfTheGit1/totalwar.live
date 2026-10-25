"""GDELT 1.0 daily event files -> per-day, per-pair aggregates (no raw files are kept).

Source: https://data.gdeltproject.org/events/YYYYMMDD.export.CSV.zip (GDELT Project, public, no key; cite GDELT when publishing).
Each zip (6-12 MB) is downloaded with curl into a temporary file, aggregated in one pass and DELETED. Output per day: world/gdelt/days/YYYYMMDD.json.gz

Filters (protocol_gdelt.py): both actors have a country code that maps to the registry and the two countries differ; the event's own date (SQLDATE) is at most 7 days
before the date it was added (late-coded old events are dropped and counted). Weight of an event = actor weight x ln(1 + NumSources), with actor weight 1.0 if any
of the six actor types is governmental or military (GOV, MIL, SPY, COP, JUD, LEG) and 0.3 otherwise.
Per pair and day: [n, W, Q1w, Q2w, Q3w, Q4w, Gpos, Gneg, toneW]  (events, total weight, weight by CAMEO QuadClass 1..4, weighted positive and negative Goldstein, weighted tone).

  python3 -I gdelt.py test 2026-10-19      one day, prints timing and unmapped actor codes
  python3 -I gdelt.py run A|B|AB [workers] download the authorised sets (resumable: existing days are skipped)
  python3 -I gdelt.py status               what is on disk
"""
import gzip, io, json, math, os, subprocess, sys, tempfile, time, zipfile
from collections import Counter
from datetime import date, datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
DAYS = os.path.join(HERE, 'gdelt', 'days')
REG = json.load(open(os.path.join(HERE, 'countries.json')))
ISO3 = {c['iso3']: c['code'] for c in REG}
# CAMEO country codes that differ from ISO alpha-3 (extended after the first test day printed the unmapped ones)
ALIAS = {'KSV': 'XK', 'PSE': 'PS', 'GZA': 'PS', 'WSB': 'PS', 'ROM': 'RO', 'ZAR': 'CD', 'TMP': 'TL'}
GOV = {'GOV', 'MIL', 'SPY', 'COP', 'JUD', 'LEG'}
URL = 'https://data.gdeltproject.org/events/{}.export.CSV.zip'
TODAY = date(2026, 10, 20)


def code_of(x):
    return ISO3.get(x) or ALIAS.get(x)


def dates_A():
    """The last 365 days before today."""
    return [TODAY - timedelta(days=i) for i in range(365, 0, -1)]


def dates_B():
    """One day in 14 from 2016-01-04 (a Monday) up to the day before set A starts."""
    d, out, stop = date(2016, 1, 4), [], dates_A()[0]
    while d < stop:
        out.append(d)
        d += timedelta(days=14)
    return out


def aggregate(lines):
    pairs, st = {}, Counter()
    for ln in lines:
        f = ln.rstrip('\n').split('\t')
        if len(f) < 57:
            st['short'] += 1
            continue
        a1, a2 = f[7], f[17]
        if not a1 or not a2:
            st['noactor'] += 1
            continue
        c1, c2 = code_of(a1), code_of(a2)
        if not c1 or not c2:
            st['unmapped'] += 1
            for x in (a1, a2):
                if not code_of(x):
                    st['U:' + x] += 1
            continue
        if c1 == c2:
            st['same'] += 1
            continue
        try:
            sql, added = datetime.strptime(f[1], '%Y%m%d'), datetime.strptime(f[56], '%Y%m%d')
            q, g, ns, tone = int(f[29]), float(f[30]), int(f[32] or 1), float(f[34] or 0)
        except ValueError:
            st['bad'] += 1
            continue
        if (added - sql).days > 7:
            st['late'] += 1
            continue
        w = (1.0 if GOV & {f[12], f[13], f[14], f[22], f[23], f[24]} else 0.3) * math.log1p(ns)
        k = c1 + '-' + c2 if c1 < c2 else c2 + '-' + c1
        p = pairs.setdefault(k, [0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
        p[0] += 1
        p[1] += w
        if 1 <= q <= 4:
            p[1 + q] += w
        p[6] += w * max(g, 0.0)
        p[7] += w * max(-g, 0.0)
        p[8] += w * tone
        st['kept'] += 1
    return pairs, st


def fetch_day(d, keep=False):
    """Download, aggregate, delete. Returns (pairs, stats, seconds, megabytes)."""
    t0 = time.time()
    tmp = tempfile.NamedTemporaryFile(suffix='.zip', delete=False, dir=os.environ.get('GDELT_TMP'))
    tmp.close()
    try:
        r = subprocess.run(['curl', '-sSfL', '--retry', '3', '--retry-delay', '5', '--max-time', '240', '-o', tmp.name, URL.format(d.strftime('%Y%m%d'))],
                           capture_output=True, text=True)
        if r.returncode:
            raise RuntimeError(f'curl {r.returncode}: {r.stderr.strip()[:120]}')
        mb = os.path.getsize(tmp.name) / 1048576
        with zipfile.ZipFile(tmp.name) as z, z.open(z.namelist()[0]) as fh:
            pairs, st = aggregate(io.TextIOWrapper(fh, encoding='utf-8', errors='replace'))
        return pairs, st, time.time() - t0, mb
    finally:
        os.unlink(tmp.name)


def save(d, pairs, st, mb):
    os.makedirs(DAYS, exist_ok=True)
    out = dict(d=d.isoformat(), zipMB=round(mb, 1), stats={k: v for k, v in st.items() if not k.startswith('U:')},
               p={k: [v[0]] + [round(x, 2) for x in v[1:]] for k, v in pairs.items()})
    with gzip.open(os.path.join(DAYS, d.strftime('%Y%m%d') + '.json.gz'), 'wt') as fh:
        json.dump(out, fh, separators=(',', ':'))


def work(d):
    fp = os.path.join(DAYS, d.strftime('%Y%m%d') + '.json.gz')
    if os.path.exists(fp):
        return d, 'skip', 0, 0
    try:
        pairs, st, sec, mb = fetch_day(d)
        save(d, pairs, st, mb)
        return d, 'ok', sec, mb
    except Exception as e:
        return d, f'FAIL {str(e)[:100]}', 0, 0


def run(which, workers=4):
    from multiprocessing import Pool
    todo = (dates_A() if 'A' in which else []) + (dates_B() if 'B' in which else [])
    t0, done, fails, mb_tot = time.time(), 0, [], 0.0
    with Pool(workers) as pool:
        for d, status, sec, mb in pool.imap_unordered(work, todo):
            done += 1
            mb_tot += mb
            if status.startswith('FAIL'):
                fails.append((d.isoformat(), status))
            if done % 20 == 0 or status.startswith('FAIL'):
                print(f'[{time.time() - t0:6.0f}s] {done}/{len(todo)} days, {mb_tot / 1024:.2f} GB downloaded' + (f'  {d} {status}' if status.startswith('FAIL') else ''), flush=True)
    print(f'[{time.time() - t0:6.0f}s] finished: {done}/{len(todo)} days, {mb_tot / 1024:.2f} GB, {len(fails)} failures', fails[:10], flush=True)


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'
    if cmd == 'test':
        d = date.fromisoformat(sys.argv[2])
        pairs, st, sec, mb = fetch_day(d)
        print(f'{d}: {mb:.1f} MB zip, {sec:.1f} s, {len(pairs)} pairs, {sum(v[0] for v in pairs.values())} events kept')
        print({k: v for k, v in st.items() if not k.startswith('U:')})
        print('top unmapped codes:', [(k[2:], v) for k, v in st.most_common() if k.startswith('U:')][:25])
        top = sorted(pairs.items(), key=lambda kv: -kv[1][1])[:8]
        print('heaviest pairs:', [(k, v[0], round(v[1], 1)) for k, v in top])
    elif cmd == 'run':
        run(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 4)
    else:
        files = sorted(os.listdir(DAYS)) if os.path.isdir(DAYS) else []
        size = sum(os.path.getsize(os.path.join(DAYS, f)) for f in files) / 1048576
        want = len(dates_A()) + len(dates_B())
        print(f'{len(files)}/{want} days on disk, {size:.1f} MB')
