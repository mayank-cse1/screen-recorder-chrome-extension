let port;

document.getElementById('start').addEventListener('click', startRecording);
document.getElementById('stop').addEventListener('click', stopRecording);

async function startRecording() {
  try {
    // Request screen capture
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: { ideal: 3840 }, height: { ideal: 2160 } },
      audio: true
    });
    // Request camera and mic
    const camMicStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: true
    });

    port = chrome.runtime.connect({ name: 'recording-port' });
    port.postMessage({ type: 'start-recording', streams: [screenStream, camMicStream] }, [screenStream, camMicStream]);

    port.onMessage.addListener((message) => {
      if (message.type === 'recording-started') {
        document.getElementById('start').disabled = true;
        document.getElementById('stop').disabled = false;
      } else if (message.type === 'recording-stopped') {
        document.getElementById('start').disabled = false;
        document.getElementById('stop').disabled = true;
      }
    });
  } catch (e) {
    alert('Error starting recording: ' + e.message);
  }
}

function stopRecording() {
  if (port) {
    port.postMessage({ type: 'stop-recording' });
  }
}