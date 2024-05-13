import { Action } from "@elgato/streamdeck";
import { EventEmitter } from "events";

export class TrackAudioAction {
  callsign: string;
  action: Action;

  constructor(callsign: string, action: Action) {
    this.callsign = callsign;
    this.action = action;
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
  public add(callsign: string, action: Action): void {
    const newObject = new TrackAudioAction(callsign, action);
    this.actions.push(newObject);

    this.emit("added", this.actions.length);
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

  public showAlertOnAll() {
    this.actions.forEach((entry) => entry.action.showAlert());
  }
}
