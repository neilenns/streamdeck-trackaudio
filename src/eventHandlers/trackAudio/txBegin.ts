import { updateTxState } from "@helpers/helpers";
import { TxBegin } from "@interfaces/messages";

export const handleTxBegin = (data: TxBegin) => {
  updateTxState(data);
};
