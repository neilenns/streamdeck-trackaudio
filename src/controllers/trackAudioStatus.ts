import { TrackAudioStatusSettings } from "@actions/trackAudioStatus";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { CompiledSvgTemplate, compileSvg } from "@root/utils/svg";
import { BaseController } from "./baseController";

const StateColor = {
  NOT_CONNECTED: "black",
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
  private _settings: TrackAudioStatusSettings;

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
    this._settings = settings;

    // Initialize the compiled SVGs to the default templates.
    this._compiledNotConnectedSvg = compileSvg(defaultTemplatePath);
    this._compiledConnectedSvg = compileSvg(defaultTemplatePath);
    this._compiledVoiceConnectedSvg = compileSvg(defaultTemplatePath);

    this.refreshImage();
  }

  public reset() {
    this.isConnected = false;
    this.isVoiceConnected = false;
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
    // Recompile the SVGs if they changed

    this._settings = newValue;

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

  /**
   * Sets the action image based on the isConnected state
   */
  public refreshImage() {
    if (this.isVoiceConnected) {
      this.setImage(this._compiledVoiceConnectedSvg, {
        stateColor: StateColor.VOICE_CONNECTED,
      });
      return;
    }

    if (this.isConnected) {
      this.setImage(this._compiledConnectedSvg, {
        stateColor: StateColor.CONNECTED,
      });
      return;
    }

    this.setImage(this._compiledNotConnectedSvg, {
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
