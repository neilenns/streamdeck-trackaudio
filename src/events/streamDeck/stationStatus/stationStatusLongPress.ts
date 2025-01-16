import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import { handleAsyncException } from "@utils/handleAsyncException";

/**
 * Called when a station status action has a long press. Resets the
 * station status and refreshes its state.
 * @param actionId The ID of the action that had the long press
 */
export const handleStationStatusLongPress = (action: KeyAction) => {
  const savedAction = actionManager
    .getStationStatusControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  // Mute if that's the requested action.
  if (savedAction.toggleMuteOnLongPress) {
    trackAudioManager.sendMessage({
      type: "kSetStationState",
      value: {
        frequency: savedAction.frequency,
        isOutputMuted: "toggle",
        rx: undefined,
        tx: undefined,
        xc: undefined,
        xca: undefined,
        headset: undefined,
      },
    });
    return;
  }

  // Otherwise reset and refresh
  savedAction.reset();
  trackAudioManager.refreshStationState(savedAction.callsign);

  action.showOk().catch((error: unknown) => {
    handleAsyncException("Unable to show OK on station status button:", error);
  });
};
