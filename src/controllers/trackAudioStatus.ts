import { TrackAudioStatusSettings } from "@actions/trackAudioStatus";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { CompiledSvgTemplate, compileSvg } from "@root/utils/svg";
import { BaseController } from "./baseController";

const StateColor = {
  NOT_CONNECTED: "white",
  CONNECTED: "#5fcdfa",
  VOICE_CONNECTED: "#060",
};

const defaultTemplatePath = "images/actions/trackAudioStatus/template.svg";

/**
 * A TrackAudioStatusController action, for use with ActionManager. Tracks the
 * state and StreamDeck action for an individual action in a profile.
 */
export class TrackAudioStatusController extends BaseController {
  type = "TrackAudioStatusController";

  private _isConnected = false;
  private _isVoiceConnected = false;
  private _settings!: TrackAudioStatusSettings;

  private _notConnectedIconPath?: string;
  private _connectedIconPath?: string;
  private _voiceConnectedIconPath?: string;

  // Pre-compiled action SVGs
  private _compiledNotConnectedSvg: CompiledSvgTemplate;
  private _compiledConnectedSvg: CompiledSvgTemplate;
  private _compiledVoiceConnectedSvg: CompiledSvgTemplate;

  /**
   * Creates a new TrackAudioStatusController.
   * @param action The StreamDeck action object
   */
  constructor(action: Action, settings: TrackAudioStatusSettings) {
    super(action);
    this.settings = settings;

    this.refreshImage();
  }

  public reset() {
    this.isConnected = false;
    this.isVoiceConnected = false;
  }

  //#region Getters and setters
  /**
   * Returns the notConnectedIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get notConnectedIconPath() {
    return this._notConnectedIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the notConnectedIconPath and re-compiles the SVG template if necessary.
   */
  set notConnectedIconPath(newValue: string | undefined) {
    if (
      !this._compiledNotConnectedSvg ||
      this.notConnectedIconPath !== newValue
    ) {
      this._compiledNotConnectedSvg = compileSvg(
        newValue ?? defaultTemplatePath
      );
    }
  }

  /**
   * Returns the connectedIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get connectedIconPath() {
    return this._connectedIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the notConnectedIconPath and re-compiles the SVG template if necessary.
   */
  set connectedIconPath(newValue: string | undefined) {
    if (!this._compiledConnectedSvg || this.connectedIconPath !== newValue) {
      this._compiledConnectedSvg = compileSvg(newValue ?? defaultTemplatePath);
    }
  }

  /**
   * Returns the voiceConnectedIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get voiceConnectedIconPath() {
    return this._voiceConnectedIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the notConnectedIconPath and re-compiles the SVG template if necessary.
   */
  set voiceConnectedIconPath(newValue: string | undefined) {
    if (
      !this._compiledVoiceConnectedSvg ||
      this.voiceConnectedIconPath !== newValue
    ) {
      this._compiledVoiceConnectedSvg = compileSvg(
        newValue ?? defaultTemplatePath
      );
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
  set settings(newValue: TrackAudioStatusSettings) {
    this._settings = newValue;
    this.connectedIconPath = newValue.connectedIconPath;
    this.notConnectedIconPath = newValue.notConnectedIconPath;
    this.voiceConnectedIconPath = newValue.voiceConnectedIconPath;

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
  //#endregion

  /**
   * Sets the action image based on the isConnected state
   */
  public refreshImage() {
    if (this.isVoiceConnected) {
      this.setImage(
        this.voiceConnectedIconPath,
        this._compiledVoiceConnectedSvg,
        {
          stateColor: StateColor.VOICE_CONNECTED,
        }
      );
      return;
    }

    if (this.isConnected) {
      this.setImage(this.connectedIconPath, this._compiledConnectedSvg, {
        stateColor: StateColor.CONNECTED,
      });
      return;
    }

    this.setImage(this.notConnectedIconPath, this._compiledNotConnectedSvg, {
      stateColor: StateColor.NOT_CONNECTED,
    });
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
