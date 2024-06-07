import { ListenTo } from "@controllers/stationStatus";

/**
 * Takes a callsign and listenTo and converts it to a display title. If the callsign
 * isn't provided then a default of "Not set" is used. If the ListenTo property is provided
 * then it is appended to the callsign on a new line.
 * @param callsign The callsign
 * @param listenTo The ListenTo setting
 * @returns The display title
 */
export function getDisplayTitle(
  callsign: string | null,
  listenTo: ListenTo | "" | null
) {
  // This can happen when a button is first created. Don't include the listenTo
  // property so the "Not set" text doesn't have an extra \n at the end.
  if (!listenTo) {
    return callsign ?? "Not set";
  }

  return `${callsign ?? "Not set"}\n${listenTo.toUpperCase()}`;
}
