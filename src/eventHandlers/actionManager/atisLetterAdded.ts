import { AtisLetterController } from "@controllers/atisLetter";
import trackAudioManager from "@managers/trackAudio";
import VatsimManager from "@managers/vatsim";

/**
 * Handles when an ATIS letter is added.
 */
export const handleAtisLetterAdded = (controller: AtisLetterController) => {
  const vatsimManager = VatsimManager.getInstance();

  controller.refreshTitle();

  if (trackAudioManager.isVoiceConnected) {
    vatsimManager.start();
  }
};
