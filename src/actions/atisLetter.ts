import {
  action,
  DidReceiveSettingsEvent,
  JsonValue,
  KeyAction,
  KeyUpEvent,
  SendToPluginEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
  streamDeck,
} from "@elgato/streamdeck";
import { handleAddAtisLetter } from "@events/streamDeck/atisLetter/addAtisLetter";
import { handleAtisLetterLongPress } from "@events/streamDeck/atisLetter/atisLetterLongPress";
import { handleAtisLetterShortPress } from "@events/streamDeck/atisLetter/atisLetterShortPress";
import { handleUpdateAtisLetter } from "@events/streamDeck/atisLetter/updateAtisLetter";
import { handleRemove } from "@events/streamDeck/remove";
import { LONG_PRESS_THRESHOLD } from "@utils/constants";
import debounce from "debounce";

@action({ UUID: "com.neil-enns.trackaudio.atisletter" })
/**
 * Represents the status of a TrackAudio station
 */
export class AtisLetter extends SingletonAction<AtisLetterSettings> {
  private _keyDownStart = 0;

  debouncedUpdate = debounce(
    (action: KeyAction, settings: AtisLetterSettings) => {
      handleUpdateAtisLetter(action, settings);
    },
    300
  );

  // When the action is added to a profile it gets saved in the ActionManager
  // instance for use elsewhere in the code. The default title is also set
  // to something useful.
  override onWillAppear(
    ev: WillAppearEvent<AtisLetterSettings>
  ): void | Promise<void> {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // KeyAction.
    if (!ev.action.isKey()) {
      return;
    }

    handleAddAtisLetter(ev.action, ev.payload.settings);
  }

  // When the action is removed from a profile it also gets removed from the ActionManager.
  override onWillDisappear(
    ev: WillDisappearEvent<AtisLetterSettings>
  ): void | Promise<void> {
    handleRemove(ev.action);
  }

  // When settings are received the ActionManager is called to update the existing
  // settings on the saved action.
  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<AtisLetterSettings>
  ): void | Promise<void> {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // KeyAction.
    if (!ev.action.isKey()) {
      return;
    }

    this.debouncedUpdate(ev.action, ev.payload.settings);
  }

  // Handles the click on the Get it on marketplace icon that directs people to the vATIS
  // plugin instead of using this action.
  override async onSendToPlugin(
    ev: SendToPluginEvent<JsonValue, AtisLetterSettings>
  ): Promise<void> {
    if (ev.payload === "openMarketplace") {
      await streamDeck.system.openUrl(
        "https://marketplace.elgato.com/product/vatis-878fcd1a-7e0a-4d6e-bd36-c70b075573ea"
      );
    }
  }

  override onKeyDown(): Promise<void> | void {
    this._keyDownStart = Date.now();
  }

  override onKeyUp(ev: KeyUpEvent<AtisLetterSettings>): Promise<void> | void {
    const pressLength = Date.now() - this._keyDownStart;

    if (pressLength > LONG_PRESS_THRESHOLD) {
      handleAtisLetterLongPress(ev.action);
    } else {
      handleAtisLetterShortPress(ev.action);
    }
  }
}

export interface AtisLetterSettings {
  autoClear?: boolean;
  callsign?: string;
  currentImagePath?: string;
  showLetter?: boolean;
  showTitle?: boolean;
  title?: string;
  unavailableImagePath?: string;
  updatedImagePath?: string;
  [key: string]: JsonValue;
}
