import { AtisLetterSettings } from "@actions/atisLetter";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { CompiledSvgTemplate, compileSvg } from "@root/utils/svg";
import TitleBuilder from "@root/utils/titleBuilder";
import { BaseController } from "./baseController";

const StateColor = {
  CURRENT: "black",
  UPDATED: "#f60",
  UNAVAILABLE: "black",
};

const defaultTemplatePath = "images/actions/atisLetter/template.svg";
const defaultUnavailableTemplatePath =
  "images/actions/atisLetter/unavailable.svg";

/**
 * A StationStatus action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class AtisLetterController extends BaseController {
  type = "AtisLetterController";

  private _settings!: AtisLetterSettings;
  private _letter?: string;
  private _isUpdated = false;
  private _isUnavailable = false;

  private _currentIconPath?: string;
  private _unavailableIconPath?: string;
  private _updatedIconPath?: string;

  // Pre-compiled action SVGs
  private _compiledCurrentSvg: CompiledSvgTemplate;
  private _compiledUnavailableSvg: CompiledSvgTemplate;
  private _compiledUpdatedSvg: CompiledSvgTemplate;

  /**
   * Creates a new StationStatusController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: Action, settings: AtisLetterSettings) {
    super(action);
    this.settings = settings;

    this.refreshTitle();
    this.refreshImage();
  }

  /**
   * Resets the action to its default, disconnected, state.
   */
  public reset() {
    this._letter = undefined;
    this._isUpdated = false;
    this._isUnavailable = false;

    this.refreshTitle();
    this.refreshImage();
  }

  //#region Getters and setters
  /**
   * Gets isUnavailable, which is true if no ATIS letter was available in the last VATSIM update.
   */
  get isUnavailable() {
    return this._isUnavailable;
  }

  /*
   * Sets isUnavailable and updates the action state, which is true if no ATIS letter was available
   * in the last VATSIM update.
   */
  set isUnavailable(newValue: boolean) {
    if (this._isUnavailable === newValue) {
      return;
    }

    this._isUnavailable = newValue;
    this.refreshImage();
  }

  /**
   * Returns the callsign for the ATIS action.
   */
  get callsign() {
    return this._settings.callsign;
  }

  /**
   * Returns the currentIconPath or the default template path if the
   * user didn't specify a custom icon.
   */
  get currentIconPath() {
    return this._currentIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the currentIconPath and re-compiles the SVG template if necessary.
   */
  set currentIconPath(newValue: string | undefined) {
    if (!this._compiledCurrentSvg || this.currentIconPath !== newValue) {
      this._compiledCurrentSvg = compileSvg(newValue ?? defaultTemplatePath);
    }
  }

  /**
   * Returns the updatedIconPath or the default template path if the user
   * didn't specify a custom icon.
   */
  get updatedIconPath() {
    return this._updatedIconPath ?? defaultTemplatePath;
  }

  /**
   * Sets the updatedIconPath and re-compiles the SVG template if necessary.
   */
  set updatedIconPath(newValue: string | undefined) {
    if (!this._compiledUpdatedSvg || this.updatedIconPath !== newValue) {
      this._compiledUpdatedSvg = compileSvg(newValue ?? defaultTemplatePath);
    }
  }

  /**
   * Returns the unavailableIconPath or the default unavailable template path
   * if the user didn't specify a custom icon.
   */
  get unavailableIconPath() {
    return this._unavailableIconPath ?? defaultUnavailableTemplatePath;
  }

  /**
   * Sets the unavailableIconPath and re-compiles the SVG template if necessary.
   */
  set unavailableIconPath(newValue: string | undefined) {
    if (
      !this._compiledUnavailableSvg ||
      this.unavailableIconPath !== newValue
    ) {
      this._compiledUnavailableSvg = compileSvg(
        newValue ?? defaultUnavailableTemplatePath
      );
    }
  }

  /**
   * Returns the showTitle setting, or true if undefined.
   */
  get showTitle() {
    return this._settings.showTitle ?? true;
  }

  /**
   * Returns the showLetter setting, or true if undefined.
   */
  get showLetter() {
    return this._settings.showLetter ?? true;
  }

  /**
   * Gets the settings.
   */
  get settings() {
    return this._settings;
  }

  /**
   * Sets the settings. Also updates the private icon paths and
   * compiled SVGs.
   */
  set settings(newValue: AtisLetterSettings) {
    this._settings = newValue;

    this.currentIconPath = newValue.currentIconPath;
    this.unavailableIconPath = newValue.unavailableIconPath;
    this.updatedIconPath = newValue.updatedIconPath;

    this.refreshTitle();
    this.refreshImage();
  }
  //#endregion

  /**
   * Gets the isUpdated state on the action.
   */
  public get isUpdated() {
    return this._isUpdated;
  }

  /**
   * Sets the isUpdated state on the action and refreshes the state image to match.
   */
  public set isUpdated(newValue: boolean) {
    this._isUpdated = newValue;

    this.refreshImage();
  }

  /**
   * Gets the current ATIS letter.
   */
  get letter(): string | undefined {
    return this._letter;
  }

  /**
   * Sets the current AITS letter.
   */
  set letter(letter: string | undefined) {
    // This crazy check catches two situations where the state should not show as updated:
    // 1. The first time the letter is set on the action
    // 2. Any time the letter is set to undefined to reset the action
    if (
      this._letter !== undefined &&
      letter !== undefined &&
      this._letter !== letter
    ) {
      this.isUpdated = true;
    } else {
      this.isUpdated = false;
    }

    this._letter = letter;
    this.refreshTitle();
    this.refreshImage(); // For cases where the state is fully responsible for displaying the content
  }

  /**
   * Convenience method to return the action's title from settings.
   */
  get title() {
    return this._settings.title;
  }

  /**
   * Sets the state of the action based on the value of isUpdated
   */
  private refreshImage() {
    const replacements = {
      title: this.title,
      letter: this.letter,
      callsign: this.callsign,
    };

    if (this.isUnavailable) {
      this.setImage(this.unavailableIconPath, this._compiledUnavailableSvg, {
        ...replacements,
        stateColor: StateColor.CURRENT,
      });
      return;
    }

    if (this.isUpdated) {
      this.setImage(this.updatedIconPath, this._compiledUpdatedSvg, {
        ...replacements,
        stateColor: StateColor.UPDATED,
      });
      return;
    }

    this.setImage(this.currentIconPath, this._compiledCurrentSvg, {
      ...replacements,
      stateColor: StateColor.CURRENT,
    });
  }

  /**
   * Sets the title on the action.
   */
  public refreshTitle() {
    const title = new TitleBuilder();

    title.push(this.title, this.showTitle);
    title.push(this.letter ?? "ATIS", this.showLetter);

    this.setTitle(title.join("\n"));
  }
}

/*
 * Typeguard for HotlineController.
 * @param action The action
 * @returns True if the action is a HotlineController
 */
export function isAtisLetterController(
  action: Controller
): action is AtisLetterController {
  return action.type === "AtisLetterController";
}
