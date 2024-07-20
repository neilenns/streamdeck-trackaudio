import ActionManager from "@managers/action";
import TrackAudioManager from "@managers/trackAudio";
import VatsimManager from "@managers/vatsim";

export const handleDisconnected = () => {
  const actionManager = ActionManager.getInstance();
  const trackAudio = TrackAudioManager.getInstance();
  const vatsimManager = VatsimManager.getInstance();

  console.log("Plugin detected loss of connection to TrackAudio");
  actionManager.setTrackAudioConnectionState(trackAudio.isConnected());
  actionManager.setIsListeningOnAll(false);
  actionManager.resetAtisLetterOnAll();

  vatsimManager.stop();
};
