import TrackAudioManager from "@managers/trackAudio";

export const handleRemoved = (count: number) => {
  if (count === 0) {
    TrackAudioManager.getInstance().disconnect();
  }
};
