import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import { handleAsyncException } from "@utils/handleAsyncException";

/**
 * Called when a hotline action has a long press. Resets the
 * station status and refreshses its state.
 * @param actionId The ID of the action that had the long press
 */
export const handleHotlineLongPress = (action: KeyAction) => {
  const foundAction = actionManager
    .getHotlineControllers()
    .find((entry) => entry.action.id === action.id);

  if (!foundAction) {
    return;
  }

  foundAction.reset();
  trackAudioManager.refreshStationState(foundAction.primaryCallsign);
  trackAudioManager.refreshStationState(foundAction.hotlineCallsign);

  action.showOk().catch((error: unknown) => {
    handleAsyncException(
      "Unable to show OK status on TrackAudio action: ",
      error
    );
  });
};
