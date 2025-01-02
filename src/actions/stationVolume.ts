import {
  action,
  DialDownEvent,
  DialRotateEvent,
  DidReceiveSettingsEvent,
  JsonValue,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import actionManager from "@managers/action";

@action({ UUID: "com.neil-enns.trackaudio.stationvolume" })
/**
 * Represents the volume of a TrackAudio station
 */
export class StationVolume extends SingletonAction<StationVolumeSettings> {
  private _settings: StationVolumeSettings | null = null;

  override onWillAppear(
    ev: WillAppearEvent<StationVolumeSettings>
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    actionManager.addStationVolume(ev.action, ev.payload.settings);
  }

  override onDialRotate(
    ev: DialRotateEvent<StationVolumeSettings>
  ): Promise<void> | void {
    actionManager.changeStationVolume(ev.action, ev.payload.ticks);
  }

  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<StationVolumeSettings>
  ): Promise<void> | void {
    // This should never happen. Typeguard to ensure the rest of the code can just use
    // DialAction.
    if (!ev.action.isDial()) {
      return;
    }

    actionManager.updateStationVolumeSettings(ev.action, ev.payload.settings);
  }

  override onDialDown(
    ev: DialDownEvent<StationVolumeSettings>
  ): Promise<void> | void {
    actionManager.toggleStationMute(ev.action);
  }

  override onWillDisappear(
    ev: WillDisappearEvent<StationVolumeSettings>
  ): Promise<void> | void {
    actionManager.remove(ev.action);
  }
}

export interface StationVolumeSettings {
  callsign?: string;
  changeAmount?: number;
  [key: string]: JsonValue;
}
