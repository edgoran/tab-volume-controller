# Levels - Tab Volume Mixer

A Chrome extension that lets you control the volume of individual browser tabs independently, like a mixing desk for your browser.

![Chrome Extension](https://img.shields.io/badge/Platform-Chrome-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- **Per-tab volume control** — adjust the volume of each tab independently
- **Mute toggle** — mute individual tabs with one click
- **Volume boost** — boost volume up to 200% or 1000% for quiet audio
- **Site presets** — automatically remember volume levels per website
- **Persistent settings** — volume levels survive page refreshes and browser restarts
- **Dark/light theme** — automatically matches your system theme
- **Minimal UI** — clean, native Chrome look and feel

## Accessibility
- ARIA labels on all interactive elements
- Full keyboard navigation support
- Focus indicators for keyboard users
- Respects prefers-reduced-motion for users with vestibular disorders
- WCAG AA colour contrast compliance in both themes

## Browser Compatibility
- Google Chrome 110+
- Chromium-based browsers (Edge, Brave, etc.)

## Developers
1. Clone this repository:
   ```bash
   git clone https://github.com/edgoran/tab-volume-controller.git
2. Open Chrome and navigate to chrome://extensions/
3. Enable Developer mode (toggle in the top-right corner)
4. Click "Load unpacked"
5. Select the levels-tab-volume-mixer folder
6. Pin the extension by clicking the puzzle piece icon in the toolbar and clicking the pin next to "Levels"

## MIT License

Copyright (c) 2026 Edward Goran

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

