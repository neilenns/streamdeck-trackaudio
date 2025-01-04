import { HotlineController } from "@controllers/hotline";
import trackAudioManager from "@managers/trackAudio";

/**
 * Handles refreshing the hotline status from TrackAudio when any of the settings are updated
 * on a specific action.
 */
export const handleHotlineSettingsUpdated = (controller: HotlineController) => {
  trackAudioManager.refreshStationState(controller.primaryCallsign);
  trackAudioManager.refreshStationState(controller.hotlineCallsign);
};
