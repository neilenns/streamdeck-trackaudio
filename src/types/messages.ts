export interface FrequenciesUpdate {
  type: "kFrequenciesUpdate";
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

export interface TxBegin {
  type: "kTxBegin";
  value: {
    callsign: string;
    pFrequencyHz: number;
  };
}

export interface TxEnd {
  type: "kTxEnd";
  value: {
    callsign: string;
    pFrequencyHz: number;
  };
}

export interface RxBegin {
  type: "kRxBegin";
  value: {
    callsign: string;
    pFrequencyHz: number;
  };
}

export interface RxEnd {
  type: "kRxEnd";
  value: {
    callsign: string;
    pFrequencyHz: number;
  };
}

export type Message = FrequenciesUpdate | RxBegin | RxEnd | TxBegin | TxEnd;

export function isFrequencyStateUpdate(
  message: Message
): message is FrequenciesUpdate {
  return message.type === "kFrequenciesUpdate";
}

export function isRxBegin(message: Message): message is RxBegin {
  return message.type === "kRxBegin";
}

export function isRxEnd(message: Message): message is RxEnd {
  return message.type === "kRxEnd";
}

export function isTxBegin(message: Message): message is TxBegin {
  return message.type === "kTxBegin";
}

export function isTxEnd(message: Message): message is TxEnd {
  return message.type === "kTxEnd";
}
