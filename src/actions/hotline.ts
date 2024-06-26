import {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import ActionManager from "@managers/action";

@action({ UUID: "com.neil-enns.trackaudio.hotline" })
/**
 * Represents the status of a TrackAudio station
 */
export class Hotline extends SingletonAction<HotlineSettings> {
  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  onWillAppear(ev: WillAppearEvent<HotlineSettings>): void | Promise<void> {
    ActionManager.getInstance().addHotline(ev.action, ev.payload.settings);

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
    ActionManager.getInstance().remove(ev.action);
  }

  // When settings are received the ActionManager is called to update the existing
  // settings on the saved action.
  onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<HotlineSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().updateHotline(ev.action, ev.payload.settings);

    // Set the default title to the provided callsign. StreamDeck will use this if the user
    // didn't specify a custom title.
    ev.action
      .setTitle(ev.payload.settings.hotlineCallsign)
      .catch((error: unknown) => {
        console.error(error);
      });
  }

  // When the key is pressed send the request to toggle the hotline.
  onKeyDown(ev: KeyDownEvent<HotlineSettings>): void | Promise<void> {
    ActionManager.getInstance().toggleHotline(ev.action.id);
  }
}

export interface HotlineSettings {
  primaryCallsign: string;
  hotlineCallsign: string;
  receivingImagePath: string | null;
  listeningImagePath: string | null;
  hotlineActiveImagePath: string | null;
  bothActiveImagePath: string | null;
  neitherActiveImagePath: string | null;
}
