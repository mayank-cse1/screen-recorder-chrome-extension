# Basic Chrome Extension

This is a basic Chrome extension created for learning purposes.

## Features

- Displays a popup with "Hello World" and a clickable button.
- Clicking the button shows an alert.

## How to Load the Extension

1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked" and select this folder (`/workspaces/screen-recorder-chrome-extension`).
4. The extension should now be loaded. You can see its icon in the extensions bar.
5. Click the extension icon to open the popup.

## Structure

- `manifest.json`: Defines the extension's metadata and behavior.
- `popup.html`: The HTML for the popup window.
- `popup.js`: JavaScript for the popup functionality.

## Next Steps

To expand this extension, you can:
- Add more features to the popup.
- Include content scripts to interact with web pages.
- Add background scripts for persistent functionality.
- Add permissions for APIs like storage or tabs.