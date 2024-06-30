import { RxEnd } from "@interfaces/messages";
import ActionManager from "@managers/action";

export const handleRxEnd = (data: RxEnd) => {
  console.log(`Receive started on: ${data.value.pFrequencyHz.toString()}`);
  ActionManager.getInstance().rxEnd(data.value.pFrequencyHz);
};
