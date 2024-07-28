/**
 * Converts empty, null, or undefined strings to undefined
 * @param value The string
 * @returns The string if it has content, otherwise undefined.
 */
export const stringOrUndefined = (value: string | undefined) => {
  if (!value || value.trim() === "") {
    return undefined;
  }

  return value;
};
