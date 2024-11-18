import { VoiceConnectedState } from "@interfaces/messages";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import vatsimManager from "@managers/vatsim";

export const handleVoiceConnectedState = async (data: VoiceConnectedState) => {
  actionManager.updateTrackAudioConnectionState();

  if (data.value.connected) {
    trackAudioManager.refreshStationStates();

    // Only start polling VATSIM if there are ATIS letters.
    if (actionManager.getAtisLetterControllers().length > 0) {
      vatsimManager.start();
    }

    // Auto-add all tracked callsigns with a 250ms delay between each message
    const trackedCallsigns = actionManager
      .getStationStatusControllers()
      .map((controller) => controller.callsign ?? "");
    await trackAudioManager.addStationWithDelay(trackedCallsigns, 250);
  } else {
    actionManager.resetAllButTrackAudio();
    vatsimManager.stop();
  }
};
