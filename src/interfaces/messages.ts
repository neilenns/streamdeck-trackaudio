/**
 * Represents the kVoiceConnected message from TrackAudio.
 */
export interface VoiceConnected {
  type: "kVoiceConnected";
}

/**
 * Represents the kVoiceDisconnected message from TrackAudio.
 */
export interface VoiceDisconnected {
  type: "kVoiceDisconnected";
}

/**
 * Represents the kStationStates message from TrackAudio.
 */
export interface StationStates {
  type: "kStationStates";
  value: {
    stations: StationStateUpdate[];
  };
}

/**
 * Represents the kStationStateUpdate message from TrackAudio.
 */
export interface StationStateUpdate {
  type: "kStationStateUpdate";
  value: {
    callsign: string | undefined;
    frequency: number;
    tx: boolean;
    rx: boolean;
    xc: boolean;
    xca: boolean;
    headset: boolean;
  };
}

/**
 * Represents the kTxBegin message from TrackAudio.
 */
export interface TxBegin {
  type: "kTxBegin";
  value: {
    callsign: string;
    pFrequencyHz: number;
  };
}

/**
 * Represents the kTxEnd message from TrackAudio.
 */
export interface TxEnd {
  type: "kTxEnd";
  value: {
    callsign: string;
    pFrequencyHz: number;
  };
}

/**
 * Represents the kRxBegin message from TrackAudio.
 */
export interface RxBegin {
  type: "kRxBegin";
  value: {
    callsign: string;
    pFrequencyHz: number;
  };
}

/**
 * Represents the kRxEnd message from TrackAudio.
 */
export interface RxEnd {
  type: "kRxEnd";
  value: {
    callsign: string;
    pFrequencyHz: number;
  };
}

/**
 * Represents the kSetStationState message to TrackAudio.
 */
export interface SetStationState {
  type: "kSetStationState";
  value: {
    frequency: number;
    tx: boolean | "toggle" | undefined;
    rx: boolean | "toggle" | undefined;
    xc: boolean | "toggle" | undefined;
    xca: boolean | "toggle" | undefined;
  };
}

/**
 * Represents the kGetStationStates message to TrackAudio.
 */
export interface GetStationStates {
  type: "kGetStationStates";
}

/**
 * Represents the kGetStationStates message to TrackAudio.
 */
export interface GetStationState {
  type: "kGetStationState";
  value: {
    callsign: string;
  };
}

/**
 * Type union for all possible incoming websocket messages from TrackAudio
 */
export type IncomingMessage =
  | StationStates
  | StationStateUpdate
  | RxBegin
  | RxEnd
  | TxBegin
  | TxEnd
  | VoiceConnected
  | VoiceDisconnected;

/**
 * Type union for all possible outgoing websocket messages to TrackAudio
 */
export type OutgoingMessage =
  | SetStationState
  | GetStationStates
  | GetStationState
  | PttPressed
  | PttReleased;

/**
 * Typeguard for VoiceConnected.
 * @param message The message
 * @returns True if the message is a VoiceConnected
 */
export function isVoiceConnected(
  message: IncomingMessage
): message is VoiceConnected {
  return message.type === "kVoiceConnected";
}

/**
 * Typeguard for VoiceDisconnected.
 * @param message The message
 * @returns True if the message is a VoiceDisconnected
 */
export function isVoiceDisconnected(
  message: IncomingMessage
): message is VoiceDisconnected {
  return message.type === "kVoiceDisconnected";
}

/**
 * Typeguard for StationStateUpdate.
 * @param message The message
 * @returns True if the message is a StationStateUpdate
 */
export function isStationStateUpdate(
  message: IncomingMessage
): message is StationStateUpdate {
  return message.type === "kStationStateUpdate";
}

/**
 * Typeguard for StationStates.
 * @param message The message
 * @returns True if the message is a StationStates
 */
export function isStationStates(
  message: IncomingMessage
): message is StationStates {
  return message.type === "kStationStates";
}

/**
 * Typeguard for RxBegin.
 * @param message The message
 * @returns True if the message is a RxBegin
 */
export function isRxBegin(message: IncomingMessage): message is RxBegin {
  return message.type === "kRxBegin";
}

/**
 * Typeguard for RxEnd.
 * @param message The message
 * @returns True if the message is a RxEnd
 */
export function isRxEnd(message: IncomingMessage): message is RxEnd {
  return message.type === "kRxEnd";
}

/**
 * Typeguard for TxBegin.
 * @param message The message
 * @returns True if the message is a TxBegin
 */
export function isTxBegin(message: IncomingMessage): message is TxBegin {
  return message.type === "kTxBegin";
}

/**
 * Typeguard for TxEnd.
 * @param message The message
 * @returns True if the message is a TxEnd
 */
export function isTxEnd(message: IncomingMessage): message is TxEnd {
  return message.type === "kTxEnd";
}

/**
 * Represents the kPttPressed message to TrackAudio.
 */
export interface PttPressed {
  type: "kPttPressed";
}

/**
 * Represents the kPttReleased message to TrackAudio.
 */
export interface PttReleased {
  type: "kPttReleased";
}
