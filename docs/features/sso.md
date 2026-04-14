---
label: SSO & Authentication
icon: shield-lock
order: 80
---

# SSO & Authentication

Atom supports local authentication and external identity providers via OAuth2/OIDC and SAML 2.0.

---

## Local Authentication

By default, Atom uses local username/password authentication:

- Passwords are hashed with **bcrypt** (10 salt rounds)
- Sessions use **JWT** tokens stored in HTTP-only cookies
- The first registered user is automatically an **admin**

---

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full access: manage users, services, settings, OAuth clients, auth providers |
| **Member** | View dashboard, access assigned services (based on tags) |

---

## External Identity Providers

Atom can authenticate users via any OAuth2/OIDC or SAML 2.0 provider.

### Supported Provider Presets

| Provider | Type | Auto-configured |
|---|---|---|
| Google | OIDC | Yes — just add Client ID & Secret |
| GitHub | OAuth2 | Yes |
| Microsoft (Entra ID) | OIDC | Yes |
| GitLab | OIDC | Yes |
| Authentik | OIDC | Yes |
| Keycloak | OIDC | Yes |
| Custom | OIDC / OAuth2 | Manual endpoint configuration |

### Adding a Provider

1. Go to **Settings** → **Auth Providers**
2. Click a preset button (e.g., Google) or **Add Custom**
3. Fill in the required fields:

| Field | Description |
|---|---|
| Name | Display name on the login page |
| Client ID | From your identity provider |
| Client Secret | From your identity provider |
| Issuer | OIDC issuer URL (presets fill this automatically) |
| Scopes | Space-separated (default: `openid profile email`) |

4. Click **Save** and toggle the provider **Enabled**

### Provider Settings

| Setting | Description |
|---|---|
| **User Match Field** | How to match external users to local accounts: `email`, `username`, or `sub` |
| **Auto Register** | Automatically create local accounts for new external users |
| **Auto Launch** | Skip the login page and redirect directly to this provider |

---

## Callback URL

Each provider needs a callback/redirect URL configured in your identity provider. Atom displays the callback URL on the provider configuration page:

```
https://your-atom-url/api/auth/{provider-slug}/callback
```

Use the **Copy Callback URL** button in the provider settings.

---

## OIDC Discovery

If your provider supports OIDC Discovery, Atom can auto-fill endpoints:

1. Enter the provider's Issuer URL
2. Click **Discover** — Atom fetches the `.well-known/openid-configuration`
3. Authorization, token, userinfo, and JWKS endpoints are filled automatically

---

## SAML 2.0

Atom also functions as a SAML Service Provider:

- **Metadata URL**: `https://your-atom-url/api/saml/metadata`
- Configure your IdP with Atom's metadata
- Set up attribute mapping for email/username

---

## Atom as an Identity Provider

Atom can also act as an **OAuth2/OIDC provider** for other applications:

### OIDC Endpoints

| Endpoint | URL |
|---|---|
| Discovery | `/.well-known/openid-configuration` |
| Authorization | `/api/oauth/authorize` |
| Token | `/api/oauth/token` |
| UserInfo | `/api/oauth/userinfo` |
| Introspect | `/api/oauth/introspect` |
| Revoke | `/api/oauth/revoke` |

### OAuth2 Grants

- **Authorization Code** — Standard web app flow with consent screen
- **Refresh Token** — Long-lived sessions
- **Client Credentials** — Machine-to-machine

### Creating OAuth Clients

1. Go to **Settings** → **OAuth Clients**
2. Click **Add Client**
3. Configure redirect URIs
4. Use the generated Client ID and Secret in your application

---

## Forward Auth Proxy

Atom can protect external applications using forward auth:

1. Go to **Settings** → **Proxy**
2. Add a protected application with its backend URL
3. Configure access control (all users or specific users)
4. Set up your reverse proxy to use Atom's auth endpoint

See the [Forward Auth Proxy Guide](/features/forward-auth/) for detailed examples.

---

## Environment Variables

| Variable | Description |
|---|---|
| `COOKIE_SECURE` | Set `true` when behind HTTPS (required for secure cookies) |
| `OAUTH_ISSUER_URL` | Public URL of your Atom instance (required for OIDC/SAML) |
| `OAUTH_TOKEN_EXPIRY` | Token expiration in seconds (default: 3600) |
