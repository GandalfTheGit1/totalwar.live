import sys, ssl, json, urllib.request, urllib.parse
ctx = ssl.create_default_context(cafile='/etc/ssl/cert.pem')
def fetch(title):
    u = 'https://en.wikipedia.org/w/api.php?' + urllib.parse.urlencode(dict(action='query', prop='extracts|revisions', explaintext=1, rvprop='ids', titles=title, format='json', redirects=1))
    r = urllib.request.Request(u, headers={'User-Agent': 'geo-engine-calibration/0.1 (research; contact suxcesagency@gmail.com)'})
    d = json.load(urllib.request.urlopen(r, context=ctx, timeout=30))
    p = next(iter(d['query']['pages'].values())); return p['title'], p['revisions'][0]['revid'], p.get('extract', '')
for t, out in (('China–Norway relations', 'cn_no_relations.txt'),('Norway–China relations','cn_no_relations2.txt'),('Nobel Peace Prize controversy China','x.txt')):
    
    try:
        title, rev, text = fetch(t); open(out, 'w').write(text); print(title, rev, len(text))
    except Exception as e: print(t, 'FAILED', e)
