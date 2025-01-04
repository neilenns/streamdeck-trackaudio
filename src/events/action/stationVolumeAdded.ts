import { StationVolumeController } from "@controllers/stationVolume";
import trackAudioManager from "@managers/trackAudio";

export const handleStationVolumeAdded = (
  controller: StationVolumeController
) => {
  if (trackAudioManager.isConnected) {
    trackAudioManager.refreshStationState(controller.callsign);
  }
};
