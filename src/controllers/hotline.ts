import { HotlineSettings } from "@actions/hotline";
import { KeyAction } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import trackAudioManager from "@managers/trackAudio";
import TitleBuilder from "@root/utils/titleBuilder";
import { stringOrUndefined } from "@root/utils/utils";
import { HOTLINE_CONTROLLER_TYPE } from "@utils/controllerTypes";
import debounce from "debounce";
import { BaseController } from "./baseController";

const defaultTemplatePath = "images/actions/hotline/template.svg";

/**
 * A HotlineController action, for use with ActionManager. Tracks the settings,
 * state and Stream Deck action for an individual action in a profile.
 */
export class HotlineController extends BaseController {
  type = HOTLINE_CONTROLLER_TYPE;

  private _settings: HotlineSettings | null = null;

  private _primaryFrequency = 0;
  private _hotlineFrequency = 0;
  private _isTxPrimary = false;
  private _isTxHotline = false;
  private _isRxHotline = false;
  private _isReceiving = false;
  private _isAvailable: boolean | undefined = undefined;

  private _bothActiveImagePath?: string;
  private _unavailableImagePath?: string;
  private _hotlineActiveImagePath?: string;
  private _listeningImagePath?: string;
  private _neitherActiveImagePath?: string;
  private _receivingImagePath?: string;

  /**
   * Creates a new HotlineController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: KeyAction, settings: HotlineSettings) {
    super(action);
    this.settings = settings;
  }

  /**
   * Updates the title and image on the action.
   */
  public override refreshDisplay = debounce(() => {
    this.refreshTitle();
    this.refreshImage();
  }, 100);

  /**
   * Resets the action to its default, disconnected, state.
   */
  public reset() {
    this._isReceiving = false;
    this._isRxHotline = false;
    this._isTxHotline = false;
    this._isTxPrimary = false;

    this._primaryFrequency = 0;
    this._hotlineFrequency = 0;
    this._isAvailable = undefined;

    this.refreshDisplay();
  }

  //#region Getters/setters
  /**
   * Gets the action's title from settings.
   * @returns { string | undefined } The title, or undefined if none is set.
   */
  get title(): string | undefined {
    return this.settings.title ?? "";
  }

  /**
   * Gets the path to the both active image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get bothActiveImagePath(): string {
    return this._bothActiveImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the bothActiveImagePath.
   */
  set bothActiveImagePath(newValue: string | undefined) {
    this._bothActiveImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the unavailable image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get unavailableImagePath(): string {
    return this._unavailableImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the unavailableImagePath.
   */
  set unavailableImagePath(newValue: string | undefined) {
    this._unavailableImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the hotline active image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get hotlineActiveImagePath(): string {
    return this._hotlineActiveImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the hotlineActiveImagePath.
   */
  set hotlineActiveImagePath(newValue: string | undefined) {
    this._hotlineActiveImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the listening image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get listeningImagePath(): string {
    return this._listeningImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the listeningImagePath.
   */
  set listeningImagePath(newValue: string | undefined) {
    this._listeningImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the neither active image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get neitherActiveImagePath(): string {
    return this._neitherActiveImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the neitherActiveImagePath.
   */
  set neitherActiveImagePath(newValue: string | undefined) {
    this._neitherActiveImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the receiving image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get receivingImagePath(): string {
    return this._receivingImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the receivingImagePath.
   */
  set receivingImagePath(newValue: string | undefined) {
    this._receivingImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the frequency for the primary callsign.
   * @returns {number} The frequency or 0 if the frequency isn't set.
   */
  get primaryFrequency(): number {
    return this._primaryFrequency;
  }

  /**
   * Sets the frequency for the primary callsign and updates the isAvailable
   * to true if both primary and hotline frequency are set.
   */
  set primaryFrequency(newValue: number) {
    // This is always done even if the new value is the same as the existing one
    // to ensure isAvailable refreshes.
    this._primaryFrequency = newValue;
    this.isAvailable =
      this.primaryFrequency !== 0 && this.hotlineFrequency !== 0;

    this.refreshDisplay();
  }

  /**
   * Gets the frequency for the hotline callsign.
   * @returns {number} The frequency or 0 if the frequency isn't set.
   */
  get hotlineFrequency(): number {
    return this._hotlineFrequency;
  }

  /**
   * Sets the frequency for the hotline callsign and updates the isAvailable
   * to true if both primary and hotline frequency are set.
   */
  set hotlineFrequency(newValue: number) {
    // This is always done even if the new value is the same as the existing one
    // to ensure isAvailable refreshes.
    this._hotlineFrequency = newValue;
    this.isAvailable =
      this.primaryFrequency !== 0 && this.hotlineFrequency !== 0;

    this.refreshDisplay();
  }

  /**
   * Gets the isAvailable value.
   * @returns {boolean | undefined} True if both the primary and hotline frequencies are available in TrackAudio.
   */
  get isAvailable(): boolean | undefined {
    return this._isAvailable;
  }

  /**
   * Sets the isAvailable property and updates the action image.
   */
  set isAvailable(newValue: boolean | undefined) {
    if (this._isAvailable === newValue) {
      return;
    }

    this._isAvailable = newValue;
    this.refreshDisplay();
  }

  /**
   * Sets whether the hotline frequency is actively receiving a communication
   *  and updates the action image.
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
   * Gets the isReceiving property.
   * @returns {boolean} True if the hotline frequency is actively receiving a communication.
   */
  get isReceiving(): boolean {
    return this._isReceiving;
  }

  /**
   * Gets the isTxPrimary property.
   * @returns {boolean} True if the station has Tx enabled on the primary frequency.
   */
  get isTxPrimary(): boolean {
    return this._isTxPrimary;
  }

  /**
   * Sets the state of the primary frequency Tx.
   */
  set isTxPrimary(value: boolean) {
    this._isTxPrimary = value;
  }

  /**
   * Gets the isTxHotline property.
   * @returns {boolean} True if the station has Tx enabled on the hotline frequency.
   */
  get isTxHotline(): boolean {
    return this._isTxHotline;
  }

  /**
   * Sets the state of the hotline frequency Tx.
   */
  set isTxHotline(value: boolean) {
    this._isTxHotline = value;
  }

  /**
   * Gets the isRxHotline property.
   * @returns {boolean} True if the station has Rx enabled on the hotline frequency.
   */
  get isRxHotline(): boolean {
    return this._isRxHotline;
  }

  /**
   * Sets the state of the hotline frequency Rx.
   */
  set isRxHotline(value: boolean) {
    this._isRxHotline = value;
  }

  /**
   * Gets the primaryCallsign value from settings.
   * @returns {string | undefined} The primary callsign, or undefined if not specified.
   */
  get primaryCallsign(): string | undefined {
    return this.settings.primaryCallsign;
  }

  /**
   * Gets the hotlineCallsign value from settings.
   * @returns {string | undefined} The hotline callsign, or undefined if not specified.
   */
  get hotlineCallsign(): string | undefined {
    return this.settings.hotlineCallsign;
  }

  /**
   * Gets the showTitle setting.
   * @returns {boolean} True if showTitle is enabled. Defaults to true.
   */
  get showTitle(): boolean {
    return this.settings.showTitle ?? true;
  }

  /**
   * Gets the showHotlineCallsign setting.
   * @returns {boolean} True if showHotlineCallsign is enabled. Defaults to true.
   */
  get showHotlineCallsign(): boolean {
    return this.settings.showHotlineCallsign ?? false;
  }

  /**
   * Gets the showPrimaryCallsign setting.
   * @returns {boolean} True if showPrimaryCallsign is enabled. Defaults to true.
   */
  get showPrimaryCallsign(): boolean {
    return this.settings.showPrimaryCallsign ?? false;
  }

  /**
   * Gets the settings.
   * @returns {HotlineSettings} The settings.
   */
  get settings(): HotlineSettings {
    if (this._settings === null) {
      throw new Error("Settings not initialized. This should never happen.");
    }

    return this._settings;
  }

  /**
   * Sets the settings.
   */
  set settings(newValue: HotlineSettings) {
    // Issue 183: Clear the frequency if the callsign changes.
    // The first time this gets set the _settings will be null so skip the check.
    if (
      this._settings &&
      this._settings.primaryCallsign !== newValue.primaryCallsign
    ) {
      this.primaryFrequency = 0;
    }

    if (
      this._settings &&
      this._settings.hotlineCallsign !== newValue.hotlineCallsign
    ) {
      this.hotlineFrequency = 0;
    }

    this._settings = newValue;

    this.bothActiveImagePath = newValue.bothActiveImagePath;
    this.hotlineActiveImagePath = newValue.hotlineActiveImagePath;
    this.listeningImagePath = newValue.listeningImagePath;
    this.neitherActiveImagePath = newValue.neitherActiveImagePath;
    this.receivingImagePath = newValue.receivingImagePath;
    this.unavailableImagePath = newValue.unavailableImagePath;

    this.refreshDisplay();
  }
  //#endregion

  /**
   * Sets the title on the action.
   */
  private refreshTitle() {
    const title = new TitleBuilder();

    title.push(this.title, this.showTitle);
    title.push(this.primaryCallsign, this.showPrimaryCallsign);
    title.push(this.hotlineCallsign, this.showHotlineCallsign);

    const finalTitle = title.join("\n");
    this.setTitle(finalTitle);
  }

  /**
   * Sets the image based on the state of the action.
   */
  private refreshImage() {
    const replacements = {
      hotlineCallsign: this.hotlineCallsign,
      hotlineFrequency: this.hotlineFrequency,
      primaryCallsign: this.primaryCallsign,
      primaryFrequency: this.primaryFrequency,
      title: this.title,
    };

    if (trackAudioManager.isVoiceConnected && !this.isAvailable) {
      this.setImage(this.unavailableImagePath, {
        ...replacements,
        state: "unavailable",
      });
      return;
    }

    // This state is bad, it means Tx is cross coupled
    // on both hotline and primary.
    if (this.isTxHotline && this.isTxPrimary) {
      this.setImage(this.bothActiveImagePath, {
        ...replacements,
        state: "bothActive",
      });
      return;
    }

    // Hotline is active tx, takes priority over active rx.
    if (this.isTxHotline) {
      this.setImage(this.hotlineActiveImagePath, {
        ...replacements,
        state: "hotlineActive",
      });
      return;
    }

    if (this.isReceiving) {
      this.setImage(this.receivingImagePath, {
        ...replacements,
        state: "receiving",
      });
      return;
    }

    // Primary active rx.
    if (this.isRxHotline) {
      this.setImage(this.listeningImagePath, {
        ...replacements,
        state: "listening",
      });
      return;
    }

    // Nothing is active.
    this.setImage(this.neitherActiveImagePath, {
      ...replacements,
      state: "neitherActive",
    });
  }
}

/*
 * Typeguard for HotlineController.
 * @param action The action
 * @returns True if the action is a HotlineController
 */
export function isHotlineController(
  action: Controller
): action is HotlineController {
  return action.type === HOTLINE_CONTROLLER_TYPE;
}
