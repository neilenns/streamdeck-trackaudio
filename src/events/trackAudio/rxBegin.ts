import { RxBegin } from "@interfaces/messages";
import actionManager from "@managers/action";

/**
 * Updates all actions that match the frequency to show the transmission in progress state.
 * @param data The RxBegin message.
 */
export const handleRxBegin = (data: RxBegin) => {
  const { pFrequencyHz, callsign } = data.value;

  actionManager
    .getStationStatusControllers()
    .filter(
      (entry) => entry.frequency === pFrequencyHz && entry.isListeningForReceive
    )
    .forEach((entry) => {
      entry.isReceiving = true;
      entry.lastReceivedCallsign = callsign;
    });

  // Hotline actions that have a hotline frequency matching the rxBegin frequency
  // also update to show a transmission is occurring.
  actionManager
    .getHotlineControllers()
    .filter((entry) => entry.hotlineFrequency === pFrequencyHz)
    .forEach((entry) => {
      entry.isReceiving = true;
    });
};
