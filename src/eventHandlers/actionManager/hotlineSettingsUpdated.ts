import { HotlineAction } from "../../hotlineAction";
import TrackAudioManager from "../../trackAudioManager";

/**
 * Handles refreshing the hotline status from TrackAudio when any of the settings are updated
 * on a specific action.
 */
export const handleHotlineSettingsUpdated = (action: HotlineAction) => {
  const trackAudio = TrackAudioManager.getInstance();

  trackAudio.refreshStationState(action.primaryCallsign);
  trackAudio.refreshStationState(action.hotlineCallsign);
};
