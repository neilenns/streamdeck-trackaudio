import { DialAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";
import mainLogger from "@utils/logger";

const logger = mainLogger.child({ service: "stationVolume" });

/**
 * Toggles the mute setting on the station.
 * @param action The action that triggered the press
 */
export const handleStationVolumeDialPress = (action: DialAction) => {
  const savedAction = actionManager
    .getStationVolumeControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  if (!savedAction.pushToMute) {
    logger.info(
      `Station volume action ${
        savedAction.callsign ?? "undefined"
      } does not have push to mute enabled.`
    );
    return;
  }

  trackAudioManager.sendMessage({
    type: "kSetStationState",
    value: {
      frequency: savedAction.frequency,
      isOutputMuted: "toggle",
      rx: undefined,
      xc: undefined,
      xca: undefined,
      headset: undefined,
      tx: undefined,
    },
  });
};
