import ActionManager from "@managers/action";
import VatsimManager from "@managers/vatsim";
import svgManager from "@managers/svg";
import trackAudioManager from "@managers/trackAudio";

export const handleRemoved = (count: number) => {
  if (count === 0) {
    trackAudioManager.disconnect();
    svgManager.reset();
  }

  // If there are no more ATIS letter actions then stop polling VATSIM.
  if (ActionManager.getInstance().getAtisLetterControllers().length === 0) {
    VatsimManager.getInstance().stop();
  }
};
