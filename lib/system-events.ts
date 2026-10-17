import { EventEmitter } from 'events';

declare global {
  var _systemEvents: EventEmitter | undefined;
  var _systemConsoleHooked: boolean | undefined;
}

export const systemEvents = globalThis._systemEvents || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalThis._systemEvents = systemEvents;

  // Intercept global console.error and console.warn to broadcast them to the System Monitor
  if (!globalThis._systemConsoleHooked) {
    globalThis._systemConsoleHooked = true;

    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    const formatArg = (a: any): string => {
      if (a instanceof Error) {
        // Serialize Error with its stack — first 6 lines to keep it readable
        const stackLines = (a.stack ?? '').split('\n').slice(0, 6).join('\n');
        return `${a.name}: ${a.message}${stackLines ? `\n${stackLines}` : ''}`;
      }
      if (typeof a === 'object' && a !== null) {
        return a.message ? String(a.message) : JSON.stringify(a);
      }
      return String(a);
    };

    const formatArgs = (args: any[]) => args.map(formatArg).join(' ');

    const getTime = () => new Date().toTimeString().slice(0, 8);

    console.error = (...args) => {
      originalConsoleError(...args);
      // Avoid infinite loops if something inside the emitter throws
      try {
        const firstError = args.find(a => a instanceof Error);
        systemEvents.emit('log', {
          timestamp: getTime(),
          source: 'GlobalError',
          message: formatArgs(args),
          type: 'error',
          // Attach stack and errorType if a real Error is present in args
          ...(firstError instanceof Error
            ? { stack: firstError.stack ?? '', errorType: firstError.name }
            : {}),
        });
      } catch (e) {
        // Prevent infinite recursion or crashing if emitter throws during error logging
      }
    };

    console.warn = (...args) => {
      originalConsoleWarn(...args);
      try {
        systemEvents.emit('log', {
          timestamp: getTime(),
          source: 'GlobalWarn',
          message: formatArgs(args),
          type: 'warn',
        });
      } catch (e) {
        // Prevent infinite recursion or crashing if emitter throws during warning logging
      }
    };
  }
}
