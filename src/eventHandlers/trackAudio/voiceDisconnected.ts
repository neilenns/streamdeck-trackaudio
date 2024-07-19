import ActionManager from "@managers/action";

export const handleVoiceDisconnected = () => {
  const actionManager = ActionManager.getInstance();

  actionManager.setTrackAudioVoiceConnectedState(false);
  actionManager.setIsListeningOnAll(false);
};
