/**
 * lib/geographic/presets/apple.ts
 *
 * Geographic operations and country revenue breakdown preset for Apple Inc. (AAPL - ID "1").
 */

import { CompanyGeographicData } from '../types';

export const AAPL_GEOGRAPHIC_DATA: CompanyGeographicData = {
  companyId: "1",
  regions: [
    { name: "Norteamérica", revenuePercent: 42, coordinates: { x: 230, y: 150 } },
    { name: "Europa", revenuePercent: 25, coordinates: { x: 500, y: 120 } },
    { name: "Gran China", revenuePercent: 18, coordinates: { x: 740, y: 180 } },
    { name: "Japón", revenuePercent: 7, coordinates: { x: 820, y: 160 } },
    { name: "Resto de APAC", revenuePercent: 8, coordinates: { x: 760, y: 260 } }
  ],
  countries: [
    {
      countryCode: "US",
      countryName: "Estados Unidos",
      flag: "🇺🇸",
      revenuePercent: 42,
      operationType: "Sede Central y Diseño",
      riskScore: 1,
      riskDescription: "Estabilidad regulatoria e institucional absoluta, aunque expuesta a políticas antimonopolio locales.",
      details: "Sede central (Apple Park) y centros principales de diseño de hardware, software y chips Apple Silicon. Mercado de consumo más rentable.",
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
      countryCode: "CN",
      countryName: "China",
      flag: "🇨🇳",
      revenuePercent: 18,
      operationType: "Cadena de Suministro y Ensamblado",
      riskScore: 7,
      riskDescription: "Riesgos severos de aranceles por tensiones comerciales de superpotencias y control gubernamental.",
      details: "Concentración de más del 85% de la capacidad de ensamblado de iPhones (Foxconn, Pegatron). Representa el mayor foso de manufactura a escala del mundo pero también el mayor riesgo operativo.",
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
    },
    {
      countryCode: "TW",
      countryName: "Taiwán",
      flag: "🇹🇼",
      revenuePercent: 2,
      operationType: "Fabricación de Semiconductores",
      riskScore: 8,
      riskDescription: "Riesgo geopolítico extremo ante una eventual invasión o bloqueo en el estrecho de Taiwán.",
      details: "Dependencia absoluta de TSMC para fabricar el 100% de los chips de CPU y GPU avanzados. Si la producción de Taiwán se interrumpe, la valoración de Apple caería de inmediato.",
      economics: {
        gdpGrowth: "+3.1%",
        inflation: "+1.8%",
        interestRate: "2.00%",
        debtToGdp: "28.3%",
        corporateTax: "20.0%",
        unemployment: "3.4%",
        gdpPerCapita: "$32,400",
        tradeBalance: "+$8.2B",
        creditRating: "AA+ Stable",
        rdSpending: "3.8%",
        tradingEconomicsSlug: "taiwan"
      }
    },
    {
      countryCode: "IE",
      countryName: "Irlanda",
      flag: "🇮🇪",
      revenuePercent: 1,
      operationType: "Optimización Fiscal y Operaciones",
      riskScore: 3,
      riskDescription: "Escrutinio de la Unión Europea sobre ayudas estatales fiscales ilegales y cambios tributarios globales.",
      details: "Sede operativa de Apple en Cork. Canaliza las patentes y propiedad intelectual internacional para acogerse a tasas de impuesto de sociedades del 12.5%.",
      economics: {
        gdpGrowth: "-1.2%",
        inflation: "+1.6%",
        interestRate: "3.40%",
        debtToGdp: "42.5%",
        corporateTax: "12.5%",
        unemployment: "4.3%",
        gdpPerCapita: "$104,000",
        tradeBalance: "+$4.8B",
        creditRating: "AA Stable",
        rdSpending: "1.1%",
        tradingEconomicsSlug: "ireland"
      }
    },
    {
      countryCode: "IN",
      countryName: "India",
      flag: "🇮🇳",
      revenuePercent: 3,
      operationType: "Diversificación de Manufactura",
      riskScore: 4,
      riskDescription: "Desafíos de eficiencia logística, infraestructura local y burocracia estatal.",
      details: "Apple está trasladando activamente parte de la producción de iPhone (meta del 25%) a plantas de Foxconn y Pegatron en la India para mitigar el riesgo geográfico de China.",
      economics: {
        gdpGrowth: "+6.7%",
        inflation: "+4.8%",
        interestRate: "6.50%",
        debtToGdp: "86.5%",
        corporateTax: "25.0%",
        unemployment: "7.2%",
        gdpPerCapita: "$2,500",
        tradeBalance: "-$20.1B",
        creditRating: "BBB- Stable",
        rdSpending: "0.7%",
        tradingEconomicsSlug: "india"
      }
    }
  ],
  geopoliticalMoatInsight: "Apple tiene un foso global de marca brutal, pero su cadena de suministro posee una concentración excesivamente riesgosa en China y Taiwán. Warren Buffett redujo parcialmente su participación en AAPL en 2024 para mitigar este riesgo geopolítico no diversificable en semiconductores."
};
