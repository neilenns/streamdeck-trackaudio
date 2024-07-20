import { AtisLetterSettings } from "@actions/atisLetter";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { handleActionError } from "@root/utils/handleElgatoError";

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

  /**
   * Gets the current ATIS letter.
   */
  get letter(): string | undefined {
    return this._letter;
  }

  /**
   * Sets the current AITS letter.
   */
  set letter(letter: string) {
    this._letter = letter;

    this.showTitle();
  }

  /**
   * Shows the title on the action. This will either be the current ATIS letter
   * or the station name and the word "ATIS".
   */
  public showTitle() {
    if (this._letter) {
      this.action.setTitle(this._letter).catch((error: unknown) => {
        handleActionError("Unable to set action title: ", error);
      });
    } else if (this.callsign) {
      this.action.setTitle(this.callsign).catch((error: unknown) => {
        handleActionError("Unable to set action title: ", error);
      });
    } else {
      this.action.setTitle(`ATIS`).catch((error: unknown) => {
        handleActionError("Unable to set action title: ", error);
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
