import ActionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

export const handleTrackAudioStatusAdded = () => {
  const actionManager = ActionManager.getInstance();

  if (
    actionManager.getTrackAudioStatusControllers().length === 1 &&
    !trackAudioManager.isConnected
  ) {
    trackAudioManager.connect();
  } else {
    // Refresh the button state so the new button gets the proper state from the start.
    actionManager.setTrackAudioConnectionState(trackAudioManager.isConnected);
  }
};
