export type FrequenciesUpdate = {
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
};

export type RxBegin = {
  type: "kRxBegin";
  value: {
    callsign: string;
    pFrequencyHz: number;
  };
};

export type RxEnd = {
  type: "kRxEnd";
  value: {
    callsign: string;
    pFrequencyHz: number;
  };
};

export type Message = FrequenciesUpdate | RxBegin | RxEnd;

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
