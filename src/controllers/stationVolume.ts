import { StationVolumeSettings } from "@actions/stationVolume";
import { BaseController } from "./baseController";
import { DialAction } from "@elgato/streamdeck";
import mainLogger from "@utils/logger";
import { Controller } from "@interfaces/controller";
import { stringOrUndefined } from "@utils/utils";
import { handleAsyncException } from "@utils/handleAsyncException";

const logger = mainLogger.child({ service: "plugin" });

const defaultMutedTemplatePath = "images/actions/stationVolume/muted.svg";
const defaultNotMutedTemplatePath = "images/actions/stationVolume/notMuted.svg";
const defaultUnavailableTemplatePath =
  "images/actions/stationVolume/unavailable.svg";

export class StationVolumeController extends BaseController {
  type = "StationVolumeController";

  declare action: DialAction; // This ensures action from the base class is always a DialAction

  private _frequency = 0;
  private _isAvailable: boolean | undefined = undefined;
  private _isOutputMuted? = false;
  private _mutedTemplatePath?: string;
  private _notMutedTemplatePath?: string;
  private _outputVolume? = 100;
  private _settings: StationVolumeSettings | null = null;
  private _unavilableTemplatePath?: string;

  /**
   * Creates a new StationStatusController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: DialAction, settings: StationVolumeSettings) {
    super(action);

    this.action = action;
    this.settings = settings;
  }

  /**
   * Gets the not muted SVG template path.
   */
  get notMutedTemplatePath(): string {
    return this._notMutedTemplatePath ?? defaultNotMutedTemplatePath;
  }

  /**
   * Sets the not muted SVG template path.
   */
  set notMutedTemplatePath(newValue: string | undefined) {
    this._notMutedTemplatePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the muted SVG template path.
   */
  get mutedTemplatePath(): string {
    return this._mutedTemplatePath ?? defaultMutedTemplatePath;
  }

  /**
   * Sets the muted SVG template path.
   */
  set mutedTemplatePath(newValue: string | undefined) {
    this._mutedTemplatePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the unavailable SVG template path.
   */
  get unavailableTemplatePath(): string {
    return this._unavilableTemplatePath ?? defaultUnavailableTemplatePath;
  }

  /**
   * Sets the unavailable SVG template path.
   */
  set unavailableTemplatePath(newValue: string | undefined) {
    this._unavilableTemplatePath = stringOrUndefined(newValue);
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
    this.refreshTitle();
    this.refreshImage();
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
    this.refreshTitle();
    this.refreshImage();
  }

  /**
   * Gets the settings.
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

    this.refreshTitle();
    this.refreshImage();
  }

  /**
   * Convenience property to get the callsign value of settings.
   */
  get callsign() {
    return this.settings.callsign;
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
    this.refreshTitle();
    this.refreshImage();
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
    this.refreshTitle();
    this.refreshImage();
  }

  /**
   * Convenience property to get the changeAmount value of settings.
   */
  get changeAmount() {
    return this.settings.changeAmount ?? 1;
  }

  override reset(): void {
    logger.info("Resetting StationVolumeController");
    this._isAvailable = undefined;
    this._isOutputMuted = false;
    this._frequency = 0;
    this._outputVolume = 100;

    this.refreshTitle();
    this.refreshImage();
  }

  override refreshImage(): void {
    const replacements = {
      isOutputMuted: this.isOutputMuted,
      volume: this.outputVolume,
    };

    // Set the unavilable state if the station is not available.
    if (this.isAvailable !== undefined && !this.isAvailable) {
      this.setFeedbackImage(this.unavailableTemplatePath, replacements);
      return;
    }

    if (this.isOutputMuted) {
      this.setFeedbackImage(this.mutedTemplatePath, replacements);
      return;
    }

    this.setFeedbackImage(this.notMutedTemplatePath, replacements);
  }

  override refreshTitle(): void {
    // Set the unavilable state if the station is not available.
    if (this.isAvailable !== undefined && !this.isAvailable) {
      this.action
        .setFeedback({
          title: {
            value: this.callsign ?? "",
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

    // Nomral connected state.
    this.action
      .setFeedback({
        title: {
          value: this.callsign ?? "",
          color: this.isOutputMuted ? "grey" : "#FFFFFF",
        },
        indicator: {
          value: this.outputVolume,
          bar_fill_c: this.isOutputMuted ? "grey" : "#FFFFFF",
        },
        value: {
          value: `${this.outputVolume.toString()}%`,
          color: this.isOutputMuted ? "grey" : "#FFFFFF",
        },
      })
      .catch((error: unknown) => {
        handleAsyncException("Unable to set dial feedback: ", error);
      });
  }
}

/**
 * Typeguard for StationStatusController.
 * @param action The action
 * @returns True if the action is a StationStatusController
 */
export function isStationVolumeController(
  action: Controller
): action is StationVolumeController {
  return action.type === "StationVolumeController";
}
