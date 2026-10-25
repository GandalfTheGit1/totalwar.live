/**
 * lib/services/country-resources/types.ts
 *
 * Tipos del dataset de recursos por país (lib/data/country-resources.json), generado por
 * scripts/build-country-resources.ts a partir de fuentes estadísticas oficiales.
 */

export type ResourceCategory =
  | 'energy'       // combustibles fósiles y uranio (World Mining Data)
  | 'metals'       // metales (World Mining Data)
  | 'minerals'     // minerales industriales y gemas (World Mining Data)
  | 'electricity'  // generación eléctrica renovable y nuclear (Ember)
  | 'agriculture'  // cultivos y sus aceites (FAOSTAT)
  | 'livestock'    // carne, leche, huevos, lana, miel y cabaña ganadera (FAOSTAT)
  | 'fisheries'    // pesca de captura, acuicultura y algas (FAO FishStat)
  | 'forestry';    // madera y pulpa (FAOSTAT)

export type ResourceSourceId = 'wmd' | 'faostat-qcl' | 'faostat-fo' | 'fishstat' | 'ember' | 'eurostat';

/** Unidad canónica en la que se guarda el valor. */
export type ResourceUnit = 't' | 'kg' | 'ct' | 'Mm3' | 'm3' | 'TWh' | 'head' | 'hive';

/** Calidad del dato tal como la marca la fuente: oficial, estimado o provisional. */
export type ResourceDataFlag = 'official' | 'estimated' | 'provisional';

/** Enlace a artículo de ranking de producción en Wikipedia. */
export interface WikipediaLinkInfo {
  title: string;
  url: string;
  isRedirect?: boolean;
}

export interface CommodityWikipedia {
  es?: WikipediaLinkInfo;
  en?: WikipediaLinkInfo;
}

export interface CommodityDefinition {
  id: string;
  nameEs: string;
  nameEn: string;
  category: ResourceCategory;
  unit: ResourceUnit;
  source: ResourceSourceId;
  /** Sinónimos para la búsqueda (español o inglés). */
  aliases?: string[];
  /** Aclaración corta: base de medida (p. ej. "contenido de Li2O") o solapamiento con otra serie. */
  note?: string;
  /** Artículos de ranking de producción en Wikipedia (ES/EN) */
  wikipedia?: CommodityWikipedia;
}

export interface CommodityStats extends CommodityDefinition {
  /** Número de países con producción > 0. */
  producerCount: number;
  /** Año más reciente con dato mundial. */
  latestYear: number | null;
  /** Producción mundial en `latestYear`. */
  worldTotal: number | null;
}

/** Producción de un recurso en un país (claves cortas para reducir el tamaño del JSON). */
export interface CountryResourceRecord {
  /** Id del recurso en el catálogo. */
  c: string;
  /** Valor en la unidad canónica del recurso. */
  v: number;
  /** Año del dato. */
  y: number;
  /** Cuota de la producción mundial de ese año (0–1), o null si no hay total mundial. */
  s: number | null;
  /** Puesto mundial entre los productores (1 = mayor). */
  r: number;
  /** Calidad del dato. */
  f?: ResourceDataFlag;
  /** Solo electricidad: cuota de la generación eléctrica total del país (0–1). */
  m?: number;
  /** Fuente del dato cuando no es la habitual del recurso (p. ej. Eurostat para un país que Ember no cubre). */
  src?: ResourceSourceId;
}

/**
 * Recurso que el país producía y cuya fuente declara después producción cero
 * (mina cerrada, fundición parada…). No cuenta como producción actual.
 */
export interface CeasedResourceRecord {
  c: string;
  /** Último valor positivo y su año. */
  v: number;
  y: number;
  /** Año en que la fuente registra producción cero. */
  z: number;
}

export interface ResourceSourceInfo {
  id: ResourceSourceId;
  name: string;
  url: string;
  license: string;
  /** Rango de años leído de la fuente. */
  years: string;
}

export interface CountryResourcesDataset {
  meta: {
    generatedAt: string;
    sources: ResourceSourceInfo[];
    /** Años más antiguos se descartan para no presentar datos obsoletos como actuales. */
    minYear: number;
  };
  commodities: CommodityStats[];
  /** Clave: ISO 3166-1 alfa-2. Registros ordenados por cuota mundial descendente. */
  countries: Record<string, CountryResourceRecord[]>;
  /** Clave: ISO 3166-1 alfa-2. Producción detenida dentro del periodo cubierto. */
  ceased: Record<string, CeasedResourceRecord[]>;
}
