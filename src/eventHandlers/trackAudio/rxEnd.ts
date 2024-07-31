import { RxEnd } from "@interfaces/messages";
import actionManager from "@managers/action";

export const handleRxEnd = (data: RxEnd) => {
  actionManager.rxEnd(data.value.pFrequencyHz);
};
