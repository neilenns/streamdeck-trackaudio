# TrackAudio buttons for StreamDeck

This StreamDeck plugin provides buttons to display the current status of Tx, Rx, and Xc buttons in
[TrackAudio](https://github.com/pierr3/TrackAudio).

After installation the plugin actions are available under the TrackAudio category:

![Screenshot of the StreamDeck profile UI with the categories filtered to "track"](docs/images/streamdeck-category.png)

## Configuring a station status button

The station status button displays the current status of a single station's button in TrackAudio, including
whether communication is currently active.

![Screenshot of the LMT_GND station position configured in TrackAudio for receive (Rx)](docs/images/trackAudio.png)

For example, to display status of the Rx button for LMT_GND, as shown in the image above, configure the
station status button like this:

![Screenshot of a station status button configuration, with callsign set to LMT_GND, RX selected, and three custom images specified for the three states](docs/images/stationStatus.png)

| Setting       | Description                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Callsign      | The callsign for the station you want to display status for. Required.                           |
| Listen to     | What status to display on the button, either Rx, Tx, or XC. Required.                            |
| Not listening | The image to display when the station is not currently active. Optional, defaults to black.      |
| Listening     | The image to display when the station is active. Optional, defaults to green.                    |
| Active comms  | The image to display when a transmission is actively taking place. Optional, defaults to orange. |

## Configuring a TrackAudio status button

The TrackAudio status button shows the status of the connection between StreamDeck and TrackAudio. Simply
add the button to your profile and, optionally, configure an image for the disconnected and connected states.
