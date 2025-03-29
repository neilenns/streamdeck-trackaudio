import { StationStatusController } from "@controllers/stationStatus";
import trackAudioManager from "@managers/trackAudio";
import actionManager from "@managers/action";

export const handleStationStatusAdded = (
  controller: StationStatusController
) => {
  if (trackAudioManager.isConnected) {
    trackAudioManager.refreshStationState(controller.callsign);
    actionManager.trackProfileChanged();
  }
};
