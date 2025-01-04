import { StationVolumeSettings } from "@actions/stationVolume";
import { DialAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Updates the settings associated with a TrackAudio status action.
 * @param action The action to update
 * @param settings The new settings to use
 */
export const handleUpdateStationVolumeSettings = (
  action: DialAction,
  settings: StationVolumeSettings
) => {
  const savedAction = actionManager
    .getStationVolumeControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  savedAction.settings = settings;
};
