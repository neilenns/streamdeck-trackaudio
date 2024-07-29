import { VoiceConnectedState } from "@interfaces/messages";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import vatsimManager from "@managers/vatsim";

export const handleVoiceConnectedState = (data: VoiceConnectedState) => {
  actionManager.updateTrackAudioConnectionState();

  if (data.value.connected) {
    trackAudioManager.refreshStationStates();

    // Only start polling VATSIM if there are ATIS letters.
    if (actionManager.getAtisLetterControllers().length > 0) {
      vatsimManager.start();
    }
  } else {
    actionManager.resetAllButTrackAudio();
    vatsimManager.stop();
  }
};
