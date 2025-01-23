import { isStationStatusController } from "@controllers/stationStatus";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Handles a short press of a station status action. Toggles the
 * the tx, rx, xc, or spkr state of a frequency bound to a Stream Deck action.
 * @param actionId The action id to toggle the state of
 */
export const handleStationStatusShortPress = (action: KeyAction) => {
  const foundAction = actionManager.find(
    (entry) => entry.action.id === action.id
  );

  if (!foundAction || !isStationStatusController(foundAction)) {
    return;
  }

  // Don't try and do anything on a station that doesn't have a frequency (typically this means it doesn't exist)
  if (foundAction.frequency === 0) {
    return;
  }

  // Mute if that's the requested action.
  if (foundAction.toggleMuteOnPress) {
    foundAction.toggleMute();
    return;
  }

  if (foundAction.toggleSpeakerOnPress) {
    foundAction.toggleSpeaker();
    return;
  }

  // If mute or speaker isn't set then toggle listenTo.
  foundAction.toggleListenTo();
};
