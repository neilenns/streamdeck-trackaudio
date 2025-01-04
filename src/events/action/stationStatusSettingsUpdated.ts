import { StationStatusController } from "@controllers/stationStatus";
import trackAudioManager from "@managers/trackAudio";

/**
 * Handles refreshing the station status from TrackAudio when any of the settings are updated
 * on a specific action.
 */
export const handleStationStatusSettingsUpdated = (
  controller: StationStatusController
) => {
  trackAudioManager.refreshStationState(controller.callsign);
};
