import { VatsimData, Atis } from "@interfaces/vatsim";
import ActionManager from "@managers/action";

export const handleVatsimDataReceived = (data: VatsimData) => {
  const actionManager = ActionManager.getInstance();

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
    if (action.callsign in atisInfo) {
      action.letter = atisInfo[action.callsign].atis_code;
    }
  });
};