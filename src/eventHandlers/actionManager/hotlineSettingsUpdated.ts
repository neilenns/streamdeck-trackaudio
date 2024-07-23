import { HotlineController } from "@controllers/hotline";
import TrackAudioManager from "@managers/trackAudio";

/**
 * Handles refreshing the hotline status from TrackAudio when any of the settings are updated
 * on a specific action.
 */
export const handleHotlineSettingsUpdated = (controller: HotlineController) => {
  const trackAudio = TrackAudioManager.getInstance();

  trackAudio.refreshStationState(controller.primaryCallsign);
  trackAudio.refreshStationState(controller.hotlineCallsign);
};
