import {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import ActionManager from "../actionManager";

@action({ UUID: "com.neil-enns.trackaudio.trackaudiostatus" })
/**
 * Represents the status of the websocket connection to TrackAudio
 */
export class TrackAudioStatus extends SingletonAction<TrackAudioStatusSettings> {
  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code.
  onWillAppear(
    ev: WillAppearEvent<TrackAudioStatusSettings>
  ): void | Promise<void> {
    console.log("Hello");
    ActionManager.getInstance().addTrackAudio(ev.action);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  onWillDisappear(
    ev: WillDisappearEvent<TrackAudioStatusSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().remove(ev.action);
  }
}

// Currently no settings are needed for this action
type TrackAudioStatusSettings = Record<string, never>;
