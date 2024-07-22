import { StationStates } from "@interfaces/messages";
import ActionManager from "@managers/action";

/**
 * Receives the state of all active stations from TrackAudio and updates the appropriate
 * StreamDeck actions with the new data.
 */
export const handleStationStates = (data: StationStates) => {
  const actionManager = ActionManager.getInstance();

  // Update the states for all the received data
  data.value.stations.forEach((station) => {
    actionManager.updateStationState(station);
  });

  // Update the stations that aren't available
  actionManager.updateStationsIsAvailable(data.value.stations);
};
