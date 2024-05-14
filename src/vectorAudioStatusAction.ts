import { Action } from "@elgato/streamdeck";
import { StatusAction } from "./actionManager";

export class VectorAudioStatusAction {
  type = "vectorAudioStatusAction";
  action: Action;
  isConnected: boolean = false;

  /**
   *
   * @param callsign The callsign for the action
   * @param listenTo The type of listening requested, either rx, tx, or xc
   * @param notListeningIconPath The path to the icon file for the not listening state, or undefined to use the default
   * @param listeningIconPath The path to the icon file for the listening state, or undefined to use the default
   * @param activeCommsIconPath The path to the icon file for the active comms state, or undefined to use the default
   * @param action The StreamDeck action object
   */
  constructor(action: Action) {
    this.action = action;
  }
}

export function isVectorAudioStatusAction(
  action: StatusAction
): action is VectorAudioStatusAction {
  return action.type === "vectorAudioStatusAction";
}
