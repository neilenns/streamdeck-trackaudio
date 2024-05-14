import { Action } from "@elgato/streamdeck";
import { EventEmitter } from "events";
import {
  StationStatusAction,
  StationStatusActionSettings,
  isStationStatusAction,
} from "./stationStatusAction";
import {
  VectorAudioStatusAction,
  isVectorAudioStatusAction,
} from "./vectorAudioStatusAction";

export type StatusAction = StationStatusAction | VectorAudioStatusAction;

export default class ActionManager extends EventEmitter {
  private static instance: ActionManager;
  private actions: StatusAction[] = [];

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
  public addStation(
    action: Action,
    settings: StationStatusActionSettings
  ): void {
    this.actions.push(new StationStatusAction(action, settings));

    this.emit("added", this.actions.length);
  }

  /**
   * Updates the callsign and listenTo values associated with an action
   * @param action The action to update
   * @param callsign The callsign to set
   * @param listenTo The listenTo value to set
   */
  public updateStation(action: Action, settings: StationStatusActionSettings) {
    const savedAction = this.getStationStatusActions().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    savedAction.settings = settings;
  }

  public setStationFrequency(callsign: string, frequency: number) {
    const savedAction = this.getStationStatusActions().find(
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
    this.getStationStatusActions()
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
    this.getStationStatusActions()
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
    this.getStationStatusActions()
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
    this.getStationStatusActions()
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
    this.getStationStatusActions()
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
    this.getStationStatusActions()
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
  public getActions(): StatusAction[] {
    return this.actions;
  }

  /**
   * Retrieves the list of all tracked StationStatusActions
   * @returns An array of StationStatusActions
   */
  public getStationStatusActions(): StationStatusAction[] {
    return this.actions.filter((action) =>
      isStationStatusAction(action)
    ) as StationStatusAction[];
  }

  /**
   * Retrieves the list of all tracked StationStatusActions
   * @returns An array of StationStatusActions
   */
  public getVectorAudioStatusActions(): VectorAudioStatusAction[] {
    return this.actions.filter((action) =>
      isVectorAudioStatusAction(action)
    ) as VectorAudioStatusAction[];
  }

  /**
   * Temporarily shows an alert warning on all tracked actions.
   */
  public showAlertOnAll() {
    this.actions.forEach((entry) => entry.action.showAlert());
  }
}
