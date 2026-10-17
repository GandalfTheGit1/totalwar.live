/**
 * @file presidential-stances.ts
 * @description Sovereign geopolitical stance alerts and executive trade/regulatory positions.
 */

export const PRESIDENTIAL_STANCE_ALERTS: Record<string, { title: string; content: string; severity: number; source: string }> = {
  US: {
    title: 'Amenaza de Aranceles Globales y Control de la FED',
    content: 'Donald Trump ha afirmado que el Presidente de EE. UU. debería tener opinión sobre las decisiones de tipos de interés de la Reserva Federal (FED) e imponer aranceles universales del 10-20% y del 60% a China. Esto desataría choques inflacionarios sistémicos y afectaría las cadenas globales.',
    severity: 9,
    source: 'Truth Social / Declaración Pública 2026'
  },
  CN: {
    title: 'Autosuficiencia en Semiconductores y Tensión Militar',
    content: 'Xi Jinping enfatiza el desarrollo de "fuerzas productivas de nueva calidad" y la soberanía total sobre Taiwán. Ha instado a prohibir componentes occidentales en infraestructuras clave y acelerar la sustitución local, impactando directamente la cuota de mercado de firmas extranjeras.',
    severity: 8,
    source: 'Xinhua / Congreso del Partido'
  },
  TW: {
    title: 'Seguridad del Estrecho y Redundancia Tecnológica de TSMC',
    content: 'Lai Ching-te advierte sobre el incremento de la presión y simulación de bloqueos por parte del Ejército Popular de Liberación chino. La administración promueve activamente la "diplomacia del silicio", forzando a TSMC a diversificar fundidoras avanzadas a EE. UU. y Europa.',
    severity: 9,
    source: 'Oficina del Presidente de Taiwán'
  },
  MX: {
    title: 'Reforma Judicial y Escrutinio Energético',
    content: 'Claudia Sheinbaum defiende la elección por voto popular de jueces y la preponderancia del Estado sobre el sector eléctrico (Pemex/CFE), lo cual ha activado cláusulas de disputa de inversión bajo el T-MEC.',
    severity: 7,
    source: 'Conferencia de Prensa Oficial (La Mañanera)'
  },
  BR: {
    title: 'Desdolarización Comercial y Tasa Global de Billonarios',
    content: 'Lula da Silva aboga por la desdolarización del comercio bilateral BRICS y la aplicación de un impuesto global a los súper ricos. Propone aranceles de protección ecológica e industrial en Mercosur.',
    severity: 7,
    source: 'Cumbre de Río / Discurso Oficial'
  },
  JP: {
    title: 'Normalización Monetaria y Alianza Militar Trilateral',
    content: 'Shigeru Ishiba impulsa el fin de las tasas ultrabajas y apoya los aumentos de tipos del BOJ, lo que ha provocado volatilidad masiva en el "Carry Trade" del Yen. En el frente diplomático, propone un bloque de seguridad trilateral activo.',
    severity: 8,
    source: 'Gabinete del Primer Ministro'
  },
  GB: {
    title: 'Nacionalización Ferroviaria e Impuestos Extraordinarios a Energéticas',
    content: 'Keir Starmer ejecuta la renacionalización gradual ferroviaria y eleva los impuestos sobre beneficios extraordinarios ("Windfall Tax") de las energéticas británicas al 38% para financiar la Great British Energy.',
    severity: 7,
    source: 'Downing Street Briefing'
  },
  ES: {
    title: 'Impuesto de Solidaridad Permanente a la Banca y Energéticas',
    content: 'Pedro Sánchez ha convertido los gravámenes temporales sobre banca y multinacionales de energía en impuestos permanentes de solidaridad, reduciendo los márgenes de intermediación de las multinacionales operando en el país.',
    severity: 7,
    source: 'La Moncloa / Boletín Oficial del Estado'
  }
};
