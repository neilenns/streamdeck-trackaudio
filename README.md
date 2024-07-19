# TrackAudio buttons for StreamDeck

This StreamDeck plugin provides actions to interact with [TrackAudio](https://github.com/pierr3/TrackAudio).

| Action            | Description                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Station status    | Shows the current RX, TX, XC, or XCA for a specific station. Pressing the action toggles specified state for that station. |
| TrackAudio status | Shows the current state of the connection to TrackAudio from StreamDeck.                                                   |
| Hotline           | Switches active TX between two stations, typically a primary controlling position and a secondary hotline position.        |
| Push to talk      | Triggers TX on all TX frequencies, as if pressing the push to talk key configured in TrackAudio.                           |

After installation the plugin actions are available under the TrackAudio category:

![Screenshot of the StreamDeck profile UI with the categories filtered to "track"](docs/images/streamdeck-category.png)

## Configuring a station status action

The station status action displays the current status of a single station's button in TrackAudio, including
whether communication is currently active.

![Screenshot of the LMT_GND station position configured in TrackAudio for receive (Rx)](docs/images/trackAudio.png)

For example, to display status of the Rx button for `LMT_GND`, as shown in the image above, configure the
station status action like this:

![Screenshot of a station status button configuration, with callsign set to LMT_GND, RX selected, and three custom images specified for the three states](docs/images/station-status.png)

### Station status settings

| Setting                     | Description                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Title                       | The title to show on the action. If omitted the station callsign and listen to value will be shown.                     |
| Callsign                    | The callsign for the station you want to display status for. Required.                                                  |
| Listen to                   | What status to display on the button, either RX, TX, XC, or XCA. Required.                                              |
| Show last received callsign | When checked, the last received callsign will be appended to the action title. Only applies to actions listening to RX. |
| Not listening               | The image to display when the station is not currently active. Optional, defaults to black.                             |
| Listening                   | The image to display when the station is active. Optional, defaults to green.                                           |
| Active comms                | The image to display when a transmission is actively taking place. Optional, defaults to orange.                        |

## Configuring a hotline action

The hotline action provides a quick way to toggle between two stations for voice transmissions. Start by adding
your primary station in TrackAudio with XCA enabled and the hotline station in TrackAudio with RX enabled.

## Hotline action settings

| Setting          | Description                                                                                                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary callsign | The callsign you are actively controlling, for example `SEA_CTR`. Required.                                                                                                                                                   |
| Hotline callsign | The callsign for the hotline, for example `ZOA-ZSE`. Required.                                                                                                                                                                |
| Listening        | The image to display when listening to the hotline frequency. Optional, defaults to blue.                                                                                                                                     |
| Receiving        | The image to display when receiving a transmission on the hotline frequency. Optional, defaults to green.                                                                                                                     |
| Hotline active   | The image to display when transmitting on the hotline frequency. Optional, defaults to orange.                                                                                                                                |
| Both active      | The image to display when both the primary and hotline and frequencies are the active frequency. This should never happen, as it means your voice transmissions will get sent to both frequencies. Optional, defaults to red. |
| Neither active   | The iamge to display when neither the primary nor the hotline frequencies have TX enabled. Optional, defaults to black.                                                                                                       |

## Configuring a TrackAudio status action

The TrackAudio status action shows the status of the connection between StreamDeck and TrackAudio, and whether
the voice connection in TrackAudio is up.

### TrackAudio status action settings

| Setting         | Description                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Not connected   | The image to display when not connected to TrackAudio. Optional, defaults to white.               |
| Connected       | The image to display when connected to TrackAudio. Optional, defaults to blue.                    |
| Voice connected | The image to display when the TrackAudio voice connection is active. Optional, defaults to green. |
