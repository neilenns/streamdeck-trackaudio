import { Action } from "@elgato/streamdeck";
import { EventEmitter } from "events";

// For some reason this isn't exported from @elgato/streamdeck
type State = 0 | 1;
export type ListenTo = "rx" | "tx" | "xc";

export class TrackAudioActionSettings {
  callsign: string = "";
  listenTo: ListenTo = "rx";

  // Icon paths
  notListeningIconPath: string | undefined;
  listeningIconPath: string | undefined;
  activeCommsIconPath: string | undefined;
}

export class TrackAudioAction {
  action: Action;
  frequency: number = 0;
  isRx: boolean = false;
  isTx: boolean = false;
  isListening: boolean = false;

  settings: TrackAudioActionSettings = new TrackAudioActionSettings();

  /**
   *
   * @param callsign The callsign for the action
   * @param listenTo The type of listening requested, either rx, tx, or xc
   * @param notListeningIconPath The path to the icon file for the not listening state, or undefined to use the default
   * @param listeningIconPath The path to the icon file for the listening state, or undefined to use the default
   * @param activeCommsIconPath The path to the icon file for the active comms state, or undefined to use the default
   * @param action The StreamDeck action object
   */
  constructor(action: Action, options: TrackAudioActionSettings) {
    this.action = action;
    this.settings.callsign = options.callsign;
    this.settings.listenTo = options.listenTo;
    this.settings.notListeningIconPath = options.notListeningIconPath;
    this.settings.listeningIconPath = options.listeningIconPath;
    this.settings.activeCommsIconPath = options.activeCommsIconPath;
  }
}

export default class ActionManager extends EventEmitter {
  private static instance: ActionManager;
  private actions: TrackAudioAction[] = [];

  private constructor() {
    super();
  }

  public static getInstance(): ActionManager {
    if (!ActionManager.instance) {
      ActionManager.instance = new ActionManager();
    }
    return ActionManager.instance;
  }

  /**
   * Adds an action to the list with the associated callsign.
   * @param callsign The callsign associated with the action
   * @param action The action
   */
  public add(action: Action, settings: TrackAudioActionSettings): void {
    this.actions.push(new TrackAudioAction(action, settings));

    this.emit("added", this.actions.length);
  }

  /**
   * Updates the callsign and listenTo values associated with an action
   * @param action The action to update
   * @param callsign The callsign to set
   * @param listenTo The listenTo value to set
   */
  public update(action: Action, settings: TrackAudioActionSettings) {
    const savedAction = this.actions.find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    savedAction.settings = settings;
  }

  public setFrequency(callsign: string, frequency: number) {
    const savedAction = this.actions.find(
      (entry) => entry.settings.callsign === callsign
    );

    if (savedAction) {
      savedAction.frequency = frequency;
    }
  }

  /**
   * Updates all actions that match the callsign to show the listen state.
   * @param callsign The callsign of the actions to update
   */
  public listenBegin(callsign: string) {
    this.actions
      .filter(
        (entry) =>
          entry.settings.callsign === callsign && entry.isListening === false
      )
      .forEach((entry) => {
        entry.isListening = true;
        entry.action.setImage(
          entry.settings.listeningIconPath ??
            "images/actions/station-status/green.svg"
        );
      });
  }

  /**
   * Updates all actions that match the callsign to clear the listen state.
   * @param callsign The callsign of the actions to update
   */
  public listenEnd(callsign: string) {
    this.actions
      .filter(
        (entry) =>
          entry.settings.callsign === callsign && entry.isListening === true
      )
      .forEach((entry) => {
        entry.isListening = false;
        entry.action.setImage(
          entry.settings.notListeningIconPath ??
            "images/actions/station-status/black.svg"
        );
      });
  }

  /**
   * Updates all actions that match the frequency to show the transmission in progress state.
   * @param frequency The callsign of the actions to update
   */
  public rxBegin(frequency: number) {
    this.actions
      .filter(
        (entry) =>
          entry.frequency === frequency &&
          entry.settings.listenTo === "rx" &&
          entry.isRx === false
      )
      .forEach((entry) => {
        entry.action.setImage("images/actions/station-status/orange.svg");
        entry.isRx = true;
      });
  }

  /**
   * Updates all actions that match the callsign to clear the transmission in progress state.
   * @param frequency The callsign of the actions to update
   */
  public rxEnd(frequency: number) {
    this.actions
      .filter(
        (entry) =>
          entry.frequency === frequency &&
          entry.settings.listenTo === "rx" &&
          entry.isRx === true
      )
      .forEach((entry) => {
        entry.action.setImage();
        entry.isRx = false;
      });
  }

  /**
   * Updates all actions that match the frequency to show the transmission in progress state.
   * @param frequency The callsign of the actions to update
   */
  public txBegin(frequency: number) {
    this.actions
      .filter(
        (entry) =>
          entry.frequency === frequency &&
          entry.settings.listenTo === "tx" &&
          entry.isTx === false
      )
      .forEach((entry) => {
        entry.action.setImage("images/actions/station-status/orange.svg");
        entry.isTx = true;
      });
  }

  /**
   * Updates all actions that match the callsign to clear the transmission in progress state.
   * @param frequency The callsign of the actions to update
   */
  public txEnd(frequency: number) {
    this.actions
      .filter(
        (entry) =>
          entry.frequency === frequency &&
          entry.settings.listenTo === "tx" &&
          entry.isTx === true
      )
      .forEach((entry) => {
        entry.action.setImage();
        entry.isTx = false;
      });
  }

  /**
   * Removes an action from the list.
   * @param action The action to remove
   */
  public remove(action: Action): void {
    this.actions = this.actions.filter(
      (entry) => entry.action.id !== action.id
    );

    this.emit("removed", this.actions.length);
  }

  /**
   * Returns an array of all the actions tracked by the action manager.
   * @returns An array of the currently tracked actions
   */
  public getActions(): TrackAudioAction[] {
    return this.actions;
  }

  /**
   * Temporarily shows an alert warning on all tracked actions.
   */
  public showAlertOnAll() {
    this.actions.forEach((entry) => entry.action.showAlert());
  }

  /**
   * Sets the state of all actions matching the specified callsign to the specified state
   * @param callsign The callsign to set the state on
   * @param state The state to set
   */
  public setState(callsign: string, state: State) {
    this.actions
      .filter((entry) => entry.settings.callsign === callsign)
      .forEach((entry) => entry.action.setState(state));
  }

  public setStateOnAll(state: State) {
    this.actions.forEach((entry) => entry.action.setState(state));
  }
}
