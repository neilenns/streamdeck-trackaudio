import { AtisLetterController } from "@controllers/atisLetter";
import trackAudioManager from "@managers/trackAudio";
import vatsimManager from "@managers/vatsim";

/**
 * Handles when an ATIS letter is added.
 */
export const handleAtisLetterAdded = (controller: AtisLetterController) => {
  controller.refreshTitle();

  if (trackAudioManager.isVoiceConnected) {
    vatsimManager.start();
  }
};
