import TrackAudioManager from "../../trackAudioManager";

/**
 * Handles station status actions getting updated by refreshing its current listening
 * status then triggering an image refresh.
 */
export const handleTrackAudioStatusUpdated = () => {
  TrackAudioManager.getInstance().refreshStationStates();
};
