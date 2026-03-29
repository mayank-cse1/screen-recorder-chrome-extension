let canvas, ctx, screenVideo, camVideo, recorder, screenStream, camMicStream;

chrome.runtime.onConnect.addListener((port) => {
  console.log('Offscreen: Connection received, name:', port.name);
  if (port.name === 'offscreen-port') {
    console.log('Offscreen: Offscreen port connected');
    port.onMessage.addListener(async (message) => {
      console.log('Offscreen: Received message:', message.type);
      if (message.type === 'start-recording') {
        console.log('Offscreen: Starting recording, screen tracks:', message.screenTracks.length, 'cam tracks:', message.camTracks.length);
        screenStream = new MediaStream(message.screenTracks);
        camMicStream = new MediaStream(message.camTracks);

        // Get screen dimensions
        const screenTrack = screenStream.getVideoTracks()[0];
        const settings = screenTrack.getSettings();
        const width = settings.width || 1920;
        const height = settings.height || 1080;
        console.log('Offscreen: Canvas size:', width, 'x', height);

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

        console.log('Offscreen: Waiting for videos to load');
        // Wait for videos to load
        await Promise.all([
          new Promise(resolve => { screenVideo.onloadedmetadata = () => { console.log('Offscreen: Screen video loaded'); resolve(); }; }),
          new Promise(resolve => { camVideo.onloadedmetadata = () => { console.log('Offscreen: Cam video loaded'); resolve(); }; })
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
        console.log('Offscreen: Starting draw loop');
        draw();

        const canvasStream = canvas.captureStream(30);
        console.log('Offscreen: Canvas stream created');

        // Add audio tracks
        const audioTracks = [...screenStream.getAudioTracks(), ...camMicStream.getAudioTracks()];
        audioTracks.forEach(track => canvasStream.addTrack(track));
        console.log('Offscreen: Audio tracks added:', audioTracks.length);

        recorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm;codecs=vp9' });
        const chunks = [];
        recorder.ondataavailable = (e) => {
          console.log('Offscreen: Data available, size:', e.data.size);
          chunks.push(e.data);
        };
        recorder.onstop = () => {
          console.log('Offscreen: Recording stopped, chunks:', chunks.length);
          const blob = new Blob(chunks, { type: 'video/webm' });
          console.log('Offscreen: Blob created, size:', blob.size);
          const url = URL.createObjectURL(blob);
          chrome.downloads.download({ url, filename: 'recording.webm' });
          console.log('Offscreen: Download initiated');
          // Clean up
          canvasStream.getTracks().forEach(track => track.stop());
        };
        console.log('Offscreen: Starting MediaRecorder');
        recorder.start();
        console.log('Offscreen: Sending recording-started');
        port.postMessage({ type: 'recording-started' });
      } else if (message.type === 'stop-recording') {
        console.log('Offscreen: Stopping recording');
        if (recorder) {
          recorder.stop();
        }
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
        }
        if (camMicStream) {
          camMicStream.getTracks().forEach(track => track.stop());
        }
        console.log('Offscreen: Sending recording-stopped');
        port.postMessage({ type: 'recording-stopped' });
      }
    });
  }
});