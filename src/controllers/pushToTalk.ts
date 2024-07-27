import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { BaseController } from "./baseController";
import { CompiledSvgTemplate, compileSvg } from "@root/utils/svg";
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

  private _notTransmittingIconPath?: string;
  private _transmittingIconPath?: string;

  private _compiledNotTransmittingSvg: CompiledSvgTemplate;
  private _compiledTransmittingSvg: CompiledSvgTemplate;

  /**
   * Creates a new PushToTalkController object.
   * @param action The callsign for the action
   */
  constructor(action: Action, settings: PushToTalkSettings) {
    super(action);
    this.settings = settings;

    this.refreshTitle();
    this.refreshImage();
  }

  /**
   * Resets the action to its default, disconnected, state.
   */
  public reset() {
    this.isTransmitting = false;
  }

  //#region Getters and setters
  /**
   * Returns the transmittingIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get transmittingIconPath(): string {
    return this._transmittingIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the transmittingIconPath and re-compiles the SVG template if necessary.
   */
  set transmittingIconPath(newValue: string | undefined) {
    if (
      !this._compiledTransmittingSvg ||
      this.transmittingIconPath !== newValue
    ) {
      this._transmittingIconPath = stringOrUndefined(newValue);
      this._compiledTransmittingSvg = compileSvg(this.transmittingIconPath);
    }
  }

  /**
   * Returns the notTransmittingIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get notTransmittingIconPath(): string {
    return this._notTransmittingIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the notTransmittingIconPath and re-compiles the SVG template if necessary.
   */
  set notTransmittingIconPath(newValue: string | undefined) {
    if (
      !this._compiledNotTransmittingSvg ||
      this.notTransmittingIconPath !== newValue
    ) {
      this._notTransmittingIconPath = stringOrUndefined(newValue);
      this._compiledNotTransmittingSvg = compileSvg(
        this.notTransmittingIconPath
      );
    }
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

    this.notTransmittingIconPath = newValue.notTransmittingIconPath;
    this.transmittingIconPath = newValue.transmittingIconPath;

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
      this.setImage(this.transmittingIconPath, this._compiledTransmittingSvg, {
        stateColor: StateColor.TRANSMITTING,
      });
      return;
    }

    this.setImage(
      this.notTransmittingIconPath,
      this._compiledNotTransmittingSvg,
      {
        stateColor: StateColor.NOT_TRANSMITTING,
      }
    );
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
