import {
  Action,
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import WebSocket from "ws";
import { isFrequencyStateUpdate, Message } from "../types/messages";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.neil-enns.trackaudio.stationstatus" })
export class StationStatus extends SingletonAction<StationSettings> {
  // The socket for communication with TrackAudio
  ws: WebSocket | null = null;
  buttonAction: Action | null = null;

  // Function to handle WebSocket messages
  handleMessage = (message: string) => {
    console.log("received: %s", message);

    // Parse the message as JSON
    const data: Message = JSON.parse(message);

    // Check if the received message is of the desired event type
    if (isFrequencyStateUpdate(data)) {
      console.log(`Received ${data.type} event:`, data.value);

      const isRx = data.value.rx.find(
        (station) => station.pCallsign === "SEA_GND"
      );

      isRx ? this.buttonAction?.setState(1) : this.buttonAction?.setState(0);

      console.log(`Rx: ${isRx}`);
    }
  };

  // Establishes a socket connection to TrackAudio and registers the appropriate
  // event handlers. Also takes care of auto-reconnect attempts if a connection fails
  // or is dropped.
  connectWebSocket = () => {
    this.ws = new WebSocket(`ws://localhost:49080/ws`);

    this.ws.on("open", () => {
      console.log("TrackAudio connection opened");
    });

    // Listen for messages from the WebSocket server
    this.ws.on("message", this.handleMessage);

    this.ws.on("error", (error) => {
      console.log(error.message);
      this.ws?.close();
    });

    // Handle WebSocket close event
    this.ws.on("close", () => {
      console.log("TrackAudio connection closed");
    });
  };

  // Disconnects from TrackAudio and cleans up any pending auto-reconnect
  // timers.
  disconnectWebSocket = () => {
    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  };

  /**
   * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it become visible. This could be due to the Stream Deck first
   * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
   * we're setting the title to the "count" that is incremented in {@link IncrementCounter.onKeyDown}.
   */
  onWillAppear(ev: WillAppearEvent<StationSettings>): void | Promise<void> {
    // I'm not sure if this is the right way to do it, but save the action so
    // setState can be called from the socket message handler.
    this.buttonAction = ev.action;
    if (!this.ws) {
      this.connectWebSocket();
    }
  }

  onWillDisappear(
    ev: WillDisappearEvent<StationSettings>
  ): void | Promise<void> {
    this.disconnectWebSocket();
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
