import { AtisLetterController } from "@controllers/atisLetter";
import VatsimManager from "@managers/vatsim";

/**
 * Handles refreshing the ATIS letter action and VATSIM data when the action's
 * settings changed.
 */
export const handleAtisLetterUpdated = (action: AtisLetterController) => {
  action.letter = undefined;
  VatsimManager.getInstance().refresh();
};
