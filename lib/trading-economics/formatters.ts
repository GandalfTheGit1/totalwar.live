/**
 * lib/trading-economics/formatters.ts
 *
 * Number formatting and credit rating normalization helpers.
 */

function resolveRatingGrade(score: number): string {
  if (score >= 95) return 'AAA';
  if (score >= 90) return 'AA+';
  if (score >= 85) return 'AA';
  if (score >= 80) return 'AA-';
  if (score >= 75) return 'A+';
  if (score >= 70) return 'A';
  if (score >= 65) return 'A-';
  if (score >= 60) return 'BBB+';
  if (score >= 55) return 'BBB';
  if (score >= 50) return 'BBB-';
  if (score >= 45) return 'BB+';
  if (score >= 40) return 'BB';
  if (score >= 35) return 'BB-';
  if (score >= 30) return 'B+';
  if (score >= 25) return 'B';
  if (score >= 20) return 'B-';
  return 'CCC / Default';
}

/**
 * Maps a numerical 0-100 sovereign credit score to its S&P equivalent grade.
 */
export function mapCreditRating(scoreStr: string): string {
  const score = parseFloat(scoreStr);
  if (isNaN(score)) return scoreStr || 'N/A';
  const grade = resolveRatingGrade(score);
  return `${grade} Stable`;
}

export function formatPercent(val: string, showSign = false): string {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  const sign = showSign && num > 0 ? '+' : '';
  return `${sign}${num}%`;
}

export function formatGdpPerCapita(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return `$${Math.round(num).toLocaleString('en-US')}`;
}

export function formatTradeBalance(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  const prefix = num >= 0 ? '+' : '-';
  const absVal = Math.abs(num);
  // If value is greater than 1000, it is likely in USD Millions, so format to Billions
  if (absVal >= 1000) {
    return `${prefix}$${(absVal / 1000).toFixed(2)}B`;
  }
  return `${prefix}$${absVal.toFixed(2)}B`;
}
