import {
  Action,
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import ActionManager, { StatusAction } from "../actionManager";

@action({ UUID: "com.neil-enns.trackaudio.trackaudiostatus" })
/**
 * Represents the status of the websocket connection to TrackAudio
 */
export class TrackAudioStatus extends SingletonAction<TrackAudioStatusSettings> {
  type = "trackAudioStatusAction";
  action: Action | null = null;

  private _isConnected = false;

  /**
   * Gets the isConnected state
   */
  get isConnected() {
    return this._isConnected;
  }

  /**
   * Sets the isConnected state
   */
  set isConnected(newValue: boolean) {
    // Don't do anything if the state is the same
    if (this._isConnected === newValue) {
      return;
    }

    this._isConnected = newValue;
    this.setConnectedImage();
  }

  /**
   * Sets the action image based on the isConnected state
   */
  public setConnectedImage() {
    if (this.isConnected) {
      this.action?.setState(1).catch((error: unknown) => {
        console.error(error);
      });
    } else {
      this.action?.setState(0).catch((error: unknown) => {
        console.error(error);
      });
    }
  }

  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code.
  onWillAppear(
    ev: WillAppearEvent<TrackAudioStatusSettings>
  ): void | Promise<void> {
    this.action = ev.action;
    ActionManager.getInstance().addTrackAudio(this);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  onWillDisappear(
    ev: WillDisappearEvent<TrackAudioStatusSettings>
  ): void | Promise<void> {
    ActionManager.getInstance().remove(ev.action);
  }
}

/**
 * Typeguard for TrackAudioStatusAction.
 * @param action The action
 * @returns True if the action is a TrackAudioStatusAction
 */
export function isTrackAudioStatusAction(
  action: StatusAction
): action is TrackAudioStatus {
  return action.type === "trackAudioStatusAction";
}

// Currently no settings are needed for this action
type TrackAudioStatusSettings = Record<string, never>;
