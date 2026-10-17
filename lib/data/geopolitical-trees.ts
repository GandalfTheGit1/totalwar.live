export const TREES = {
  tariff_war: {
    id: 'tariff_war',
    title: 'Guerra Arancelaria (Bloque A vs B)',
    description: 'Imposición de aranceles escalonados a semiconductores y componentes tecnológicos básicos.',
    chanceNodes: [
      { id: 'chance-mod', label: 'Arancel Moderado (15%)', prob: 0.65 },
      { id: 'chance-sev', label: 'Arancel Severo (40%)', prob: 0.35 }
    ],
    leafNodes: [
      {
        id: 'leaf-mod-pass', parent: 'chance-mod', label: 'Absorción Pasiva',
        condition: 'Moat Débil / Competencia Alta',
        impact: { cogsInc: 0.15, volLoss: 0.05, duration: 4 },
        verdict: 'VULNERABLE', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/50'
      },
      {
        id: 'leaf-mod-act', parent: 'chance-mod', label: 'Traslado al Cliente',
        condition: 'Pricing Power Fuerte',
        impact: { cogsInc: 0.05, volLoss: 0.15, duration: 2 },
        verdict: 'SAFE', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/50'
      },
      {
        id: 'leaf-sev-pass', parent: 'chance-sev', label: 'Pérdida de Margen',
        condition: 'Moat Débil / Sin Alternativas',
        impact: { cogsInc: 0.40, volLoss: 0.10, duration: 6 },
        verdict: 'DISTRESSED', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/50'
      },
      {
        id: 'leaf-sev-act', parent: 'chance-sev', label: 'Sustitución Parcial',
        condition: 'Flexibilidad de Proveedores',
        impact: { cogsInc: 0.20, volLoss: 0.20, duration: 3 },
        verdict: 'VULNERABLE', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/50'
      }
    ]
  },
  canal_blockade: {
    id: 'canal_blockade',
    title: 'Bloqueo Logístico (Canal Crítico)',
    description: 'Cierre de una arteria marítima clave obligando a re-rutear el 40% de los envíos.',
    chanceNodes: [
      { id: 'chance-short', label: 'Bloqueo Breve (<30 días)', prob: 0.80 },
      { id: 'chance-long', label: 'Bloqueo Prolongado (>90 días)', prob: 0.20 }
    ],
    leafNodes: [
      {
        id: 'leaf-short-inv', parent: 'chance-short', label: 'Inventario de Seguridad',
        condition: 'Altos niveles de stock',
        impact: { cogsInc: 0.05, volLoss: 0.0, duration: 1 },
        verdict: 'SAFE', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/50'
      },
      {
        id: 'leaf-short-jit', parent: 'chance-short', label: 'Ruptura Just-in-Time',
        condition: 'Inventario ajustado',
        impact: { cogsInc: 0.10, volLoss: 0.15, duration: 2 },
        verdict: 'VULNERABLE', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/50'
      },
      {
        id: 'leaf-long-air', parent: 'chance-long', label: 'Flete Aéreo de Emergencia',
        condition: 'Bienes de alto margen',
        impact: { cogsInc: 0.45, volLoss: 0.05, duration: 2 },
        verdict: 'VULNERABLE', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/50'
      },
      {
        id: 'leaf-long-stop', parent: 'chance-long', label: 'Parada de Producción',
        condition: 'Bienes voluminosos / Bajo margen',
        impact: { cogsInc: 0.20, volLoss: 0.60, duration: 4 },
        verdict: 'DISTRESSED', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/50'
      }
    ]
  }
};
