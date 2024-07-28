import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { BaseController } from "./baseController";
import { PushToTalkSettings } from "@actions/pushToTalk";
import TitleBuilder from "@root/utils/titleBuilder";
import { stringOrUndefined } from "@root/utils/utils";

const StateColor = {
  NOT_TRANSMITTING: "black",
  TRANSMITTING: "#f60",
};

const defaultTemplatePath = "images/actions/pushToTalk/template.svg";

/**
 * A PushToTalkController action, for use with ActionManager. Tracks the
 * state and StreamDeck action for an individual action in a profile.
 */
export class PushToTalkController extends BaseController {
  type = "PushToTalkController";

  private _settings!: PushToTalkSettings;
  private _isTransmitting = false;

  private _notTransmittingImagePath?: string;
  private _transmittingImagePath?: string;

  /**
   * Creates a new PushToTalkController object.
   * @param action The callsign for the action
   */
  constructor(action: Action, settings: PushToTalkSettings) {
    super(action);
    this.settings = settings;
  }

  /**
   * Resets the action to its default, disconnected, state.
   */
  public reset() {
    this.isTransmitting = false;
  }

  //#region Getters and setters
  /**
   * Returns the transmittingImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get transmittingImagePath(): string {
    return this._transmittingImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the transmittingImagePath and re-compiles the SVG template if necessary.
   */
  set transmittingImagePath(newValue: string | undefined) {
    this._transmittingImagePath = stringOrUndefined(newValue);
  }

  /**
   * Returns the notTransmittingImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get notTransmittingImagePath(): string {
    return this._notTransmittingImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the notTransmittingImagePath and re-compiles the SVG template if necessary.
   */
  set notTransmittingImagePath(newValue: string | undefined) {
    this._notTransmittingImagePath = stringOrUndefined(newValue);
  }

  /**
   * Convenience method to return the action's title from settings.
   */
  get title() {
    return this._settings.title;
  }

  /**
   * Returns the showTitle setting, or false if undefined.
   */
  get showTitle() {
    return this._settings.showTitle ?? false;
  }

  /**
   * True if push-to-talk is actively transmitting.
   */
  get isTransmitting() {
    return this._isTransmitting;
  }

  /**
   * Sets the isTransmitting property and updates the action image accordingly.
   */
  set isTransmitting(newValue: boolean) {
    // Don't do anything if the state is the same
    if (this._isTransmitting === newValue) {
      return;
    }

    this._isTransmitting = newValue;
    this.refreshImage();
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
  set settings(newValue: PushToTalkSettings) {
    this._settings = newValue;

    this.notTransmittingImagePath = newValue.notTransmittingImagePath;
    this.transmittingImagePath = newValue.transmittingImagePath;

    this.refreshTitle();
    this.refreshImage();
  }
  //#endregion

  /**
   * Sets the title on the action.
   */
  public refreshTitle() {
    const title = new TitleBuilder();

    title.push(this.title, this.showTitle);

    this.setTitle(title.join("\n"));
  }

  /**
   * Sets the action image to the correct one for when comms are active.
   */
  public refreshImage() {
    if (this.isTransmitting) {
      this.setImage(this.transmittingImagePath, {
        stateColor: StateColor.TRANSMITTING,
      });
      return;
    }

    this.setImage(this.notTransmittingImagePath, {
      stateColor: StateColor.NOT_TRANSMITTING,
    });
  }
}

/*
 * Typeguard for PushToTalkController.
 * @param action The action
 * @returns True if the action is a PushToTalkController
 */
export function isPushToTalkController(
  action: Controller
): action is PushToTalkController {
  return action.type === "PushToTalkController";
}
