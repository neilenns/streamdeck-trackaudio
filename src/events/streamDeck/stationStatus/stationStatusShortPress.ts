import { isStationStatusController } from "@controllers/stationStatus";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

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
    trackAudioManager.sendMessage({
      type: "kSetStationState",
      value: {
        frequency: foundAction.frequency,
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

  // Send the message to TrackAudio.
  trackAudioManager.sendMessage({
    type: "kSetStationState",
    value: {
      frequency: foundAction.frequency,
      rx: foundAction.listenTo === "rx" ? "toggle" : undefined,
      tx: foundAction.listenTo === "tx" ? "toggle" : undefined,
      xc: foundAction.listenTo === "xc" ? "toggle" : undefined,
      xca: foundAction.listenTo === "xca" ? "toggle" : undefined,
      headset: undefined,
      isOutputMuted: undefined,
    },
  });
};
