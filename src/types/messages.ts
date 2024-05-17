/**
 * Represents the kFrequenciesUpdate message from TrackAudio.
 */
export interface FrequenciesUpdate {
  type: "kFrequencyStateUpdate";
  value: {
    rx: {
      pFrequencyHz: number;
      pCallsign: string;
    }[];
    tx: {
      pFrequencyHz: number;
      pCallsign: string;
    }[];
    xc: {
      pFrequencyHz: number;
      pCallsign: string;
    }[];
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
 * Type union for all possible websocket messages from TrackAudio
 */
export type Message = FrequenciesUpdate | RxBegin | RxEnd | TxBegin | TxEnd;

/**
 * Typeguard for FrequencyStatusUpdate.
 * @param message The message
 * @returns True if the message is a FrequencyStatusUpdate
 */
export function isFrequencyStateUpdate(
  message: Message
): message is FrequenciesUpdate {
  return message.type === "kFrequencyStateUpdate";
}

/**
 * Typeguard for RxBegin.
 * @param message The message
 * @returns True if the message is a RxBegin
 */
export function isRxBegin(message: Message): message is RxBegin {
  return message.type === "kRxBegin";
}

/**
 * Typeguard for RxEnd.
 * @param message The message
 * @returns True if the message is a RxEnd
 */
export function isRxEnd(message: Message): message is RxEnd {
  return message.type === "kRxEnd";
}

/**
 * Typeguard for TxBegin.
 * @param message The message
 * @returns True if the message is a TxBegin
 */
export function isTxBegin(message: Message): message is TxBegin {
  return message.type === "kTxBegin";
}

/**
 * Typeguard for TxEnd.
 * @param message The message
 * @returns True if the message is a TxEnd
 */
export function isTxEnd(message: Message): message is TxEnd {
  return message.type === "kTxEnd";
}
