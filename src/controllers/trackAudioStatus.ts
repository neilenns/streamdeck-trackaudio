import { TrackAudioStatusSettings } from "@actions/trackAudioStatus";
import { KeyAction } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import trackAudioManager from "@managers/trackAudio";
import TitleBuilder from "@root/utils/titleBuilder";
import { stringOrUndefined } from "@root/utils/utils";
import { TRACKAUDIO_STATUS_CONTROLLER_TYPE } from "@utils/controllerTypes";
import debounce from "debounce";
import { BaseController } from "./baseController";

const defaultTemplatePath = "images/actions/trackAudioStatus/template.svg";

/**
 * A TrackAudioStatusController action, for use with ActionManager. Tracks the
 * state and Stream Deck action for an individual action in a profile.
 */
export class TrackAudioStatusController extends BaseController {
  type = TRACKAUDIO_STATUS_CONTROLLER_TYPE;

  private _settings: TrackAudioStatusSettings | null = null;

  private _notConnectedImagePath?: string;
  private _connectedImagePath?: string;
  private _voiceConnectedImagePath?: string;

  /**
   * Creates a new TrackAudioStatusController.
   * @param action The Stream Deck action object.
   */
  constructor(action: KeyAction, settings: TrackAudioStatusSettings) {
    super(action);
    this.settings = settings;
  }

  /**
   * Refreshes the title and image on the action.
   */
  public override refreshDisplay = debounce(() => {
    this.refreshTitle();
    this.refreshImage();
  }, 100);

  /**
   * Resets the action to its default state.
   */
  public reset() {
    this.refreshDisplay();
  }

  //#region Getters and setters
  /**
   * Gets the showTitle value from settings.
   * @returns { boolean } The value. Defaults to true.
   */
  get showTitle(): boolean {
    return this.settings.showTitle ?? false;
  }

  /**
   * Gets the title value from settings.
   * @returns { string | undefined } The title. Defaults to undefined.
   */
  get title(): string | undefined {
    return this.settings.title;
  }

  /**
   * Gets the path to the not connected image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get notConnectedImagePath(): string {
    return this._notConnectedImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the notConnectedImagePath.
   */
  set notConnectedImagePath(newValue: string | undefined) {
    this._notConnectedImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the connected image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get connectedImagePath(): string {
    return this._connectedImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the connectedImagePath.
   */
  set connectedImagePath(newValue: string | undefined) {
    this._connectedImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the voice connected image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get voiceConnectedImagePath(): string {
    return this._voiceConnectedImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the voiceConnectedImagePath.
   */
  set voiceConnectedImagePath(newValue: string | undefined) {
    this._voiceConnectedImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the settings.
   * @returns {TrackAudioStatusSettings} The settings.
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
  set settings(newValue: TrackAudioStatusSettings) {
    this._settings = newValue;
    this.connectedImagePath = stringOrUndefined(newValue.connectedImagePath);
    this.notConnectedImagePath = stringOrUndefined(
      newValue.notConnectedImagePath
    );
    this.voiceConnectedImagePath = stringOrUndefined(
      newValue.voiceConnectedImagePath
    );

    this.refreshDisplay();
  }
  //#endregion

  /**
   * Sets the displayed title based on the state of the action.
   */
  private refreshTitle() {
    const title = new TitleBuilder();

    title.push(this.title, this.showTitle);

    this.setTitle(title.join("\n"));
  }

  /**
   * Sets the displayed image based on the state of the action.
   */
  private refreshImage() {
    const replacements = {
      title: this.title,
    };

    if (trackAudioManager.isVoiceConnected) {
      this.setImage(this.voiceConnectedImagePath, {
        ...replacements,
        state: "voiceConnected",
      });
      return;
    }

    if (trackAudioManager.isConnected) {
      this.setImage(this.connectedImagePath, {
        ...replacements,
        state: "connected",
      });
      return;
    }

    this.setImage(this.notConnectedImagePath, {
      ...replacements,
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
  return action.type === TRACKAUDIO_STATUS_CONTROLLER_TYPE;
}
