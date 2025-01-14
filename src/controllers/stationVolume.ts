import { StationVolumeSettings } from "@actions/stationVolume";
import { DialAction } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import trackAudioManager from "@managers/trackAudio";
import { STATION_VOLUME_CONTROLLER_TYPE } from "@utils/controllerTypes";
import { handleAsyncException } from "@utils/handleAsyncException";
import { stringOrUndefined } from "@utils/utils";
import debounce from "debounce";
import { BaseController } from "./baseController";

const defaultTemplatePath = "images/actions/stationVolume/template.svg";

export class StationVolumeController extends BaseController {
  type = STATION_VOLUME_CONTROLLER_TYPE;

  declare action: DialAction; // This ensures action from the base class is always a DialAction

  private _frequency = 0;
  private _isAvailable: boolean | undefined = undefined;
  private _isOutputMuted? = false;
  private _mutedTemplatePath?: string;
  private _notMutedTemplatePath?: string;
  private _outputVolume? = 100;
  private _settings: StationVolumeSettings | null = null;
  private _unavailableTemplatePath?: string;

  /**
   * Creates a new StationVolumeController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: DialAction, settings: StationVolumeSettings) {
    super(action);

    this.action = action;
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
   * Gets the path to the not muted image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get notMutedTemplatePath(): string {
    return this._notMutedTemplatePath ?? defaultTemplatePath;
  }

  /**
   * Sets the not muted SVG template path.
   */
  set notMutedTemplatePath(newValue: string | undefined) {
    this._notMutedTemplatePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the muted image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get mutedTemplatePath(): string {
    return this._mutedTemplatePath ?? defaultTemplatePath;
  }

  /**
   * Sets the muted SVG template path.
   */
  set mutedTemplatePath(newValue: string | undefined) {
    this._mutedTemplatePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the unavailable image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get unavailableTemplatePath(): string {
    return this._unavailableTemplatePath ?? defaultTemplatePath;
  }

  /**
   * Sets the unavailable SVG template path.
   */
  set unavailableTemplatePath(newValue: string | undefined) {
    this._unavailableTemplatePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the output volume property.
   * @returns {number} The output volume. Defaults to 100.
   */
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

    // This isn't debounced to ensure speedy updates when the volume changes.
    this.refreshImage();
    this.refreshTitle();
  }

  /**
   * Gets the isOutputMuted property.
   * @returns {boolean} True if the station is muted. Defaults to false.
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
   * Gets the settings.
   * @returns {StationVolumeSettings} The settings.
   */
  get settings(): StationVolumeSettings {
    if (this._settings === null) {
      throw new Error("Settings not initialized. This should never happen.");
    }

    return this._settings;
  }

  /**
   * Sets the settings.
   */
  set settings(newValue: StationVolumeSettings) {
    // Clear the frequency if the callsign changes.
    if (this._settings && this._settings.callsign !== newValue.callsign) {
      this.frequency = 0;
    }

    this._settings = newValue;
    this.mutedTemplatePath = newValue.mutedImagePath;
    this.notMutedTemplatePath = newValue.notMutedImagePath;
    this.unavailableTemplatePath = newValue.unavailableImagePath;

    this.refreshDisplay();
  }

  /**
   * Gets the callsign value from settings.
   * @returns {string | undefined} The callsign. Defaults to undefined.
   */
  get callsign(): string | undefined {
    return this.settings.callsign;
  }

  /**
   * Gets the frequency for the station callsign.
   * @returns {number} The frequency or 0 if the frequency isn't set.
   */
  get frequency(): number {
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
   * Gets the isAvailable value.
   * @returns {boolean | undefined} True if the station is available in TrackAudio.
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
   * Gets the changeAmount.
   * @returns {number} The amount to change the volume on each dial tick. Defaults to 2.
   */
  get changeAmount(): number {
    const amount = this.settings.changeAmount ?? 2;
    return amount > 0 ? amount : 2;
  }

  /**
   * Resets the action to defaults and refreshes the display.
   */
  override reset(): void {
    this._isAvailable = undefined;
    this._isOutputMuted = false;
    this._frequency = 0;
    this._outputVolume = 100;

    this.refreshDisplay();
  }

  /**
   * Sets the displayed image based on the state of the action.
   */
  private refreshImage(): void {
    const replacements = {
      volume: this.outputVolume,
    };

    if (!trackAudioManager.isVoiceConnected) {
      this.setFeedbackImage(this.notMutedTemplatePath, {
        ...replacements,
        state: "notConnected",
      });
      return;
    }

    // Set the unavailable state if the station is not available.
    if (!this.isAvailable) {
      this.setFeedbackImage(this.unavailableTemplatePath, {
        ...replacements,
        state: "unavailable",
      });
      return;
    }

    if (this.isOutputMuted) {
      this.setFeedbackImage(this.mutedTemplatePath, {
        ...replacements,
        state: "muted",
      });
      return;
    }

    this.setFeedbackImage(this.notMutedTemplatePath, {
      ...replacements,
      state: "notMuted",
    });
  }

  /**
   * Sets the displayed title based on the state of the action.
   */
  private refreshTitle(): void {
    if (!trackAudioManager.isVoiceConnected || !this.isAvailable) {
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

    // Normal connected state.
    this.action
      .setFeedback({
        title: {
          color: this.isOutputMuted ? "#a71d2a" : "#FFFFFF",
        },
        indicator: {
          value: this.outputVolume,
          bar_fill_c: this.isOutputMuted ? "#a71d2a" : "#FFFFFF",
        },
        value: {
          value: `${this.outputVolume.toString()}%`,
          color: this.isOutputMuted ? "#a71d2a" : "#FFFFFF",
        },
      })
      .catch((error: unknown) => {
        handleAsyncException("Unable to set dial feedback: ", error);
      });
  }
}

/**
 * Typeguard for StationVolumeController.
 * @param action The action
 * @returns True if the action is a StationVolumeController
 */
export function isStationVolumeController(
  action: Controller
): action is StationVolumeController {
  return action.type === STATION_VOLUME_CONTROLLER_TYPE;
}
