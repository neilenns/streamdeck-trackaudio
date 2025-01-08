import actionManager from "@managers/action";
import vatsimManager from "@managers/vatsim";
import logger from "@utils/logger";

export const handleDisconnected = () => {
  const childLogger = logger.child({ service: "handleDisconnected" });

  try {
    actionManager.resetAll();
    vatsimManager.stop();
  } catch (error) {
    childLogger.error("Error in handleDisconnected:", error);
  }
};
