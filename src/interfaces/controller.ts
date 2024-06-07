import { HotlineController } from "@controllers/hotline";
import { StationStatusController } from "@controllers/stationStatus";
import { TrackAudioStatusController } from "@controllers/trackAudioStatus";

/**
 * Type union for all possible actions supported by this plugin
 */
export type Controller =
  | StationStatusController
  | TrackAudioStatusController
  | HotlineController;
