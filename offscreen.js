let canvas, ctx, screenVideo, camVideo, recorder, screenStream, camMicStream;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'offscreen-port') {
    console.log('Offscreen port connected');
    port.onMessage.addListener(async (message) => {
      console.log('Offscreen received message:', message.type);
      if (message.type === 'start-recording') {
        screenStream = new MediaStream(message.screenTracks);
        camMicStream = new MediaStream(message.camTracks);

        // Get screen dimensions
        const screenTrack = screenStream.getVideoTracks()[0];
        const settings = screenTrack.getSettings();
        const width = settings.width || 1920;
        const height = settings.height || 1080;

        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        screenVideo = document.createElement('video');
        screenVideo.srcObject = screenStream;
        screenVideo.muted = true; // Avoid feedback
        screenVideo.play();

        camVideo = document.createElement('video');
        camVideo.srcObject = camMicStream;
        camVideo.muted = true;
        camVideo.play();

        // Wait for videos to load
        await Promise.all([
          new Promise(resolve => screenVideo.onloadedmetadata = resolve),
          new Promise(resolve => camVideo.onloadedmetadata = resolve)
        ]);

        function draw() {
          // Draw screen
          ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
          // Draw camera in bottom right corner
          const camWidth = Math.min(320, canvas.width / 4);
          const camHeight = camWidth * (camVideo.videoHeight / camVideo.videoWidth);
          ctx.drawImage(camVideo, canvas.width - camWidth - 10, canvas.height - camHeight - 10, camWidth, camHeight);
          requestAnimationFrame(draw);
        }
        draw();

        const canvasStream = canvas.captureStream(30);

        // Add audio tracks
        const audioTracks = [...screenStream.getAudioTracks(), ...camMicStream.getAudioTracks()];
        audioTracks.forEach(track => canvasStream.addTrack(track));

        recorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm;codecs=vp9' });
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          chrome.downloads.download({ url, filename: 'recording.webm' });
          // Clean up
          canvasStream.getTracks().forEach(track => track.stop());
        };
        recorder.start();
        port.postMessage({ type: 'recording-started' });
      } else if (message.type === 'stop-recording') {
        if (recorder) {
          recorder.stop();
        }
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
        }
        if (camMicStream) {
          camMicStream.getTracks().forEach(track => track.stop());
        }
        port.postMessage({ type: 'recording-stopped' });
      }
    });
  }
});