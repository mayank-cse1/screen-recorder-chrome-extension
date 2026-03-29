let port = null;

document.getElementById('start').addEventListener('click', startRecording);
document.getElementById('stop').addEventListener('click', stopRecording);

async function startRecording() {
  console.log('Popup: Start recording clicked');
  try {
    console.log('Popup: Requesting screen capture');
    // Request screen capture
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: { ideal: 3840 }, height: { ideal: 2160 } },
      audio: true
    });
    console.log('Popup: Screen capture granted, tracks:', screenStream.getTracks().length);

    console.log('Popup: Requesting camera and mic');
    // Request camera and mic
    const camMicStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: true
    });
    console.log('Popup: Camera/mic granted, tracks:', camMicStream.getTracks().length);

    console.log('Popup: Ensuring offscreen is ready');
    // Ensure offscreen is ready
    chrome.runtime.sendMessage({ type: 'create-offscreen' });
    // Wait for ready
    await new Promise((resolve) => {
      const listener = (message, sender, sendResponse) => {
        if (message.type === 'offscreen-ready') {
          console.log('Popup: Offscreen ready');
          chrome.runtime.onMessage.removeListener(listener);
          resolve();
        }
      };
      chrome.runtime.onMessage.addListener(listener);
    });

    console.log('Popup: Creating message channel');
    // Create message channel
    const channel = new MessageChannel();
    port = channel.port2;
    port.onmessage = (event) => {
      const message = event.data;
      console.log('Popup: Received message:', message.type);
      if (message.type === 'recording-started') {
        console.log('Popup: Recording started, updating UI');
        document.getElementById('start').disabled = true;
        document.getElementById('stop').disabled = false;
      } else if (message.type === 'recording-stopped') {
        console.log('Popup: Recording stopped, updating UI');
        document.getElementById('start').disabled = false;
        document.getElementById('stop').disabled = true;
      }
    };

    console.log('Popup: Sending port to offscreen');
    // Send port1 to offscreen
    chrome.runtime.sendMessage({ type: 'offscreen-port', port: channel.port1 }, [channel.port1]);

    console.log('Popup: Sending start-recording');
    // Send recording message
    port.postMessage({ type: 'start-recording', screenTracks: screenStream.getTracks(), camTracks: camMicStream.getTracks() }, screenStream.getTracks().concat(camMicStream.getTracks()));
  } catch (e) {
    console.error('Popup: Error starting recording:', e);
    if (e.name === 'NotAllowedError') {
      alert('Recording requires camera, microphone, and screen permissions. Please allow access when prompted.');
    } else {
      alert('Error starting recording: ' + e.message);
    }
  }
}

function stopRecording() {
  console.log('Popup: Stop recording clicked');
  if (port) {
    console.log('Popup: Sending stop-recording');
    port.postMessage({ type: 'stop-recording' });
  } else {
    console.log('Popup: No port available');
  }
}