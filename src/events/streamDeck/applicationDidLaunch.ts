import { ApplicationDidLaunchEvent } from "@elgato/streamdeck";
import trackAudioManager from "@managers/trackAudio";
import mainLogger from "@utils/logger";

export const handleOnApplicationDidLaunch = (ev: ApplicationDidLaunchEvent) => {
  const logger = mainLogger.child({ service: "applicationDidLaunch" });

  logger.info("Received applicationDidLaunch event", ev.application);
  trackAudioManager.isAppRunning = true;
  trackAudioManager.connect();
};
