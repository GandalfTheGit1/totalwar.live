#!/usr/bin/env python3
"""Unit tests for bilingual (Spanish and English) Wikipedia and treaty integration.
Tests offline and online fallback behavior.
"""
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import classify_score as CS
import flow as F
import structure as ST


class TestWikipediaBilingual(unittest.TestCase):
    def test_flow_user_agent_has_contact(self):
        """User-Agent must satisfy Wikimedia policy with a contact email or domain."""
        ua = F.UA.get('User-Agent', '')
        self.assertIn('contact', ua)

    def test_treaty_keywords_spanish_and_english(self):
        """TREATY_KEYWORDS must match relevant bilateral treaties in both languages."""
        spanish_titles = [
            'Tratado de Amistad y Buena Vecindad',
            'Acuerdo de Cooperación Económica y Comercial',
            'Convenio sobre Promoción y Protección de Inversiones',
            'Acuerdo de Seguridad y Defensa Mutua',
            'Tratado de Extradición',
            'Convenio para Evitar la Doble Imposición',
            'Acuerdo de Asociación Estratégica',
            'Tratado de Paz y Amistad',
        ]
        for t in spanish_titles:
            self.assertIsNotNone(ST.TREATY_KEYWORDS.search(t), f'Failed to match Spanish treaty: {t}')

        english_titles = [
            'Treaty of Friendship and Cooperation',
            'Bilateral Investment Promotion Agreement',
            'Mutual Defense and Security Treaty',
            'Extradition Treaty',
            'Double Taxation Convention',
        ]
        for t in english_titles:
            self.assertIsNotNone(ST.TREATY_KEYWORDS.search(t), f'Failed to match English treaty: {t}')

    def test_filter_treaties_spanish_dedup_and_clean(self):
        """filter_treaties must filter stopwords and deduplicate Spanish treaties."""
        rows = [
            {'tLabel': {'value': 'Tratado de Amistad y Cooperación entre España y Marruecos'}},
            {'tLabel': {'value': 'Convenio de Cooperación entre España y Marruecos'}},
            {'tLabel': {'value': 'Acuerdo de Seguridad entre Francia y España'}},
            {'tLabel': {'value': 'Q98765432'}},
            {'tLabel': {'value': 'Some domestic event with no bilateral keywords'}},
        ]
        res = ST.filter_treaties(rows)
        self.assertIn('Tratado de Amistad y Cooperación entre España y Marruecos', res)
        self.assertIn('Acuerdo de Seguridad entre Francia y España', res)
        self.assertNotIn('Q98765432', res)

    def test_wikipedia_lead_empty_inputs(self):
        """wikipedia_lead handles empty, invalid, and dictionary inputs cleanly."""
        self.assertEqual(CS.wikipedia_lead(''), '')
        self.assertEqual(CS.wikipedia_lead(None), '')
        self.assertEqual(CS.wikipedia_lead({'title': ''}), '')


if __name__ == '__main__':
    unittest.main()
