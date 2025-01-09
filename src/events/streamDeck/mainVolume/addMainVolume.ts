import { MainVolumeSettings } from "@actions/mainVolume";
import { MainVolumeController } from "@controllers/mainVolume";
import { DialAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Adds a main volume action to the action list. Emits a mainVolumeAdded
 * event after the action is added.
 * @param action The action
 * @param settings The settings for the action
 */
export const handleAddMainVolume = (
  action: DialAction,
  settings: MainVolumeSettings
) => {
  const controller = new MainVolumeController(action, settings);

  actionManager.add(controller);
  actionManager.emit("mainVolumeAdded", controller);
};
