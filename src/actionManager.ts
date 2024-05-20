import { Action } from "@elgato/streamdeck";
import { EventEmitter } from "events";
import {
  StationStatusAction,
  isStationStatusAction,
} from "./stationStatusAction";
import {
  TrackAudioStatusAction,
  isTrackAudioStatusAction,
} from "./trackAudioStatusAction";
import { StationSettings } from "./actions/station-status";
import TrackAudioManager from "./trackAudioManager";
import { StationStateUpdate } from "./types/messages";
import { HotlineSettings } from "./actions/hotline";
import { HotlineAction, isHotlineAction } from "./hotlineAction";

/**
 * Type union for all possible actions supported by this plugin
 */
export type StatusAction =
  | StationStatusAction
  | TrackAudioStatusAction
  | HotlineAction;

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

  public addHotline(action: Action, settings: HotlineSettings) {
    this.actions.push(new HotlineAction(action, settings));

    // Force buttons to refresh so the newly added button shows the correct state.
    this.emit("trackAudioStatusAdded", this.actions.length);
  }

  /**
   * Adds a station status action to the list with the associated callsign. Emits a stationStatusAdded
   * event after the action is added.
   * @param callsign The callsign associated with the action
   * @param action The action
   */
  public addStation(action: Action, settings: StationSettings): void {
    this.actions.push(new StationStatusAction(action, settings));

    this.emit("stationStatusAdded", settings.callsign);
  }

  /**
   * Updates the settings associated with a station status action.
   * @param action The action to update
   * @param settings The new settings to use
   */
  public updateStation(action: Action, settings: StationSettings) {
    const savedAction = this.getStationStatusActions().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    savedAction.settings = settings;

    this.emit("stationStatusSettingsUpdated", savedAction);
  }

  public updateHotline(action: Action, settings: HotlineSettings) {
    const savedAction = this.getHotlineActions().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    savedAction.settings = settings;

    this.emit("hotlineSettingsUpdated", savedAction);
  }

  /**
   * Updates stations to match the provided station state update.
   * If a callsign is provided in the update then all stations with that callsign have their
   * frequency set.
   * @param data The StationStateUpdate message from TrackAudio
   */
  public updateStationState(data: StationStateUpdate) {
    // First set the frequency if one was provided. This usually comes in the first
    // station state update message from TrackAudio.
    if (data.value.callsign) {
      this.setStationFrequency(data.value.callsign, data.value.frequency);
    }

    // Set the listen state for all stations using the frequency and refresh the
    // state image.
    this.getStationStatusActions()
      .filter((entry) => entry.frequency === data.value.frequency)
      .forEach((entry) => {
        entry.isListening =
          (data.value.rx && entry.listenTo === "rx") ||
          (data.value.tx && entry.listenTo === "tx") ||
          (data.value.xc && entry.listenTo === "xc");

        entry.setActiveCommsImage();
      });

    // Do the same for hotline actions
    this.getHotlineActions().forEach((entry) => {
      if (entry.primaryFrequency === data.value.frequency) {
        entry.isTxPrimary = data.value.tx;
      }
      if (entry.hotlineFrequency === data.value.frequency) {
        entry.isTxHotline = data.value.tx;
      }

      entry.setActiveCommsImage();
    });
  }

  /**
   * Updates the frequency on all actions that use the callsign. This includes
   * station status actions and hotline actions.
   * @param callsign The callsign of the station to update the frequency on
   * @param frequency The frequency to update to
   */
  public setStationFrequency(callsign: string, frequency: number) {
    this.getStationStatusActions()
      .filter((entry) => entry.callsign === callsign)
      .forEach((entry) => {
        entry.frequency = frequency;
      });

    this.getHotlineActions().forEach((entry) => {
      if (entry.primaryCallsign === callsign) {
        entry.primaryFrequency = frequency;
      }
      if (entry.hotlineCallsign === callsign) {
        entry.hotlineFrequency = frequency;
      }
    });
  }

  /**
   * Sets the isListening state on all tracked actions.
   * @param state The isListening state to set
   */
  public setIsListeningOnAll(isListening: boolean) {
    this.getStationStatusActions().forEach((entry) => {
      entry.isListening = isListening;
    });
  }

  /**
   * Updates all actions that match the frequency to show the transmission in progress state.
   * @param frequency The callsign of the actions to update
   */
  public rxBegin(frequency: number) {
    this.getStationStatusActions()
      .filter(
        (entry) => entry.frequency === frequency && entry.listenTo === "rx"
      )
      .forEach((entry) => {
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
        (entry) => entry.frequency === frequency && entry.listenTo === "rx"
      )
      .forEach((entry) => {
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
        (entry) => entry.frequency === frequency && entry.listenTo === "tx"
      )
      .forEach((entry) => {
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
        (entry) => entry.frequency === frequency && entry.listenTo === "tx"
      )
      .forEach((entry) => {
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
   * Toggles the tx on both the primary and hotline frequency.
   * @param id The action id to toggle the state of
   */
  public toggleHotline(id: string): void {
    const foundAction = this.actions.find((entry) => entry.action.id === id);

    if (!foundAction || !isHotlineAction(foundAction)) {
      return;
    }

    // Catches the case where for some reason both primary and hotline are both
    // set to tx, which should never happen. In that situation pretend the primary
    // is off and hotline is on, which will mean the button push causes the primary
    // to turn on and the hotline to turn off.
    if (foundAction.isTxPrimary === foundAction.isTxHotline) {
      foundAction.isTxPrimary = false;
      foundAction.isTxHotline = true;
    }

    // The primary frequency always gets its xc state toggled to match the tx state,
    // ensuring xc is re-enabled when tx turns on.
    TrackAudioManager.getInstance().sendMessage({
      type: "kSetStationState",
      value: {
        frequency: foundAction.primaryFrequency,
        tx: !foundAction.isTxPrimary,
        rx: undefined,
        xc: !foundAction.isTxPrimary,
        xca: undefined,
      },
    });

    // The hotline frequency gets its tx state toggled
    TrackAudioManager.getInstance().sendMessage({
      type: "kSetStationState",
      value: {
        frequency: foundAction.hotlineFrequency,
        tx: !foundAction.isTxHotline,
        rx: undefined,
        xc: undefined,
        xca: undefined,
      },
    });
  }

  /**
   * Toggles the tx, rx, xc, or spkr state of a frequency bound to a StreamDeck action.
   * @param id The action id to toggle the state of
   */
  public toggleFrequency(id: string): void {
    const foundAction = this.actions.find((entry) => entry.action.id === id);

    if (!foundAction || !isStationStatusAction(foundAction)) {
      return;
    }

    // Send the message to TrackAudio.
    TrackAudioManager.getInstance().sendMessage({
      type: "kSetStationState",
      value: {
        frequency: foundAction.frequency,
        rx: foundAction.listenTo === "rx" ? "toggle" : undefined,
        tx: foundAction.listenTo === "tx" ? "toggle" : undefined,
        xc: foundAction.listenTo === "xc" ? "toggle" : undefined,
        xca: undefined, // xca isn't supported right now
      },
    });
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
   * Retrieves the list of all tracked HotlineActions.
   * @returns An array of HotlineActions
   */
  public getHotlineActions(): HotlineAction[] {
    return this.actions.filter((action) =>
      isHotlineAction(action)
    ) as HotlineAction[];
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
