import { HotlineSettings } from "@actions/hotline";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import logger from "@utils/logger";

/**
 * Updates the settings associated with a hotline status action.
 * Emits a hotlineSettingsUpdated event if the settings require
 * the action to refresh.
 * @param action The action to update
 * @param settings The new settings to use
 */
export const handleUpdateHotline = (
  action: KeyAction,
  settings: HotlineSettings
) => {
  try {
    const savedAction = actionManager
      .getHotlineControllers()
      .find((entry) => entry.action.id === action.id);

    if (!savedAction) {
      return;
    }

    // actionManager avoids unnecessary calls to TrackAudio when the callsigns aren't the settings
    // that changed.
    const requiresStationRefresh =
      savedAction.primaryCallsign !== settings.primaryCallsign ||
      savedAction.hotlineCallsign !== settings.hotlineCallsign;

    savedAction.settings = settings;

    if (requiresStationRefresh) {
      actionManager.emit("hotlineSettingsUpdated", savedAction);
    }
  } catch (error) {
    logger.error("Error in handleUpdateHotline:", error);
  }
};
