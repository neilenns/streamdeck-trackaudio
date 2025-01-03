import actionManager from "@managers/action";

/**
 * Updates all actions that are listening to tx to show the transmission in progress state.
 */
export const handleTxBegin = () => {
  actionManager
    .getStationStatusControllers()
    .filter((entry) => entry.isListeningForTransmit)
    .forEach((entry) => {
      entry.isTransmitting = true;
    });

  actionManager.getPushToTalkControllers().forEach((entry) => {
    entry.isTransmitting = true;
  });
};
