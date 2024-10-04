// events.js

import { startSound, stopSound, updateWaveform, updateGain } from './audio.js';
import { drawRoundedRect, clearCanvas } from './drawing.js';

let isDrawing = false;

function handleMouseMove(event, canvas, ctx) {
  if (!isDrawing) return;

  // Get the bounding box of the canvas
  const rect = canvas.getBoundingClientRect();

  // Calculate mouse position relative to the canvas
  const x = Math.min(Math.max(0, event.clientX - rect.left), canvas.width);
  const y = Math.min(Math.max(0, event.clientY - rect.top), canvas.height);

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
}

export {
  setupEventListeners,
};