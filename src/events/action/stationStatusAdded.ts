import { StationStatusController } from "@controllers/stationStatus";
import trackAudioManager from "@managers/trackAudio";

export const handleStationStatusAdded = (
  controller: StationStatusController
) => {
  if (trackAudioManager.isConnected) {
    trackAudioManager.refreshStationState(controller.callsign);
  }
};
