// @vitest-environment happy-dom
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import {
  TECH_TREE_AREAS,
  TECH_TREE_VERSION,
  TECH_TREE_CONFIG,
  getTechAreaDefinition,
  getTechLevelDefinition,
  validateTechEvent,
  validateEventLog,
  stateAt,
  compareCountriesTech,
  parseWikidataTechResponse,
  getTechTreeEvents,
  appendTechTreeEvent,
  revertTechTreeEvent,
  resetTechTreeEventsToSeed,
  getChoroplethByArea,
  isPilotCountryCode,
} from '@/lib/data/tech-tree'
import type { TechTreeEvent } from '@/lib/data/tech-tree/types'
import wikidataFixture from '@/lib/data/tech-tree/fixtures/wikidata-tech-firsts.json'
import labeledNews50 from '@/lib/data/tech-tree/fixtures/labeled-news-50.json'
import { SovereignPowerService } from '@/lib/services/sovereign-power-service'
import {
  detectWireAgency,
  deduplicateNewsSources,
} from '@/lib/services/tech-tree/source-deduplicator'
import {
  classifyTechNewsDeterministic,
  evaluateCandidateNewsGroup,
  capAutoNewsStatus,
} from '@/lib/services/tech-tree/news-classifier'
import {
  buildGdeltTechQueryUrl,
  fetchGdeltThematicArticles,
  syncTechTreeFromGdelt,
} from '@/lib/services/tech-tree/gdelt-tech-ingest'
import {
  recordTechTreeTelemetry,
  getTechTreeTelemetrySummary,
  resetTechTreeTelemetry,
} from '@/lib/services/tech-tree/telemetry'
import { TechInnovationPanel } from '@/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/TechInnovationPanel'
import { TechTreeDevConsole } from '@/components/dev/tech-tree/TechTreeDevConsole'
import { GET as devTechTreeGET, POST as devTechTreePOST } from '@/app/api/dev/tech-tree/route'

describe('Historical Country Tech Tree (arbol-tecnologico-historico)', () => {
  beforeEach(() => {
    resetTechTreeEventsToSeed()
    resetTechTreeTelemetry()
  })

  describe('Step 2 — Versioned Tech Tree Definition (10 areas)', () => {
    it('defines exactly 10 technological areas, excluding Económico / fintech, with contiguous levels 1..N and objective criteria', () => {
      expect(TECH_TREE_AREAS).toHaveLength(10)
      expect(TECH_TREE_VERSION).toBe('1.0.0')

      const areaIds = TECH_TREE_AREAS.map((a) => a.id)
      expect(areaIds).not.toContain('fintech')
      expect(areaIds).not.toContain('economic')

      const seenNodeIds = new Set<string>()
      for (const area of TECH_TREE_AREAS) {
        expect(area.niveles.length).toBeGreaterThanOrEqual(4)
        expect(area.niveles.length).toBeLessThanOrEqual(6)
        area.niveles.forEach((lvl, idx) => {
          expect(lvl.nivel).toBe(idx + 1)
          expect(lvl.criterio.length).toBeGreaterThan(15)
          expect(seenNodeIds.has(lvl.id)).toBe(false)
          seenNodeIds.add(lvl.id)
        })
      }
    })

    it('returns undefined when requesting an unknown area or non-existent level in definition lookup', () => {
      expect(getTechAreaDefinition('fintech_inventado' as never)).toBeUndefined()
      expect(getTechLevelDefinition('semiconductors', 99)).toBeUndefined()
    })
  })

  describe('Step 3 — Append-Only Event Log & stateAt Reconstruction', () => {
    it('validates all seed events without errors and throws descriptive errors on malformed events (non-existent level, missing source, missing label)', () => {
      const events = getTechTreeEvents()
      expect(() => validateEventLog(events)).not.toThrow()

      const badLevelEvent: TechTreeEvent = {
        id: 'bad_level_1',
        pais: 'US',
        area: 'semiconductors',
        nivel: 99,
        estado_nuevo: 'produccion',
        via: 'propio',
        fecha_hecho: '2020-01-01',
        fecha_conocible: '2020-01-02',
        fuentes: [{ nombre: 'DOE Report', url: 'https://www.energy.gov', tipo: 'oficial' }],
        etiqueta: 'Hecho',
        origen: 'historico',
        revertido: false,
        resumen: 'Evento con nivel inexistente',
        version_arbol: TECH_TREE_VERSION,
      }
      expect(() => validateTechEvent(badLevelEvent)).toThrow(/does not have level 99/i)

      const noSourceEvent: TechTreeEvent = {
        ...badLevelEvent,
        id: 'bad_source_1',
        nivel: 1,
        fuentes: [],
      }
      expect(() => validateTechEvent(noSourceEvent)).toThrow(/fuentes/i)

      const noLabelEvent: TechTreeEvent = {
        ...badLevelEvent,
        id: 'bad_label_1',
        nivel: 1,
        etiqueta: '' as never,
      }
      expect(() => validateTechEvent(noLabelEvent)).toThrow(/etiqueta/i)

      expect(() => stateAt('US', 'fecha-invalida', events)).toThrow(/Invalid cutoff date format/i)
    })

    it('reconstructs historical snapshots accurately for US and CN in 2000, 2015, and 2026', () => {
      const events = getTechTreeEvents()

      const us2000 = stateAt('US', 2000, events)
      const us2015 = stateAt('US', 2015, events)
      const us2026 = stateAt('US', 2026, events)

      expect(us2000.areas.semiconductors.maxNivelAlcanzado).toBe(2)
      expect(us2015.areas.semiconductors.nodos.find((n) => n.nivel === 3)?.estado).toBe(
        'no_alcanzado'
      )
      expect(us2026.areas.semiconductors.nodos.find((n) => n.nivel === 3)?.estado).toBe(
        'produccion'
      )
      expect(us2026.areas.semiconductors.nodos.find((n) => n.nivel === 4)?.estado).toBe(
        'prototipo'
      )
      expect(us2026.scoreTecnologico).toBeGreaterThan(us2015.scoreTecnologico)
      expect(us2015.scoreTecnologico).toBeGreaterThan(us2000.scoreTecnologico)

      const cn2000 = stateAt('CN', 2000, events)
      const cn2015 = stateAt('CN', 2015, events)
      const cn2026 = stateAt('CN', 2026, events)

      expect(cn2000.areas.semiconductors.maxNivelAlcanzado).toBe(1)
      expect(cn2015.areas.semiconductors.maxNivelAlcanzado).toBe(2)
      expect(cn2026.areas.semiconductors.maxNivelAlcanzado).toBeGreaterThanOrEqual(3)
      expect(cn2026.scoreTecnologico).toBeGreaterThan(cn2015.scoreTecnologico)
      expect(cn2015.scoreTecnologico).toBeGreaterThan(cn2000.scoreTecnologico)

      // China Level 5 semiconductor node (EUV sovereignty) is blocked by sanctions in 2026
      const cnSemiLvl5 = cn2026.areas.semiconductors.nodos.find((n) => n.nivel === 5)
      expect(cnSemiLvl5?.bloqueado_por_sancion).toBe(true)
      expect(
        cn2026.nodosBloqueadosPorSancion.some(
          (b) => b.areaId === 'semiconductors' && b.nivel === 5
        )
      ).toBe(true)
    })

    it('verifies NL EUV lithography evolution from 2015 (produccion) to 2026 (exportacion)', () => {
      const events = getTechTreeEvents()
      const nl2015 = stateAt('NL', 2015, events)
      const nl2026 = stateAt('NL', 2026, events)

      const nl2015Lvl5 = nl2015.areas.semiconductors.nodos.find((n) => n.nivel === 5)
      const nl2026Lvl5 = nl2026.areas.semiconductors.nodos.find((n) => n.nivel === 5)

      expect(nl2015Lvl5?.estado).toBe('produccion')
      expect(nl2026Lvl5?.estado).toBe('exportacion')
    })

    it('captures technological regression (retroceso) and sanction blocks for Russia after 2022', () => {
      const events = getTechTreeEvents()
      const ru2015 = stateAt('RU', 2015, events)
      const ru2026 = stateAt('RU', 2026, events)

      const ruRobotics2015 = ru2015.areas.robotics_manufacturing.nodos.find((n) => n.nivel === 3)
      const ruRobotics2026 = ru2026.areas.robotics_manufacturing.nodos.find((n) => n.nivel === 3)

      expect(ruRobotics2015?.estado).toBe('produccion')
      expect(ruRobotics2015?.retroceso).toBe(false)

      expect(ruRobotics2026?.estado).toBe('prototipo')
      expect(ruRobotics2026?.retroceso).toBe(true)
      expect(ruRobotics2026?.bloqueado_por_sancion).toBe(true)
      expect(ru2026.nodosEnRetroceso.length).toBeGreaterThanOrEqual(1)
    })

    it('excludes reverted events from stateAt and prevents look-ahead bias when enforceKnowableDate=true', () => {
      const customEvent: TechTreeEvent = {
        id: 'test_lookahead_event',
        pais: 'DE',
        area: 'quantum',
        nivel: 4,
        estado_nuevo: 'prototipo',
        via: 'propio',
        fecha_hecho: '2021-05-01',
        fecha_conocible: '2023-08-01',
        fuentes: [{ nombre: 'Max Planck Report', url: 'https://www.mpg.de', tipo: 'oficial' }],
        etiqueta: 'Hecho',
        origen: 'historico',
        revertido: false,
        resumen: 'Prueba de sesgo de mirada al futuro',
        version_arbol: TECH_TREE_VERSION,
      }
      appendTechTreeEvent(customEvent)

      // Without enforceKnowableDate, event is visible at 2022-01-01
      const deByFactDate = stateAt('DE', '2022-01-01', getTechTreeEvents())
      expect(deByFactDate.areas.quantum.nodos.find((n) => n.nivel === 4)?.estado).toBe('prototipo')

      // With enforceKnowableDate=true, event is NOT visible at 2022-01-01 because fecha_conocible is 2023-08-01
      const deByKnowableDate = stateAt('DE', '2022-01-01', getTechTreeEvents(), {
        enforceKnowableDate: true,
      })
      expect(deByKnowableDate.areas.quantum.nodos.find((n) => n.nivel === 4)?.estado).toBe(
        'no_alcanzado'
      )

      // Reverting the event removes it from stateAt
      revertTechTreeEvent('test_lookahead_event')
      const deAfterRevert = stateAt('DE', '2026-12-31', getTechTreeEvents())
      expect(deAfterRevert.areas.quantum.nodos.find((n) => n.nivel === 4)?.estado).toBe(
        'no_alcanzado'
      )
    })
  })

  describe('Step 4 — Real Wikidata SPARQL Fixture & Parser Validation', () => {
    it('parses the real bundled Wikidata fixture for the 7 pilot countries', () => {
      const events = parseWikidataTechResponse(wikidataFixture)
      expect(events.length).toBeGreaterThanOrEqual(7)
      const countries = new Set(events.map((e) => e.pais))
      for (const pilot of TECH_TREE_CONFIG.pilotCountries) {
        expect(countries.has(pilot)).toBe(true)
      }
    })

    it('fails with a clear error if the Wikidata SPARQL JSON is malformed or missing required bindings', () => {
      expect(() => parseWikidataTechResponse(null)).toThrow(/non-null JSON object/i)
      expect(() =>
        parseWikidataTechResponse({ head: { vars: [] }, results: { bindings: 'not-an-array' } })
      ).toThrow(/results\.bindings/i)
      expect(() =>
        parseWikidataTechResponse({
          head: { vars: ['item'] },
          results: {
            bindings: [
              {
                item: { type: 'uri', value: 'https://www.wikidata.org/entity/Q123' },
              },
            ],
          },
        })
      ).toThrow(/Incomplete Wikidata binding/i)
    })
  })

  describe('Step 5 — Eliminate Invented Technologies & Wire Wargame Simulator', () => {
    it('returns explicit Sin datos verificados and empty technologies arrays for countries outside the 7 pilot countries', () => {
      for (const iso2 of ['MX', 'AR', 'ES', 'BR']) {
        expect(isPilotCountryCode(iso2)).toBe(false)
        const profile = SovereignPowerService.getCountrySovereignProfile(iso2)
        expect(profile).not.toBeNull()
        expect(profile.dossiers.tech.hasVerifiedTechTree).toBe(false)
        expect(profile.dossiers.tech.summary).toContain('Sin datos verificados para este país')
        expect(profile.dossiers.tech.subsectors.economic.technologies).toEqual([])
        expect(profile.dossiers.tech.subsectors.industrial.technologies).toEqual([])
        expect(profile.dossiers.tech.subsectors.military.technologies).toEqual([])
        expect(profile.dossiers.tech.subsectors.semiconductors.capabilities).toEqual([])
        expect(profile.dossiers.tech.subsectors.artificialIntelligence.models).toEqual([])
        expect(profile.dossiers.tech.blockedNodesCount).toBe(0)
      }
    })

    it('computes the 0-100 techInnovation score from the historical tree for all 7 pilot countries', () => {
      for (const iso2 of TECH_TREE_CONFIG.pilotCountries) {
        const profile = SovereignPowerService.getCountrySovereignProfile(iso2)
        expect(profile).toBeDefined()
        expect(profile.dossiers.tech.hasVerifiedTechTree).toBe(true)

        const tree2026 = stateAt(iso2, 2026, getTechTreeEvents())
        expect(profile.baseScores.techInnovation).toBe(tree2026.scoreTecnologico)
        expect(profile.dossiers.tech.score).toBe(tree2026.scoreTecnologico)
      }
    })

    it('amplifies wargame techShock penalty when a country has sanction-blocked nodes in its tech tree', () => {
      const cnProfile = SovereignPowerService.getCountrySovereignProfile('CN')
      const jpProfile = SovereignPowerService.getCountrySovereignProfile('JP')

      expect(cnProfile.dossiers.tech.blockedNodesCount).toBeGreaterThan(0)
      expect(jpProfile.dossiers.tech.blockedNodesCount).toBe(0)

      // Give both identical base scores to isolate the sanction amplifier effect
      const identicalBase = {
        techInnovation: 80,
        politicalCabinet: 75,
        currencyHegemony: 75,
        tradeCompetitiveness: 80,
        militaryCapacity: 80,
        institutionalStability: 75,
      }

      const cnSim = SovereignPowerService.simulateWargame(
        identicalBase,
        { defenseShock: 0, tradeShock: 0, currencyShock: 0, techShock: -30 },
        'CN'
      )

      const jpSim = SovereignPowerService.simulateWargame(
        identicalBase,
        { defenseShock: 0, tradeShock: 0, currencyShock: 0, techShock: -30 },
        'JP'
      )

      expect(cnSim.warpedScores.techInnovation).toBeLessThan(jpSim.warpedScores.techInnovation)
      expect(cnSim.tacticalLogs.some((l) => l.includes('NODOS BLOQUEADOS EN ÁRBOL'))).toBe(true)
    })
  })

  describe('Step 6 — Public UI (TechInnovationPanel, Year Slider, Choropleth, Comparator, States)', () => {
    it('renders explicit empty state for non-pilot countries without inventing technologies', () => {
      const mxProfile = SovereignPowerService.getCountrySovereignProfile('MX')
      render(<TechInnovationPanel dossier={mxProfile.dossiers.tech} countryCode="MX" />)

      expect(screen.getByTestId('tech-tree-empty')).toBeTruthy()
      expect(screen.getByText(/Sin datos verificados para este país/i)).toBeTruthy()
    })

    it('renders loading skeleton state and error fallback banner preserving last valid state', () => {
      const usProfile = SovereignPowerService.getCountrySovereignProfile('US')
      const { rerender } = render(
        <TechInnovationPanel dossier={usProfile.dossiers.tech} countryCode="US" isLoading={true} />
      )
      expect(screen.getByTestId('tech-tree-loading')).toBeTruthy()

      rerender(
        <TechInnovationPanel
          dossier={usProfile.dossiers.tech}
          countryCode="US"
          isLoading={false}
          error="Fallo de red simulado al sincronizar GDELT"
        />
      )
      expect(screen.getByTestId('tech-tree-error')).toBeTruthy()
      expect(screen.getByText(/Fallo de red simulado al sincronizar GDELT/i)).toBeTruthy()
      expect(screen.getByTestId('tech-tree-areas-view')).toBeTruthy()
    })

    it('updates the tree when moving the year slider between 2000, 2015, and 2026, and switches to Choropleth and Comparator views', () => {
      const cnProfile = SovereignPowerService.getCountrySovereignProfile('CN')
      render(<TechInnovationPanel dossier={cnProfile.dossiers.tech} countryCode="CN" />)

      const slider = screen.getByTestId('tech-tree-year-slider') as HTMLInputElement
      expect(slider.value).toBe('2026')

      // Check 2000
      fireEvent.change(slider, { target: { value: '2000' } })
      expect(screen.getByText(/Año Histórico: 2000/i)).toBeTruthy()

      // Check 2015
      fireEvent.change(slider, { target: { value: '2015' } })
      expect(screen.getByText(/Año Histórico: 2015/i)).toBeTruthy()

      // Check 2026
      fireEvent.change(slider, { target: { value: '2026' } })
      expect(screen.getByText(/Año Histórico: 2026/i)).toBeTruthy()

      // Verify node badge has shape + text + aria-label (never color alone)
      const sanctionBadge = screen.getByTestId('tech-node-semiconductors_5')
      expect(sanctionBadge.getAttribute('aria-label')).toMatch(/Nivel 5/i)
      expect(sanctionBadge.textContent).toMatch(/BLOQUEADO POR SANCIÓN/i)

      // Switch to Choropleth view
      fireEvent.click(screen.getByText(/Mapa Coroplético/i))
      expect(screen.getByTestId('tech-choropleth-map')).toBeTruthy()

      // Switch to 2-Country Comparator view
      fireEvent.click(screen.getByText(/Comparador \(2 Países\)/i))
      expect(screen.getByTestId('tech-country-comparator')).toBeTruthy()
    })

    it('computes bilateral speed in years/level between two countries', () => {
      const comparison = compareCountriesTech('US', 'CN', 2026, getTechTreeEvents())
      expect(comparison.areas).toHaveLength(10)
      const semiComp = comparison.areas.find((a) => a.areaId === 'semiconductors')!
      expect(semiComp.maxNivelPaisA).toBeGreaterThanOrEqual(4)
      expect(semiComp.maxNivelPaisB).toBeGreaterThanOrEqual(3)
      expect(semiComp.anosPromedioEntreNivelesA).not.toBeNull()
      expect(semiComp.anosPromedioEntreNivelesB).not.toBeNull()
    })
  })

  describe('Step 7 — News Classifier, Wire Agency Deduplication & 50-News Benchmark', () => {
    it('deduplicates multiple newspapers reprinting the same wire agency (Reuters/AP/EFE) or near-identical text as 1 single source', () => {
      expect(
        detectWireAgency({
          title: 'TSMC 2nm trial (Reuters)',
          sourceName: 'Yahoo Finance',
          summary: 'By Reuters',
        })
      ).toBe('Reuters')

      const reprintedCluster = [
        {
          title: 'Rapidus begins 2nm prototype wafer trials in Hokkaido plant (Reuters)',
          url: 'https://www.reuters.com/technology/rapidus-2nm-2025',
          sourceName: 'Reuters',
          domain: 'reuters.com',
          summary: 'Reuters — Japan chip venture Rapidus started 2nm prototype trials in Chitose.',
        },
        {
          title: 'Rapidus begins 2nm prototype wafer trials in Hokkaido plant - Yahoo Finance',
          url: 'https://finance.yahoo.com/news/rapidus-2nm-2025',
          sourceName: 'Yahoo Finance',
          domain: 'finance.yahoo.com',
          agency: 'Reuters',
          summary: 'Reuters — Japan chip venture Rapidus started 2nm prototype trials in Chitose.',
        },
        {
          title: 'Rapidus begins 2nm prototype wafer trials in Hokkaido plant',
          url: 'https://www.usnews.com/news/technology/rapidus-2nm-2025',
          sourceName: 'US News',
          domain: 'usnews.com',
          summary: 'Reuters — Japan chip venture Rapidus started 2nm prototype trials in Chitose.',
        },
      ]

      const clusters = deduplicateNewsSources(reprintedCluster)
      expect(clusters).toHaveLength(1)

      // Verify it does NOT unlock any node when only 1 independent wire source exists
      const outcome = evaluateCandidateNewsGroup('reprint_test', reprintedCluster)
      expect(outcome.applied).toBe(false)
      expect(outcome.independentSourceCount).toBe(1)
    })

    it('unlocks at most estado="prototipo" when >= 2 independent sources confirm a milestone, never produccion or exportacion', () => {
      expect(capAutoNewsStatus('produccion')).toBe('prototipo')
      expect(capAutoNewsStatus('exportacion')).toBe('prototipo')
      expect(capAutoNewsStatus('anunciado')).toBe('anunciado')

      const twoIndependentSources = [
        {
          title: 'Japan Rapidus starts commercial mass production of 2nm GAA wafers in Hokkaido fab',
          url: 'https://www.nikkei.com/tech/rapidus-2nm-trial',
          sourceName: 'Nikkei Asia',
          domain: 'nikkei.com',
          summary: 'Rapidus launched 2nm GAA wafer runs in Chitose with IBM technology.',
          publishedDate: '2025-04-01',
        },
        {
          title: 'METI confirms Rapidus IIM-1 cleanroom begins 2nm pilot wafer processing',
          url: 'https://www.meti.go.jp/english/press/2025/0401_001.html',
          sourceName: 'METI Japan',
          domain: 'meti.go.jp',
          summary: 'Ministry of Economy, Trade and Industry verified 2nm milestone in Hokkaido.',
          publishedDate: '2025-04-02',
        },
      ]

      const outcome = evaluateCandidateNewsGroup('two_sources_test', twoIndependentSources)
      expect(outcome.applied).toBe(true)
      expect(outcome.independentSourceCount).toBe(2)
      expect(outcome.event?.estado_nuevo).toBe('prototipo')
      expect(outcome.event?.etiqueta).toBe('Inferencia')
    })

    it('evaluates the 50 hand-labeled news benchmark with high precision (>= 90%)', () => {
      expect(labeledNews50).toHaveLength(50)

      let correctCount = 0
      const mismatches: string[] = []

      for (const item of labeledNews50) {
        const res = classifyTechNewsDeterministic({
          title: item.title,
          summary: item.summary,
        })

        const matchRelevant = res.isRelevant === item.expectedRelevant
        const matchCountry = !item.expectedRelevant || res.pais === item.expectedCountry
        const matchArea = !item.expectedRelevant || res.area === item.expectedArea
        const matchNivel = !item.expectedRelevant || res.nivel === item.expectedNivel
        const matchStatus = !item.expectedRelevant || res.cappedStatus === item.expectedCappedStatus

        if (matchRelevant && matchCountry && matchArea && matchNivel && matchStatus) {
          correctCount++
        } else {
          mismatches.push(
            `${item.id}: expected (${item.expectedRelevant}, ${item.expectedCountry}, ${item.expectedArea}, L${item.expectedNivel}, ${item.expectedCappedStatus}) got (${res.isRelevant}, ${res.pais}, ${res.area}, L${res.nivel}, ${res.cappedStatus})`
          )
        }
      }

      const precisionPercent = (correctCount / labeledNews50.length) * 100
      expect(precisionPercent).toBeGreaterThanOrEqual(90)
    })

    it('resolves multi-country sanction headlines to the sanctioned target country and partnership headlines to the subject country', () => {
      // Multi-country sanction headline: US (issuer) + NL (supplier) + CN (target) -> must resolve to CN, not US
      const sanctionMulti = classifyTechNewsDeterministic({
        title: 'US Commerce Department imposes export control ban on Dutch ASML DUV shipments to China',
        summary: 'Washington restricts immersion lithography tool exports targeting Beijing fabs.',
      })
      expect(sanctionMulti.isRelevant).toBe(true)
      expect(sanctionMulti.pais).toBe('CN')
      expect(sanctionMulti.area).toBe('semiconductors')
      expect(sanctionMulti.nivel).toBe(5)
      expect(sanctionMulti.bloqueado_por_sancion).toBe(true)

      // Multi-country partnership headline: Japan subject with US IBM partner -> must resolve to JP, not US
      const partnerMulti = classifyTechNewsDeterministic({
        title: "Japan's Rapidus begins 2nm prototype wafer trials in Hokkaido using US IBM GAA technology",
        summary: 'Chitose cleanroom processes 2nm gate-all-around test wafers.',
      })
      expect(partnerMulti.isRelevant).toBe(true)
      expect(partnerMulti.pais).toBe('JP')
      expect(partnerMulti.area).toBe('semiconductors')
      expect(partnerMulti.nivel).toBe(4)
    })

    it('rejects candidate news groups when the 2nd source is unrelated noise or about a different country/node, or when enabledOverride=false', () => {
      const mixedUnrelatedGroup = [
        {
          title: 'Japan Rapidus starts 2nm GAA wafer trials in Hokkaido fab',
          url: 'https://www.nikkei.com/tech/rapidus-2nm-trial',
          sourceName: 'Nikkei Asia',
          domain: 'nikkei.com',
          summary: 'Rapidus launched 2nm GAA wafer runs in Chitose.',
        },
        {
          title: 'European football championship qualifiers draw record television audience in Germany',
          url: 'https://www.dw.com/sports/football-ratings-berlin',
          sourceName: 'DW Germany',
          domain: 'dw.com',
          summary: 'Sports broadcast ratings rise in Berlin and Munich.',
        },
      ]

      const mixedOutcome = evaluateCandidateNewsGroup('mixed_noise_test', mixedUnrelatedGroup)
      expect(mixedOutcome.applied).toBe(false)
      expect(mixedOutcome.independentSourceCount).toBe(1)
      expect(mixedOutcome.event).toBeNull()

      const disabledOutcome = evaluateCandidateNewsGroup(
        'disabled_flag_test',
        [
          ...mixedUnrelatedGroup,
          {
            title: 'METI confirms Japan Rapidus 2nm wafer trial in Hokkaido',
            url: 'https://www.meti.go.jp/rapidus-2nm',
            sourceName: 'METI',
            domain: 'meti.go.jp',
          },
        ],
        '2026-01-15',
        { enabledOverride: false }
      )
      expect(disabledOutcome.applied).toBe(false)
      expect(disabledOutcome.event).toBeNull()
    })

    it('does NOT downgrade a node already at exportacion/produccion or trigger false retroceso when a capped noticia_auto event arrives', () => {
      const nlBefore = stateAt('NL', 2026, getTechTreeEvents())
      expect(nlBefore.areas.semiconductors.nodos.find((n) => n.nivel === 5)?.estado).toBe(
        'exportacion'
      )

      appendTechTreeEvent({
        id: 'auto_nl_semi_5_positive_news_2026',
        pais: 'NL',
        area: 'semiconductors',
        nivel: 5,
        estado_nuevo: 'prototipo', // Capped by auto-news policy
        via: 'propio',
        fecha_hecho: '2026-02-01',
        fecha_conocible: '2026-02-01',
        fuentes: [
          { nombre: 'FD: ASML ships High-NA EUV tool', tipo: 'gdelt_news', agencia_origen: 'FD' },
          { nombre: 'Reuters: ASML Veldhoven EUV update', tipo: 'gdelt_news', agencia_origen: 'Reuters' },
        ],
        etiqueta: 'Inferencia',
        origen: 'noticia_auto',
        revertido: false,
        resumen: 'Noticia automática sobre nodo que ya estaba en exportación',
      })

      const nlAfter = stateAt('NL', 2026, getTechTreeEvents())
      const lvl5 = nlAfter.areas.semiconductors.nodos.find((n) => n.nivel === 5)!
      expect(lvl5.estado).toBe('exportacion')
      expect(lvl5.retroceso).toBe(false)
      expect(lvl5.actualizado_por_noticias).toBe(true)
    })

    it('preserves the last saved tree state when GDELT fails (HTTP 429 or network error) and appends verified auto unlocks when 2 independent sources succeed', async () => {
      const url = buildGdeltTechQueryUrl('quantum', 'DE')
      expect(url).toContain('api.gdeltproject.org')
      expect(url).toContain('sourcecountry%3ADE')

      const countBefore = getTechTreeEvents().length

      // 1. Simulate GDELT HTTP 429 rate limit failure
      const failingFetch = (async () =>
        new Response('Rate limit exceeded', {
          status: 429,
          headers: { 'content-type': 'text/plain' },
        })) as unknown as typeof fetch

      const failedIngest = await fetchGdeltThematicArticles('quantum', 'DE', failingFetch)
      expect(failedIngest.ok).toBe(false)
      expect(failedIngest.preservedLastState).toBe(true)

      const failedSync = await syncTechTreeFromGdelt('quantum', 'DE', failingFetch)
      expect(failedSync.ok).toBe(false)
      expect(failedSync.preservedLastState).toBe(true)
      expect(failedSync.totalEventsAfter).toBe(countBefore)

      // 2. Simulate GDELT returning 2 independent sources for DE quantum Level 3 (50+ qubit processor)
      const successFetch = (async () =>
        new Response(
          JSON.stringify({
            articles: [
              {
                title: 'Germany inaugurates 54-qubit programmable quantum processor in Munich',
                seendate: '20260110T120000Z',
                url: 'https://www.mpg.de/quantum-54-qubit',
                domain: 'mpg.de',
              },
              {
                title: 'Fraunhofer and Munich Quantum Valley test 54-qubit superconducting quantum processor in Germany',
                seendate: '20260111T090000Z',
                url: 'https://www.handelsblatt.com/tech/quantum-munich',
                domain: 'handelsblatt.com',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        )) as unknown as typeof fetch

      const syncOk = await syncTechTreeFromGdelt('quantum', 'DE', successFetch)
      expect(syncOk.ok).toBe(true)
      expect(syncOk.appliedEvents).toHaveLength(1)
      expect(syncOk.appliedEvents[0].pais).toBe('DE')
      expect(syncOk.appliedEvents[0].area).toBe('quantum')
      expect(syncOk.appliedEvents[0].nivel).toBe(3)
      expect(syncOk.appliedEvents[0].estado_nuevo).toBe('prototipo')
    })
  })

  describe('Step 8 — Dev Review Console, Revert Button & Anonymous Telemetry', () => {
    it('rejects unauthenticated requests to /api/dev/tech-tree when x-enforce-dev-auth is active', async () => {
      const unauthReq = new NextRequest('http://localhost/api/dev/tech-tree', {
        headers: { 'x-enforce-dev-auth': 'true' },
      })
      const res = await devTechTreeGET(unauthReq)
      expect(res.status).toBe(401)
    })

    it('allows reverting and restoring automatic news unlocks via API and updates stateAt immediately', async () => {
      const jpBefore = stateAt('JP', 2026, getTechTreeEvents())
      expect(jpBefore.areas.semiconductors.nodos.find((n) => n.nivel === 4)?.estado).toBe(
        'prototipo'
      )

      const revertReq = new NextRequest('http://localhost/api/dev/tech-tree', {
        method: 'POST',
        body: JSON.stringify({
          action: 'revert',
          eventId: 'auto_jp_semi_4_rapidus_2025',
        }),
      })
      const revertRes = await devTechTreePOST(revertReq)
      expect(revertRes.status).toBe(200)

      const jpAfter = stateAt('JP', 2026, getTechTreeEvents())
      expect(jpAfter.areas.semiconductors.nodos.find((n) => n.nivel === 4)?.estado).toBe(
        'no_alcanzado'
      )

      const restoreReq = new NextRequest('http://localhost/api/dev/tech-tree', {
        method: 'POST',
        body: JSON.stringify({
          action: 'restore',
          eventId: 'auto_jp_semi_4_rapidus_2025',
        }),
      })
      const restoreRes = await devTechTreePOST(restoreReq)
      expect(restoreRes.status).toBe(200)

      const jpRestored = stateAt('JP', 2026, getTechTreeEvents())
      expect(jpRestored.areas.semiconductors.nodos.find((n) => n.nivel === 4)?.estado).toBe(
        'prototipo'
      )
    })

    it('renders TechTreeDevConsole and reverts an automatic event when clicking Revertir', () => {
      render(<TechTreeDevConsole />)

      expect(screen.getByTestId('dev-auto-event-auto_jp_semi_4_rapidus_2025')).toBeTruthy()

      const revertBtn = screen.getByTestId('revert-btn-auto_jp_semi_4_rapidus_2025')
      fireEvent.click(revertBtn)

      const jpState = stateAt('JP', 2026, getTechTreeEvents())
      expect(jpState.areas.semiconductors.nodos.find((n) => n.nivel === 4)?.estado).toBe(
        'no_alcanzado'
      )
    })

    it('renders multi-column HoI4 grid and opens node detail drawer with full sources in TechInnovationPanel', () => {
      const jpProfile = SovereignPowerService.getCountrySovereignProfile('JP')
      render(<TechInnovationPanel dossier={jpProfile.dossiers.tech} countryCode="JP" />)

      // Click on Level 4 node (unlocked by 2 independent sources: Nikkei + Reuters)
      const lvl4Badge = screen.getByTestId('tech-node-semiconductors_4')
      expect(lvl4Badge.textContent).toMatch(/Nikkei Asia/i)
      expect(lvl4Badge.textContent).toMatch(/Reuters/i)
      fireEvent.click(lvl4Badge)

      const drawer = screen.getByTestId('tech-node-detail-drawer')
      expect(drawer).toBeTruthy()
      expect(drawer.textContent).toMatch(/Detalle de Nodo: N4/i)

      // Toggle all 10 HoI4 columns
      fireEvent.click(screen.getByTestId('toggle-all-columns-btn'))
      expect(screen.getByTestId('tech-tree-all-columns-grid')).toBeTruthy()
    })

    it('aggregates anonymous telemetry by country and area without storing PII', () => {
      recordTechTreeTelemetry({ tipo: 'consulta_pais_area', pais: 'US', area: 'semiconductors' })
      recordTechTreeTelemetry({ tipo: 'consulta_pais_area', pais: 'US', area: 'semiconductors' })
      recordTechTreeTelemetry({ tipo: 'consulta_pais_area', pais: 'CN', area: 'ai_compute' })
      recordTechTreeTelemetry({ tipo: 'apertura_comparador', pais: 'US', paisComparado: 'CN' })
      recordTechTreeTelemetry({ tipo: 'uso_deslizador', pais: 'US', anioConsultado: 2015 })

      const summary = getTechTreeTelemetrySummary()
      expect(summary.uniqueCountryAreaQueries).toBe(3)
      expect(summary.comparatorOpens).toBe(1)
      expect(summary.sliderUses).toBe(1)
      expect(summary.topCountryAreaPairs[0]).toEqual({
        pairKey: 'US:semiconductors',
        pais: 'US',
        area: 'semiconductors',
        count: 2,
      })

      const keys = Object.keys(summary)
      expect(keys).not.toContain('ip')
      expect(keys).not.toContain('userId')
    })

    it('computes choropleth scores for all 7 pilot countries by area and date', () => {
      const choro = getChoroplethByArea('semiconductors', 2026)
      expect(choro).toHaveLength(7)
      const nlEntry = choro.find((c) => c.pais === 'NL')
      expect(nlEntry?.maxNivelAlcanzado).toBe(5)
    })
  })
})
