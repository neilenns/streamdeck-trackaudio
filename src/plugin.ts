// SDKs
import { VoiceConnectedState } from "@interfaces/messages";
import mainLogger from "@utils/logger";
import streamDeck from "@elgato/streamdeck";

// Managers
import actionManager from "@managers/action";
import svgManager from "@managers/svg";
import trackAudioManager from "@managers/trackAudio";
import vatsimManager from "@managers/vatsim";

// Actions
import { AtisLetter } from "@actions/atisLetter";
import { Hotline } from "@actions/hotline";
import { PushToTalk } from "@actions/pushToTalk";
import { StationStatus } from "@actions/stationStatus";
import { StationVolume } from "@actions/stationVolume";
import { TrackAudioStatus } from "@actions/trackAudioStatus";

// Event handlers
import { handleActionAdded } from "@events/action/actionAdded";
import { handleAtisLetterAdded } from "@events/action/atisLetterAdded";
import { handleAtisLetterUpdated } from "@events/action/atisLetterUpdated";
import { handleConnected } from "@events/trackAudio/connected";
import { handleDisconnected } from "@events/trackAudio/disconnected";
import { handleFrequencyRemoved } from "@events/trackAudio/frequencyRemoved";
import { handleHotlineSettingsUpdated } from "@events/action/hotlineSettingsUpdated";
import { handleImageChanged } from "@events/svg/imageChanged";
import { handleRemoved } from "@events/action/removed";
import { handleRxBegin } from "@events/trackAudio/rxBegin";
import { handleRxEnd } from "@events/trackAudio/rxEnd";
import { handleStationAdded } from "@events/trackAudio/stationAdded";
import { handleStationStates } from "@events/trackAudio/stationStates";
import { handleStationStateUpdate } from "@events/trackAudio/stationStateUpdate";
import { handleStationStatusAdded } from "@events/action/stationStatusAdded";
import { handleStationStatusSettingsUpdated } from "@events/action/stationStatusSettingsUpdated";
import { handleStationVolumeAdded } from "@events/action/stationVolumeAdded";
import { handleTrackAudioStatusAdded } from "@events/action/trackAudioStatusAdded";
import { handleTxBegin } from "@events/trackAudio/txBegin";
import { handleTxEnd } from "@events/trackAudio/txEnd";
import { handleVatsimDataReceived } from "@events/vatsim/vatsimDataReceived";
import { handleVoiceConnectedState } from "@events/trackAudio/voiceConnectedState";
import { handleMainVolumeAdded } from "@events/action/mainVolumeAdded";

const logger = mainLogger.child({ service: "plugin" });

// Flag to prevent handling repeated disconnect events
let disconnectHandled = false;

// Register for uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

// Register all the event handlers
streamDeck.actions.registerAction(new AtisLetter());
streamDeck.actions.registerAction(new Hotline());
streamDeck.actions.registerAction(new PushToTalk());
streamDeck.actions.registerAction(new StationStatus());
streamDeck.actions.registerAction(new TrackAudioStatus());
streamDeck.actions.registerAction(new StationVolume());

trackAudioManager.on("connected", () => {
  disconnectHandled = false;
  handleConnected();
});
trackAudioManager.on("disconnected", () => {
  if (!disconnectHandled) {
    disconnectHandled = true;
    handleDisconnected();
  }
});
trackAudioManager.on("rxBegin", handleRxBegin);
trackAudioManager.on("rxEnd", handleRxEnd);
trackAudioManager.on("stationAdded", handleStationAdded);
trackAudioManager.on("frequencyRemoved", handleFrequencyRemoved);
trackAudioManager.on("stationStates", handleStationStates);
trackAudioManager.on("stationStateUpdate", handleStationStateUpdate);
trackAudioManager.on("txBegin", handleTxBegin);
trackAudioManager.on("txEnd", handleTxEnd);
trackAudioManager.on("voiceConnectedState", (data: VoiceConnectedState) => {
  handleVoiceConnectedState(data).catch((error: unknown) => {
    logger.error(error);
  });
});

actionManager.on("hotlineSettingsUpdated", handleHotlineSettingsUpdated);
actionManager.on("removed", handleRemoved);
actionManager.on("stationStatusAdded", handleStationStatusAdded);
actionManager.on(
  "stationStatusSettingsUpdated",
  handleStationStatusSettingsUpdated
);
actionManager.on("trackAudioStatusAdded", handleTrackAudioStatusAdded);
actionManager.on("trackAudioStatusUpdated", handleTrackAudioStatusAdded);
actionManager.on("atisLetterAdded", handleAtisLetterAdded);
actionManager.on("atisLetterUpdated", handleAtisLetterUpdated);
actionManager.on("actionAdded", handleActionAdded);
actionManager.on("stationVolumeAdded", handleStationVolumeAdded);
actionManager.on("mainVolumeAdded", handleMainVolumeAdded);

vatsimManager.on("vatsimDataReceived", handleVatsimDataReceived);

svgManager.on("imageChanged", handleImageChanged);

// Finally, connect to the Stream Deck.
await streamDeck.connect();
