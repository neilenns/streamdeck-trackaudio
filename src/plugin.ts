import { Hotline } from "@actions/hotline";
import { StationStatus } from "@actions/station-status";
import { TrackAudioStatus } from "@actions/trackAudio-status";
import streamDeck from "@elgato/streamdeck";
import ActionManager from "@root/actionManager";
import TrackAudioManager from "@root/trackAudioManager";

// Event handlers
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
trackAudio.on("rxBegin", handleRxBegin);
trackAudio.on("rxEnd", handleRxEnd);
trackAudio.on("stationStates", handleStationStates);
trackAudio.on("stationStateUpdate", handleStationStateUpdate);
trackAudio.on("txBegin", handleTxBegin);
trackAudio.on("txEnd", handleTxEnd);

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
