import { StationSettings } from "@actions/stationStatus";
import { KeyAction } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import TitleBuilder from "@root/utils/titleBuilder";
import { stringOrUndefined } from "@root/utils/utils";
import { STATION_STATUS_CONTROLLER_TYPE } from "@utils/controllerTypes";
import mainLogger from "@utils/logger";
import debounce from "debounce";
import { LRUCache } from "lru-cache";
import { BaseController } from "./baseController";

// Valid values for the ListenTo property. This must match
// the list of array property names that come from TrackAudio
// in the kFrequenciesUpdate message.
export type ListenTo = "rx" | "tx" | "xc" | "xca";

const logger = mainLogger.child({ service: "stationStatus" });

const defaultTemplatePath = "images/actions/stationStatus/template.svg";

/**
 * A StationStatus action, for use with ActionManager. Tracks the settings,
 * state and Stream Deck action for an individual action in a profile.
 */
export class StationStatusController extends BaseController {
  type = STATION_STATUS_CONTROLLER_TYPE;

  private _frequency = 0;
  private _isAvailable: boolean | undefined = undefined;
  private _isListening = false;
  private _isOutputMuted? = false;
  private _isReceiving = false;
  private _isTransmitting = false;
  private _outputVolume? = 100;
  private _settings: StationSettings | null = null;

  // This gets initialized in the settings setter so it can be re-created if the
  // number of callsigns to track changes.
  private _lastReceivedCallsignHistory: LRUCache<string, string> | undefined;
  private _lastReceivedCallsign: string | undefined = undefined;

  private _mutedImagePath?: string;
  private _activeCommsImagePath?: string;
  private _blockedCommsImagePath?: string;
  private _listeningImagePath?: string;
  private _notListeningImagePath?: string;
  private _unavailableImagePath?: string;

  /**
   * Creates a new StationStatusController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: KeyAction, settings: StationSettings) {
    super(action);

    this.action = action;
    this.settings = settings;
  }

  /**
   * Refreshes the title and image on the action.
   */
  public override refreshDisplay = debounce(() => {
    logger.debug(`Refreshing display for ${this.callsign ?? ""}`);
    this.refreshTitle();
    this.refreshImage();
  }, 100);

  //#region Getters and setters
  /**
   * Returns the mutedImagePath or the default template path if the if
   * the user didn't specify a custom icon.
   */
  get mutedImagePath(): string {
    return this._mutedImagePath ?? defaultTemplatePath;
  }

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
  }

  /**
   * Returns the blockingImagePath or the default blocking image path if the
   * user didn't specify a custom icon.
   */
  get blockedCommsImagePath(): string {
    return this._blockedCommsImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the activeCommsImagePath and re-compiles the SVG template if necessary.
   */
  set blockedCommsImagePath(newValue: string | undefined) {
    this._blockedCommsImagePath = stringOrUndefined(newValue);
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
  }

  /**
   * Returns the unavailableImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get unavailableImagePath(): string {
    return this._unavailableImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the unavailableImagePath and re-compiles the SVG template if necessary.
   */
  set unavailableImagePath(newValue: string | undefined) {
    this._unavailableImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets whether the output is muted. Returns false if undefined.
   */
  get isOutputMuted(): boolean {
    return this._isOutputMuted ?? false;
  }

  /**
   * Sets whether the output is muted.
   */
  set isOutputMuted(newValue: boolean | undefined) {
    if (this._isOutputMuted === newValue) {
      return;
    }

    this._isOutputMuted = newValue;
    this.refreshDisplay();
  }

  /**
   * Gets the output volume. Returns 100 if undefined.
   **/
  get outputVolume(): number {
    return this._outputVolume ?? 100;
  }

  /**
   * Sets the output volume.
   **/
  set outputVolume(newValue: number | undefined) {
    if (this._outputVolume === newValue) {
      return;
    }

    this._outputVolume = newValue;
    this.refreshDisplay();
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

    // The frequency doesn't come from settings like the other displayed properties and could cause a
    // change in the display of the action.
    this.refreshDisplay();
  }

  /**
   * Returns the frequency formatted for display. A value of 121900000
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
   * Convenience property to get the listenTo value of settings.
   */
  get listenTo() {
    return this.settings.listenTo ?? "rx";
  }

  /**
   * Convenience property to get the toggleMuteIfPressed value of settings. Defaults to false.
   */
  get toggleMuteOnPress() {
    return this.settings.toggleMuteOnPress ?? false;
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
   * tx is active in TrackAudio, and the station in TrackAudio is listening.
   */
  get isListeningForTransmit() {
    return (
      (this.listenTo === "tx" ||
        this.listenTo === "xc" ||
        this.listenTo === "xca") &&
      this.isListening
    );
  }

  /**
   * Convenience property to get the callsign value of settings.
   */
  get callsign() {
    return this.settings.callsign;
  }

  /**
   * Returns the title specified by the user in the property inspector.
   */
  get title() {
    return this.settings.title;
  }

  /**
   * Returns the autoSetSpk setting, or false if undefined.
   */
  get autoSetSpk() {
    return this.settings.autoSetSpk ?? false;
  }

  /**
   * Returns the autoSetRx setting, or false if undefined.
   */
  get autoSetRx() {
    return this.settings.autoSetRx ?? false;
  }

  /**
   * Returns the showTitle setting, or true if undefined.
   */
  get showTitle() {
    return this.settings.showTitle ?? true;
  }

  /**
   * Returns the showCallsign setting, or false if undefined.
   */
  get showCallsign() {
    return this.settings.showCallsign ?? false;
  }

  /**
   * Returns the showListenTo setting, or false if undefined
   */
  get showListenTo() {
    return this.settings.showListenTo ?? false;
  }

  /**
   * Returns the showFrequency setting, or false if undefined
   */
  get showFrequency() {
    return this.settings.showFrequency ?? false;
  }

  /**
   * Returns true if the number of last received callsigns to display is greater than 0
   */
  get showLastReceivedCallsign() {
    return (this.settings.lastReceivedCallsignCount ?? 0) > 0;
  }

  /**
   * Returns the number of minutes to clear callsigns after, or three if it wasn't defined
   * by the user in settings.
   */
  get clearAfterInMinutes() {
    return this.settings.clearAfterInMinutes ?? 3;
  }

  /**
   * Gets the settings.
   */
  get settings() {
    if (this._settings === null) {
      throw new Error("Settings not initialized. This should never happen.");
    }

    return this._settings;
  }

  /**
   * Sets the settings.
   */
  set settings(newValue: StationSettings) {
    // Issue 183: Clear the frequency if the callsign changes.
    if (this._settings && this._settings.callsign !== newValue.callsign) {
      this.frequency = 0;
    }

    this._settings = newValue;

    // Recreate the last received callsign cache with the new length and TTL
    if ((this._settings.lastReceivedCallsignCount ?? 0) > 0) {
      this._lastReceivedCallsignHistory = new LRUCache<string, string>({
        max: this._settings.lastReceivedCallsignCount,
        ttl: this.clearAfterInMinutes * 60 * 1000, // Convert minutes to milliseconds. If this is zero it automatically disables TTL.
        ttlAutopurge: true,
        allowStale: false,
        disposeAfter: (
          key: string,
          value: string,
          reason: LRUCache.DisposeReason
        ) => {
          this.handleDisposeAfter(key, value, reason);
        },
      });
    } else {
      this._lastReceivedCallsignHistory = undefined;
    }

    this.activeCommsImagePath = newValue.activeCommsImagePath;
    this.blockedCommsImagePath = newValue.blockedCommsImagePath;
    this.listeningImagePath = newValue.listeningImagePath;
    this.notListeningImagePath = newValue.notListeningImagePath;
    this.unavailableImagePath = newValue.unavailableImagePath;

    this.refreshDisplay();
  }

  /**
   * True if the station is actively receiving.
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
    this.refreshDisplay();
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
    this.refreshDisplay();
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
    this.refreshDisplay();
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
  set isAvailable(newValue: boolean | undefined) {
    if (this._isAvailable === newValue) {
      return;
    }

    this._isAvailable = newValue;
    this.refreshDisplay();
  }

  /**
   * Sets the last received callsign property and updates the action title accordingly.
   */
  set lastReceivedCallsign(callsign: string | undefined) {
    this._lastReceivedCallsign = callsign;

    if (callsign) {
      this._lastReceivedCallsignHistory?.set(callsign, callsign);
    } else {
      this._lastReceivedCallsignHistory?.clear();
    }

    this.refreshDisplay();
  }

  /**
   * Returns the last received callsign.
   */
  get lastReceivedCallsign() {
    return this._lastReceivedCallsign;
  }

  /**
   * Returns an array of received callsigns, up to the length specified by the user in the
   * action's settings.
   */
  get lastReceivedCallsignHistory() {
    const entries = this._lastReceivedCallsignHistory
      ? [...this._lastReceivedCallsignHistory.values()]
      : [];
    return entries;
  }
  //#endregion

  /**
   * Refreshes the display if a cached callsign expired and the last callsign
   * is being displayed.
   * @param key The key being disposed
   * @param value The value being disposed
   * @param reason The reason for the disposal
   */
  private handleDisposeAfter(
    key: string,
    value: string,
    reason: LRUCache.DisposeReason
  ) {
    if (this.showLastReceivedCallsign && reason === "expire") {
      this.refreshDisplay();
    }
  }

  /**
   * Resets the action to the initial display state: no last received callsign
   * and no active coms image.
   */
  public reset() {
    this._lastReceivedCallsign = undefined; // This also clears _lastReceivedCallsignHistory
    this._frequency = 0;
    this._isListening = false;
    this._isReceiving = false;
    this._isTransmitting = false;
    this._isAvailable = undefined;
    this._isOutputMuted = undefined;

    this.refreshDisplay();
  }

  /**
   * Shows the title on the action. Appends the last received callsign to
   * the base title if it exists, showLastReceivedCallsign is enabled in settings,
   * and the action is listening to RX.
   */
  private refreshTitle() {
    const title = new TitleBuilder();

    title.push(this.title, this.showTitle);
    title.push(this.callsign, this.showCallsign);
    title.push(this.formattedFrequency, this.showFrequency);
    title.push(this.listenTo.toUpperCase(), this.showListenTo);
    title.push(
      this.lastReceivedCallsignHistory.join("\n"),
      this.showLastReceivedCallsign
    );

    this.setTitle(title.join("\n"));
  }

  /**
   * Sets the action image to the correct one given the current isReceiving, isTransmitting, isAvailable and
   * isListening value.
   */
  private refreshImage() {
    const replacements = {
      callsign: this.callsign,
      frequency: this.frequency,
      formattedFrequency: this.formattedFrequency,
      lastReceivedCallsign: this.lastReceivedCallsign,
      lastReceivedCallsignHistory: this.lastReceivedCallsignHistory,
      lastReceivedCallsignHistoryJoined:
        this.lastReceivedCallsignHistory.join("\n"),
      listenTo: this.listenTo.toUpperCase(),
      title: this.title,
      isOutputMuted: this.isOutputMuted,
      outputVolume: this.outputVolume,
    };

    if (this.isAvailable !== undefined && !this.isAvailable) {
      this.setImage(this.unavailableImagePath, {
        ...replacements,
        state: "unavailable",
      });
      return;
    }

    if (this.isOutputMuted) {
      this.setImage(this.mutedImagePath, {
        ...replacements,
        state: "muted",
      });
      return;
    }

    if (this.isReceiving && this.isTransmitting) {
      this.setImage(this.blockedCommsImagePath, {
        ...replacements,
        state: "blocking",
      });
      return;
    }

    if (this.isReceiving || this.isTransmitting) {
      this.setImage(this.activeCommsImagePath, {
        ...replacements,
        state: "activeComms",
      });
      return;
    }

    if (this.isListening) {
      this.setImage(this.listeningImagePath, {
        ...replacements,
        state: "listening",
      });
      return;
    }

    this.setImage(this.notListeningImagePath, {
      ...replacements,
      state: "notListening",
    });
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
  return action.type === STATION_STATUS_CONTROLLER_TYPE;
}
