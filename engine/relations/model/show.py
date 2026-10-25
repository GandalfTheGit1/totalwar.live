import json, sys
d = json.load(open(sys.argv[1]))
for k in ['structuralStatus', 'overallStatus', 'trend30d', 'confidence', 'axes', 'perceptionAtoB', 'perceptionBtoA', 'summaryEs']:
    print(k, ':', str(d.get(k))[:230])
print('LEADERS', [(l['country'], l['role'], l['name']) for l in d['leaders']])
s = d['stability']
print('VOTE agreement', s['agreement'], 'structural', s['structuralAgreement'], 'HELD', s['heldByHysteresis'])
for r in s['runs']: print('   ', r['model'], '->', r['overall'], '/', r['structural'])
print('TREND (rules)', d.get('trendBasis'))
print('COHERENCE', d.get('coherence'))
q = d['quality']
print('QUALITY', {k: q[k] for k in ['evidenceCollected', 'evidenceRelevant', 'independentDomains', 'govFacts12m', 'govFactsRecent', 'factsKept', 'contextOnly', 'supportRatio', 'coverage', 'loops']})
print('FIXES per run', q['fixes'])
print('STILL MISSING', [m['event'][:80] for m in q.get('stillMissing', [])][:4])
print('CONTEXT-ONLY (not used for status):')
for f in d['contextFacts'][:8]:
    print('   ~', f.get('eventDate'), f.get('bucket'), f.get('actorKind'), f['fact'][:100])
print('GOVERNMENT FACTS:')
for f in d['facts']:
    flags = ''.join(['A' if f.get('actorCorrected') else '', 'D' if f.get('dateCorrected') else '', 'T' if f.get('typeCorrected') else '', '1' if f.get('uncorroborated') else '', 'R' if f.get('typeRule') else '', 'P' if f.get('dateRecovered') else ''])
    print(' -', f.get('eventDate'), f['bucket'][:6], f['actor'], f['type'][:4], f.get('polarity'), flags, f['fact'][:105], [s['domain'] for s in f['sources']][:2])
for i in d.get('initiatives', [])[:5]:
    print(' *', i.get('leaderCountry'), i.get('status'), (i.get('initiative') or '')[:100])
m = d['metrics']
print('METRICS', m['totalSeconds'], 's', m['tokensIn'], '/', m['tokensOut'], 'tokens; calls', len(m['calls']), 'fallbacks', sum(c['fallbacks'] for c in m['calls']),
      '; blocked', m['collect'].get('blocked'), '; errors', m['collect'].get('errors'))
