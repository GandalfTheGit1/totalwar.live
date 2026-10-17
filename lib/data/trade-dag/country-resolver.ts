/**
 * lib/data/trade-dag/country-resolver.ts
 *
 * Adaptive Trade DAG country resolution and archetype delegation.
 */

import type { TradeDagGraph } from '@/lib/services/trade-dag-service';
import { getBioPharmaDag, getLuxuryGoodsDag } from './biopharma-luxury';
import { getChinaTradeDag, getGenericBilateralTradeDag, getUnitedStatesTradeDag } from './country-dags';
import { getEvBatteryDag } from './ev-battery';
import { getSemiconductorAiDag } from './semiconductors';

/**
 * Normaliza y traduce el código ISO a nombre legible en español.
 */
export function resolveCountryName(cleanIso: string): string {
  switch (cleanIso) {
    case 'US': return 'Estados Unidos';
    case 'CN': return 'China';
    case 'MX': return 'México';
    case 'DE': return 'Alemania';
    case 'ES': return 'España';
    case 'JP': return 'Japón';
    default: return cleanIso;
  }
}

function resolveSpecializedArchetype(cleanIso: string): TradeDagGraph | null {
  if (cleanIso === 'TW' || cleanIso === 'NL') {
    return getSemiconductorAiDag();
  }
  if (cleanIso === 'CL' || cleanIso === 'CD') {
    return getEvBatteryDag();
  }
  if (cleanIso === 'FR' || cleanIso === 'IT') {
    return getLuxuryGoodsDag();
  }
  if (cleanIso === 'CH' || cleanIso === 'IN') {
    return getBioPharmaDag();
  }
  return null;
}

/**
 * Genera dinámicamente un Trade DAG adaptado al país seleccionado
 * en el monitor geopolítico (p. ej. EE. UU., Taiwán, China, México, Países Bajos, etc.).
 */
export function getTradeDagForCountry(countryIso: string): TradeDagGraph {
  const cleanIso = (countryIso || 'US').trim().toUpperCase();

  const specialized = resolveSpecializedArchetype(cleanIso);
  if (specialized) {
    return specialized;
  }

  const countryName = resolveCountryName(cleanIso);

  if (cleanIso === 'US') {
    return getUnitedStatesTradeDag(countryName);
  }
  if (cleanIso === 'CN') {
    return getChinaTradeDag(countryName);
  }

  return getGenericBilateralTradeDag(cleanIso, countryName);
}
