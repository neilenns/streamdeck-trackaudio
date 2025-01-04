import { DialAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

/**
 * Changes the main by the number of ticks times the change amount.
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

  // Set the volume
  trackAudioManager.sendMessage({
    type: "kChangeMainOutputVolume",
    value: {
      amount: newVolume,
    },
  });
};
