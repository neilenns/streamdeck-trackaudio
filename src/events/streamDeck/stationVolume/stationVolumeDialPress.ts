import { DialAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

/**
 * Toggles the mute setting on the station.
 * @param action The action that triggered the press
 */
export const handleStationVolumeDialPress = (action: DialAction) => {
  const savedAction = actionManager
    .getStationVolumeControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  trackAudioManager.sendMessage({
    type: "kSetStationState",
    value: {
      frequency: savedAction.frequency,
      isOutputMuted: "toggle",
      rx: undefined,
      xc: undefined,
      xca: undefined,
      headset: undefined,
      tx: undefined,
    },
  });
};
