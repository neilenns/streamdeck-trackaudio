import ActionManager from "@managers/action";
import VatsimManager from "@managers/vatsim";

export const handleDisconnected = () => {
  const actionManager = ActionManager.getInstance();
  const vatsimManager = VatsimManager.getInstance();

  actionManager.resetAll();
  vatsimManager.stop();
};
