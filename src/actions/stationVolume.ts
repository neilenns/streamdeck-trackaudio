import {
  action,
  DialAction,
  DialDownEvent,
  DialRotateEvent,
  DidReceiveSettingsEvent,
  JsonValue,
  SingletonAction,
  TouchTapEvent,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { handleStationVolumeDialRotate } from "@events/streamDeck/stationVolume/stationVolumeDialRotate";
import { handleRemove } from "@events/streamDeck/remove";
import { handleAddStationVolume } from "@events/streamDeck/stationVolume/addStationVolume";
import { handleStationVolumeDialPress } from "@events/streamDeck/stationVolume/stationVolumeDialPress";
import { handleUpdateStationVolumeSettings } from "@events/streamDeck/stationVolume/updateStationVolumeSettings";
import debounce from "debounce";

@action({ UUID: "com.neil-enns.trackaudio.stationvolume" })
/**
 * Represents the volume of a TrackAudio station
 */
export class StationVolume extends SingletonAction {
  debouncedUpdate = debounce(
    (action: DialAction, settings: StationVolumeSettings) => {
      handleUpdateStationVolumeSettings(action, settings);
    },
    300
  );

  override onWillAppear(
    ev: WillAppearEvent
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    handleAddStationVolume(ev.action, ev.payload.settings);
  }

  override onDialRotate(
    ev: DialRotateEvent
  ): Promise<void> | void {
    handleStationVolumeDialRotate(ev.action, ev.payload.ticks);
  }

  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    this.debouncedUpdate(ev.action, ev.payload.settings);
  }

  override onDialDown(
    ev: DialDownEvent
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    handleStationVolumeDialPress(ev.action, "press");
  }

  override onTouchTap(
    ev: TouchTapEvent
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    handleStationVolumeDialPress(ev.action, "tap");
  }

  override onWillDisappear(
    ev: WillDisappearEvent
  ): Promise<void> | void {
    handleRemove(ev.action);
  }
}

export interface StationVolumeSettings {
  unavailableImagePath?: string;
  callsign?: string;
  changeAmount?: number;
  mutedImagePath?: string;
  notMutedImagePath?: string;
  pushToMute?: boolean;
  tapToMute?: boolean;
  [key: string]: JsonValue;
}
