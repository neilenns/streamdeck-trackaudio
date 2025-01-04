import actionManager from "@managers/action";
import vatsimManager from "@managers/vatsim";
import svgManager from "@managers/svg";
import trackAudioManager from "@managers/trackAudio";

export const handleRemoved = (count: number) => {
  if (count === 0) {
    trackAudioManager.disconnect();
    svgManager.reset();
  }

  // If there are no more ATIS letter actions then stop polling VATSIM.
  if (actionManager.getAtisLetterControllers().length === 0) {
    vatsimManager.stop();
  }

  // If there are no more actions at all stop trying to connect to TrackAudio
  if (actionManager.getActions().length === 0) {
    trackAudioManager.disconnect();
  }
};
