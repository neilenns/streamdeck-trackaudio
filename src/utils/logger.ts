type LogLevel = "log" | "error" | "warn" | "info" | "debug";
type LogFunction = (...args: unknown[]) => void;

const isDevelopment: boolean = process.env.NODE_ENV === "development";

const createLogger = (method: LogLevel): LogFunction => {
  return (...args: unknown[]): void => {
    if (isDevelopment && method === "debug") {
      console[method](...args);
    }
  };
};

export const log = createLogger("log");
export const error = createLogger("error");
export const warn = createLogger("warn");
export const info = createLogger("info");
export const debug = createLogger("debug");
