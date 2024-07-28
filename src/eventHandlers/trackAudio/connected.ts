import ActionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

export const handleConnected = () => {
  const actionManager = ActionManager.getInstance();

  actionManager.setTrackAudioConnectionState(trackAudioManager.isConnected);
  trackAudioManager.refreshVoiceConnectedState(); // This will force an update of station states as well if voice is connected.
};
