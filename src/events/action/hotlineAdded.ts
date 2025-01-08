import { HotlineController } from "@controllers/hotline";
import trackAudioManager from "@managers/trackAudio";
import logger from "@utils/logger";

export const handleHotlineAdded = (controller: HotlineController) => {
  try {
    if (trackAudioManager.isConnected) {
      trackAudioManager.refreshStationState(controller.primaryCallsign);
      trackAudioManager.refreshStationState(controller.hotlineCallsign);
    }
  } catch (error) {
    logger.error("Error in handleHotlineAdded:", error);
  }
};
