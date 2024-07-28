import { AtisLetterSettings } from "@actions/atisLetter";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { CompiledSvgTemplate, compileSvg } from "@root/utils/svg";
import TitleBuilder from "@root/utils/titleBuilder";
import { BaseController } from "./baseController";
import { stringOrUndefined } from "@root/utils/utils";

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

  private _currentImagePath?: string;
  private _unavailableImagePath?: string;
  private _updatedImagePath?: string;

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
   * Returns the currentImagePath or the default template path if the
   * user didn't specify a custom icon.
   */
  get currentImagePath(): string {
    return this._currentImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the currentImagePath and re-compiles the SVG template if necessary.
   */
  set currentImagePath(newValue: string | undefined) {
    if (!this._compiledCurrentSvg || this.currentImagePath !== newValue) {
      this._currentImagePath = stringOrUndefined(newValue);
      this._compiledCurrentSvg = compileSvg(this.currentImagePath);
    }
  }

  /**
   * Returns the updatedImagePath or the default template path if the user
   * didn't specify a custom icon.
   */
  get updatedImagePath(): string {
    return this._updatedImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the updatedImagePath and re-compiles the SVG template if necessary.
   */
  set updatedImagePath(newValue: string | undefined) {
    if (!this._compiledUpdatedSvg || this.updatedImagePath !== newValue) {
      this._updatedImagePath = stringOrUndefined(newValue);
      this._compiledUpdatedSvg = compileSvg(this.updatedImagePath);
    }
  }

  /**
   * Returns the unavailableImagePath or the default unavailable template path
   * if the user didn't specify a custom icon.
   */
  get unavailableImagePath(): string {
    return this._unavailableImagePath ?? defaultUnavailableTemplatePath;
  }

  /**
   * Sets the unavailableImagePath and re-compiles the SVG template if necessary.
   */
  set unavailableImagePath(newValue: string | undefined) {
    if (
      !this._compiledUnavailableSvg ||
      this.unavailableImagePath !== newValue
    ) {
      this._unavailableImagePath = stringOrUndefined(newValue);
      this._compiledUnavailableSvg = compileSvg(this.unavailableImagePath);
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

    this.currentImagePath = newValue.currentImagePath;
    this.unavailableImagePath = newValue.unavailableImagePath;
    this.updatedImagePath = newValue.updatedImagePath;

    this.refreshTitle();
    this.refreshImage();
  }

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
  //#endregion

  /**
   * Sets the image based on the state of the action.
   */
  private refreshImage() {
    const replacements = {
      title: this.title,
      letter: this.letter,
      callsign: this.callsign,
    };

    if (this.isUnavailable) {
      this.setImage(this.unavailableImagePath, this._compiledUnavailableSvg, {
        ...replacements,
        stateColor: StateColor.CURRENT,
      });
      return;
    }

    if (this.isUpdated) {
      this.setImage(this.updatedImagePath, this._compiledUpdatedSvg, {
        ...replacements,
        stateColor: StateColor.UPDATED,
      });
      return;
    }

    this.setImage(this.currentImagePath, this._compiledCurrentSvg, {
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
