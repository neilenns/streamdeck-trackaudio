import { VoiceConnectedState } from "@interfaces/messages";
import ActionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import VatsimManager from "@managers/vatsim";

export const handleVoiceConnectedState = (data: VoiceConnectedState) => {
  const actionManager = ActionManager.getInstance();
  const vatsimManager = VatsimManager.getInstance();

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
