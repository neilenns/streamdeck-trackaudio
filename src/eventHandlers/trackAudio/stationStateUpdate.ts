import {
  isStationStateUpdateAvailable,
  isStationStateUpdateNotAvailable,
  StationStateUpdate,
} from "@interfaces/messages";
import actionManager from "@managers/action";

/**
 * Receives the state for a single station from TrackAudio and updates the appropriate
 * StreamDeck action with the new data.
 */
export const handleStationStateUpdate = (data: StationStateUpdate) => {
  if (isStationStateUpdateAvailable(data)) {
    actionManager.updateStationState(data);
  } else if (isStationStateUpdateNotAvailable(data)) {
    actionManager.setStationUnavailable(data.value.callsign);
  }
};
