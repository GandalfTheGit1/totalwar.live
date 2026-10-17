/**
 * lib/geographic/presets/berkshire.ts
 *
 * Geographic operations and country revenue breakdown preset for Berkshire Hathaway Inc. (BRK.B - ID "2").
 */

import { CompanyGeographicData } from '../types';

export const BRKB_GEOGRAPHIC_DATA: CompanyGeographicData = {
  companyId: "2",
  regions: [
    { name: "Norteamérica", revenuePercent: 85, coordinates: { x: 230, y: 150 } },
    { name: "Europa", revenuePercent: 8, coordinates: { x: 500, y: 120 } },
    { name: "Asia-Pacífico", revenuePercent: 4, coordinates: { x: 780, y: 200 } },
    { name: "Resto del Mundo", revenuePercent: 3, coordinates: { x: 340, y: 320 } }
  ],
  countries: [
    {
      countryCode: "US",
      countryName: "Estados Unidos",
      flag: "🇺🇸",
      revenuePercent: 85,
      operationType: "Sede y Activos Operativos Principales",
      riskScore: 1,
      riskDescription: "Cero riesgo geopolítico; altamente expuesta a la marcha general de la economía estadounidense.",
      details: "Núcleo de las subsidiarias operativas (ferrocarril BNSF, aseguradora GEICO, distribuidora McLane, Berkshire Hathaway Energy). Buffett la califica como una 'apuesta por el viento de cola de EE. UU.'.",
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
      countryCode: "GB",
      countryName: "Reino Unido",
      flag: "🇬🇧",
      revenuePercent: 5,
      operationType: "Reaseguros e Infraestructura",
      riskScore: 2,
      riskDescription: "Estabilidad regulatoria excelente, baja exposición a riesgos cambiarios graves.",
      details: "Operaciones de reaseguro internacional mediante la sucursal de General Re y participaciones en infraestructura energética local.",
      economics: {
        gdpGrowth: "+0.7%",
        inflation: "+2.2%",
        interestRate: "4.75%",
        debtToGdp: "98.5%",
        corporateTax: "25.0%",
        unemployment: "4.2%",
        gdpPerCapita: "$46,800",
        tradeBalance: "-$12.4B",
        creditRating: "AA Stable",
        rdSpending: "2.9%",
        tradingEconomicsSlug: "united-kingdom"
      }
    },
    {
      countryCode: "JP",
      countryName: "Japón",
      flag: "🇯🇵",
      revenuePercent: 3,
      operationType: "Inversiones de Capital Conc.",
      riskScore: 2,
      riskDescription: "Yen debilitado y deflación histórica, mitigado por emisiones de bonos en yenes de BRK.",
      details: "Berkshire posee participaciones superiores al 8% en las 5 mayores firmas comerciales (Sogo Shosha) de Japón (Itochu, Mitsubishi, Mitsui, Sumitomo, Marubeni).",
      economics: {
        gdpGrowth: "+0.3%",
        inflation: "+2.5%",
        interestRate: "0.25%",
        debtToGdp: "263%",
        corporateTax: "30.6%",
        unemployment: "2.5%",
        gdpPerCapita: "$34,000",
        tradeBalance: "-$4.1B",
        creditRating: "A+ Stable",
        rdSpending: "3.3%",
        tradingEconomicsSlug: "japan"
      }
    },
    {
      countryCode: "CN",
      countryName: "China",
      flag: "🇨🇳",
      revenuePercent: 1,
      operationType: "Inversión Minoritaria Histórica",
      riskScore: 6,
      riskDescription: "Intervencionismo estatal chino en corporaciones tecnológicas y de transporte.",
      details: "Inversión icónica de Berkshire en el fabricante de vehículos eléctricos BYD. Munger impulsó esta compra que generó retornos masivos, aunque se ha ido reduciendo para asegurar beneficios.",
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
  geopoliticalMoatInsight: "Berkshire Hathaway is, por diseño, un vehículo enfocado en la economía doméstica de EE. UU. (85% de ingresos). Buffett prefiere invertir en empresas cuyos activos físicos estén protegidos por la ley y la estabilidad institucional americana, evitando el riesgo de expropiación o devaluación en países emergentes."
};
