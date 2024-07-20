import TrackAudioManager from "@managers/trackAudio";
import VatsimManager from "@managers/vatsim";

/**
 * Handles when an ATIS letter is added.
 */
export const handleAtisLetterAdded = () => {
  const trackAudio = TrackAudioManager.getInstance();
  const vatsimManager = VatsimManager.getInstance();

  if (trackAudio.isConnected()) {
    vatsimManager.start();
  }
};
