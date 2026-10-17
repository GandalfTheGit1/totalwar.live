/**
 * lib/services/sovereign-power/profiles/procedural-cabinet.ts
 *
 * Procedural generation helpers for ministerial cabinets and replacement candidates
 * of uncalibrated sovereign nations.
 */

import { 
  PoliticalCabinetDossier, 
  CabinetMember, 
  CabinetReplacementCandidate 
} from '../../../types/sovereign-power';
import { GeopoliticalCountry } from '../../../data/geopolitical-countries';

function buildProceduralHeadOfState(codeLower: string, nameEs: string): CabinetMember {
  return {
    id: `${codeLower}_hos`,
    role: 'HEAD_OF_STATE',
    roleTitleEs: 'Jefe de Estado / Mandatario',
    name: `Líder Soberano (${nameEs})`,
    faction: 'Bloque Constitucional',
    doctrine: 'Estabilidad y Crecimiento',
    bioSnippet: `Comandante supremo guiando la estrategia geopolítica de ${nameEs}.`,
    ideologyAlignment: 'MODERATE_DIPLOMAT',
    stabilityImpact: 2
  };
}

/**
 * Procedurally generates head of state and core ministers for unindexed nations.
 */
function buildProceduralMinisters(codeLower: string, country: GeopoliticalCountry): {
  headOfState: CabinetMember;
  defenseMinister: CabinetMember;
  financeMinister: CabinetMember;
  foreignMinister: CabinetMember;
} {
  return {
    headOfState: buildProceduralHeadOfState(codeLower, country.nameEs),
    defenseMinister: {
      id: `${codeLower}_def`,
      role: 'DEFENSE',
      roleTitleEs: 'Ministro de Defensa',
      name: `Ministro de Defensa (${country.nameEs})`,
      faction: 'Fuerzas Armadas Nacionales',
      doctrine: 'Defensa Territorial y Alianzas',
      bioSnippet: 'Supervisa la preparación y despliegue de las fuerzas armadas.',
      ideologyAlignment: 'HAWK',
      stabilityImpact: 2
    },
    financeMinister: {
      id: `${codeLower}_fin`,
      role: 'FINANCE',
      roleTitleEs: 'Ministro de Hacienda / Economía',
      name: `Ministro de Economía (${country.nameEs})`,
      faction: 'Ortodoxia Macroeconómica',
      doctrine: 'Equilibrio Fiscal y Atracción de Capital',
      bioSnippet: 'Gobierna los presupuestos, recaudación y endeudamiento soberano.',
      ideologyAlignment: 'FISCAL_ORTHODOX',
      stabilityImpact: 2
    },
    foreignMinister: {
      id: `${codeLower}_for`,
      role: 'FOREIGN_SECURITY',
      roleTitleEs: 'Canciller / Asuntos Exteriores',
      name: `Canciller (${country.nameEs})`,
      faction: 'Cuerpo Diplomático',
      doctrine: 'Multilateralismo y Vínculos Comerciales',
      bioSnippet: 'Representa la nación en foros internacionales y tratados.',
      ideologyAlignment: 'MODERATE_DIPLOMAT',
      stabilityImpact: 2
    }
  };
}

function buildDefenseCandidate(codeLower: string, nameEs: string): CabinetReplacementCandidate {
  return {
    id: `${codeLower}_rep_hawk`,
    targetRole: 'DEFENSE',
    name: `General Estratega (${nameEs})`,
    faction: 'Ala Militar de Alta Preparación',
    doctrine: 'Disuasión Ofensiva & Rearme Asimétrico',
    bioSnippet: 'Partidario de incrementar el gasto militar e intensificar la doctrina de seguridad nacional.',
    ideologyAlignment: 'HAWK',
    impacts: {
      militaryDelta: 8,
      stabilityDelta: -4,
      currencyDelta: -3,
      tradeDelta: -2,
      techDelta: 2,
      narrativeChange: 'Incremento del gasto en defensa e imposición de mayor disciplina estratégica.'
    }
  };
}

function buildFinanceCandidate(codeLower: string, nameEs: string): CabinetReplacementCandidate {
  return {
    id: `${codeLower}_rep_finance`,
    targetRole: 'FINANCE',
    name: `Ministro Tecnócrata (${nameEs})`,
    faction: 'Ortodoxia Presupuestaria & Mercados',
    doctrine: 'Austeridad Fiscal & Contención del Spread Dalio',
    bioSnippet: 'Economista pro-reformas centrado en sanear la balanza de pagos y mitigar el riesgo soberano.',
    ideologyAlignment: 'FISCAL_ORTHODOX',
    impacts: {
      currencyDelta: 6,
      stabilityDelta: -2,
      militaryDelta: -4,
      tradeDelta: 4,
      techDelta: 1,
      narrativeChange: 'Ajuste fiscal para fortalecer la solvencia soberana y reducir el coste de la deuda.'
    }
  };
}

function buildDiplomatCandidate(codeLower: string, nameEs: string): CabinetReplacementCandidate {
  return {
    id: `${codeLower}_rep_diplomat`,
    targetRole: 'FOREIGN_SECURITY',
    name: `Embajador Multilateralista (${nameEs})`,
    faction: 'Diplomacia Internacional & Comercio Exterior',
    doctrine: 'Alianzas Estratégicas y Apertura Arancelaria',
    bioSnippet: 'Diplomático de carrera partidario de diversificar socios comerciales y desescalar fricciones bilaterales.',
    ideologyAlignment: 'MODERATE_DIPLOMAT',
    impacts: {
      tradeDelta: 6,
      stabilityDelta: 4,
      militaryDelta: -3,
      currencyDelta: 2,
      techDelta: 3,
      narrativeChange: 'Expansión de tratados bilaterales y amortiguamiento de tensiones geopolíticas.'
    }
  };
}

/**
 * Procedurally generates 3 realistic cabinet replacement candidates across Defense, Finance, and Foreign Affairs.
 */
function buildProceduralReplacements(codeLower: string, nameEs: string): CabinetReplacementCandidate[] {
  return [
    buildDefenseCandidate(codeLower, nameEs),
    buildFinanceCandidate(codeLower, nameEs),
    buildDiplomatCandidate(codeLower, nameEs)
  ];
}

/**
 * Builds complete procedural cabinet dossier.
 */
export function buildProceduralCabinetDossier(
  country: GeopoliticalCountry, 
  cabinetScore: number, 
  riskFactor: number
): PoliticalCabinetDossier {
  const codeLower = country.code.toLowerCase();
  const ministers = buildProceduralMinisters(codeLower, country);

  return {
    score: cabinetScore,
    activeDoctrine: `Preservación Soberana & Integración en ${country.blocs.join(', ')}`,
    dominantFaction: 'Gobierno Constitucional',
    factionCohesionLevel: riskFactor > 5 ? 'FACTIONAL_FRICTION' : 'COHESIVE',
    ...ministers,
    availableReplacements: buildProceduralReplacements(codeLower, country.nameEs)
  };
}
