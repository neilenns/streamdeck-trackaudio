import { Action } from "@elgato/streamdeck";
import { EventEmitter } from "events";

// For some reason this isn't exported from @elgato/streamdeck
type State = 0 | 1;
export type ListenTo = "rx" | "tx" | "xc";

export class TrackAudioAction {
  callsign: string;
  listenTo: ListenTo;
  action: Action;

  constructor(callsign: string, listenTo: ListenTo, action: Action) {
    this.callsign = callsign;
    this.action = action;
    this.listenTo = listenTo;
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
  public add(callsign: string, listenTo: ListenTo, action: Action): void {
    const newObject = new TrackAudioAction(callsign, listenTo, action);
    this.actions.push(newObject);

    this.emit("added", this.actions.length);
  }

  /**
   * Updates the callsign and listenTo values associated with an action
   * @param action The action to update
   * @param callsign The callsign to set
   * @param listenTo The listenTo value to set
   */
  public update(action: Action, callsign: string, listenTo: ListenTo) {
    const savedAction = this.actions.find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    savedAction.callsign = callsign;
    savedAction.listenTo = listenTo;
  }

  /**
   * Updates all actions that match the callsign to show the transmission in progress state.
   * @param callsign The callsign of the actions to update
   */
  public rxBegin(callsign: string) {
    this.actions
      .filter((entry) => entry.callsign === callsign)
      .forEach((entry) =>
        entry.action.setImage("images/actions/station-status/orange.svg")
      );
  }

  /**
   * Updates all actions that match the callsign to clear the transmission in progress state.
   * @param callsign The callsign of the actions to update
   */
  public rxEnd(callsign: string) {
    this.actions
      .filter((entry) => entry.callsign === callsign)
      .forEach((entry) => entry.action.setImage());
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
      .filter((entry) => entry.callsign === callsign)
      .forEach((entry) => entry.action.setState(state));
  }

  public setStateOnAll(state: State) {
    this.actions.forEach((entry) => entry.action.setState(state));
  }
}
