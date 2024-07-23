import { StationAdded } from "@interfaces/messages";
import ActionManager from "@managers/action";

export const handleStationAdded = (data: StationAdded) => {
  const actionManager = ActionManager.getInstance();

  actionManager.setStationFrequency(data.value.callsign, data.value.frequency);
};
