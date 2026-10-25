"""Offline tests of the press-pulse arithmetic (no data files). Run: cd engine/relations/world && python3 -I test_pulse.py"""
import os, sys, unittest
from datetime import date, timedelta
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import protocol_gdelt as P
import pulse as PU

T = date(2026, 1, 1)


def days(spec):
    """spec: {age_in_days: (gpos, gneg, w)} for the pair AA-BB; every age listed is one available day."""
    return {T - timedelta(days=a): {'AA-BB': [1, w, 0, 0, 0, 0, gp, gn, 0]} for a, (gp, gn, w) in spec.items()}


class Pulse(unittest.TestCase):
    def test_warm_baseline_then_conflict_is_negative(self):
        d = days({**{a: (3.0, 0.5, 5.0) for a in range(0, 60, 5)}.__class__({a: (0.5, 3.0, 5.0) for a in range(0, 60, 5)}), **{a: (3.0, 0.5, 5.0) for a in range(150, 400, 10)}})
        r = PU.pulse_at(d, 'AA-BB', T)
        self.assertEqual(r['status'], 'pulse')
        self.assertLess(r['DELTA'], -0.5)
        self.assertLess(r['P_change'], 0)
        self.assertGreaterEqual(r['P_change'], -P.PCAP)

    def test_no_pulse_below_volume_floor(self):
        d = days({**{a: (0.01, 0.0, 0.01) for a in range(0, 60, 5)}, **{a: (1.0, 0.0, 1.0) for a in range(150, 400, 10)}})
        r = PU.pulse_at(d, 'AA-BB', T)
        self.assertEqual((r['status'], r['P_change']), ('no pulse', 0.0))

    def test_short_baseline_gives_no_pulse(self):
        d = days({**{a: (1.0, 3.0, 5.0) for a in range(0, 60, 5)}, **{a: (3.0, 0.5, 5.0) for a in (200, 220, 240)}})
        self.assertEqual(PU.pulse_at(d, 'AA-BB', T)['why'], 'baseline too short')

    def test_half_life_of_recent_weights(self):
        rec = lambda age: PU._window(days({age: (4.0, 0.0, 4.0), 0: (0.0, 0.0, 0.0)}), 'AA-BB', T, -1, P.RECENT_MAX_AGE, True)
        # the same day counted at age 45 weighs half of the age-0 day: mean Gpos = 4 * 0.5 / (1 + 0.5)
        self.assertAlmostEqual(rec(45)[0], 4.0 * 0.5 / 1.5, places=6)

    def test_cap_and_low_volume_prior(self):
        d = days({**{a: (0.0, 40.0, 40.0) for a in range(0, 60, 5)}, **{a: (40.0, 0.0, 40.0) for a in range(150, 400, 10)}})
        r = PU.pulse_at(d, 'AA-BB', T)
        self.assertEqual(r['P_change'], -P.PCAP)                       # DELTA about -2 x 15 = -30, capped
        d = days({**{a: (0.0, 40.0, 40.0) for a in range(0, 60, 5)}, **{a: (0.0, 0.0, 0.0) for a in range(150, 400, 10)}})
        self.assertEqual(PU.pulse_at(d, 'AA-BB', T, b0=0.2)['B_base'], 0.2)   # empty baseline falls back to the global prior


if __name__ == '__main__':
    unittest.main(verbosity=1)
