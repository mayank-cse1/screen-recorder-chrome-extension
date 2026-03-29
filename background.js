let offscreenPort = null;

function ensureOffscreen() {
  return chrome.offscreen.hasDocument().then(async (hasDocument) => {
    console.log('Background: Offscreen exists:', hasDocument);
    if (!hasDocument) {
      console.log('Background: Creating offscreen document');
      await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL('offscreen.html'),
        reasons: ['USER_MEDIA'],
        justification: 'Recording screen and camera with audio'
      });
      console.log('Background: Offscreen created, waiting for ready');
      // Wait for offscreen to be ready
      return new Promise((resolve) => {
        const listener = (message, sender, sendResponse) => {
          if (message.type === 'pong') {
            console.log('Background: Received pong, offscreen ready');
            chrome.runtime.onMessage.removeListener(listener);
            resolve();
          }
        };
        chrome.runtime.onMessage.addListener(listener);
        chrome.runtime.sendMessage({ type: 'ping' });
      });
    }
  });
}

chrome.runtime.onConnect.addListener((port) => {
  console.log('Background: Connection received, name:', port.name);
  if (port.name === 'recording-port') {
    ensureOffscreen().then(() => {
      console.log('Background: Connecting to offscreen');
      offscreenPort = chrome.runtime.connect({ name: 'offscreen-port' });
      console.log('Background: Offscreen port created, setting up forwarding');
      // Forward messages
      port.onMessage.addListener((message) => {
        console.log('Background: Forwarding to offscreen:', message.type);
        offscreenPort.postMessage(message);
      });
      offscreenPort.onMessage.addListener((message) => {
        console.log('Background: Forwarding to popup:', message.type);
        port.postMessage(message);
      });
    });
  }
});

// Listen for log messages from offscreen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'log') {
    console.log('Background: Log from offscreen:', message.message);
  }
  if (message.type === 'pong') {
    // handled above
  }
});