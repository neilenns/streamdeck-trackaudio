import { ListenTo } from "../stationStatusAction";

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
