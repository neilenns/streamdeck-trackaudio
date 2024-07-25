import { FrequencyRemoved } from "@interfaces/messages";
import ActionManager from "@managers/action";

export const handleFrequencyRemoved = (data: FrequencyRemoved) => {
  const actionManager = ActionManager.getInstance();

  actionManager.removeFrequency(data.value.frequency);
};
