import { MainOutputVolumeChange } from "@interfaces/messages";
import actionManager from "@managers/action";

/**
 * Updates all main volume controllers to reflect the new main output volume.
 * @param data The RxBegin message.
 */
export const handleMainOutputVolumeChange = (data: MainOutputVolumeChange) => {
  actionManager.getMainVolumeControllers().forEach((entry) => {
    entry.volume = data.value.volume;
  });
};
