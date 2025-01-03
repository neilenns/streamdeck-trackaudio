import { ActionContext } from "@elgato/streamdeck";
import actionManager from "@managers/action";

/**
 * Removes an action from the list. Emits a removed event after the action is removed.
 * @param action The action to remove
 */
export const handleRemove = (action: ActionContext) => {
  actionManager.remove(action);
};
