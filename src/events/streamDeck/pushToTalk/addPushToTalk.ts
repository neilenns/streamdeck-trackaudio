import { PushToTalkSettings } from "@actions/pushToTalk";
import { PushToTalkController } from "@controllers/pushToTalk";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Adds a push-to-talk action to the action list. Emits a pushToTalkAdded event
 * after the action is added.
 * @param action The action
 */ export const handleAddPushToTalk = (
  action: KeyAction,
  settings: PushToTalkSettings
) => {
  const controller = new PushToTalkController(action, settings);
  actionManager.add(controller);

  actionManager.emit("pushToTalkAdded", controller);
};
