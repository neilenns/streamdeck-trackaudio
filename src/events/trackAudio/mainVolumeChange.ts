import { MainVolumeChange } from "@interfaces/messages";
import actionManager from "@managers/action";

/**
 * Updates all main volume controllers to reflect the new main volume.
 * @param data The RxBegin message.
 */
export const handleMainVolumeChange = (data: MainVolumeChange) => {
  actionManager.getMainVolumeControllers().forEach((entry) => {
    entry.volume = data.value.volume;
  });
};
