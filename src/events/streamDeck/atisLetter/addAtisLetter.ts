import { AtisLetterSettings } from "@actions/atisLetter";
import { AtisLetterController } from "@controllers/atisLetter";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import logger from "@utils/logger";

/**
 * Adds a station status action to the action list. Emits a stationStatusAdded
 * event after the action is added.
 * @param action The action
 * @param settings The settings for the action
 */
export const handleAddAtisLetter = (
  action: KeyAction,
  settings: AtisLetterSettings
) => {
  const childLogger = logger.child({ service: "handleAddAtisLetter" });

  try {
    const controller = new AtisLetterController(action, settings);

    actionManager.add(controller);
    actionManager.emit("atisLetterAdded", controller);
    actionManager.emit("actionAdded", controller);
  } catch (error) {
    childLogger.error("Error in handleAddAtisLetter:", error);
  }
};
