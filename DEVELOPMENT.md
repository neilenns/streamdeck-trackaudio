# Developing with this repo

## Building

1. Run `npm install`
2. Run `npm run build`

The first time you do this on any machine you also need to do `npm run link` otherwise the compiled plugin won't be available to the Stream Deck.

For active development use `npm run watch` instead of `npm run build`, this will auto-refresh the plugin when files change.

## Packaging

Run `npm run package`. Make sure `npm run build` was done first.

## Debugging

VSCode can debug using the `Attach to Plugin` profile. Select the appropriate node.js instance. Yes, there should be a better, more automatic,
way to do this. I'll figure it out someday.

## About the code

This code my first attempt at writing a StreamDeck plugin using the (as of this writing) [beta node.js SDK](https://github.com/elgatosf/streamdeck)
in conjunction with websockets to read and display data from another app. Here are some bits and pieces that might be interesting:

* `src/actionManager.ts` is a singleton class that keeps track of the plugin's actions as they are added to a StreamDeck profile. It exposes methods that are called to set the state, image, or display text in response to websocket messages.
* `src/trackAudioManager.ts` is a singleton class that manages the websocket connection with TrackAudio. It listens to various messages from TrackAudio then fires its own events that are handled by the plugin to update the buttons. The connection to TrackAudio is only opened if the profile has at least one button from this plugin in it, and it disconnects from TrackAudio if all plugin buttons are removed.
* `src/plugin.ts` has all the event handlers for events fired by the `TrackAudioManager`. It processes those events and then calls the appropriate methods on the `ActionManager` to update the buttons.
* `eslint` is used with strict TypeScript rules to validate the code
* `markdownlint` is used to validate the markdown files
* Automated CI/CD builds are handled with GitHub workflows in the `.github/workflows` folder. This includes automatically setting the plugin version to the GitHub release version and attaching the built plugin package to the pull request and release page.
* F5 debugging in Visual Studio Code using `.vscode/launch.json` and `.vscode/tasks.json` configuration files.
* Suggested Visual Studio Code extensions using a workspace file.
