import { updateRxState } from "../../helpers/helpers";
import { RxBegin } from "../../types/messages";

export const handleRxBegin = (data: RxBegin) => {
  updateRxState(data);
};
