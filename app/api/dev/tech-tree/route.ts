/**
 * app/api/dev/tech-tree/route.ts
 *
 * Protected dev route for managing automatic news unlocks (revert/restore)
 * and reading/recording anonymous technology tree telemetry.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTechTreeEvents,
  revertTechTreeEvent,
  restoreTechTreeEvent,
  stateAt,
  TechAreaId,
} from '@/lib/data/tech-tree';
import {
  getTechTreeTelemetrySummary,
  recordTechTreeTelemetry,
  TechTelemetryEventType,
} from '@/lib/services/tech-tree/telemetry';
import { syncTechTreeFromGdelt } from '@/lib/services/tech-tree/gdelt-tech-ingest';
import {
  SESSION_COOKIE_NAME,
  getVaultSecret,
  validateSessionToken,
} from '@/lib/vault-auth';

/**
 * Verifies dev route authorization using the same Vault Auth session token pattern
 * as middleware.ts when running in production or when strict auth is requested.
 */
export async function isDevRequestAuthorized(req: NextRequest): Promise<boolean> {
  const enforceAuth =
    process.env.NODE_ENV === 'production' ||
    req.headers.get('x-enforce-dev-auth') === 'true';

  if (!enforceAuth) {
    return true;
  }

  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return false;
  }

  const secret = getVaultSecret();
  return validateSessionToken(sessionCookie, secret);
}

export async function GET(req: NextRequest) {
  const authorized = await isDevRequestAuthorized(req);
  if (!authorized) {
    return NextResponse.json(
      { error: 'Unauthorized: valid Vault session required for dev routes' },
      { status: 401 }
    );
  }

  const allEvents = getTechTreeEvents();
  const autoUnlocks = allEvents.filter((ev) => ev.origen === 'noticia_auto');
  const telemetry = getTechTreeTelemetrySummary();

  return NextResponse.json({
    autoUnlocks,
    totalEventsCount: allEvents.length,
    telemetry,
  });
}

export async function POST(req: NextRequest) {
  const authorized = await isDevRequestAuthorized(req);
  if (!authorized) {
    return NextResponse.json(
      { error: 'Unauthorized: valid Vault session required for dev routes' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const action = body?.action;

    if (action === 'revert') {
      const eventId = String(body?.eventId || '').trim();
      if (!eventId) {
        return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
      }
      const updatedEvent = revertTechTreeEvent(eventId);
      const updatedTree = stateAt(updatedEvent.pais, 2026, getTechTreeEvents());
      return NextResponse.json({
        ok: true,
        event: updatedEvent,
        updatedTreeScore: updatedTree.scoreTecnologico,
        updatedNodeState:
          updatedTree.areas[updatedEvent.area].nodos.find(
            (n) => n.nivel === updatedEvent.nivel
          ) || null,
      });
    }

    if (action === 'restore') {
      const eventId = String(body?.eventId || '').trim();
      if (!eventId) {
        return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
      }
      const updatedEvent = restoreTechTreeEvent(eventId);
      const updatedTree = stateAt(updatedEvent.pais, 2026, getTechTreeEvents());
      return NextResponse.json({
        ok: true,
        event: updatedEvent,
        updatedTreeScore: updatedTree.scoreTecnologico,
        updatedNodeState:
          updatedTree.areas[updatedEvent.area].nodos.find(
            (n) => n.nivel === updatedEvent.nivel
          ) || null,
      });
    }

    if (action === 'sync_gdelt') {
      const areaId = (body?.area || 'semiconductors') as TechAreaId;
      const countryCode = body?.pais ? String(body.pais) : undefined;
      const syncResult = await syncTechTreeFromGdelt(areaId, countryCode);
      return NextResponse.json(syncResult);
    }

    if (action === 'telemetry') {
      const tipo = body?.tipo as TechTelemetryEventType;
      if (!tipo) {
        return NextResponse.json({ error: 'Missing telemetry tipo' }, { status: 400 });
      }
      const record = recordTechTreeTelemetry({
        tipo,
        pais: body?.pais,
        area: body?.area,
        paisComparado: body?.paisComparado,
        anioConsultado: body?.anioConsultado ? Number(body.anioConsultado) : undefined,
      });
      return NextResponse.json({
        ok: true,
        record,
        summary: getTechTreeTelemetrySummary(),
      });
    }

    return NextResponse.json({ error: `Unknown action '${String(action)}'` }, { status: 400 });
  } catch (err: any) {
    console.error('[API:DevTechTree] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
