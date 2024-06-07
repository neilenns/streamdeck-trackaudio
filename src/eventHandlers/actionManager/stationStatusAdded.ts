import ActionManager from "@managers/action";
import TrackAudioManager from "@managers/trackAudio";

export const handleStationStatusAdded = (callsign: string) => {
  const trackAudio = TrackAudioManager.getInstance();
  const actionManager = ActionManager.getInstance();

  // If this is the first button added then connect to TrackAudio. That will
  // also cause a dump of the current state of all stations in TrackAudio.
  if (actionManager.getStationStatusControllers().length === 1) {
    trackAudio.connect();
  }
  // Otherwise just request the state for the newly added station status.
  else {
    trackAudio.refreshStationState(callsign);
  }
};
