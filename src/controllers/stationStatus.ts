import { StationSettings } from "@actions/stationStatus";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import TitleBuilder from "@root/utils/titleBuilder";
import { BaseController } from "./baseController";
import { stringOrUndefined } from "@root/utils/utils";
import svgManager from "@managers/svg";

// Valid values for the ListenTo property. This must match
// the list of array property names that come from TrackAudio
// in the kFrequenciesUpdate message.
export type ListenTo = "rx" | "tx" | "xc" | "xca";

const StateColor = {
  NOT_LISTENING: "black",
  LISTENING: "#060",
  ACTIVE_COMMS: "#f60",
};

const defaultTemplatePath = "images/actions/stationStatus/template.svg";
const defaultUnavailableTemplatePath =
  "images/actions/stationStatus/unavailable.svg";
/**
 * A StationStatus action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class StationStatusController extends BaseController {
  type = "StationStatusController";

  private _settings!: StationSettings;
  private _frequency = 0;
  private _isReceiving = false;
  private _isTransmitting = false;
  private _isListening = false;
  private _isAvailable: boolean | undefined = undefined;
  private _lastReceivedCallsign?: string;

  private _notListeningImagePath?: string;
  private _listeningImagePath?: string;
  private _activeCommsImagePath?: string;
  private _unavailableImagePath?: string;

  /**
   * Creates a new StationStatusController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: Action, settings: StationSettings) {
    super(action);
    this.action = action;
    this.settings = settings;

    // Issue 171: The listenTo property doesn't get set unless the user actually
    // changes the radio button. Default is "rx" so force it here to avoid problems
    // elsewhere.
    if (!this._settings.listenTo) {
      this._settings.listenTo = "rx";
    }

    this.refreshTitle();
    this.refreshImage();
  }

  //#region Getters and setters
  /**
   * Returns the notListeningImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get notListeningImagePath(): string {
    return this._notListeningImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the notListeningImagePath and re-compiles the SVG template if necessary.
   */
  set notListeningImagePath(newValue: string | undefined) {
    this._notListeningImagePath = stringOrUndefined(newValue);
    svgManager.addTemplate(this.notListeningImagePath);
  }

  /**
   * Returns the listeningImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get listeningImagePath(): string {
    return this._listeningImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the listeningImagePath and re-compiles the SVG template if necessary.
   */
  set listeningImagePath(newValue: string | undefined) {
    this._listeningImagePath = stringOrUndefined(newValue);
    svgManager.addTemplate(this.listeningImagePath);
  }

  /**
   * Returns the activeCommsImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get activeCommsImagePath(): string {
    return this._activeCommsImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the activeCommsImagePath and re-compiles the SVG template if necessary.
   */
  set activeCommsImagePath(newValue: string | undefined) {
    this._activeCommsImagePath = stringOrUndefined(newValue);
    svgManager.addTemplate(this.activeCommsImagePath);
  }

  /**
   * Returns the unavailableImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get unavailableImagePath(): string {
    return this._unavailableImagePath ?? defaultUnavailableTemplatePath;
  }

  /**
   * Sets the unavailableImagePath and re-compiles the SVG template if necessary.
   */
  set unavailableImagePath(newValue: string | undefined) {
    this._unavailableImagePath = stringOrUndefined(newValue);
    svgManager.addTemplate(this.unavailableImagePath);
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
   * Returns the frequency formated for display. A value of 121900000
   * will be returned as "121.900". If the frequency is undefined or 0
   * then an empty string is returned.
   */
  get formattedFrequency() {
    if (this.frequency) {
      return (this.frequency / 1000000).toFixed(3);
    } else {
      return "";
    }
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
   * Returns the title specified by the user in the property inspector.
   */
  get title() {
    return this._settings.title;
  }

  /**
   * Returns the showTitle setting, or true if undefined.
   */
  get showTitle() {
    return this._settings.showTitle ?? true;
  }

  /**
   * Returns the showCallsign setting, or false if undefined.
   */
  get showCallsign() {
    return this._settings.showCallsign ?? false;
  }

  /**
   * Returns the showListenTo setting, or false if undefined
   */
  get showListenTo() {
    return this._settings.showListenTo ?? false;
  }

  /**
   * Returns the showFrequency setting, or false if undefined
   */
  get showFrequency() {
    return this._settings.showFrequency ?? false;
  }

  /**
   * Returns the showLastReceivedCallsign setting, or true if undefined
   */
  get showLastReceivedCallsign() {
    return this._settings.showLastReceivedCallsign ?? true;
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

    this.activeCommsImagePath = newValue.activeCommsImagePath;
    this.listeningImagePath = newValue.listeningImagePath;
    this.notListeningImagePath = newValue.notListeningImagePath;
    this.unavailableImagePath = newValue.unavailableImagePath;

    this.refreshTitle();
    this.refreshImage();
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
    this.refreshImage();
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
    this.refreshImage();
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
    this.refreshImage();
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
    this.refreshImage();
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

    this.refreshTitle();
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

    this.refreshTitle();
    this.refreshImage();
  }

  /**
   * Sets the action image to the correct one given the current isReceiving, isTransmitting, isAvailable and
   * isListening value.
   */
  public refreshImage() {
    const replacements = {
      title: this.title,
      callsign: this.callsign,
      frequency: this.frequency,
      formattedFrequency: this.formattedFrequency,
      listenTo: this.listenTo.toUpperCase(),
      lastReceivedCallsign: this.lastReceivedCallsign,
    };

    if (this.isAvailable !== undefined && !this.isAvailable) {
      this.setImage(this.unavailableImagePath, {
        ...replacements,
        stateColor: StateColor.ACTIVE_COMMS,
      });
      return;
    }

    if (this.isReceiving || this.isTransmitting) {
      this.setImage(this.activeCommsImagePath, {
        ...replacements,
        stateColor: StateColor.ACTIVE_COMMS,
      });
      return;
    }

    if (this.isListening) {
      this.setImage(this.listeningImagePath, {
        ...replacements,
        stateColor: StateColor.LISTENING,
      });
      return;
    }

    this.setImage(this.notListeningImagePath, {
      ...replacements,
      stateColor: StateColor.NOT_LISTENING,
    });
  }

  /**
   * Shows the title on the action. Appends the last received callsign to
   * the base title if it exists, showLastReceivedCallsign is enabled in settings,
   * and the action is listening to RX.
   */
  public refreshTitle() {
    const title = new TitleBuilder();

    title.push(this.title, this.showTitle);
    title.push(this.callsign, this.showCallsign);
    title.push(this.formattedFrequency, this.showFrequency);
    title.push(this.listenTo.toUpperCase(), this.showListenTo);
    title.push(this.lastReceivedCallsign, this.showLastReceivedCallsign);

    this.setTitle(title.join("\n"));
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
