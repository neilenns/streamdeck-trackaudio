import ActionManager from "../../actionManager";
import TrackAudioManager from "../../trackAudioManager";

export const handleDisconnected = () => {
  const actionManager = ActionManager.getInstance();
  const trackAudio = TrackAudioManager.getInstance();

  console.log("Plugin detected loss of connection to TrackAudio");
  actionManager.setTrackAudioConnectionState(trackAudio.isConnected());
  actionManager.setIsListeningOnAll(false);
};