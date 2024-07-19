import { Hotline } from "@actions/hotline";
import { StationStatus } from "@actions/stationStatus";
import streamDeck from "@elgato/streamdeck";
import ActionManager from "@managers/action";
import TrackAudioManager from "@managers/trackAudio";

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
import { handleVoiceDisconnected } from "@eventHandlers/trackAudio/voiceDisconnected";
import { handleVoiceConnected } from "@eventHandlers/trackAudio/voiceConnected";

const trackAudio = TrackAudioManager.getInstance();
const actionManager = ActionManager.getInstance();

// streamDeck.logger.setLevel(LogLevel.TRACE);

// Register for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Register all the event handlers
streamDeck.actions.registerAction(new StationStatus());
streamDeck.actions.registerAction(new TrackAudioStatus());
streamDeck.actions.registerAction(new Hotline());
streamDeck.actions.registerAction(new PushToTalk());

trackAudio.on("connected", handleConnected);
trackAudio.on("disconnected", handleDisconnected);
trackAudio.on("rxBegin", handleRxBegin);
trackAudio.on("rxEnd", handleRxEnd);
trackAudio.on("stationStates", handleStationStates);
trackAudio.on("stationStateUpdate", handleStationStateUpdate);
trackAudio.on("txBegin", handleTxBegin);
trackAudio.on("txEnd", handleTxEnd);
trackAudio.on("voiceConnected", handleVoiceConnected);
trackAudio.on("voiceDisconnected", handleVoiceDisconnected);

actionManager.on("hotlineSettingsUpdated", handleHotlineSettingsUpdated);
actionManager.on("removed", handleRemoved);
actionManager.on("stationStatusAdded", handleStationStatusAdded);
actionManager.on(
  "stationStatusSettingsUpdated",
  handleStationStatusSettingsUpdated
);
actionManager.on("trackAudioStatusAdded", handleTrackAudioStatusAdded);
actionManager.on("trackAudioStatusUpdated", handleTrackAudioStatusAdded);

// Finally, connect to the Stream Deck.
await streamDeck.connect();
