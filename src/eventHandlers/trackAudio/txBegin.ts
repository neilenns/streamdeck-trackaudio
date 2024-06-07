import ActionManager from "@managers/action";

export const handleTxBegin = () => {
  ActionManager.getInstance().txBegin();
};
