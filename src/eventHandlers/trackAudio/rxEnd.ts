import { updateRxState } from "@helpers/helpers";
import { RxEnd } from "../../interfaces/messages";

export const handleRxEnd = (data: RxEnd) => {
  updateRxState(data);
};
