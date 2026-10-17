import { describe, it, expect } from 'vitest';
import { 
  TradeDagService, 
  TradeDagGraph, 
  TradeNode, 
  TradeEdge 
} from '@/lib/services/trade-dag-service';

describe('TradeDagService - Economic DAG Engine & Trade Steering (T03.11)', () => {
  // ─── 1. Detección y Validación de Aciclicidad (DAG) ─────────────────────────

  describe('DAG Acyclicity & Cycle Detection (Kahn / DFS)', () => {
    it('should validate an acyclic graph and return correct topological order', () => {
      const graph: TradeDagGraph = {
        id: 'test_dag_valid',
        name: 'Valid DAG',
        sector: 'Test',
        description: 'Simple linear chain',
        nodes: [
          {
            id: 'A', name: 'Origin A', type: 'ORIGIN', countryCode: 'US', industry: 'Raw',
            operatingMargin: 0.1, fcf: 100, revenue: 1000, pricingPower: 40, moatScore: 30,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.8, switchingCost: 20
          },
          {
            id: 'B', name: 'Pass B', type: 'PASS_THROUGH', countryCode: 'MX', industry: 'Assembly',
            operatingMargin: 0.05, fcf: 50, revenue: 2000, pricingPower: 20, moatScore: 15,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.9, switchingCost: 15
          },
          {
            id: 'C', name: 'End C', type: 'END_NODE', countryCode: 'US', industry: 'Brand',
            operatingMargin: 0.35, fcf: 700, revenue: 3000, pricingPower: 95, moatScore: 90,
            moatType: 'BRAND_MONOPOLY', substitutability: 0.1, switchingCost: 90
          }
        ],
        edges: [
          { source: 'A', target: 'B', flowValue: 800 },
          { source: 'B', target: 'C', flowValue: 1500 }
        ]
      };

      const result = TradeDagService.validateAcyclicity(graph);
      expect(result.isAcyclic).toBe(true);
      expect(result.cycles).toHaveLength(0);
      expect(result.topologicalOrder).toEqual(['A', 'B', 'C']);
    });

    it('should detect cycles and extract cycle paths in cyclic graphs', () => {
      const cyclicGraph: TradeDagGraph = {
        id: 'test_dag_cycle',
        name: 'Cyclic Graph',
        sector: 'Test',
        description: 'Circular trade flow',
        nodes: [
          {
            id: 'X', name: 'Node X', type: 'PASS_THROUGH', countryCode: 'CN', industry: 'A',
            operatingMargin: 0.05, fcf: 10, revenue: 100, pricingPower: 20, moatScore: 10,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.9, switchingCost: 10
          },
          {
            id: 'Y', name: 'Node Y', type: 'PASS_THROUGH', countryCode: 'TW', industry: 'B',
            operatingMargin: 0.05, fcf: 10, revenue: 100, pricingPower: 20, moatScore: 10,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.9, switchingCost: 10
          },
          {
            id: 'Z', name: 'Node Z', type: 'PASS_THROUGH', countryCode: 'JP', industry: 'C',
            operatingMargin: 0.05, fcf: 10, revenue: 100, pricingPower: 20, moatScore: 10,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.9, switchingCost: 10
          }
        ],
        edges: [
          { source: 'X', target: 'Y', flowValue: 50 },
          { source: 'Y', target: 'Z', flowValue: 50 },
          { source: 'Z', target: 'X', flowValue: 50 } // Back-edge creating cycle X -> Y -> Z -> X
        ]
      };

      const result = TradeDagService.validateAcyclicity(cyclicGraph);
      expect(result.isAcyclic).toBe(false);
      expect(result.cycles.length).toBeGreaterThan(0);
      expect(result.topologicalOrder).toEqual([]);

      // Check that analyzeTradeDag throws fast and loud on cyclic dependency
      expect(() => TradeDagService.analyzeTradeDag(cyclicGraph)).toThrowError(/Error de aciclicidad detectado/);
    });

    it('should handle diamond-shaped branching DAGs without false cycle alerts', () => {
      const diamondDag: TradeDagGraph = {
        id: 'diamond_dag',
        name: 'Diamond DAG',
        sector: 'Tech',
        description: 'Fork and join structure',
        nodes: [
          {
            id: 'O', name: 'Origin', type: 'ORIGIN', countryCode: 'US', industry: 'Mining',
            operatingMargin: 0.1, fcf: 10, revenue: 100, pricingPower: 30, moatScore: 30,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.5, switchingCost: 20
          },
          {
            id: 'P1', name: 'Path 1', type: 'PASS_THROUGH', countryCode: 'MX', industry: 'Nearshoring',
            operatingMargin: 0.05, fcf: 5, revenue: 50, pricingPower: 20, moatScore: 20,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.8, switchingCost: 20
          },
          {
            id: 'P2', name: 'Path 2', type: 'PASS_THROUGH', countryCode: 'VN', industry: 'Offshoring',
            operatingMargin: 0.04, fcf: 5, revenue: 50, pricingPower: 15, moatScore: 15,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.85, switchingCost: 15
          },
          {
            id: 'E', name: 'End Buyer', type: 'END_NODE', countryCode: 'US', industry: 'OEM',
            operatingMargin: 0.25, fcf: 80, revenue: 200, pricingPower: 85, moatScore: 85,
            moatType: 'BRAND_MONOPOLY', substitutability: 0.1, switchingCost: 80
          }
        ],
        edges: [
          { source: 'O', target: 'P1', flowValue: 40 },
          { source: 'O', target: 'P2', flowValue: 40 },
          { source: 'P1', target: 'E', flowValue: 40 },
          { source: 'P2', target: 'E', flowValue: 40 }
        ]
      };

      const result = TradeDagService.validateAcyclicity(diamondDag);
      expect(result.isAcyclic).toBe(true);
      expect(result.topologicalOrder[0]).toBe('O');
      expect(result.topologicalOrder[3]).toBe('E');
    });
  });

  // ─── 2. Clasificación Automática de Nodos ───────────────────────────────────

  describe('Node Classification (Origin vs Pass-Through vs End Node)', () => {
    it('should classify nodes correctly by topology and moat attributes', () => {
      const nodes: Partial<TradeNode>[] = [
        { id: 'n1', moatScore: 20, pricingPower: 20 },
        { id: 'n2', moatScore: 10, pricingPower: 15 },
        { id: 'n3', moatScore: 90, pricingPower: 92 }
      ];
      const edges: TradeEdge[] = [
        { source: 'n1', target: 'n2', flowValue: 100 },
        { source: 'n2', target: 'n3', flowValue: 200 }
      ];

      const classified = TradeDagService.classifyNodes(nodes, edges);
      expect(classified).toEqual(['ORIGIN', 'PASS_THROUGH', 'END_NODE']);
    });
  });

  // ─── 3. Métricas Cuantitativas: Margin Drain, FCF Capture, Steering & Chokepoint ─

  describe('Quantitative Mathematical Metrics', () => {
    it('should calculate marginDrainPercentage, fcfCaptureRatio, tradeSteeringRisk and chokepointExposure accurately', () => {
      const sampleGraph: TradeDagGraph = {
        id: 'sample_metrics_dag',
        name: 'Metrics Test DAG',
        sector: 'Electronics',
        description: 'Test chain with commoditized assembler and high-moat end node',
        nodes: [
          {
            id: 'raw_supplier',
            name: 'Raw Supplier',
            type: 'ORIGIN',
            countryCode: 'AU',
            industry: 'Minerals',
            operatingMargin: 0.10, // 10%
            fcf: 100,
            revenue: 1000,
            pricingPower: 30,
            moatScore: 30,
            moatType: 'NONE_COMMODITIZED',
            substitutability: 0.70,
            switchingCost: 30
          },
          {
            id: 'commoditized_assembler',
            name: 'Commoditized Assembler',
            type: 'PASS_THROUGH',
            countryCode: 'CN',
            industry: 'Assembly',
            operatingMargin: 0.03, // 3%
            fcf: 60,
            revenue: 2000, // Margin value = 2000 * 0.03 = 60
            pricingPower: 15,
            moatScore: 10,
            moatType: 'NONE_COMMODITIZED',
            substitutability: 0.85,
            switchingCost: 15
          },
          {
            id: 'end_brand_ip',
            name: 'End Brand IP',
            type: 'END_NODE',
            countryCode: 'US',
            industry: 'Consumer Tech',
            operatingMargin: 0.30, // 30%
            fcf: 900,
            revenue: 3000, // Margin value = 3000 * 0.30 = 900
            pricingPower: 95,
            moatScore: 95,
            moatType: 'BRAND_MONOPOLY',
            substitutability: 0.05,
            switchingCost: 95
          }
        ],
        edges: [
          { source: 'raw_supplier', target: 'commoditized_assembler', flowValue: 1000 },
          { source: 'commoditized_assembler', target: 'end_brand_ip', flowValue: 2000 }
        ]
      };

      const metrics = TradeDagService.calculateMetrics(sampleGraph);

      // Total margin pool = (1000 * 0.1) + (2000 * 0.03) + (3000 * 0.30) = 100 + 60 + 900 = 1060
      expect(metrics.totalMarginPool).toBeCloseTo(1060, 1);

      // Margin drain in pass-through = 60 / 1060 = 5.66% (~5.7%)
      expect(metrics.marginDrainPercentage).toBeCloseTo(5.7, 1);
      expect(metrics.passThroughMarginShare).toBeCloseTo(5.7, 1);

      // Total positive FCF = 100 + 60 + 900 = 1060
      // End node FCF = 900
      // FCF Capture ratio = 900 / 1060 = 0.849 (84.9%)
      expect(metrics.fcfCaptureRatio).toBeCloseTo(0.849, 2);

      // Trade steering risk: assembler has substitutability 0.85, moat 10, switchingCost 15, pricingPower 15
      // Vulnerability = 0.4*0.85 + 0.3*0.9 + 0.2*0.85 + 0.1*0.85 = 0.34 + 0.27 + 0.17 + 0.085 = 0.865 (86.5%)
      expect(metrics.tradeSteeringRisk).toBeGreaterThan(75);
      expect(metrics.vulnerablePassThroughNodes).toContain('commoditized_assembler');
      expect(metrics.dominantEndNodes).toContain('end_brand_ip');
    });

    it('should correctly measure high chokepoint exposure in irreplaceable bottlenecks', () => {
      const chokepointDag: TradeDagGraph = {
        id: 'chokepoint_test',
        name: 'Chokepoint Test',
        sector: 'Advanced Tech',
        description: 'Single point of failure',
        nodes: [
          {
            id: 'raw', name: 'Raw', type: 'ORIGIN', countryCode: 'US', industry: 'Raw',
            operatingMargin: 0.1, fcf: 100, revenue: 500, pricingPower: 30, moatScore: 30,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.6, switchingCost: 30
          },
          {
            id: 'monopoly_fab', name: 'Monopoly Fab', type: 'PASS_THROUGH', countryCode: 'TW', industry: 'Fab',
            operatingMargin: 0.45, fcf: 3000, revenue: 8000, pricingPower: 95, moatScore: 98,
            moatType: 'SCALE_CHOKEPOINT', substitutability: 0.01, switchingCost: 99, isChokepoint: true
          },
          {
            id: 'buyer', name: 'Buyer', type: 'END_NODE', countryCode: 'US', industry: 'OEM',
            operatingMargin: 0.30, fcf: 4000, revenue: 10000, pricingPower: 90, moatScore: 90,
            moatType: 'IP_PATENTS', substitutability: 0.1, switchingCost: 90
          }
        ],
        edges: [
          { source: 'raw', target: 'monopoly_fab', flowValue: 500 },
          { source: 'monopoly_fab', target: 'buyer', flowValue: 7500 }
        ]
      };

      const metrics = TradeDagService.calculateMetrics(chokepointDag);
      expect(metrics.chokepointExposure).toBeGreaterThan(60);
      expect(metrics.identifiedChokepoints).toContain('monopoly_fab');
    });

    it('should handle edge cases: empty graphs and zero flows safely', () => {
      const emptyGraph: TradeDagGraph = {
        id: 'empty', name: 'Empty', sector: 'None', description: 'Empty',
        nodes: [], edges: []
      };

      const metrics = TradeDagService.calculateMetrics(emptyGraph);
      expect(metrics.marginDrainPercentage).toBe(0);
      expect(metrics.fcfCaptureRatio).toBe(0);
      expect(metrics.tradeSteeringRisk).toBe(0);
      expect(metrics.chokepointExposure).toBe(0);
    });
  });

  // ─── 4. Análisis Integral y Veredictos Ejecutivos ───────────────────────────

  describe('Executive Verdict Analysis', () => {
    it('should classify high FCF capture as DOMINATED_BY_END_NODES', () => {
      const semidag = TradeDagService.getSemiconductorAiDag();
      const analysis = TradeDagService.analyzeTradeDag(semidag);

      expect(analysis.isAcyclic).toBe(true);
      expect(analysis.summary.verdict).toBe('DOMINATED_BY_END_NODES');
      expect(analysis.metrics.fcfCaptureRatio).toBeGreaterThan(0.70);
      expect(analysis.summary.fcfMoatAssessment).toContain('Captura superior de FCF');
    });

    it('should identify chokepoints in Semiconductor DAG', () => {
      const semidag = TradeDagService.getSemiconductorAiDag();
      const analysis = TradeDagService.analyzeTradeDag(semidag);

      expect(analysis.metrics.identifiedChokepoints).toContain('node_asml_euv');
      expect(analysis.metrics.identifiedChokepoints).toContain('node_tsmc_foundry');
      expect(analysis.metrics.dominantEndNodes).toContain('node_nvidia_compute');
      expect(analysis.metrics.dominantEndNodes).toContain('node_apple_ecosystem');
      expect(analysis.metrics.vulnerablePassThroughNodes).toContain('node_foxconn_assembly');
      expect(analysis.metrics.vulnerablePassThroughNodes).toContain('node_osat_ase');
    });
  });

  // ─── 5. Simulación de Shock de Trade Steering (Bypass) ──────────────────────

  describe('Trade Steering Shock Simulation', () => {
    it('should simulate trade bypass on pass-through node and calculate margin compression', () => {
      const semidag = TradeDagService.getSemiconductorAiDag();
      const simResult = TradeDagService.simulateTradeSteeringShock(
        semidag,
        'node_foxconn_assembly',
        40 // 40% bypass
      );

      expect(simResult.targetNodeId).toBe('node_foxconn_assembly');
      expect(simResult.bypassPercentage).toBe(40);
      expect(simResult.divertedFlowValue).toBeGreaterThan(0);
      expect(simResult.deltas.targetNodeMarginLoss).toBeGreaterThan(0);
      expect(simResult.impactNarrative).toContain('Foxconn');
      expect(simResult.postMetrics.nodeMetrics['node_foxconn_assembly'].throughput)
        .toBeLessThan(simResult.preMetrics.nodeMetrics['node_foxconn_assembly'].throughput);
    });

    it('should throw when target node is not found for simulation', () => {
      const semidag = TradeDagService.getSemiconductorAiDag();
      expect(() => TradeDagService.simulateTradeSteeringShock(semidag, 'non_existent_node', 50))
        .toThrowError(/Nodo objetivo no encontrado/);
    });
  });

  // ─── 6. Arquetipos Industriales Calibrados ──────────────────────────────────

  describe('Calibrated Industry Archetypes', () => {
    it('should provide valid EV Battery DAG with Lithium origin and CATL chokepoint', () => {
      const evDag = TradeDagService.getEvBatteryDag();
      const analysis = TradeDagService.analyzeTradeDag(evDag);

      expect(analysis.isAcyclic).toBe(true);
      expect(analysis.metrics.identifiedChokepoints).toContain('node_catl_cells');
      expect(analysis.metrics.dominantEndNodes).toContain('node_tesla_oem');
    });

    it('should provide valid BioPharma DAG with CDMO pass-through and Big Pharma end node', () => {
      const pharmaDag = TradeDagService.getBioPharmaDag();
      const analysis = TradeDagService.analyzeTradeDag(pharmaDag);

      expect(analysis.isAcyclic).toBe(true);
      expect(analysis.metrics.fcfCaptureRatio).toBeGreaterThan(0.85);
      expect(analysis.metrics.dominantEndNodes).toContain('node_patented_pharma');
    });

    it('should provide valid Luxury Goods DAG with high brand pricing power', () => {
      const luxuryDag = TradeDagService.getLuxuryGoodsDag();
      const analysis = TradeDagService.analyzeTradeDag(luxuryDag);

      expect(analysis.isAcyclic).toBe(true);
      expect(analysis.metrics.fcfCaptureRatio).toBeGreaterThan(0.90);
      expect(analysis.metrics.dominantEndNodes).toContain('node_hermes_lvmh');
    });
  });

  // ─── 7. Generación Dinámica Contextual por País ────────────────────────────

  describe('Country Contextual Trade DAG Resolution', () => {
    it('should resolve specialized semiconductor DAG for Taiwan (TW)', () => {
      const dag = TradeDagService.getTradeDagForCountry('TW');
      expect(dag.sector).toContain('Tecnología & Hardware Avanzado');
      const analysis = TradeDagService.analyzeTradeDag(dag);
      expect(analysis.isAcyclic).toBe(true);
    });

    it('should resolve US global trade DAG with IP capture dominance', () => {
      const dag = TradeDagService.getTradeDagForCountry('US');
      expect(dag.name).toContain('Estados Unidos');
      const analysis = TradeDagService.analyzeTradeDag(dag);
      expect(analysis.isAcyclic).toBe(true);
      expect(analysis.metrics.dominantEndNodes).toContain('node_us_ip_end');
    });

    it('should resolve China manufacturing matrix with massive assembly throughput', () => {
      const dag = TradeDagService.getTradeDagForCountry('CN');
      expect(dag.name).toContain('China');
      const analysis = TradeDagService.analyzeTradeDag(dag);
      expect(analysis.isAcyclic).toBe(true);
      expect(analysis.metrics.identifiedChokepoints).toContain('node_cn_assemblers');
    });

    it('should generate robust procedural bilateral DAG for other countries (e.g. MX, ES, DE)', () => {
      for (const iso of ['MX', 'ES', 'DE', 'BR', 'KR']) {
        const dag = TradeDagService.getTradeDagForCountry(iso);
        expect(dag.nodes.length).toBeGreaterThan(0);
        const analysis = TradeDagService.analyzeTradeDag(dag);
        expect(analysis.isAcyclic).toBe(true);
        expect(analysis.metrics.totalMarginPool).toBeGreaterThan(0);
      }
    });
  });

  // ─── 8. Integridad Estructural y Casos Extremos (Fail Fast Regla 7.5 y 11) ───

  describe('Structural Integrity & Edge Case Invariance', () => {
    it('should fail fast and throw on dangling edges referencing non-existent nodes', () => {
      const graphWithDanglingEdge: TradeDagGraph = {
        id: 'dangling_dag',
        name: 'Dangling DAG',
        sector: 'Test',
        description: 'Edge pointing to phantom node',
        nodes: [
          {
            id: 'valid_1', name: 'Node 1', type: 'ORIGIN', countryCode: 'US', industry: 'A',
            operatingMargin: 0.1, fcf: 10, revenue: 100, pricingPower: 10, moatScore: 10,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.5, switchingCost: 10
          }
        ],
        edges: [
          { source: 'valid_1', target: 'phantom_node_99', flowValue: 50 }
        ]
      };

      expect(() => TradeDagService.validateAcyclicity(graphWithDanglingEdge))
        .toThrowError(/Aristas inválidas detectadas con nodos inexistentes: valid_1 ➔ phantom_node_99/);
    });

    it('should fail fast and throw on duplicate node IDs in graph', () => {
      const graphWithDuplicateNodes: TradeDagGraph = {
        id: 'dup_dag',
        name: 'Duplicate DAG',
        sector: 'Test',
        description: 'Duplicate node ID',
        nodes: [
          {
            id: 'node_alpha', name: 'Alpha 1', type: 'ORIGIN', countryCode: 'US', industry: 'A',
            operatingMargin: 0.1, fcf: 10, revenue: 100, pricingPower: 10, moatScore: 10,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.5, switchingCost: 10
          },
          {
            id: 'node_alpha', name: 'Alpha 2', type: 'PASS_THROUGH', countryCode: 'CN', industry: 'B',
            operatingMargin: 0.05, fcf: 5, revenue: 50, pricingPower: 10, moatScore: 10,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.5, switchingCost: 10
          }
        ],
        edges: []
      };

      expect(() => TradeDagService.validateAcyclicity(graphWithDuplicateNodes))
        .toThrowError(/Nodos duplicados detectados en el grafo: node_alpha/);
    });

    it('should diagnose a chain without End Nodes (0% FCF capture) as COMMODITIZED_DRAIN_CRITICAL', () => {
      const commoditizedTrapGraph: TradeDagGraph = {
        id: 'no_end_nodes_dag',
        name: 'Commoditized Trap Chain',
        sector: 'Assembly',
        description: 'Supply chain ending in assembly with no brand or IP End Node',
        nodes: [
          {
            id: 'raw_mine', name: 'Raw Mining', type: 'ORIGIN', countryCode: 'AU', industry: 'Mining',
            operatingMargin: 0.08, fcf: 50, revenue: 1000, pricingPower: 20, moatScore: 20,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.7, switchingCost: 20
          },
          {
            id: 'sub_assembler', name: 'Sub Assembler', type: 'PASS_THROUGH', countryCode: 'VN', industry: 'Assembly',
            operatingMargin: 0.03, fcf: 20, revenue: 2000, pricingPower: 15, moatScore: 10,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.9, switchingCost: 10
          }
        ],
        edges: [
          { source: 'raw_mine', target: 'sub_assembler', flowValue: 800 }
        ]
      };

      const analysis = TradeDagService.analyzeTradeDag(commoditizedTrapGraph);
      expect(analysis.isAcyclic).toBe(true);
      expect(analysis.metrics.fcfCaptureRatio).toBe(0);
      expect(analysis.metrics.dominantEndNodes).toHaveLength(0);
      expect(analysis.summary.verdict).toBe('COMMODITIZED_DRAIN_CRITICAL');
      expect(analysis.summary.keyVulnerability).toContain('Trampa de comoditización');
    });

    it('should re-route steered trade along alternative parallel paths in diamond graph during shock', () => {
      const diamondDag: TradeDagGraph = {
        id: 'diamond_sim_dag',
        name: 'Diamond Simulation DAG',
        sector: 'Tech',
        description: 'Parallel routing',
        nodes: [
          {
            id: 'O', name: 'Origin', type: 'ORIGIN', countryCode: 'US', industry: 'Mining',
            operatingMargin: 0.1, fcf: 10, revenue: 100, pricingPower: 30, moatScore: 30,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.5, switchingCost: 20
          },
          {
            id: 'P1', name: 'Path 1 (Vulnerable)', type: 'PASS_THROUGH', countryCode: 'MX', industry: 'Nearshoring',
            operatingMargin: 0.05, fcf: 5, revenue: 50, pricingPower: 20, moatScore: 20,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.8, switchingCost: 20
          },
          {
            id: 'P2', name: 'Path 2 (Alternative)', type: 'PASS_THROUGH', countryCode: 'VN', industry: 'Offshoring',
            operatingMargin: 0.04, fcf: 5, revenue: 50, pricingPower: 15, moatScore: 15,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.85, switchingCost: 15
          },
          {
            id: 'E', name: 'End Buyer', type: 'END_NODE', countryCode: 'US', industry: 'OEM',
            operatingMargin: 0.25, fcf: 80, revenue: 200, pricingPower: 85, moatScore: 85,
            moatType: 'BRAND_MONOPOLY', substitutability: 0.1, switchingCost: 80
          }
        ],
        edges: [
          { source: 'O', target: 'P1', flowValue: 40 },
          { source: 'O', target: 'P2', flowValue: 40 },
          { source: 'P1', target: 'E', flowValue: 40 },
          { source: 'P2', target: 'E', flowValue: 40 }
        ]
      };

      const shockResult = TradeDagService.simulateTradeSteeringShock(diamondDag, 'P1', 50);
      expect(shockResult.bypassPercentage).toBe(50);
      expect(shockResult.divertedFlowValue).toBe(20);

      // Verify that alternative edge O -> P2 absorbed diverted flow
      const altEdge = shockResult.postMetrics.nodeMetrics['P2'];
      expect(altEdge.inflow).toBeGreaterThan(40);
    });

    it('should aggravate cash burn on negative FCF node during bypass shock instead of setting to zero', () => {
      const burningCashDag: TradeDagGraph = {
        id: 'burn_dag',
        name: 'Cash Burning DAG',
        sector: 'Hardware',
        description: 'Negative FCF pass-through node',
        nodes: [
          {
            id: 'O', name: 'Origin', type: 'ORIGIN', countryCode: 'US', industry: 'Raw',
            operatingMargin: 0.1, fcf: 50, revenue: 200, pricingPower: 40, moatScore: 40,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.5, switchingCost: 30
          },
          {
            id: 'burning_pass', name: 'Cash Burn Pass', type: 'PASS_THROUGH', countryCode: 'CN', industry: 'EMS',
            operatingMargin: 0.02, fcf: -200, revenue: 1000, pricingPower: 15, moatScore: 15,
            moatType: 'NONE_COMMODITIZED', substitutability: 0.8, switchingCost: 20
          },
          {
            id: 'E', name: 'End Node', type: 'END_NODE', countryCode: 'US', industry: 'Brand',
            operatingMargin: 0.3, fcf: 500, revenue: 1500, pricingPower: 90, moatScore: 90,
            moatType: 'BRAND_MONOPOLY', substitutability: 0.1, switchingCost: 90
          }
        ],
        edges: [
          { source: 'O', target: 'burning_pass', flowValue: 200 },
          { source: 'burning_pass', target: 'E', flowValue: 800 }
        ]
      };

      const shock = TradeDagService.simulateTradeSteeringShock(burningCashDag, 'burning_pass', 40);
      // Post shock FCF should remain negative and worsen
      expect(shock.deltas.targetNodeMarginLoss).toBeGreaterThan(0);
    });

    it('should safely guard against NaN or invalid bypass percentage', () => {
      const semidag = TradeDagService.getSemiconductorAiDag();
      const shock = TradeDagService.simulateTradeSteeringShock(semidag, 'node_foxconn_assembly', NaN);
      expect(shock.bypassPercentage).toBe(0);
      expect(shock.divertedFlowValue).toBe(0);
    });
  });
});
