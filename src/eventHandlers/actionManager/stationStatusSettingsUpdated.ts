import { StationStatusController } from "@controllers/stationStatus";
import TrackAudioManager from "@managers/trackAudio";

/**
 * Handles refreshing the station status from TrackAudio when any of the settings are updated
 * on a specific action.
 */
export const handleStationStatusSettingsUpdated = (
  action: StationStatusController
) => {
  TrackAudioManager.getInstance().refreshStationState(action.settings.callsign);
};
