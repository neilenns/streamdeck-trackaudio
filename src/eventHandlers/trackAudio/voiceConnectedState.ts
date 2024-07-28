import { VoiceConnectedState } from "@interfaces/messages";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import vatsimManager from "@managers/vatsim";

export const handleVoiceConnectedState = (data: VoiceConnectedState) => {
  if (data.value.connected) {
    actionManager.setTrackAudioVoiceConnectedState(true);
    trackAudioManager.refreshStationStates();

    // Only start polling VATSIM if there are ATIS letters.
    if (actionManager.getAtisLetterControllers().length > 0) {
      vatsimManager.start();
    }
  } else {
    actionManager.resetAllButTrackAudio();
    actionManager.setTrackAudioVoiceConnectedState(false);
    vatsimManager.stop();
  }
};
