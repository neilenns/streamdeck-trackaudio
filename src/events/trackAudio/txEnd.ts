import actionManager from "@managers/action";

/**
 * Updates all actions that are listening to tx to clear the transmission in progress state.
 */
export const handleTxEnd = () => {
  actionManager
    .getStationStatusControllers()
    .filter((entry) => entry.isListeningForTransmit)
    .forEach((entry) => {
      entry.isTransmitting = false;
    });

  actionManager.getPushToTalkControllers().forEach((entry) => {
    entry.isTransmitting = false;
  });
};
