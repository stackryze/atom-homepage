---
label: Home
icon: home
order: 100
---

# Atom Dashboard

A modern, self-hosted start page and service dashboard with real-time monitoring, Docker integration, SSO authentication, and customizable widgets.

![Atom Dashboard](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![React](https://img.shields.io/badge/React-19-blue?logo=react) ![License](https://img.shields.io/badge/License-MIT-green) ![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)

---

## Features

:::row:::

:::column:::
### :icon-server: Service Monitoring
Add your services and monitor their uptime in real-time with HTTP, TCP, and ICMP checks.
:::

:::column:::
### :icon-container: Docker Integration
View and manage Docker containers with live CPU/memory stats, logs, and terminal access.
:::

:::column:::
### :icon-shield-lock: SSO & OAuth
Authenticate with Google, GitHub, Microsoft, GitLab, Authentik, Keycloak, or any OIDC/SAML provider.
:::

:::row-end:::

:::row:::

:::column:::
### :icon-paintbrush: Customizable Themes
Light & dark mode, accent colors, background images, and full appearance editor.
:::

:::column:::
### :icon-apps: Dashboard Widgets
System stats, weather, clock, calendar, bookmarks, notes, Docker summary, and more.
:::

:::column:::
### :icon-people: Multi-User
Role-based access with admin/member roles, tag-based service visibility, and user management.
:::

:::row-end:::

---

## Quick Start

+++ Docker Compose (Recommended)

```yaml docker-compose.yml
services:
  atom:
    image: ghcr.io/stackryze/atom-homepage:latest
    container_name: atom
    ports:
      - "3000:3000"
    volumes:
      - atom_data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped

volumes:
  atom_data:
```

```bash
docker compose up -d
```

+++ Docker Run

```bash
docker run -d \
  --name atom \
  -p 3000:3000 \
  -v atom_data:/app/data \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  ghcr.io/stackryze/atom-homepage:latest
```

+++ Local Development

```bash
git clone https://github.com/stackryze/atom-homepage.git
cd atom-homepage
npm install
npm run dev
```

+++

Open [http://localhost:3000](http://localhost:3000) and create your admin account.

---

## Architecture

| Component | Technology |
|---|---|
| Frontend | Next.js 16, React 19, CSS Modules |
| Backend | Next.js API Routes (Server Components) |
| Database | SQLite via better-sqlite3 |
| Auth | JWT, bcrypt, OIDC, SAML 2.0 |
| Docker | Dockerode API client |
| Icons | Lucide React (800+), Simple Icons (2500+) |

---

## Next Steps

- [Installation Guide](/getting-started/installation/) — Detailed setup instructions
- [Configuration](/configuration/) — Customize your dashboard
- [Widgets](/widgets/) — Add and configure widgets
- [Docker Integration](/features/docker/) — Container management
- [SSO Setup](/features/sso/) — External authentication
- [Community](/community/) — Contribute widgets and features
