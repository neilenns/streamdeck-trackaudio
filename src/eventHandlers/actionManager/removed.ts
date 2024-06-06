import TrackAudioManager from "@root/trackAudioManager";

export const handleRemoved = (count: number) => {
  if (count === 0) {
    TrackAudioManager.getInstance().disconnect();
  }
};
