import { HotlineController } from "@controllers/hotline";
import trackAudioManager from "@managers/trackAudio";

export const handleHotlineAdded = (controller: HotlineController) => {
  if (trackAudioManager.isConnected) {
    trackAudioManager.refreshStationState(controller.primaryCallsign);
    trackAudioManager.refreshStationState(controller.hotlineCallsign);
  }
};
