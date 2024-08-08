// A lot of this was inspired by https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/
import winston from "winston";
import StreamdeckTransport from "streamdeck-transport";

const Logger = winston.createLogger({
  level: "debug",
  transports: [
    new winston.transports.Console({ forceConsole: true }),
    new StreamdeckTransport({ scope: "trackaudio" }),
  ],
});

export default Logger;
