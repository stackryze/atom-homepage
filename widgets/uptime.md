# Uptime Widget

Displays uptime history and response time graphs for a specific service.

---

## Configuration

| Option | Type | Description |
|---|---|---|
| `service_id` | string | The URL/ID of the service to track |
| `hours` | number | Time window (default: 24 hours, max: 720) |

---

## Data Displayed

- Uptime percentage
- Average latency
- Status history timeline
- Total check count

---

## API Source

Data is fetched from `/api/uptime?service_id=<url>&hours=<n>`:

```json
{
  "service_id": "https://example.com",
  "hours": 24,
  "summary": {
    "uptime_percent": 99.8,
    "avg_latency": 145,
    "total_checks": 288
  },
  "history": [
    { "timestamp": "...", "status": "up", "latency": 132, "response_code": 200 }
  ]
}
```
