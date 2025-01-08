import { HotlineSettings } from "@actions/hotline";
import { HotlineController } from "@controllers/hotline";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import logger from "@utils/logger";

/**
 * Adds a hotline action to the action list. Emits a trackAudioStatusAdded event
 * after the action is added.
 * @param action The action to add
 * @param settings The settings for the action
 */
export const handleAddHotline = (
  action: KeyAction,
  settings: HotlineSettings
) => {
  const childLogger = logger.child({ service: "handleAddHotline" });

  try {
    const controller = new HotlineController(action, settings);

    // Force buttons to refresh so the newly added button shows the correct state.
    actionManager.add(controller);
    actionManager.emit("hotlineAdded", controller);
    actionManager.emit("actionAdded", controller);
  } catch (error) {
    childLogger.error("Error in handleAddHotline:", error);
  }
};
