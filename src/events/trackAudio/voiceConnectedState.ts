import { VoiceConnectedState } from "@interfaces/messages";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import vatsimManager from "@managers/vatsim";

export const handleVoiceConnectedState = async (data: VoiceConnectedState) => {
  actionManager.updateTrackAudioConnectionState();

  if (data.value.connected) {
    trackAudioManager.refreshStationStates();
    trackAudioManager.refreshMainVolume(); // This will force an update of the main volume knobs

    // Only start polling VATSIM if there are ATIS letters.
    if (actionManager.getAtisLetterControllers().length > 0) {
      vatsimManager.start();
    }

    // Auto-add all tracked stations
    await actionManager.autoAddStations();
  } else {
    actionManager.resetAllButTrackAudio();
    vatsimManager.stop();
  }
};
