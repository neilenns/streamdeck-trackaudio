import streamDeck, { LogLevel, action } from "@elgato/streamdeck";

import { StationStatus } from "./actions/station-status";
import TrackAudioManager from "./trackAudioManager";
import ActionManager from "./actionManager";
import {
  FrequenciesUpdate,
  RxBegin,
  RxEnd,
  TxBegin,
  TxEnd,
  isRxBegin,
  isTxBegin,
} from "./types/messages";

// Remembers the last received list of frequency updates, used to refresh
// all the buttons when a new one is added. Otherwise new buttons default to
// the "not listening" state and won't refresh until a button is pressed in
// TrackAudio
let frequencyData: FrequenciesUpdate | null = null;

const trackAudio = TrackAudioManager.getInstance();
const actionManager = ActionManager.getInstance();

/**
 * Updates all the buttons to ensure their state matches the current states in the frequencyData
 * variable. Assumes that frequencyData is updated by a received frequencyUpdate message.
 */
const updateButtons = () => {
  if (frequencyData === null) {
    return;
  }

  // Go through every active button and see if it's in the appropriate frequency array. If yes, set
  // the state to active. Relies on the frequencyData variable to contain the data received from a
  // frequencyUpdate message.
  actionManager.getStationStatusActions().forEach((entry) => {
    if (!entry.settings.listenTo || !entry.settings.callsign) {
      return;
    }

    const foundEntry = frequencyData?.value[entry.settings.listenTo].find(
      (update) => update.pCallsign === entry.settings.callsign
    );

    // If the entry is found set both the state and the frequency. The frequency must be set
    // so txBegin and rxBegin events can determine which buttons to light up
    if (foundEntry) {
      actionManager.listenBegin(entry.settings.callsign);
      actionManager.setStationFrequency(
        entry.settings.callsign,
        foundEntry.pFrequencyHz
      );
    } else {
      actionManager.listenEnd(entry.settings.callsign);
      actionManager.setStationFrequency(entry.settings.callsign, 0);
    }
  });
};

const updateRxState = (data: RxBegin | RxEnd) => {
  if (isRxBegin(data)) {
    console.log(`Receive started on: ${data.value.pFrequencyHz}`);
    actionManager.rxBegin(data.value.pFrequencyHz);
  } else {
    console.log(`Receive ended on: ${data.value.pFrequencyHz}`);
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

// Register the increment action.
streamDeck.actions.registerAction(new StationStatus());

// Register event handlers for the TrackAudio connection
trackAudio.on("connected", () => {
  console.log("Plugin detected connection to TrackAudio");
});

trackAudio.on("disconnected", () => {
  console.log("Plugin detected loss of connection to TrackAudio");
});

trackAudio.on("frequencyUpdate", (data) => {
  frequencyData = data;
  updateButtons();
});

trackAudio.on("rxBegin", (data) => {
  updateRxState(data);
});

trackAudio.on("rxEnd", (data) => {
  updateRxState(data);
});

trackAudio.on("txBegin", (data) => {
  updateTxState(data);
});

trackAudio.on("txEnd", (data) => {
  updateTxState(data);
});

// Register event handlers for action addition and removal
actionManager.on("added", (count: number) => {
  if (count === 1) {
    trackAudio.connect();
  }

  // Force a refresh of the buttons so the new button gets the proper state
  // from the start, instead of having to wait for one of the states to change in
  // TrackAudio.
  updateButtons();
});

actionManager.on("removed", (count: number) => {
  if (count === 0) {
    trackAudio.disconnect();
  }
});

// Finally, connect to the Stream Deck.
streamDeck.connect();
