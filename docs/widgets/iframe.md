---
label: Iframe
icon: browser
order: 50
---

# Iframe Widget

Embed any external webpage directly into your dashboard.

---

## Configuration

| Option | Type | Description |
|---|---|---|
| `url` | string | URL of the page to embed |
| `height` | number | Widget height in pixels |

---

## Use Cases

- Embed Grafana dashboards
- Show Uptime Kuma status pages
- Display external monitoring tools
- Embed documentation or wikis

---

## Notes

!!!warning Same-Origin Policies
Some websites block being embedded in iframes via `X-Frame-Options` or `Content-Security-Policy` headers. If a site doesn't load, it's because the target server blocks iframe embedding.
!!!
