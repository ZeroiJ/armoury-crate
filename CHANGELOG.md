# Changelog

All notable changes to Armoury Vault will be documented in this file.

## [0.2.1] - 2026-01-30

### Changed

- Switched OAuth Client Type between Public and Confidential (testing both)
- Added `credentials: 'omit'` to token fetch (matches DIM implementation)
- Reverted to Confidential OAuth with `client_secret`

### Debugging Notes

- **OriginHeaderDoesNotMatchKey error persists**
- This error means Bungie's API is rejecting requests because the Origin header doesn't match the "Website" field configured in Bungie's Developer Portal
- Tried: Public OAuth, Confidential OAuth, credentials: 'omit'
- DIM uses: Confidential OAuth with client_secret
- **Root cause likely:** Bungie's "Website" field configuration needs exact domain match

### Technical Details

- Token exchange uses: `https://www.bungie.net/platform/app/oauth/token/`
- Browser sends `Origin: https://armoury-crate.pages.dev` header
- Bungie validates this against the app's "Website" field
- **Bungie App ID:** 51437
- **Current credentials:** client_id, client_secret, API key all set correctly

---

## [0.2.0] - 2026-01-30

### Changed

- **Complete OAuth rewrite:** Switched from server-side to client-side OAuth flow
- Adopted DIM's OAuth pattern for better compatibility with Cloudflare Pages
- Environment variables now use `NEXT_PUBLIC_` prefix for client-side access

### Added

- `/return` page for handling OAuth callback client-side
- URL rewrite in `next.config.ts` to preserve existing Bungie redirect URL
- Dashboard page with character display (emblems, class, light level)
- Logout functionality
- CHANGELOG.md file

### Removed

- Server-side Edge Function auth routes (`/api/auth/*`)
- Gleam language integration (simplified to pure TypeScript)
- Debug endpoint (`/api/debug/env`)

### Fixed

- 500 Internal Server Error on login (bypassed by switching to client-side)
- Environment variable accessibility issues (`NEXT_PUBLIC_` prefix)

---

## [0.1.0] - 2026-01-29

### Added

- Initial Next.js 15 project setup with App Router
- Cloudflare Pages deployment configuration
- Landing page with "Login with Bungie" button
- Basic dashboard layout with character cards
- Bungie OAuth integration (server-side, later replaced)
- Gleam core logic layer for profile parsing (later removed)

---

## Pending Issue: OriginHeaderDoesNotMatchKey

**Error:** `{"error":"server_error","error_description":"OriginHeaderDoesNotMatchKey"}`

**What this means:**
Bungie's token endpoint is rejecting requests because the browser's `Origin` header doesn't match the "Website" field configured in Bungie's Developer Portal.

**Bungie App Configuration (current):**

- Website: `https://armoury-crate.pages.dev`
- Redirect URL: `https://armoury-crate.pages.dev/api/auth/callback`
- OAuth Client Type: Confidential
- API Key: `fc889064fa9a4020a74af3a2ee584a42`
- Client ID: `51437`

**Things to verify:**

1. Website field EXACTLY matches: `https://armoury-crate.pages.dev` (no trailing slash)
2. Changes were saved in Bungie's portal
3. API Key origin restrictions (if any)

**How DIM solves this:**
DIM registers `https://app.destinyitemmanager.com` in their Bungie app and uses Confidential OAuth with client_secret.
