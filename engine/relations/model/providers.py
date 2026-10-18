"""Minimal multi-provider LLM + search client for the diplomacy agentic-flow prototype.
Keys are read from v0-equity's .env.local and never printed."""
import sys, json, os, time, urllib.request, urllib.error, random, ssl, hashlib

SSL_CTX = ssl.create_default_context(cafile='/etc/ssl/cert.pem')

ENV_PATH = os.path.expanduser(os.environ.get('WGE_ENV_PATH', '~/Desktop/v0-equity-analysis-with-buffett/.env.local'))


def load_env():
    env = {}
    with open(ENV_PATH) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


ENV = load_env()


def keys(prefix):
    return [v for k, v in sorted(ENV.items()) if (k == prefix or k.startswith(prefix)) and v]


# ─── Quota registry (ported from v0-equity lib/llm-rotation/quota-tracker.ts) ─────────────────────
# Per provider:model:key. Shared across processes through a JSON file, because every pair runs in its own process.
#   daily-exhausted -> parked until the next UTC day (v0: "RPD", 401/402/403/404 "unusable")
#   per-minute 429  -> parked for RPM_COOLDOWN_S              (v0: "RPM", RATE_LIMIT_COOLDOWN_MS = 90s)
STATE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'quota_state.json')
RPM_COOLDOWN_S = 90
OVERLOAD_COOLDOWN_S = 30


def _today():
    return time.strftime('%Y-%m-%d', time.gmtime())


def _kid(provider, model, key):
    return f'{provider}:{model}:{hashlib.sha1(key.encode()).hexdigest()[:8]}'


def _load():
    try:
        with open(STATE_PATH) as f:
            return json.load(f)
    except Exception:
        return {}


def _save(st):
    tmp = f'{STATE_PATH}.{os.getpid()}.tmp'
    with open(tmp, 'w') as f:
        json.dump(st, f)
    os.replace(tmp, STATE_PATH)


def classify(status, body=''):
    """-> 'day' | 'minute' | 'overload' | 'ignore'   (same split as v0 classifyRateLimit, plus provider-specific codes)"""
    m = (body or '').lower()
    if status in (401, 402, 403, 404, 432, 433):
        return 'day'
    if status == 429:
        if ('perday' in m or 'per day' in m or 'per_day' in m or 'daily' in m) and 'minute' not in m:
            return 'day'
        return 'minute'
    if status in (500, 502, 503, 504):
        return 'overload'
    return 'ignore'     # 400/413: the request is the problem, not the key


def parked(st, provider, model, key):
    e = st.get(_kid(provider, model, key))
    if not e:
        return False
    if e.get('dayParked') == _today():
        return True
    return e.get('until', 0) > time.time()


def record_failure(provider, model, key, status, body=''):
    kind = classify(status, body)
    if kind == 'ignore':
        return kind
    st = _load()
    e = st.setdefault(_kid(provider, model, key), {})
    if kind == 'day':
        e['dayParked'] = _today()
    else:
        e['until'] = time.time() + (RPM_COOLDOWN_S if kind == 'minute' else OVERLOAD_COOLDOWN_S)
    e['lastStatus'] = status
    _save(st)
    return kind


def record_success(provider, model, key):
    st = _load()
    e = st.setdefault(_kid(provider, model, key), {})
    if e.get('day') != _today():
        e['day'], e['count'] = _today(), 0
    e['count'] = e.get('count', 0) + 1
    e.pop('until', None)
    _save(st)


def order_keys(provider, model, ks):
    """Least-used-today first (v0 uses plain round-robin); parked slots are filtered by the caller."""
    st = _load()
    used = lambda k: (st.get(_kid(provider, model, k), {}).get('count', 0) if st.get(_kid(provider, model, k), {}).get('day') == _today() else 0)
    random.shuffle(ks)
    return sorted(ks, key=used)


def _body(e):
    try:
        return e.read().decode('utf-8', 'replace')[:600]
    except Exception:
        return ''


def _post(url, payload, headers, timeout=120):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json', 'User-Agent': 'diplomacy-flow-prototype/0.1', **headers})
    with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as r:
        return json.loads(r.read())


def _openai_style(url, key, model, system, user, max_tokens, temperature, json_mode):
    p = {'model': model, 'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': user}],
         'max_tokens': max_tokens, 'temperature': temperature}
    if json_mode:
        p['response_format'] = {'type': 'json_object'}
    d = _post(url, p, {'Authorization': f'Bearer {key}'})
    u = d.get('usage', {})
    content = d['choices'][0]['message'].get('content')
    if not content:
        raise RuntimeError('empty content (reasoning-only response)')
    return content, u.get('prompt_tokens', 0), u.get('completion_tokens', 0)


PROVIDERS = {
    'mistral': dict(url='https://api.mistral.ai/v1/chat/completions', keys='MISTRAL_API_KEY', model='mistral-medium-latest'),
    'groq': dict(url='https://api.groq.com/openai/v1/chat/completions', keys='GROQ_API_KEY', model='openai/gpt-oss-120b'),
    'cerebras': dict(url='https://api.cerebras.ai/v1/chat/completions', keys='CEREBRAS_API_KEY', model='gpt-oss-120b'),
    'openrouter': dict(url='https://openrouter.ai/api/v1/chat/completions', keys='OPENROUTER_API_KEY', model='nvidia/nemotron-3-super-120b-a12b:free'),
}


def call(provider, system, user, max_tokens=2000, temperature=0.1, json_mode=True, model=None):
    """Returns (text, prompt_tokens, completion_tokens, seconds). Skips parked key/model slots; raises '... exhausted' when none is usable."""
    t0 = time.time()
    last, tried, skipped = None, 0, 0
    if provider == 'gemini':
        models = [model] if model else []
        models += [m for m in ('gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite') if m not in models]
        for m in models:
            for k in order_keys('gemini', m, keys('GEMINI_API_KEY')):
                if parked(_load(), 'gemini', m, k):
                    skipped += 1
                    continue
                tried += 1
                url = f'https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={k}'
                p = {'systemInstruction': {'parts': [{'text': system}]}, 'contents': [{'role': 'user', 'parts': [{'text': user}]}],
                     'generationConfig': {'temperature': temperature, 'maxOutputTokens': max_tokens + 2048,
                                          **({'thinkingConfig': {'thinkingBudget': 1024}} if '2.5' in m else {}),
                                          **({'responseMimeType': 'application/json'} if json_mode else {})}}
                try:
                    d = _post(url, p, {})
                    txt = ''.join(pt.get('text', '') for pt in d['candidates'][0]['content']['parts'])
                    u = d.get('usageMetadata', {})
                    record_success('gemini', m, k)
                    return txt, u.get('promptTokenCount', 0), u.get('candidatesTokenCount', 0), time.time() - t0
                except urllib.error.HTTPError as e:
                    body = _body(e)
                    kind = record_failure('gemini', m, k, e.code, body)
                    last = f'{m} HTTP {e.code} ({kind})'
                    if kind == 'ignore':
                        raise RuntimeError(f'gemini failed: {last}: {body[:150]!r}')
        raise RuntimeError(f'gemini exhausted: tried {tried}, parked {skipped}; last {last}')
    if provider == 'cohere':
        m = model or 'command-a-03-2025'
        for k in order_keys('cohere', m, keys('COHERE_API_KEY')):
            if parked(_load(), 'cohere', m, k):
                skipped += 1
                continue
            tried += 1
            p = {'model': m, 'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': user}], 'temperature': temperature, 'max_tokens': max_tokens}
            if json_mode:
                p['response_format'] = {'type': 'json_object'}
            try:
                d = _post('https://api.cohere.com/v2/chat', p, {'Authorization': f'Bearer {k}'})
                txt = ''.join(c.get('text', '') for c in d.get('message', {}).get('content', []) if c.get('type') == 'text')
                if not txt:
                    raise RuntimeError('empty content')
                u = d.get('usage', {}).get('tokens', {})
                record_success('cohere', m, k)
                return txt, int(u.get('input_tokens', 0)), int(u.get('output_tokens', 0)), time.time() - t0
            except urllib.error.HTTPError as e:
                body = _body(e)
                kind = record_failure('cohere', m, k, e.code, body)
                last = f'HTTP {e.code} ({kind}): {body[:120]!r}'
                if kind == 'ignore':
                    raise RuntimeError(f'cohere failed: {last}')
        raise RuntimeError(f'cohere exhausted: tried {tried}, parked {skipped}; last {last}')
    cfg = PROVIDERS[provider]
    m = model or cfg['model']
    for k in order_keys(provider, m, keys(cfg['keys'])):
        if parked(_load(), provider, m, k):
            skipped += 1
            continue
        tried += 1
        try:
            txt, pi, po = _openai_style(cfg['url'], k, m, system, user, max_tokens, temperature, json_mode)
            record_success(provider, m, k)
            return txt, pi, po, time.time() - t0
        except urllib.error.HTTPError as e:
            body = _body(e)
            kind = record_failure(provider, m, k, e.code, body)
            last = f'HTTP {e.code} ({kind}): {body[:120]!r}'
            if kind == 'ignore':
                raise RuntimeError(f'{provider} failed: {last}')
    raise RuntimeError(f'{provider} exhausted: tried {tried}, parked {skipped}; last {last}')


def tavily(query, days=60, max_results=6, topic='news'):
    last, tried = None, 0
    for k in order_keys('tavily', 'search', keys('TAVILY_API_KEY')):
        if parked(_load(), 'tavily', 'search', k):
            continue
        tried += 1
        try:
            r = _post('https://api.tavily.com/search', {
                'api_key': k, 'query': query, 'topic': topic, **({'days': days} if topic == 'news' else {}), 'max_results': max_results,
                'search_depth': 'advanced', 'include_raw_content': False, 'include_answer': False}, {})
            record_success('tavily', 'search', k)
            return r
        except urllib.error.HTTPError as e:
            kind = record_failure('tavily', 'search', k, e.code, _body(e))
            last = f'HTTP {e.code} ({kind})'
            if kind == 'ignore':
                break
    raise RuntimeError(f'tavily exhausted: tried {tried}; last {last}')


def cooldown_remaining(provider, model=None):
    """Seconds until at least one key of provider/model is usable again; 0 if one is usable now; None if every slot is parked for the day (or no keys)."""
    prefix = {'gemini': 'GEMINI_API_KEY', 'cohere': 'COHERE_API_KEY'}.get(provider) or PROVIDERS[provider]['keys']
    ks = keys(prefix)
    m = model or (PROVIDERS.get(provider, {}).get('model') if provider in PROVIDERS else 'command-a-03-2025' if provider == 'cohere' else 'gemini-2.5-flash')
    st, now, best = _load(), time.time(), None
    for k in ks:
        e = st.get(_kid(provider, m, k), {})
        if e.get('dayParked') == _today():
            continue
        wait = max(0.0, e.get('until', 0) - now)
        best = wait if best is None else min(best, wait)
    return best


def status():
    """Human-readable view of the registry (keys shown only as 8-char hashes)."""
    st, today, now = _load(), _today(), time.time()
    rows = []
    for kid, e in sorted(st.items()):
        state = 'PARKED today' if e.get('dayParked') == today else f'cooldown {int(e["until"] - now)}s' if e.get('until', 0) > now else 'ok'
        rows.append(f'{kid:48s} used today: {e.get("count", 0) if e.get("day") == today else 0:3d}  {state}')
    return '\n'.join(rows) or '(empty)'


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'status':
        print(status()); raise SystemExit
    print('keys available:', {p: len(keys(c['keys'])) for p, c in PROVIDERS.items()}, 'gemini', len(keys('GEMINI_API_KEY')), 'tavily', len(keys('TAVILY_API_KEY')))
    for p in ['mistral', 'gemini', 'groq', 'cerebras', 'openrouter']:
        try:
            txt, pi, po, s = call(p, 'Reply with JSON only.', 'Return {"ok": true, "model_self_name": "<your name>"}', max_tokens=60)
            print(f'{p:11s} OK  {s:5.1f}s  in={pi} out={po}  {txt.strip()[:80]}')
        except Exception as e:
            print(f'{p:11s} FAIL {str(e)[:160]}')
    try:
        r = tavily('España Marruecos Ceuta', days=30, max_results=2)
        print('tavily      OK ', [(x.get('published_date'), x['url'][:60]) for x in r.get('results', [])])
    except Exception as e:
        print('tavily      FAIL', e)
