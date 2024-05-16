import { Action } from "@elgato/streamdeck";
import { StatusAction } from "./actionManager";
import { StationSettings } from "./actions/station-status";

// Valid values for the ListenTo property. This must match
// the list of array property names that come from TrackAudio
// in the kFrequenciesUpdate message.
export type ListenTo = "rx" | "tx" | "xc";

/**
 * A StationStatus action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class StationStatusAction {
  type = "StationStatusAction";
  action: Action;
  frequency = 0;

  private _settings: StationSettings;

  private _isRx = false;
  private _isTx = false;
  private _isListening = false;

  /**
   * Creates a new StationStatusAction object.
   * @param callsign The callsign for the action
   * @param options: The options for the action
   */
  constructor(action: Action, settings: StationSettings) {
    this.action = action;
    this._settings = settings;
  }

  // Getters and setters
  /**
   * Conveinence property to get the listenTo value of settings.
   */
  get listenTo() {
    return this._settings.listenTo ?? "rx";
  }

  /**
   * Convenience property to get the callsign value of settings.
   */
  get callsign() {
    return this._settings.callsign;
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
  set settings(newValue: StationSettings) {
    this._settings = newValue;
  }

  /**
   * True if the station is actively receiveing.
   */
  get isRx() {
    return this._isRx;
  }

  /**
   * Sets the isRx property and updates the action image accordingly.
   */
  set isRx(newValue: boolean) {
    // Don't do anything if the state is the same
    if (this._isRx === newValue) {
      return;
    }

    this._isRx = newValue;
    this.setActiveCommsImage();
  }

  /**
   * True if the station is actively transmitting.
   */
  get isTx() {
    return this._isTx;
  }

  /**
   * Sets the isTx property and updates the action image accordingly.
   */
  set isTx(newValue: boolean) {
    // Don't do anything if the state is the same
    if (this._isTx === newValue) {
      return;
    }

    this._isTx = newValue;
    this.setActiveCommsImage();
  }

  /**
   * True if the station is being listened to.
   */
  get isListening() {
    return this._isListening;
  }

  /**
   * Sets the isListening property and updates the action image accordingly.
   */
  set isListening(newValue: boolean) {
    // Don't do anything if the state is the same
    if (this._isListening === newValue) {
      return;
    }

    this._isListening = newValue;
    this.setListeningImage();
  }

  /**
   * Sets the action image to the correct one for when comms are active,
   * or resets it to the correct isListening image when coms are off.
   */
  public setActiveCommsImage() {
    if (this.isRx || this.isTx) {
      this.action
        .setImage(
          this._settings.activeCommsIconPath ??
            "images/actions/station-status/orange.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    } else {
      this.setListeningImage();
    }
  }

  /**
   * Sets the action image to the correct one given the current isListening value
   */
  public setListeningImage() {
    if (this.isListening) {
      this.action
        .setImage(
          this._settings.listeningIconPath ??
            "images/actions/station-status/green.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    } else {
      this.action
        .setImage(
          this._settings.notListeningIconPath ??
            "images/actions/station-status/black.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    }
  }
}

/**
 * Typeguard for StationStatusAction.
 * @param action The action
 * @returns True if the action is a StationStatusAction
 */
export function isStationStatusAction(
  action: StatusAction
): action is StationStatusAction {
  return action.type === "StationStatusAction";
}
