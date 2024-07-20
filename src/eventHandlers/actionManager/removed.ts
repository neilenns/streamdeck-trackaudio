import ActionManager from "@managers/action";
import TrackAudioManager from "@managers/trackAudio";
import VatsimManager from "@managers/vatsim";

export const handleRemoved = (count: number) => {
  if (count === 0) {
    TrackAudioManager.getInstance().disconnect();
  }

  // If there are no more ATIS letter actions then stop polling VATSIM.
  if (ActionManager.getInstance().getAtisLetterControllers().length === 0) {
    VatsimManager.getInstance().stop();
  }
};
