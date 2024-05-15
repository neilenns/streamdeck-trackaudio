import { Action } from "@elgato/streamdeck";
import { StatusAction } from "./actionManager";

/**
 * A TrackAudioStatusAction action, for use with ActionManager. Tracks the
 * state and StreamDeck action for an individual action in a profile.
 */
export class TrackAudioStatusAction {
  type = "trackAudioStatusAction";
  action: Action;
  isConnected = false;

  /**
   * Creates a new TrackAudioStatusAction.
   * @param action The StreamDeck action object
   */
  constructor(action: Action) {
    this.action = action;
  }
}

/**
 * Typeguard for TrackAudioStatusAction.
 * @param action The action
 * @returns True if the action is a TrackAudioStatusAction
 */
export function isTrackAudioStatusAction(
  action: StatusAction
): action is TrackAudioStatusAction {
  return action.type === "trackAudioStatusAction";
}
