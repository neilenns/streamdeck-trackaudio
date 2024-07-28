import { TrackAudioStatusSettings } from "@actions/trackAudioStatus";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { BaseController } from "./baseController";
import TitleBuilder from "@root/utils/titleBuilder";
import { stringOrUndefined } from "@root/utils/utils";

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

  private _notConnectedImagePath?: string;
  private _connectedImagePath?: string;
  private _voiceConnectedImagePath?: string;

  /**
   * Creates a new TrackAudioStatusController.
   * @param action The StreamDeck action object
   */
  constructor(action: Action, settings: TrackAudioStatusSettings) {
    super(action);
    this.settings = settings;
  }

  public reset() {
    this.isConnected = false;
    this.isVoiceConnected = false;
  }

  //#region Getters and setters
  /**
   * Returns the showTitle setting, or false if undefined.
   */
  get showTitle() {
    return this._settings.showTitle ?? false;
  }

  /**
   * Convenience method to return the action's title from settings.
   */
  get title() {
    return this._settings.title;
  }

  /**
   * Returns the notConnectedImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get notConnectedImagePath(): string {
    return this._notConnectedImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the notConnectedImagePath and re-compiles the SVG template if necessary.
   */
  set notConnectedImagePath(newValue: string | undefined) {
    this._notConnectedImagePath = stringOrUndefined(newValue);
  }

  /**
   * Returns the connectedImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get connectedImagePath(): string {
    return this._connectedImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the notConnectedImagePath and re-compiles the SVG template if necessary.
   */
  set connectedImagePath(newValue: string | undefined) {
    this._connectedImagePath = stringOrUndefined(newValue);
  }

  /**
   * Returns the voiceConnectedImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get voiceConnectedImagePath(): string {
    return this._voiceConnectedImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the notConnectedImagePath and re-compiles the SVG template if necessary.
   */
  set voiceConnectedImagePath(newValue: string | undefined) {
    this._voiceConnectedImagePath = stringOrUndefined(newValue);
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
    this.connectedImagePath = stringOrUndefined(newValue.connectedImagePath);
    this.notConnectedImagePath = stringOrUndefined(
      newValue.notConnectedImagePath
    );
    this.voiceConnectedImagePath = stringOrUndefined(
      newValue.voiceConnectedImagePath
    );

    this.refreshTitle();
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

    this.refreshTitle();
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
   * Sets the title on the action.
   */
  public refreshTitle() {
    const title = new TitleBuilder();

    title.push(this.title, this.showTitle);

    this.setTitle(title.join("\n"));
  }

  /**
   * Sets the action image based on the isConnected state
   */
  public refreshImage() {
    const replacements = {
      title: this.title,
    };

    if (this.isVoiceConnected) {
      this.setImage(this.voiceConnectedImagePath, {
        ...replacements,
        stateColor: StateColor.VOICE_CONNECTED,
        state: "voiceConnected",
      });
      return;
    }

    if (this.isConnected) {
      this.setImage(this.connectedImagePath, {
        ...replacements,
        stateColor: StateColor.CONNECTED,
        state: "connected",
      });
      return;
    }

    this.setImage(this.notConnectedImagePath, {
      stateColor: StateColor.NOT_CONNECTED,
      state: "notConnected",
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
