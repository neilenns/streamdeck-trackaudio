import { updateRxState } from "../../helpers/helpers";
import { RxEnd } from "../../types/messages";

export const handleRxEnd = (data: RxEnd) => {
  updateRxState(data);
};
