/**
 * lib/data/tech-tree/historical-seed.ts
 *
 * Append-only event log store and seed registry for the 7 pilot countries
 * (US, CN, RU, JP, DE, TW, NL).
 */

import { TechTreeEvent } from './types';
import { validateEventLog, validateTechEvent } from './event-log';
import { US_HISTORICAL_EVENTS } from './seeds/us-cn-events';
import { RU_EU_ASIA_HISTORICAL_EVENTS } from './seeds/ru-eu-asia-events';

export const INITIAL_TECH_TREE_EVENTS: readonly TechTreeEvent[] = Object.freeze([
  ...US_HISTORICAL_EVENTS,
  ...RU_EU_ASIA_HISTORICAL_EVENTS,
]);

// Validate initial seed at module load time to ensure zero missing sources or labels
validateEventLog([...INITIAL_TECH_TREE_EVENTS]);

let activeEventStore: TechTreeEvent[] = INITIAL_TECH_TREE_EVENTS.map((ev) => ({
  ...ev,
  fuentes: ev.fuentes.map((f) => ({ ...f })),
}));

/**
 * Returns a defensive copy of the current event log.
 */
export function getTechTreeEvents(): TechTreeEvent[] {
  return activeEventStore.map((ev) => ({
    ...ev,
    fuentes: ev.fuentes.map((f) => ({ ...f })),
  }));
}

/**
 * Appends a new validated event to the append-only log.
 */
export function appendTechTreeEvent(event: TechTreeEvent): TechTreeEvent {
  validateTechEvent(event);
  if (activeEventStore.some((e) => e.id === event.id)) {
    throw new Error(`Duplicate event id '${event.id}' cannot be appended to log.`);
  }
  const cloned: TechTreeEvent = {
    ...event,
    fuentes: event.fuentes.map((f) => ({ ...f })),
  };
  activeEventStore.push(cloned);
  return cloned;
}

/**
 * Reverts an event by ID (marks revertido = true without deleting from append-only log).
 */
export function revertTechTreeEvent(eventId: string): TechTreeEvent {
  const target = activeEventStore.find((e) => e.id === eventId);
  if (!target) {
    throw new Error(`Event '${eventId}' not found in tech tree log.`);
  }
  target.revertido = true;
  return { ...target, fuentes: target.fuentes.map((f) => ({ ...f })) };
}

/**
 * Restores a previously reverted event by ID (marks revertido = false).
 */
export function restoreTechTreeEvent(eventId: string): TechTreeEvent {
  const target = activeEventStore.find((e) => e.id === eventId);
  if (!target) {
    throw new Error(`Event '${eventId}' not found in tech tree log.`);
  }
  target.revertido = false;
  return { ...target, fuentes: target.fuentes.map((f) => ({ ...f })) };
}

/**
 * Resets the runtime event log back to the initial historical seed (useful for deterministic tests).
 */
export function resetTechTreeEventsToSeed(): void {
  activeEventStore = INITIAL_TECH_TREE_EVENTS.map((ev) => ({
    ...ev,
    fuentes: ev.fuentes.map((f) => ({ ...f })),
  }));
}
