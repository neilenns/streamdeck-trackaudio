import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import { handleAsyncException } from "@utils/handleAsyncException";

/**
 * Called when a station status action has a long press.
 * Either toggles mute or refreshes the station status depending on the user's setting.
 * @param actionId The ID of the action that had the long press
 */
export const handleStationStatusLongPress = (action: KeyAction) => {
  const foundAction = actionManager
    .getStationStatusControllers()
    .find((entry) => entry.action.id === action.id);

  if (!foundAction) {
    return;
  }

  // Mute if that's the requested action.
  if (foundAction.toggleMuteOnLongPress) {
    foundAction.toggleMute();
  }

  // Speaker if that's the requested action.
  if (foundAction.toggleSpeakerOnLongPress) {
    foundAction.toggleSpeaker();
  }

  // If mute or speaker toggle isn't enabled, refresh the station state.
  if (
    !foundAction.toggleMuteOnLongPress &&
    !foundAction.toggleSpeakerOnLongPress
  ) {
    foundAction.reset();
    trackAudioManager.refreshStationState(foundAction.callsign);
  }

  action.showOk().catch((error: unknown) => {
    handleAsyncException("Unable to show OK on station status button:", error);
  });
};
