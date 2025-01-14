import { AtisLetterSettings } from "@actions/atisLetter";
import { KeyAction } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import TitleBuilder from "@root/utils/titleBuilder";
import { stringOrUndefined } from "@root/utils/utils";
import { ATIS_LETTER_CONTROLLER_TYPE } from "@utils/controllerTypes";
import debounce from "debounce";
import { BaseController } from "./baseController";

const defaultTemplatePath = "images/actions/atisLetter/template.svg";

/**
 * A StationStatus action, for use with ActionManager. Tracks the settings,
 * state and Stream Deck action for an individual action in a profile.
 */
export class AtisLetterController extends BaseController {
  type = ATIS_LETTER_CONTROLLER_TYPE;

  private _autoClearTimeout?: NodeJS.Timeout;
  private _isUnavailable = false;
  private _isUpdated = false;
  private _letter?: string;
  private _settings: AtisLetterSettings | null = null;

  private _currentImagePath?: string;
  private _unavailableImagePath?: string;
  private _updatedImagePath?: string;

  /**
   * Creates a new StationStatusController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: KeyAction, settings: AtisLetterSettings) {
    super(action);
    this.settings = settings;
  }

  /**
   * Refreshes the title and image on the action.
   */
  public override refreshDisplay = debounce(() => {
    this.refreshTitle();
    this.refreshImage();
  });

  /**
   * Resets the action to its default, disconnected, state.
   */
  public reset() {
    this._letter = undefined;
    this._isUpdated = false;
    this._isUnavailable = false;

    this.refreshDisplay();
  }

  //#region Getters and setters
  /**
   * Gets the autoClear setting.
   * @returns {boolean} True if auto clear is enabled. Defaults to true.
   */
  get autoClear(): boolean {
    return this.settings.autoClear ?? true;
  }

  /**
   * Gets isUnavailable.
   * @returns {boolean} True if no ATIS letter is available for the station.
   */
  get isUnavailable(): boolean {
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
    this.refreshDisplay();
  }

  /**
   * Gets the callsign value from settings.
   * @returns {string | undefined} The callsign. Defaults to undefined.
   */
  get callsign(): string | undefined {
    return this.settings.callsign;
  }

  /**
   * Gets the path to the current image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get currentImagePath(): string {
    return this._currentImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the currentImagePath.
   */
  set currentImagePath(newValue: string | undefined) {
    this._currentImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the updated image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get updatedImagePath(): string {
    return this._updatedImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the updatedImagePath.
   */
  set updatedImagePath(newValue: string | undefined) {
    this._updatedImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the path to the unavailable image template.
   * @returns {string} The path specified by the user, or the defaultTemplatePath if none was specified.
   */
  get unavailableImagePath(): string {
    return this._unavailableImagePath ?? defaultTemplatePath;
  }

  /**
   * Sets the unavailableImagePath.
   */
  set unavailableImagePath(newValue: string | undefined) {
    this._unavailableImagePath = stringOrUndefined(newValue);
  }

  /**
   * Gets the showTitle setting.
   * @returns {boolean} True if showTitle is enabled. Defaults to true.
   */
  get showTitle(): boolean {
    return this.settings.showTitle ?? true;
  }

  /**
   * Gets the showLetter setting.
   * @returns {boolean} True if showLetter is enabled. Defaults to true.
   */
  get showLetter(): boolean {
    return this.settings.showLetter ?? true;
  }

  /**
   * Gets the settings.
   * @returns {AtisLetterSettings} The settings.
   */
  get settings(): AtisLetterSettings {
    if (this._settings === null) {
      throw new Error("Settings not initialized. This should never happen.");
    }

    return this._settings;
  }

  /**
   * Sets the settings. Also updates the private icon paths.
   */
  set settings(newValue: AtisLetterSettings) {
    this._settings = newValue;

    this.currentImagePath = newValue.currentImagePath;
    this.unavailableImagePath = newValue.unavailableImagePath;
    this.updatedImagePath = newValue.updatedImagePath;

    this.refreshDisplay();
  }

  /**
   * Gets the isUpdated state on the action.
   * @returns {boolean} True if the ATIS is updated.
   */
  public get isUpdated(): boolean {
    return this._isUpdated;
  }

  /**
   * Sets the isUpdated state on the action and refreshes the state image to match.
   */
  public set isUpdated(newValue: boolean) {
    if (this._autoClearTimeout) {
      clearTimeout(this._autoClearTimeout);
      this._autoClearTimeout = undefined;
    }

    this._isUpdated = newValue;

    if (this.isUpdated && this.autoClear) {
      this._autoClearTimeout = setTimeout(() => {
        this._autoClearTimeout = undefined;
        this.isUpdated = false; // Using the setter to force refreshImage and the timeout to clear.
      }, 1000 * 60 * 2); // Two minute timeout
    }

    this.refreshDisplay();
  }

  /**
   * Gets the current ATIS letter.
   * @returns {string | undefined} The current ATIS letter, or undefined if no letter is set.
   */
  get letter(): string | undefined {
    return this._letter;
  }

  /**
   * Sets the current ATIS letter and updates the display.
   */
  set letter(newLetter: string | undefined) {
    // This crazy check catches two situations where the state should not show as updated:
    // 1. The first time the letter is set on the action
    // 2. Any time the letter is set to undefined to reset the action
    if (this._letter && newLetter && this._letter !== newLetter) {
      this.isUpdated = true;
    } else {
      this.isUpdated = false;
    }

    this._letter = newLetter;
    this.refreshDisplay();
  }

  /**
   * Gets the title value from settings.
   * @returns { string | undefined } The title. Defaults to undefined.
   */
  get title(): string | undefined {
    return this.settings.title;
  }
  //#endregion

  /**
   * Sets the displayed image based on the state of the action.
   */
  private refreshImage() {
    const replacements = {
      callsign: this.callsign,
      letter: this.letter,
      title: this.title,
    };

    if (this.isUnavailable) {
      this.setImage(this.unavailableImagePath, {
        ...replacements,
        state: "unavailable",
      });
      return;
    }

    if (this.isUpdated) {
      this.setImage(this.updatedImagePath, {
        ...replacements,
        state: "updated",
      });
      return;
    }

    this.setImage(this.currentImagePath, {
      ...replacements,
      state: "current",
    });
  }

  /**
   * Sets the displayed title based on the state of the action.
   */
  private refreshTitle() {
    const title = new TitleBuilder();

    title.push(this.title, this.showTitle);
    title.push(this.letter ?? "ATIS", this.showLetter);

    this.setTitle(title.join("\n"));
  }
}

/*
 * Typeguard for AtisLetterController.
 * @param action The action
 * @returns True if the action is an AtisLetterController
 */
export function isAtisLetterController(
  action: Controller
): action is AtisLetterController {
  return action.type === ATIS_LETTER_CONTROLLER_TYPE;
}
