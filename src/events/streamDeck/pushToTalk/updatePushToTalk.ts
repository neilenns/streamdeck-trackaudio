import { PushToTalkSettings } from "@actions/pushToTalk";
import { KeyAction } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Updates the settings associated with a push to talk action.
 * @param action The action to update
 * @param settings The new settings to use
 */
export const handleUpdatePushToTalk = (
  action: KeyAction,
  settings: PushToTalkSettings
) => {
  const savedAction = actionManager
    .getPushToTalkControllers()
    .find((entry) => entry.action.id === action.id);

  if (!savedAction) {
    return;
  }

  savedAction.settings = settings;
};
