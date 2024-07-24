# TrackAudio buttons for StreamDeck <!-- omit from toc -->

> [!IMPORTANT]
> This plugin requires [TrackAudio beta 1.3.0-beta.1](https://github.com/pierr3/TrackAudio/releases/tag/1.3.0-beta.1) or later. It will not work with earlier versions of TrackAudio.

This StreamDeck plugin provides actions to interact with TrackAudio. [Download the plugin](https://github.com/neilenns/streamdeck-trackaudio/releases/latest) from the releases page. Need inspiration for how to use these actions? Check out the [examples](#examples) section.

![Screenshot a StreamDeck profile with buttons for stations, current AITS letter, a hotline, and a push-to-talk button](docs/images/button-example.png)

- [Action descriptions](#action-descriptions)
- [Configuring a station status action](#configuring-a-station-status-action)
- [Configuring a hotline action](#configuring-a-hotline-action)
- [Configuring a TrackAudio status action](#configuring-a-trackaudio-status-action)
- [Configuring an ATIS letter action](#configuring-an-atis-letter-action)
- [Configuring a push to talk action](#configuring-a-push-to-talk-action)
- [Examples](#examples)
	- [Seattle tower](#seattle-tower)
	- [Seattle final approach - ATIS letters](#seattle-final-approach---atis-letters)

## Action descriptions

| Action            | Description                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ATIS letter       | Shows the current ATIS letter for a specific station.                                                                                                                        |
| Hotline           | Switches active TX between two stations, typically a primary controlling position and a secondary hotline position.                                                          |
| Push to talk      | Triggers TX on all TX frequencies, as if pressing the push to talk key configured in TrackAudio.                                                                             |
| Station status    | Shows the current RX, TX, or XCA for a specific station. Pressing the action toggles specified state for that station. Also shows the last received callsign by the station. |
| TrackAudio status | Shows the current state of the connection to TrackAudio from StreamDeck and whether TrackAudio is voice connected to VATSIM.                                                 |

After installation the plugin actions are available under the TrackAudio category:

![Screenshot of the StreamDeck profile UI with the categories filtered to "track"](docs/images/streamdeck-category.png)

## Configuring a station status action

The station status action displays the current status of a single station's button in TrackAudio, including
whether communication is currently active. Pressing the action will toggle the equivalent button in TrackAudio,
convenient for listening to other frequencies while controlling with the ability to quickly turn off listening
to those frequencies when things get busy.

For example, if you are controlling `LMT_TWR` and have TrackAudio set up like this:

![Screenshot of the LMT_TWR station position configured in TrackAudio for receive (RX), transmit (TX), and cross-couple across (XCA)](docs/images/trackAudio.png)

configure the station status action like this to show that RX is enabled and the last received callsign:

![Screenshot of a station status button configuration, with callsign set to LMT_TWR, RX selected, and show last receive callsign enabled](docs/images/station-status.png)

> [!IMPORTANT]
> The action lights up when transmissions occur on the *frequency* of the callsign. This means if two stations share the same frequency (e.g. `PDX_GND` and `GEG_GND`) the action will light up when transmissions happen on either of those stations.

### Station status settings <!-- omit from toc -->

| Setting                     | Description                                                                                                                           | Default                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Title                       | The title to show on the action. Optional.                                                                                            | Station callsign and listen to value                            |
| Callsign                    | The callsign for the station you want to display status for. Required.                                                                |                                                                 |
| Listen to                   | What status to display on the button, either RX, TX, or XCA. Required.                                                                | RX                                                              |
| Show last received callsign | When checked, the last received callsign will be appended to the action title. Only supported when listen to is set to `RX` or `XCA`. | Disabled                                                        |
| Not listening               | The image to display when the station is not currently active. Optional.                                                              | ![Black background](docs/images/stationstatus-notlistening.png) |
| Listening                   | The image to display when the station is active. Optional.                                                                            | ![Green background](docs/images/stationstatus-listening.png)    |
| Active comms                | The image to display when a transmission is actively taking place. Optional.                                                          | ![Orange background](docs/images/stationstatus-receiving.png)   |
| Unavailable                 | The image to display when the station is not added in TrackAudio. Optional, defaults to a warning icon.                               | ![Warning icon](docs/images/stationstatus-unavailable.png)      |

## Configuring a hotline action

The hotline action provides a quick way to toggle between two stations for voice transmissions. This is typically
used by center controllers who have a hotline frequency established with neighbouring sectors.

To use the hotline action start by adding the appropriate stations to TrackAudio. Your primary station should
be added with `XCA` enabled and the hotline station should be added with `RX` enabled. Then configure the
hotline action with the primary and hotline station callsigns.

Once configured, pressing the action will toggle `TX` active between your primary and hotline frequencies.

### Hotline action settings <!-- omit from toc -->

| Setting          | Description                                                                                                                                                                                                  | Default                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Primary callsign | The callsign you are actively controlling, for example `SEA_CTR`. Required.                                                                                                                                  |                                                                     |
| Hotline callsign | The callsign for the hotline, for example `ZOA-ZSE`. Required.                                                                                                                                               |                                                                     |
| Listening        | The image to display when listening to the hotline frequency. Optional.                                                                                                                                      | ![Handset with blue background](docs/images/hotline-listening.png)  |
| Receiving        | The image to display when receiving a transmission on the hotline frequency. Optional.                                                                                                                       | ![Handset with green background](docs/images/hotline-receiving.png) |
| Hotline active   | The image to display when transmitting on the hotline frequency. Optional.                                                                                                                                   | ![Handset with orange background](docs/images/hotline-active.png)   |
| Both active      | The image to display when both the primary and hotline and frequencies are the active frequency. This should never happen, as it means your voice transmissions will get sent to both frequencies. Optional. | ![Handset with red background](docs/images/hotline-both.png)        |
| Neither active   | The iamge to display when neither the primary nor the hotline frequencies have TX enabled. Optional.                                                                                                         | ![Handset with black background](docs/images/hotline-neither.png)   |
| Unavailable      | The image to display when the primary and hotline stations are not added in TrackAudio. Optional.                                                                                                            | ![Warning icon](docs/images/hotline-unavailable.png)                |

## Configuring a TrackAudio status action

The TrackAudio status action shows the status of the connection between StreamDeck and TrackAudio, and whether
the voice connection in TrackAudio is up. Pressing the action will force a state refresh.

### TrackAudio status action settings <!-- omit from toc -->

| Setting         | Description                                                                    | Default                                                                           |
| --------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Not connected   | The image to display when not connected to TrackAudio. Optional.               | ![White headset with microphone](docs/images/trackaudiostatus-notconnected.png)   |
| Connected       | The image to display when connected to TrackAudio. Optional.                   | ![Blue headset with microphone](docs/images/trackaudiostatus-connected.png)       |
| Voice connected | The image to display when the TrackAudio voice connection is active. Optional. | ![Green headset with microphone](docs/images/trackaudiostatus-voiceconnected.png) |

## Configuring an ATIS letter action

> [!IMPORTANT]
> TrackAudio must be running and you must be connected for teh ATIS letter to update. It can take five minutes or
> longer for the VATSIM data source to refresh and reflect the latest ATIS letter.

The ATIS letter action shows the current AITS letter for a station, refreshed automatically every minute.
When the ATIS letter updates the action will show an orange background until the action is pressed to reset the
state. Pressing the action when it is not in the updated state will force a refresh of the ATIS information.

### ATIS letter action settings <!-- omit from toc -->

| Setting     | Description                                                                                                               | Default                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Title       | The title to show on the action. The current ATIS letter will be appended to this title separated by a newline. Optional. | Blank                                              |
| Callsign    | The callsign to get the current AITS letter for, for example `KSEA_ATIS`. Required.                                       |                                                    |
| Current     | The image to display when the ATIS letter shown is current. Optional.                                                     | ![Black background](docs/images/atis-current.png)  |
| Updated     | The image to display when the ATIS letter updated to a new one. Optional.                                                 | ![Orange background](docs/images/atis-updated.png) |
| Unavailable | The image to display when no ATIS letter is available. Optional.                                                          | ![Warning icon](docs/images/atis-unavailable.png)  |

## Configuring a push to talk action

The push to talk action does not require configuration for use. Simply add it to your profile, then press the action to start transmitting.

| Setting         | Description                                 | Default                                                                |
| --------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| Initial state   | Shown when idle. Optional.                  | ![Microphone with black background](docs/images/ptt-idle.png)          |
| Secondary state | Shown when actively transmitting. Optional. | ![Microphone with orange background](docs/images/ptt-transmitting.png) |

## Examples

Here are some examples of different profiles people have created using these actions. Have an example you'd like to
share? [Open a new issue](https://github.com/neilenns/streamdeck-trackaudio/issues/new/choose) with a screenshot and
details of how you have the actions configured.

### Seattle tower

Used by a Seattle Tower controller to listen to the controllers working above and below, and to quickly
turn those stations off when it gets busy.

### Seattle final approach - ATIS letters

Used by a final approach controller to keep an eye on the current ATIS letter for all the satellite fields around KSEA.

![Two rows of four actions. The top row shows GND and AAL809, E TWR and ASA324, S46 and SEA_W_APP, and S16. The bottom row shows Final SEA_F_APP, I for the current ATIS, a blank space, and SEA indicating what airport the buttons are for.](docs/images/examples/sea-twr.png)

The actions are configured as follows, from left to right, top to bottom.

| Action         | Settings                                                      |
| -------------- | ------------------------------------------------------------- |
| Station status | **Title**: GND, **Callsign**: SEA_GND, **Listen to**: RX      |
| Station status | **Title**: E TWR, **Callsign**: SEA_E_TWR, **Listen to**: XCA |
| Station status | **Title**: S46, **Callsign**: SEA_W_APP, **Listen to**: RX    |
| Station status | **Title**: S16, **Callsign**: SEA_CTR, **Listen to**: RX      |
| Station status | **Title**: Final, **Callsign**: SEA_F_APP, **Listen to**: RX  |
| ATIS letter    | **Title**: _blank_, **Callsign**: KSEA_ATIS                   |
| Switch profile | **Title**: SEA                                                |

![Two columns of four actions showing the airport and current ATIS letter for SEA, BFI, PAE, RNT, TIW, OLM, TCM, and GRF. Four of the buttons show an orange background indicating an updated ATIS letter](docs/images/examples/sea-app-atis.png)

The actions are configured as follows, from left to right, top to bottom.

| Action      | Settings                                |
| ----------- | --------------------------------------- |
| ATIS letter | **Title**: SEA, **Callsign**: KSEA_ATIS |
| ATIS letter | **Title**: BFI, **Callsign**: KBFI_ATIS |
| ATIS letter | **Title**: PAE, **Callsign**: KPAE_ATIS |
| ATIS letter | **Title**: RNT, **Callsign**: KRNT_ATIS |
| ATIS letter | **Title**: TIW, **Callsign**: KTIW_ATIS |
| ATIS letter | **Title**: OLM, **Callsign**: KOLM_ATIS |
| ATIS letter | **Title**: TCM, **Callsign**: KTCM_ATIS |
| ATIS letter | **Title**: GRF, **Callsign**: KGRF_ATIS |
