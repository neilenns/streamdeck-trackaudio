import {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import actionManager from "@managers/action";

@action({ UUID: "com.neil-enns.trackaudio.atisletter" })
/**
 * Represents the status of a TrackAudio station
 */
export class AtisLetter extends SingletonAction<AtisLetterSettings> {
  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  onWillAppear(ev: WillAppearEvent<AtisLetterSettings>): void | Promise<void> {
    actionManager.addAtisLetter(ev.action, ev.payload.settings);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  onWillDisappear(
    ev: WillDisappearEvent<AtisLetterSettings>
  ): void | Promise<void> {
    actionManager.remove(ev.action);
  }

  // When settings are received the ActionManager is called to update the existing
  // settings on the saved action.
  onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<AtisLetterSettings>
  ): void | Promise<void> {
    actionManager.updateAtisLetter(ev.action, ev.payload.settings);
  }

  onKeyDown(ev: KeyDownEvent<AtisLetterSettings>): Promise<void> | void {
    actionManager.atisLetterKeyDown(ev.action);
  }
}

export interface AtisLetterSettings {
  autoClear?: boolean;
  callsign?: string;
  currentImagePath?: string;
  showLetter?: boolean;
  showTitle?: boolean;
  title?: string;
  unavailableImagePath?: string;
  updatedImagePath?: string;
}
