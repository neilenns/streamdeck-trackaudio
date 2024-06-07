import { HotlineSettings } from "@actions/hotline";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";

/**
 * A HotlineController action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class HotlineController {
  type = "HotlineController";
  action: Action;
  primaryFrequency = 0;
  hotlineFrequency = 0;

  private _settings: HotlineSettings;

  private _isTxPrimary = false;
  private _isTxHotline = false;
  private _isRxHotline = false;
  private _isReceiving = false;

  /**
   * Creates a new HotlineController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: Action, settings: HotlineSettings) {
    this.action = action;
    this._settings = settings;
  }

  /**
   * Sets whether the hotline frequency is actively receiving a communication.
   */
  set isReceiving(newValue: boolean) {
    // Don't do anything if the state is the same
    if (this._isReceiving === newValue) {
      return;
    }

    this._isReceiving = newValue;
    this.setActiveCommsImage();
  }

  /**
   * True if the hotline frequency is actively receicving a communication.
   */
  get isReceiving() {
    return this._isReceiving;
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
   * True if the station has Rx enabled on the hotline frequency.
   */
  get isRxHotline() {
    return this._isRxHotline;
  }

  /**
   * Sets the state of the hotline frequency Rx.
   */
  set isRxHotline(value: boolean) {
    this._isRxHotline = value;
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
            "images/actions/hotline/conflict.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    }
    // Hotline is active tx, takes priority over active rx.
    else if (this.isTxHotline) {
      this.action
        .setImage(
          this._settings.hotlineActiveImagePath ??
            "images/actions/hotline/talking.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    } else if (this.isReceiving) {
      this.action
        .setImage(
          this._settings.receivingImagePath ??
            "images/actions/hotline/receiving.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    }
    // Primary active rx.
    else if (this.isRxHotline) {
      this.action
        .setImage(
          this._settings.listeningImagePath ??
            "images/actions/hotline/listening.svg"
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
            "images/actions/hotline/notConnected.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    }
  }
}

/*
 * Typeguard for HotlineController.
 * @param action The action
 * @returns True if the action is a HotlineController
 */
export function isHotlineController(
  action: Controller
): action is HotlineController {
  return action.type === "HotlineController";
}
