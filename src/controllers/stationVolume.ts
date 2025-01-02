import { StationVolumeSettings } from "@actions/stationVolume";
import { BaseController } from "./baseController";
import { DialAction } from "@elgato/streamdeck";
import mainLogger from "@utils/logger";
import { Controller } from "@interfaces/controller";
import { handleAsyncException } from "@utils/handleAsyncException";

const logger = mainLogger.child({ service: "plugin" });

export class StationVolumeController extends BaseController {
  type = "StationVolumeController";

  private _settings: StationVolumeSettings | null = null;
  private _frequency = 0;
  private _isAvailable: boolean | undefined = undefined;
  private _outputGain = 0.5;
  private _isOutputMuted = false;

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
   * Gets the output gain.
   **/
  get outputGain(): number {
    return this._outputGain;
  }

  /**
   * Sets the output gain.
   **/
  set outputGain(newValue: number) {
    if (this._outputGain === newValue) {
      return;
    }

    this._outputGain = newValue;
    this.refreshImage();
  }

  /**
   * Gets whether the output is muted.
   */
  get isOutputMuted(): boolean {
    return this._isOutputMuted;
  }

  /**
   * Sets whether the output is muted.
   */
  set isOutputMuted(newValue: boolean) {
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
    this._settings = newValue;

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

    logger.info("Refreshing image for StationVolumeController");

    action
      .setFeedback({
        title: this.callsign ?? "",
        indicator: {
          value: this.outputGain * 100,
        },
        value: this.outputGain * 100,
      })
      .catch((error: unknown) => {
        handleAsyncException("Unable to set dial feedback: ", error);
      });
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
