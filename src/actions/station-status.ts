import {
  action,
  DidReceiveSettingsEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import ActionManager from "../actionManager";
import { getDisplayTitle } from "../helpers/helpers";
import { ListenTo } from "../stationStatusAction";

@action({ UUID: "com.neil-enns.trackaudio.stationstatus" })
/**
 * Represents the status of a TrackAudio station
 */
export class StationStatus extends SingletonAction<StationSettings> {
  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  onWillAppear(ev: WillAppearEvent<StationSettings>): void | Promise<void> {
    ActionManager.getInstance().addStation(ev.action, {
      callsign: ev.payload.settings.callsign,
      listenTo: ev.payload.settings.listenTo ?? "rx",
      listeningIconPath: ev.payload.settings.listeningIconPath,
      notListeningIconPath: ev.payload.settings.notListeningIconPath,
      activeCommsIconPath: ev.payload.settings.activeCommsIconPath,
    });

    // Set the default title to the provided callsign. StreamDeck will use this if the user
    // didn't specify a custom title.
    ev.action
      .setTitle(
        getDisplayTitle(
          ev.payload.settings.callsign,
          ev.payload.settings.listenTo ?? "rx"
        )
      )
      .catch((error: unknown) => {
        console.error(error);
      });
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  onWillDisappear(
    ev: WillDisappearEvent<StationSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().remove(ev.action);
  }

  // When settings are received the ActionManager is called to update the existing
  // settings on the saved action.
  onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<StationSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().updateStation(ev.action, {
      callsign: ev.payload.settings.callsign,
      listenTo: ev.payload.settings.listenTo ?? "rx",
      listeningIconPath: ev.payload.settings.listeningIconPath,
      notListeningIconPath: ev.payload.settings.notListeningIconPath,
      activeCommsIconPath: ev.payload.settings.activeCommsIconPath,
    });

    // Set the default title to the provided callsign. StreamDeck will use this if the user
    // didn't specify a custom title.
    ev.action
      .setTitle(
        getDisplayTitle(
          ev.payload.settings.callsign,
          ev.payload.settings.listenTo ?? "rx"
        )
      )
      .catch((error: unknown) => {
        console.error(error);
      });
  }
}

interface StationSettings {
  callsign: string;
  listenTo: ListenTo | null;
  notListeningIconPath: string;
  listeningIconPath: string;
  activeCommsIconPath: string;
}
