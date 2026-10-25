#!/usr/bin/env python3
"""Unit tests for territorial claims registry and engine integration.
Tests offline without network requirements.
"""
import json
import os
import sys
import unittest
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import scoring as S
import structure as T

CLAIMS_FILE = os.path.join(HERE, 'territorial_claims.json')
COUNTRIES_FILE = os.path.join(HERE, '..', 'world', 'countries.json')


class TestClaimsRegistrySchema(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(CLAIMS_FILE, 'r', encoding='utf-8') as f:
            cls.data = json.load(f)
        with open(COUNTRIES_FILE, 'r', encoding='utf-8') as f:
            countries_raw = json.load(f)
            cls.country_codes = {c['code'] for c in countries_raw}

    def test_top_level_keys(self):
        self.assertIn('claims', self.data)
        self.assertIn('excluded', self.data)
        self.assertIsInstance(self.data['claims'], list)
        self.assertIsInstance(self.data['excluded'], list)
        self.assertGreater(len(self.data['claims']), 30)

    def test_claim_structure(self):
        valid_statuses = {'latent', 'active', 'militarized', 'occupied', 'frozen', 'resolved'}
        valid_saliences = {'core', 'major', 'minor'}
        valid_kinds = {'land', 'island', 'maritime', 'breakaway', 'whole_state', 'lease', 'occupied'}

        seen_ids = set()
        for c in self.data['claims']:
            cid = c.get('id')
            self.assertIsNotNone(cid, f"Claim missing id: {c}")
            self.assertNotIn(cid, seen_ids, f"Duplicate claim id: {cid}")
            seen_ids.add(cid)

            self.assertIn(c.get('status'), valid_statuses, f"Invalid status in {cid}: {c.get('status')}")
            self.assertIn(c.get('salience'), valid_saliences, f"Invalid salience in {cid}: {c.get('salience')}")
            self.assertIn(c.get('kind'), valid_kinds, f"Invalid kind in {cid}: {c.get('kind')}")

            # Administered by
            admin = c.get('administeredBy')
            self.assertTrue(admin, f"Missing administeredBy in {cid}")
            admin_code = admin if isinstance(admin, str) else admin.get('entity')
            if isinstance(admin, str):
                self.assertIn(admin_code, self.country_codes, f"admin code {admin_code} not in countries.json")

            # Claimants
            claimants = c.get('claimants')
            self.assertIsInstance(claimants, list, f"claimants must be list in {cid}")
            self.assertGreater(len(claimants), 0, f"claimants empty in {cid}")
            for cl in claimants:
                cl_code = cl if isinstance(cl, str) else cl.get('entity')
                if isinstance(cl, str):
                    self.assertIn(cl_code, self.country_codes, f"claimant {cl_code} not in countries.json")
                # No claimant can equal administrator
                self.assertNotEqual(admin_code, cl_code, f"claimant cannot equal administrator in {cid}: {cl_code}")

            # Sources and dates
            sources = c.get('sources')
            self.assertIsInstance(sources, list, f"sources must be list in {cid}")
            self.assertGreater(len(sources), 0, f"sources empty in {cid}")
            for s in sources:
                self.assertIn('url', s, f"source missing url in {cid}")
                self.assertIn('accessed', s, f"source missing accessed in {cid}")

            # Third party stances
            for tp in c.get('thirdParty', []):
                self.assertIn('country', tp, f"thirdParty missing country in {cid}")
                self.assertIn(tp['country'], self.country_codes, f"thirdParty country {tp['country']} not in countries.json")
                self.assertIn(tp.get('stance'), {'supports_claimant', 'supports_administrator'}, f"invalid stance in {cid}")
                self.assertIn('source', tp, f"thirdParty missing source in {cid}")


class TestClaimsEngineScoring(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure offline execution by stubbing external network methods
        T.diplomacy = lambda a, b: (True, 1, {a: 'open', b: 'open'})
        T.trade_pair = lambda a, b: ({}, {})
        T.treaties = lambda a, b: []
        T.heads_in = lambda a, b: []
        T.shared_languages = lambda a, b: []
        T.human_ties = lambda a, b: (None, {})
        T.claims = lambda a, b: {}
        T.get = lambda *args, **kwargs: '{"results": {"bindings": []}}'
        T.memberships = lambda c: {'NATO'} if c in ('GR', 'TR', 'DE', 'FR', 'ES', 'PT', 'US') else set()
        T.bloc_since = lambda blk, a, b: '1952-02-18'
        T.load_claims_registry()

    def test_state_mapping_and_salience_scale(self):
        # ES-PT: Olivenza (latent, minor)
        states, log = T.build_states('ES', 'PT')
        dispute_states = [s for s in states if s['code'] in ('TERRITORIAL_DISPUTE_LOW', 'TERRITORIAL_DISPUTE_ACTIVE', 'TERRITORIAL_DISPUTE_MILITARIZED', 'OCCUPATION')]
        self.assertEqual(len(dispute_states), 1)
        s = dispute_states[0]
        self.assertEqual(s['code'], 'TERRITORIAL_DISPUTE_LOW')
        self.assertEqual(s['scale'], 0.35)
        # Check scoring point contribution <= 4.0
        sc = S.score([], states, date(2026, 10, 21))
        sc_dispute = [cs for cs in sc['states'] if cs['code'] == 'TERRITORIAL_DISPUTE_LOW']
        self.assertEqual(len(sc_dispute), 1)
        self.assertLessEqual(abs(sc_dispute[0]['value']), 4.0)

    def test_active_and_militarized_disputes(self):
        # BZ-GT: Belize-Guatemala (active, core: Guatemala claims half of Belize)
        states, _ = T.build_states('BZ', 'GT')
        active = [s for s in states if s['code'] == 'TERRITORIAL_DISPUTE_ACTIVE']
        self.assertEqual(len(active), 1)
        self.assertEqual(active[0]['scale'], 1.0)

        # GR-TR: Aegean dispute (active, major)
        states_gr, _ = T.build_states('GR', 'TR')
        aegean = [s for s in states_gr if s['code'] == 'TERRITORIAL_DISPUTE_ACTIVE']
        self.assertEqual(len(aegean), 1)
        self.assertEqual(aegean[0]['scale'], 0.75)

        # AF-PK: Durand Line (militarized, core)
        states_af, _ = T.build_states('AF', 'PK')
        militarized = [s for s in states_af if s['code'] == 'TERRITORIAL_DISPUTE_MILITARIZED']
        self.assertEqual(len(militarized), 1)
        self.assertEqual(militarized[0]['scale'], 1.0)

    def test_third_party_stance(self):
        # US stance on Western Sahara: supports Morocco (administrator)
        states, _ = T.build_states('MA', 'US')
        stance = [s for s in states if s['code'] == 'CLAIM_STANCE_SUPPORT']
        self.assertEqual(len(stance), 1)
        self.assertEqual(stance[0]['claim_id'], 'western-sahara')
        # Check scoring
        sc = S.score([], states, date(2026, 10, 21))
        sc_stance = [cs for cs in sc['states'] if cs['code'] == 'CLAIM_STANCE_SUPPORT']
        self.assertEqual(len(sc_stance), 1)
        self.assertEqual(sc_stance[0]['value'], 10.0)

    def test_intra_alliance_dispute_discount(self):
        # GR-TR: NATO allies with active Aegean dispute
        states, _ = T.build_states('GR', 'TR')
        alliance = [s for s in states if s['code'] == 'DEFENSE_ALLIANCE']
        self.assertEqual(len(alliance), 1)
        self.assertEqual(alliance[0]['scale'], 0.5)

        # Non-disputed allies (e.g. DE-FR) retain full alliance scale 1.0
        states_de_fr, _ = T.build_states('DE', 'FR')
        alliance_de_fr = [s for s in states_de_fr if s['code'] == 'DEFENSE_ALLIANCE']
        self.assertEqual(len(alliance_de_fr), 1)
        self.assertEqual(alliance_de_fr[0].get('scale', 1.0), 1.0)

    def test_co_claimants_weight_reduction(self):
        # Between co-claimants in Spratly Islands (e.g. PH-VN)
        states, _ = T.build_states('PH', 'VN')
        disputes = [s for s in states if 'DISPUTE' in s['code']]
        self.assertTrue(len(disputes) > 0)
        # Co-claimants scale should have 0.4 factor applied
        for d in disputes:
            if d.get('claim_id') == 'spratly-islands':
                self.assertLessEqual(d['scale'], 0.4)

    def test_unreviewed_wikidata_fallback(self):
        # Unreviewed claims fallback without silent drops
        reg = T.load_claims_registry()
        self.assertIsNotNone(reg)
        # Verify save_unreviewed_claims does not throw
        tmp_unreviewed = os.path.join(HERE, 'test_unreviewed.json')
        try:
            T.save_unreviewed_claims(tmp_unreviewed)
            self.assertTrue(os.path.exists(tmp_unreviewed))
        finally:
            if os.path.exists(tmp_unreviewed):
                os.remove(tmp_unreviewed)


if __name__ == '__main__':
    unittest.main()
