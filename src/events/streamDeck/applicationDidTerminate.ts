import { ApplicationDidTerminateEvent } from "@elgato/streamdeck";
import mainLogger from "@utils/logger";
import trackAudioManager from "@managers/trackAudio";
import vatsimManager from "@managers/vatsim";

export const handleOnApplicationDidTerminate = (
  ev: ApplicationDidTerminateEvent
) => {
  const logger = mainLogger.child({
    service: "handleOnApplicationDidTerminate",
  });

  logger.info("Received applicationDidTerminate event", ev.application);
  trackAudioManager.isAppRunning = false;
  trackAudioManager.disconnect();
  vatsimManager.stop();
};
