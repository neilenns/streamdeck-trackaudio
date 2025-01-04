import {
  isStationStateUpdateAvailable,
  isStationStateUpdateNotAvailable,
  StationStateUpdate,
} from "@interfaces/messages";
import actionManager from "@managers/action";

/**
 * Updates stations to match the provided station state update.
 * If a callsign is provided in the update then all stations with that callsign
 * have their frequency set.
 * @param data The StationStateUpdate message from TrackAudio
 */
export const handleStationStateUpdate = (data: StationStateUpdate) => {
  // If there is a state update available then update everything with it.
  if (isStationStateUpdateAvailable(data)) {
    const { value } = data;
    // First set the frequency if one was provided. This usually comes in the first
    // station state update message from TrackAudio. Setting the frequency also
    // updates the isAvailable state since any station with a frequency is available.
    if (value.callsign) {
      actionManager.setStationFrequency(value.callsign, value.frequency);
    }

    // Set the listen state for all stations using the frequency and refresh the
    // state image.
    actionManager
      .getStationStatusControllers()
      .filter((entry) => entry.frequency === value.frequency)
      .forEach((entry) => {
        entry.isListening =
          (value.rx && entry.listenTo === "rx") ||
          (value.tx && entry.listenTo === "tx") ||
          (value.xc && entry.listenTo === "xc") ||
          (value.xca && entry.listenTo === "xca");

        entry.isOutputMuted = value.isOutputMuted;
        entry.outputVolume = value.outputVolume;

        entry.refreshDisplay();
      });

    // Do the same for hotline actions
    actionManager.getHotlineControllers().forEach((entry) => {
      if (entry.primaryFrequency === value.frequency) {
        entry.isTxPrimary = value.tx;
      }
      if (entry.hotlineFrequency === value.frequency) {
        entry.isTxHotline = value.tx;
        entry.isRxHotline = value.rx;
      }

      entry.refreshDisplay();
    });

    actionManager.getStationVolumeControllers().forEach((entry) => {
      if (entry.frequency === value.frequency) {
        entry.isOutputMuted = value.isOutputMuted;
        entry.outputVolume = value.outputVolume;
      }

      entry.refreshDisplay();
    });

    return;
  }

  // If the station update data wasn't available then set all the affected stations
  // to the unavailable state.
  if (isStationStateUpdateNotAvailable(data)) {
    const { callsign } = data.value;

    // Do all the station status controllers
    actionManager
      .getStationStatusControllers()
      .filter((entry) => entry.callsign === callsign)
      .forEach((entry) => {
        entry.frequency = 0;
      });

    // Do all the station volume controllers
    actionManager
      .getStationVolumeControllers()
      .filter((entry) => entry.callsign === callsign)
      .forEach((entry) => {
        entry.frequency = 0;
      });

    // Do all the hotline controllers
    actionManager.getHotlineControllers().forEach((entry) => {
      if (entry.primaryCallsign === callsign) {
        entry.primaryFrequency = 0;
      }

      if (entry.hotlineCallsign === callsign) {
        entry.hotlineFrequency = 0;
      }
    });

    return;
  }
};
