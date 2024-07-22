import { AtisLetterController } from "@controllers/atisLetter";
import TrackAudioManager from "@managers/trackAudio";
import VatsimManager from "@managers/vatsim";

/**
 * Handles refreshing the ATIS letter action and VATSIM data when the action's
 * settings changed.
 */
export const handleAtisLetterUpdated = (action: AtisLetterController) => {
  action.letter = undefined;

  // Only refresh if voice is connected
  if (TrackAudioManager.getInstance().isVoiceConnected)
    VatsimManager.getInstance().refresh();
};
