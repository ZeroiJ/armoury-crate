# Changelog

All notable changes to Armoury Vault will be documented in this file.

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

### Removed

- Server-side Edge Function auth routes (`/api/auth/*`)
- Gleam language integration (simplified to pure TypeScript)
- Debug endpoint (`/api/debug/env`)

### Fixed

- 500 Internal Server Error on login (bypassed by switching to client-side)
- Environment variable accessibility issues

## [0.1.0] - 2026-01-29

### Added

- Initial Next.js 15 project setup with App Router
- Cloudflare Pages deployment configuration
- Landing page with "Login with Bungie" button
- Basic dashboard layout with character cards
- Bungie OAuth integration (server-side, later replaced)
- Gleam core logic layer for profile parsing (later removed)

---

## Pending

### Known Issues

- **OriginHeaderDoesNotMatchKey:** Need to add `https://armoury-crate.pages.dev` to Bungie Developer Portal

### Next Steps

- Complete OAuth flow after Bungie domain configuration
- Add token refresh logic
- Implement actual item management features
