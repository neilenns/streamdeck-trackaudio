import { RxBegin } from "@interfaces/messages";
import actionManager from "@managers/action";

export const handleRxBegin = (data: RxBegin) => {
  actionManager.rxBegin(data.value.pFrequencyHz, data.value.callsign);
};
