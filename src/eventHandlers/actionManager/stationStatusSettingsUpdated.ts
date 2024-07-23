import { StationStatusController } from "@controllers/stationStatus";
import TrackAudioManager from "@managers/trackAudio";

/**
 * Handles refreshing the station status from TrackAudio when any of the settings are updated
 * on a specific action.
 */
export const handleStationStatusSettingsUpdated = (
  controller: StationStatusController
) => {
  TrackAudioManager.getInstance().refreshStationState(controller.callsign);
};
