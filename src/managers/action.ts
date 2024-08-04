import { AtisLetterSettings } from "@actions/atisLetter";
import { HotlineSettings } from "@actions/hotline";
import { StationSettings } from "@actions/stationStatus";
import { TrackAudioStatusSettings } from "@actions/trackAudioStatus";
import {
  AtisLetterController,
  isAtisLetterController,
} from "@controllers/atisLetter";
import { HotlineController, isHotlineController } from "@controllers/hotline";
import {
  PushToTalkController,
  isPushToTalkController,
} from "@controllers/pushToTalk";
import {
  StationStatusController,
  isStationStatusController,
} from "@controllers/stationStatus";
import {
  TrackAudioStatusController,
  isTrackAudioStatusController,
} from "@controllers/trackAudioStatus";
import { Action } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import {
  StationStateUpdate,
  StationStateUpdateAvailable,
} from "@interfaces/messages";
import trackAudioManager from "@managers/trackAudio";
import { handleAsyncException } from "@root/utils/handleAsyncException";
import debounce from "debounce";
import { EventEmitter } from "events";
import vatsimManager from "./vatsim";
import { PushToTalkSettings } from "@actions/pushToTalk";

/**
 * Singleton class that manages StreamDeck actions
 */
class ActionManager extends EventEmitter {
  private static instance: ActionManager | null = null;
  private actions: Controller[] = [];

  private constructor() {
    super();

    // Debounce the update methods to avoid rapid pinging of TrackAudio or
    // title redraws while typing
    this.updateAtisLetter = debounce(this.updateAtisLetter.bind(this), 500);
    this.updateHotline = debounce(this.updateHotline.bind(this), 500);
    this.updateHotline = debounce(this.updateHotline.bind(this), 500);
    this.updateStation = debounce(this.updateStation.bind(this), 500);
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
   * Adds a push-to-talk action to the action list. Emits a pushToTalkAdded event
   * after the action is added.
   * @param action The action
   */
  public addPushToTalk(action: Action, settings: PushToTalkSettings): void {
    const controller = new PushToTalkController(action, settings);
    this.actions.push(controller);

    this.emit("pushToTalkAdded", controller);
    this.emit("actionAdded", controller);
  }

  /**
   * Adds a TrackAudio status action to the action list. Emits a trackAudioStatusAdded event
   * after the action is added.
   * @param action The action to add
   */
  public addTrackAudio(action: Action, settings: TrackAudioStatusSettings) {
    const controller = new TrackAudioStatusController(action, settings);

    this.actions.push(controller);
    this.emit("trackAudioStatusAdded", controller);
    this.emit("actionAdded", controller);
  }

  /**
   * Adds a hotline actiont to the action list. Emits a trackAudioStatusAdded event
   * after the action is added.
   * @param action The action to add
   * @param settings The settings for the action
   */
  public addHotline(action: Action, settings: HotlineSettings) {
    const controller = new HotlineController(action, settings);

    // Force buttons to refresh so the newly added button shows the correct state.
    this.actions.push(controller);
    this.emit("hotlineAdded", controller);
    this.emit("actionAdded", controller);
  }

  /**
   * Adds a station status action to the action list. Emits a stationStatusAdded
   * event after the action is added.
   * @param action The action
   * @param settings The settings for the action
   */
  public addStation(action: Action, settings: StationSettings): void {
    const controller = new StationStatusController(action, settings);

    this.actions.push(controller);
    this.emit("stationStatusAdded", controller);
    this.emit("actionAdded", controller);
  }

  /**
   * Adds a station status action to the action list. Emits a stationStatusAdded
   * event after the action is added.
   * @param action The action
   * @param settings The settings for the action
   */
  public addAtisLetter(action: Action, settings: AtisLetterSettings): void {
    const controller = new AtisLetterController(action, settings);

    this.actions.push(controller);
    this.emit("atisLetterAdded", controller);
    this.emit("actionAdded", controller);
  }

  /**
   * Called when a TrackAudio status action keydown event is triggered.
   * Forces a refresh of the TrackAudio status.
   * @param action The action
   */
  public trackAudioStatusKeyDown(action: Action): void {
    trackAudioManager.refreshVoiceConnectedState(); // This also causes a refresh of the station states

    action.showOk().catch((error: unknown) => {
      handleAsyncException(
        "Unable to show OK status on TrackAudio action: ",
        error
      );
    });
  }

  /**
   * Called when an ATIS letter action keydown event is triggered. If the
   * action is in the isUpdated state then it clears the state. If the
   * station is not in the isUpdated state then forces a VATSIM data refresh.
   * @param action The action
   */
  public atisLetterKeyDown(action: Action): void {
    const savedAction = this.getAtisLetterControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    if (savedAction.isUpdated) {
      savedAction.isUpdated = false;
    } else {
      savedAction.action.showOk().catch((error: unknown) => {
        handleAsyncException("Unable to show OK on ATIS button:", error);
      });
      vatsimManager.refresh();
    }
  }

  /**
   * Resets the ATIS letter on all ATIS letter actions to undefined.
   */
  public resetAtisLetterOnAll() {
    this.getAtisLetterControllers().forEach((action) => {
      action.letter = undefined;
    });
  }

  /**
   * Updates the settings associated with a station status action.
   * Emits a stationStatusSettingsUpdated event if the settings require
   * the action to refresh.
   * @param action The action to update
   * @param settings The new settings to use
   */
  public updateStation(action: Action, settings: StationSettings) {
    const savedAction = this.getStationStatusControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    // This avoids unnecessary calls to TrackAudio when the callsign or listenTo settings
    // didn't change.
    const requiresStationRefresh =
      savedAction.callsign !== settings.callsign ||
      savedAction.listenTo !== (settings.listenTo ?? "rx");

    savedAction.settings = settings;

    if (requiresStationRefresh) {
      this.emit("stationStatusSettingsUpdated", savedAction);
    }
  }

  /**
   * Updates the settings associated with a TrackAudio status action.
   * @param action The action to update
   * @param settings The new settings to use
   */
  public updateTrackAudioStatus(
    action: Action,
    settings: TrackAudioStatusSettings
  ) {
    const savedAction = this.getTrackAudioStatusControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    savedAction.settings = settings;
  }

  /**
   * Updates the settings associated with a hotline status action.
   * Emits a hotlineSettingsUpdated event if the settings require
   * the action to refresh.
   * @param action The action to update
   * @param settings The new settings to use
   */
  public updateHotline(action: Action, settings: HotlineSettings) {
    const savedAction = this.getHotlineControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    // This avoids unnecessary calls to TrackAudio when the callsigns aren't the settings
    // that changed.
    const requiresStationRefresh =
      savedAction.primaryCallsign !== settings.primaryCallsign ||
      savedAction.hotlineCallsign !== settings.hotlineCallsign;

    savedAction.settings = settings;

    if (requiresStationRefresh) {
      this.emit("hotlineSettingsUpdated", savedAction);
    }
  }

  /**
   * Updates the settings associated with an ATIS letter status action.
   * Emits a atisLetterUpdated event if the settings require
   * the action to refresh.
   * @param action The action to update
   * @param settings The new settings to use
   */
  public updateAtisLetter(action: Action, settings: AtisLetterSettings) {
    const savedAction = this.getAtisLetterControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    const requiresRefresh = savedAction.settings.callsign !== settings.callsign;

    savedAction.settings = settings;

    if (requiresRefresh) {
      this.emit("atisLetterUpdated", savedAction);
    }
  }

  /**
   * Updates the settings associated with a push to talk action.
   * the action to refresh.
   * @param action The action to update
   * @param settings The new settings to use
   */
  public updatePushToTalk(action: Action, settings: PushToTalkSettings) {
    const savedAction = this.getPushToTalkControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    savedAction.settings = settings;
  }

  /**
   * Updates all stations that match the callsign in the data so its
   * state is unavailable.
   * @param data The station that is not available
   */
  public setStationUnavailable(callsign: string) {
    // Do all the station status controllers
    this.getStationStatusControllers()
      .filter((entry) => entry.callsign === callsign)
      .forEach((entry) => {
        entry.frequency = 0;
      });

    // Do all the hotlines
    this.getHotlineControllers().forEach((entry) => {
      if (entry.primaryCallsign === callsign) {
        entry.primaryFrequency = 0;
      }

      if (entry.hotlineCallsign === callsign) {
        entry.hotlineFrequency = 0;
      }
    });
  }

  /**
   * Updates stations to match the provided station state update.
   * If a callsign is provided in the update then all stations with that callsign
   * have their frequency set.
   * @param data The StationStateUpdate message from TrackAudio
   */
  public updateStationState(data: StationStateUpdateAvailable) {
    // First set the frequency if one was provided. This usually comes in the first
    // station state update message from TrackAudio. Setting the frequency also
    // updates the isAvailable state since any station with a frequency is available.
    if (data.value.callsign) {
      this.setStationFrequency(data.value.callsign, data.value.frequency);
    }

    // Set the listen state for all stations using the frequency and refresh the
    // state image.
    this.getStationStatusControllers()
      .filter((entry) => entry.frequency === data.value.frequency)
      .forEach((entry) => {
        // Issue 231: Handle listenTo xc or xca
        if (
          (data.value.rx || data.value.tx) &&
          (entry.listenTo === "xc" || entry.listenTo === "xca")
        ) {
          entry.isListening = true;
        } else {
          entry.isListening =
            (data.value.rx && entry.listenTo === "rx") ||
            (data.value.tx && entry.listenTo === "tx");
        }

        entry.refreshImage();
      });

    // Do the same for hotline actions
    this.getHotlineControllers().forEach((entry) => {
      if (entry.primaryFrequency === data.value.frequency) {
        entry.isTxPrimary = data.value.tx;
      }
      if (entry.hotlineFrequency === data.value.frequency) {
        entry.isTxHotline = data.value.tx;
        entry.isRxHotline = data.value.rx;
      }

      entry.refreshImage();
    });
  }

  /**
   * Updates the isAvailable property on all tracked controllers based on
   * whether that station is present in the list of data from TrackAudio.
   * @param stations The list of station data received from TrackAudio.
   */
  public updateStationsIsAvailable(stations: StationStateUpdate[]) {
    const callsigns = stations.map((entry) => entry.value.callsign);

    // Loop through all tracked controllers and see if they are in the dictionary.
    // If not set the frequency to 0, which also triggers the station availability to
    // go unavailable.
    this.getStationStatusControllers().forEach((entry) => {
      if (!entry.callsign) {
        return;
      }

      if (!callsigns.includes(entry.callsign)) {
        entry.frequency = 0;
      }
    });

    // Do the same for the hotline actions. If the primary or hotline callsign aren't there,
    // set the associated frequency to 0, which also triggers the station availability to
    // go unavailable.
    this.getHotlineControllers().forEach((entry) => {
      if (!entry.primaryCallsign && !entry.hotlineCallsign) {
        return;
      }

      if (!callsigns.includes(entry.primaryCallsign)) {
        entry.primaryFrequency = 0;
      }

      if (!callsigns.includes(entry.hotlineCallsign)) {
        entry.hotlineFrequency = 0;
      }
    });
  }

  /**
   * Updates the frequency on all actions that use the callsign. This includes
   * station status actions and hotline actions.
   * @param callsign The callsign of the station to update the frequency on
   * @param frequency The frequency to update to
   */
  public setStationFrequency(callsign: string, frequency: number) {
    this.getStationStatusControllers()
      .filter((entry) => entry.callsign === callsign)
      .forEach((entry) => {
        entry.frequency = frequency;
      });

    this.getHotlineControllers().forEach((entry) => {
      if (entry.primaryCallsign === callsign) {
        entry.primaryFrequency = frequency;
      }
      if (entry.hotlineCallsign === callsign) {
        entry.hotlineFrequency = frequency;
      }
    });
  }

  /**
   * Removes the frequency from all actions that depend on it.
   * @param frequency The frequency to remove
   */
  public removeFrequency(frequency: number) {
    this.getStationStatusControllers()
      .filter((entry) => entry.frequency === frequency)
      .forEach((entry) => (entry.frequency = 0));

    this.getHotlineControllers().forEach((entry) => {
      if (entry.primaryFrequency === frequency) {
        entry.primaryFrequency = 0;
      }
      if (entry.hotlineFrequency === frequency) {
        entry.hotlineFrequency = 0;
      }
    });
  }

  /**
   * Updates all actions that match the frequency to show the transmission in progress state.
   * @param frequency The callsign of the actions to update
   */
  public rxBegin(frequency: number, callsign: string) {
    this.getStationStatusControllers()
      .filter(
        (entry) => entry.frequency === frequency && entry.isListeningForReceive
      )
      .forEach((entry) => {
        entry.isReceiving = true;
        entry.lastReceivedCallsign = callsign;
      });

    // Hotline actions that have a hotline frequency matching the rxBegin frequency
    // also update to show a transmission is occurring.
    this.getHotlineControllers()
      .filter((entry) => entry.hotlineFrequency === frequency)
      .forEach((entry) => {
        entry.isReceiving = true;
      });
  }

  /**
   * Updates all actions that match the callsign to clear the transmission in progress state.
   * @param frequency The callsign of the actions to update
   */
  public rxEnd(frequency: number) {
    this.getStationStatusControllers()
      .filter(
        (entry) => entry.frequency === frequency && entry.isListeningForReceive
      )
      .forEach((entry) => {
        entry.isReceiving = false;
      });

    // Hotline actions that have a hotline frequency matching the rxBegin frequency
    // also update to show a transmission is occurring.
    this.getHotlineControllers()
      .filter((entry) => entry.hotlineFrequency === frequency)
      .forEach((entry) => {
        entry.isReceiving = false;
      });
  }

  /**
   * Updates all actions that are listening to tx to show the transmission in progress state.
   * @param frequency The callsign of the actions to update
   */
  public txBegin() {
    this.getStationStatusControllers()
      .filter((entry) => entry.isListeningForTransmit)
      .forEach((entry) => {
        entry.isTransmitting = true;
      });

    this.getPushToTalkControllers().forEach((entry) => {
      entry.isTransmitting = true;
    });
  }

  /**
   * Updates all actions that are listening to tx to clear the transmission in progress state.
   */
  public txEnd() {
    this.getStationStatusControllers()
      .filter((entry) => entry.isListeningForTransmit)
      .forEach((entry) => {
        entry.isTransmitting = false;
      });

    this.getPushToTalkControllers().forEach((entry) => {
      entry.isTransmitting = false;
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

    if (!foundAction || !isHotlineController(foundAction)) {
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
    trackAudioManager.sendMessage({
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
    trackAudioManager.sendMessage({
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

    if (!foundAction || !isStationStatusController(foundAction)) {
      return;
    }

    // Don't try and toggle a station that doesn't have a frequency (typically this means it doesn't exist)
    if (foundAction.frequency === 0) {
      return;
    }

    // Send the message to TrackAudio.
    trackAudioManager.sendMessage({
      type: "kSetStationState",
      value: {
        frequency: foundAction.frequency,
        rx: foundAction.listenTo === "rx" ? "toggle" : undefined,
        tx: foundAction.listenTo === "tx" ? "toggle" : undefined,
        xc: foundAction.listenTo === "xc" ? "toggle" : undefined,
        xca: foundAction.listenTo === "xca" ? "toggle" : undefined,
      },
    });
  }

  /**
   * Updates the connection state on all TrackAudio status buttons to the current connected states
   * and updates the background image to the appropriate state image.
   * @param isConnected True if connected, false if not
   */
  public updateTrackAudioConnectionState() {
    this.getTrackAudioStatusControllers().forEach((entry) => {
      entry.isConnected = trackAudioManager.isConnected;
      entry.isVoiceConnected = trackAudioManager.isVoiceConnected;
    });
  }

  /**
   * Sends a message via TrackAudioManager to indicate a PushToTalk action was pressed.
   */
  public pttPressed() {
    trackAudioManager.sendMessage({ type: "kPttPressed" });
  }

  /**
   * Sends a message via TrackAudioManager to indicate a PushToTalk action was released.
   */
  public pttReleased() {
    trackAudioManager.sendMessage({ type: "kPttReleased" });
  }

  /**
   * Returns an array of all the actions tracked by the action manager.
   * @returns An array of the currently tracked actions
   */
  public getActions(): Controller[] {
    return this.actions;
  }

  /**
   * Retrieves the list of all tracked StationStatusControllers.
   * @returns An array of StationStatusControllers
   */
  public getStationStatusControllers(): StationStatusController[] {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.actions.filter((action) =>
      isStationStatusController(action)
    ) as StationStatusController[];
  }

  /**
   * Retrieves the list of all tracked PushToTalkControllers.
   * @returns An array of PushToTalkControllers
   */
  public getPushToTalkControllers(): PushToTalkController[] {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.actions.filter((action) =>
      isPushToTalkController(action)
    ) as PushToTalkController[];
  }

  /**
   * Retrieves the list of all tracked HotlineControllers.
   * @returns An array of HotlineControllers
   */
  public getHotlineControllers(): HotlineController[] {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.actions.filter((action) =>
      isHotlineController(action)
    ) as HotlineController[];
  }

  /**
   * Retrieves the list of all tracked AtisLetterControllers.
   * @returns An array of AtisLetterControllers
   */
  public getAtisLetterControllers(): AtisLetterController[] {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.actions.filter((action) =>
      isAtisLetterController(action)
    ) as AtisLetterController[];
  }

  /**
   * Retrieves the list of all tracked TrackAudioStatusControllers.
   * @returns An array of TrackAudioStatusControllers
   */
  public getTrackAudioStatusControllers(): TrackAudioStatusController[] {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.actions.filter((action) =>
      isTrackAudioStatusController(action)
    ) as TrackAudioStatusController[];
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

  /**
   * Refreshes the image on all tracked actions.
   */
  public refreshAllImages() {
    this.actions.forEach((entry) => {
      entry.refreshImage();
    });
  }

  /**
   * Refreshes the title on all tracked actions.
   */
  public refreshAllTitles() {
    this.actions.forEach((entry) => {
      entry.refreshTitle();
    });
  }

  /**
   * Resets all tracked actions except the TrackAudio status action.
   */
  public resetAllButTrackAudio() {
    this.actions
      .filter((entry) => {
        return !isTrackAudioStatusController(entry);
      })
      .forEach((entry) => {
        entry.reset();
      });
  }

  /**
   * Resets all tracked actions to their initial state.
   */
  public resetAll() {
    this.actions.forEach((entry) => {
      entry.reset();
    });
  }
}

const actionManagerInstance = ActionManager.getInstance();
export default actionManagerInstance;
