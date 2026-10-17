import { getCountryRiskInfo } from '@/lib/geographic-data';
import { supabase } from '@/lib/supabase';

export async function calculateDynamicRiskScore(countryCode: string): Promise<number> {
  const riskInfo = getCountryRiskInfo(countryCode);
  const code = countryCode.toUpperCase();
  
  let score = 3; // Default fallback score
  
  if (riskInfo.classification === 'Bajo') {
    if (riskInfo.embi <= 10) score = 1;
    else if (riskInfo.embi <= 40) score = 2;
    else score = 3;
  } else if (riskInfo.classification === 'Moderado') {
    if (riskInfo.embi <= 200) score = 4;
    else if (riskInfo.embi <= 350) score = 5;
    else score = 6;
  } else if (riskInfo.classification === 'Alto') {
    if (riskInfo.embi <= 800) score = 7;
    else score = 8;
  } else if (riskInfo.classification === 'Extremo') {
    if (riskInfo.embi <= 4000) score = 9;
    else score = 10;
  }
  
  // Dynamic lookup in Supabase countries table if available
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('severity_score')
      .eq('country_code', code)
      .single();
    if (!error && data && data.severity_score !== null) {
      score = Math.max(score, data.severity_score);
    }
  } catch (e) {
    // Ignore error and use default calculation
  }
  
  // Geopolitical Friction Overlay for countries not yet tracked/updated in DB
  if (code === 'CN') {
    score = Math.max(score, 7); 
  } else if (code === 'IL') {
    score = Math.max(score, 7);
  } else if (code === 'RU' || code === 'UA') {
    score = Math.max(score, 10);
  }
  
  return score;
}
