import { TrackAudioStatusSettings } from "@actions/trackAudioStatus";
import { TrackAudioStatusController } from "@controllers/trackAudioStatus";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import logger from "@utils/logger";

/**
 * Adds a TrackAudio status action to the action list. Emits a trackAudioStatusAdded event
 * after the action is added.
 * @param action The action to add
 * @param settings The settings to use
 */
export const handleAddTrackAudioStatus = (
  action: KeyAction,
  settings: TrackAudioStatusSettings
) => {
  const childLogger = logger.child({ service: "handleAddTrackAudioStatus" });

  try {
    const controller = new TrackAudioStatusController(action, settings);

    actionManager.add(controller);
    actionManager.emit("trackAudioStatusAdded", controller);
    actionManager.emit("actionAdded", controller);
  } catch (error) {
    childLogger.error("Error in handleAddTrackAudioStatus:", error);
  }
};
