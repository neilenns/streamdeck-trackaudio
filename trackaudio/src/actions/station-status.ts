import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import WebSocket from "ws";

let ws: WebSocket | null = null;

const kFrequencyStateUpdate = "kFrequencyStateUpdate";

// Function to handle WebSocket messages
const handleMessage = (message: string) => {
  console.log("received: %s", message);

  // Parse the message as JSON
  const data = JSON.parse(message);

  // Check if the received message is of the desired event type
  if (data.event === kFrequencyStateUpdate) {
    console.log(`Received ${kFrequencyStateUpdate} event:`, data);
    // Handle the event here
  }
};

// Function to connect to WebSocket server
const connectWebSocket = () => {
  // Create a WebSocket connection
  ws = new WebSocket(`ws://localhost:49080/ws`);

  // Listen for messages from the WebSocket server
  ws.on("message", handleMessage);

  // Handle WebSocket close event
  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
};

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.neil-enns.trackaudio.stationstatus" })
export class StationStatus extends SingletonAction<StationSettings> {
  /**
   * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it become visible. This could be due to the Stream Deck first
   * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
   * we're setting the title to the "count" that is incremented in {@link IncrementCounter.onKeyDown}.
   */
  onWillAppear(ev: WillAppearEvent<StationSettings>): void | Promise<void> {
    connectWebSocket();
  }

  onWillDisappear(
    ev: WillDisappearEvent<StationSettings>
  ): void | Promise<void> {
    if (ws !== null) {
      ws.removeAllListeners();
      ws = null;
    }
  }

  /**
   * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
   * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
   * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
   * settings using `setSettings` and `getSettings`.
   */
  async onKeyDown(ev: KeyDownEvent<StationSettings>): Promise<void> {
    // // Determine the current count from the settings.
    // let count = ev.payload.settings.count ?? 0;
    // count++;
    // // Update the current count in the action's settings, and change the title.
    // await ev.action.setSettings({ count });
    // await ev.action.setTitle(`${count}`);
  }
}

/**
 * Settings for {@link StationStatus}.
 */
type StationSettings = {
  callsign: string;
  port: number;
};
