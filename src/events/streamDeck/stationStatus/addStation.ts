import { StationSettings } from "@actions/stationStatus";
import { StationStatusController } from "@controllers/stationStatus";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

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
  const controller = new StationStatusController(action, settings);

  actionManager.add(controller);
  actionManager.emit("stationStatusAdded", controller);
  actionManager.emit("actionAdded", controller);
};
