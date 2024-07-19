import ActionManager from "@managers/action";
import TrackAudioManager from "@managers/trackAudio";

export const handleConnected = () => {
  const actionManager = ActionManager.getInstance();
  const trackAudio = TrackAudioManager.getInstance();

  actionManager.setTrackAudioConnectionState(trackAudio.isConnected());
  trackAudio.refreshStationStates();
  trackAudio.refreshVoiceConnectedState();
};
