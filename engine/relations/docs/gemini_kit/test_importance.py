"""Offline tests of importance.py (no data files). Run: cd engine/relations/world && python3 -I test_importance.py"""
import os, sys, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importance as I

POP = {'IN': 1_400_000_000, 'US': 330_000_000, 'ID': 270_000_000, 'AD': 80_000, 'ES': 47_000_000, 'FJ': 900_000}


class Importance(unittest.TestCase):
    def test_reasons(self):
        self.assertEqual(I.reasons('IN-US', [['FULL_DIPLOMATIC', 10]], POP, set()), ['both >= 20M', 'both G20'])
        self.assertEqual(I.reasons('AD-ES', [['TRADE_HIGH', 12]], POP, set()), ['trade high'])
        self.assertEqual(I.reasons('AD-FJ', [], POP, {('AD', 'FJ')}), ['border'])
        self.assertEqual(I.reasons('AD-FJ', [], POP, set()), [])
        self.assertEqual(I.reasons('XX-YY', [], POP, set()), [])           # unknown population counts as 0, never as a reason

    def test_split_and_kind(self):
        self.assertEqual(I.split(45.0, [['FULL_DIPLOMATIC', 10], ['DEFENSE_ALLIANCE', 35]]), (10, 35.0))
        self.assertEqual(I.kind(45.0, [['FULL_DIPLOMATIC', 10], ['DEFENSE_ALLIANCE', 35]], False), 'position')
        self.assertEqual(I.kind(10.0, [['FULL_DIPLOMATIC', 10]], True), 'pending')
        self.assertEqual(I.kind(10.0, [['FULL_DIPLOMATIC', 10]], False), 'connected')
        self.assertEqual(I.kind(0.0, [], False), 'none')
        self.assertEqual(I.kind(0.0, [], True), 'pending')                  # important but nothing recorded at all: still a gap
        self.assertEqual(I.kind(-12.0, [['SANCTIONS_REGIME_TARGETED', -12]], False), 'position')
        self.assertEqual(I.kind(4.9, [['PREFERENTIAL_TRADE', 4.9]], True), 'pending')   # below the 5-point threshold


if __name__ == '__main__':
    unittest.main(verbosity=1)
