import { AtisLetterSettings } from "@actions/atisLetter";
import { HotlineSettings } from "@actions/hotline";
import { PushToTalkSettings } from "@actions/pushToTalk";
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
import { ActionContext, DialAction, KeyAction } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import {
  SetStationState,
  StationStateUpdate,
  StationStateUpdateAvailable,
} from "@interfaces/messages";
import trackAudioManager from "@managers/trackAudio";
import { handleAsyncException } from "@root/utils/handleAsyncException";
import mainLogger from "@utils/logger";
import debounce from "debounce";
import { EventEmitter } from "events";
import vatsimManager from "./vatsim";
import {
  isStationVolumeController,
  StationVolumeController,
} from "@controllers/stationVolume";
import { StationVolumeSettings } from "@actions/stationVolume";

const logger = mainLogger.child({ service: "action" });

/**
 * Singleton class that manages Stream Deck actions
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
    //this.updateStation = debounce(this.updateStation.bind(this), 500);
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
   * Automatically sends add requests to TrackAudio for tracked stations
   */
  public async autoAddStations() {
    // Collect all the status action callsigns. Exclude GUARD and UNICOM since those are always
    // automatically present in TrackAudio. A Set is used to ensure unique entries in the list.
    const trackedCallsignsSet = new Set(
      this.getStationStatusControllers()
        .map((controller) => controller.callsign ?? "")
        .filter((callsign) => callsign !== "GUARD" && callsign !== "UNICOM")
    );

    // Add on all the hotline action callsigns
    this.getHotlineControllers().forEach((hotline) => {
      trackedCallsignsSet.add(hotline.primaryCallsign);
      trackedCallsignsSet.add(hotline.hotlineCallsign);
    });

    // Auto-add all tracked callsigns with a 250ms delay between each message
    await trackAudioManager.addStationsWithDelay(
      Array.from(trackedCallsignsSet),
      350
    );
  }

  /**
   * Adds a push-to-talk action to the action list. Emits a pushToTalkAdded event
   * after the action is added.
   * @param action The action
   */
  public addPushToTalk(action: KeyAction, settings: PushToTalkSettings): void {
    const controller = new PushToTalkController(action, settings);
    this.actions.push(controller);

    this.emit("pushToTalkAdded", controller);
    this.emit("actionAdded", controller);
  }

  /**
   * Adds a hotline actiont to the action list. Emits a trackAudioStatusAdded event
   * after the action is added.
   * @param action The action to add
   * @param settings The settings for the action
   */
  public addHotline(action: KeyAction, settings: HotlineSettings) {
    const controller = new HotlineController(action, settings);

    // Force buttons to refresh so the newly added button shows the correct state.
    this.actions.push(controller);
    this.emit("hotlineAdded", controller);
    this.emit("actionAdded", controller);
  }

  /**
   * Adds a station volume action to the action list. Emits a stationVolumeAdded
   * event after the action is added.
   * @param action The action
   * @param settings The settings for the action
   */
  public addStationVolume(
    action: DialAction,
    settings: StationVolumeSettings
  ): void {
    const controller = new StationVolumeController(action, settings);

    this.actions.push(controller);
    this.emit("stationVolumeAdded", controller);
    this.emit("actionAdded", controller);
  }

  /**
   * Called when an ATIS letter action has a long press. Refreshses the ATIS.
   * @param actionId The ID of the action that had the long press
   */
  public atisLetterLongPress(action: KeyAction) {
    const savedAction = this.getAtisLetterControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    savedAction.reset();
    vatsimManager.refresh();

    action.showOk().catch((error: unknown) => {
      handleAsyncException("Unable to show OK on ATIS button:", error);
    });
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
   * Updates the settings associated with a station volume action.
   * @param action The action to update
   * @param settings The new settings to use
   */
  public updateStationVolumeSettings(
    action: DialAction,
    settings: StationVolumeSettings
  ) {
    const savedAction = this.getStationVolumeControllers().find(
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
  public updateHotline(action: KeyAction, settings: HotlineSettings) {
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
  public updateAtisLetter(action: KeyAction, settings: AtisLetterSettings) {
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
  public updatePushToTalk(action: KeyAction, settings: PushToTalkSettings) {
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

    // Do all the station volume controllers
    this.getStationVolumeControllers()
      .filter((entry) => entry.callsign === callsign)
      .forEach((entry) => {
        entry.frequency = 0;
      });

    // Do all the hotline controllers
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
        entry.isListening =
          (data.value.rx && entry.listenTo === "rx") ||
          (data.value.tx && entry.listenTo === "tx") ||
          (data.value.xc && entry.listenTo === "xc") ||
          (data.value.xca && entry.listenTo === "xca");

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

    this.getStationVolumeControllers().forEach((entry) => {
      if (entry.frequency === data.value.frequency) {
        entry.isOutputMuted = data.value.isOutputMuted;
        entry.outputVolume = data.value.outputVolume;
      }
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

    // Do the same for the station volume actions. If the callsign isn't there, set the frequency to 0.
    this.getStationVolumeControllers().forEach((entry) => {
      if (!entry.callsign) {
        return;
      }

      if (!callsigns.includes(entry.callsign)) {
        entry.frequency = 0;
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

    this.getStationVolumeControllers()
      .filter((entry) => entry.callsign === callsign)
      .forEach((entry) => {
        entry.frequency = frequency;
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
   * Auto sets the spk mode on the specified frequency, if that setting is enabled on the
   * action.
   * @param frequency The frequency to run the auto set actions on.
   */
  public autoSet(frequency: number) {
    this.getStationStatusControllers()
      .filter((entry) => entry.frequency === frequency)
      .forEach((entry) => {
        // Set up the base message to send.
        const update = {
          type: "kSetStationState",
          value: {
            frequency: entry.frequency,
            headset: entry.autoSetSpk ? false : undefined, // Headset is the opposite of speaker, so use false to turn on speaker.
            rx: entry.autoSetRx ? true : undefined,
          },
        } as SetStationState;

        if (entry.autoSetSpk || entry.autoSetRx) {
          trackAudioManager.sendMessage(update);
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
   * Changes the station volume by the number of ticks times the change amount.
   * @param action The action that triggered the volume change
   * @param ticks The number of ticks the dial was rotated
   */
  public changeStationVolume(action: DialAction, ticks: number) {
    const savedAction = this.getStationVolumeControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    // Calculate the new volume level
    const newVolume = Math.min(
      100,
      Math.max(0, savedAction.changeAmount * ticks)
    );

    // Unmute the station since the knob was turned
    trackAudioManager.sendMessage({
      type: "kSetStationState",
      value: {
        frequency: savedAction.frequency,
        isOutputMuted: false,
        rx: undefined,
        xc: undefined,
        xca: undefined,
        headset: undefined,
        tx: undefined,
      },
    });

    // Set the volume
    trackAudioManager.sendMessage({
      type: "kChangeStationVolume",
      value: {
        frequency: savedAction.frequency,
        amount: newVolume,
      },
    });
  }

  public toggleStationMute(action: DialAction) {
    const savedAction = this.getStationVolumeControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!savedAction) {
      return;
    }

    trackAudioManager.sendMessage({
      type: "kSetStationState",
      value: {
        frequency: savedAction.frequency,
        isOutputMuted: "toggle",
        rx: undefined,
        xc: undefined,
        xca: undefined,
        headset: undefined,
        tx: undefined,
      },
    });
  }

  /**
   * Adds a controller to the list of tracked actions.
   * @param controller The controller to add
   */
  public add(controller: Controller): void {
    this.actions.push(controller);
    this.emit("actionAdded", controller);
  }

  /**
   * Finds controllers based on the predicate.
   */
  public find(
    predicate: (entry: Controller) => boolean
  ): Controller | undefined {
    return this.actions.find(predicate);
  }

  /**
   * Removes an action from the list.
   * @param action The action to remove
   */
  public remove(action: ActionContext): void {
    this.actions = this.actions.filter(
      (entry) => entry.action.id !== action.id
    );

    this.emit("removed", this.actions.length);
  }

  /**
   * Handles the short press of a hotline action. Toggles the tx on both the primary and hotline frequency.
   * @param actionId The action id to toggle the state of
   */
  public hotlineShortPress(action: KeyAction): void {
    const foundAction = this.getHotlineControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!foundAction) {
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
        headset: undefined,
        isOutputMuted: undefined,
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
        headset: undefined,
        isOutputMuted: undefined,
      },
    });
  }

  public hotlineLongPress(action: KeyAction) {
    const foundAction = this.getHotlineControllers().find(
      (entry) => entry.action.id === action.id
    );

    if (!foundAction) {
      return;
    }

    foundAction.reset();
    trackAudioManager.refreshStationState(foundAction.primaryCallsign);
    trackAudioManager.refreshStationState(foundAction.hotlineCallsign);

    action.showOk().catch((error: unknown) => {
      handleAsyncException(
        "Unable to show OK status on TrackAudio action: ",
        error
      );
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
   * Returns a list of controllers that match the type guard.
   * @param typeGuard Function that returns true if the Controller is the correct type
   * @returns A list of controllers matching the type guard
   */
  public getControllers<T extends Controller>(
    typeGuard: (action: Controller) => action is T
  ): T[] {
    return this.actions.filter(typeGuard);
  }

  /**
   * Retrieves the list of all tracked StationStatusControllers.
   * @returns An array of StationStatusControllers
   */
  public getStationStatusControllers(): StationStatusController[] {
    return this.getControllers(isStationStatusController);
  }

  /**
   * Retrieves the list of all tracked PushToTalkControllers.
   * @returns An array of PushToTalkControllers
   */
  public getPushToTalkControllers(): PushToTalkController[] {
    return this.getControllers(isPushToTalkController);
  }

  /**
   * Retrieves the list of all tracked HotlineControllers.
   * @returns An array of HotlineControllers
   */
  public getHotlineControllers(): HotlineController[] {
    return this.getControllers(isHotlineController);
  }

  /**
   * Retrieves the list of all tracked AtisLetterControllers.
   * @returns An array of AtisLetterControllers
   */
  public getAtisLetterControllers(): AtisLetterController[] {
    return this.getControllers(isAtisLetterController);
  }

  /**
   * Retrieves the list of all tracked TrackAudioStatusControllers.
   * @returns An array of TrackAudioStatusControllers
   */
  public getTrackAudioStatusControllers(): TrackAudioStatusController[] {
    return this.getControllers(isTrackAudioStatusController);
  }

  /**
   * Retrieves the list of all tracked StationVolumeControllers.
   * @returns An array of StationVolumeControllers
   */
  public getStationVolumeControllers(): StationVolumeController[] {
    return this.getControllers(isStationVolumeController);
  }

  /**
   * Temporarily shows an alert warning on all tracked actions.
   */
  public showAlertOnAll() {
    this.actions.forEach((entry) => {
      entry.action.showAlert().catch((error: unknown) => {
        logger.error(error);
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
