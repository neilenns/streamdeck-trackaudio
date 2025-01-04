import { MainVolumeSettings } from "@actions/mainVolume";
import { DialAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Updates the settings associated with a main volume action.
 * @param action The action to update
 * @param settings The new settings to use
 */
export const handleUpdateMainVolumeSettings = (
  action: DialAction,
  settings: MainVolumeSettings
) => {
  const savedAction = actionManager
    .getMainVolumeControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  savedAction.settings = settings;
};
