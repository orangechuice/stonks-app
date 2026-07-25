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
├── electron/
│   ├── main.js                 # Electron main process (Window, IPC, Settings persistence)
│   └── preload.js              # Secure IPC bridge exposing window.electronAPI
├── public/                     # Static assets (App icons, screenshots)
├── src/
│   ├── components/             # React UI components
│   │   ├── Titlebar.tsx        # Frameless macOS title bar & window controls
│   │   ├── Sidebar.tsx         # Watchlist sidebar (search, drag-and-drop reorder, right-click context menu, badge toggles)
│   │   ├── StockDetail.tsx     # Main asset overview, timeframe selector, key stats
│   │   ├── StockChart.tsx      # SVG chart renderer with crosshairs & dynamic color gradients
│   │   ├── SearchModal.tsx     # Spotlight-style search modal (Cmd+K)
│   │   └── StonksIcon.tsx      # App icon component
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
   - Automatically synchronizes watchlist settings with `localStorage` and native `electronAPI.saveSettings()`.
   - Registers global keyboard shortcuts (e.g., `Cmd + K` or `Ctrl + K` to trigger search).

4. **Data Service (`src/services/yahooFinanceApi.ts`)**:
   - Queries Yahoo Finance endpoints for quotes, historical candles, and sparklines.
   - Calculates percentage gains/losses, sparklines, and maps timeframes (`1D`, `1W`, `1M`, `3M`, `6M`, `YTD`, `1Y`, `5Y`, `ALL`).

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

### Type Check & Build Web Distribution
```bash
npm run build
```

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

## 📝 Guidelines for Updating Documentation (`AGENTS.md` & `README.md`)

**IMPORTANT FOR AI AGENTS & DEVELOPERS:**
Whenever you modify the codebase architecture, add new dependencies, implement new IPC channels, or add user-facing features, you **MUST** update both `AGENTS.md` and `README.md`:

1. **New Components or Files**: Add them to the Repository Structure section in both `AGENTS.md` and `README.md`.
2. **New IPC Methods**: Document the IPC handlers in the Architecture & Codebase Map section of `AGENTS.md`.
3. **New Scripts / Dependencies**: Update the package scripts table and tech stack lists in both files.
4. **UI or Aesthetic Changes**: Update screenshots (`public/screenshot.png`) if the visual layout changes significantly.
