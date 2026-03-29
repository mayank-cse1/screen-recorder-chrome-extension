chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'recording-port') {
    // Check if offscreen document exists
    chrome.offscreen.hasDocument().then(async (hasDocument) => {
      if (!hasDocument) {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['USER_MEDIA'],
          justification: 'Recording screen and camera with audio'
        });
        // Wait a bit for the document to load
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      // Connect to offscreen
      const offscreenPort = chrome.runtime.connect({ name: 'offscreen-port' });
      // Forward messages
      port.onMessage.addListener((message) => {
        offscreenPort.postMessage(message);
      });
      offscreenPort.onMessage.addListener((message) => {
        port.postMessage(message);
      });
    });
  }
});