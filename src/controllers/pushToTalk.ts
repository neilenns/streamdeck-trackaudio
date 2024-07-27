import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { BaseController } from "./baseController";
import { CompiledSvgTemplate, compileSvg } from "@root/utils/svg";
import { PushToTalkSettings } from "@actions/pushToTalk";
import TitleBuilder from "@root/utils/titleBuilder";

const StateColor = {
  NOT_TRANSMITTING: "black",
  TRANSMITTING: "#f60",
};

const defaultTemplatePath = "images/actions/pushToTalk/template";

/**
 * A PushToTalkController action, for use with ActionManager. Tracks the
 * state and StreamDeck action for an individual action in a profile.
 */
export class PushToTalkController extends BaseController {
  type = "PushToTalkController";

  private _settings: PushToTalkSettings;
  private _isTransmitting = false;

  private _compiledNotTransmittingSvg: CompiledSvgTemplate;
  private _compiledTransmittingSvg: CompiledSvgTemplate;

  /**
   * Creates a new PushToTalkController object.
   * @param action The callsign for the action
   */
  constructor(action: Action, settings: PushToTalkSettings) {
    super(action);
    this._settings = settings;

    this.compileSvgs(settings);

    this.refreshTitle();
    this.refreshImage();
  }

  /**
   * Resets the action to its default, disconnected, state.
   */
  public reset() {
    this.isTransmitting = false;
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
    // Compile new SVGs before updating the settings so
    // they can be compared against the previous path.
    this.compileSvgs(newValue);

    this._settings = newValue;

    this.refreshImage();
  }

  /**
   * Compiles the SVG templates if they aren't set or
   * the path to the template changed.
   * @param newValue The incoming new settings.
   */
  compileSvgs(newValue: PushToTalkSettings) {
    if (
      !this._compiledNotTransmittingSvg ||
      this._settings.notTransmittingIconPath !==
        newValue.notTransmittingIconPath
    ) {
      this._compiledNotTransmittingSvg = compileSvg(
        newValue.notTransmittingIconPath ?? defaultTemplatePath
      );
    }

    if (
      !this._compiledTransmittingSvg ||
      this._settings.transmittingIconPath !== newValue.transmittingIconPath
    ) {
      this._compiledTransmittingSvg = compileSvg(
        newValue.transmittingIconPath ?? defaultTemplatePath
      );
    }
  }

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
      this.setImage(this._compiledTransmittingSvg, {
        stateColor: StateColor.TRANSMITTING,
      });
      return;
    }

    this.setImage(this._compiledNotTransmittingSvg, {
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
