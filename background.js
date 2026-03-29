chrome.runtime.onConnect.addListener((port) => {
  console.log('Background: Connection received, name:', port.name);
  if (port.name === 'recording-port') {
    console.log('Background: Checking offscreen document');
    // Check if offscreen document exists
    chrome.offscreen.hasDocument().then(async (hasDocument) => {
      console.log('Background: Offscreen exists:', hasDocument);
      if (!hasDocument) {
        console.log('Background: Creating offscreen document');
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['USER_MEDIA'],
          justification: 'Recording screen and camera with audio'
        });
        console.log('Background: Offscreen created, waiting 200ms');
        // Wait a bit for the document to load
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      console.log('Background: Connecting to offscreen');
      // Connect to offscreen
      const offscreenPort = chrome.runtime.connect({ name: 'offscreen-port' });
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