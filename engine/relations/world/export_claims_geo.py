"""Export simplified territorial claims GeoJSON (<= 400 KB) and compact app claims registry.

Inputs:
  - Natural Earth 1:10m disputed areas (cached in world/ne_10m_admin_0_disputed_areas.geojson or fetched)
  - model/territorial_claims.json

Outputs:
  - public/data/territorial-claims/claims.geojson: simplified geometries with 3-decimal coords, TINY features as Points
  - lib/data/territorial-claims/claims.json: stripped of internal notes and sources for lightweight HUD usage
"""
import json
import os
import ssl
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
REGISTRY_FILE = os.path.join(HERE, '..', 'model', 'territorial_claims.json')
RAW_GEO_FILE = os.path.join(HERE, 'ne_10m_admin_0_disputed_areas.geojson')
GEO_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_disputed_areas.geojson'

PUBLIC_GEO_OUT = os.path.join(ROOT, 'public', 'data', 'territorial-claims', 'claims.geojson')
APP_REG_OUT = os.path.join(ROOT, 'lib', 'data', 'territorial-claims', 'claims.json')

BRK_TO_CLAIM = {
    'Jammu and Kashmir': 'kashmir-jammu-ladakh',
    'Aksai Chin': 'aksai-chin',
    'Israel': 'west-bank-east-jerusalem',
    'Gaza': 'west-bank-east-jerusalem',
    'West Bank': 'west-bank-east-jerusalem',
    'Ilemi Triangle': 'ilemi-triangle',
    'Ilemi Triange': 'ilemi-triangle',
    'Arunachal Pradesh': 'arunachal-pradesh',
    'Golan Heights': 'golan-heights',
    'Somaliland': 'somaliland',
    'Lawa Headwaters': 'tigri-area',
    'Courantyne Headwaters': 'tigri-area',
    'W. Sahara': 'western-sahara',
    'Abkhazia': 'abkhazia-south-ossetia',
    'South Ossetia': 'abkhazia-south-ossetia',
    'Kosovo': 'kosovo',
    'Ceuta': 'ceuta-melilla-plazas',
    'Melilla': 'ceuta-melilla-plazas',
    'Peñón de Vélez de la Gomera': 'ceuta-melilla-plazas',
    'Penon de Alhucemas': 'ceuta-melilla-plazas',
    'Islas Chafarinas': 'ceuta-melilla-plazas',
    'West of Essequibo River': 'guayana-esequiba',
    'Shaksam Valley': 'shaksgam-valley',
    'Gilgit-Baltistan': 'kashmir-azad-gilgit',
    'Azad Kashmir': 'kashmir-azad-gilgit',
    'Near Om Parvat': 'kalapani-territory',
    'Olivenza': 'olivenza',
    'Transnistria': 'transnistria',
    'Luhansk People\'s Republic': 'donbas-zaporizhzhia-kherson',
    'Donetsk People\'s Republic': 'donbas-zaporizhzhia-kherson',
    'Gibraltar': 'gibraltar',
    'Abyei': 'abyei',
    'Demchok': 'aksai-chin',
    'Samdu Valleys': 'aksai-chin',
    'Tirpani Valleys': 'aksai-chin',
    'Bara Hotii Valleys': 'aksai-chin',
    'N. Cyprus': 'northern-cyprus',
    'Siachen Glacier': 'kashmir-jammu-ladakh',
    'Belize': 'belize-guatemala',
    'Bhutan (northwest valleys)': 'arunachal-pradesh',
    'Bhutan (Chumbi salient)': 'arunachal-pradesh',
    'Crimea': 'crimea',
    'Shebaa Farms': 'shebaa-farms',
    'Halayib Triangle': 'halaib-triangle',
    '﻿Vukovar Island': 'danube-vukovar',
    '﻿Šarengrad Island': 'danube-vukovar',
    'East Jerusalem': 'west-bank-east-jerusalem',
    'No Man\'s Land (Fort Latrun)': 'west-bank-east-jerusalem',
    'No Man\'s Land (Jerusalem)': 'west-bank-east-jerusalem',
    'Mount Scopus': 'west-bank-east-jerusalem',
    'Junagadh and Manavadar': 'kashmir-jammu-ladakh',
    'North Borneo': 'sabah',
    'Taiwan': 'taiwan',
    'Juan De Nova I.': 'iles-eparses',
    'Mayotte': 'mayotte',
    'Diego Garcia NSF': 'chagos-archipelago',
    'Kuril Is.': 'kuril-islands',
    'Br. Indian Ocean Ter.': 'chagos-archipelago',
    'S. Sandwich Is.': 'south-georgia-sandwich',
    'S. Georgia': 'south-georgia-sandwich',
    'Falkland Is.': 'falkland-islands',
    'Paracel Is.': 'paracel-islands',
    'Europa Island': 'iles-eparses',
    'Swains Island': 'wake-island',
    'Spratly Is.': 'spratly-islands',
    'Wake Atoll': 'wake-island',
    'Korean islands under UN jurisdiction': 'northern-limit-line',
    'Navassa I.': 'navassa-island',
    'Bassas da India': 'iles-eparses',
    'Tromelin I.': 'tromelin-island',
    'Glorioso Is.': 'iles-eparses',
    'Pinnacle Is.': 'senkaku-diaoyu',
    'Abu Musa I.': 'abu-musa-tunbs',
    'Bajo Nuevo Bank (Petrel Is.)': 'serranilla-bajo-nuevo',
    'Serranilla Bank': 'serranilla-bajo-nuevo',
    'Sapodilla Cayes': 'belize-guatemala',
    'Dokdo': 'dokdo-takeshima',
    'Isla del Perejil': 'perejil',
    'Matthew and Hunter Is.': 'wake-island',
    'Scarborough Reef': 'scarborough-shoal',
    'Doumera Island': 'doumeira-islands',
}


def round_coords(coords):
    if not coords:
        return coords
    if isinstance(coords[0], (int, float)):
        return [round(coords[0], 3), round(coords[1], 3)]
    return [round_coords(c) for c in coords]


def ensure_raw_geojson():
    if os.path.exists(RAW_GEO_FILE):
        return json.load(open(RAW_GEO_FILE, encoding='utf-8'))
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(GEO_URL, timeout=30, context=ctx) as r:
        data = r.read()
        with open(RAW_GEO_FILE, 'wb') as f:
            f.write(data)
        return json.loads(data.decode('utf-8'))


def export_geojson(raw):
    features = []
    for f in raw['features']:
        p = f.get('properties', {})
        brk = p.get('BRK_NAME')
        cid = BRK_TO_CLAIM.get(brk)
        if not cid:
            continue
        geom = f.get('geometry', {})
        tiny = p.get('TINY')
        if tiny and tiny != -99 and p.get('LABEL_X') is not None and p.get('LABEL_Y') is not None:
            new_geom = {
                'type': 'Point',
                'coordinates': [round(p['LABEL_X'], 3), round(p['LABEL_Y'], 3)]
            }
        else:
            new_geom = {
                'type': geom.get('type'),
                'coordinates': round_coords(geom.get('coordinates', []))
            }
        features.append({
            'type': 'Feature',
            'properties': {'id': cid},
            'geometry': new_geom
        })

    os.makedirs(os.path.dirname(PUBLIC_GEO_OUT), exist_ok=True)
    fc = {'type': 'FeatureCollection', 'features': features}
    out_bytes = json.dumps(fc, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    with open(PUBLIC_GEO_OUT, 'wb') as f:
        f.write(out_bytes)
    print(f"Exported {len(features)} claim features to {PUBLIC_GEO_OUT} ({round(len(out_bytes) / 1024, 1)} KB, target <= 400 KB)")


FALLBACK_COORDS = {
    'aegean-dispute': (37.5, 25.5),
    'san-andres-maritime': (12.55, -81.7),
    'machias-seal-island': (44.5, -67.1),
    'kangwane': (-26.0, 31.5),
    'durand-line': (33.0, 69.5),
    'preah-vihear': (14.39, 104.68),
    'ieodo-socotra-rock': (32.12, 125.18),
    'lough-foyle-carlingford': (55.15, -6.95),
    'amboyna-cay-natuna': (7.88, 112.92),
    'tho-chu-islands': (9.3, 103.5),
    'banc-du-geyser': (-12.35, 46.43),
    'noktundo-island': (42.38, 130.68)
}


def export_compact_registry(raw=None):
    claim_coords = {}
    if raw:
        for f in raw.get('features', []):
            p = f.get('properties', {})
            cid = BRK_TO_CLAIM.get(p.get('BRK_NAME'))
            if not cid:
                continue
            lx, ly = p.get('LABEL_X'), p.get('LABEL_Y')
            if lx is not None and ly is not None and cid not in claim_coords:
                claim_coords[cid] = (round(ly, 3), round(lx, 3))

    data = json.load(open(REGISTRY_FILE, encoding='utf-8'))
    compact_claims = []
    for c in data.get('claims', []):
        cid = c['id']
        coords = claim_coords.get(cid) or FALLBACK_COORDS.get(cid)
        item = {
            'id': cid,
            'nameEs': c['nameEs'],
            'nameEn': c['nameEn'],
            'kind': c.get('kind', 'land'),
            'administeredBy': c['administeredBy'],
            'claimants': c['claimants'],
            'status': c['status'],
            'salience': c['salience'],
            'since': c.get('since'),
            'statusSince': c.get('statusSince'),
            'resolvedOn': c.get('resolvedOn'),
            'thirdParty': c.get('thirdParty', [])
        }
        if coords:
            item['lat'] = coords[0]
            item['lng'] = coords[1]
        compact_claims.append(item)
    compact_excluded = []
    for e in data.get('excluded', []):
        compact_excluded.append({
            'id': e['id'],
            'name': e.get('name') or e.get('nameEs', ''),
            'reason': e['reason'],
            'pairs': e.get('pairs', [])
        })

    os.makedirs(os.path.dirname(APP_REG_OUT), exist_ok=True)
    out_obj = {
        'claims': compact_claims,
        'excluded': compact_excluded
    }
    out_bytes = json.dumps(out_obj, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    with open(APP_REG_OUT, 'wb') as f:
        f.write(out_bytes)
    print(f"Exported {len(compact_claims)} claims to {APP_REG_OUT} ({round(len(out_bytes) / 1024, 1)} KB)")


def main():
    raw = ensure_raw_geojson()
    export_geojson(raw)
    export_compact_registry(raw)


if __name__ == '__main__':
    main()
