import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

export const handleConnected = () => {
  actionManager.getTrackAudioStatusControllers().forEach((entry) => {
    entry.isConnected = trackAudioManager.isConnected;
    entry.isVoiceConnected = trackAudioManager.isVoiceConnected;
  });

  actionManager.getMainVolumeControllers().forEach((entry) => {
    entry.isConnected = trackAudioManager.isConnected;
  });

  trackAudioManager.refreshVoiceConnectedState(); // This will force an update of station states as well if voice is connected.
  trackAudioManager.refreshMainVolume(); // This will force an update of the main volume knobs
};
