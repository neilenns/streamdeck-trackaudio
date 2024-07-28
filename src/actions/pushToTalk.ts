import {
  action,
  DidReceiveSettingsEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import ActionManager from "@managers/action";

@action({ UUID: "com.neil-enns.trackaudio.pushtotalk" })

/**
 * Represents a push-to-talk action
 */
export class PushToTalk extends SingletonAction<PushToTalkSettings> {
  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  onWillAppear(ev: WillAppearEvent<PushToTalkSettings>): void | Promise<void> {
    ActionManager.getInstance().addPushToTalk(ev.action, ev.payload.settings);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  onWillDisappear(
    ev: WillDisappearEvent<PushToTalkSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().remove(ev.action);
  }

  onKeyDown(): void | Promise<void> {
    ActionManager.getInstance().pttPressed();
  }

  onKeyUp(): void | Promise<void> {
    ActionManager.getInstance().pttReleased();
  }

  // When settings are received the ActionManager is called to update the existing
  // settings on the saved action.
  onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<PushToTalkSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().updatePushToTalk(
      ev.action,
      ev.payload.settings
    );
  }
}

// Currently no settings are needed for this action
export interface PushToTalkSettings {
  title?: string;
  notTransmittingImagePath?: string;
  transmittingImagePath?: string;
  showTitle?: boolean;
}
