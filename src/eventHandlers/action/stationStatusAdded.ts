import { StationStatusController } from "@controllers/stationStatus";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

export const handleStationStatusAdded = (
  controller: StationStatusController
) => {
  // If this is the first button added then connect to TrackAudio. That will
  // also cause a dump of the current state of all stations in TrackAudio.
  if (
    actionManager.getStationStatusControllers().length === 1 &&
    !trackAudioManager.isConnected
  ) {
    trackAudioManager.connect();
  }
  // Otherwise just request the state for the newly added station status.
  else {
    trackAudioManager.refreshStationState(controller.callsign);
  }
};
