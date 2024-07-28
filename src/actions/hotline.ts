import {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import actionManager from "@managers/action";

@action({ UUID: "com.neil-enns.trackaudio.hotline" })
/**
 * Represents the status of a TrackAudio station
 */
export class Hotline extends SingletonAction<HotlineSettings> {
  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  onWillAppear(ev: WillAppearEvent<HotlineSettings>): void | Promise<void> {
    actionManager.addHotline(ev.action, ev.payload.settings);

    // Set the default title to the provided callsign. StreamDeck will use this if the user
    // didn't specify a custom title.
    ev.action
      .setTitle(ev.payload.settings.hotlineCallsign)
      .catch((error: unknown) => {
        console.error(error);
      });
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  onWillDisappear(
    ev: WillDisappearEvent<HotlineSettings>
  ): void | Promise<void> {
    actionManager.remove(ev.action);
  }

  // When settings are received the ActionManager is called to update the existing
  // settings on the saved action.
  onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<HotlineSettings>
  ): void | Promise<void> {
    actionManager.updateHotline(ev.action, ev.payload.settings);
  }

  // When the key is pressed send the request to toggle the hotline.
  onKeyDown(ev: KeyDownEvent<HotlineSettings>): void | Promise<void> {
    actionManager.toggleHotline(ev.action.id);
  }
}

export interface HotlineSettings {
  primaryCallsign: string;
  hotlineCallsign: string;
  title?: string;
  receivingImagePath?: string;
  listeningImagePath?: string;
  hotlineActiveImagePath?: string;
  bothActiveImagePath?: string;
  neitherActiveImagePath?: string;
  unavailableImagePath?: string;
  showTitle?: boolean;
  showHotlineCallsign?: boolean;
  showPrimaryCallsign?: boolean;
}
