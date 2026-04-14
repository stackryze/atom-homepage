# Appearance & Themes

Customize the look and feel of your Atom dashboard.

---

## Theme Mode

Toggle between **Light** and **Dark** mode using:
- The sun/moon icon in the dashboard header
- The Command Palette (`Ctrl+K` → "Toggle Theme")
- **Settings** → **General** → Theme toggle

---

## Theme Settings

Access the full theme editor in **Settings** → **Appearance**:

| Setting | Description |
|---|---|
| Primary Color | Main accent color (default: `#d4a574`) |
| Background Color | Dashboard background color |
| Background Image | Custom background image URL |
| Mode | `light` or `dark` |

---

## Quick Theme Presets

Atom includes built-in theme presets for quick customization:

### Dark Mode Presets
- **Warm Amber** — Default warm gold theme
- **Ocean Blue** — Cool blue tones
- **Forest Green** — Natural green palette
- **Rose Pink** — Soft pink accents

### Light Mode Presets
- **Classic Light** — Clean minimal light theme
- **Warm Sand** — Warm light tones
- **Cool Gray** — Professional gray palette

---

## Custom CSS

For advanced customization, add custom CSS in **Settings** → **Appearance** → **Custom CSS**:

```css
/* Example: Custom card border radius */
.serviceCard {
    border-radius: 20px !important;
}

/* Example: Custom font */
body {
    font-family: 'Inter', sans-serif !important;
}
```

---

## CSS Variables

Atom uses CSS custom properties that you can override:

| Variable | Default (Dark) | Description |
|---|---|---|
| `--bg-primary` | `#0e0e0e` | Main background |
| `--bg-secondary` | `#141210` | Secondary background |
| `--bg-card` | `#1a1a1a` | Card background |
| `--bg-hover` | `#252525` | Hover state background |
| `--text-primary` | `#f0f0f0` | Primary text color |
| `--text-secondary` | `#a1a1aa` | Secondary text color |
| `--accent-color` | `#d4a574` | Accent / brand color |
| `--border-color` | `#222222` | Border color |
| `--radius-md` | `12px` | Default border radius |
