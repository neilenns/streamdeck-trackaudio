import ActionManager from "@managers/action";
import TrackAudioManager from "@managers/trackAudio";
import VatsimManager from "@managers/vatsim";

export const handleConnected = () => {
  const actionManager = ActionManager.getInstance();
  const trackAudio = TrackAudioManager.getInstance();
  const vatsimManager = VatsimManager.getInstance();

  actionManager.setTrackAudioConnectionState(trackAudio.isConnected());
  trackAudio.refreshStationStates();
  trackAudio.refreshVoiceConnectedState();

  // Only start polling VATSIM if there are ATIS letters.
  if (actionManager.getAtisLetterControllers().length > 0) {
    vatsimManager.start();
  }
};
