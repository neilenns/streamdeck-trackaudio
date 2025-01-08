import { PushToTalkSettings } from "@actions/pushToTalk";
import { PushToTalkController } from "@controllers/pushToTalk";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import logger from "@utils/logger";

/**
 * Adds a push-to-talk action to the action list. Emits a pushToTalkAdded event
 * after the action is added.
 * @param action The action
 */ 
export const handleAddPushToTalk = (
  action: KeyAction,
  settings: PushToTalkSettings
) => {
  const childLogger = logger.child({ service: "handleAddPushToTalk" });

  try {
    const controller = new PushToTalkController(action, settings);
    actionManager.add(controller);

    actionManager.emit("pushToTalkAdded", controller);
    actionManager.emit("actionAdded", controller);
  } catch (error) {
    childLogger.error("Error in handleAddPushToTalk:", error);
  }
};
