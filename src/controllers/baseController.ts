import { DialAction, FeedbackPayload, KeyAction } from "@elgato/streamdeck";
import { Controller } from "@interfaces/controller";
import svgManager from "@managers/svg";
import { handleAsyncException } from "@root/utils/handleAsyncException";

/**
 * Base implementation for a Controller that includes methods for
 * managing the title and image display on a Stream Deck action.
 */
export abstract class BaseController implements Controller {
  /**
   * Used to type guard the derived classes.
   */
  abstract type: string;

  /**
   * The Stream Deck action this controller manages.
   */
  action: KeyAction | DialAction;

  /**
   * Initializes the BaseController.
   * @param action The Stream Deck icon this wraps
   */
  constructor(action: KeyAction | DialAction) {
    this.action = action;
  }

  /**
   * Resets the controller to its default state.
   */
  abstract reset(): void;

  /**
   * Refreshes the image displayed on the action.
   */
  abstract refreshImage(): void;

  /**
   * Refreshes the title displayed on the action.
   */
  abstract refreshTitle(): void;

  /**
   * Sets the title on the tracked action, catching any exceptions
   * that might occur.
   * @param title The title to set.
   */
  setTitle(title: string) {
    this.action.setTitle(title).catch((error: unknown) => {
      handleAsyncException("Unable to set action title: ", error);
    });
  }

  /**
   * Sets the image on the tracked action. If the image is a stored
   * SVG template then the template is populated and used. Otherwise
   * the path is used directly.
   * @param imagePath The path to the image
   * @param replacements The replacements to use
   */
  setImage(imagePath: string, replacements: object) {
    const generatedSvg = svgManager.renderSvg(imagePath, replacements);
    if (generatedSvg) {
      this.action.setImage(generatedSvg).catch((error: unknown) => {
        handleAsyncException("Unable to set state image: ", error);
      });
    } else {
      this.action.setImage(imagePath).catch((error: unknown) => {
        handleAsyncException("Unable to set state image: ", error);
      });
    }
  }

  setFeedback(
    imagePath: string,
    replacements: object,
    feedback: FeedbackPayload
  ) {
    if (!this.action.isDial()) {
      return;
    }

    const generatedSvg = svgManager.renderSvg(imagePath, replacements);

    if (generatedSvg) {
      this.action
        .setFeedback({
          ...feedback,
          icon: generatedSvg,
        })
        .catch((error: unknown) => {
          handleAsyncException("Unable to set dial feedback: ", error);
        });
    } else {
      this.action
        .setFeedback({
          ...feedback,
          icon: imagePath,
        })
        .catch((error: unknown) => {
          handleAsyncException("Unable to set dial feedback: ", error);
        });
    }
  }
}
