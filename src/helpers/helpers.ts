import ActionManager from "../actionManager";
import { ListenTo } from "../stationStatusAction";
import {
  RxBegin,
  RxEnd,
  TxBegin,
  TxEnd,
  isRxBegin,
  isTxBegin,
} from "../types/messages";

/**
 * Updates the rx state for all actions that are tracking the receiveing frequency.
 * @param data The data from TrackAudio
 */
export const updateRxState = (data: RxBegin | RxEnd) => {
  const actionManager = ActionManager.getInstance();

  if (isRxBegin(data)) {
    console.log(`Receive started on: ${data.value.pFrequencyHz.toString()}`);
    actionManager.rxBegin(data.value.pFrequencyHz);
  } else {
    console.log(`Receive ended on: ${data.value.pFrequencyHz.toString()}`);
    actionManager.rxEnd(data.value.pFrequencyHz);
  }
};

/**
 * Updates the tx state for all actions that are tracking the transmitting frequency.
 * @param data The data from TrackAudio
 */
export const updateTxState = (data: TxBegin | TxEnd) => {
  const actionManager = ActionManager.getInstance();

  if (isTxBegin(data)) {
    actionManager.txBegin();
  } else {
    actionManager.txEnd();
  }
};

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
