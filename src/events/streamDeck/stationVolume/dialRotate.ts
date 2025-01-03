import { DialAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

/**
 * Changes the station volume by the number of ticks times the change amount.
 * @param action The action that triggered the volume change
 * @param ticks The number of ticks the dial was rotated
 */
export const handleDialRotate = (action: DialAction, ticks: number) => {
  const savedAction = actionManager
    .getStationVolumeControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  // Calculate the new volume level
  const newVolume = Math.min(
    100,
    Math.max(0, savedAction.changeAmount * ticks)
  );

  // Unmute the station since the knob was turned
  trackAudioManager.sendMessage({
    type: "kSetStationState",
    value: {
      frequency: savedAction.frequency,
      isOutputMuted: false,
      rx: undefined,
      xc: undefined,
      xca: undefined,
      headset: undefined,
      tx: undefined,
    },
  });

  // Set the volume
  trackAudioManager.sendMessage({
    type: "kChangeStationVolume",
    value: {
      frequency: savedAction.frequency,
      amount: newVolume,
    },
  });
};
