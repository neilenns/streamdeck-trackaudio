import { HotlineSettings } from "@actions/hotline";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { BaseController } from "./baseController";
import { CompiledSvgTemplate, compileSvg } from "@root/utils/svg";
import { stringOrUndefined } from "@root/utils/utils";
import TitleBuilder from "@root/utils/titleBuilder";

const StateColor = {
  NEITHER_ACTIVE: "#000",
  BOTH_ACTIVE: "#900",
  HOTLINE_ACTIVE: "#c60",
  LISTENING: "#009",
  RECEIVING: "#060",
  UNAVAILABLE: "black",
};

const defaultTemplatePath = "images/actions/hotline/template.svg";
const defaultUnavailableTemplatePath = "images/actions/hotline/unavailable.svg";

/**
 * A HotlineController action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class HotlineController extends BaseController {
  type = "HotlineController";

  private _settings!: HotlineSettings;

  private _primaryFrequency = 0;
  private _hotlineFrequency = 0;
  private _isTxPrimary = false;
  private _isTxHotline = false;
  private _isRxHotline = false;
  private _isReceiving = false;
  private _isAvailable: boolean | undefined = undefined;

  private _bothActiveIconPath?: string;
  private _unavailableIconPath?: string;
  private _hotlineActiveIconPath?: string;
  private _listeningIconPath?: string;
  private _neitherActiveIconPath?: string;
  private _receivingIconPath?: string;

  // Pre-compiled action SVGs
  private _compiledBothActiveSvg: CompiledSvgTemplate;
  private _compiledUnavailableSvg: CompiledSvgTemplate;
  private _compiledHotlineActiveSvg: CompiledSvgTemplate;
  private _compiledListeningSvg: CompiledSvgTemplate;
  private _compiledNeitherActiveSvg: CompiledSvgTemplate;
  private _compiledReceivingSvg: CompiledSvgTemplate;

  /**
   * Creates a new HotlineController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: Action, settings: HotlineSettings) {
    super(action);
    this.settings = settings;

    this.refreshTitle();
    this.refreshImage();
  }

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

    this.refreshTitle();
    this.refreshImage();
  }

  //#region Getters/setters
  /**
   * Convenience method to return the action's title from settings or "HOTLINE"
   * if it is undefined.
   */
  get title() {
    return this._settings.title ?? "HOTLINE";
  }

  /**
   * Returns the bothActiveIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get bothActiveIconPath(): string {
    return this._bothActiveIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the bothActiveIconPath and re-compiles the SVG template if necessary.
   */
  set bothActiveIconPath(newValue: string | undefined) {
    if (!this._compiledBothActiveSvg || this.bothActiveIconPath !== newValue) {
      this._bothActiveIconPath = stringOrUndefined(newValue);
      this._compiledBothActiveSvg = compileSvg(this.bothActiveIconPath);
    }
  }

  /**
   * Returns the unavailableIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get unavailableIconPath(): string {
    return this._unavailableIconPath ?? defaultUnavailableTemplatePath;
  }

  /**
   * Sets the unavailableIconPath and re-compiles the SVG template if necessary.
   */
  set unavailableIconPath(newValue: string | undefined) {
    if (
      !this._compiledUnavailableSvg ||
      this.unavailableIconPath !== newValue
    ) {
      this._unavailableIconPath = stringOrUndefined(newValue);
      this._compiledUnavailableSvg = compileSvg(this.unavailableIconPath);
    }
  }

  /**
   * Returns the hotlineActiveIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get hotlineActiveIconPath(): string {
    return this._hotlineActiveIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the hotlineActiveIconPath and re-compiles the SVG template if necessary.
   */
  set hotlineActiveIconPath(newValue: string | undefined) {
    if (
      !this._compiledHotlineActiveSvg ||
      this.hotlineActiveIconPath !== newValue
    ) {
      this._hotlineActiveIconPath = stringOrUndefined(newValue);
      this._compiledHotlineActiveSvg = compileSvg(this.hotlineActiveIconPath);
    }
  }

  /**
   * Returns the listeningIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get listeningIconPath(): string {
    return this._listeningIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the listeningIconPath and re-compiles the SVG template if necessary.
   */
  set listeningIconPath(newValue: string | undefined) {
    if (!this._compiledListeningSvg || this.listeningIconPath !== newValue) {
      this._listeningIconPath = stringOrUndefined(newValue);
      this._compiledListeningSvg = compileSvg(this.listeningIconPath);
    }
  }

  /**
   * Returns the neitherActiveIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get neitherActiveIconPath(): string {
    return this._neitherActiveIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the neitherActiveIconPath and re-compiles the SVG template if necessary.
   */
  set neitherActiveIconPath(newValue: string | undefined) {
    if (
      !this._compiledNeitherActiveSvg ||
      this.neitherActiveIconPath !== newValue
    ) {
      this._neitherActiveIconPath = stringOrUndefined(newValue);
      this._compiledNeitherActiveSvg = compileSvg(this.neitherActiveIconPath);
    }
  }

  /**
   * Returns the receivingIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get receivingIconPath(): string {
    return this._receivingIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the receivingIconPath and re-compiles the SVG template if necessary.
   */
  set receivingIconPath(newValue: string | undefined) {
    if (!this._compiledReceivingSvg || this.receivingIconPath !== newValue) {
      this._receivingIconPath = stringOrUndefined(newValue);
      this._compiledReceivingSvg = compileSvg(this.receivingIconPath);
    }
  }
  /**
   * Returns the frequency for the primary callsign.
   */
  get primaryFrequency() {
    return this._primaryFrequency;
  }

  /**
   * Sets the frequency for the primary callsign and updates the isAvailable
   * to true if both primary and hotline frequency are set
   */
  set primaryFrequency(newValue: number) {
    // This is always done even if the new value is the same as the existing one
    // to ensure isAvailable refreshes.
    this._primaryFrequency = newValue;
    this.isAvailable =
      this.primaryFrequency !== 0 && this.hotlineFrequency !== 0;
  }

  /**
   * Gets the frequency for the hotline callsign.
   */
  get hotlineFrequency() {
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
  }

  /**
   * True if both the primary and hotline frequencies are available in TrackAudio.
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
   * Sets whether the hotline frequency is actively receiving a communication.
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
   * True if the hotline frequency is actively receicving a communication.
   */
  get isReceiving() {
    return this._isReceiving;
  }

  /**
   * True if the station has Tx enabled on the primary frequency.
   */
  get isTxPrimary() {
    return this._isTxPrimary;
  }

  /**
   * Sets the state of the primary frequency Tx.
   */
  set isTxPrimary(value: boolean) {
    this._isTxPrimary = value;
  }

  /**
   * True if the station has Tx enabled on the hotline frequency.
   */
  get isTxHotline() {
    return this._isTxHotline;
  }

  /**
   * Sets the state of the hotline frequency Tx.
   */
  set isTxHotline(value: boolean) {
    this._isTxHotline = value;
  }

  /**
   * True if the station has Rx enabled on the hotline frequency.
   */
  get isRxHotline() {
    return this._isRxHotline;
  }

  /**
   * Sets the state of the hotline frequency Rx.
   */
  set isRxHotline(value: boolean) {
    this._isRxHotline = value;
  }

  /**
   * Convenience property to get the primaryCallsign value of settings.
   */
  get primaryCallsign() {
    return this._settings.primaryCallsign;
  }

  /**
   * Convenience property to get the hotlineCallsign value of settings.
   */
  get hotlineCallsign() {
    return this._settings.hotlineCallsign;
  }

  /**
   * Returns the showTitle setting, or true if undefined.
   */
  get showTitle() {
    return this._settings.showTitle ?? true;
  }

  /**
   * Returns the showHotlineCallsign setting, or false if undefined.
   */
  get showHotlineCallsign() {
    return this._settings.showHotlineCallsign ?? false;
  }

  /**
   * Returns the showPrimaryCallsign setting, or false if undefined.
   */
  get showPrimaryCallsign() {
    return this._settings.showPrimaryCallsign ?? false;
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
  set settings(newValue: HotlineSettings) {
    this._settings = newValue;

    this.bothActiveIconPath = newValue.bothActiveIconPath;
    this.hotlineActiveIconPath = newValue.hotlineActiveIconPath;
    this.listeningIconPath = newValue.listeningIconPath;
    this.neitherActiveIconPath = newValue.neitherActiveIconPath;
    this.receivingIconPath = newValue.receivingIconPath;
    this.unavailableIconPath = newValue.unavailableIconPath;

    this.refreshTitle();
    this.refreshImage();
  }
  //#endregion

  /**
   * Sets the title on the action.
   */
  public refreshTitle() {
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
  public refreshImage() {
    const replacements = {
      primaryCallsign: this.primaryCallsign,
      hotlineCallsign: this.hotlineCallsign,
    };

    if (this.isAvailable !== undefined && !this.isAvailable) {
      this.setImage(this.unavailableIconPath, this._compiledUnavailableSvg, {
        ...replacements,
        stateColor: StateColor.UNAVAILABLE,
      });
      return;
    }

    // This state is bad, it means Tx is cross coupled
    // on both hotline and primary.
    if (this.isTxHotline && this.isTxPrimary) {
      this.setImage(this.bothActiveIconPath, this._compiledBothActiveSvg, {
        ...replacements,
        stateColor: StateColor.BOTH_ACTIVE,
      });
      return;
    }

    // Hotline is active tx, takes priority over active rx.
    if (this.isTxHotline) {
      this.setImage(
        this.hotlineActiveIconPath,
        this._compiledHotlineActiveSvg,
        {
          ...replacements,
          stateColor: StateColor.HOTLINE_ACTIVE,
        }
      );
      return;
    }

    if (this.isReceiving) {
      this.setImage(this.receivingIconPath, this._compiledReceivingSvg, {
        ...replacements,
        stateColor: StateColor.RECEIVING,
      });
      return;
    }

    // Primary active rx.
    if (this.isRxHotline) {
      this.setImage(this.listeningIconPath, this._compiledReceivingSvg, {
        ...replacements,
        stateColor: StateColor.LISTENING,
      });
      return;
    }

    // Nothing is active.
    this.setImage(this.neitherActiveIconPath, this._compiledNeitherActiveSvg, {
      ...replacements,
      stateColor: StateColor.NEITHER_ACTIVE,
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
  return action.type === "HotlineController";
}
