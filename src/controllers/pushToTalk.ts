import { PushToTalkSettings } from "@actions/pushToTalk";
import { KeyAction } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import TitleBuilder from "@root/utils/titleBuilder";
import { stringOrUndefined } from "@root/utils/utils";
import { PUSH_TO_TALK_CONTROLLER_TYPE } from "@utils/controllerTypes";
import debounce from "debounce";
import { BaseController } from "./baseController";

const defaultTemplatePath = "images/actions/pushToTalk/template.svg";

/**
 * A PushToTalkController action, for use with ActionManager. Tracks the
 * state and Stream Deck action for an individual action in a profile.
 */
export class PushToTalkController extends BaseController {
  type = PUSH_TO_TALK_CONTROLLER_TYPE;

  private _settings: PushToTalkSettings | null = null;
  private _isTransmitting = false;

  private _notTransmittingImagePath?: string;
  private _transmittingImagePath?: string;

  /**
   * Creates a new PushToTalkController object.
   * @param action The callsign for the action
   */
  constructor(action: KeyAction, settings: PushToTalkSettings) {
    super(action);
    this.settings = settings;
  }

  /**
   * Refreshes the title and image on the action.
   * @remarks This method is debounced with a 100ms delay to prevent excessive updates.
   */
  public override refreshDisplay = debounce(() => {
    this.refreshTitle();
    this.refreshImage();
  }, 100);

  /**
   * Resets the action to its default state.
   */
  public reset() {
    this.isTransmitting = false;
  }

  //#region Getters and setters
  /**
   * Gets the path to the transmitting image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get transmittingImagePath(): string {
    return this._transmittingImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the transmittingImagePath.
   */
  set transmittingImagePath(newValue: string | undefined) {
    this._transmittingImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the not transmitting image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get notTransmittingImagePath(): string {
    return this._notTransmittingImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the notTransmittingImagePath.
   */
  set notTransmittingImagePath(newValue: string | undefined) {
    this._notTransmittingImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the action's title from settings.
   * @returns { string | undefined } The title, or undefined if none is set.
   */
  get title(): string | undefined {
    return this.settings.title;
  }

  /**
   * Gets the showTitle setting.
   * @returns {boolean} True if showTitle is enabled. Defaults to true.
   */
  get showTitle(): boolean {
    return this.settings.showTitle ?? false;
  }

  /**
   * Gets the isTransmitting property.
   * @returns {boolean} True if transmitting is active.
   */
  get isTransmitting(): boolean {
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
    this.refreshDisplay();
  }

  /**
   * Gets the settings.
   * @returns {PushToTalkSettings} The settings.
   */
  get settings(): PushToTalkSettings {
    if (this._settings === null) {
      throw new Error("Settings not initialized. This should never happen.");
    }

    return this._settings;
  }

  /**
   * Sets the settings.
   */
  set settings(newValue: PushToTalkSettings) {
    this._settings = newValue;

    this.notTransmittingImagePath = newValue.notTransmittingImagePath;
    this.transmittingImagePath = newValue.transmittingImagePath;

    this.refreshDisplay();
  }
  //#endregion

  /**
   * Sets the displayed title based on the state of the action.
   */
  private refreshTitle() {
    const title = new TitleBuilder();

    title.push(this.title, this.showTitle);

    this.setTitle(title.join("\n"));
  }

  /**
   * Sets the displayed image based on the state of the action.
   */
  private refreshImage() {
    const replacements = {
      title: this.title,
    };

    if (this.isTransmitting) {
      this.setImage(this.transmittingImagePath, {
        ...replacements,
        state: "transmitting",
      });
      return;
    }

    this.setImage(this.notTransmittingImagePath, {
      ...replacements,
      state: "notTransmitting",
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
  return action.type === PUSH_TO_TALK_CONTROLLER_TYPE;
}
