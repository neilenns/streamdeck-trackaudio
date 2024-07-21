import { AtisLetterSettings } from "@actions/atisLetter";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { handleAsyncException } from "@root/utils/handleAsyncException";

/**
 * A StationStatus action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class AtisLetterController implements Controller {
  type = "AtisLetterController";
  action: Action;

  // private _letter: string;
  private _settings: AtisLetterSettings;
  private _letter?: string;
  private _isUpdated = false;
  private _isUnavailable = false;

  /**
   * Creates a new StationStatusController object.
   * @param action The callsign for the action
   * @param settings: The options for the action
   */
  constructor(action: Action, settings: AtisLetterSettings) {
    this.action = action;
    this._settings = settings;

    this.showTitle();
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
    this.setImage();
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
   * Gets the settings.
   */
  get settings() {
    return this._settings;
  }

  /**
   * Sets the settings.
   */
  set settings(newValue: AtisLetterSettings) {
    this._settings = newValue;

    if (this._settings.title === "") {
      this._settings.title = undefined;
    }

    this.showTitle();
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

    this.setImage();
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
    this.showTitle();
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
  private setImage() {
    if (this.isUnavailable) {
      this.action
        .setImage(
          this.unavailableIconPath ??
            "images/actions/atisLetter/unavailable.svg"
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
          this.updatedIconPath ?? "images/actions/atisLetter/updated.svg"
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
          this.currentIconPath ?? "images/actions/atisLetter/current.svg"
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
   * Shows the title on the action. This will either be the current ATIS letter
   * or the station name and the word "ATIS".
   */
  public showTitle() {
    if (this.letter) {
      if (this.title) {
        this.action
          .setTitle(`${this.title}\n${this._letter ?? ""}`)
          .catch((error: unknown) => {
            handleAsyncException("Unable to set action title: ", error);
          });
      } else {
        this.action.setTitle(this.letter).catch((error: unknown) => {
          handleAsyncException("Unable to set action title: ", error);
        });
      }
    } else {
      this.action.setTitle(this.title ?? "ATIS").catch((error: unknown) => {
        handleAsyncException("Unable to set action title: ", error);
      });
    }
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
