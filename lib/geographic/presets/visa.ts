/**
 * lib/geographic/presets/visa.ts
 *
 * Geographic operations and country revenue breakdown preset for Visa Inc. (V - ID "5").
 */

import { CompanyGeographicData } from '../types';

export const V_GEOGRAPHIC_DATA: CompanyGeographicData = {
  companyId: "5",
  regions: [
    { name: "Norteamérica", revenuePercent: 44, coordinates: { x: 230, y: 150 } },
    { name: "Europa", revenuePercent: 25, coordinates: { x: 500, y: 120 } },
    { name: "Asia-Pacífico", revenuePercent: 18, coordinates: { x: 760, y: 220 } },
    { name: "Latinoamérica", revenuePercent: 7, coordinates: { x: 310, y: 310 } },
    { name: "Medio Oriente & África", revenuePercent: 6, coordinates: { x: 580, y: 250 } }
  ],
  countries: [
    {
      countryCode: "US",
      countryName: "Estados Unidos",
      flag: "🇺🇸",
      revenuePercent: 44,
      operationType: "Sede y Procesamiento Central (VisaNet)",
      riskScore: 1,
      riskDescription: "Excelente entorno institucional. Riesgo regulatorio en el Congreso por presión legislativa sobre tarifas.",
      details: "Sedes principales en San Francisco. El corazón tecnológico de la red de pago (los dos datacenters gemelos principales de VisaNet) reside en territorio estadounidense.",
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
      revenuePercent: 10,
      operationType: "Sede de Visa Europe y Compensación",
      riskScore: 2,
      riskDescription: "Presión regulatoria británica de la PSR para reducir comisiones de intercambio transfronterizas post-Brexit.",
      details: "Visa compró Visa Europe en 2016 para reintegrar sus operaciones globales. Gran volumen de comercio digital.",
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
      countryCode: "CN",
      countryName: "China",
      flag: "🇨🇳",
      revenuePercent: 1,
      operationType: "Operaciones Bloqueadas de Facto",
      riskScore: 9,
      riskDescription: "Monopolio estatal absoluto de la red UnionPay que bloquea el procesamiento doméstico extranjero.",
      details: "Visa ha intentado entrar en el procesamiento doméstico chino durante 20 años sin éxito. Recientemente opera mediante cobros a turistas, pero el ecosistema local de Alipay/WeChat Pay los ha excluido.",
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
      countryCode: "BR",
      countryName: "Brasil",
      flag: "🇧🇷",
      revenuePercent: 4,
      operationType: "Procesamiento Digital de Pagos",
      riskScore: 4,
      riskDescription: "Riesgos de canibalización ante la popularidad de PIX, un sistema de pago directo instantáneo y sin comisiones del Banco Central.",
      details: "Mercado con una adopción espectacular de tarjetas de crédito. Visa compite activamente ofreciendo valores añadidos de seguridad y seguros de compra.",
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
    }
  ],
  geopoliticalMoatInsight: "El foso de red de Visa es verdaderamente global, lo que le permite cobrar un peaje sobre el comercio internacional. No obstante, el auge de las redes de pago domésticas soberanas (como UnionPay en China, RuPay en India o PIX en Brasil) representan el mayor riesgo a largo plazo para su expansión en mercados emergentes."
};
