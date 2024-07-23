import ActionManager from "@managers/action";
import TrackAudioManager from "@managers/trackAudio";

export const handleConnected = () => {
  const actionManager = ActionManager.getInstance();
  const trackAudio = TrackAudioManager.getInstance();

  actionManager.setTrackAudioConnectionState(trackAudio.isConnected);
  trackAudio.refreshVoiceConnectedState(); // This will force an update of station states as well if voice is connected.
};
