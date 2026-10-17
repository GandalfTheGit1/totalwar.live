import {
  CorporateFacility,
  FacilityFunctionalType,
  FacilityTenure,
  CITY_COORDINATES_MAP,
} from './types';

const SQFT_TO_SQM = 0.092903;
const VALID_TYPES: FacilityFunctionalType[] = ['HQ', 'MANUFACTURING', 'RND', 'LOGISTICS_DATACENTER'];

function mapFacilityItem(item: any, ticker: string, index: number): CorporateFacility {
  const cityClean = (item.city || '').toLowerCase().trim();
  const fallbackGeo = CITY_COORDINATES_MAP[cityClean];

  const lat = typeof item.lat === 'number' && Number.isFinite(item.lat)
    ? item.lat
    : (fallbackGeo?.lat ?? 0);

  const lng = typeof item.lng === 'number' && Number.isFinite(item.lng)
    ? item.lng
    : (fallbackGeo?.lng ?? 0);

  const countryCode = (item.countryCode || fallbackGeo?.countryCode || 'US').toUpperCase().slice(0, 2);
  const functionalType: FacilityFunctionalType = VALID_TYPES.includes(item.functionalType)
    ? item.functionalType
    : 'MANUFACTURING';

  const tenure: FacilityTenure = item.tenure === 'LEASED' ? 'LEASED' : 'OWNED';
  const sqFt = typeof item.sqFt === 'number' && item.sqFt > 0 ? item.sqFt : 100000;

  return {
    id: `${ticker.toLowerCase()}-facility-${index + 1}`,
    ticker,
    name: item.name || `Instalación ${index + 1}`,
    city: item.city || 'Desconocida',
    stateProvince: item.stateProvince || undefined,
    country: item.country || 'Global',
    countryCode,
    lat,
    lng,
    functionalType,
    tenure,
    sqFt,
    sqMeters: Math.round(sqFt * SQFT_TO_SQM),
    description: item.description || `Instalación operativa de ${ticker}`,
  };
}

/**
 * Invokes Gemini Flash Lite to extract structured JSON facility nodes from raw Item 2 text.
 */
export async function extractFacilitiesViaLlm(ticker: string, item2Text: string): Promise<CorporateFacility[]> {
  const { callLlm } = await import('@/lib/llm-client');
  const systemPrompt = `You are an expert financial auditor parsing SEC 10-K "Item 2. Properties".
Extract all principal operational facilities, headquarters, manufacturing/foundry plants, R&D labs, and logistics/data center campuses.
Return a STRICT JSON array of objects conforming to this schema:
[
  {
    "name": "Facility or Campus Name",
    "city": "City Name",
    "stateProvince": "State or Province (optional)",
    "country": "Country Name",
    "countryCode": "ISO-2 (e.g. US, TW, DE, JP, IE, NL, CN)",
    "lat": 37.33,
    "lng": -122.01,
    "functionalType": "HQ" | "MANUFACTURING" | "RND" | "LOGISTICS_DATACENTER",
    "tenure": "OWNED" | "LEASED",
    "sqFt": 1500000,
    "description": "Brief operational purpose"
  }
]
Guidelines:
- If square footage is mentioned in square meters, convert to sqFt (sqFt = sqMeters * 10.764). If not stated, estimate reasonably or omit.
- functionalType must be one of: 'HQ', 'MANUFACTURING', 'RND', 'LOGISTICS_DATACENTER'.
- tenure must be 'OWNED' or 'LEASED'. If mixed or unstated, choose the predominant tenure.
- Provide approximate lat/lng coordinates for the city if known.
Respond ONLY with the raw JSON array. No markdown code blocks, no commentary.`;

  const userPrompt = `Company Ticker: ${ticker}
Item 2 (Properties) Text Excerpt:
${item2Text.slice(0, 15000)}`;

  const rawResponse = await callLlm({
    systemPrompt,
    userPrompt,
    tier: 'LIGHT',
    maxTokens: 2500,
    temperature: 0.1,
    responseFormat: 'json',
  });

  let jsonStr = rawResponse.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    throw new Error(`[SecPropertiesService] Invalid LLM response: Expected JSON array but received ${typeof parsed}`);
  }

  return parsed.map((item: any, index: number) => mapFacilityItem(item, ticker, index));
}
