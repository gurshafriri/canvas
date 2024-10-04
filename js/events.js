// events.js

import { startSound, stopSound, updateWaveform, updateGain, audioCtx } from './audio.js';
import { drawRoundedRect, clearCanvas } from './drawing.js';

let isDrawing = false;

function handleMouseMove(event, canvas, ctx) {
  if (!isDrawing) return;

  // Get the bounding box of the canvas
  const rect = canvas.getBoundingClientRect();

  // Initialize x and y coordinates
  let x, y;

  // Check if the event is a touch event
  if (event.touches && event.touches.length > 0) {
    // Touch event
    x = event.touches[0].clientX - rect.left;
    y = event.touches[0].clientY - rect.top;
  } else {
    // Mouse event
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  }

  // Clamp x and y between 0 and canvas dimensions
  x = Math.min(Math.max(0, x), canvas.width);
  y = Math.min(Math.max(0, y), canvas.height);

  // Clear the canvas
  clearCanvas(ctx, canvas);

  // Y-axis controls size of the shape
  const size = Math.max(10, y); // Minimum size of 10

  // Calculate the ratio of how far to the right the cursor is (0 = far left, 1 = far right)
  const xRatio = x / canvas.width;

  // Calculate the corner radius for the shape
  const maxRadius = size / 2;
  const radius = xRatio * maxRadius;

  // Draw the shape in the center of the canvas
  const centerX = (canvas.width - size) / 2;
  const centerY = (canvas.height - size) / 2;

  // Draw the shape (blended square/circle)
  drawRoundedRect(ctx, centerX, centerY, size, size, radius);

  // Update audio waveform and gain
  updateWaveform(xRatio);
  updateGain(y / canvas.height);
}

function setupEventListeners(canvas, ctx) {
  // Mouse events
  canvas.addEventListener('mousedown', function (event) {
    isDrawing = true;
    canvas.classList.add('pressed');

    startSound();
    handleMouseMove(event, canvas, ctx);
  });

  canvas.addEventListener('mousemove', function (event) {
    handleMouseMove(event, canvas, ctx);
  });

  window.addEventListener('mouseup', function () {
    isDrawing = false;
    canvas.classList.remove('pressed');

    stopSound();
  });

  window.addEventListener('mousemove', function (event) {
    handleMouseMove(event, canvas, ctx);
  });

  // Touch events
  canvas.addEventListener(
    'touchstart',
    function (event) {
      event.preventDefault(); // Prevent scrolling
      isDrawing = true;
      canvas.classList.add('pressed');

      if (audioCtx.state === 'suspended') {
      audioCtx.resume();
      }

      startSound();
      handleMouseMove(event, canvas, ctx);
    },
    { passive: false }
  );

  canvas.addEventListener(
    'touchmove',
    function (event) {
      event.preventDefault(); // Prevent scrolling
      handleMouseMove(event, canvas, ctx);
    },
    { passive: false }
  );

  window.addEventListener(
    'touchend',
    function () {
      isDrawing = false;
      canvas.classList.remove('pressed');

      stopSound();
    },
    { passive: false }
  );

  window.addEventListener(
    'touchmove',
    function (event) {
      handleMouseMove(event, canvas, ctx);
    },
    { passive: false }
  );
}

export { setupEventListeners };