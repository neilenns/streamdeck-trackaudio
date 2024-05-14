import { Action } from "@elgato/streamdeck";
import { StatusAction } from "./actionManager";

export class TrackAudioStatusAction {
  type = "trackAudioStatusAction";
  action: Action;
  isConnected: boolean = false;

  /**
   * Creates a new TrackAudioStatusAction
   * @param action The StreamDeck action object
   */
  constructor(action: Action) {
    this.action = action;
  }
}

export function isTrackAudioStatusAction(
  action: StatusAction
): action is TrackAudioStatusAction {
  return action.type === "trackAudioStatusAction";
}
