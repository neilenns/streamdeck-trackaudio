import { AtisLetterSettings } from "@actions/atisLetter";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { handleAsyncException } from "@root/utils/handleAsyncException";
import { generateSvgForSetImage, compileSvg } from "@root/utils/svg";
import TitleBuilder from "@root/utils/titleBuilder";

const StateColor = {
  CURRENT: "black",
  UPDATED: "#f60",
  UNAVAILABLE: "black",
};

/**
 * A StationStatus action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class AtisLetterController implements Controller {
  type = "AtisLetterController";
  action: Action;

  private _settings: AtisLetterSettings;
  private _letter?: string;
  private _isUpdated = false;
  private _isUnavailable = false;

  // Pre-compiled action SVGs
  private _compiledCurrentSvg: ReturnType<typeof compileSvg> = undefined;
  private _compiledUpdatedSvg: ReturnType<typeof compileSvg> = undefined;
  private _compiledUnavailableSvg: ReturnType<typeof compileSvg> = undefined;

  /**
   * Creates a new StationStatusController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: Action, settings: AtisLetterSettings) {
    this.action = action;
    this._settings = settings;

    this.setTitle();
    this.setState();
  }

  /**
   * Resets the action to its default, disconnected, state.
   */
  public reset() {
    this.letter = undefined;
    this.isUpdated = false;
    this.isUnavailable = false;
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
    this.setState();
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
        newValue.currentIconPath ?? "images/actions/atisLetter/template.svg"
      );
    }

    if (this._settings.updatedIconPath !== newValue.updatedIconPath) {
      this._compiledUpdatedSvg = compileSvg(
        newValue.updatedIconPath ?? "images/actions/atisLetter/template.svg"
      );
    }

    if (this._settings.unavailableIconPath !== newValue.unavailableIconPath) {
      this._compiledUnavailableSvg = compileSvg(
        newValue.unavailableIconPath ??
          "images/actions/atisLetter/unavailable.svg"
      );
    }

    // Save the new values
    this._settings = newValue;

    // Refresh the display
    this.setTitle();
    this.setState();
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

    this.setState();
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
    this.setTitle();
    this.setState(); // For cases where the state is fully responsible for displaying the content
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
  private setState() {
    const replacements = {
      title: this.title,
      letter: this.letter,
      callsign: this.callsign,
    };

    if (this.isUnavailable) {
      this.action
        .setImage(
          generateSvgForSetImage(this._compiledUnavailableSvg, {
            ...replacements,
            stateColor: StateColor.CURRENT,
          })
        )
        .catch((error: unknown) => {
          handleAsyncException(
            "Unable to set ATIS letter action image: ",
            error
          );
        });
    } else if (this.isUpdated) {
      this.action
        .setImage(
          generateSvgForSetImage(this._compiledUpdatedSvg, {
            ...replacements,
            stateColor: StateColor.UPDATED,
          })
        )
        .catch((error: unknown) => {
          handleAsyncException(
            "Unable to set ATIS letter action image: ",
            error
          );
        });
    } else {
      this.action
        .setImage(
          generateSvgForSetImage(this._compiledCurrentSvg, {
            ...replacements,
            stateColor: StateColor.CURRENT,
          })
        )
        .catch((error: unknown) => {
          handleAsyncException(
            "Unable to set ATIS letter action state: ",
            error
          );
        });
    }
  }

  /**
   * Sets the title on the action.
   */
  public setTitle() {
    const title = new TitleBuilder();

    title.push(this.title, this.showTitle);
    title.push(this.letter ?? "ATIS", this.showLetter);

    this.action.setTitle(title.join("\n")).catch((error: unknown) => {
      handleAsyncException("Unable to set action title: ", error);
    });
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
