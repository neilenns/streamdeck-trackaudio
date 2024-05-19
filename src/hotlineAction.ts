import { Action } from "@elgato/streamdeck";
import { HotlineSettings } from "./actions/hotline";
import { StatusAction } from "./actionManager";

/**
 * A HotlineAction action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class HotlineAction {
  type = "HotlineAction";
  action: Action;
  primaryFrequency = 0;
  hotlineFrequency = 0;

  private _settings: HotlineSettings;

  private _isTxPrimary = false;
  private _isTxHotline = false;

  /**
   * Creates a new HotlineAction object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: Action, settings: HotlineSettings) {
    this.action = action;
    this._settings = settings;
  }

  /**
   * True if the station has Tx enabled on the primary frequency.
   */
  get isTxPrimary() {
    return this._isTxPrimary;
  }

  /**
   * Sets the state of the primary frequency Tx.
   */
  set isTxPrimary(value: boolean) {
    this._isTxPrimary = value;
  }

  /**
   * True if the station has Tx enabled on the hotline frequency.
   */
  get isTxHotline() {
    return this._isTxHotline;
  }

  /**
   * Sets the state of the hotline frequency Tx.
   */
  set isTxHotline(value: boolean) {
    this._isTxHotline = value;
  }

  /**
   * Convenience property to get the primaryCallsign value of settings.
   */
  get primaryCallsign() {
    return this._settings.primaryCallsign;
  }

  /**
   * Convenience property to get the hotlineCallsign value of settings.
   */
  get hotlineCallsign() {
    return this._settings.hotlineCallsign;
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
  set settings(newValue: HotlineSettings) {
    this._settings = newValue;
  }

  public setActiveCommsImage() {
    // This state is bad, it means Tx is cross coupled
    // on both hotline and primary.
    if (this.isTxHotline && this.isTxPrimary) {
      this.action
        .setImage(
          this._settings.bothActiveImagePath ??
            "images/actions/station-status/red.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    }
    // Primary only active, nice and chill.
    else if (this.isTxPrimary) {
      this.action
        .setImage(
          this._settings.primaryActiveImagePath ??
            "images/actions/station-status/green.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    }
    // Hotline is active.
    else if (this.isTxHotline) {
      this.action
        .setImage(
          this._settings.hotlineActiveImagePath ??
            "images/actions/station-status/orange.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    }
    // Nothing is active.
    else {
      this.action
        .setImage(
          this._settings.neitherActiveImagePath ??
            "images/actions/station-status/black.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    }
  }
}

/*
 * Typeguard for HotlineAction.
 * @param action The action
 * @returns True if the action is a HotlineAction
 */
export function isHotlineAction(action: StatusAction): action is HotlineAction {
  return action.type === "HotlineAction";
}
