# Changelog

## [1.22.0] - 2026-01-05

### Major Refactor ✅ FIXED!
- **NEW APPROACH**: Display MAL link as clickable button in Seanime UI (tray)
- No system command execution needed - no permission issues!
- Click "MAL" button → Get MAL URL in tray popup
- Click the URL button to copy link or right-click to copy
- Works perfectly with no authorization issues
- Simplified manifest (no permissions needed)

## [1.21.5] - 2026-01-05

### Attempted Fix
- Used Windows `start` command instead of `open`
- Still blocked by Seanime's command authorization system
- Led to Option 3 approach (UI link)

## [1.21.4] - 2026-01-05

### Attempted Fix
- Changed validator from strict regex to `$ARGS`
- Didn't solve the underlying authorization issue

## [1.21.3] - 2026-01-05

### Fixed
- Reverted to sync `$os.cmd()` API
- Changed from async to sync command execution

## [1.21.2] - 2026-01-05

### Attempted Fix (Incorrect)
- Tried adding `open` command to `allow` list

## [1.21.1] - 2026-01-05

### Fixed
- Removed TypeScript compilation error

## [1.21.0] - 2026-01-05

### Initial System Command Attempt
- Used `$os.cmd("open", url)` with commandScopes
- Worked in theory, blocked in practice

---

See git history for older versions.
