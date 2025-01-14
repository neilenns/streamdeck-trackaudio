import { MainVolumeSettings } from "@actions/mainVolume";
import { DialAction } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import trackAudioManager from "@managers/trackAudio";
import { MAIN_VOLUME_CONTROLLER_TYPE } from "@utils/controllerTypes";
import { handleAsyncException } from "@utils/handleAsyncException";
import { stringOrUndefined } from "@utils/utils";
import debounce from "debounce";
import { BaseController } from "./baseController";

const defaultTemplatePath = "images/actions/mainVolume/template.svg";

export class MainVolumeController extends BaseController {
  type = MAIN_VOLUME_CONTROLLER_TYPE;

  declare action: DialAction; // This ensures action from the base class is always a DialAction

  private _volume = 100;
  private _settings: MainVolumeSettings | null = null;

  private _connectedTemplatePath?: string;
  private _notConnectedTemplatePath?: string;

  /**
   * Creates a new MainVolumeController object.
   * @param action The dial action associated with the controller.
   * @param settings: The options for the action.
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
   * Resets the action to its default state.
   */
  override reset(): void {
    this._volume = 100;

    this.refreshDisplay();
  }

  /**
   * Gets the path to the connected image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get connectedTemplatePath(): string {
    return this._connectedTemplatePath ?? defaultTemplatePath;
  }

  /**
   * Sets the connectedTemplatePath.
   */
  set connectedTemplatePath(newValue: string | undefined) {
    this._connectedTemplatePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the not connected image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get notConnectedTemplatePath(): string {
    return this._notConnectedTemplatePath ?? defaultTemplatePath;
  }

  /**
   * Sets the notConnectedTemplatePath.
   */
  set notConnectedTemplatePath(newValue: string | undefined) {
    this._notConnectedTemplatePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the output volume.
   * @returns {number} The output volume. Defaults to 100.
   **/
  get volume(): number {
    return this._volume;
  }

  /**
   * Sets the output volume and refreshes the action display.
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
   * @returns {MainVolumeSettings} The settings.
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
   * Gets the changeAmount.
   * @returns {number} The amount to change the volume on each dial tick. Defaults to 2.
   */
  get changeAmount(): number {
    const amount = this.settings.changeAmount ?? 2;
    return amount > 0 ? amount : 2;
  }

  /**
   * Sets the displayed image based on the state of the action.
   */
  private refreshImage(): void {
    const replacements = {
      volume: this.volume,
      state: trackAudioManager.isVoiceConnected ? "connected" : "notConnected",
    };

    const templatePath = trackAudioManager.isVoiceConnected
      ? this.connectedTemplatePath
      : this.notConnectedTemplatePath;

    this.setFeedbackImage(templatePath, replacements);
  }

  /**
   * Sets the displayed title based on the state of the action.
   */
  private refreshTitle(): void {
    if (!trackAudioManager.isVoiceConnected) {
      this.action
        .setFeedback({
          title: {
            color: "grey",
          },
          indicator: {
            value: 0,
            bar_fill_c: "grey",
          },
          value: {
            value: "",
            color: "grey",
          },
        })
        .catch((error: unknown) => {
          handleAsyncException("Unable to set dial feedback: ", error);
        });
      return;
    }

    this.action
      .setFeedback({
        title: {
          color: "white",
        },
        indicator: {
          value: this.volume,
          bar_fill_c: "white",
        },
        value: {
          value: `${this.volume.toString()}%`,
          color: "white",
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
