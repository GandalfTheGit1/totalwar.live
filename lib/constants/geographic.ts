/**
 * @file geographic.ts
 * @description Facade re-exporting geographic constants: country metadata, region coordinates,
 * Spanish display names, and presidential stance alerts.
 */

export { ALL_COUNTRIES_META } from './geographic/country-meta';
export {
  REGION_COORDINATES,
  getRegionCoordinates,
  REGION_DISPLAY_NAMES,
  getRegionDisplayName,
} from './geographic/regions';
export { PRESIDENTIAL_STANCE_ALERTS } from './geographic/presidential-stances';
