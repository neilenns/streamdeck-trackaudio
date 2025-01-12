import { MainVolumeSettings } from "@actions/mainVolume";
import { DialAction } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import trackAudioManager from "@managers/trackAudio";
import { MAIN_VOLUME_CONTROLLER_TYPE } from "@utils/controllerTypes";
import { handleAsyncException } from "@utils/handleAsyncException";
import { stringOrUndefined } from "@utils/utils";
import debounce from "debounce";
import { BaseController } from "./baseController";

const defaultConnectedTemplatePath = "images/actions/mainVolume/template.svg";
const defaultNotConnectedTemplatePath =
  "images/actions/mainVolume/template.svg";

export class MainVolumeController extends BaseController {
  type = MAIN_VOLUME_CONTROLLER_TYPE;

  declare action: DialAction; // This ensures action from the base class is always a DialAction

  private _isConnected = false;
  private _volume = 100;
  private _settings: MainVolumeSettings | null = null;

  private _connectedTemplatePath?: string;
  private _notConnectedTemplatePath?: string;

  /**
   * Creates a new MainVolumeController object.
   * @param action The dial action associated with the controller
   * @param settings: The options for the action
   */
  constructor(action: DialAction, settings: MainVolumeSettings) {
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
   * Gets the connected SVG template path.
   */
  get connectedTemplatePath(): string {
    return this._connectedTemplatePath ?? defaultConnectedTemplatePath;
  }

  /**
   * Sets the connected SVG template path.
   */
  set connectedTemplatePath(newValue: string | undefined) {
    this._connectedTemplatePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the not connected SVG template path.
   */
  get notConnectedTemplatePath(): string {
    return this._notConnectedTemplatePath ?? defaultNotConnectedTemplatePath;
  }

  /**
   * Sets the not connected SVG template path.
   */
  set notConnectedTemplatePath(newValue: string | undefined) {
    this._notConnectedTemplatePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the output volume. Returns 100 if undefined.
   **/
  get volume(): number {
    return this._volume;
  }

  /**
   * Sets the output volume.
   **/
  set volume(newValue: number) {
    if (this._volume === newValue) {
      return;
    }

    this._volume = newValue;

    // This isn't debounced to ensure speedy updates when the volume changes.
    this.refreshImage();
    this.refreshTitle();
  }

  /**
   * Gets the settings.
   */
  get settings(): MainVolumeSettings {
    if (this._settings === null) {
      throw new Error("Settings not initialized. This should never happen.");
    }
    return this._settings;
  }

  /**
   * Sets the settings.
   */
  set settings(newValue: MainVolumeSettings) {
    this._settings = newValue;

    this.connectedTemplatePath = newValue.connectedImagePath;
    this.notConnectedTemplatePath = newValue.notConnectedImagePath;

    this.refreshDisplay();
  }

  /**
   * True if connected to TrackAudio.
   */
  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Sets the isConnected property and updates the action image accordingly.
   */
  set isConnected(newValue: boolean) {
    if (this._isConnected === newValue) {
      return;
    }

    this._isConnected = newValue;
    this.refreshDisplay();
  }

  /**
   * Convenience property to get the changeAmount value of settings.
   */
  get changeAmount() {
    const amount = this.settings.changeAmount ?? 2;
    return amount > 0 ? amount : 2;
  }

  override reset(): void {
    this._isConnected = false;
    this._volume = 100;

    this.refreshDisplay();
  }

  private refreshImage(): void {
    const replacements = {
      volume: this.volume,
      state: trackAudioManager.isVoiceConnected ? "connected" : "notConnected",
    };

    const templatePath = trackAudioManager.isConnected
      ? this.connectedTemplatePath
      : this.notConnectedTemplatePath;

    this.setFeedbackImage(templatePath, replacements);
  }

  private refreshTitle(): void {
    const color = trackAudioManager.isVoiceConnected ? "white" : "grey";

    this.action
      .setFeedback({
        title: {
          color: color,
        },
        indicator: {
          value: this.volume,
          color,
        },
        value: {
          value: `${this.volume.toString()}%`,
          color,
        },
      })
      .catch((error: unknown) => {
        handleAsyncException("Unable to set dial feedback: ", error);
      });
  }
}

/**
 * Typeguard for MainVolumeController.
 * @param action The action
 * @returns True if the action is a MainVolumeController
 */
export function isMainVolumeController(
  action: Controller
): action is MainVolumeController {
  return action.type === MAIN_VOLUME_CONTROLLER_TYPE;
}
