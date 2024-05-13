import {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SendToPluginEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import ActionManager, { ListenTo } from "../actionManager";

@action({ UUID: "com.neil-enns.trackaudio.stationstatus" })
export class StationStatus extends SingletonAction<StationSettings> {
  onWillAppear(ev: WillAppearEvent<StationSettings>): void | Promise<void> {
    ActionManager.getInstance().add(
      ev.payload.settings.callsign,
      ev.payload.settings.listenTo,
      ev.action
    );
  }

  onWillDisappear(
    ev: WillDisappearEvent<StationSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().remove(ev.action);
  }

  onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<StationSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().update(
      ev.action,
      ev.payload.settings.callsign,
      ev.payload.settings.listenTo
    );

    // Set the default title to the provided callsign. StreamDeck will use this if the user
    // didn't specify a custom title.
    ev.action.setTitle(ev.payload.settings.callsign);
  }

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
  listenTo: ListenTo;
};
