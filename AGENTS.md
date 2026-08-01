# Developer Guide & Repository Context (`AGENTS.md`)

This document provides a comprehensive overview of the **Stonks** codebase, its architecture, design principles, development workflows, and guidelines for adding new features.

---

## 📌 Repository Overview

**Stonks** is a native macOS-inspired desktop stock tracking and financial analytics application. It is built with:
- **Desktop Framework**: Electron (v29)
- **Frontend Framework**: React (v18) with TypeScript (v5)
- **Build Tool**: Vite (v5)
- **Styling**: Custom CSS / Vanilla CSS design system (`src/index.css`) & Lucide Icons (`lucide-react`)
- **Financial Data API**: Yahoo Finance API integration (`src/services/yahooFinanceApi.ts`)

---

## 🏗 Architecture & Codebase Map

```
stonks-app/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # GitHub Actions deployment workflow for GitHub Pages
│       └── release.yml         # GitHub Actions workflow for packaging macOS .dmg/.zip & publishing releases
├── electron/
│   ├── main.js                 # Electron main process (Window, IPC, autoUpdater, Settings persistence)
│   └── preload.js              # Secure IPC bridge exposing window.electronAPI
├── public/                     # Static assets (App icons, screenshots)
├── src/
│   ├── components/             # React UI components
│   │   ├── Titlebar.tsx        # Frameless macOS title bar & window controls
│   │   ├── Sidebar.tsx         # Watchlist sidebar (search, drag-and-drop reorder, right-click context menu, badge toggles)
│   │   ├── StockDetail.tsx     # Main asset overview, timeframe selector, key stats
│   │   ├── MobileDetailSheet.tsx # Slide-up mobile bottom sheet with swipe-down gesture dismiss
│   │   ├── StockChart.tsx      # SVG chart renderer with crosshairs & dynamic color gradients
│   │   ├── SearchModal.tsx     # Spotlight-style search modal (Cmd+K)
│   │   ├── DateRangePickerModal.tsx # Custom date range selector modal
│   │   └── StonksIcon.tsx      # App icon component
│   ├── hooks/
│   │   └── useMediaQuery.ts    # Custom window responsive breakpoint hook
│   ├── services/
│   │   └── yahooFinanceApi.ts  # Yahoo Finance API fetcher, sparklines, chart data transform
│   ├── types/
│   │   └── stock.ts            # TypeScript interfaces & window.electronAPI type definitions
│   ├── App.tsx                 # Core app state coordinator & global hotkeys
│   ├── index.css               # Design system tokens, glassmorphism, macOS styling
│   ├── main.tsx                # React DOM render root
│   └── index.html
├── LICENSE                     # MIT Open Source License
└── package.json                # Project dependencies, dev scripts, electron-builder config
```

### Key Architectural Layers

1. **Electron Main Process (`electron/main.js`)**:
   - Spawns main application `BrowserWindow` with `hiddenInset` titlebar styling, active vibrancy, and `#0E0E10` background.
   - Manages native settings stored in `userData/settings.json`.
   - Handles IPC listeners:
     - `window-close`, `window-minimize`, `window-maximize`
     - `get-settings`, `save-settings`
     - `fetch-stock-api` (bypasses CORS in main process with `webSecurity: true`)

2. **IPC Preload Bridge (`electron/preload.js`)**:
   - Exposes safe, context-isolated APIs to the renderer process via `window.electronAPI`.

3. **React State Coordinator (`src/App.tsx`)**:
   - Manages global state: `watchlistSymbols`, `selectedSymbol`, `selectedTimeframe`, `badgeDisplayMode`, `isSidebarOpen`, `isRefreshing`, and `isLoadingChart`.
   - Automatically synchronizes watchlist, badge mode, and active symbol with browser `localStorage` (`mac_stock_app_watchlist`, `mac_stock_app_badge_mode`, `mac_stock_app_selected_symbol`) and native `electronAPI.saveSettings()`.
   - Registers global keyboard shortcuts (e.g., `Cmd + K` or `Ctrl + K` to trigger search).
   - Runs a 30-second background polling interval to auto-refresh live quotes and chart data.

4. **Data Service (`src/services/yahooFinanceApi.ts`)**:
   - Queries Yahoo Finance endpoints for quotes, historical candles, and sparklines via Electron main IPC (desktop) or CORS proxies (`corsproxy.io`, `api.allorigins.win`) for web browser deployment.
   - Enables `includePrePost=true` on the `1D` timeframe to fetch pre-market and post-market (after-hours) stock prices, categorizing data points into `pre`, `regular`, and `post` sessions.
   - Maintains an in-memory 30-second TTL cache for stock data requests to enable instant ticker switching without loading flicker.
   - Calculates percentage gains/losses, sparklines, and maps timeframes (`1D`, `1W`, `1M`, `3M`, `6M`, `YTD`, `1Y`, `5Y`, `ALL`, `CUSTOM`).
   - Defers detailed stat queries (Market Cap & P/E from Nasdaq endpoints) using the `includeDetails` parameter so background watchlist loads only fetch single chart requests, drastically reducing network requests and bypassing web CORS proxy rate limits.

---

## 🛠 Common Development Workflows & Commands

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Run Desktop App in Development Mode (Recommended)
```bash
npm run electron:dev
```
*Launches Vite dev server on port 3000 and connects Electron with hot reloading.*

### Run Web App in Browser Only
```bash
npm run dev
```
*Runs frontend only at `http://localhost:3000` (useful for fast UI tweaking without Electron process).*

### Clean Build Artifacts
```bash
npm run clean
```
*Removes previous build directories (`dist/` and `dist_electron/`). Automatically called before builds.*

### Type Check & Build Web / GitHub Pages Distribution
```bash
npm run build
```
*Builds static web distribution assets into `dist/` with relative base path (`base: './'`).*

### Run Unit Tests
```bash
npm run test
```
*Runs unit test suite with Vitest and `@testing-library/react` to verify market status and UI component attributes.*

### Deploy to GitHub Pages
```bash
npm run deploy
```
*Builds production web bundle and deploys `dist/` folder to GitHub Pages (`gh-pages` branch). Automated CI deployment also runs via `.github/workflows/deploy.yml` on push to `main`.*

### Package Standalone Desktop Application (macOS)
```bash
npm run electron:build
```
*Cleans previous build files (`dist/`, `dist_electron/`), builds web distribution, and packages standalone macOS `.dmg` and `.zip` applications into `dist_electron/`.*

---

## 🎨 Design System & Styling Rules

- **Theme Palette**:
  - Background Base: `#0E0E10` / `#000000`
  - Cards & Sidebar: `#1C1C1E` / `#161618`
  - Borders: `#2C2C2E` / `rgba(255, 255, 255, 0.08)`
  - Positive Gain (Green): `#30D158` (Glow: `rgba(48, 209, 88, 0.25)`)
  - Negative Dip (Red): `#FF453A` (Glow: `rgba(255, 69, 58, 0.25)`)
  - Accent / Selection: `#0A84FF` / `#2C2C2E`
- **Typography**: System font stack (`-apple-system`, `BlinkMacSystemFont`, `SF Pro Display`, `Inter`, `sans-serif`).
- **macOS Design Principles**: Rounded cards (`12px` to `16px`), glassmorphism backdrop blurs, subtle glowing gradients on stock charts, traffic light window controls.

---

## 🚀 How to Add New Features

### 1. Adding a New Component
- Create the file in `src/components/YourComponent.tsx`.
- Define prop types clearly with TypeScript interfaces.
- Import and use Lucide icons from `lucide-react`.
- Maintain standard dark-mode CSS classes or add reusable utility styles in `src/index.css`.

### 2. Adding a New IPC Channel (Main Process ↔ Renderer)
- Define the channel name and handler in `electron/main.js`:
  ```js
  ipcMain.handle('your-channel-name', async (event, arg) => { ... });
  ```
- Expose the method signature in `electron/preload.js`:
  ```js
  yourMethodName: (arg) => ipcRenderer.invoke('your-channel-name', arg),
  ```
- Declare the method in the global `ElectronAPI` interface in `src/types/stock.ts`:
  ```ts
  export interface ElectronAPI {
    ...
    yourMethodName?: (arg: any) => Promise<any>;
  }
  ```

### 3. Adding New Stock Data Fields or API Endpoints
- Update data model interfaces in `src/types/stock.ts` (`StockQuote`, `ChartDataPoint`, etc.).
- Update API fetching and transformation functions in `src/services/yahooFinanceApi.ts`.
- Ensure fallbacks exist when market data is offline or missing (`isOffline: true`).

---

## 🏷 Version Bumping & Release Workflow

When preparing a new release or bumping the application version (e.g., `1.0.3` $\rightarrow$ `1.0.4`), follow this exact step-by-step workflow:

### 1. Update Version in Core Files
- **`package.json`**: Update `"version": "X.Y.Z"`.
- **`package-lock.json`**: Update `"version": "X.Y.Z"` in root and `packages[""]`.
- **`README.md`**: Update version strings (e.g., `dist_electron/Stonks-X.Y.Z-arm64.dmg`) and append image cache buster (e.g., `public/icon.png?v=X.Y.Z`).

### 2. Verify Tests & Local Builds
Run verification commands before committing:
```bash
npm run test
npm run build
npm run electron:build
```

### 3. Commit & Tag Creation Rules
> [!IMPORTANT]
> **Strict Tag Target Rule**:
> The git tag `vX.Y.Z` **MUST** point directly to the version bump commit (`bump version to X.Y.Z`). It must **NOT** be attached to later feature commits.

- **Step 3a — Commit version bump**:
  ```bash
  git add package.json package-lock.json README.md
  git commit -m "bump version to X.Y.Z"
  git push origin main
  ```
- **Step 3b — Create and push tag on the version bump commit**:
  - If tagging immediately on the bump commit:
    ```bash
    git tag vX.Y.Z
    git push origin vX.Y.Z
    ```
  - If tagging after subsequent commits exist on `main`, explicitly target the version bump commit hash:
    ```bash
    git tag vX.Y.Z <bump-commit-hash>
    git push origin vX.Y.Z
    ```

### 4. GitHub Release Trigger
Pushing the `vX.Y.Z` tag automatically triggers `.github/workflows/release.yml`, which compiles standalone macOS `.dmg` and `.zip` distribution packages and creates a GitHub Release.

---

## 📝 Guidelines for Updating Documentation (`AGENTS.md` & `README.md`)

**IMPORTANT FOR AI AGENTS & DEVELOPERS:**
Whenever you modify the codebase architecture, add new dependencies, implement new IPC channels, or add user-facing features, update documentation as follows:

1. **`AGENTS.md`**: Update architecture, codebase map, IPC methods, and developer workflows.
2. **`README.md`**: Focus exclusively on application overview, features, usage, prerequisites, running/building scripts, license, and disclaimers (keep file structure details in `AGENTS.md`).
3. **New Scripts / Dependencies**: Update the package scripts table and tech stack lists in both files.
4. **UI or Aesthetic Changes**: Update screenshots (`public/screenshot.png`) if the visual layout changes significantly.

---

## 🛑 Strict Git Workflow Rule for AI Agents

> [!CRITICAL]
> **NO AUTOMATED COMMITS OR PUSHES**
> AI Agents working in this repository must **NEVER** execute `git commit` or `git push`.
> All file edits and updates must be left staged or uncommitted in the local working tree so the developer can review, write custom commit messages, and push manually.

