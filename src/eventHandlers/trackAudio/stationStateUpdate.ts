import { StationStateUpdate } from "@interfaces/messages";
import actionManager from "@managers/action";

/**
 * Receives the state for a single station from TrackAudio and updates the appropriate
 * StreamDeck action with the new data.
 */
export const handleStationStateUpdate = (data: StationStateUpdate) => {
  actionManager.updateStationState(data);
};
