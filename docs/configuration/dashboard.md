---
label: Dashboard
icon: table
order: 90
---

# Dashboard Configuration

The dashboard is the main view of Atom. Configure services, layout, pages, and categories.

---

## Services

Services are the core of your dashboard. Each service card displays the name, icon, status indicator, and response latency.

### Adding a Service

1. Go to **Settings** → **Services** tab
2. Click **Add Service**
3. Fill in the details:

| Field | Required | Description |
|---|---|---|
| Name | Yes | Display name for the service |
| URL | Yes | Full URL (e.g., `https://grafana.example.com`) |
| Icon | No | Icon from [Simple Icons](https://simpleicons.org/) or [Lucide](https://lucide.dev/) |
| Category | No | Group services (e.g., "Media", "Infrastructure") |
| Description | No | Short description shown on hover |
| Ping Host | No | Custom host/IP for ICMP monitoring instead of HTTP |
| Tags | No | Access control tags (comma-separated) |

### Bulk Import

Import multiple services at once via CSV or JSON:

+++ CSV Format

```csv
name,url,icon,category
Grafana,https://grafana.example.com,grafana,Monitoring
Portainer,https://portainer.example.com,portainer,Docker
Nextcloud,https://cloud.example.com,nextcloud,Cloud
```

+++ JSON Format

```json
[
  {
    "name": "Grafana",
    "url": "https://grafana.example.com",
    "icon": "grafana",
    "category": "Monitoring"
  }
]
```

+++

---

## Status Monitoring

Atom checks service health using multiple methods:

| Method | When Used | Details |
|---|---|---|
| HTTP HEAD | External URLs | Fast, no body download, follows redirects manually |
| HTTP GET | HEAD returns 405 | Fallback when HEAD is rejected |
| TCP Ping | Internal services | Direct TCP connection check |
| ICMP Ping | Custom ping host | Uses the `ping` field on a service |

### Status States

| State | Indicator | Condition |
|---|---|---|
| **Up** | :icon-check-circle: Green | Response received, latency < 500ms |
| **Slow** | :icon-alert: Yellow | Response received, latency ≥ 500ms |
| **Down** | :icon-x-circle: Red | No response or error |
| **Loading** | Pulse animation | Check in progress |

---

## Layout Options

Configure the dashboard layout in **Settings** → **General**:

| Option | Values | Description |
|---|---|---|
| Style | `grid`, `list` | Card layout mode |
| Columns | 1–6 | Number of columns in grid mode |
| Gap | 8–32 px | Spacing between cards |
| Container Width | `full`, `centered`, `compact` | Dashboard width |
| Widget Alignment | `left`, `right`, `both` | Widget sidebar position |

---

## Pages

Organize services into multiple dashboard pages (tabs):

1. Go to **Settings** → **Pages**
2. Create a new page with a name
3. Assign services to each page
4. Use the tab bar on the dashboard to switch between pages

---

## Categories

Services can be grouped by category. The dashboard shows a category filter bar when multiple categories exist.

Set the `category` field on each service. Common examples:
- `Infrastructure`
- `Media`
- `Monitoring`
- `Development`
- `Cloud`

---

## Tag-Based Access Control

Control which services each user can see using tags:

1. Assign tags to services (e.g., `admin`, `dev`, `media`)
2. Assign tags to users in **Settings** → **Users**
3. Users only see services matching their tags
4. The special tag `all` grants access to everything
5. Admin users always see all services

---

## Search & Command Palette

- **Search bar**: Filter services by name or URL in real-time
- **Command Palette** (`Ctrl+K` / `Cmd+K`): Quick navigation to any service, page, or setting
