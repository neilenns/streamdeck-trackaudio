import { StationVolumeSettings } from "@actions/stationVolume";
import { StationVolumeController } from "@controllers/stationVolume";
import { DialAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import logger from "@utils/logger";

/**
 * Adds a station volume action to the action list. Emits a stationVolumeAdded
 * event after the action is added.
 * @param action The action
 * @param settings The settings for the action
 */
export const handleAddStationVolume = (
  action: DialAction,
  settings: StationVolumeSettings
) => {
  const childLogger = logger.child({ service: "handleAddStationVolume" });

  try {
    const controller = new StationVolumeController(action, settings);

    actionManager.add(controller);
    actionManager.emit("stationVolumeAdded", controller);
    actionManager.emit("actionAdded", controller);
  } catch (error) {
    childLogger.error("Error in handleAddStationVolume:", error);
  }
};
