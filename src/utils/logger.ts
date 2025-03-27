import StreamdeckTransport from "streamdeck-transport";
import winston from "winston";

/**
 * Additional properties for Winston info objects to keep TypeScript happy.
 */
interface TrackAudioLogInfo extends winston.Logform.TransformableInfo {
  service: string;
  message: string;
}

/**
 * Singleton class to manage a Winston logger across the entire plugin.
 */
class Logger {
  private static _instance: Logger | null = null;
  public winston: ReturnType<typeof winston.createLogger>;

  /**
   * Creates a new instance of the Winston logger with Console and StreamdeckTransport
   * transports, configured with a log level set via either NODE_ENV or LOG_LEVEL
   * environment variables at build time.
   */
  private constructor() {
    this.winston = winston.createLogger({
      level: this.level(),
      transports: [
        new winston.transports.Console({ forceConsole: true }),
        new StreamdeckTransport({
          scope: "trackaudio",
          format: winston.format.printf((info) => {
            const customInfo = info as TrackAudioLogInfo;
            return `[${customInfo.service}] ${customInfo.message}`;
          }),
        }),
      ],
    });
  }

  /**
   * Determines the log level based on either the LOG_LEVEL or NODE_ENV environment
   * variables. These environment variables are set at *build* time, not at runtime,
   * using the @rollup/plugin-replace step in rollup.config.mjs.
   * @returns The log level.
   */
  private level() {
    if (process.env.LOG_LEVEL !== undefined) {
      return process.env.LOG_LEVEL;
    }

    return process.env.NODE_ENV === "development" ? "debug" : "warn";
  }

  /**
   * Provides access to the Logger instance.
   * @returns The instance of Logger
   */
  public static getInstance(): Logger {
    Logger._instance ??= new Logger();
    return Logger._instance;
  }
}

const loggerInstance = Logger.getInstance();
export default loggerInstance.winston;
