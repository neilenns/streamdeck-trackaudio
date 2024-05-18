import streamDeck from "@elgato/streamdeck";

import ActionManager from "./actionManager";
import { StationStatus } from "./actions/station-status";
import { TrackAudioStatus } from "./actions/trackAudio-status";
import TrackAudioManager from "./trackAudioManager";
import {
  RxBegin,
  RxEnd,
  StationStateUpdate,
  StationStates,
  TxBegin,
  TxEnd,
  isRxBegin,
  isTxBegin,
} from "./types/messages";

const trackAudio = TrackAudioManager.getInstance();
const actionManager = ActionManager.getInstance();

const updateRxState = (data: RxBegin | RxEnd) => {
  if (isRxBegin(data)) {
    console.log(`Receive started on: ${data.value.pFrequencyHz.toString()}`);
    actionManager.rxBegin(data.value.pFrequencyHz);
  } else {
    console.log(`Receive ended on: ${data.value.pFrequencyHz.toString()}`);
    actionManager.rxEnd(data.value.pFrequencyHz);
  }
};

const updateTxState = (data: TxBegin | TxEnd) => {
  if (isTxBegin(data)) {
    console.log(`Transmit started on: ${data.value.callsign}`);
  } else {
    console.log(`Transmit started on: ${data.value.callsign}`);
  }
};

// streamDeck.logger.setLevel(LogLevel.TRACE);

// Register for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Register the increment action.
streamDeck.actions.registerAction(new StationStatus());
streamDeck.actions.registerAction(new TrackAudioStatus());

// Register event handlers for the TrackAudio connection
trackAudio.on("connected", () => {
  console.log("Plugin detected connection to TrackAudio");
  actionManager.setTrackAudioConnectionState(trackAudio.isConnected());
  trackAudio.refreshStationStates();
});

trackAudio.on("disconnected", () => {
  console.log("Plugin detected loss of connection to TrackAudio");
  actionManager.setTrackAudioConnectionState(trackAudio.isConnected());
  actionManager.setIsListeningOnAll(false);
});

trackAudio.on("stationStates", (data: StationStates) => {
  data.value.stations.forEach((station) => {
    actionManager.updateStationState(station);
  });
});

trackAudio.on("stationStateUpdate", (data: StationStateUpdate) => {
  actionManager.updateStationState(data);
});

trackAudio.on("rxBegin", (data: RxBegin) => {
  updateRxState(data);
});

trackAudio.on("rxEnd", (data: RxEnd) => {
  updateRxState(data);
});

trackAudio.on("txBegin", (data: TxBegin) => {
  updateTxState(data);
});

trackAudio.on("txEnd", (data: TxEnd) => {
  updateTxState(data);
});

// Register event handlers for action addition and removal
actionManager.on("stationStatusAdded", (count: number) => {
  if (count === 1) {
    trackAudio.connect();
  }
});

actionManager.on("trackAudioStatusAdded", (count: number) => {
  if (count === 1) {
    trackAudio.connect();
  }

  // Refresh the button state so the new button gets the proper state from the start.
  actionManager.setTrackAudioConnectionState(trackAudio.isConnected());
});

/**
 * Handles station status actions getting updated by refreshing its current listening
 * status then triggering an image refresh.
 */
actionManager.on("trackAudioStatusUpdated", () => {
  trackAudio.refreshStationStates();
});

actionManager.on("removed", (count: number) => {
  if (count === 0) {
    trackAudio.disconnect();
  }
});

// Finally, connect to the Stream Deck.
await streamDeck.connect();
