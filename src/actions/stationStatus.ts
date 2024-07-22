import { ListenTo } from "@controllers/stationStatus";
import {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import ActionManager from "@managers/action";

@action({ UUID: "com.neil-enns.trackaudio.stationstatus" })
/**
 * Represents the status of a TrackAudio station
 */
export class StationStatus extends SingletonAction<StationSettings> {
  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  onWillAppear(ev: WillAppearEvent<StationSettings>): void | Promise<void> {
    ActionManager.getInstance().addStation(ev.action, ev.payload.settings);
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
    ActionManager.getInstance().updateStation(ev.action, ev.payload.settings);
  }

  // When the key is pressed send the request to toggle the current action to the ActionManager.
  // That will take care of figuing out the frequency and listenTo value and sending
  // the appropriate message to TrackAudio via a websocket.
  onKeyDown(ev: KeyDownEvent<StationSettings>): void | Promise<void> {
    ActionManager.getInstance().toggleFrequency(ev.action.id);
  }
}

export interface StationSettings {
  title?: string;
  callsign?: string;
  showLastReceivedCallsign: boolean;
  listenTo: ListenTo | null;
  notListeningIconPath: string | null;
  listeningIconPath: string | null;
  activeCommsIconPath: string | null;
  unavailableIconPath: string | null;
}
