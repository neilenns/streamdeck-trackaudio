import { StationSettings } from "@actions/stationStatus";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Updates the settings associated with a station status action.
 * Emits a stationStatusSettingsUpdated event if the settings require
 * the action to refresh.
 * @param action The action to update
 * @param settings The new settings to use
 */
export const handleUpdateStation = (
  action: KeyAction,
  settings: StationSettings
) => {
  const savedAction = actionManager
    .getStationStatusControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  // This avoids unnecessary calls to TrackAudio when the callsign or listenTo settings
  // didn't change.
  const requiresStationRefresh =
    savedAction.callsign !== settings.callsign ||
    savedAction.listenTo !== (settings.listenTo ?? "rx");

  savedAction.settings = settings;

  if (requiresStationRefresh) {
    actionManager.emit("stationStatusSettingsUpdated", savedAction);
  }
};
