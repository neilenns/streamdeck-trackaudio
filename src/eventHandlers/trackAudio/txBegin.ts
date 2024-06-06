import { updateTxState } from "../../helpers/helpers";
import { TxBegin } from "../../types/messages";

export const handleTxBegin = (data: TxBegin) => {
  updateTxState(data);
};
