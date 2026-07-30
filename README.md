<p align="center">
  <img src="public/icon.png" width="128" height="128" alt="Stonks Logo" style="border-radius: 28px;" />
</p>

<h1 align="center">Stonks</h1>

<p align="center">
  <strong>A native macOS-inspired stock tracking & financial analytics desktop application.</strong>
</p>

<p align="center">
  <a href="https://orangechuice.github.io/stonks-app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐_TRY_LIVE_WEB_APP-CLICK_HERE_TO_LAUNCH-0A84FF?style=for-the-badge&logo=github&logoColor=white&labelColor=000000" height="40" alt="Try Live Web Application" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-29.1.5-47A248?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.1.6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <a href="https://ko-fi.com/orangechuice" target="_blank"><img src="https://img.shields.io/badge/Support%20me%20on-Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Support me on Ko-fi" /></a>
</p>

---

## 📸 Overview

**Stonks** delivers a sleek, responsive, and native desktop stock monitoring experience built with Electron, React, TypeScript, and Vite. Designed specifically with macOS design principles in mind, it provides real-time market quotes, detailed interactive charts, customizable watchlist drag-and-drop ordering, and key stock metrics.

<p align="center">
  <img src="public/screenshot.png" width="100%" alt="Stonks Application Screenshot" />
</p>

> [!IMPORTANT]
> **💻 Native macOS Application is Recommended!!**
> While a live web version is hosted on [GitHub Pages](https://orangechuice.github.io/stonks-app/), web browsers block direct cross-origin requests to financial data APIs, requiring web traffic to route through public CORS proxies (`corsproxy.io`, `allorigins.win`). Heavy web traffic or frequent timeframe switching can occasionally hit public CORS proxy rate limits (`HTTP 429`).
> 
> **For the fastest, unthrottled experience with 100% data reliability, run the native macOS application (`npm run electron:dev` or packaged `.dmg`)**, which executes requests natively via Electron's background IPC process without CORS proxy throttling!

---

## ✨ Features

- ** Native macOS Experience**: Built with a sleek dark-mode palette (`#0E0E10`), frameless inset title bar with traffic light window controls, and smooth background translucency.
- **📊 Interactive Stock Charts**: View market trends across flexible timeframes (`1D`, `1W`, `1M`, `3M`, `6M`, `YTD`, `1Y`, `5Y`, `ALL`, `CUSTOM`) complete with dynamic SVG line gradients, range axes, hover tooltips, price crosshairs, and custom start/end date range selection.
- **📅 Custom Date Ranges**: Select any custom start and end date (including single full trading days or multi-day periods) to calculate price changes and render custom charts.
- **🟢 Dynamic Color Indicators**: Visual feedback that dynamically adapts gradient overlays and badge highlights—emerald green (`#30D158`) for gains and ruby red (`#FF453A`) for market dips.
- **⚡ Live Market Quotes & Key Statistics**: Fetches realtime data via Yahoo Finance API including current price, daily change, high/low bounds, volume, 52-week ranges, market cap, and P/E ratios.
- **🌙 After-Hours & Pre-Market Tracking**: Displays extended market hours moves on the 1D setting similar to the Apple Stock app, complete with dual "At Close" and "After Hours" / "Pre-Market" header quotes, session boundary indicators, and dashed line chart segments.
- **⚡ 30-Second TTL Caching & Auto-Refresh**: Instantaneous ticker switching with 30s in-memory response caching and automated 30s background polling for live quotes.
- **🗂 Watchlist Management & Context Menu**: Add, reorder (drag & drop), and right-click any ticker in the sidebar to open a native macOS context menu for easy removal or quick viewing. Default watchlist features the top 3 US indexes and top 5 US stock market tickers.
- **🏷 Multi-Mode Watchlist Badges**: Click any watchlist badge to toggle between displaying **Percentage Change** (`-1.86%`), **Price Change** (`-$7.41`), or **Market Capitalization** (`$3.08T`).
- **⌨ Keyboard Shortcuts**: Press `Cmd + K` (or `Ctrl + K`) to immediately open the ticker search modal anywhere in the app.

---

## 🛠 How It Works

Stonks combines a modern React web frontend with an Electron desktop wrapper for low latency, native system integration, and persistent local storage.

```
┌──────────────────────────────────────────────────────────┐
│                      Stonks App                          │
├────────────────────────────┬─────────────────────────────┤
│   Electron Main Process    │   React Frontend (Vite)     │
│  - Window Management       │  - Sidebar & Watchlist      │
│  - IPC Settings Handler    │  - Interactive Stock Chart  │
│  - Dock Icon & Native Menu │  - Market Statistics        │
└──────────────┬─────────────┴──────────────┬──────────────┘
               │                            │
               ▼                            ▼
      settings.json                 Yahoo Finance API
```

1. **Main Process (`electron/main.js`)**: Manages the lifecycle of the desktop application, initializes the `BrowserWindow` with native macOS `hiddenInset` titlebar styling, and registers IPC main handlers for settings persistence (`get-settings`, `save-settings`), window controls, and CORS-bypassing stock API fetching (`fetch-stock-api`).
2. **Preload Script (`electron/preload.js`)**: Safely exposes IPC communication methods to the frontend application using Electron's `contextBridge`, preserving `contextIsolation`.
3. **Frontend Application (`src/`)**:
   - **`App.tsx`**: State coordinator managing watchlist state, active symbol, selected timeframe, and background data synchronization.
   - **`Sidebar.tsx`**: Manages interactive ticker search, badge display mode toggles, and drag-and-drop item reordering.
   - **`StockChart.tsx`**: Renders custom SVG chart representations with responsive path scaling, dynamic color gradients, crosshair tracking, and time labels.
   - **`StockDetail.tsx`**: Displays detailed header information, timeframe selectors, interactive chart container, and key financial statistics cards.
   - **`yahooFinanceApi.ts`**: Handles network communication, response parsing, sparkline calculations, and query fallbacks.

---

## 🚀 Getting Started

### 📦 Pre-built macOS Releases (GitHub Releases)

If you download the pre-compiled `.dmg` or `.app` from [GitHub Releases](https://github.com/orangechuice/stonks-app/releases):

> [!NOTE]
> **macOS Security / "App is Damaged" Warning**
> Because this project does not currently use an official Apple Developer account, downloaded release binaries are unnotarized by Apple. macOS Gatekeeper automatically assigns downloaded files a `com.apple.quarantine` attribute, which causes macOS to report that the app is *"damaged and can't be opened"*.

To launch the downloaded release:
- **Option 1 — Clear quarantine on the downloaded `.dmg` (Before installing):**
  ```bash
  xattr -d com.apple.quarantine ~/Downloads/Stonks*.dmg
  ```
- **Option 2 — Clear quarantine on `Stonks.app` (After installing to `/Applications`):**
  ```bash
  xattr -d com.apple.quarantine /Applications/Stonks.app
  ```
- **Option 3 — Open via Finder (No Terminal required):**
  Control-click (Right-click) `Stonks.app` in Finder $\rightarrow$ select **Open** $\rightarrow$ click **Open** in the prompt.

---

### 💻 Local Development & Building

#### 1. Prerequisites
Ensure you have **Node.js** (v18.0 or higher) and **npm** installed:
```bash
node -v
npm -v
```

#### 2. Download & Installation
Clone the repository and install project dependencies:
```bash
git clone https://github.com/orangechuice/stonks-app.git
cd stonks-app
npm install
```

#### 3. Running Locally (Development Mode)
- **Desktop Application (Recommended)**: Runs Vite dev server and launches the native Electron desktop app with hot-reloading:
  ```bash
  npm run electron:dev
  ```
- **Web App Only**: Runs the frontend in your browser at `http://localhost:3000`:
  ```bash
  npm run dev
  ```

#### 4. Packaging the Desktop App (.dmg / .zip)
To compile the TypeScript project and package your own native macOS `.dmg` installer and `.zip` archive locally:
```bash
npm run electron:build
```
The packaged installers will be placed in the `dist_electron/` directory (e.g. `dist_electron/Stonks-1.0.2-arm64.dmg`).

> [!TIP]
> **Why Local Builds Work Instantly**
> Binaries built locally on your machine are NOT tagged with macOS `com.apple.quarantine`, so your locally generated `.dmg` in `dist_electron/` will open and run immediately without Gatekeeper security warnings.

#### 5. Building & Deploying Web Version
- **Build Web Bundle**: `npm run build` (outputs to `dist/`)
- **Preview Web Bundle**: `npm run preview`
- **Deploy to GitHub Pages**: `npm run deploy`

---

## 📜 All Package Scripts Reference

| Script | Command | Description |
| :--- | :--- | :--- |
| **Electron Dev Mode** | `npm run electron:dev` | Launches Vite dev server and runs the Electron app simultaneously with hot-reloading. |
| **Web Dev Mode** | `npm run dev` | Runs the web app independently in your browser at `http://localhost:3000`. |
| **Clean Artifacts** | `npm run clean` | Cleans old build output folders (`dist/` and `dist_electron/`). |
| **Build Web Bundle** | `npm run build` | Cleans previous build files, compiles TypeScript, and builds production static site in `dist/` for GitHub Pages hosting. |
| **Deploy to GitHub Pages** | `npm run deploy` | Builds production web bundle and deploys `dist/` to GitHub Pages (`gh-pages` branch). |
| **Build Desktop App** | `npm run electron:build` | Cleans previous build files (`dist/`, `dist_electron/`), compiles TypeScript, and packages standalone macOS binary artifacts (`.dmg`, `.zip`) inside `dist_electron/`. |

---

## ☕ Support

If you enjoy using **Stonks**, consider supporting development on Ko-fi!

[![Support me on Ko-fi](https://img.shields.io/badge/Support%20me%20on-Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/orangechuice)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## ⚖️ Legal & Financial Data Disclaimer

**Stonks** is an open-source software project built solely for educational, research, and personal monitoring purposes.
- Financial data and stock market quotes rendered by this application are sourced from unofficial public endpoints.
- This application is **not** intended to provide financial, investment, legal, or tax advice.
- No warranty or guarantee is provided regarding the accuracy, completeness, or timeliness of market data.

