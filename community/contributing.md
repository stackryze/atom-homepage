# Contributing to Atom

Thank you for your interest in contributing to Atom! This guide covers contributing to both the **application code** and the **documentation**.

---

## Documentation Contributions

The Atom documentation site is built with [Retype](https://retype.com/) and lives in the `docs/` folder of the repository. It's deployed to Cloudflare Pages automatically when changes are merged.

### Quick Start

1. **Fork** the repository: [github.com/stackryze/atom-homepage](https://github.com/stackryze/atom-homepage)
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/atom-homepage.git
   cd atom-homepage
   ```
3. **Create a branch** from `docs`:
   ```bash
   git checkout docs
   git checkout -b docs/your-change-name
   ```
4. **Edit files** in the `docs/` folder
5. **Preview locally** (optional):
   ```bash
   npx retypeapp start docs/
   ```
6. **Commit and push**:
   ```bash
   git add docs/
   git commit -m "docs: your change description"
   git push origin docs/your-change-name
   ```
7. **Open a Pull Request** targeting the `docs` branch

### Documentation Structure

```
docs/
├── retype.yml              # Retype project config
├── index.md                # Home page
├── getting-started/        # Installation & setup
│   ├── index.md
│   └── installation.md
├── configuration/          # Dashboard & appearance config
│   ├── index.md
│   ├── dashboard.md
│   └── appearance.md
├── features/               # Feature documentation
│   ├── index.md
│   ├── docker.md
│   ├── sso.md
│   ├── monitoring.md
│   └── forward-auth.md
├── widgets/                # Widget documentation
│   ├── index.md
│   ├── system-monitor.md
│   ├── clock.md
│   └── ... (one file per widget)
├── community/              # Community section
│   ├── index.md
│   ├── widgets.md          # Community widget presets
│   └── contributing.md     # This file
└── api/                    # API reference
    └── index.md
```

### Writing Guidelines

- Use [Retype Markdown](https://retype.com/guides/markdown/) syntax
- Include frontmatter with `label`, `icon`, and `order`
- Use tabs (`+++ Tab Name`) for multi-option instructions
- Use callouts (`!!!warning`, `!!!info`) for important notes
- Add code blocks with language identifiers
- Link to other docs pages using relative paths (e.g., `/widgets/generic/`)

---

## Community Widget Contributions

The easiest way to contribute is adding widget presets:

### Steps

1. Open `docs/community/widgets.md`
2. Add your widget under the appropriate category heading
3. Include:
   - App name and description
   - JSON configuration block
   - API endpoint and fields table
   - Any authentication requirements
4. Submit a PR to the `docs` branch

### Template

```markdown
### App Name — Feature Description

Brief description of what this widget shows.

\```json
{
  "type": "generic",
  "title": "App Name",
  "options": {
    "url": "https://app.example.com",
    "fields": [
      { "label": "Field Name", "path": "json.path" }
    ]
  }
}
\```

| Field | Value |
|---|---|
| Endpoint | `/api/endpoint` |
| Auth | API key via header |
| Displays | Field 1, Field 2 |
```

---

## Code Contributions

### Setup

```bash
git clone https://github.com/stackryze/atom-homepage.git
cd atom-homepage
npm install
npm run dev
```

### Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check (zero warnings) |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Coverage report |

### Branch Naming

| Prefix | Use |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `perf/` | Performance improvements |
| `refactor/` | Code refactoring |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add bookmarks widget
fix: resolve SSO callback URL mismatch
docs: add Pi-hole widget preset
perf: optimize bundle with dynamic imports
```

### Pull Request Process

1. Ensure `npm run lint` passes with zero warnings
2. Ensure `npm run build` succeeds
3. Add tests for new functionality when applicable
4. Update documentation if adding user-facing features
5. Keep PRs focused — one feature/fix per PR

---

## Code of Conduct

All contributors must follow the [Code of Conduct](https://github.com/stackryze/atom-homepage/blob/main/CODE_OF_CONDUCT.md). Be respectful and constructive in all interactions.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](https://github.com/stackryze/atom-homepage/blob/main/LICENSE.md).
