/**
 * lib/geographic/presets/coca-cola.ts
 *
 * Geographic operations and country revenue breakdown preset for The Coca-Cola Company (KO - ID "4").
 */

import { CompanyGeographicData } from '../types';

export const KO_GEOGRAPHIC_DATA: CompanyGeographicData = {
  companyId: "4",
  regions: [
    { name: "Norteamérica", revenuePercent: 34, coordinates: { x: 230, y: 150 } },
    { name: "Latinoamérica", revenuePercent: 28, coordinates: { x: 310, y: 310 } },
    { name: "Europa & MEA", revenuePercent: 20, coordinates: { x: 500, y: 180 } },
    { name: "Asia-Pacífico", revenuePercent: 18, coordinates: { x: 760, y: 220 } }
  ],
  countries: [
    {
      countryCode: "US",
      countryName: "Estados Unidos",
      flag: "🇺🇸",
      revenuePercent: 34,
      operationType: "Sede y Producción de Concentrado",
      riskScore: 1,
      riskDescription: "Mercado maduro con bajo crecimiento de volumen pero excelente capacidad de retención.",
      details: "Sede en Atlanta. Producción de la fórmula secreta en jarabe y concentrado que luego vende a embotelladoras franquiciadas como Coca-Cola Consolidated.",
      economics: {
        gdpGrowth: "+2.8%",
        inflation: "+2.4%",
        interestRate: "4.75%",
        debtToGdp: "123%",
        corporateTax: "21.0%",
        unemployment: "4.1%",
        gdpPerCapita: "$81,600",
        tradeBalance: "-$73.1B",
        creditRating: "AA+ Stable",
        rdSpending: "3.4%",
        tradingEconomicsSlug: "united-states"
      }
    },
    {
      countryCode: "MX",
      countryName: "México",
      flag: "🇲🇽",
      revenuePercent: 12,
      operationType: "Embotellado y Mayor Consumo per Cápita",
      riskScore: 3,
      riskDescription: "Políticas fiscales de etiquetado nutricional (octágonos de advertencia) e impuestos al azúcar.",
      details: "Hogar de Coca-Cola FEMSA, la embotelladora más grande del sistema. México tiene el mayor consumo de Coca-Cola por persona en el mundo, un mercado estratégico clave para los volúmenes del sistema.",
      economics: {
        gdpGrowth: "+1.5%",
        inflation: "+4.7%",
        interestRate: "10.25%",
        debtToGdp: "49.5%",
        corporateTax: "30.0%",
        unemployment: "2.7%",
        gdpPerCapita: "$11,500",
        tradeBalance: "-$1.2B",
        creditRating: "BBB Stable",
        rdSpending: "0.3%",
        tradingEconomicsSlug: "mexico"
      }
    },
    {
      countryCode: "BR",
      countryName: "Brasil",
      flag: "🇧🇷",
      revenuePercent: 8,
      operationType: "Mercado de Consumo Clave",
      riskScore: 4,
      riskDescription: "Volatilidad del real brasileño y presiones políticas sobre derechos de extracción de agua.",
      details: "Operaciones masivas de embotellado y distribución local. Mercado defensivo clave en América del Sur.",
      economics: {
        gdpGrowth: "+3.0%",
        inflation: "+4.2%",
        interestRate: "11.25%",
        debtToGdp: "74.3%",
        corporateTax: "34.0%",
        unemployment: "7.5%",
        gdpPerCapita: "$10,100",
        tradeBalance: "+$5.4B",
        creditRating: "BB- Stable",
        rdSpending: "1.2%",
        tradingEconomicsSlug: "brazil"
      }
    },
    {
      countryCode: "CN",
      countryName: "China",
      flag: "🇨🇳",
      revenuePercent: 5,
      operationType: "Mercado en Crecimiento de Volumen",
      riskScore: 5,
      riskDescription: "Competencia agresiva con tés y bebidas locales tradicionales.",
      details: "Operaciones controladas mediante alianzas con los grupos estatales COFCO y Swire Beverages, reduciendo la exposición a expropiaciones mediante el modelo asset-light.",
      economics: {
        gdpGrowth: "+4.8%",
        inflation: "+0.4%",
        interestRate: "3.10%",
        debtToGdp: "83.8%",
        corporateTax: "25.0%",
        unemployment: "5.0%",
        gdpPerCapita: "$12,600",
        tradeBalance: "+$82.6B",
        creditRating: "A+ Stable",
        rdSpending: "2.6%",
        tradingEconomicsSlug: "china"
      }
    }
  ],
  geopoliticalMoatInsight: "Coca-Cola posee la red de distribución minorista más extendida del mundo. Su modelo 'asset-light' es brillante: KO fabrica el jarabe concentrado en pocas fábricas de alta seguridad y transfiere el capex intensivo (camiones, plantas de embotellado de vidrio, distribución física) a socios locales en cada país, blindándose de riesgos de confiscación política."
};
