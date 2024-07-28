import { RxEnd } from "@interfaces/messages";
import actionManager from "@managers/action";

export const handleRxEnd = (data: RxEnd) => {
  console.log(`Receive started on: ${data.value.pFrequencyHz.toString()}`);
  actionManager.rxEnd(data.value.pFrequencyHz);
};
