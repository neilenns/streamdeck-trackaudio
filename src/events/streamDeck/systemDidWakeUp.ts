import trackAudioManager from "@managers/trackAudio";
import mainLogger from "@utils/logger";

export const handleOnSystemDidWakeUp = () => {
  const logger = mainLogger.child({ service: "systemDidWakeUp" });

  logger.info("Received systemDidWakeUp event");

  // This ensures reconnection to the TrackAudio manager if somehow the websocket
  // connection doesn't automatically start back up after a system wake.
  if (trackAudioManager.isAppRunning) {
    trackAudioManager.connect();
  }
};
