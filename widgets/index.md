# Widgets

Atom Dashboard supports a variety of built-in widgets to enhance your start page. Widgets can be placed in the left or right sidebar columns and reordered via drag-and-drop.

Looking for more? Check out [Community Widgets](/community/widgets/) for user-contributed widget ideas and presets.

---

## Managing Widgets

1. Go to **Settings** → **Widgets**
2. Click **Add Widget**
3. Select a widget type and configure its options
4. Choose the **column** (`left` or `right`)
5. Toggle **enabled/disabled** as needed
6. Drag widgets to reorder them on the dashboard

---

## Built-in Widget Types

| Type | Description |
|---|---|
| [System Monitor](/widgets/system-monitor/) | Real-time CPU, memory, and storage usage |
| [Clock](/widgets/clock/) | Digital time display with weather overlay |
| [Weather](/widgets/weather/) | Weather conditions for any location |
| [Docker](/widgets/docker/) | Container count summary |
| [Calendar](/widgets/calendar/) | Interactive monthly calendar |
| [Bookmarks](/widgets/bookmarks/) | Quick-access bookmark links |
| [Notes](/widgets/notes/) | Persistent quick notes |
| [Search](/widgets/search/) | Embedded search bar widget |
| [Uptime](/widgets/uptime/) | Uptime history chart for a service |
| [Activity Log](/widgets/activity/) | Recent service status changes |
| [Iframe](/widgets/iframe/) | Embed any external page |
| [Generic](/widgets/generic/) | Flexible JSON API consumer |
| [Custom](/widgets/custom/) | Fully custom HTML/content widget |

---

## Widget Configuration

All widgets share these common fields:

| Field | Type | Description |
|---|---|---|
| `id` | string | Auto-generated unique identifier |
| `type` | string | Widget type (see table above) |
| `title` | string | Optional display title |
| `column` | `left` \| `right` | Sidebar placement |
| `enabled` | boolean | Show/hide without deleting |
| `options` | object | Type-specific settings |
