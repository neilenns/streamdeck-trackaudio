import { updateRxState } from "@helpers/helpers";
import { RxBegin } from "@interfaces/messages";

export const handleRxBegin = (data: RxBegin) => {
  updateRxState(data);
};
