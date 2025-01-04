import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

/**
 * Handles the short press of a hotline action. Toggles the tx on both the primary and hotline frequency.
 * @param actionId The action id to toggle the state of
 */
export const handleHotlineShortPress = (action: KeyAction) => {
  const foundAction = actionManager
    .getHotlineControllers()
    .find((entry) => entry.action.id === action.id);

  if (!foundAction) {
    return;
  }

  // Catches the case where for some reason both primary and hotline are both
  // set to tx, which should never happen. In that situation pretend the primary
  // is off and hotline is on, which will mean the button push causes the primary
  // to turn on and the hotline to turn off.
  if (foundAction.isTxPrimary === foundAction.isTxHotline) {
    foundAction.isTxPrimary = false;
    foundAction.isTxHotline = true;
  }

  // The primary frequency always gets its xc state toggled to match the tx state,
  // ensuring xc is re-enabled when tx turns on.
  trackAudioManager.sendMessage({
    type: "kSetStationState",
    value: {
      frequency: foundAction.primaryFrequency,
      tx: !foundAction.isTxPrimary,
      rx: undefined,
      xc: !foundAction.isTxPrimary,
      xca: undefined,
      headset: undefined,
      isOutputMuted: undefined,
    },
  });

  // The hotline frequency gets its tx state toggled
  trackAudioManager.sendMessage({
    type: "kSetStationState",
    value: {
      frequency: foundAction.hotlineFrequency,
      tx: !foundAction.isTxHotline,
      rx: undefined,
      xc: undefined,
      xca: undefined,
      headset: undefined,
      isOutputMuted: undefined,
    },
  });
};
