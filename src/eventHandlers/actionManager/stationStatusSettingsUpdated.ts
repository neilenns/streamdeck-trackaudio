import { StationStatusAction } from "@root/stationStatusAction";
import TrackAudioManager from "@root/trackAudioManager";

/**
 * Handles refreshing the station status from TrackAudio when any of the settings are updated
 * on a specific action.
 */
export const handleStationStatusSettingsUpdated = (
  action: StationStatusAction
) => {
  TrackAudioManager.getInstance().refreshStationState(action.settings.callsign);
};
