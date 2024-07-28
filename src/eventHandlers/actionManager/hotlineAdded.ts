import { HotlineController } from "@controllers/hotline";
import ActionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

export const handleHotlineAdded = (controller: HotlineController) => {
  const actionManager = ActionManager.getInstance();

  // If this is the first button added then connect to TrackAudio. That will
  // also cause a dump of the current state of all stations in TrackAudio.
  if (
    actionManager.getHotlineControllers().length === 1 &&
    !trackAudioManager.isConnected
  ) {
    trackAudioManager.connect();
  }
  // Otherwise just request the state for the newly added hotline.
  else {
    trackAudioManager.refreshStationState(controller.primaryCallsign);
    trackAudioManager.refreshStationState(controller.hotlineCallsign);
  }
};
