/**
 * Dataset de recursos por país generado por `npm run build:resources`.
 * Solo para servidor: el JSON pesa ~1 MB y el cliente lo consulta vía /api/resources.
 */

import raw from '@/lib/data/country-resources.json';
import { CountryResourcesDataset } from './types';

export const COUNTRY_RESOURCES = raw as unknown as CountryResourcesDataset;
