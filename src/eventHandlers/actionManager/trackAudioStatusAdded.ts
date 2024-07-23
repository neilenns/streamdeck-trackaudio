import ActionManager from "@managers/action";
import TrackAudioManager from "@managers/trackAudio";

export const handleTrackAudioStatusAdded = () => {
  const actionManager = ActionManager.getInstance();
  const trackAudio = TrackAudioManager.getInstance();

  if (
    actionManager.getTrackAudioStatusControllers().length === 1 &&
    !trackAudio.isConnected
  ) {
    trackAudio.connect();
  } else {
    // Refresh the button state so the new button gets the proper state from the start.
    actionManager.setTrackAudioConnectionState(trackAudio.isConnected);
  }
};
