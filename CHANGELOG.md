# Changelog

## [1.20.0] - 2026-01-05

### Fixed
- **Critical fix**: Replaced `$osExtra.asyncCmd()` with `ctx.openUrl()` 
  - `$osExtra` was not available in the plugin context
  - Now using proper Seanime API for opening URLs
  - Removed unnecessary commandScopes from manifest

### Improved
- Cleaner error handling
- Proper use of Seanime plugin APIs

## [1.19.1] - 2026-01-05

### Fixed
- **Hotfix**: Resolved TypeScript compilation error caused by mismatched quotes in `MAL.ts`
  - Fixed error: `[Expected ")" but found "Anime"]`

## [1.19.0] - 2026-01-05

### Fixed
- **Critical fix**: Moved `$osExtra.asyncCmd()` execution to main plugin scope (outside onClick handler)
  - Resolves context scope issues where `$osExtra` was undefined in nested async handlers
  - Improves reliability of opening MAL links
  - Better error handling with detailed logging

### Improved
- Enhanced error messages and logging for debugging
- More robust command execution flow

---

## [1.18.0] - Previous Release

For previous versions, see git history.
