import { RxEnd } from "@interfaces/messages";
import actionManager from "@managers/action";

/**
 * Updates all actions that match the callsign to clear the transmission in progress state.
 * @param data The RxEnd event.
 */
export const handleRxEnd = (data: RxEnd) => {
  const { pFrequencyHz } = data.value;

  actionManager
    .getStationStatusControllers()
    .filter(
      (entry) => entry.frequency === pFrequencyHz && entry.isListeningForReceive
    )
    .forEach((entry) => {
      entry.isReceiving = false;
    });

  // Hotline actions that have a hotline pFrequencyHz matching the rxBegin frequency
  // also update to show a transmission is occurring.
  actionManager
    .getHotlineControllers()
    .filter((entry) => entry.hotlineFrequency === pFrequencyHz)
    .forEach((entry) => {
      entry.isReceiving = false;
    });
};
