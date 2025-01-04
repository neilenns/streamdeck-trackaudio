import { AtisLetterSettings } from "@actions/atisLetter";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Updates the settings associated with an ATIS letter status action.
 * Emits a atisLetterUpdated event if the settings require
 * the action to refresh.
 * @param action The action to update
 * @param settings The new settings to use
 */
export const handleUpdateAtisLetter = (
  action: KeyAction,
  settings: AtisLetterSettings
) => {
  const savedAction = actionManager
    .getAtisLetterControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  const requiresRefresh = savedAction.settings.callsign !== settings.callsign;

  savedAction.settings = settings;

  if (requiresRefresh) {
    actionManager.emit("atisLetterUpdated", savedAction);
  }
};
