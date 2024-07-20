export const handleAsyncException = (preamble: string, error: unknown) => {
  const err = error as Error;
  console.error(`${preamble}${err.message}`);
};
