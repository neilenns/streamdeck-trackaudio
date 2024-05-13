import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { StationStatus } from "./actions/station-status";
import TrackAudioManager from "./trackAudioManager";
import ActionManager from "./actionManager";

const trackAudio = TrackAudioManager.getInstance();
const actionManager = ActionManager.getInstance();

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the increment action.
streamDeck.actions.registerAction(new StationStatus());

// Register event handlers for the TrackAudio connection
trackAudio.on("connected", () => {
  console.log("Plugin detected connection to TrackAudio");
  actionManager.setState("SEA_GND", 1);
});

trackAudio.on("disconnected", () => {
  console.log("Plugin detected loss of connection to TrackAudio");
  actionManager.setState("SEA_GND", 0);
  actionManager.showAlertOnAll();
});

trackAudio.on("frequencyUpdate", (data) => {
  console.log(`Received frequency update: ${data}`);
});

// Register event handlers for action addition and removal
actionManager.on("added", (count: number) => {
  if (count === 1) {
    trackAudio.connect();
  }
});

actionManager.on("removed", (count: number) => {
  if (count === 0) {
    trackAudio.disconnect();
  }
});

// Finally, connect to the Stream Deck.
streamDeck.connect();
