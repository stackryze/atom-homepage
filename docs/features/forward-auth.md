---
label: Forward Auth Proxy
icon: shield
order: 70
---

# Forward Auth Proxy

Protect external applications using Atom as a forward authentication proxy.

---

## Overview

Atom can act as an authentication gateway for other services. When a user tries to access a protected application, the reverse proxy checks with Atom whether the user is authenticated.

---

## Setup

### 1. Add a Protected Application

Go to **Settings** → **Proxy** and add a new application:

| Field | Description |
|---|---|
| Name | Application display name |
| Slug | URL path segment (e.g., `grafana` → `/proxy/grafana/*`) |
| Backend URL | Target backend (e.g., `http://grafana:3000`) |
| Require Auth | Enable authentication requirement |
| Allowed Users | Restrict to specific usernames/emails (blank = all users) |
| Inject Headers | Pass auth info as `X-Auth-*` headers to the backend |
| Strip Auth Header | Remove the `Authorization` header before proxying |

### 2. Configure Your Reverse Proxy

+++ Traefik + oauth2-proxy

```yaml
services:
  oauth2-proxy:
    image: quay.io/oauth2-proxy/oauth2-proxy:latest
    environment:
      - OAUTH2_PROXY_PROVIDER=oidc
      - OAUTH2_PROXY_OIDC_ISSUER_URL=https://atom.example.com
      - OAUTH2_PROXY_CLIENT_ID=your-client-id
      - OAUTH2_PROXY_CLIENT_SECRET=your-client-secret
      - OAUTH2_PROXY_COOKIE_SECRET=generate-a-32-byte-secret
      - OAUTH2_PROXY_REDIRECT_URL=https://app.example.com/oauth2/callback
      - OAUTH2_PROXY_EMAIL_DOMAINS=*
    labels:
      - "traefik.http.middlewares.oauth.forwardauth.address=http://oauth2-proxy:4180/oauth2/auth"
      - "traefik.http.middlewares.oauth.forwardauth.trustForwardHeader=true"

  grafana:
    image: grafana/grafana
    labels:
      - "traefik.http.routers.grafana.middlewares=oauth@docker"
```

+++ Nginx

```nginx
server {
    listen 443 ssl;
    server_name app.example.com;

    location /oauth2/ {
        proxy_pass http://oauth2-proxy:4180;
    }

    location / {
        auth_request /oauth2/auth;
        auth_request_set $auth_user $upstream_http_x_auth_request_user;
        proxy_set_header X-Auth-User $auth_user;
        proxy_pass http://backend:8080;
    }
}
```

+++ Caddy

```
app.example.com {
    forward_auth oauth2-proxy:4180 {
        uri /oauth2/auth
        copy_headers X-Auth-Request-User X-Auth-Request-Email
    }
    reverse_proxy backend:8080
}
```

+++

---

## Auth Headers

When **Inject Headers** is enabled, Atom passes the following headers to the backend:

| Header | Value |
|---|---|
| `X-Auth-User-Id` | Atom user ID |
| `X-Auth-Username` | Username |
| `X-Auth-Email` | User email (if available) |

---

## Generating OAuth Secrets

```bash
# Generate a cookie secret for oauth2-proxy
openssl rand -hex 16

# Or using Python
python3 -c 'import secrets; print(secrets.token_hex(16))'
```

---

## Production Tips

1. **Always use HTTPS** in production
2. Set `COOKIE_SECURE=true` behind a TLS-terminating proxy
3. Restrict `email_domains` to your organization
4. Use short session durations for sensitive applications
5. Monitor the Atom audit log for suspicious auth attempts
