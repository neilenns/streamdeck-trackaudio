# SVG templates <!-- omit from toc -->

- [Introduction](#introduction)
- [ATIS letter variables](#atis-letter-variables)
- [Hotline variables](#hotline-variables)
- [Main volume variables](#main-volume-variables)
- [Push to talk variables](#push-to-talk-variables)
- [Station status variables](#station-status-variables)
- [Station volume variables](#station-volume-variables)
- [TrackAudio status variables](#trackaudio-status-variables)
- [Additional Handlebars helpers](#additional-handlebars-helpers)

## Introduction

All image properties on all actions support using SVG templates instead of a standard SVG image. The templates use [Handlebars](https://handlebarsjs.com/) for placeholders and enables using the same SVG image across multiple action.

For example, the following SVG template renders an ATIS letter large with the action's title centered small across the top of the button:

```xml
<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="144" height="144">
  <style>
    .background {
      {{#if (eq state "updated")}}
        fill: #f60;
      {{else if (eq state "current")}}
        fill: black;
      {{else if (eq state "unavailable")}}
        fill: black;
      {{else}}
        fill: black;
      {{/if}}
    }
  </style>
  <rect class="background" width="144" height="144" />
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

| Variable | Description                                                     |
| -------- | --------------------------------------------------------------- |
| callsign | The callsign for the ATIS station                               |
| letter   | The current ATIS letter, or undefined if no letter is available |
| state    | The action's current state                                      |
| title    | The title specified by the user                                 |

The states are:

- current
- updated

## Hotline variables

The following variables are supported with the hotline action:

| Variable         | Description                            |
| ---------------- | -------------------------------------- |
| hotlineCallsign  | The hotline callsign                   |
| hotlineFrequency | The frequency for the hotline callsign |
| primaryCallsign  | The primary callsign                   |
| primaryFrequency | The frequency for the primary callsign |
| state            | The action's current state             |
| title            | The title specified by the user        |

The states are:

- bothActive
- hotlineActive
- listening
- neitherActive
- receiving
- unavailable

## Main volume variables

The following variables are supported with the main volume action:

| Variable | Description                                         |
| -------- | --------------------------------------------------- |
| state    | The action's current state                          |
| volume   | The volume level for the station, between 0 and 100 |

The states are:

- connected
- notConnected

## Push to talk variables

The following variables are supported with the push to talk action:

| Variable | Description                     |
| -------- | ------------------------------- |
| state    | The action's current state      |
| title    | The title specified by the user |

The states are:

- notTransmitting
- transmitting

## Station status variables

The following variables are supported with the station status action:

| Variable             | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| callsign             | The callsign for the station                                      |
| frequency            | The frequency for the station, e.g. 121900000                     |
| formattedFrequency   | The frequency for the station formatted for display, e.g. 121.900 |
| lastReceivedCallsign | The last received callsign                                        |
| listenTo             | The value of the listen to setting                                |
| state                | The action's current state                                        |
| title                | The title specified by the user                                   |

The states are:

- activeComs
- listening
- notListening
- unavailable

## Station volume variables

The following variables are supported with the station volume action:

| Variable | Description                                         |
| -------- | --------------------------------------------------- |
| state    | The action's current state                          |
| volume   | The volume level for the station, between 0 and 100 |

The states are:

- muted
- notMuted
- unavailable

## TrackAudio status variables

The following variables are supported with the TrackAudio status action:

| Variable | Description                             |
| -------- | --------------------------------------- |
| state    | The name for the action's current state |
| title    | The title specified by the user         |

The states are:

- connected
- notConnected
- voiceConnected

## Additional Handlebars helpers

Logical comparison operators are available in addition to the standard helpers. The
following operators are supported:

| Operator | Description           |
| -------- | --------------------- |
| eq       | Equals                |
| ne       | Not equals            |
| gt       | Greater than          |
| gte      | Greater than or equal |
| lt       | Less than             |
| lte      | Less than or equal    |

Example:

```xml
{{#if (eq state "unavailable")}} {{else}} {{/if}}
```

A complete example is available in the [default station state template](https://github.com/neilenns/streamdeck-trackaudio/blob/main/com.neil-enns.trackaudio.sdPlugin/images/actions/stationStatus/template.svg?short_path=ca0646b).
