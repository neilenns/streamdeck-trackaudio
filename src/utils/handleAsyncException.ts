import * as logger from "@utils/logger";

export const handleAsyncException = (preamble: string, error: unknown) => {
  const err = error as Error;
  logger.error(`${preamble}${err.message}`);
};
