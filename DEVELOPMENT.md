# Developing with this repo

## Building

1. Run `npm install`
2. Run `npm run build`

The first time you do this on any machine you also need to do `npm run link` otherwise the compiled plugin won't be available to the Stream Deck.

For active development use `npm run watch` instead of `npm run build`, this will auto-refresh the plugin when files change.

## Packaging

Run `npm run package`. Make sure `npm run build` was done first.

## Debugging

A launch profile for VSCode is included. Simply press `F5` to start debugging. Sometimes the debug connection drops, I've never figured out why. If that happens just go to the debug tab in VSCode and press the `Run` button. It will reconnect to the plugin and start debugging again.

## About the code

This code my first attempt at writing a StreamDeck plugin using the (as of this writing) [beta node.js SDK](https://github.com/elgatosf/streamdeck)
in conjunction with websockets to read and display data from another app.

Here is how the code is structured:

- `com.neil-enns.trackaudio.sdPlugin`: These are the support files used to build the final plugin. The `manifest.json`, all property inspector pages (in the `pi` folder), and all image assets live here.

- `com.neil-enns.trackaudio.sdPlugin/pi`: The property inspectors for the actions. They are written using [sdpi-components](https://sdpi-components.dev/docs/components), which automatically handles sending the property values to the plugin.

- `src/actions`: These are all the StreamDeck SingletonAction classes. They do very little except responding to StreamDeck events then firing off their own events that get handled in `src/plugin.ts`.

- `src/controllers`: These classes manage individual instances of an action on a profile. They track the action object provided by StreamDeck as well as the settings and other associated properties. The `BaseController` class provides common methods for setting action titles and images.

- `src/eventHandlers`: These functions manage all the events fired by the controllers or managers.

- `src/helpers`: Random bits of code that are used across all the other files.

- `src/interfaces`: Types and interfaces used across all the other files.

- `src/managers`: Singleton classes that manage global state. `ActionManager` keeps track of every action added to a profile. `TrackAudioManager` handles all the websocket communication with TrackAudio.

Here are some bits and pieces that might be interesting:

- `src/managers/action.ts` is a singleton class that keeps track of the plugin's actions as they are added to a StreamDeck profile. It exposes methods that are called to set the state, image, or display text in response to websocket messages.

- `src/managers/trackAudio.ts` is a singleton class that manages the websocket connection with TrackAudio. It listens to various messages from TrackAudio then fires its own events that are handled by the plugin to update the buttons. The connection to TrackAudio is only opened if the profile has at least one button from this plugin in it, and it disconnects from TrackAudio if all plugin buttons are removed.

- `src/managers/svg.ts` is a singleton class that manages SVGs that use [Handlebars templates](https://handlebarsjs.com/). It caches compiled versions of the SVGs and handles rendering the SVGs with variable values.

- `src/managers/vatsim.ts` is a singleton class that manages data retrieval from VATSIM. At the moment this is only used to retrieve the ATIS letters.

- `src/plugin.ts` does nothing more than register the actions with StreamDeck and a bunch of event handlers.

- `eslint` is used with strict TypeScript rules to validate the code.

- `markdownlint` is used to validate the markdown files.

- Automated CI/CD builds are handled with GitHub workflows in the `.github/workflows` folder. This includes automatically setting the plugin version to the GitHub release version using a custom GitHub action and attaching the built plugin package to the pull request and release page.

- F5 debugging in Visual Studio Code using `.vscode/launch.json` and `.vscode/tasks.json` configuration files.

- Suggested Visual Studio Code extensions using a workspace file.
