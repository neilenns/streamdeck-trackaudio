import actionManager from "@managers/action";
import vatsimManager from "@managers/vatsim";
import svgManager from "@managers/svg";

export const handleRemoved = (count: number) => {
  if (count === 0) {
    svgManager.reset();
  }

  // If there are no more ATIS letter actions then stop polling VATSIM.
  if (actionManager.getAtisLetterControllers().length === 0) {
    vatsimManager.stop();
  }
};
