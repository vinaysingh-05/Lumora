# Glass Workspace — Chrome Extension (Manifest V3)

A customizable Google Chrome New Tab extension featuring glassmorphic components, fluid drag-and-drop widgets, and persistent local wallpaper management.

## Installation Instructions (Load Unpacked)

1. Clone or download this project repository onto your computer.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Toggle the **Developer mode** switch in the top-right corner to **ON**.
4. Click the **Load unpacked** button in the top-left toolbar.
5. Select the root directory containing `manifest.json`.
6. Open a new tab in Chrome (`Ctrl+T` or `Cmd+T`). Glass Workspace is now active.

---

## Features Implemented

1. **Custom New Tab Overhaul**: Fullscreen glassmorphic workspace via `chrome_url_overrides`.
2. **Wallpaper Engine**:
   - IndexedDB binary image store ensuring multi-megabyte wallpapers persist after browser restarts.
   - Live CSS tuning controls: Blur, Brightness, and Overlay Dimming.
3. **Google Search Hub**:
   - Direct search query submission to Google.
   - Instant hotkey focus (press `/`).
   - Direct web URL navigation support.
4. **10 Production-Ready Widgets**:
   - `Clock`: Configurable 12h/24h digital clock.
   - `Calendar Date`: Prominent month/day badge.
   - `Quick Shortcuts`: Speed dial tiles.
   - `Quick Notes`: Auto-saving scratchpad note.
   - `To-do List`: Task tracking with checkbox toggles and deletions.
   - `Active Tabs`: Real-time view of current Chrome tabs with one-click focus switching and tab closures.
   - `Bookmarks`: Direct integration with Chrome's Bookmarks API.
   - `Profile Card`: Avatar, user title, and status card.
   - `Custom Text / Quote`: Formatted typography block.
   - `Image Frame`: Custom image display card.
5. **Interactive Canvas Operations**:
   - Smooth pointer-based drag & drop with boundary clamping.
   - 8-point multi-edge/corner widget resizing.
   - Snap-to-grid alignment (20px).
   - Dynamic stacking index (`z-index`) manipulation.
   - Lock/Unlock widget toggles.
   - Single-click widget duplication.
6. **Undo & Redo Engine**: Full history recording stack accessible via toolbar or `Ctrl+Z` / `Ctrl+Y`.
7. **Appearance System**: Dynamic CSS custom property modification for glass blur, opacity, border luminance, shadow depth, and corner radius.
8. **Security & Offline-First Design**: Zero CDN dependencies, clean DOM rendering preventing XSS vulnerabilities, and compliance with Manifest V3 restrictions.

---

## Chrome Permissions Declared

- `storage`: Persists widget arrangements, notes, task states, and appearance preferences.
- `tabs`: Enables the Active Tabs widget to query and switch between running browser tabs.
- `bookmarks`: Populates real user bookmarks in the Bookmarks widget.

---

## Known Browser Limitations

- Chrome does not permit extensions to alter native OS title bars, the top address bar (Omnibox), or browser tab strips to transparent glass. The interface operates entirely within the New Tab document canvas.