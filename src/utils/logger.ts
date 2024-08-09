// A lot of this was inspired by https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/
import winston from "winston";
import StreamdeckTransport from "streamdeck-transport";

class Logger {
  private static _instance: Logger | null = null;
  public winston: ReturnType<typeof winston.createLogger>;

  private constructor() {
    this.winston = winston.createLogger({
      level: "debug",
      transports: [
        new winston.transports.Console({ forceConsole: true }),
        new StreamdeckTransport({ scope: "trackaudio", level: "error" }),
      ],
    });
  }

  /**
   * Provides access to the Logger instance.
   * @returns The instance of Logger
   */
  public static getInstance(): Logger {
    if (!Logger._instance) {
      Logger._instance = new Logger();
    }
    return Logger._instance;
  }
}

const loggerInstance = Logger.getInstance();
export default loggerInstance.winston;
