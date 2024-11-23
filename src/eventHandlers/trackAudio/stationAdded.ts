import { StationAdded } from "@interfaces/messages";
import actionManager from "@managers/action";

export const handleStationAdded = (data: StationAdded) => {
  actionManager.setStationFrequency(data.value.callsign, data.value.frequency);
  actionManager.autoSet(data.value.frequency);
};
