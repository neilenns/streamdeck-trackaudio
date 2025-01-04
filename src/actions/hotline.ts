import {
  action,
  DidReceiveSettingsEvent,
  JsonValue,
  KeyAction,
  KeyUpEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { handleAddHotline } from "@events/streamDeck/hotline/addHotline";
import { handleHotlineLongPress } from "@events/streamDeck/hotline/hotlineLongPress";
import { handleHotlineShortPress } from "@events/streamDeck/hotline/hotlineShortPress";
import { handleUpdateHotline } from "@events/streamDeck/hotline/updateHotline";
import { handleRemove } from "@events/streamDeck/remove";
import { LONG_PRESS_THRESHOLD } from "@utils/constants";
import debounce from "debounce";

@action({ UUID: "com.neil-enns.trackaudio.hotline" })
/**
 * Represents the status of a TrackAudio station
 */
export class Hotline extends SingletonAction<HotlineSettings> {
  private _keyDownStart = 0;

  debouncedUpdate = debounce((action: KeyAction, settings: HotlineSettings) => {
    handleUpdateHotline(action, settings);
  }, 300);

  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  override onWillAppear(
    ev: WillAppearEvent<HotlineSettings>
  ): void | Promise<void> {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // KeyAction.
    if (!ev.action.isKey()) {
      return;
    }

    handleAddHotline(ev.action, ev.payload.settings);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  override onWillDisappear(
    ev: WillDisappearEvent<HotlineSettings>
  ): void | Promise<void> {
    handleRemove(ev.action);
  }

  // When settings are received the ActionManager is called to update the existing
  // settings on the saved action.
  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<HotlineSettings>
  ): void | Promise<void> {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // KeyAction.
    if (!ev.action.isKey()) {
      return;
    }

    this.debouncedUpdate(ev.action, ev.payload.settings);
  }

  override onKeyDown(): void | Promise<void> {
    this._keyDownStart = Date.now();
  }

  override onKeyUp(ev: KeyUpEvent<HotlineSettings>): Promise<void> | void {
    const pressLength = Date.now() - this._keyDownStart;

    if (pressLength > LONG_PRESS_THRESHOLD) {
      handleHotlineLongPress(ev.action);
    } else {
      handleHotlineShortPress(ev.action);
    }
  }
}

export interface HotlineSettings {
  primaryCallsign: string;
  hotlineCallsign: string;
  title?: string;
  receivingImagePath?: string;
  listeningImagePath?: string;
  hotlineActiveImagePath?: string;
  bothActiveImagePath?: string;
  neitherActiveImagePath?: string;
  unavailableImagePath?: string;
  showTitle?: boolean;
  showHotlineCallsign?: boolean;
  showPrimaryCallsign?: boolean;
  [key: string]: JsonValue;
}
