import { Action } from "@elgato/streamdeck";
import { StatusAction } from "./actionManager";

export type ListenTo = "rx" | "tx" | "xc";

export class StationStatusActionSettings {
  callsign: string = "";
  listenTo: ListenTo = "rx";

  // Icon paths
  notListeningIconPath: string | undefined;
  listeningIconPath: string | undefined;
  activeCommsIconPath: string | undefined;
}

export class StationStatusAction {
  type = "StationStatusAction";
  action: Action;
  frequency: number = 0;
  isRx: boolean = false;
  isTx: boolean = false;
  isListening: boolean = false;

  settings: StationStatusActionSettings = new StationStatusActionSettings();

  /**
   *
   * @param callsign The callsign for the action
   * @param listenTo The type of listening requested, either rx, tx, or xc
   * @param notListeningIconPath The path to the icon file for the not listening state, or undefined to use the default
   * @param listeningIconPath The path to the icon file for the listening state, or undefined to use the default
   * @param activeCommsIconPath The path to the icon file for the active comms state, or undefined to use the default
   * @param action The StreamDeck action object
   */
  constructor(action: Action, options: StationStatusActionSettings) {
    this.action = action;
    this.settings.callsign = options.callsign;
    this.settings.listenTo = options.listenTo;
    this.settings.notListeningIconPath = options.notListeningIconPath;
    this.settings.listeningIconPath = options.listeningIconPath;
    this.settings.activeCommsIconPath = options.activeCommsIconPath;
  }
}

export function isStationStatusAction(
  action: StatusAction
): action is StationStatusAction {
  return action.type === "StationStatusAction";
}
