import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";

/**
 * A PushToTalkController action, for use with ActionManager. Tracks the
 * state and StreamDeck action for an individual action in a profile.
 */
export class PushToTalkController implements Controller {
  type = "PushToTalkController";
  action: Action;

  private _isTransmitting = false;

  /**
   * Creates a new PushToTalkController object.
   * @param action The callsign for the action
   */
  constructor(action: Action) {
    this.action = action;
  }

  /**
   * Resets the action to its default, disconnected, state.
   */
  public reset() {
    this.isTransmitting = false;
  }

  /**
   * True if push-to-talk is actively transmitting.
   */
  get isTransmitting() {
    return this._isTransmitting;
  }

  /**
   * Sets the isTransmitting property and updates the action image accordingly.
   */
  set isTransmitting(newValue: boolean) {
    // Don't do anything if the state is the same
    if (this._isTransmitting === newValue) {
      return;
    }

    this._isTransmitting = newValue;
    this.setState();
  }

  /**
   * Sets the action image to the correct one for when comms are active.
   */
  public setState() {
    this.action
      .setState(this.isTransmitting ? 1 : 0)
      .catch((error: unknown) => {
        console.error(error);
      });
  }
}

/*
 * Typeguard for PushToTalkController.
 * @param action The action
 * @returns True if the action is a PushToTalkController
 */
export function isPushToTalkController(
  action: Controller
): action is PushToTalkController {
  return action.type === "PushToTalkController";
}
