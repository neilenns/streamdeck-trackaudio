import { HotlineController } from "@controllers/hotline";
import ActionManager from "@managers/action";
import TrackAudioManager from "@managers/trackAudio";

export const handleHotlineAdded = (controller: HotlineController) => {
  const trackAudio = TrackAudioManager.getInstance();
  const actionManager = ActionManager.getInstance();

  // If this is the first button added then connect to TrackAudio. That will
  // also cause a dump of the current state of all stations in TrackAudio.
  if (
    actionManager.getHotlineControllers().length === 1 &&
    !trackAudio.isConnected
  ) {
    trackAudio.connect();
  }
  // Otherwise just request the state for the newly added hotline.
  else {
    trackAudio.refreshStationState(controller.primaryCallsign);
    trackAudio.refreshStationState(controller.hotlineCallsign);
  }
};
