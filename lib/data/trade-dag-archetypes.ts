/**
 * lib/data/trade-dag-archetypes.ts
 *
 * Arquetipos estáticos calibrados de Grafos Acíclicos Dirigidos (DAG) de Comercio
 * y generador adaptativo de grafos comerciales por país.
 *
 * Facade aggregating modular industry archetypes and country resolvers.
 */

export { getSemiconductorAiDag } from './trade-dag/semiconductors';
export { getEvBatteryDag } from './trade-dag/ev-battery';
export { getBioPharmaDag, getLuxuryGoodsDag } from './trade-dag/biopharma-luxury';
export { getTradeDagForCountry } from './trade-dag/country-resolver';
