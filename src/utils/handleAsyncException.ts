import mainLogger from "@utils/logger";

const logger = mainLogger.child({ service: "system" });

export const handleAsyncException = (preamble: string, error: unknown) => {
  const err = error as Error;
  logger.error(`${preamble}${err.message}`);
};
