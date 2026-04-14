---
label: Weather
icon: cloud
order: 90
---

# Weather Widget

Displays current weather conditions for a configured location.

---

## Configuration

Set the weather location in **Settings** → **General** → **Weather Location**.

| Option | Type | Description |
|---|---|---|
| Location | string | City name (e.g., "London", "New York") |

---

## Data Source

Uses the [Open-Meteo API](https://open-meteo.com/):

- **Free** — no API key required
- **Geocoding** — city names are automatically converted to coordinates
- **Data**: Temperature, day/night status

---

## Notes

- Weather data is shared between the Clock and Weather widgets
- Updates on each dashboard load
- No rate limiting concerns with Open-Meteo's free tier
