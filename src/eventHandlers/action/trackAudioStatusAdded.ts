import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

export const handleTrackAudioStatusAdded = () => {
  if (trackAudioManager.isConnected) {
    // Refresh the button state so the new button gets the proper state from the start.
    actionManager.setTrackAudioConnectionState(trackAudioManager.isConnected);
  }
};
