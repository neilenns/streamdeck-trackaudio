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

export type Message = FrequenciesUpdate | RxBegin;

export function isFrequencyStateUpdate(
  message: Message
): message is FrequenciesUpdate {
  return message.type === "kFrequenciesUpdate";
}
