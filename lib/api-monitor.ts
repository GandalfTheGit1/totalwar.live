import { NextRequest, NextResponse } from 'next/server';
import { systemEvents } from '@/lib/system-events';

export function withMonitor(
  handler: (request: NextRequest, props?: any) => Promise<NextResponse>,
  moduleName: string
) {
  return async (request: NextRequest, props?: any) => {
    try {
      return await handler(request, props);
    } catch (error: any) {
      const isError = error instanceof Error;
      const errorMessage = isError ? error.message : String(error);
      const stack = isError ? (error.stack ?? '') : '';
      const errorType = isError ? error.name : 'UnknownError';

      // Emit rich structured error event to SSE monitor
      try {
        systemEvents.emit('log', {
          timestamp: new Date().toTimeString().slice(0, 8),
          source: moduleName,
          message: `[Unhandled Exception] ${errorMessage}`,
          type: 'error',
          stack,
          errorType,
          url: request.url,
          method: request.method,
          service: null, // withMonitor doesn't know the service — TaskList uses source
          context: { url: request.url, method: request.method },
        });
      } catch (e) {
        // Fallback si falla la conexión al emitter
        console.error('Failed to emit to systemEvents', e);
      }

      // Return 500 to avoid crashing the app or returning unexpected HTML
      return NextResponse.json(
        {
          error: 'Internal Server Error (Caught by System Monitor)',
          detail: errorMessage,
          errorType,
          module: moduleName,
        },
        { status: 500 }
      );
    }
  };
}
