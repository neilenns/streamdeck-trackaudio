import { Hotline } from "@actions/hotline";
import { StationStatus } from "@actions/stationStatus";
import streamDeck from "@elgato/streamdeck";
import actionManager from "@managers/action";
import svgManager from "@managers/svg";
import trackAudioManager from "@managers/trackAudio";
import vatsimManager from "@managers/vatsim";

// Event handlers
import { AtisLetter } from "@actions/atisLetter";
import { PushToTalk } from "@actions/pushToTalk";
import { TrackAudioStatus } from "@actions/trackAudioStatus";
import { handleAtisLetterAdded } from "@eventHandlers/actionManager/atisLetterAdded";
import { handleAtisLetterUpdated } from "@eventHandlers/actionManager/atisLetterUpdated";
import { handleHotlineSettingsUpdated } from "@eventHandlers/actionManager/hotlineSettingsUpdated";
import { handleRemoved } from "@eventHandlers/actionManager/removed";
import { handleStationStatusAdded } from "@eventHandlers/actionManager/stationStatusAdded";
import { handleStationStatusSettingsUpdated } from "@eventHandlers/actionManager/stationStatusSettingsUpdated";
import { handleTrackAudioStatusAdded } from "@eventHandlers/actionManager/trackAudioStatusAdded";
import { handleImageChanged } from "@eventHandlers/svg/imageChanged";
import { handleConnected } from "@eventHandlers/trackAudio/connected";
import { handleDisconnected } from "@eventHandlers/trackAudio/disconnected";
import { handleFrequencyRemoved } from "@eventHandlers/trackAudio/frequencyRemoved";
import { handleRxBegin } from "@eventHandlers/trackAudio/rxBegin";
import { handleRxEnd } from "@eventHandlers/trackAudio/rxEnd";
import { handleStationAdded } from "@eventHandlers/trackAudio/stationAdded";
import { handleStationStateUpdate } from "@eventHandlers/trackAudio/stationStateUpdate";
import { handleStationStates } from "@eventHandlers/trackAudio/stationStates";
import { handleTxBegin } from "@eventHandlers/trackAudio/txBegin";
import { handleTxEnd } from "@eventHandlers/trackAudio/txEnd";
import { handleVoiceConnectedState } from "@eventHandlers/trackAudio/voiceConnectedState";
import { handleVatsimDataReceived } from "@eventHandlers/vatsim/vatsimDataReceived";

// Flag to prevent handling repeated disconnect events
let disconnectHandled = false;

// Register for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Register all the event handlers
streamDeck.actions.registerAction(new AtisLetter());
streamDeck.actions.registerAction(new Hotline());
streamDeck.actions.registerAction(new PushToTalk());
streamDeck.actions.registerAction(new StationStatus());
streamDeck.actions.registerAction(new TrackAudioStatus());

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
trackAudioManager.on("voiceConnectedState", handleVoiceConnectedState);

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

vatsimManager.on("vatsimDataReceived", handleVatsimDataReceived);

svgManager.on("imageChanged", handleImageChanged);

// Finally, connect to the Stream Deck.
await streamDeck.connect();
