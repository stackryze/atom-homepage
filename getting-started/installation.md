# Installation

Atom can be deployed using Docker (recommended) or run locally for development.

---

## Prerequisites

| Requirement | Minimum |
|---|---|
| Node.js | 18+ (for local dev) |
| Docker | 20+ (for containerized deployment) |
| RAM | 256 MB minimum, 512 MB recommended |

---

## Docker Compose (Recommended)

Create a `docker-compose.yml` file:

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
    environment:
      - NODE_ENV=production
      - COOKIE_SECURE=false  # Set to true behind HTTPS reverse proxy
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 128M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    restart: unless-stopped

volumes:
  atom_data:
```

```bash
docker compose up -d
```

!!!warning Docker Socket
Mounting `/var/run/docker.sock` is required for Docker container management. Add `:ro` for read-only access if you don't need exec/start/stop functionality.
!!!

---

## Docker Run

```bash
docker run -d \
  --name atom \
  -p 3000:3000 \
  -v atom_data:/app/data \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -e NODE_ENV=production \
  --restart unless-stopped \
  ghcr.io/stackryze/atom-homepage:latest
```

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/stackryze/atom-homepage.git
cd atom-homepage

# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server starts at [http://localhost:3000](http://localhost:3000).

---

## Building from Source

```bash
# Production build
npm run build

# Start production server
npm start
```

Or build your own Docker image:

```bash
docker build -t atom-homepage .
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Set to `production` for deployments |
| `PORT` | `3000` | Server port |
| `HOSTNAME` | `0.0.0.0` | Bind address (Docker default) |
| `COOKIE_SECURE` | `false` | Set `true` only behind HTTPS reverse proxy |
| `DATA_DIR` | `./data` | Data directory path (Docker: `/app/data`) |
| `OAUTH_ISSUER_URL` | — | Full Atom URL for OIDC/SAML (e.g., `https://atom.example.com`) |
| `OAUTH_TOKEN_EXPIRY` | `3600` | OAuth token expiration in seconds |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disable Next.js telemetry |

---

## Data Persistence

All data is stored in a SQLite database at `data/atom.db`. The `data/` directory also stores:

- `keys/` — OIDC signing keys (auto-generated)
- `saml/` — SAML certificates

!!!
Always mount a persistent volume to `/app/data` in Docker to avoid data loss on container recreation.
!!!

---

## First Run

1. Open Atom in your browser at `http://localhost:3000`
2. You'll be redirected to the onboarding page
3. Create your admin account (first user is always admin)
4. Start adding services to your dashboard

---

## Reverse Proxy

When deploying behind a reverse proxy (Nginx, Traefik, Caddy):

1. Set `COOKIE_SECURE=true`
2. Set `OAUTH_ISSUER_URL` to your public URL
3. Forward the `Host` header
4. Enable WebSocket proxying for terminal features

+++ Nginx

```nginx
server {
    listen 443 ssl;
    server_name atom.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

+++ Traefik

```yaml
# docker-compose labels
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.atom.rule=Host(`atom.example.com`)"
  - "traefik.http.routers.atom.tls.certresolver=letsencrypt"
  - "traefik.http.services.atom.loadbalancer.server.port=3000"
```

+++ Caddy

```
atom.example.com {
    reverse_proxy localhost:3000
}
```

+++
