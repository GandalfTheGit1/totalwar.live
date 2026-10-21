"""Offline tests of the embassy state (no network).  Run:  cd engine/relations/model && python3 -I test_embassy.py"""
import os, sys, unittest
from datetime import date
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import embassy as E
import structure as T


def fact(day, code, actor, text='', kind='IMPLEMENTED', **kw):
    return dict(eventDate=day, code=code, actor=actor, type=kind, fact=text, **kw)


RECALL_SA = fact('2018-08-05', 'AMBASSADOR_RECALL', 'SA', 'Saudi Arabia recalled its ambassador to Canada')
EXPEL_CA = fact('2018-08-05', 'EXPULSION', 'SA', "Saudi Arabia expelled Canada's ambassador Dennis Horak")


def row(host, holder, start, sp, end=None, ep=None):
    r = {'r': {'value': f'http://www.wikidata.org/entity/{host}'}, 'hLabel': {'value': holder}}
    if start:
        r.update(start={'value': start}, sp={'value': str(sp)})
    if end:
        r.update(end={'value': end}, ep={'value': str(ep)})
    return r


class Tenures(unittest.TestCase):
    def test_precision_rounding_and_host_filter(self):
        rows = [row('Q851', 'A', '2019-01-01T00:00:00Z', 9, '2021-05-01T00:00:00Z', 10), row('Q851', 'B', '2021-06-20T00:00:00Z', 11),
                row('Q851', 'no start', None, None), row('Q30', 'other host', '2020-01-01T00:00:00Z', 11)]
        t = E.tenures_from_rows(rows, 'Q851')
        self.assertEqual([x['holder'] for x in t], ['A', 'B'])
        self.assertEqual(t[0]['start'], '2019-12-31')           # year precision: certain only from the end of that year
        self.assertEqual(t[0]['end'], '2021-05-01')             # month precision: certain only until the start of that month
        self.assertEqual(t[1]['start'], '2021-06-20')
        self.assertIsNone(t[1]['end'])


class SideStatus(unittest.TestCase):
    def test_absence_has_no_time_limit(self):
        st = E.side_status('SA', 'CA', [RECALL_SA], [], date(2022, 6, 1))     # 46 months later: the old 36-month cut would have dropped it
        self.assertEqual((st['status'], st['since']), ('ABSENT', '2018-08'))

    def test_expulsion_by_host_makes_the_sender_absent(self):
        self.assertEqual(E.side_status('CA', 'SA', [EXPEL_CA], [], date(2020, 1, 1))['status'], 'ABSENT')
        self.assertEqual(E.side_status('SA', 'CA', [EXPEL_CA], [], date(2020, 1, 1))['status'], 'UNKNOWN')

    def test_expulsion_of_ordinary_diplomats_does_not_count(self):
        f = fact('2018-08-05', 'EXPULSION', 'SA', 'Saudi Arabia expelled two Canadian diplomats')
        self.assertEqual(E.side_status('CA', 'SA', [f], [], date(2019, 1, 1))['status'], 'UNKNOWN')

    def test_declared_recall_is_ignored(self):
        f = fact('2018-08-05', 'AMBASSADOR_RECALL', 'SA', 'Saudi Arabia threatened to recall its ambassador', kind='DECLARED')
        self.assertEqual(E.side_status('SA', 'CA', [f], [], date(2019, 1, 1))['status'], 'UNKNOWN')

    def test_restoration_event(self):
        facts = [RECALL_SA, fact('2023-05-24', 'NORMALIZATION', 'joint', 'Canada and Saudi Arabia restored diplomatic ties')]
        self.assertEqual(E.side_status('SA', 'CA', facts, [], date(2023, 5, 1))['status'], 'ABSENT')
        st = E.side_status('SA', 'CA', facts, [], date(2023, 6, 1))
        self.assertEqual((st['status'], st['since'], st['source']), ('PRESENT', '2023-05', 'event'))

    def test_web_verified_restoration_is_marked_web(self):
        facts = [RECALL_SA, fact('2023-05-24', 'AMBASSADOR_RESTORED', 'joint', 'Head of mission restored (web-verified)', verified='https://example.org')]
        self.assertEqual(E.side_status('SA', 'CA', facts, [], date(2024, 1, 1))['source'], 'web')

    def test_wikidata_holder_after_the_absence_restores(self):
        ten = E.tenures_from_rows([row('Q16', 'New envoy', '2023-01-01T00:00:00Z', 9)], 'Q16')     # year precision -> 2023-12-31
        self.assertEqual(E.side_status('SA', 'CA', [RECALL_SA], ten, date(2023, 6, 1))['status'], 'ABSENT')
        st = E.side_status('SA', 'CA', [RECALL_SA], ten, date(2024, 1, 15))
        self.assertEqual((st['status'], st['source'], st['holder']), ('PRESENT', 'wikidata', 'New envoy'))

    def test_tenure_before_the_absence_does_not_restore(self):
        ten = E.tenures_from_rows([row('Q16', 'Old envoy', '2016-03-01T00:00:00Z', 11)], 'Q16')
        self.assertEqual(E.side_status('SA', 'CA', [RECALL_SA], ten, date(2019, 1, 1))['status'], 'ABSENT')

    def test_certain_tenure_without_events_is_present_open_tenure_expires(self):
        ten = E.tenures_from_rows([row('Q16', 'Envoy', '2015-03-01T00:00:00Z', 11)], 'Q16')
        self.assertEqual(E.side_status('SA', 'CA', [], ten, date(2019, 1, 1))['status'], 'PRESENT')
        self.assertEqual(E.side_status('SA', 'CA', [], ten, date(2022, 1, 1))['status'], 'UNKNOWN')     # > 6 years without an end date

    def test_ended_tenure_and_no_data_are_unknown_not_absent(self):
        ten = E.tenures_from_rows([row('Q16', 'Envoy', '2015-03-01T00:00:00Z', 11, '2017-03-01T00:00:00Z', 11)], 'Q16')
        self.assertEqual(E.side_status('SA', 'CA', [], ten, date(2018, 1, 1))['status'], 'UNKNOWN')
        self.assertEqual(E.side_status('SA', 'CA', [], [], date(2018, 1, 1))['status'], 'UNKNOWN')

    def test_second_withdrawal_after_a_restoration(self):
        facts = [RECALL_SA, fact('2020-01-10', 'AMBASSADOR_RESTORED', 'joint', 'ambassadors returned'),
                 fact('2021-03-01', 'AMBASSADOR_RECALL', 'SA', 'Saudi Arabia recalled its ambassador again')]
        self.assertEqual(E.side_status('SA', 'CA', facts, [], date(2020, 6, 1))['status'], 'PRESENT')
        self.assertEqual(E.side_status('SA', 'CA', facts, [], date(2021, 6, 1))['since'], '2021-03')


class DeriveStates(unittest.TestCase):
    def test_states_and_report(self):
        heads = [dict(code='EMBASSY_HEADS', tenures={'CA': [], 'SA': []})]
        out = T.derive_states('CA', 'SA', [RECALL_SA, EXPEL_CA], heads, date(2022, 6, 1))
        amb = next(s for s in out if s['code'] == 'AMBASSADOR_ABSENT')
        self.assertEqual((amb['sides'], amb['sideDates']), (2, {'CA': '2018-08', 'SA': '2018-08'}))
        rep = next(s for s in out if s['code'] == 'EMBASSY_STATUS')
        self.assertEqual({k: v['status'] for k, v in rep['sides'].items()}, {'CA': 'ABSENT', 'SA': 'ABSENT'})

    def test_severed_relations_replace_ambassador_absent(self):
        sev = fact('2018-08-06', 'RELATIONS_SEVERED', 'SA', 'Saudi Arabia severed relations')
        out = T.derive_states('CA', 'SA', [RECALL_SA, sev], [], date(2019, 1, 1))
        codes = {s['code'] for s in out}
        self.assertNotIn('AMBASSADOR_ABSENT', codes)
        self.assertIn('NO_RELATIONS', codes)
        self.assertIn('EMBASSY_STATUS', codes)

    def test_report_state_is_not_scored(self):
        self.assertIsNone(T.S.state_contribution(dict(code='EMBASSY_STATUS'), date(2020, 1, 1)))
        self.assertIsNone(T.S.state_contribution(dict(code='EMBASSY_HEADS'), date(2020, 1, 1)))


if __name__ == '__main__':
    unittest.main(verbosity=1)
