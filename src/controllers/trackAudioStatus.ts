import { TrackAudioStatusSettings } from "@actions/trackAudioStatus";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { BaseController } from "./baseController";

/**
 * A TrackAudioStatusController action, for use with ActionManager. Tracks the
 * state and StreamDeck action for an individual action in a profile.
 */
export class TrackAudioStatusController extends BaseController {
  type = "TrackAudioStatusController";

  private _isConnected = false;
  private _isVoiceConnected = false;
  private _settings: TrackAudioStatusSettings;

  /**
   * Creates a new TrackAudioStatusController.
   * @param action The StreamDeck action object
   */
  constructor(action: Action, settings: TrackAudioStatusSettings) {
    super(action);
    this._settings = settings;

    this.refreshImage();
  }

  public reset() {
    this.isConnected = false;
    this.isVoiceConnected = false;
  }

  /**
   * Gets the settings.
   */
  get settings() {
    return this._settings;
  }

  /**
   * Sets the settings.
   */
  set settings(newValue: TrackAudioStatusSettings) {
    this._settings = newValue;

    this.refreshImage();
  }

  /**
   * Returns true when the voice connected state is displayed.
   */
  get isVoiceConnected() {
    return this._isVoiceConnected;
  }

  /**
   * Sets the isConnected state
   */
  set isVoiceConnected(newValue: boolean) {
    // Don't do anything if the state is the same
    if (this._isVoiceConnected === newValue) {
      return;
    }

    this._isVoiceConnected = newValue;

    this.refreshImage();
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

    if (!newValue) {
      this._isVoiceConnected = false;
    }

    this.refreshImage();
  }

  /**
   * Sets the action image based on the isConnected state
   */
  public refreshImage() {
    if (this.isVoiceConnected) {
      this.action
        .setImage(
          this._settings.voiceConnectedIconPath ??
            "images/actions/trackAudioStatus/voiceConnected.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    } else if (this.isConnected) {
      this.action
        .setImage(
          this._settings.connectedIconPath ??
            "images/actions/trackAudioStatus/connected.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    } else {
      this.action
        .setImage(
          this._settings.connectedIconPath ??
            "images/actions/trackAudioStatus/notConnected.svg"
        )
        .catch((error: unknown) => {
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
