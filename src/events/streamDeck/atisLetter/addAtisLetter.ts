import { AtisLetterSettings } from "@actions/atisLetter";
import { AtisLetterController } from "@controllers/atisLetter";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

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
  const controller = new AtisLetterController(action, settings);

  actionManager.add(controller);
  actionManager.emit("atisLetterAdded", controller);
};
