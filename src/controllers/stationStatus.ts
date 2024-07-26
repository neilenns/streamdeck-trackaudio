import { StationSettings } from "@actions/stationStatus";
import { Action } from "@elgato/streamdeck";
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

  private _settings: StationSettings;
  private _frequency = 0;
  private _isReceiving = false;
  private _isTransmitting = false;
  private _isListening = false;
  private _isAvailable: boolean | undefined = undefined;
  private _lastReceivedCallsign?: string;

  /**
   * Creates a new StationStatusController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: Action, settings: StationSettings) {
    this.action = action;
    this._settings = settings;

    // Issue 171: The listenTo property doesn't get set unless the user actually
    // changes the radio button. Default is "rx" so force it here to avoid problems
    // elsewhere.
    if (!this._settings.listenTo) {
      this._settings.listenTo = "rx";
    }

    this.showTitle();
  }

  //#region Getters and setters
  /**
   * Convenience property to get the showLastReceivedCallsign value of settings.
   */
  get showLastReceivedCallsign() {
    return this._settings.showLastReceivedCallsign;
  }

  /**
   * Gets the frequency.
   */
  get frequency() {
    return this._frequency;
  }

  /**
   * Sets the frequency. If the frequency is non-zero then isAvailable is also set to true.
   */
  set frequency(newValue: number) {
    // This is always done even if the new value is the same as the existing one
    // to ensure isAvailable refreshes.
    this._frequency = newValue;
    this.isAvailable = this.frequency !== 0;
  }

  /**
   * Conveinence property to get the listenTo value of settings.
   */
  get listenTo() {
    return this._settings.listenTo ?? "rx";
  }

  /**
   * Returns true if listenTo is rx, xc, or xca, the settings that mean
   * rx is active in TrackAudio.
   */
  get isListeningForReceive() {
    return (
      this.listenTo === "rx" ||
      this.listenTo === "xc" ||
      this.listenTo === "xca"
    );
  }

  /**
   * Returns true if listenTo is tx, xc or xca, the settings that mean
   * tx is active in TrackAudio.
   */
  get isListeningForTransmit() {
    return (
      this.listenTo === "tx" ||
      this.listenTo === "xc" ||
      this.listenTo === "xca"
    );
  }

  /**
   * Convenience property to get the callsign value of settings.
   */
  get callsign() {
    return this._settings.callsign;
  }

  /**
   * Returns the title specified by the user in the property inspector,
   * or the default title if no user title was specified.
   */
  get title() {
    if (this._settings.title !== undefined && this._settings.title !== "") {
      return this._settings.title;
    } else {
      return `${this.callsign ?? "Not set"}\n${this.listenTo.toUpperCase()}`;
    }
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

    this.showTitle();
    this.setState();
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
    this.setState();
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
    this.setState();
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
    this.setState();
  }

  /**
   * True if the station is available in TrackAudio.
   */
  get isAvailable(): boolean | undefined {
    return this._isAvailable;
  }

  /**
   * Sets the isAvailable property and updates the action image accordingly.
   */
  set isAvailable(newValue: boolean) {
    if (this._isAvailable === newValue) {
      return;
    }

    this._isAvailable = newValue;
    this.setState();
  }

  /**
   * Returns the last received callsign or undefined if no last received callsign is available.
   */
  get lastReceivedCallsign(): string | undefined {
    return this._lastReceivedCallsign;
  }

  /**
   * Sets the last received callsign property and updates the action title accordingly.
   */
  set lastReceivedCallsign(callsign: string | undefined) {
    this._lastReceivedCallsign = callsign;

    this.showTitle();
  }
  //#endregion

  /**
   * Resets the action to the initial display state: no last received callsign
   * and no active coms image.
   */
  public reset() {
    this._lastReceivedCallsign = undefined;

    this._frequency = 0;
    this._isListening = false;
    this._isReceiving = false;
    this._isTransmitting = false;
    this._isAvailable = undefined;

    this.setState();
    this.showTitle();
  }

  /**
   * Sets the action image to the correct one given the current isReceiving, isTransmitting, isAvailable and
   * isListening value.
   */
  public setState() {
    if (this.isAvailable !== undefined && !this.isAvailable) {
      this.action
        .setImage(
          this._settings.unavailableIconPath ??
            "images/actions/stationStatus/unavailable.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });

      return;
    }

    if (this.isReceiving || this.isTransmitting) {
      this.action
        .setImage(
          this._settings.activeCommsIconPath ??
            "images/actions/stationStatus/orange.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });

      return;
    }

    if (this.isListening) {
      this.action
        .setImage(
          this._settings.listeningIconPath ??
            "images/actions/stationStatus/green.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });

      return;
    }

    this.action
      .setImage(
        this._settings.notListeningIconPath ??
          "images/actions/stationStatus/black.svg"
      )
      .catch((error: unknown) => {
        console.error(error);
      });
  }

  /**
   * Shows the title on the action. Appends the last received callsign to
   * the base title if it exists, showLastReceivedCallsign is enabled in settings,
   * and the action is listening to RX.
   */
  public showTitle() {
    if (
      this.lastReceivedCallsign &&
      this.showLastReceivedCallsign &&
      this.isListeningForReceive
    ) {
      this.action
        .setTitle(`${this.title}\n${this.lastReceivedCallsign}`)
        .catch((error: unknown) => {
          const err = error as Error;
          console.error(`Unable to set action title: ${err.message}`);
        });
    } else {
      this.action.setTitle(this.title).catch((error: unknown) => {
        const err = error as Error;
        console.error(`Unable to set action title: ${err.message}`);
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
