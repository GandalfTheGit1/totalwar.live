/**
 * @file regions.ts
 * @description SEC region mapping coordinates and Spanish display name resolution.
 */

export const REGION_COORDINATES: { pattern: string; coordinates: { x: number; y: number } }[] = [
  // Americas
  { pattern: 'north america', coordinates: { x: 220, y: 140 } },
  { pattern: 'latin america', coordinates: { x: 290, y: 310 } },
  { pattern: 'south america', coordinates: { x: 310, y: 340 } },
  { pattern: 'central america', coordinates: { x: 250, y: 250 } },
  { pattern: 'caribbean', coordinates: { x: 280, y: 230 } },
  { pattern: 'americas', coordinates: { x: 240, y: 200 } },
  { pattern: 'latam', coordinates: { x: 290, y: 310 } },
  { pattern: 'cala', coordinates: { x: 280, y: 280 } },
  { pattern: 'amer', coordinates: { x: 240, y: 200 } },

  // Europe combinations (must be before standalone 'europe')
  { pattern: 'europe middle east', coordinates: { x: 530, y: 170 } },
  { pattern: 'emea', coordinates: { x: 530, y: 180 } },
  { pattern: 'cemea', coordinates: { x: 540, y: 180 } },
  { pattern: 'europe', coordinates: { x: 500, y: 130 } },
  { pattern: 'nordic', coordinates: { x: 510, y: 90 } },

  // Middle East & Africa
  { pattern: 'middle east', coordinates: { x: 580, y: 220 } },
  { pattern: 'mena', coordinates: { x: 560, y: 210 } },
  { pattern: 'africa', coordinates: { x: 530, y: 310 } },

  // Asia-Pacific combinations (must be before standalone matches)
  { pattern: 'asia pacific', coordinates: { x: 760, y: 220 } },
  { pattern: 'apac', coordinates: { x: 760, y: 220 } },
  { pattern: 'apmea', coordinates: { x: 720, y: 230 } },
  { pattern: 'apj', coordinates: { x: 780, y: 200 } },
  { pattern: 'greater china', coordinates: { x: 740, y: 180 } },
  { pattern: 'southeast asia', coordinates: { x: 760, y: 260 } },
  { pattern: 'south asia', coordinates: { x: 680, y: 230 } },
  { pattern: 'east asia', coordinates: { x: 770, y: 170 } },
  { pattern: 'central asia', coordinates: { x: 640, y: 160 } },
  { pattern: 'asia', coordinates: { x: 730, y: 200 } },
  { pattern: 'oceania', coordinates: { x: 830, y: 340 } },

  // Catch-alls
  { pattern: 'international', coordinates: { x: 500, y: 250 } },
  { pattern: 'rest of', coordinates: { x: 500, y: 250 } },
  { pattern: 'other', coordinates: { x: 500, y: 250 } },
  { pattern: 'foreign', coordinates: { x: 500, y: 250 } },
  { pattern: 'global', coordinates: { x: 500, y: 250 } },
  { pattern: 'overseas', coordinates: { x: 500, y: 250 } },
];

export function getRegionCoordinates(rawName: string): { x: number; y: number } {
  const lower = rawName.toLowerCase();
  for (const entry of REGION_COORDINATES) {
    if (lower.includes(entry.pattern)) {
      return entry.coordinates;
    }
  }
  return { x: 500, y: 250 };
}

export const REGION_DISPLAY_NAMES: { pattern: string; displayName: string }[] = [
  // Specific combos first
  { pattern: 'europe middle east and africa', displayName: 'Europa, Oriente Medio y África' },
  { pattern: 'europe middle east africa', displayName: 'Europa, Oriente Medio y África' },
  { pattern: 'europe, middle east and africa', displayName: 'Europa, Oriente Medio y África' },
  { pattern: 'europe, middle east & africa', displayName: 'Europa, Oriente Medio y África' },
  { pattern: 'emea', displayName: 'Europa, Oriente Medio y África (EMEA)' },
  { pattern: 'cemea', displayName: 'Europa Central, Oriente Medio y África (CEMEA)' },
  { pattern: 'europe & mea', displayName: 'Europa, Oriente Medio y África' },

  { pattern: 'greater china', displayName: 'Gran China' },
  { pattern: 'rest of asia pacific', displayName: 'Resto de Asia-Pacífico' },
  { pattern: 'asia pacific', displayName: 'Asia-Pacífico' },
  { pattern: 'apac', displayName: 'Asia-Pacífico' },
  { pattern: 'apj', displayName: 'Asia-Pacífico y Japón' },
  { pattern: 'apmea', displayName: 'Asia-Pacífico, Oriente Medio y África' },

  { pattern: 'north america', displayName: 'Norteamérica' },
  { pattern: 'latin america', displayName: 'Latinoamérica' },
  { pattern: 'south america', displayName: 'Sudamérica' },
  { pattern: 'central america', displayName: 'Centroamérica' },
  { pattern: 'caribbean', displayName: 'Caribe' },
  { pattern: 'latam', displayName: 'Latinoamérica' },
  { pattern: 'cala', displayName: 'Caribe y Latinoamérica (CALA)' },
  { pattern: 'americas', displayName: 'Américas' },

  { pattern: 'southeast asia', displayName: 'Sudeste Asiático' },
  { pattern: 'south asia', displayName: 'Asia del Sur' },
  { pattern: 'east asia', displayName: 'Asia Oriental' },
  { pattern: 'central asia', displayName: 'Asia Central' },
  { pattern: 'asia', displayName: 'Asia' },

  { pattern: 'middle east and africa', displayName: 'Oriente Medio y África' },
  { pattern: 'middle east & africa', displayName: 'Oriente Medio y África' },
  { pattern: 'middle east', displayName: 'Oriente Medio' },
  { pattern: 'mena', displayName: 'Oriente Medio y Norte de África (MENA)' },
  { pattern: 'africa', displayName: 'África' },

  { pattern: 'nordic', displayName: 'Países Nórdicos' },
  { pattern: 'oceania', displayName: 'Oceanía' },
  { pattern: 'europe', displayName: 'Europa' },

  // Generic
  { pattern: 'rest of world', displayName: 'Resto del Mundo' },
  { pattern: 'rest of the world', displayName: 'Resto del Mundo' },
  { pattern: 'international', displayName: 'Internacional' },
  { pattern: 'all other', displayName: 'Otros Segmentos' },
  { pattern: 'other countries', displayName: 'Otros Países' },
  { pattern: 'other', displayName: 'Otros' },
  { pattern: 'foreign', displayName: 'Internacional' },
  { pattern: 'overseas', displayName: 'Internacional' },
  { pattern: 'global', displayName: 'Global' },
];

export function getRegionDisplayName(rawName: string): string {
  const lower = rawName.toLowerCase();
  for (const entry of REGION_DISPLAY_NAMES) {
    if (lower.includes(entry.pattern)) {
      return entry.displayName;
    }
  }
  return rawName;
}
