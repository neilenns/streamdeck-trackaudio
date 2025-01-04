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
    .getMainVolumeControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  // Calculate the change amount
  const amount = Math.min(
    100,
    Math.max(-100, savedAction.changeAmount * ticks)
  );

  // Set the volume
  trackAudioManager.sendMessage({
    type: "kChangeMainVolume",
    value: {
      amount,
    },
  });
};
