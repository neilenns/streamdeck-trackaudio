import { FrequencyRemoved } from "@interfaces/messages";
import actionManager from "@managers/action";

export const handleFrequencyRemoved = (data: FrequencyRemoved) => {
  actionManager.removeFrequency(data.value.frequency);
};
