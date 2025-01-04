import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import { handleAsyncException } from "@utils/handleAsyncException";

/**
 * Called when a TrackAudio status action keydown event is triggered.
 * Forces a refresh of the TrackAudio status.
 * @param action The action
 */
export const handleTrackAudioStatusLongPress = (action: KeyAction) => {
  actionManager.resetAll();
  trackAudioManager.refreshVoiceConnectedState(); // This also causes a refresh of the station states
  trackAudioManager.refreshMainVolume(); // This will force an update of the main volume knobs

  action.showOk().catch((error: unknown) => {
    handleAsyncException(
      "Unable to show OK status on TrackAudio action: ",
      error
    );
  });
};
