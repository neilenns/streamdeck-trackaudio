import { VoiceConnectedState } from "@interfaces/messages";
import ActionManager from "@managers/action";
import VatsimManager from "@managers/vatsim";

export const handleVoiceConnectedState = (data: VoiceConnectedState) => {
  const actionManager = ActionManager.getInstance();
  const vatsimManager = VatsimManager.getInstance();

  if (data.value.connected) {
    actionManager.setTrackAudioVoiceConnectedState(true);

    // Only start polling VATSIM if there are ATIS letters.
    if (actionManager.getAtisLetterControllers().length > 0) {
      vatsimManager.start();
    }
  } else {
    actionManager.setTrackAudioVoiceConnectedState(false);
    actionManager.setIsListeningOnAll(false);
    vatsimManager.stop();
  }
};
