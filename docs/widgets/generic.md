---
label: Generic
icon: code-square
order: 45
---

# Generic Widget

A flexible widget that consumes any JSON API and displays mapped fields.

---

## Configuration

| Option | Type | Description |
|---|---|---|
| `url` | string | API endpoint URL |
| `fields` | array | Field mappings (label → JSON path) |
| `method` | string | HTTP method (default: GET) |

---

## Widget Presets

Atom includes pre-configured presets for popular self-hosted applications:

### Sonarr Queue
- **Type**: `sonarr-queue`
- **Displays**: Queue count
- **API**: `/api/v3/queue`

### Radarr Queue
- **Type**: `radarr-queue`
- **Displays**: Queue count
- **API**: `/api/v3/queue`

### Pi-hole Summary
- **Type**: `pihole-summary`
- **Displays**: Blocked today, block percentage, total queries, active clients, domains blocked
- **API**: `/admin/api.php?summary`

### Glances CPU
- **Type**: `glances-cpu`
- **Displays**: Total CPU %, user %, system %
- **API**: `/api/3/cpu`

### Glances Memory
- **Type**: `glances-mem`
- **Displays**: Memory used %, free, total
- **API**: `/api/3/mem`

### Tautulli Activity
- **Type**: `tautulli-activity`
- **Displays**: Stream count, total bandwidth, WAN/LAN bandwidth
- **API**: `/api/v2?cmd=get_activity`

### Portainer Stacks
- **Type**: `portainer-stacks`
- **Displays**: Stack count
- **API**: `/api/stacks`

---

## Custom API Widget

To connect to any JSON API:

1. Add a **Generic** widget
2. Set the API **URL**
3. Define **fields** mapping — each field maps a display label to a JSON path

Example for a custom API returning `{ "data": { "users": 42, "active": 38 } }`:

```json
{
  "url": "https://api.example.com/stats",
  "fields": [
    { "label": "Total Users", "path": "data.users" },
    { "label": "Active", "path": "data.active" }
  ]
}
```

---

## Authentication

If your API requires authentication, the Generic widget uses Atom's built-in CORS proxy (`/api/proxy`) which forwards requests with appropriate headers.

!!!
Want to share a preset for your favorite app? See [Community Widgets](/community/widgets/) for how to contribute!
!!!
