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
   * Returns the callsign for the ATIS action.
   */
  get callsign() {
    return this._settings.callsign;
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

    this.showTitle();
  }

  public get isUpdated() {
    return this._isUpdated;
  }

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
    if (letter !== undefined && this._letter !== letter) {
      this.isUpdated = true;
    }

    this._letter = letter;
    this.showTitle();
  }

  /**
   * Sets the state of the action based on the value of isUpdated
   */
  public setState() {
    if (this.isUpdated) {
      this.action.setState(1).catch((error: unknown) => {
        handleAsyncException("Unable to set ATIS letter action state: ", error);
      });
    } else {
      this.action.setState(0).catch((error: unknown) => {
        handleAsyncException("Unable to set ATIS letter action state: ", error);
      });
    }
  }

  /**
   * Shows the title on the action. This will either be the current ATIS letter
   * or the station name and the word "ATIS".
   */
  public showTitle() {
    if (this._letter) {
      this.action.setTitle(this._letter).catch((error: unknown) => {
        handleAsyncException("Unable to set action title: ", error);
      });
    } else if (this.callsign) {
      this.action.setTitle(this.callsign).catch((error: unknown) => {
        handleAsyncException("Unable to set action title: ", error);
      });
    } else {
      this.action.setTitle(`ATIS`).catch((error: unknown) => {
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
