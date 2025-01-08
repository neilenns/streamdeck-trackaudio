import { StationSettings } from "@actions/stationStatus";
import { StationStatusController } from "@controllers/stationStatus";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import logger from "@utils/logger";

/**
 * Adds a station status action to the action list. Emits a stationStatusAdded
 * event after the action is added.
 * @param action The action
 * @param settings The settings for the action
 */
export const handleAddStation = (
  action: KeyAction,
  settings: StationSettings
) => {
  const childLogger = logger.child({ service: "handleAddStation" });

  try {
    const controller = new StationStatusController(action, settings);

    actionManager.add(controller);
    actionManager.emit("stationStatusAdded", controller);
    actionManager.emit("actionAdded", controller);
  } catch (error) {
    childLogger.error("Error in handleAddStation:", error);
  }
};
