import { MainVolumeChange } from "@interfaces/messages";
import actionManager from "@managers/action";
import mainLogger from "@utils/logger";

const logger = mainLogger.child({ service: "handleMainVolumeChange" });

/**
 * Updates all main volume controllers to reflect the new main volume.
 * @param data The MainVolumeChange message containing the new volume value.
 */
export const handleMainVolumeChange = (data: MainVolumeChange) => {
  if (
    typeof data.value.volume !== "number" ||
    data.value.volume < 0 ||
    data.value.volume > 100
  ) {
    logger.error("Invalid volume value", data);
    return;
  }

  try {
    actionManager.getMainVolumeControllers().forEach((entry) => {
      entry.volume = data.value.volume;
    });
  } catch (error: unknown) {
    logger.error("Failed to update main volume controllers", error);
  }
};
