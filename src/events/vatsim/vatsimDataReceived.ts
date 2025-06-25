import { VatsimData, Atis } from "@interfaces/vatsim";
import actionManager from "@managers/action";

export const handleVatsimDataReceived = (data: VatsimData) => {
  // Build a dictionary of the ATIS information
  const atisInfo = data.atis.reduce<Record<string, Atis>>((dict, atis) => {
    dict[atis.callsign] = atis;
    return dict;
  }, {});

  actionManager.getAtisLetterControllers().forEach((action) => {
    if (!action.callsign) {
      return;
    }

    // Look for the callsign in the returned ATIS info. If it's found set the letter.
    // If not set the isUnavailable flag to show the error to the user.
    if (action.callsign in atisInfo) {
      action.isUnavailable = false;
      action.letter = atisInfo[action.callsign].atis_code;
    } else {
      action.isUnavailable = true;
    }
  });
};
