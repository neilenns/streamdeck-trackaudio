import { updateTxState } from "@helpers/helpers";
import { TxEnd } from "@interfaces/messages";

export const handleTxEnd = (data: TxEnd) => {
  updateTxState(data);
};
