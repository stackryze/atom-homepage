---
label: Clock
icon: clock
order: 95
---

# Clock Widget

A digital clock display with optional weather overlay, quick actions, and notification center access.

---

## Features

- Real-time digital clock (updates every second)
- Weather temperature and conditions (when location is configured)
- Quick action buttons:
  - :icon-gear: Settings
  - :icon-keyboard: Keyboard shortcuts
  - :icon-sync: Refresh dashboard
  - :icon-sign-out: Logout
- :icon-bell: Notification center access

---

## Configuration

| Option | Type | Description |
|---|---|---|
| Weather Location | string | Set in **Settings** → **General** → **Weather Location** |

The clock widget automatically uses the weather location from your dashboard settings. No per-widget configuration needed.

---

## Weather Data

Weather data is fetched from the [Open-Meteo API](https://open-meteo.com/) (free, no API key required):

1. Location name is geocoded to coordinates
2. Current temperature and day/night status is displayed
3. Shows sun :icon-sun: or moon :icon-moon: icon based on time of day
