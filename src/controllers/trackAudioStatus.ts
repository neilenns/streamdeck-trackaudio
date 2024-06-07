import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";

/**
 * A TrackAudioStatusController action, for use with ActionManager. Tracks the
 * state and StreamDeck action for an individual action in a profile.
 */
export class TrackAudioStatusController {
  type = "TrackAudioStatusController";
  action: Action;

  private _isConnected = false;

  /**
   * Creates a new TrackAudioStatusController.
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
 * Typeguard for TrackAudioStatusController.
 * @param action The action
 * @returns True if the action is a TrackAudioStatusController
 */
export function isTrackAudioStatusController(
  action: Controller
): action is TrackAudioStatusController {
  return action.type === "TrackAudioStatusController";
}
