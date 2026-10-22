import { sendGAEvent, sendGTMEvent } from '@next/third-parties/google';

/**
 * Registra un evento personalizado tanto en Google Tag Manager (GTM dataLayer)
 * como en Google Analytics 4 (GA4) si está configurado.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = {
    event: eventName,
    ...(params ?? {}),
  };

  try {
    // Envío a Google Tag Manager dataLayer
    sendGTMEvent(payload);

    // Envío directo a GA4 si NEXT_PUBLIC_GA_ID está presente
    if (process.env.NEXT_PUBLIC_GA_ID) {
      sendGAEvent('event', eventName, params ?? {});
    }
  } catch (error) {
    console.debug('[Analytics] Error tracking event:', error);
  }
}

/**
 * Eventos comunes específicos de World Geopolitical Engine
 */
export const AnalyticsEvents = {
  selectCountry: (countryIso: string, countryName?: string) =>
    trackEvent('select_country', {
      iso_code: countryIso,
      country_name: countryName,
    }),

  switchViewMode: (mode: '3D' | '2D') =>
    trackEvent('switch_view_mode', {
      view_mode: mode,
    }),

  openRadarTab: (tab: string) =>
    trackEvent('open_radar_tab', {
      tab_name: tab,
    }),

  runSimulation: (simulationType: string) =>
    trackEvent('run_simulation', {
      simulation_type: simulationType,
    }),
};
