import streamDeck from "@elgato/streamdeck";
import ActionManager from "./actionManager";
import { Hotline } from "./actions/hotline";
import { StationStatus } from "./actions/station-status";
import { TrackAudioStatus } from "./actions/trackAudio-status";
import TrackAudioManager from "./trackAudioManager";

// Event handlers
import { handleHotlineSettingsUpdated } from "./eventHandlers/actionManager/hotlineSettingsUpdated";
import { handleRemoved } from "./eventHandlers/actionManager/removed";
import { handleStationStatusAdded } from "./eventHandlers/actionManager/stationStatusAdded";
import { handleStationStatusSettingsUpdated } from "./eventHandlers/actionManager/stationStatusSettingsUpdated";
import { handleTrackAudioStatusAdded } from "./eventHandlers/actionManager/trackAudioStatusAdded";
import { handleConnected } from "./eventHandlers/trackAudio/connected";
import { handleDisconnected } from "./eventHandlers/trackAudio/disconnected";
import { handleRxBegin } from "./eventHandlers/trackAudio/rxBegin";
import { handleRxEnd } from "./eventHandlers/trackAudio/rxEnd";
import { handleStationStateUpdate } from "./eventHandlers/trackAudio/stationStateUpdate";
import { handleStationStates } from "./eventHandlers/trackAudio/stationStates";
import { handleTxBegin } from "./eventHandlers/trackAudio/txBegin";
import { handleTxEnd } from "./eventHandlers/trackAudio/txEnd";

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

trackAudio.on("connected", () => handleConnected);
trackAudio.on("disconnected", () => handleDisconnected);
trackAudio.on("stationStates", handleStationStates);
trackAudio.on("stationStateUpdate", handleStationStateUpdate);
trackAudio.on("rxBegin", handleRxBegin);
trackAudio.on("rxEnd", handleRxEnd);
trackAudio.on("txBegin", handleTxBegin);
trackAudio.on("txEnd", handleTxEnd);

actionManager.on("stationStatusAdded", handleStationStatusAdded);
actionManager.on("trackAudioStatusAdded", handleTrackAudioStatusAdded);
actionManager.on(
  "stationStatusSettingsUpdated",
  handleStationStatusSettingsUpdated
);
actionManager.on("hotlineSettingsUpdated", handleHotlineSettingsUpdated);
actionManager.on("trackAudioStatusUpdated", handleTrackAudioStatusAdded);
actionManager.on("removed", handleRemoved);

// Finally, connect to the Stream Deck.
await streamDeck.connect();
