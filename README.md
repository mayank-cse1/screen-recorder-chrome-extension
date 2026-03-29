# Screen Recorder Chrome Extension

This Chrome extension allows you to record your screen, camera, and microphone in high quality (up to 4K), similar to Cursorful. It overlays your camera feed on the screen recording.

## Features

- Record screen with system audio
- Record camera and microphone
- Overlay camera on screen recording
- Save recording as WebM file
- High resolution support (4K ideal)

## How to Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this folder
4. The extension should now be loaded

## How to Use

1. Click the extension icon in the toolbar
2. Click "Start Recording"
3. Grant permissions for screen, camera, and microphone when prompted
4. Select what to record (entire screen, window, or tab)
5. The recording will start with your camera overlaid in the bottom right
6. Click "Stop Recording" to finish and download the video

## Files

- `manifest.json`: Extension configuration and permissions
- `popup.html`: Popup interface
- `popup.js`: Handles user interactions and stream capture
- `background.js`: Service worker for managing offscreen recording
- `offscreen.html`: Offscreen document for recording
- `offscreen.js`: Recording logic with canvas compositing

## Permissions

- `activeTab`: Access current tab for screen capture
- `storage`: Store settings
- `offscreen`: Use offscreen documents for recording
- `downloads`: Download recorded video

Camera and microphone permissions are requested by the browser when you start recording.

## Notes

- For 4K recording, ensure your screen and hardware support it
- Camera overlay is positioned in bottom right corner
- Recording is saved as WebM format
- Audio from both system and microphone is included