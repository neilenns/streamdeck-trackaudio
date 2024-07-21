import { Action } from "@elgato/streamdeck";

/**
 * Interface for all actions supported by this plugin
 */
export interface Controller {
  type: string;
  action: Action;
  reset: () => void;
}
