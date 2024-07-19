import { VoiceConnectedState } from "@interfaces/messages";
import ActionManager from "@managers/action";

export const handleVoiceConnectedState = (data: VoiceConnectedState) => {
  const actionManager = ActionManager.getInstance();

  if (data.value.connected) {
    actionManager.setTrackAudioVoiceConnectedState(true);
  } else {
    actionManager.setTrackAudioVoiceConnectedState(false);
    actionManager.setIsListeningOnAll(false);
  }
};
