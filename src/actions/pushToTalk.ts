import {
  action,
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
    ActionManager.getInstance().addPushToTalk(ev.action);
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
}

// Currently no settings are needed for this action
export type PushToTalkSettings = Record<string, never>;
