# Community Widgets

Community-contributed widget presets and configurations for popular self-hosted applications. These are ready-to-use configurations for the [Generic Widget](/widgets/generic/).

!!!
**Want to add your own?** See [Contributing to Docs](/community/contributing/) — submit a PR adding your widget preset to this page!
!!!

---

## Media Management

### Sonarr — Queue Monitor

Track your Sonarr download queue.

```json
{
  "type": "generic",
  "title": "Sonarr Queue",
  "options": {
    "preset": "sonarr-queue",
    "url": "https://sonarr.example.com",
    "apiKey": "your-sonarr-api-key"
  }
}
```

| Field | Value |
|---|---|
| Endpoint | `/api/v3/queue` |
| Display | Queue count |

---

### Radarr — Queue Monitor

Track your Radarr movie download queue.

```json
{
  "type": "generic",
  "title": "Radarr Queue",
  "options": {
    "preset": "radarr-queue",
    "url": "https://radarr.example.com",
    "apiKey": "your-radarr-api-key"
  }
}
```

---

### Tautulli — Plex Activity

Monitor active Plex streams and bandwidth.

```json
{
  "type": "generic",
  "title": "Plex Activity",
  "options": {
    "preset": "tautulli-activity",
    "url": "https://tautulli.example.com",
    "apiKey": "your-tautulli-api-key"
  }
}
```

| Field | Value |
|---|---|
| Displays | Stream count, total bandwidth, WAN/LAN bandwidth |

---

## Network & DNS

### Pi-hole — DNS Summary

View your Pi-hole ad blocking statistics.

```json
{
  "type": "generic",
  "title": "Pi-hole",
  "options": {
    "preset": "pihole-summary",
    "url": "https://pihole.example.com"
  }
}
```

| Field | Value |
|---|---|
| Displays | Blocked today, block %, total queries, active clients, domains blocked |

---

### AdGuard Home — Stats

!!!info Coming Soon
This is a community-requested preset. [Submit a PR](/community/contributing/) to add the AdGuard Home widget configuration!
!!!

---

## System Monitoring

### Glances — CPU Usage

Monitor CPU utilization from a Glances instance.

```json
{
  "type": "generic",
  "title": "CPU Usage",
  "options": {
    "preset": "glances-cpu",
    "url": "https://glances.example.com"
  }
}
```

| Field | Value |
|---|---|
| Displays | Total CPU %, user %, system % |

---

### Glances — Memory Usage

Monitor memory utilization from a Glances instance.

```json
{
  "type": "generic",
  "title": "Memory",
  "options": {
    "preset": "glances-mem",
    "url": "https://glances.example.com"
  }
}
```

| Field | Value |
|---|---|
| Displays | Memory used %, free, total |

---

## Container Management

### Portainer — Stack Count

View the number of Docker Compose stacks managed by Portainer.

```json
{
  "type": "generic",
  "title": "Portainer Stacks",
  "options": {
    "preset": "portainer-stacks",
    "url": "https://portainer.example.com",
    "apiKey": "your-portainer-api-key"
  }
}
```

---

## Submitting a Widget Preset

Want to share a widget configuration for an app not listed here? We'd love to include it!

### What to Include

Your submission should contain:

1. **App name** and brief description
2. **JSON configuration** — a working widget config
3. **API endpoint** used and what fields are displayed
4. **Authentication notes** — does the API need a key? How to generate one?
5. **Category** — Media, Network, Monitoring, Containers, etc.

### How to Submit

1. Fork the [atom-homepage](https://github.com/stackryze/atom-homepage) repository
2. Edit `docs/community/widgets.md` — add your preset following the format above
3. Open a Pull Request targeting the `docs` branch
4. Add the label `community-widget` to your PR

See the full [Contributing Guide](/community/contributing/) for details.

---

## Request a Widget

Don't see an app you use? [Open an issue](https://github.com/stackryze/atom-homepage/issues/new?labels=widget-request&title=Widget+Request:+) with the label `widget-request` and the community can help build it!
