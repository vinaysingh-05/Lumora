<div align="center">

# ✨ Lumora

### Your Browser. Your Space. Your Style.

**Transform every new tab into a personalized glass workspace.**

A beautiful Chrome New Tab experience featuring immersive wallpapers,
frosted-glass UI, customizable widgets, and a flexible workspace.

<br/>

<p>
  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=600&size=25&duration=3000&pause=900&color=8B9CFF&center=true&vCenter=true&width=600&lines=Your+Space%2C+Your+Rules.;Personalize+Every+Pixel.;A+New+Perspective+on+Browsing.;Welcome+to+Lumora+%E2%9C%A8" alt="Lumora animated tagline" />
</p>

<br/>

<img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Extension"/>
<img src="https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge" alt="Manifest V3"/>
<img src="https://img.shields.io/badge/UI-Glassmorphism-8B9CFF?style=for-the-badge" alt="Glassmorphism"/>
<img src="https://img.shields.io/badge/Mode-Offline--First-00A884?style=for-the-badge" alt="Offline First"/>

<br/><br/>

**A workspace that feels like an extension of your wallpaper.**

[Features](#-features) ·
[Installation](#-installation) ·
[Widgets](#-widget-ecosystem) ·
[Architecture](#-project-architecture) ·
[Roadmap](#-roadmap)

</div>

---

## 🌌 About Lumora

Lumora is a personalized Chrome New Tab extension designed to
make your browsing environment feel uniquely yours.

Instead of a conventional browser start page, Lumora creates a
wallpaper-first workspace where translucent glass components,
useful widgets, and smooth interactions come together.

Customize your environment, organize your favorite tools, and
create a workspace that reflects your personality.

### ✨ The Vision

- 🖼️ **Your Wallpaper:** Make your favorite images the centerpiece.
- 🪟 **Your Glass UI:** Customize transparency, blur, and appearance.
- 🧩 **Your Widgets:** Arrange useful components around your screen.
- 🎨 **Your Layout:** Move, resize, lock, and personalize components.
- 💾 **Your Workspace:** Preserve supported settings and layouts locally.

> Lumora isn't just a new tab. It's your personal space on the web.

---

## 🎬 Experience Lumora

<div align="center">

### A Little More You. Every Time You Open a Tab.

<img src="https://placehold.co/1200x650/10131f/9daaff?text=LUMORA%0A%0ACustom+New+Tab+Preview" alt="Lumora workspace preview placeholder" width="100%"/>

*Replace this placeholder with an actual screenshot or GIF of Lumora.*

</div>

### 💫 Designed to Feel Alive

Lumora's visual direction combines:

| Element | Experience |
|---|---|
| 🌌 Immersive wallpapers | A background that defines your workspace |
| 🪟 Frosted glass | Translucent panels with adjustable appearance |
| ✨ Fluid interactions | Smooth widget movement and transitions |
| 🎯 Flexible positioning | Arrange components to suit your workflow |
| 🌗 Visual customization | Personalize the appearance of your workspace |

---

## 🚀 Features

### 🖼️ 1. Immersive Wallpaper Engine

Your wallpaper is the foundation of your workspace.

- Upload custom wallpaper images.
- Persist supported image data using IndexedDB.
- Adjust blur and brightness.
- Control background dimming.
- Keep your wallpaper visible behind glass components.
- Restore saved wallpaper settings when reopening the page.

### 🔎 2. Google Search Hub

Search the web directly from your personalized workspace.

- Submit Google search queries.
- Open destination URLs where supported.
- Use `/` as a search-focus shortcut.
- Enjoy a clean, keyboard-friendly search interface.

### 🧩 3. Customizable Widget System

Create a workspace that fits your preferences.

- Add and remove widgets.
- Drag components around the workspace.
- Resize widgets using multiple handles.
- Lock widgets to prevent accidental movement.
- Duplicate widgets.
- Control stacking order.
- Use grid snapping for alignment.

### 🎨 4. Glass Appearance Controls

Fine-tune the interface to complement your wallpaper.

- Glass opacity.
- Blur intensity.
- Border luminance.
- Shadow depth.
- Corner radius.

### ↩️ 5. Undo & Redo

Experiment with your layout more confidently.

- Undo supported workspace changes.
- Redo reverted changes.
- Use `Ctrl + Z` and `Ctrl + Y` where implemented.
- Recover from accidental widget rearrangements.

### 💾 6. Local-First Experience

Lumora is designed to keep core workspace functionality local.

- Persist supported settings.
- Save widget configurations.
- Retain notes and task data.
- Store larger wallpaper assets using IndexedDB.
- Avoid unnecessary external dependencies.

---

## 🧩 Widget Ecosystem

Lumora's workspace brings together useful components for everyday browsing.

| Widget | Description |
|---|---|
| 🕒 Clock | Digital clock with configurable time format |
| 📅 Calendar Date | A compact date display |
| 🔗 Quick Shortcuts | Access favorite websites quickly |
| 📝 Quick Notes | Keep useful notes close at hand |
| ✅ To-do List | Track tasks and completion status |
| 🌐 Active Tabs | View and switch between open Chrome tabs |
| ⭐ Bookmarks | Access saved browser bookmarks |
| 👤 Profile Card | Personalize your workspace identity |
| 💬 Custom Text / Quote | Display text in your preferred style |
| 🖼️ Image Frame | Add custom images to your workspace |

*Widget availability depends on the implementation in your current build.*

---

## 🛠️ Installation

Lumora can be installed locally in Google Chrome using Developer Mode.

### Prerequisites

- Google Chrome.
- The Lumora project files.
- A valid `manifest.json` in the extension's root directory.

**Node.js and npm are not required for the current plain HTML, CSS,
and JavaScript build.**

### Step 1 — Get the Project

Download or clone the project and extract it into a local folder.

Example:

```text
lumora/
├── manifest.json
├── newtab.html
├── README.md
├── assets/
├── css/
├── js/
└── widgets/