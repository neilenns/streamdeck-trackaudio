import { RxBegin } from "@interfaces/messages";
import ActionManager from "@managers/action";

export const handleRxBegin = (data: RxBegin) => {
  console.log(`Receive started on: ${data.value.pFrequencyHz.toString()}`);
  ActionManager.getInstance().rxBegin(
    data.value.pFrequencyHz,
    data.value.callsign
  );
};
