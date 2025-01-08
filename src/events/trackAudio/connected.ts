import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import logger from "@utils/logger";

export const handleConnected = () => {
  const childLogger = logger.child({ service: "handleConnected" });

  try {
    actionManager.updateTrackAudioConnectionState();
    trackAudioManager.refreshVoiceConnectedState(); // This will force an update of station states as well if voice is connected.
  } catch (error) {
    childLogger.error("Error in handleConnected:", error);
  }
};
