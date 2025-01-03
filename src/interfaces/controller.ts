import { KeyAction, DialAction } from "@elgato/streamdeck";

/**
 * Interface for all actions supported by this plugin
 */
export interface Controller {
  type: string;
  action: KeyAction | DialAction;
  reset(): void;
  refreshImage(): void;
  refreshTitle(): void;
}
