# System Monitor Widget

Displays real-time system statistics including CPU usage, memory consumption, and storage information.

---

## Configuration

| Option | Type | Default | Description |
|---|---|---|---|
| — | — | — | No additional options required |

---

## Data Displayed

| Metric | Description |
|---|---|
| CPU Load | Current CPU usage percentage |
| Memory Used | Used / Total RAM |
| Storage | Per-disk usage percentage |
| Uptime | System uptime |
| Platform | Operating system name |

---

## API Source

Data is fetched from the `/api/stats` endpoint which uses the `systeminformation` package:

```json
{
  "cpuLoad": 23.5,
  "memTotal": 16384,
  "memUsed": 8192,
  "uptime": 86400,
  "platform": "linux",
  "storage": [
    { "fs": "/dev/sda1", "size": 500000, "used": 250000, "mount": "/" }
  ]
}
```

---

## Notes

- Updates automatically on each dashboard refresh
- Storage shows all mounted filesystems
- CPU load is a real-time snapshot, not an average
