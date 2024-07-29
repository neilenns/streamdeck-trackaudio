import actionManager from "@managers/action";

/**
 * Handles the imageChanged event from the SVG manager. Forces
 * all actions to redraw their background image.
 */
export const handleImageChanged = () => {
  actionManager.refreshAllImages();
};
