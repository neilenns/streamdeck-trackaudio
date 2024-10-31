/**
 * Helper for building Stream Deck action titles.
 */
export default class TitleBuilder {
  private parts: string[] = [];

  /**
   * Pushes a title part into the list. If the part is null, undefined, or the
   * empty string it will no be pushed. If isEnabled is false it will not be pushed.
   * @param part The part to push
   * @param isEnabled True if the display of the part is enabled
   */
  public push(part: string | undefined, isEnabled = true): void {
    if (part && isEnabled) {
      this.parts.push(part);
    }
  }

  /**
   * Joins the title parts with the specified separator.
   * @param separator The string to use to separate the joined parts
   * @returns A string with the parts joined by the separator
   */
  public join(separator: string): string {
    return this.parts.join(separator);
  }
}
