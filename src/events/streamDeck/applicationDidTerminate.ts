import { ApplicationDidTerminateEvent } from "@elgato/streamdeck";
import mainLogger from "@utils/logger";
import trackAudioManager from "@managers/trackAudio";
import vatsimManager from "@managers/vatsim";

const logger = mainLogger.child({ service: "handleOnApplicationDidTerminate" });

export const handleOnApplicationDidTerminate = (
  ev: ApplicationDidTerminateEvent
) => {
  logger.info("Received applicationDidTerminate event", ev.application);
  trackAudioManager.disconnect();
  vatsimManager.stop();
};
