import { StationSettings } from "@actions/stationStatus";
import { Action } from "@elgato/streamdeck";
import { getDisplayTitle } from "@helpers/helpers";
import { Controller } from "@interfaces/controller";

// Valid values for the ListenTo property. This must match
// the list of array property names that come from TrackAudio
// in the kFrequenciesUpdate message.
export type ListenTo = "rx" | "tx" | "xc" | "xca";

/**
 * A StationStatus action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class StationStatusController implements Controller {
  type = "StationStatusController";
  action: Action;
  frequency = 0;

  private _settings: StationSettings;

  private _isReceiving = false;
  private _isTransmitting = false;
  private _isListening = false;

  private _lastReceivedcallsign?: string;

  /**
   * Creates a new StationStatusController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
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
  get isReceiving() {
    return this._isReceiving;
  }

  /**
   * Sets the isReceiving property and updates the action image accordingly.
   */
  set isReceiving(newValue: boolean) {
    // Don't do anything if the state is the same
    if (this._isReceiving === newValue) {
      return;
    }

    this._isReceiving = newValue;
    this.setActiveCommsImage();
  }

  /**
   * True if the station is actively transmitting.
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

    if (!this._isListening) {
      this.lastReceivedCallsign = undefined;
    }

    this.setListeningImage();
  }

  /**
   * Returns the last received callsign or undefined if no last received callsign is available.
   */
  get lastReceivedCallsign(): string | undefined {
    return this._lastReceivedcallsign;
  }

  /**
   * Sets the last received callsign property and updates the action title accordingly.
   */
  set lastReceivedCallsign(callsign: string | undefined) {
    this._lastReceivedcallsign = callsign;

    const baseTitle = getDisplayTitle(this.callsign, this.listenTo);

    if (this.lastReceivedCallsign) {
      this.action
        .setTitle(`${baseTitle}\n\n${this.lastReceivedCallsign}`)
        .catch((error: unknown) => {
          const err = error as Error;
          console.error(`Unable to set action title: ${err.message}`);
        });
    } else {
      this.action.setTitle(baseTitle).catch((error: unknown) => {
        const err = error as Error;
        console.error(`Unable to set action title: ${err.message}`);
      });
    }
  }

  /**
   * Resets the action to the initial display state: no last received callsign
   * and no active coms image.
   */
  public reset() {
    this.lastReceivedCallsign = undefined; // This automatically updates the title

    this.isReceiving = false;
    this.isTransmitting = false;
    this.setActiveCommsImage();
  }

  /**
   * Sets the action image to the correct one for when comms are active,
   * or resets it to the correct isListening image when coms are off.
   */
  public setActiveCommsImage() {
    if (this.isReceiving || this.isTransmitting) {
      this.action
        .setImage(
          this._settings.activeCommsIconPath ??
            "images/actions/stationStatus/orange.svg"
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
            "images/actions/stationStatus/green.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    } else {
      this.action
        .setImage(
          this._settings.notListeningIconPath ??
            "images/actions/stationStatus/black.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    }
  }
}

/**
 * Typeguard for StationStatusController.
 * @param action The action
 * @returns True if the action is a StationStatusController
 */
export function isStationStatusController(
  action: Controller
): action is StationStatusController {
  return action.type === "StationStatusController";
}
