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
import { MainVolumeSettings } from "./mainVolume";

@action({ UUID: "com.neil-enns.trackaudio.stationvolume" })
/**
 * Represents the volume of a TrackAudio station
 */
export class StationVolume extends SingletonAction<StationVolumeSettings> {
  debouncedUpdate = debounce(
    (action: DialAction, settings: StationVolumeSettings) => {
      handleUpdateStationVolumeSettings(action, settings);
    },
    300
  );

  override onWillAppear(
    ev: WillAppearEvent<StationVolumeSettings>
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    handleAddStationVolume(ev.action, ev.payload.settings);
  }

  override onDialRotate(
    ev: DialRotateEvent<StationVolumeSettings>
  ): Promise<void> | void {
    handleStationVolumeDialRotate(ev.action, ev.payload.ticks);
  }

  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<StationVolumeSettings>
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    this.debouncedUpdate(ev.action, ev.payload.settings);
  }

  override onDialDown(
    ev: DialDownEvent<StationVolumeSettings>
  ): Promise<void> | void {
    handleStationVolumeDialPress(ev.action);
  }

  override onTouchTap(
    ev: TouchTapEvent<MainVolumeSettings>
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    handleDialPress(ev.action);
  }

  override onWillDisappear(
    ev: WillDisappearEvent<StationVolumeSettings>
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
  [key: string]: JsonValue;
}
