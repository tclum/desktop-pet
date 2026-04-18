# Desktop Pet

A cross-platform desktop companion pet for Mac and Windows, built with Tauri 2 + React + TypeScript.

## Prerequisites

- [Rust](https://rustup.rs/) (stable toolchain)
- [Node.js](https://nodejs.org/) 20+
- On macOS: Xcode Command Line Tools (`xcode-select --install`)
- On Windows: Microsoft C++ Build Tools (via Visual Studio installer)

## Setup

```sh
npm install
```

## Development

```sh
npm run dev
```

This starts the Vite dev server and opens the Tauri app in development mode. The pet window is hidden by default — click the tray icon (menu bar on Mac, system tray on Windows) to show or hide it.

## Build for production

```sh
# Current platform
npm run build

# macOS universal binary (requires both Rust targets installed)
rustup target add aarch64-apple-darwin x86_64-apple-darwin
npm run build -- --target universal-apple-darwin

# Windows x64
rustup target add x86_64-pc-windows-msvc
npm run build -- --target x86_64-pc-windows-msvc
```

Bundled outputs land in `src-tauri/target/<target>/release/bundle/`.

## Data

The app stores its SQLite database at:

- **macOS:** `~/Library/Application Support/com.desktoppet.app/pet.db`
- **Windows:** `%APPDATA%\com.desktoppet.app\pet.db`

A rolling backup (`pet.db.backup`) is kept alongside the main database, refreshed when the current backup is older than 24 hours.

## Project structure

```
src-tauri/           Rust backend
  src/
    main.rs          Entry point
    lib.rs           App builder, tray setup
    db/              SQLite schema and queries
    pet/             Pet state computation (Phase B+)
    notifications/   Notification scheduling (Phase C+)
    platform/        Platform-specific abstractions
src/                 React frontend
  components/        UI components (Phase B+)
  pet/               Pet rendering and animations (Phase B+)
  productivity/      Todo list and focus timer (Phase D+)
  state/             Zustand stores (Phase B+)
  lib/               Utilities
  styles/            Global CSS
public/              Static assets
```

## CI

GitHub Actions builds for both platforms on every push to `main`. Artifacts are uploaded to the workflow run. Code signing is not configured yet (Phase H).
