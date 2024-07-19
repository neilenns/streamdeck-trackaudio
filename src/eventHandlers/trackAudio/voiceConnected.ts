import ActionManager from "@managers/action";

export const handleVoiceConnected = () => {
  const actionManager = ActionManager.getInstance();

  actionManager.setTrackAudioVoiceConnectedState(true);
};
