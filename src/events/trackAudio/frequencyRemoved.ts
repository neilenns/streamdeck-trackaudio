import { FrequencyRemoved } from "@interfaces/messages";
import actionManager from "@managers/action";

/**
 * Removes the frequency from all actions that depend on it.
 * @param frequency The frequency to remove
 */
export const handleFrequencyRemoved = (data: FrequencyRemoved) => {
  const { frequency } = data.value;

  actionManager
    .getStationStatusControllers()
    .filter((entry) => entry.frequency === frequency)
    .forEach((entry) => (entry.frequency = 0));

  actionManager.getHotlineControllers().forEach((entry) => {
    if (entry.primaryFrequency === frequency) {
      entry.primaryFrequency = 0;
    }
    if (entry.hotlineFrequency === frequency) {
      entry.hotlineFrequency = 0;
    }
  });
};
