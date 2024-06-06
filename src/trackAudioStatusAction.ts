import { Action } from "@elgato/streamdeck";
import { StatusAction } from "./actionManager";

/**
 * A TrackAudioStatusAction action, for use with ActionManager. Tracks the
 * state and StreamDeck action for an individual action in a profile.
 */
export class TrackAudioStatusAction {
  type = "trackAudioStatusAction";
  action: Action;

  private _isConnected = false;

  /**
   * Creates a new TrackAudioStatusAction.
   * @param action The StreamDeck action object
   */
  constructor(action: Action) {
    this.action = action;
  }

  /**
   * Returns true when the connected state is displayed.
   */
  get isConnected() {
    return this._isConnected;
  }

  /**
   * Sets the isConnected state
   */
  set isConnected(newValue: boolean) {
    // Don't do anything if the state is the same
    if (this._isConnected === newValue) {
      return;
    }

    this._isConnected = newValue;
    this.setConnectedImage();
  }

  /**
   * Sets the action image based on the isConnected state
   */
  public setConnectedImage() {
    if (this.isConnected) {
      this.action.setState(1).catch((error: unknown) => {
        console.error(error);
      });
    } else {
      this.action.setState(0).catch((error: unknown) => {
        console.error(error);
      });
    }
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
