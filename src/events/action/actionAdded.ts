import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import logger from "@utils/logger";

export const handleActionAdded = () => {
  try {
    // If this is the first button added then connect to TrackAudio. That will
    // also cause a dump of the current state of all stations in TrackAudio.
    if (
      actionManager.getActions().length === 1 &&
      !trackAudioManager.isConnected
    ) {
      trackAudioManager.connect();
    }
  } catch (error) {
    logger.error("Error in handleActionAdded:", error);
  }
};
