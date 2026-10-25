"""Appends the rows a human filled in world/out/pending_top300.csv to model/reviewed_facts.json, after validating every row.
Rows with an empty position_code and an empty reject are ignored. Nothing is written if ANY row is invalid (all errors are printed)."""
import csv, json, os, re, sys
from datetime import date, timedelta
HERE = os.path.dirname(os.path.abspath(__file__))
WORLD = os.environ.get('WORLD_DIR', HERE)
MODEL = os.environ.get('MODEL_DIR', os.path.join(WORLD, '..', 'model'))
sys.path.insert(0, MODEL)
import scoring as S

CSV = os.environ.get('CSV_FILE', os.path.join(WORLD, 'out', 'pending_top300.csv'))
FACTS = os.environ.get('FACTS_FILE', os.path.join(MODEL, 'reviewed_facts.json'))
REG = {c['code'] for c in json.load(open(os.path.join(WORLD, 'countries.json')))}


def validate(row, existing):
    errs = []
    pair = row['pair']
    if pair != '-'.join(sorted(pair.split('-'))) or any(c not in REG for c in pair.split('-')):
        errs.append('pair is not two alphabetical registry codes')
    code = row['position_code'].strip()
    if code not in S.STATES:
        errs.append(f'position_code {code!r} is not a state of the catalogue (scoring.STATES)')
    if len(row['source'].strip()) < 15:
        errs.append('source must say where the fact comes from (at least 15 characters)')
    if row['since'].strip() and not re.match(r'^\d{4}-\d{2}(-\d{2})?$', row['since'].strip()):
        errs.append('since must be empty, YYYY-MM or YYYY-MM-DD')
    if (pair, code) in existing:
        errs.append('that (pair, code) is already in reviewed_facts.json')
    return errs


def main():
    d = json.load(open(FACTS))
    existing = {(f['pair'], f['code']) for f in d['facts']}
    new, bad, seen = [], [], set()
    for i, row in enumerate(csv.DictReader(open(CSV, encoding='utf-8')), start=2):
        if not row['position_code'].strip() and not row['reject'].strip():
            continue
        errs = validate(row, existing | seen)
        if errs:
            bad.append((i, row['pair'], errs))
            continue
        seen.add((row['pair'], row['position_code'].strip()))
        f = dict(pair=row['pair'], code=row['position_code'].strip(), source=row['source'].strip(), reviewedOn=date.today().isoformat(),
                 expires=(date.today() + timedelta(days=365)).isoformat())
        if row['since'].strip():
            f['since'] = row['since'].strip()
        if row['reject'].strip().lower() in ('yes', 'y', 'true', '1'):
            f['reject'] = True
        new.append(f)
    for i, pair, errs in bad:
        print(f'line {i} {pair}: ' + '; '.join(errs))
    if bad:
        print(f'{len(bad)} invalid rows: NOTHING written')
        sys.exit(1)
    d['facts'] += new
    json.dump(d, open(FACTS, 'w'), ensure_ascii=False, indent=1)
    print(f'{len(new)} facts added to {os.path.relpath(FACTS)}')


if __name__ == '__main__':
    main()
