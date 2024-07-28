All image properties on all actions support using SVG templates instead of a standard SVG image. The templates use [Handlebars](https://handlebarsjs.com/) for placeholders and enables using the same SVG image across multiple action.

For example, the following SVG template renders an ATIS letter large with the action's title centered small across the top of the button:

```xml
<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="144" height="144">
	<rect width="144" height="144" fill="{{stateColor}}" />
	<text x="72" y="36" font-family="Arial" font-weight="bold" font-size="22" text-anchor="middle"
		fill="white">{{title}}</text>
	<text x="72" y="92" fill="white" font-family="Arial" font-weight="bold" font-size="60" text-anchor="middle">{{#if
		letter}}{{letter}}{{else}}ATIS{{/if}}</text>
</svg>
```

Using the above template with the following action configuration:

![image](https://github.com/user-attachments/assets/68e381fd-a292-41a7-b2a6-0eca67c5317e)

Results in an action displayed like this:

![atis-letter-example](https://github.com/user-attachments/assets/d984edd4-0059-4857-8182-22e13b49ae2d)

## ATIS letter variables

The following variables are supported with the ATIS letter action:

| Variable   | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| callsign   | The callsign for the ATIS station                               |
| letter     | The current ATIS letter, or undefined if no letter is available |
| state      | The name for the action's current state                         |
| stateColor | The default color for the action's current state                |
| title      | The title specified by the user                                 |

The state names and colors are:

| stateName | stateColor |
| --------- | ---------- |
| current   | black      |
| updated   | #f60       |

## Hotline variables

The following variables are supported with the hotline action:

| Variable         | Description                                      |
| ---------------- | ------------------------------------------------ |
| hotlineCallsign  | The hotline callsign                             |
| hotlineFrequency | The frequency for the hotline callsign           |
| primaryCallsign  | The primary callsign                             |
| primaryFrequency | The frequency for the primary callsign           |
| state            | The name for the action's current state          |
| stateColor       | The default color for the action's current state |
| title            | The title specified by the user                  |

The state names and colors are:

| stateName     | stateColor |
| ------------- | ---------- |
| bothActive    | #900       |
| hotlineActive | #c60       |
| listening     | #009       |
| neitherActive | black      |
| receiving     | #060       |
| unavailable   | black      |

## Push to talk variables

The following variables are supported with the push to talk action:

| Variable   | Description                                      |
| ---------- | ------------------------------------------------ |
| state      | The name for the action's current state          |
| stateColor | The default color for the action's current state |
| title      | The title specified by the user                  |

The state names and colors are:

| stateName       | stateColor |
| --------------- | ---------- |
| notTransmitting | black      |
| transmitting    | #f60       |

## Station status variables

The following variables are supported with the station status action:

| Variable             | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| callsign             | The callsign for the station                                      |
| frequency            | The frequency for the station, e.g. 121900000                     |
| formattedFrequency   | The frequency for the station formatted for display, e.g. 121.900 |
| lastReceivedCallsign | The last received callsign                                        |
| listenTo             | The value of the listen to setting                                |
| state                | The name for the action's current state                           |
| stateColor           | The default color for the action's current state                  |
| title                | The title specified by the user                                   |

The state names and colors are:

| stateName    | stateColor |
| ------------ | ---------- |
| activeComms  | #f60       |
| listening    | #060       |
| notListening | black      |
| unavailable  | black      |

## TrackAudio status variables

The following variables are supported with the TrackAudio status action:

| Variable   | Description                                      |
| ---------- | ------------------------------------------------ |
| state      | The name for the action's current state          |
| stateColor | The default color for the action's current state |
| title      | The title specified by the user                  |

The state names and colors are:

| stateName      | stateColor |
| -------------- | ---------- |
| connected      | #5fcdfa    |
| notConnected   | white      |
| voiceConnected | #060       |
