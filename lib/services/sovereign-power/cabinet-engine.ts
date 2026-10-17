/**
 * lib/services/sovereign-power/cabinet-engine.ts
 *
 * Interactive Cabinet Appointment and Reshuffle Engine.
 * Dynamically updates ministerial portfolios, government doctrine,
 * and adjusts sovereign radar scores with candidate impact deltas.
 */

import { 
  SovereignRadarScores, 
  PoliticalCabinetDossier, 
  CabinetReplacementCandidate 
} from '../../types/sovereign-power';

/**
 * Assigns ministerial portfolio based on candidate profile.
 */
function assignMinisterToPortfolio(
  cabinetDossier: PoliticalCabinetDossier, 
  role: string, 
  candidate: CabinetReplacementCandidate
): void {
  const baseMember = {
    id: candidate.id,
    name: candidate.name,
    faction: candidate.faction,
    doctrine: candidate.doctrine,
    bioSnippet: candidate.bioSnippet,
    ideologyAlignment: candidate.ideologyAlignment,
    stabilityImpact: candidate.impacts.stabilityDelta
  };

  if (role === 'DEFENSE') {
    cabinetDossier.defenseMinister = {
      ...baseMember,
      role: 'DEFENSE',
      roleTitleEs: 'Ministro de Defensa'
    };
  } else if (role === 'FINANCE') {
    cabinetDossier.financeMinister = {
      ...baseMember,
      role: 'FINANCE',
      roleTitleEs: 'Ministro de Finanzas / Economía'
    };
  } else if (role === 'FOREIGN_SECURITY') {
    cabinetDossier.foreignMinister = {
      ...baseMember,
      role: 'FOREIGN_SECURITY',
      roleTitleEs: 'Asuntos Exteriores y Seguridad Nacional'
    };
  }
}

/**
 * Applies candidate impacts to sovereign scores with boundary clamping (5 - 100).
 */
function applyCandidateScoreImpacts(
  scores: SovereignRadarScores, 
  candidate: CabinetReplacementCandidate
): void {
  const impacts = candidate.impacts;
  scores.militaryCapacity = Math.min(100, Math.max(5, scores.militaryCapacity + impacts.militaryDelta));
  scores.institutionalStability = Math.min(100, Math.max(5, scores.institutionalStability + impacts.stabilityDelta));
  scores.currencyHegemony = Math.min(100, Math.max(5, scores.currencyHegemony + impacts.currencyDelta));
  scores.tradeCompetitiveness = Math.min(100, Math.max(5, scores.tradeCompetitiveness + impacts.tradeDelta));
  scores.techInnovation = Math.min(100, Math.max(5, scores.techInnovation + impacts.techDelta));

  const politicalDelta = Math.round((impacts.stabilityDelta + impacts.militaryDelta) / 2);
  scores.politicalCabinet = Math.min(100, Math.max(5, scores.politicalCabinet + politicalDelta));
}

/**
 * Applies cabinet reshuffle to dossier and recalculates sovereign scores.
 */
export function applyCabinetReshuffle(
  cabinetDossier: PoliticalCabinetDossier,
  scores: SovereignRadarScores,
  appointments: Partial<Record<'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', string>>
): void {
  console.log(`[SovereignPowerService] Applying cabinet reshuffle:`, appointments);

  for (const [role, replacementId] of Object.entries(appointments)) {
    if (!replacementId) continue;
    const candidate = cabinetDossier.availableReplacements.find(r => r.id === replacementId);
    if (!candidate) continue;

    assignMinisterToPortfolio(cabinetDossier, role, candidate);
    applyCandidateScoreImpacts(scores, candidate);
    cabinetDossier.activeDoctrine = candidate.doctrine;
  }
  cabinetDossier.score = scores.politicalCabinet;
}

