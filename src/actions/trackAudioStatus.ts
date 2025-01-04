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
import { handleAddTrackAudioStatus } from "@events/streamDeck/trackAudioStatus/addTrackAudioStatus";
import { handleTrackAudioStatusLongPress } from "@events/streamDeck/trackAudioStatus/trackAudioStatusLongPress";
import { handleUpdateTrackAudioStatus } from "@events/streamDeck/trackAudioStatus/updateTrackAudioStatus";
import { LONG_PRESS_THRESHOLD } from "@utils/constants";
import debounce from "debounce";

@action({ UUID: "com.neil-enns.trackaudio.trackaudiostatus" })
/**
 * Represents the status of the websocket connection to TrackAudio
 */
export class TrackAudioStatus extends SingletonAction<TrackAudioStatusSettings> {
  private _keyDownStart = 0;

  debouncedUpdate = debounce(
    (action: KeyAction, settings: TrackAudioStatusSettings) => {
      handleUpdateTrackAudioStatus(action, settings);
    },
    300
  );

  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code.
  override onWillAppear(
    ev: WillAppearEvent<TrackAudioStatusSettings>
  ): void | Promise<void> {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // KeyAction.
    if (!ev.action.isKey()) {
      return;
    }

    handleAddTrackAudioStatus(ev.action, ev.payload.settings);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  override onWillDisappear(
    ev: WillDisappearEvent<TrackAudioStatusSettings>
  ): void | Promise<void> {
    handleRemove(ev.action);
  }

  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<TrackAudioStatusSettings>
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // KeyAction.
    if (!ev.action.isKey()) {
      return;
    }

    this.debouncedUpdate(ev.action, ev.payload.settings);
  }

  override onKeyDown(): Promise<void> | void {
    this._keyDownStart = Date.now();
  }

  override onKeyUp(
    ev: KeyUpEvent<TrackAudioStatusSettings>
  ): Promise<void> | void {
    const pressLength = Date.now() - this._keyDownStart;

    if (pressLength > LONG_PRESS_THRESHOLD) {
      handleTrackAudioStatusLongPress(ev.action);
    }
  }
}

// Currently no settings are needed for this action
export interface TrackAudioStatusSettings {
  title?: string;
  notConnectedImagePath?: string;
  connectedImagePath?: string;
  voiceConnectedImagePath?: string;
  showTitle?: boolean;
  [key: string]: JsonValue;
}
