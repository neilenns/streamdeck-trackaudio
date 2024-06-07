import { StationStateUpdate } from "@interfaces/messages";
import ActionManager from "@managers/action";

/**
 * Receives the state for a single station from TrackAudio and updates the appropriate
 * StreamDeck action with the new data.
 */
export const handleStationStateUpdate = (data: StationStateUpdate) => {
  ActionManager.getInstance().updateStationState(data);
};
