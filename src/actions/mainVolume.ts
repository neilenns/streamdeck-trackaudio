import {
  action,
  DialAction,
  DialRotateEvent,
  DidReceiveSettingsEvent,
  JsonValue,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { handleAddMainVolume } from "@events/streamDeck/mainVolume/addMainVolume";
import { handleRemove } from "@events/streamDeck/remove";
import { handleDialRotate } from "@events/streamDeck/mainVolume/dialRotate";
import debounce from "debounce";
import { handleUpdateMainVolumeSettings } from "@events/streamDeck/mainVolume/updateMainVolumeSettings";

@action({ UUID: "com.neil-enns.trackaudio.mainvolume" })
/**
 * Represents the volume of a TrackAudio station
 */
export class MainVolume extends SingletonAction<MainVolumeSettings> {
  debouncedUpdate = debounce(
    (action: DialAction, settings: MainVolumeSettings) => {
      handleUpdateMainVolumeSettings(action, settings);
    },
    300
  );

  override onWillAppear(
    ev: WillAppearEvent<MainVolumeSettings>
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    handleAddMainVolume(ev.action, ev.payload.settings);
  }

  override onDialRotate(
    ev: DialRotateEvent<MainVolumeSettings>
  ): Promise<void> | void {
    handleDialRotate(ev.action, ev.payload.ticks);
  }

  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<MainVolumeSettings>
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    this.debouncedUpdate(ev.action, ev.payload.settings);
  }

  override onWillDisappear(
    ev: WillDisappearEvent<MainVolumeSettings>
  ): Promise<void> | void {
    handleRemove(ev.action);
  }
}

export interface MainVolumeSettings {
  changeAmount?: number;
  connectedImagePath?: string;
  notConnectedImagePath?: string;
  title?: string;
  [key: string]: JsonValue;
}
