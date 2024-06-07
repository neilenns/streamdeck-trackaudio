import ActionManager from "@managers/action";

export const handleTxEnd = () => {
  ActionManager.getInstance().txEnd();
};
