import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

export const handleConnected = () => {
  actionManager.getTrackAudioStatusControllers().forEach((entry) => {
    entry.refreshDisplay();
  });

  actionManager.getMainVolumeControllers().forEach((entry) => {
    entry.refreshDisplay();
  });

  trackAudioManager.refreshVoiceConnectedState(); // This will force an update of station states as well if voice is connected.
};
