import ActionManager from "@root/actionManager";
import { StationStates } from "../../interfaces/messages";

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
