import { AtisLetterController } from "@controllers/atisLetter";
import trackAudioManager from "@managers/trackAudio";
import VatsimManager from "@managers/vatsim";

/**
 * Handles refreshing the ATIS letter action and VATSIM data when the action's
 * settings changed.
 */
export const handleAtisLetterUpdated = (controller: AtisLetterController) => {
  controller.letter = undefined;

  // Only refresh if voice is connected
  if (trackAudioManager.isVoiceConnected) VatsimManager.getInstance().refresh();
};
