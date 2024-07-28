import { RxBegin } from "@interfaces/messages";
import actionManager from "@managers/action";

export const handleRxBegin = (data: RxBegin) => {
  console.log(`Receive started on: ${data.value.pFrequencyHz.toString()}`);
  actionManager.rxBegin(data.value.pFrequencyHz, data.value.callsign);
};
