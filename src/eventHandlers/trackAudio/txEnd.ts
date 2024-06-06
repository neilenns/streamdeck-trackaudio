import { updateTxState } from "../../helpers/helpers";
import { TxEnd } from "../../types/messages";

export const handleTxEnd = (data: TxEnd) => {
  updateTxState(data);
};
