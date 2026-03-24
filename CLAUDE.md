# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend development
pnpm dev              # Vite dev server only (port 1420)
pnpm build            # TypeScript check + Vite production build
pnpm lint             # ESLint

# Full Tauri app
pnpm tauri:dev        # Run the full desktop app in dev mode
pnpm tauri:build      # Build production executable

# Rust only
cd src-tauri && cargo check
cd src-tauri && cargo build
```

There are no automated tests in this project.

## Architecture

This is a **Tauri 2 desktop app** (Windows-primary) that wraps a React 19 frontend with a Rust backend. The app downloads Steam Workshop items by spawning `DepotDownloaderMod.exe` (a bundled .NET 9 binary) as a subprocess.

### Data Flow

1. User inputs Workshop URL/ID and selects account + destination folder in the React UI
2. Frontend calls Tauri commands via `src/lib/tauri.ts` wrappers
3. Rust backend (`src-tauri/src/commands/download.rs`) validates input and spawns `DepotDownloaderMod.exe` with credentials and target args
4. The subprocess streams stdout; Rust emits `download-log` and `download-progress` Tauri events
5. Frontend listens for these events and updates `ConsoleOutput` and progress UI

### Backend Structure (`src-tauri/src/`)

- **`commands/`** — Tauri `#[command]` handlers, thin layer calling services
  - `system.rs` — dotnet check, folder dialog, settings load/save, Steam API queries
  - `download.rs` — start download, add to history
- **`services/`** — business logic
  - `downloader.rs` — spawns DepotDownloaderMod process, parses progress via regex (`X MB / Y MB`), kills processes on app close (Windows: `taskkill`)
  - `storage.rs` — JSON persistence under `dirs::config_dir()/workshop-downloader/`
- **`models/`** — shared structs/enums (`DownloadTask`, `DownloadRecord`, `AppSettings`, `Account`)
- **`lib.rs`** — Tauri builder, plugin registration, 9 command registrations, close-window cleanup handler

### Frontend Structure (`src/`)

- **`App.tsx`** — top-level state (active tab, accounts, download path, console output, .NET status); initializes settings and subscribes to download events on mount
- **`components/pages/`** — `DownloaderPage`, `NetworkPage`, `SettingsPage`, `AboutPage`
- **`components/ui/`** — reusable widgets: `GameSelector` (debounced Steam search), `WorkshopPreview` (item details), `AccountSelector`, `PathSelector`, `ConsoleOutput`, `TitleBar` (custom frameless), `ToastContainer`
- **`lib/tauri.ts`** — typed wrappers for all Tauri `invoke` calls and event listeners
- **`lib/notifications.ts`** — toast helper (success/error/warning/info)
- **`lib/constants.ts`** — `APP_VERSION`, `GITHUB_REPO`, `DONATE_LINK`

### Key Technical Details

- **Custom title bar**: window decorations are disabled (`"decorations": false` in `tauri.conf.json`); `TitleBar.tsx` handles drag, minimize, maximize, close
- **Vite port**: must be 1420 (hardcoded in `tauri.conf.json` devUrl)
- **Bundled binary**: `src-tauri/assets/DepotDownloaderMod.exe` + DLLs are bundled via `tauri.conf.json` `resources` and located at runtime relative to the executable
- **Process cleanup**: on window close, `DownloaderService::cleanup_processes()` runs `taskkill /F /IM DepotDownloaderMod.exe` to avoid orphaned processes
- **Settings/history persistence**: stored as JSON at the OS config directory (`%APPDATA%\workshop-downloader\` on Windows)
- **Steam APIs used**: Store search (`store.steampowered.com/api/storesearch`), workshop item details (`api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails`)
- **Windows-only code**: `downloader.rs` uses `std::os::windows::process::CommandExt` for `CREATE_NO_WINDOW`; `cleanup_processes` is `#[cfg(target_os = "windows")]`

### State Management

State lives primarily in `App.tsx` and is passed as props. Zustand is a dependency but not yet used. React Query is available for async data fetching (used in `AboutPage` for GitHub releases).
