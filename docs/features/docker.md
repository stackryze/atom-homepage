---
label: Docker Integration
icon: container
order: 90
---

# Docker Integration

Atom provides a full Docker management interface with real-time container stats.

---

## Setup

Mount the Docker socket to enable container management:

```yaml docker-compose.yml
services:
  atom:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

| Platform | Socket Path |
|---|---|
| Linux / macOS | `/var/run/docker.sock` |
| Windows | `//./pipe/docker_engine` |

!!!warning Security Note
Mounting the Docker socket gives Atom full control over your Docker daemon. Use `:ro` (read-only) if you only need monitoring without start/stop/exec capabilities.
!!!

---

## Container Dashboard

Navigate to the Docker page via the sidebar or Command Palette. The dashboard shows:

| Column | Description |
|---|---|
| Name | Container name |
| Image | Docker image |
| State | Running, exited, paused, etc. |
| CPU % | Real-time CPU usage |
| Memory | Used / Total (e.g., "128 MB / 512 MB") |
| Ports | Port mappings (host:container) |
| IP | Container private IP |

---

## Container Actions

| Action | Description |
|---|---|
| :icon-play: **Start** | Start a stopped container |
| :icon-square: **Stop** | Stop a running container |
| :icon-sync: **Restart** | Restart a container |
| :icon-terminal: **Terminal** | Open an interactive shell (exec) |
| :icon-code: **Logs** | View container logs in real-time |

---

## Terminal (Exec)

The built-in terminal uses [xterm.js](https://xtermjs.org/) to provide a fully interactive shell inside any running container:

- Full terminal emulation with color support
- Resizable terminal window
- Copy/paste support
- Auto-fit to window size

---

## Docker Widget

Add a Docker summary widget to your dashboard:

1. Go to **Settings** → **Widgets**
2. Add a widget with type **Docker**
3. The widget shows total container count and running/stopped status

---

## Performance

- Container stats are fetched with a **2-second timeout** per container
- Overall list fetch has a **5-second timeout**
- Stats that fail to load gracefully fall back without breaking the UI
- Smart merge prevents UI flickering when stats temporarily fail

---

## Troubleshooting

| Issue | Solution |
|---|---|
| "Docker not available" | Ensure the Docker socket is mounted in your container |
| No stats showing | Container may be paused or the stats endpoint timed out |
| Permission denied | Check Docker socket permissions (`chmod 666 /var/run/docker.sock` or add user to `docker` group) |
| Windows: socket not found | Use `//./pipe/docker_engine` as the volume mount |
