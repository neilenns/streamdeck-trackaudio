import { HotlineSettings } from "@actions/hotline";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";

/**
 * A HotlineController action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class HotlineController implements Controller {
  type = "HotlineController";
  action: Action;

  private _settings: HotlineSettings;

  private _primaryFrequency = 0;
  private _hotlineFrequency = 0;
  private _isTxPrimary = false;
  private _isTxHotline = false;
  private _isRxHotline = false;
  private _isReceiving = false;
  private _isAvailable: boolean | undefined = undefined;

  /**
   * Creates a new HotlineController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: Action, settings: HotlineSettings) {
    this.action = action;
    this._settings = settings;

    this.setState();
  }

  /**
   * Resets the action to its default, disconnected, state.
   */
  public reset() {
    this._isReceiving = false;
    this._isRxHotline = false;
    this._isTxHotline = false;
    this._isTxPrimary = false;

    this._primaryFrequency = 0;
    this._hotlineFrequency = 0;
    this._isAvailable = undefined;

    this.setState();
  }

  /**
   * Returns the frequency for the primary callsign.
   */
  get primaryFrequency() {
    return this._primaryFrequency;
  }

  /**
   * Sets the frequency for the primary callsign and updates the isAvailable
   * to true if both primary and hotline frequency are set
   */
  set primaryFrequency(newValue: number) {
    // This is always done even if the new value is the same as the existing one
    // to ensure isAvailable refreshes.
    this._primaryFrequency = newValue;
    this.isAvailable =
      this.primaryFrequency !== 0 && this.hotlineFrequency !== 0;
  }

  /**
   * Gets the frequency for the hotline callsign.
   */
  get hotlineFrequency() {
    return this._hotlineFrequency;
  }

  /**
   * Sets the frequency for the hotline callsign and updates the isAvailable
   * to true if both primary and hotline frequency are set.
   */
  set hotlineFrequency(newValue: number) {
    // This is always done even if the new value is the same as the existing one
    // to ensure isAvailable refreshes.
    this._hotlineFrequency = newValue;
    this.isAvailable =
      this.primaryFrequency !== 0 && this.hotlineFrequency !== 0;
  }

  /**
   * True if both the primary and hotline frequencies are available in TrackAudio.
   */
  get isAvailable(): boolean | undefined {
    return this._isAvailable;
  }

  /**
   * Sets the isAvailable property and updates the action image accordingly.
   */
  set isAvailable(newValue: boolean) {
    if (this._isAvailable === newValue) {
      return;
    }

    this._isAvailable = newValue;
    this.setState();
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
    this.setState();
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

    this.setState();
  }

  public setState() {
    if (this.isAvailable !== undefined && !this.isAvailable) {
      this.action
        .setImage(
          this._settings.unavailableImagePath ??
            "images/actions/hotline/unavailable.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });

      return;
    }

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
      return;
    }

    // Hotline is active tx, takes priority over active rx.
    if (this.isTxHotline) {
      this.action
        .setImage(
          this._settings.hotlineActiveImagePath ??
            "images/actions/hotline/talking.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });

      return;
    }

    if (this.isReceiving) {
      this.action
        .setImage(
          this._settings.receivingImagePath ??
            "images/actions/hotline/receiving.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
      return;
    }

    // Primary active rx.
    if (this.isRxHotline) {
      this.action
        .setImage(
          this._settings.listeningImagePath ??
            "images/actions/hotline/listening.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
      return;
    }

    // Nothing is active.
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
