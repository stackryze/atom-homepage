# API Reference

Atom exposes a RESTful API for all operations. All endpoints except onboarding require authentication via session cookie.

---

## Health & System

### GET /api/health

Returns the server health status.

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 86400
}
```

**Auth required**: No

---

### GET /api/stats

Returns real-time system statistics.

```json
{
  "cpuLoad": 23.5,
  "memTotal": 16384,
  "memUsed": 8192,
  "uptime": 86400,
  "platform": "linux",
  "storage": [
    { "fs": "/dev/sda1", "size": 500000000, "used": 250000000, "mount": "/" }
  ]
}
```

---

## Configuration

### GET /api/config

Fetch the current dashboard configuration.

### POST /api/config

Save the dashboard configuration. Body must conform to the AppConfig schema.

**Validation**: Zod schema validated

---

## Status Checking

### GET /api/status/check

Check a single service status.

| Parameter | Type | Description |
|---|---|---|
| `url` | string | Service URL to check |

```json
{ "up": true, "status": 200, "latency": 145, "method": "fetch" }
```

### POST /api/status/batch

Batch check multiple services (up to 50).

**Body**:
```json
{ "urls": ["https://example.com", "https://google.com"] }
```

**Response**:
```json
{
  "results": {
    "https://example.com": { "up": true, "status": 200, "latency": 145 },
    "https://google.com": { "up": true, "status": 301, "latency": 89 }
  }
}
```

### GET /api/status/ping

ICMP ping check.

| Parameter | Type | Description |
|---|---|---|
| `host` | string | Hostname or IP to ping |

---

## Uptime History

### GET /api/uptime

| Parameter | Type | Description |
|---|---|---|
| `service_id` | string | Service URL/ID |
| `hours` | number | Time window (1-720, default: 24) |
| `summary` | boolean | Set `true` for all-service summaries |

```json
{
  "service_id": "https://example.com",
  "hours": 24,
  "summary": { "uptime_percent": 99.8, "avg_latency": 145, "total_checks": 288 },
  "history": [
    { "timestamp": "...", "status": "up", "latency": 132, "response_code": 200 }
  ]
}
```

---

## Docker

### GET /api/docker/containers

List all containers with real-time stats.

```json
{
  "containers": [
    {
      "id": "abc123",
      "name": "grafana",
      "image": "grafana/grafana:latest",
      "state": "running",
      "status": "Up 2 hours",
      "cpu": "2.5%",
      "memory": "128 MB / 512 MB",
      "ports": "3000:3000",
      "ip": "172.17.0.2"
    }
  ]
}
```

### POST /api/docker/containers/[id]/action

Perform container actions.

| Action | Description |
|---|---|
| `start` | Start container |
| `stop` | Stop container |
| `restart` | Restart container |

---

## Users

### GET /api/users

List all users (safe fields only — no passwords).

### POST /api/users

Create a new user. Body validated with Zod schema.

### DELETE /api/users

Delete a user by ID.

---

## Authentication

### POST /api/auth/login

Login with username/password.

### POST /api/auth/logout

Clear session cookie.

### POST /api/auth/register

Register a new user (first user becomes admin).

### GET /api/auth/session

Get current session information.

### GET /api/auth/providers

List enabled authentication providers (public endpoint for login page).

---

## OAuth2 / OIDC

### GET /api/oauth/authorize

OAuth2 authorization endpoint with consent screen.

### POST /api/oauth/token

Token endpoint supporting:
- Authorization Code
- Refresh Token
- Client Credentials

### GET /api/oauth/userinfo

Returns authenticated user information (OIDC UserInfo).

### POST /api/oauth/clients

Manage OAuth2 clients (create/list/update/delete).

### POST /api/oauth/introspect

Token introspection (RFC 7662).

### POST /api/oauth/revoke

Token revocation (RFC 7009).

---

## SAML

### GET /api/saml/metadata

SAML Service Provider metadata XML.

---

## Proxy

### GET /api/proxy

CORS proxy for fetching external JSON APIs (used by Generic widgets).

| Parameter | Type | Description |
|---|---|---|
| `url` | string | External URL to proxy |

---

## Backup

### GET /api/backup/db

Download the SQLite database file.

### POST /api/backup/export

Export configuration as JSON.

---

## Notes

### GET /api/notes

Fetch saved notes.

### POST /api/notes

Save notes content.
