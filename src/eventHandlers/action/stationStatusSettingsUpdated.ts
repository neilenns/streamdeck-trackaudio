import { StationStatusController } from "@controllers/stationStatus";
import trackAudioManager from "@managers/trackAudio";

/**
 * Handles refreshing the station status from TrackAudio when any of the settings are updated
 * on a specific action.
 */
export const handleStationStatusSettingsUpdated = (
  controller: StationStatusController
) => {
  // Issue 182: When the settings change and TrackAudio is voice connected assume
  // the station is *not* in TrackAudio to start and show the unavailable icon.
  // If it is in fact available it will reset to the proper state once refreshStationState
  // data is received. This does cause a brief flicker if the station is actually
  // in TrackAudio but I don't know a better way to handle this.
  if (trackAudioManager.isVoiceConnected) {
    controller.isAvailable = false;
  }
  trackAudioManager.refreshStationState(controller.callsign);
};
