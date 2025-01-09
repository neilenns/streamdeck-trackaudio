import {
  IncomingMessage,
  OutgoingMessage,
  isFrequencyRemoved,
  isMainVolumeChange,
  isRxBegin,
  isRxEnd,
  isStationAdded,
  isStationStateUpdate,
  isStationStates,
  isTxBegin,
  isTxEnd,
  isVoiceConnectedState,
} from "@interfaces/messages";
import mainLogger from "@utils/logger";
import { EventEmitter } from "events";
import WebSocket from "ws";

const logger = mainLogger.child({ service: "trackAudio" });

/**
 * Manages the websocket connection to TrackAudio.
 */
class TrackAudioManager extends EventEmitter {
  private static instance: TrackAudioManager | null;
  private socket: WebSocket | null = null;
  private reconnectInterval = 1000 * 5; // 5 seconds
  private url = "ws://localhost:49080/ws";
  private reconnectTimer: NodeJS.Timeout | null = null;

  private _isVoiceConnected = false;
  private _isAppRunning = false;

  //#region Constructor and instance management
  private constructor() {
    super();
  }

  /**
   * Provides access to the TrackAudio websocket connection.
   * @returns The websocket instance
   */
  public static getInstance(): TrackAudioManager {
    if (!TrackAudioManager.instance) {
      TrackAudioManager.instance = new TrackAudioManager();
    }
    return TrackAudioManager.instance;
  }
  //#endregion

  /**
   * Gets whether the TrackAudio application was detected as running by Stream Deck.
   * @returns {boolean} True if running.
   */
  public get isAppRunning(): boolean {
    return this._isAppRunning;
  }

  /**
   * Sets whether the TrackAudio application is running.
   * @params newValue True if running.
   */
  public set isAppRunning(newValue: boolean) {
    this._isAppRunning = newValue;
  }

  /**
   * Sets the connection URL for TrackAudio.
   * @param url The URL for the TrackAudio instance
   */
  public setUrl(url: string) {
    this.url = url;
  }

  /**
   * Provides the current state of the connection to TrackAudio.
   * @returns True if there is an open connection to TrackAudio, false otherwise.
   */
  get isConnected() {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Provides the current state of the voice connection in TrackAudio.
   * @returns True if voice is connected.
   */
  get isVoiceConnected() {
    return this._isVoiceConnected;
  }

  /**
   * Connects to a TrackAudio instance and registers event handlers for various socket events.
   * @param url The URL of the TrackAudio instance to connect to, typically ws://localhost:49080/ws
   */
  public connect(): void {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      logger.warn("WebSocket is already connected or connecting.");
      return;
    }

    // Cancel any pending reconnect timer just in case there is one
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.socket = new WebSocket(this.url);

    this.socket.on("open", () => {
      logger.debug("WebSocket connection established.");
      this.emit("connected");
    });

    this.socket.on("close", () => {
      logger.debug("WebSocket connection closed");

      this._isVoiceConnected = false;
      this.emit("disconnected");
      this.reconnect();
    });

    this.socket.on("error", (err: Error & { code: string }) => {
      if (err.code === "ECONNREFUSED") {
        logger.debug(
          "Unable to connect to TrackAudio, connection refused. TrackAudio probably isn't running."
        );
      } else {
        logger.error("WebSocket error:", err.message);
      }

      this._isVoiceConnected = false;
      this.reconnect();
    });

    this.socket.on("message", (message: string) => {
      this.processMessage(message);
    });
  }

  /**
   * Takes an incoming websocket message from TrackAudio, determines the type, and then
   * fires the appropriate event.
   * @param message The message to process
   */
  private processMessage(message: string): void {
    logger.debug(`Received: ${message}`);

    const data = JSON.parse(message) as IncomingMessage;

    if (isStationStateUpdate(data)) {
      this.emit("stationStateUpdate", data);
    } else if (isStationStates(data)) {
      this.emit("stationStates", data);
    } else if (isStationAdded(data)) {
      this.emit("stationAdded", data);
    } else if (isFrequencyRemoved(data)) {
      this.emit("frequencyRemoved", data);
    } else if (isRxBegin(data)) {
      this.emit("rxBegin", data);
    } else if (isRxEnd(data)) {
      this.emit("rxEnd", data);
    } else if (isTxBegin(data)) {
      this.emit("txBegin", data);
    } else if (isTxEnd(data)) {
      this.emit("txEnd", data);
    } else if (isVoiceConnectedState(data)) {
      this._isVoiceConnected = data.value.connected;
      this.emit("voiceConnectedState", data);
    } else if (isMainVolumeChange(data)) {
      this.emit("mainVolumeChange", data);
    }
  }

  /**
   * Sends a message to TrackAudio to refresh the station states.
   */
  public refreshStationStates() {
    this.sendMessage({ type: "kGetStationStates" });
  }

  /**
   * Sends a message to TrackAudio to refresh the main volume.
   */
  public refreshMainVolume() {
    this.sendMessage({ type: "kGetMainVolume" });
  }

  /**
   * Sends a message to TrackAudio to refresh the voice connected state.
   */
  public refreshVoiceConnectedState() {
    this.sendMessage({ type: "kGetVoiceConnectedState" });
  }

  /**
   * Sends a message to TrackAudio to refresh the state of a single station.
   * @param callsign The callsign of the station to refresh
   */
  public refreshStationState(callsign?: string) {
    if (!callsign || callsign === "") {
      return;
    }

    this.sendMessage({ type: "kGetStationState", value: { callsign } });
  }

  public sendMessage(message: OutgoingMessage) {
    if (!this.isConnected) {
      return;
    }

    this.socket?.send(JSON.stringify(message));
  }

  /**
   * Sends kAddStation messages to TrackAudio with a delay between each message.
   * @param callsigns The list of callsigns to add
   * @param delay The delay in milliseconds between each message
   */
  public async addStationsWithDelay(callsigns: string[], delay: number) {
    for (const callsign of callsigns) {
      this.sendMessage({ type: "kAddStation", value: { callsign } });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  /**
   * Sets up a timer to attempt to reconnect to the websocket.
   */
  private reconnect(): void {
    // Check to see if a reconnect attempt is already in progress. If so
    // skip starting another one.
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      logger.debug(`Attempting to reconnect...`);
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Disconnects from a TrackAudio instance.
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

const trackAudioManagerInstance = TrackAudioManager.getInstance();
export default trackAudioManagerInstance;
