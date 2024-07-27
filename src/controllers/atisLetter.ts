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

  private _settings: AtisLetterSettings;
  private _letter?: string;
  private _isUpdated = false;
  private _isUnavailable = false;

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
    this._settings = settings;

    // Initialize the compiled SVGs to the default templates.
    this._compiledCurrentSvg = compileSvg(defaultTemplatePath);
    this._compiledUnavailableSvg = compileSvg(defaultUnavailableTemplatePath);
    this._compiledUpdatedSvg = compileSvg(defaultTemplatePath);

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
   * Returns the currentIconPath for the ATIS action.
   */
  get currentIconPath() {
    return this._settings.currentIconPath;
  }

  /**
   * Returns the updatedIconPath for the ATIS action.
   */
  get updatedIconPath() {
    return this._settings.updatedIconPath;
  }

  /**
   * Returns the unavailableIconPath for the ATIS action.
   */
  get unavailableIconPath() {
    return this._settings.unavailableIconPath;
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
   * Sets the settings.
   */
  set settings(newValue: AtisLetterSettings) {
    // Compile the SVGs if they changed
    if (this._settings.currentIconPath !== newValue.currentIconPath) {
      this._compiledCurrentSvg = compileSvg(
        newValue.currentIconPath ?? defaultTemplatePath
      );
    }

    if (this._settings.updatedIconPath !== newValue.updatedIconPath) {
      this._compiledUpdatedSvg = compileSvg(
        newValue.updatedIconPath ?? defaultTemplatePath
      );
    }

    if (this._settings.unavailableIconPath !== newValue.unavailableIconPath) {
      this._compiledUnavailableSvg = compileSvg(
        newValue.unavailableIconPath ?? defaultUnavailableTemplatePath
      );
    }

    // Save the new values
    this._settings = newValue;

    // Refresh the display
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
      this.refreshImage(this._compiledUnavailableSvg, {
        ...replacements,
        stateColor: StateColor.CURRENT,
      });
      return;
    }

    if (this.isUpdated) {
      this.refreshImage(this._compiledUpdatedSvg, {
        ...replacements,
        stateColor: StateColor.UPDATED,
      });
      return;
    }

    this.refreshImage(this._compiledCurrentSvg, {
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
