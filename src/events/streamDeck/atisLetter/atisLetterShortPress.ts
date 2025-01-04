import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Called when an ATIS letter action has a short press. Clears the state.
 * @param actionId The ID of the action that had the short press
 */
export const handleAtisLetterShortPress = (action: KeyAction) => {
  const savedAction = actionManager
    .getAtisLetterControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  savedAction.isUpdated = false;
};
