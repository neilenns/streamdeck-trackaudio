import trackAudioManager from "@managers/trackAudio";

export const handleMainVolumeAdded = () => {
  if (trackAudioManager.isConnected) {
    trackAudioManager.refreshMainOutputVolume();
  }
};
