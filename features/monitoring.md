# Status Monitoring

Atom provides real-time uptime monitoring for all your services.

---

## How It Works

When services are loaded on the dashboard, Atom checks each service's health status using the most appropriate method:

| Method | When Used | Timeout |
|---|---|---|
| **HTTP HEAD** | External HTTP/HTTPS URLs | 5 seconds |
| **HTTP GET** (fallback) | When HEAD returns 405 | 5 seconds |
| **TCP Ping** | Internal/private network services | 2 seconds |
| **ICMP Ping** | Services with a custom `ping` field | System default |

### Batch Checking

Dashboard status checks are batched — up to 50 services checked simultaneously with a concurrency limit of 10 parallel requests to prevent overwhelming your network.

---

## Status Indicators

| State | Color | Condition |
|---|---|---|
| Up | :icon-check-circle: Green | Response received, latency < 500ms |
| Slow | :icon-alert: Yellow | Response received, latency ≥ 500ms |
| Down | :icon-x-circle: Red | No response, timeout, or error |
| Loading | Pulse animation | Check in progress |

---

## Uptime History

Atom records every status check in the database. View historical data in the **Uptime Widget** or the **Status Overview** page (`/apps`).

Data tracked per check:
- Timestamp
- Status (up / slow / down)
- HTTP response code
- Response latency (ms)

### Status Overview Page

The `/apps` page shows a summary of all services:
- Total up / slow / down counts
- Average latency per service
- Uptime percentage (24h window)
- Sortable and searchable

---

## Notifications

The **Notification Center** (bell icon in header) alerts you when:
- A service goes **down** (was previously up)
- A service becomes **slow** (was previously up)
- A service **recovers** (was down, now up)

---

## Private Network Detection

Atom automatically detects internal services and uses TCP ping instead of HTTP:

- `localhost`, `127.x.x.x`
- `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`
- `.local` and `.internal` hostnames
- Hostnames without dots

---

## Custom Ping Host

For services behind load balancers or reverse proxies, you can set a custom ping host:

1. Edit the service
2. Set the **Ping** field to a specific IP or hostname
3. Atom uses ICMP ping instead of HTTP for status checks

This is useful when the HTTP endpoint returns a cached response but you want to check the actual server.
