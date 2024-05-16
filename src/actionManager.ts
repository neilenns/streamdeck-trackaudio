import { Action } from "@elgato/streamdeck";
import { EventEmitter } from "events";
import {
  StationStatusAction,
  StationStatusActionSettings,
  isStationStatusAction,
} from "./stationStatusAction";
import {
  TrackAudioStatusAction,
  isTrackAudioStatusAction,
} from "./trackAudioStatusAction";

/**
 * Type union for all possible actions supported by this plugin
 */
export type StatusAction = StationStatusAction | TrackAudioStatusAction;

/**
 * Singleton class that manages StreamDeck actions
 */
export default class ActionManager extends EventEmitter {
  private static instance: ActionManager | null = null;
  private actions: StatusAction[] = [];

  private constructor() {
    super();
  }

  /**
   * Provides access to the ActionManager instance.
   * @returns The instance of ActionManager
   */
  public static getInstance(): ActionManager {
    if (!ActionManager.instance) {
      ActionManager.instance = new ActionManager();
    }
    return ActionManager.instance;
  }

  /**
   * Adds a TrackAudio status action to the action list. Emits a trackAudioStatusAdded event
   * after the action is added.
   * @param action The action to add
   */
  public addTrackAudio(action: Action) {
    this.actions.push(new TrackAudioStatusAction(action));

    this.emit("trackAudioStatusAdded", this.actions.length);
  }

  /**
   * Adds a station status action to the list with the associated callsign. Emits a stationStatusAdded
   * event after the action is added.
   * @param callsign The callsign associated with the action
   * @param action The action
   */
  public addStation(
    action: Action,
    settings: StationStatusActionSettings
  ): void {
    this.actions.push(new StationStatusAction(action, settings));

    this.emit("stationStatusAdded", this.actions.length);
  }

  /**
   * Updates the settings associated with a station status action.
   * @param action The action to update
   * @param settings The new settings to use
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

  /**
   * Updates the frequency on the first station status action that matches the callsign.
   * @param callsign The callsign of the station to update the frequency on
   * @param frequency The frequency to update to
   */
  public setStationFrequency(callsign: string, frequency: number) {
    this.getStationStatusActions()
      .filter((entry) => entry.settings.callsign === callsign)
      .forEach((entry) => {
        entry.frequency = frequency;
      });
  }

  /**
   * Updates all actions that match the callsign to show the listen state.
   * @param callsign The callsign of the actions to update
   */
  public listenBegin(callsign: string) {
    this.getStationStatusActions()
      .filter(
        (entry) => entry.settings.callsign === callsign && !entry.isListening
      )
      .forEach((entry) => {
        entry.isListening = true;
        entry.setListeningImage();
      });
  }

  /**
   * Updates all actions that match the callsign to clear the listen state.
   * @param callsign The callsign of the actions to update
   */
  public listenEnd(callsign: string) {
    this.getStationStatusActions()
      .filter(
        (entry) => entry.settings.callsign === callsign && entry.isListening
      )
      .forEach((entry) => {
        entry.isListening = false;
        entry.setListeningImage();
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
          !entry.isRx
      )
      .forEach((entry) => {
        entry.isRx = true;
        entry.setActiveCommsImage();
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
          entry.isRx
      )
      .forEach((entry) => {
        entry.isRx = false;
        entry.setActiveCommsImage();
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
          !entry.isTx
      )
      .forEach((entry) => {
        entry.isTx = true;
        entry.setActiveCommsImage();
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
          entry.isTx
      )
      .forEach((entry) => {
        entry.isTx = false;
        entry.setActiveCommsImage();
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
   * Sets the connection state on all VectorAudio status buttons to the specified state
   * and updates the background image to the appropriate state image.
   * @param isConnected True if connected, false if not
   */
  public setTrackAudioConnectionState(isConnected: boolean) {
    this.getTrackAudioStatusActions().forEach((entry) => {
      // Don't do anything if the state didn't change. This prevents repeated unnecessary updates
      // when no connection is available and there's a reconnect attempt every 5 seconds.
      if (entry.isConnected === isConnected) {
        return;
      }

      entry.isConnected = isConnected;

      if (isConnected) {
        entry.action.setState(1).catch((error: unknown) => {
          console.error(error);
        });
      } else {
        entry.action.setState(0).catch((error: unknown) => {
          console.error(error);
        });
      }
    });
  }

  /**
   * Returns an array of all the actions tracked by the action manager.
   * @returns An array of the currently tracked actions
   */
  public getActions(): StatusAction[] {
    return this.actions;
  }

  /**
   * Retrieves the list of all tracked StationStatusActions.
   * @returns An array of StationStatusActions
   */
  public getStationStatusActions(): StationStatusAction[] {
    return this.actions.filter((action) =>
      isStationStatusAction(action)
    ) as StationStatusAction[];
  }

  /**
   * Retrieves the list of all tracked TrackAudioStatusActions.
   * @returns An array of TrackAudioStatusActions
   */
  public getTrackAudioStatusActions(): TrackAudioStatusAction[] {
    return this.actions.filter((action) =>
      isTrackAudioStatusAction(action)
    ) as TrackAudioStatusAction[];
  }

  /**
   * Temporarily shows an alert warning on all tracked actions.
   */
  public showAlertOnAll() {
    this.actions.forEach((entry) => {
      entry.action.showAlert().catch((error: unknown) => {
        console.error(error);
      });
    });
  }
}
