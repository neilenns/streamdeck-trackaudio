import { StationStates } from "@interfaces/messages";
import ActionManager from "@managers/action";

/**
 * Receives the state of all active stations from TrackAudio and updates the appropriate
 * StreamDeck actions with the new data.
 */
export const handleStationStates = (data: StationStates) => {
  const actionManager = ActionManager.getInstance();

  data.value.stations.forEach((station) => {
    actionManager.updateStationState(station);
  });
};
