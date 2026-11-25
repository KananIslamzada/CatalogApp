export type ErrorContext = Record<string, string | number | boolean | undefined>;

export type ErrorReporter = {
  captureException: (error: unknown, context?: ErrorContext) => void;
  captureMessage: (message: string, context?: ErrorContext) => void;
  setUser: (user: { id: number } | null) => void;
};

const consoleReporter: ErrorReporter = {
  captureException: (error, context) => console.warn('[error]', error, context ?? ''),
  captureMessage: (message, context) => console.warn('[message]', message, context ?? ''),
  setUser: () => undefined,
};

let activeReporter: ErrorReporter = consoleReporter;

export function setErrorReporter(reporter: ErrorReporter): void {
  activeReporter = reporter;
}

export const errorReporter: ErrorReporter = {
  captureException: (error, context) => activeReporter.captureException(error, context),
  captureMessage: (message, context) => activeReporter.captureMessage(message, context),
  setUser: (user) => activeReporter.setUser(user),
};

export function installGlobalErrorHandler(): void {
  const previous = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    errorReporter.captureException(error, { fatal: !!isFatal, source: 'global' });
    previous(error, isFatal);
  });
}
