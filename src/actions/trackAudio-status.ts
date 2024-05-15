import {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import ActionManager from "../actionManager";

@action({ UUID: "com.neil-enns.trackaudio.trackaudiostatus" })
export class TrackAudioStatus extends SingletonAction<TrackAudioStatusSettings> {
  onWillAppear(
    ev: WillAppearEvent<TrackAudioStatusSettings>
  ): void | Promise<void> {
    console.log("Hello");
    ActionManager.getInstance().addVectorAudio(ev.action);
  }

  onWillDisappear(
    ev: WillDisappearEvent<TrackAudioStatusSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().remove(ev.action);
  }
}

type TrackAudioStatusSettings = Record<string, never>;
