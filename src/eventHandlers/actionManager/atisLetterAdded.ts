import { AtisLetterController } from "@controllers/atisLetter";
import TrackAudioManager from "@managers/trackAudio";
import VatsimManager from "@managers/vatsim";

/**
 * Handles when an ATIS letter is added.
 */
export const handleAtisLetterAdded = (controller: AtisLetterController) => {
  const trackAudio = TrackAudioManager.getInstance();
  const vatsimManager = VatsimManager.getInstance();

  controller.showTitle();

  if (trackAudio.isConnected()) {
    vatsimManager.start();
  }
};
