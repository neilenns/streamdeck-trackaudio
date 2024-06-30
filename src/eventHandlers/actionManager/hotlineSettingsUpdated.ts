import { HotlineController } from "@controllers/hotline";
import TrackAudioManager from "@managers/trackAudio";

/**
 * Handles refreshing the hotline status from TrackAudio when any of the settings are updated
 * on a specific action.
 */
export const handleHotlineSettingsUpdated = (action: HotlineController) => {
  const trackAudio = TrackAudioManager.getInstance();

  trackAudio.refreshStationState(action.primaryCallsign);
  trackAudio.refreshStationState(action.hotlineCallsign);
};
