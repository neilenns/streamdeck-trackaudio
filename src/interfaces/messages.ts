/**
 * Represents the kVoiceConnectedState message from TrackAudio.
 */
export interface VoiceConnectedState {
  type: "kVoiceConnectedState";
  value: {
    connected: boolean;
  };
}

/**
 * Represents the kMainOutputVolumeChange message from TrackAudio.
 */
export interface MainOutputVolumeChange {
  type: "kMainOutputVolumeChange";
  value: {
    volume: number;
  };
}

/**
 * Represents the kStationStates message from TrackAudio.
 */
export interface StationStates {
  type: "kStationStates";
  value: {
    stations: StationStateUpdateAvailable[];
  };
}

export type StationStateUpdate =
  | StationStateUpdateAvailable
  | StationStateUpdateNotAvailable;

/**
 * Represents the kStationStateUpdate message from TrackAudio when avilable is true.
 */
export interface StationStateUpdateAvailable {
  type: "kStationStateUpdate";
  value: {
    callsign: string | undefined;
    frequency: number;
    tx: boolean;
    rx: boolean;
    xc: boolean;
    xca: boolean;
    headset: boolean;
    isAvailable?: true;
    isOutputMuted?: boolean;
    outputVolume?: number;
  };
}

/**
 * Represents the kStationStateUpdate message from TrackAudio when avilable is false.
 */
export interface StationStateUpdateNotAvailable {
  type: "kStationStateUpdate";
  value: {
    callsign: string;
    isAvailable?: false;
  };
}

/**
 * Represents the kStationAdded message from TrackAudio.
 */
export interface StationAdded {
  type: "kStationAdded";
  value: {
    callsign: string;
    frequency: number;
  };
}

/**
 * Represents the kStationRemoved message from TrackAudio.
 */
export interface FrequencyRemoved {
  type: "kFrequencyRemoved";
  value: {
    frequency: number;
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
 * Represents the kChangeStationVolume message to TrackAudio.
 */
export interface ChangeStationVolume {
  type: "kChangeStationVolume";
  value: {
    frequency: number;
    amount: number;
  };
}

/**
 * Represents the kChangeMainOutputVolume message to TrackAudio.
 */
export interface ChangeMainOutputVolume {
  type: "kChangeMainOutputVolume";
  value: {
    amount: number;
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
    headset: boolean | "toggle" | undefined;
    isOutputMuted: boolean | "toggle" | undefined;
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
 * Represents the kGetVoiceConnectedState message to TrackAudio.
 */
export interface GetVoiceConnectedState {
  type: "kGetVoiceConnectedState";
}

/**
 * Represents the kGetMainOutputVolume message to TrackAudio.
 */
export interface GetMainOuptutVolume {
  type: "kGetMainOutputVolume";
}

/**
 * Represents the kAddStation message to TrackAudio.
 */
export interface AddStation {
  type: "kAddStation";
  value: {
    callsign?: string;
    frequency?: string;
  };
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
  | VoiceConnectedState
  | StationAdded
  | FrequencyRemoved
  | MainOutputVolumeChange;

/**
 * Type union for all possible outgoing websocket messages to TrackAudio
 */
export type OutgoingMessage =
  | SetStationState
  | GetStationStates
  | GetStationState
  | PttPressed
  | PttReleased
  | GetVoiceConnectedState
  | AddStation
  | ChangeStationVolume
  | ChangeMainOutputVolume
  | GetMainOuptutVolume;

/**
 * Typeguard for VoiceConnected.
 * @param message The message
 * @returns True if the message is a VoiceConnected
 */
export function isVoiceConnectedState(
  message: IncomingMessage
): message is VoiceConnectedState {
  return message.type === "kVoiceConnectedState";
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
 * Typeguard for StationStateUpdate when the station is available.
 * @param message The message
 * @returns True if the message is a StationStateUpdate with isAvailable true.
 */
export function isStationStateUpdateAvailable(
  message: IncomingMessage
): message is StationStateUpdateAvailable {
  return (
    message.type === "kStationStateUpdate" &&
    // This is for backwards compatibility with older versions of TrackAudio
    // that do not include the isAvailable property.
    (message.value.isAvailable === undefined || message.value.isAvailable)
  );
}

/**
 * Typeguard for StationStateUpdate when the station is available.
 * @param message The message
 * @returns True if the message is a StationStateUpdate with isAvailable true.
 */
export function isStationStateUpdateNotAvailable(
  message: IncomingMessage
): message is StationStateUpdateNotAvailable {
  return (
    message.type === "kStationStateUpdate" &&
    message.value.isAvailable !== undefined &&
    !message.value.isAvailable
  );
}

/**
 * Typeguard for StationAdded.
 * @param message The message
 * @returns True if the message is a StationAdded
 */
export function isStationAdded(
  message: IncomingMessage
): message is StationAdded {
  return message.type === "kStationAdded";
}

/**
 * Typeguard for FrequencyRemoved.
 * @param message The message
 * @returns True if the message is a FrequencyRemoved
 */
export function isFrequencyRemoved(
  message: IncomingMessage
): message is FrequencyRemoved {
  return message.type === "kFrequencyRemoved";
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

export function isMainOutputVolumeChange(
  message: IncomingMessage
): message is MainOutputVolumeChange {
  return message.type === "kMainOutputVolumeChange";
}
