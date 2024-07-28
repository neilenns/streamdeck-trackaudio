import {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import ActionManager from "@managers/action";

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
    ActionManager.getInstance().addTrackAudio(ev.action, ev.payload.settings);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  onWillDisappear(
    ev: WillDisappearEvent<TrackAudioStatusSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().remove(ev.action);
  }

  onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<TrackAudioStatusSettings>
  ): Promise<void> | void {
    ActionManager.getInstance().updateTrackAudioStatus(
      ev.action,
      ev.payload.settings
    );
  }

  onKeyDown(ev: KeyDownEvent<TrackAudioStatusSettings>): Promise<void> | void {
    ActionManager.getInstance().trackAudioStatusKeyDown(ev.action);
  }
}

// Currently no settings are needed for this action
export interface TrackAudioStatusSettings {
  title?: string;
  notConnectedImagePath?: string;
  connectedImagePath?: string;
  voiceConnectedImagePath?: string;
  showTitle?: boolean;
}
