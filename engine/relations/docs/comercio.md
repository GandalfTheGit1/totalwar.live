# Acuerdos comerciales: escalera de integración (25-10-2026)

Un solo nivel por par, gana el más alto:

| Estado | Puntos | Fuente |
|---|---|---|
| `DEEP_INTEGRATION` (UE) | +25 | pertenencia revisada; sustituye a los tres siguientes |
| `CUSTOMS_UNION` | +18 | Mercosur, UEEA y CCG (pertenencias revisadas) y los acuerdos tipo CU de la lista de la OMC (SACU…) |
| `FTA_IN_FORCE` | +12 | pertenencias revisadas + lista de la OMC (`model/wto/rta_all.xlsx`, leída por `model/wto_rta.py`) |
| `PREFERENTIAL_TRADE` | +6 | ASEAN, AfCFTA (siempre preferencial) y acuerdos PSA/EIA de la OMC |
| `TRADE_HIGH` / `TRADE_MEDIUM` | +12 / +6 | flujo comercial (WITS), independiente del acuerdo |

Los tratados de inversión (BIT) son `INVESTMENT_TREATY` (+1); se descartan entre miembros de la UE (extinguidos el 5-5-2020). `WGE_WTO=0` apaga la lista de la OMC.

## Validación (protocolos fijados con hash)
- v1 (`audit_trade.py`): A y B pasan, C falla (bloques 23/31) por la diferencia de criterio unión/libre comercio/preferencial.
- v2 (`audit_trade_v2.py`): D1–D5 pasan; bloques 22/29 porque olvidó enmendar 7 casos de Mercosur y UEEA.
- v3 (`audit_trade_v3.py`, enmienda posterior a ver el fallo, solo etiquetas): bloques 29/29. Banco 78, mapa 36/40, hold-out 10, calibración 153,2 (QASA pasa de 0 a 4,2 al ser el CCG unión aduanera).
- Sin gatear y por revisar: RU-UZ (libre comercio CEI) y ER-ET (`CUSTOMS_UNION`, dudoso). Los pesos son ordinales, sin calibrar.
- Comprobación completa: `python3 -I docs/gemini_trade/run_checks.py post` (desde la raíz del repo).
