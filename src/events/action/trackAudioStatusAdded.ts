import actionManager from "@managers/action";

export const handleTrackAudioStatusAdded = () => {
  // Refresh the button state so the new button gets the proper state from the start.
  actionManager.updateTrackAudioConnectionState();
};
