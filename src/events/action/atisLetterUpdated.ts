import { AtisLetterController } from "@controllers/atisLetter";
import trackAudioManager from "@managers/trackAudio";
import vatsimManager from "@managers/vatsim";

/**
 * Handles refreshing the ATIS letter action and VATSIM data when the action's
 * settings changed.
 */
export const handleAtisLetterUpdated = (controller: AtisLetterController) => {
  controller.letter = undefined;

  // Only refresh if voice is connected. Show the unavailable
  // icon until the data comes back from VATSIM.
  if (trackAudioManager.isVoiceConnected) {
    controller.isUnavailable = true;
    vatsimManager.refresh();
  }
};
