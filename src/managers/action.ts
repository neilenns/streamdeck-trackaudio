import {
  AtisLetterController,
  isAtisLetterController,
} from "@controllers/atisLetter";
import { HotlineController, isHotlineController } from "@controllers/hotline";
import {
  MainVolumeController,
  isMainVolumeController,
} from "@controllers/mainVolume";
import {
  PushToTalkController,
  isPushToTalkController,
} from "@controllers/pushToTalk";
import {
  StationStatusController,
  isStationStatusController,
} from "@controllers/stationStatus";
import {
  StationVolumeController,
  isStationVolumeController,
} from "@controllers/stationVolume";
import {
  TrackAudioStatusController,
  isTrackAudioStatusController,
} from "@controllers/trackAudioStatus";
import { ActionContext } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import { SetStationState, StationStateUpdate } from "@interfaces/messages";
import trackAudioManager from "@managers/trackAudio";
import { handleAsyncException } from "@utils/handleAsyncException";
import mainLogger from "@utils/logger";
import { EventEmitter } from "events";

const logger = mainLogger.child({ service: "action" });

/**
 * Singleton class that manages Stream Deck actions
 */
class ActionManager extends EventEmitter {
  private static instance: ActionManager | null = null;
  private actions: Controller[] = [];
  private profileChangedTimeout: NodeJS.Timeout | undefined;
  private static readonly PROFILE_CHANGE_DELAY_MS = 500; // Number of milliseconds to wait before auto-adding stations after a profile change

  private constructor() {
    super();
  }

  /**
   * Provides access to the ActionManager instance.
   * @returns The instance of ActionManager
   */
  public static getInstance(): ActionManager {
    ActionManager.instance ??= new ActionManager();
    return ActionManager.instance;
  }

  public trackProfileChanged() {
    if (this.profileChangedTimeout) {
      clearTimeout(this.profileChangedTimeout);
    }

    this.profileChangedTimeout = setTimeout(() => {
      this.autoAddStations().catch((error: unknown) => {
        handleAsyncException("Error auto-adding stations", error);
      });
    }, ActionManager.PROFILE_CHANGE_DELAY_MS);
  }

  /**
   * Automatically sends add requests to TrackAudio for tracked stations
   */
  public async autoAddStations() {
    // Collect all the status action callsigns. Exclude any with isAvailable true as that means it is
    // already added in TrackAudio. Exclude GUARD and UNICOM since those are always
    // automatically present in TrackAudio, and any stations without a callsign.
    // A Set is used to ensure unique entries in the list.
    const trackedCallsignsSet = new Set(
      this.getStationStatusControllers()
        .filter((controller) => !controller.isAvailable)
        .map((controller) => controller.callsign ?? "")
        .filter(
          (callsign) =>
            callsign !== "GUARD" && callsign !== "UNICOM" && callsign !== ""
        )
    );

    // Add on all the hotline action callsigns
    this.getHotlineControllers().forEach((hotline) => {
      // If the hotline is already available, don't add it to TrackAudio again.
      if (hotline.isAvailable) {
        return;
      }
      if (hotline.primaryCallsign) {
        trackedCallsignsSet.add(hotline.primaryCallsign);
      }
      if (hotline.hotlineCallsign) {
        trackedCallsignsSet.add(hotline.hotlineCallsign);
      }
    });

    // Auto-add all tracked callsigns with a 250ms delay between each message
    await trackAudioManager.addStationsWithDelay(
      Array.from(trackedCallsignsSet),
      350
    );
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
   * Updates the connection state on all TrackAudio status buttons to the current connected states
   * and updates the background image to the appropriate state image.
   */
  public updateTrackAudioConnectionState() {
    this.getTrackAudioStatusControllers().forEach((entry) => {
      entry.refreshDisplay();
    });
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
   * Adds a controller to the list of tracked actions.
   * @param controller The controller to add
   */
  public add(controller: Controller): void {
    this.actions.push(controller);
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
   * Retrieves the list of all tracked MainVolumeController.
   * @returns An array of MainVolumeControllers
   */
  public getMainVolumeControllers(): MainVolumeController[] {
    return this.getControllers(isMainVolumeController);
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
   * Refreshes the text and image on all tracked actions.
   */
  public refreshDisplayAll() {
    this.actions.forEach((entry) => {
      entry.refreshDisplay();
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
