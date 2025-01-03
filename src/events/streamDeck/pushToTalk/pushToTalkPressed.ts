import trackAudioManager from "@managers/trackAudio";

/**
 * Sends a message via TrackAudioManager to indicate a PushToTalk action was pressed.
 */
export const handlePushToTalkPressed = () => {
  trackAudioManager.sendMessage({ type: "kPttPressed" });
};
