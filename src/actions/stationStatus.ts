import { ListenTo } from "@controllers/stationStatus";
import {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import actionManager from "@managers/action";

@action({ UUID: "com.neil-enns.trackaudio.stationstatus" })
/**
 * Represents the status of a TrackAudio station
 */
export class StationStatus extends SingletonAction<StationSettings> {
  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  onWillAppear(ev: WillAppearEvent<StationSettings>): void | Promise<void> {
    actionManager.addStation(ev.action, ev.payload.settings);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  onWillDisappear(
    ev: WillDisappearEvent<StationSettings>
  ): void | Promise<void> {
    actionManager.remove(ev.action);
  }

  // When settings are received the ActionManager is called to update the existing
  // settings on the saved action.
  onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<StationSettings>
  ): void | Promise<void> {
    actionManager.updateStation(ev.action, ev.payload.settings);
  }

  // When the key is pressed send the request to toggle the current action to the ActionManager.
  // That will take care of figuing out the frequency and listenTo value and sending
  // the appropriate message to TrackAudio via a websocket.
  onKeyDown(ev: KeyDownEvent<StationSettings>): void | Promise<void> {
    actionManager.toggleFrequency(ev.action.id);
  }
}

export interface StationSettings {
  clearAfterInMinutes?: number;
  activeCommsImagePath?: string;
  callsign?: string;
  lastReceivedCallsignCount?: number;
  listeningImagePath?: string;
  listenTo: ListenTo | null;
  notListeningImagePath?: string;
  showCallsign?: boolean;
  showFrequency?: boolean;
  showListenTo?: boolean;
  showTitle?: boolean;
  title?: string;
  unavailableImagePath?: string;
}
