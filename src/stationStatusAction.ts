import { Action } from "@elgato/streamdeck";
import { StatusAction } from "./actionManager";

// Valid values for the ListenTo property. This must match
// the list of array property names that come from TrackAudio
// in the kFrequenciesUpdate message.
export type ListenTo = "rx" | "tx" | "xc";

/**
 * Settings for the StationStatusAction. This tracks the values that
 * were provided from the Property Inspector so they are available for
 * use outside of StreamDeck events.
 */
export class StationStatusActionSettings {
  callsign = "";
  listenTo: ListenTo = "rx";

  // Icon paths
  notListeningIconPath: string | undefined;
  listeningIconPath: string | undefined;
  activeCommsIconPath: string | undefined;
}

/**
 * A StationStatus action, for use with ActionManager. Tracks the settings,
 * state and StreamDeck action for an individual action in a profile.
 */
export class StationStatusAction {
  type = "StationStatusAction";
  action: Action;
  frequency = 0;
  isRx = false;
  isTx = false;
  isListening = false;

  settings: StationStatusActionSettings = new StationStatusActionSettings();

  /**
   * Creates a new StationStatusAction object.
   * @param callsign The callsign for the action
   * @param options: The options for the action
   */
  constructor(action: Action, options: StationStatusActionSettings) {
    this.action = action;
    this.settings.callsign = options.callsign;
    this.settings.listenTo = options.listenTo;
    this.settings.notListeningIconPath = options.notListeningIconPath;
    this.settings.listeningIconPath = options.listeningIconPath;
    this.settings.activeCommsIconPath = options.activeCommsIconPath;
  }

  /**
   * Sets the action image to the correct one for when comms are active,
   * or resets it to the correct isListening image when coms are off.
   */
  public setActiveCommsImage() {
    if (this.isRx || this.isTx) {
      this.action
        .setImage(
          this.settings.activeCommsIconPath ??
            "images/actions/station-status/orange.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    } else {
      this.setListeningImage();
    }
  }

  /**
   * Sets the action image to the correct one given the current isListening value
   */
  public setListeningImage() {
    if (this.isListening) {
      this.action
        .setImage(
          this.settings.listeningIconPath ??
            "images/actions/station-status/green.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    } else {
      this.action
        .setImage(
          this.settings.notListeningIconPath ??
            "images/actions/station-status/black.svg"
        )
        .catch((error: unknown) => {
          console.error(error);
        });
    }
  }
}

/**
 * Typeguard for StationStatusAction.
 * @param action The action
 * @returns True if the action is a StationStatusAction
 */
export function isStationStatusAction(
  action: StatusAction
): action is StationStatusAction {
  return action.type === "StationStatusAction";
}
