"""Offline reproduction of the calibration numbers from the cached data in this repo (no network, no LLM calls).
Run:  cd engine/relations/calibration && python3 -I test_reproduce.py
The figures are the ones reported in docs/calibracion.md for the CURRENT model (gold labels, default parameters)."""
import os, sys, unittest
os.environ.setdefault('WGE_OFFLINE', '1')       # use the cached Wikidata/WITS answers whatever their age
sys.path.insert(0, '.')
from mag_env import L, VER, M, S, evaluate2   # registers every episode

EXPECTED = {'ESMA': 0.0, 'INCA': 0.0, 'QASA': 0.0, 'AUCN': 61.8, 'JPKR': 30.0, 'CASA': 47.3}    # CA-SA was 76.2 before the embassy state of round 5


class Reproduce(unittest.TestCase):
    def test_gold_losses(self):
        for key, want in EXPECTED.items():
            loss, _ = evaluate2(key, L.gold_final(key, VER[key]))
            self.assertAlmostEqual(loss, want, delta=0.06, msg=key)

    def test_band_edges(self):
        self.assertEqual(S.band(-130.0), 'HOSTILE')
        self.assertEqual(S.band(-129.9), 'HOSTILE')
        self.assertEqual(S.band(-200), 'CONFLICT')
        self.assertEqual(S.band(100), 'ALLIED')

    def test_r_is_bounded(self):
        fin = L.gold_final('CASA', VER['CASA'])
        for ds in ('2018-09-15', '2019-06-30', '2023-12-31'):
            sb = L.prepare('CASA', M.pair_with_llm(fin, L.F.llm_json, L.PAIR_PROVIDERS, 'CA', 'SA'))
            self.assertTrue(-200 <= L.R_at(fin, sb, ds) <= 200)

    def test_decay_half_life(self):
        self.assertAlmostEqual(S.decay(30, 30), 0.5)
        self.assertAlmostEqual(S.decay(0, 30), 1.0)


if __name__ == '__main__':
    unittest.main(verbosity=2)
