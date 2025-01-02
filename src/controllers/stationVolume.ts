import { StationVolumeSettings } from "@actions/stationVolume";
import { BaseController } from "./baseController";
import { DialAction } from "@elgato/streamdeck";
import mainLogger from "@utils/logger";
import { Controller } from "@interfaces/controller";
import { handleAsyncException } from "@utils/handleAsyncException";
import svgManager from "@managers/svg";
import { stringOrUndefined } from "@utils/utils";

const logger = mainLogger.child({ service: "plugin" });

const defaultNotMutedTemplatePath = "images/actions/stationVolume/notMuted.svg";
const defaultMutedTemplatePath = "images/actions/stationVolume/muted.svg";

export class StationVolumeController extends BaseController {
  type = "StationVolumeController";

  private _frequency = 0;
  private _isAvailable: boolean | undefined = undefined;
  private _isOutputMuted? = false;
  private _mutedTemplatePath?: string;
  private _notMutedTemplatePath?: string;
  private _outputGain? = 0.5;
  private _settings: StationVolumeSettings | null = null;

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
   * Gets the output gain. Returns 0.5 if undefined.
   **/
  get outputGain(): number {
    return this._outputGain ?? 0.5;
  }

  /**
   * Sets the output gain.
   **/
  set outputGain(newValue: number | undefined) {
    if (this._outputGain === newValue) {
      return;
    }

    this._outputGain = newValue;
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
    this.refreshImage();
  }

  /**
   * Convenience property to get the changeAmount value of settings.
   */
  get changeAmount() {
    return (this.settings.changeAmount ?? 1) / 10;
  }

  override reset(): void {
    logger.info("Resetting StationVolumeController");
    this._isAvailable = undefined;
    this._isOutputMuted = false;
    this._frequency = 0;
    this._outputGain = 0.5;

    this.refreshImage();
  }

  override refreshImage(): void {
    const action = this.action as DialAction;
    const value = Math.round(this.outputGain * 100);
    const imagePath = this.isOutputMuted
      ? this.mutedTemplatePath
      : this.notMutedTemplatePath;

    const replacements = {
      gain: this.outputGain,
      isOutputMuted: this.isOutputMuted,
      volume: value,
    };

    const generatedSvg = svgManager.renderSvg(imagePath, replacements);

    if (generatedSvg) {
      action
        .setFeedback({
          title: this.callsign ?? "",
          indicator: {
            value,
            bar_fill_c: this.isOutputMuted ? "pink" : "white",
          },
          value: `${value.toString()}%`,
          icon: generatedSvg,
        })
        .catch((error: unknown) => {
          handleAsyncException("Unable to set dial feedback: ", error);
        });
    } else {
      this.action.setImage(imagePath).catch((error: unknown) => {
        handleAsyncException("Unable to set state image: ", error);
      });
    }
  }

  override refreshTitle(): void {
    logger.info("Refreshing title for StationVolumeController");
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
