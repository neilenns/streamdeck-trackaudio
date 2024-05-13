import {
  Action,
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import TrackAudioConnection from "../trackAudio";
import { isFrequencyStateUpdate, Message } from "../types/messages";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.neil-enns.trackaudio.stationstatus" })
export class StationStatus extends SingletonAction<StationSettings> {
  trackAudio = TrackAudioConnection.getInstance();

  buttonAction: Action | null = null;

  /**
   * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it become visible. This could be due to the Stream Deck first
   * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
   * we're setting the title to the "count" that is incremented in {@link IncrementCounter.onKeyDown}.
   */
  onWillAppear(ev: WillAppearEvent<StationSettings>): void | Promise<void> {
    // I'm not sure if this is the right way to do it, but save the action so
    // setState can be called from the socket message handler.
    this.buttonAction = ev.action;

    this.trackAudio.connect();
  }

  onWillDisappear(
    ev: WillDisappearEvent<StationSettings>
  ): void | Promise<void> {}

  /**
   * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
   * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
   * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
   * settings using `setSettings` and `getSettings`.
   */
  async onKeyDown(ev: KeyDownEvent<StationSettings>): Promise<void> {
    // // Determine the current count from the settings.
    // let count = ev.payload.settings.count ?? 0;
    // count++;
    // // Update the current count in the action's settings, and change the title.
    // await ev.action.setSettings({ count });
    // await ev.action.setTitle(`${count}`);
  }
}

type StationSettings = {
  callsign: string;
};
