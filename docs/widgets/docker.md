---
label: Docker
icon: container
order: 85
---

# Docker Widget

A compact summary widget showing Docker container counts and status.

---

## Configuration

| Option | Type | Default | Description |
|---|---|---|---|
| — | — | — | No additional options required |

Requires the Docker socket to be mounted. See [Docker Integration](/features/docker/).

---

## Data Displayed

- Total container count
- Running containers
- Stopped containers

---

## Notes

- This is a **summary widget** — for full container management, use the Docker page (`/docker`)
- Updates on each dashboard refresh
