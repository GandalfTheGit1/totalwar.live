/**
 * lib/geographic/presets/microsoft.ts
 *
 * Geographic operations and country revenue breakdown preset for Microsoft Corporation (MSFT - ID "3").
 */

import { CompanyGeographicData } from '../types';

export const MSFT_GEOGRAPHIC_DATA: CompanyGeographicData = {
  companyId: "3",
  regions: [
    { name: "Norteamérica", revenuePercent: 51, coordinates: { x: 230, y: 150 } },
    { name: "Europa", revenuePercent: 28, coordinates: { x: 500, y: 120 } },
    { name: "Asia-Pacífico", revenuePercent: 12, coordinates: { x: 760, y: 240 } },
    { name: "Resto del Mundo", revenuePercent: 9, coordinates: { x: 400, y: 340 } }
  ],
  countries: [
    {
      countryCode: "US",
      countryName: "Estados Unidos",
      flag: "🇺🇸",
      revenuePercent: 51,
      operationType: "Sede, R&D y Servidores",
      riskScore: 1,
      riskDescription: "Sólida protección legal de patentes, aunque bajo creciente presión regulatoria de la FTC por adquisiciones.",
      details: "Sede central de Redmond y principal concentración de infraestructura en la nube de Azure. El gobierno de EE. UU. es uno de sus mayores clientes.",
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
      countryCode: "IE",
      countryName: "Irlanda",
      flag: "🇮🇪",
      revenuePercent: 8,
      operationType: "Optimización Fiscal y Operaciones",
      riskScore: 2,
      riskDescription: "Bajo riesgo. Regulaciones fiscales europeas armonizadas pero con posible impacto de impuestos globales mínimos.",
      details: "Microsoft Operations Ireland canaliza gran parte de la facturación comercial de software y cloud en la región EMEA.",
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
      revenuePercent: 4,
      operationType: "Desarrollo de Software y Cloud",
      riskScore: 3,
      riskDescription: "Riesgos de devaluación de la rupia e infraestructura eléctrica en áreas de expansión de servidores.",
      details: "Grandes centros de desarrollo de ingeniería (IDC) en Hyderabad y Bangalore. Mercado de rápido crecimiento para licencias corporativas y Azure.",
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
    },
    {
      countryCode: "CN",
      countryName: "China",
      flag: "🇨🇳",
      revenuePercent: 2,
      operationType: "Operaciones Locales Restringidas",
      riskScore: 8,
      riskDescription: "Estrictos requisitos de censura estatal, espionaje y leyes que obligan a entregar código fuente.",
      details: "A diferencia de Google, Microsoft mantiene Bing y servicios limitados de Azure operados por terceros (21Vianet) en China, asumiendo altos costes reputacionales y regulatorios.",
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
  geopoliticalMoatInsight: "Microsoft posee un foso geográfico muy diversificado. Al ser software y servicios Cloud, no depende de activos físicos tan centralizados como Apple. Su foso se basa en la adopción global de Windows y Office, haciendo que sus ingresos dependan de la digitalización global más que de las cadenas de suministro físicas."
};
