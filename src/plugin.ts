import { Hotline } from "@actions/hotline";
import { StationStatus } from "@actions/stationStatus";
import streamDeck from "@elgato/streamdeck";
import actionManager from "@managers/action";
import trackAudioManager from "@managers/trackAudio";

// Event handlers
import { TrackAudioStatus } from "@actions/trackAudioStatus";
import { handleHotlineSettingsUpdated } from "@eventHandlers/actionManager/hotlineSettingsUpdated";
import { handleRemoved } from "@eventHandlers/actionManager/removed";
import { handleStationStatusAdded } from "@eventHandlers/actionManager/stationStatusAdded";
import { handleStationStatusSettingsUpdated } from "@eventHandlers/actionManager/stationStatusSettingsUpdated";
import { handleTrackAudioStatusAdded } from "@eventHandlers/actionManager/trackAudioStatusAdded";
import { handleConnected } from "@eventHandlers/trackAudio/connected";
import { handleDisconnected } from "@eventHandlers/trackAudio/disconnected";
import { handleRxBegin } from "@eventHandlers/trackAudio/rxBegin";
import { handleRxEnd } from "@eventHandlers/trackAudio/rxEnd";
import { handleStationStateUpdate } from "@eventHandlers/trackAudio/stationStateUpdate";
import { handleStationStates } from "@eventHandlers/trackAudio/stationStates";
import { handleTxBegin } from "@eventHandlers/trackAudio/txBegin";
import { handleTxEnd } from "@eventHandlers/trackAudio/txEnd";
import { PushToTalk } from "@actions/pushToTalk";
import { handleVoiceConnectedState } from "@eventHandlers/trackAudio/voiceConnectedState";
import { AtisLetter } from "@actions/atisLetter";
import { handleAtisLetterAdded } from "@eventHandlers/actionManager/atisLetterAdded";
import vatsimManager from "@managers/vatsim";
import { handleVatsimDataReceived } from "@eventHandlers/vatsim/vatsimDataReceived";
import { handleAtisLetterUpdated } from "@eventHandlers/actionManager/atisLetterUpdated";
import { handleStationAdded } from "@eventHandlers/trackAudio/stationAdded";
import { handleFrequencyRemoved } from "@eventHandlers/trackAudio/frequencyRemoved";

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

// Finally, connect to the Stream Deck.
await streamDeck.connect();
