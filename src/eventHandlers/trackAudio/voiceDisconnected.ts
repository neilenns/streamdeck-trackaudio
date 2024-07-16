import ActionManager from "@managers/action";

export const handleVoiceDisconnected = () => {
  const actionManager = ActionManager.getInstance();

  actionManager.setIsListeningOnAll(false);
};
