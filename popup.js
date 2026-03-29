document.getElementById('start').addEventListener('click', startRecording);
document.getElementById('stop').addEventListener('click', stopRecording);

function startRecording() {
  console.log('Popup: Start recording clicked');
  console.log('Popup: Sending start-recording to background');
  chrome.runtime.sendMessage({ type: 'start-recording' });
  // Update UI immediately
  document.getElementById('start').disabled = true;
  document.getElementById('stop').disabled = false;
}

function stopRecording() {
  console.log('Popup: Stop recording clicked');
  console.log('Popup: Sending stop-recording to background');
  chrome.runtime.sendMessage({ type: 'stop-recording' });
  // Update UI
  document.getElementById('start').disabled = false;
  document.getElementById('stop').disabled = true;
}