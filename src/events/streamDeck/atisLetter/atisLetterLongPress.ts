import { KeyAction } from "@elgato/streamdeck";
import { handleAsyncException } from "@utils/handleAsyncException";
import actionManager from "@managers/action";
import vatsimManager from "@managers/vatsim";

/**
 * Called when an ATIS letter action has a long press. Refreshses the ATIS.
 * @param actionId The ID of the action that had the long press
 */
export const handleAtisLetterLongPress = (action: KeyAction) => {
  const savedAction = actionManager
    .getAtisLetterControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  savedAction.reset();
  vatsimManager.refresh();

  action.showOk().catch((error: unknown) => {
    handleAsyncException("Unable to show OK on ATIS button:", error);
  });
};
