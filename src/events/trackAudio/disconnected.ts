import actionManager from "@managers/action";
import vatsimManager from "@managers/vatsim";

export const handleDisconnected = () => {
  actionManager.resetAll();
  vatsimManager.stop();
};
