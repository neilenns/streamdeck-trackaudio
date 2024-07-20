export interface VatsimData {
  atis: Atis[];
}

export interface Atis {
  cid: number;
  name: string;
  callsign: string;
  atis_code: string;
}
