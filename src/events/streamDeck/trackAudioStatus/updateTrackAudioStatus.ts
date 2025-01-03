import { TrackAudioStatusSettings } from "@actions/trackAudioStatus";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Updates the settings associated with a TrackAudio status action.
 * @param action The action to update
 * @param settings The new settings to use
 */
export const handleUpdateTrackAudioStatus = (
  action: KeyAction,
  settings: TrackAudioStatusSettings
) => {
  const savedAction = actionManager
    .getTrackAudioStatusControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  savedAction.settings = settings;
};
