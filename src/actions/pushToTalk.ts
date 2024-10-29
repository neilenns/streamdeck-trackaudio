import {
  action,
  DidReceiveSettingsEvent,
  JsonValue,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import actionManager from "@managers/action";

@action({ UUID: "com.neil-enns.trackaudio.pushtotalk" })

/**
 * Represents a push-to-talk action
 */
export class PushToTalk extends SingletonAction<PushToTalkSettings> {
  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  override onWillAppear(
    ev: WillAppearEvent<PushToTalkSettings>
  ): void | Promise<void> {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // KeyAction.
    if (!ev.action.isKey()) {
      return;
    }

    actionManager.addPushToTalk(ev.action, ev.payload.settings);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  override onWillDisappear(
    ev: WillDisappearEvent<PushToTalkSettings>
  ): void | Promise<void> {
    actionManager.remove(ev.action);
  }

  override onKeyDown(): void | Promise<void> {
    actionManager.pttPressed();
  }

  override onKeyUp(): void | Promise<void> {
    actionManager.pttReleased();
  }

  // When settings are received the ActionManager is called to update the existing
  // settings on the saved action.
  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<PushToTalkSettings>
  ): void | Promise<void> {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // KeyAction.
    if (!ev.action.isKey()) {
      return;
    }

    actionManager.updatePushToTalk(ev.action, ev.payload.settings);
  }
}

// Currently no settings are needed for this action
export interface PushToTalkSettings {
  title?: string;
  notTransmittingImagePath?: string;
  transmittingImagePath?: string;
  showTitle?: boolean;
  [key: string]: JsonValue;
}
