import sys; sys.path.insert(0, ".")
from mag_rec import *
for b, ra, rb in (('qwen', 1, 1), ('qwen', 2, 1), ('cohere', 2, 2)):
    fin = rec2('JPKR', b, ra, rb)
    for nm, kw in (('current', dict(holdFrac=0.0)), ('hold0.5', dict(holdFrac=0.5))):
        loss, viol, rows = evaluate2('JPKR', fin, detail=True, **kw)
        print(f'\nJPKR {b} A{ra}B{rb} {nm}: loss {loss:.1f}'); [print('   FAIL', f'{e:5.1f}', d) for e, w, d, n in rows if e > 0]
    ann = annotated('JPKR', fin)
    print('  measures:'); [print('    ', f['eventDate'], f['code'], f['actor'], '->', f.get('measureUntil') or 'IN FORCE', '|', f['fact'][:55]) for f in ann if M.is_measure(f)]
