import { ApplicationDidLaunchEvent } from "@elgato/streamdeck";
import trackAudioManager from "@managers/trackAudio";
import mainLogger from "@utils/logger";

const logger = mainLogger.child({ service: "applicationDidLaunch" });

export const handleOnApplicationDidLaunch = (ev: ApplicationDidLaunchEvent) => {
  logger.info("Received applicationDidLaunch event", ev.application);
  trackAudioManager.connect();
};
