import { ListenTo } from "@controllers/stationStatus";
import {
  action,
  DidReceiveSettingsEvent,
  JsonValue,
  KeyAction,
  KeyUpEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { handleRemove } from "@events/streamDeck/remove";
import { handleAddStation } from "@events/streamDeck/stationStatus/addStation";
import { handleStationStatusLongPress } from "@events/streamDeck/stationStatus/stationStatusLongPress";
import { handleStationStatusShortPress } from "@events/streamDeck/stationStatus/stationStatusShortPress";
import { handleUpdateStation } from "@events/streamDeck/stationStatus/updateStation";
import { LONG_PRESS_THRESHOLD } from "@utils/constants";
import debounce from "debounce";

@action({ UUID: "com.neil-enns.trackaudio.stationstatus" })
/**
 * Represents the status of a TrackAudio station
 */
export class StationStatus extends SingletonAction<StationStatusSettings> {
  private _keyDownStart = 0;

  debouncedUpdate = debounce(
    (action: KeyAction, settings: StationStatusSettings) => {
      handleUpdateStation(action, settings);
    },
    300
  );

  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  override onWillAppear(
    ev: WillAppearEvent<StationStatusSettings>
  ): void | Promise<void> {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // KeyAction.
    if (!ev.action.isKey()) {
      return;
    }

    handleAddStation(ev.action, ev.payload.settings);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  override onWillDisappear(
    ev: WillDisappearEvent<StationStatusSettings>
  ): void | Promise<void> {
    handleRemove(ev.action);
  }

  // When settings are received the ActionManager is called to update the existing
  // settings on the saved action.
  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<StationStatusSettings>
  ): void | Promise<void> {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // KeyAction.
    if (!ev.action.isKey()) {
      return;
    }

    this.debouncedUpdate(ev.action, ev.payload.settings);
  }

  override onKeyDown(): void | Promise<void> {
    this._keyDownStart = Date.now();
  }

  override onKeyUp(
    ev: KeyUpEvent<StationStatusSettings>
  ): Promise<void> | void {
    const pressLength = Date.now() - this._keyDownStart;

    if (pressLength > LONG_PRESS_THRESHOLD) {
      handleStationStatusLongPress(ev.action);
    } else {
      handleStationStatusShortPress(ev.action);
    }
  }
}

export interface StationStatusSettings {
  autoSetListen?: boolean;
  autoSetSpk?: boolean;
  autoSetRx?: boolean;
  blockedCommsImagePath?: string;
  activeCommsImagePath?: string;
  callsign?: string;
  clearAfterInMinutes?: number;
  lastReceivedCallsignCount?: number;
  listeningImagePath?: string;
  listenTo: ListenTo | null;
  mutedImagePath?: string;
  notListeningImagePath?: string;
  showCallsign?: boolean;
  showFrequency?: boolean;
  showListenTo?: boolean;
  showTitle?: boolean;
  title?: string;
  toggleMuteOnLongPress?: boolean;
  toggleMuteOnPress?: boolean;
  toggleSpeakerOnLongPress?: boolean;
  toggleSpeakerOnPress?: boolean;
  unavailableImagePath?: string;
  [key: string]: JsonValue;
}
