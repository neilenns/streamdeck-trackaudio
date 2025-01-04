import trackAudioManager from "@managers/trackAudio";

/**
 * Sends a message via TrackAudioManager to indicate a PushToTalk action was released.
 */
export const handlePushToTalkReleased = () => {
  trackAudioManager.sendMessage({ type: "kPttReleased" });
};
