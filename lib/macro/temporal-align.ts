// Module: lib/macro/temporal-align.ts
// Handles resampling data of variable frequencies (daily, weekly, monthly, quarterly, annual) into a uniform quarterly baseline.

export interface RawObservation {
  date: string;  // 'YYYY-MM-DD' or similar
  value: number;
}

export interface QuarterlyObservation {
  period: string; // 'YYYY-QX'
  value: number;
}

/**
 * Parses date string and returns its quarter period e.g. '2026-Q3'
 */
export function getQuarterPeriod(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // Attempt parsing manual formats like '2026-06'
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      if (!isNaN(year) && !isNaN(month)) {
        const q = Math.floor((month - 1) / 3) + 1;
        return `${year}-Q${q}`;
      }
    }
    return dateStr;
  }
  const year = date.getFullYear();
  const q = Math.floor(date.getMonth() / 3) + 1;
  return `${year}-Q${q}`;
}

/**
 * Detects the frequency of the dataset based on average day differences between points.
 */
export function detectFrequency(observations: RawObservation[]): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' {
  if (observations.length < 2) return 'quarterly';

  let totalDiffDays = 0;
  for (let i = 1; i < observations.length; i++) {
    const d1 = new Date(observations[i - 1].date);
    const d2 = new Date(observations[i].date);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    totalDiffDays += diffTime / (1000 * 60 * 60 * 24);
  }

  const avgDiff = totalDiffDays / (observations.length - 1);
  if (avgDiff <= 3) return 'daily';
  if (avgDiff <= 10) return 'weekly';
  if (avgDiff <= 35) return 'monthly';
  if (avgDiff <= 100) return 'quarterly';
  return 'annual';
}

/**
 * Resamples raw observations into a quarterly series.
 */
export function resampleToQuarterly(
  observations: RawObservation[],
  forcedFreq?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
): QuarterlyObservation[] {
  if (observations.length === 0) return [];

  // Sort chronological ascending (oldest first)
  const sorted = [...observations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const freq = forcedFreq || detectFrequency(sorted);

  if (freq === 'quarterly') {
    // If already quarterly, just aggregate to avoid duplicates per quarter if any
    const groups: Record<string, number[]> = {};
    for (const obs of sorted) {
      const period = getQuarterPeriod(obs.date);
      if (!groups[period]) groups[period] = [];
      groups[period].push(obs.value);
    }
    return Object.entries(groups).map(([period, vals]) => ({
      period,
      value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100
    }));
  }

  if (freq === 'annual') {
    // Annual to Quarterly: Linear interpolation
    const results: QuarterlyObservation[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const curYear = new Date(current.date).getFullYear();

      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        const nextYear = new Date(next.date).getFullYear();
        const yearDiff = nextYear - curYear;
        const totalQuarters = yearDiff * 4;
        const step = (next.value - current.value) / totalQuarters;

        for (let q = 0; q < totalQuarters; q++) {
          const qIdx = q % 4;
          const yOffset = Math.floor(q / 4);
          const period = `${curYear + yOffset}-Q${qIdx + 1}`;
          results.push({
            period,
            value: Math.round((current.value + step * q) * 100) / 100
          });
        }
      } else {
        // Last annual point: generate 4 quarters of the same year with constant or slight trend
        for (let q = 1; q <= 4; q++) {
          results.push({
            period: `${curYear}-Q${q}`,
            value: Math.round(current.value * 100) / 100
          });
        }
      }
    }
    return results;
  }

  // Daily, Weekly, Monthly -> Average values within the same quarter
  const groups: Record<string, number[]> = {};
  for (const obs of sorted) {
    const period = getQuarterPeriod(obs.date);
    if (!groups[period]) groups[period] = [];
    groups[period].push(obs.value);
  }

  return Object.entries(groups).map(([period, vals]) => ({
    period,
    value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100
  }));
}
