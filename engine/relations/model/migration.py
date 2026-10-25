"""Bilateral migrant stock from the UN DESA International Migrant Stock 2024 (Table 1: by destination and origin).

The xlsx is read as data only (zipfile + streaming XML). Parsed once into migration_cache.json: {dest_m49: {origin_m49: {year: stock}}} for countries/areas (code < 900).
"""
import json, os, re, time, zipfile
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.normpath(os.path.join(HERE, '..', 'un_data', 'undesa_pd_2024_ims_stock_by_sex_destination_and_origin.xlsx'))
CACHE = os.path.join(HERE, 'migration_cache.json')
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
# ISO 3166-1 numeric = UN M49 for countries. Each code is cross-checked against the country names in the file (see check_codes).
M49 = {'ES': 724, 'MA': 504, 'IL': 376, 'US': 840, 'CN': 156, 'IN': 356, 'CA': 124, 'MN': 496, 'AU': 36, 'SA': 682, 'QA': 634, 'CU': 192, 'SN': 686}


def _col(ref):
    n = 0
    for ch in re.match(r'([A-Z]+)', ref).group(1):
        n = n * 26 + ord(ch) - 64
    return n


def parse():
    z = zipfile.ZipFile(XLSX)
    ss = [''.join(t.text or '' for t in si.iter(NS + 't')) for si in ET.fromstring(z.read('xl/sharedStrings.xml')).iter(NS + 'si')]
    years, data, names = {}, {}, {}
    with z.open('xl/worksheets/sheet2.xml') as f:
        for _, el in ET.iterparse(f):
            if el.tag != NS + 'row':
                continue
            r = {}
            for c in el.iter(NS + 'c'):
                v = c.find(NS + 'v')
                if v is not None:
                    r[_col(c.get('r'))] = ss[int(v.text)] if c.get('t') == 's' else v.text
            n = int(el.get('r'))
            el.clear()
            if n == 11:
                years = {k: int(v) for k, v in r.items() if k >= 8 and str(v).isdigit()}
            elif n > 11 and 5 in r and 7 in r:
                try:
                    dest, orig = int(r[5]), int(r[7])
                except ValueError:
                    continue
                names[dest], names[orig] = r.get(2, ''), r.get(6, '')
                if dest < 900 and orig < 900:
                    vals = {str(years[k]): float(r[k]) for k in years if k in r and re.match(r'^[\d.]+$', str(r[k]))}
                    if vals:
                        data.setdefault(str(dest), {})[str(orig)] = vals
    json.dump(dict(data=data, names={str(k): v for k, v in names.items()}, years=sorted(set(years.values())), built=time.time()), open(CACHE, 'w'))
    return json.load(open(CACHE))


import functools


@functools.lru_cache(None)
def load():
    try:
        return json.load(open(CACHE))
    except Exception:
        return parse()


def stock(dest_code, origin_code, year='2024'):
    """People born in `origin` living in `dest` (UN DESA estimate), or None if the file has no figure."""
    d = load()['data'].get(str(M49[dest_code]), {}).get(str(M49[origin_code]), {})
    return d.get(year) if year in d else (d.get(max(d)) if d else None)


def check_codes():
    n = load()['names']
    return {c: n.get(str(m)) for c, m in M49.items()}


if __name__ == '__main__':
    t = time.time()
    d = parse()
    print(f'parsed in {time.time() - t:.0f}s: {len(d["data"])} destinations, years {d["years"]}')
    print('code check (our ISO code -> name in the file):', check_codes())
