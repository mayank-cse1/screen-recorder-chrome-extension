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

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'start-recording') {
    console.log('Background: Received start-recording');
    ensureOffscreen().then(() => {
      console.log('Background: Sending start-recording to offscreen');
      chrome.runtime.sendMessage({ type: 'start-recording' });
    });
  }
  if (message.type === 'stop-recording') {
    console.log('Background: Received stop-recording');
    chrome.runtime.sendMessage({ type: 'stop-recording' });
  }
  if (message.type === 'log') {
    console.log('Background: Log from offscreen:', message.message);
  }
  if (message.type === 'pong') {
    // handled in ensureOffscreen
  }
});