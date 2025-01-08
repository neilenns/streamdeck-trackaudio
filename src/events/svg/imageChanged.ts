import actionManager from "@managers/action";
import logger from "@utils/logger";

/**
 * Handles the imageChanged event from the SVG manager. Forces
 * all actions to redraw their background image.
 */
export const handleImageChanged = () => {
  try {
    actionManager.refreshDisplayAll();
  } catch (error) {
    logger.error("Error in handleImageChanged:", error);
  }
};
