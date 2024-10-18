// events.js

import { startSound, stopSound, updateWaveform, updateGain } from './audio.js';
import { drawRoundedRect, clearCanvas } from './drawing.js';

let isDrawing = false;
let startX = 0;
let startY = 0;
let startScrollX = 0;
let startScrollY = 0;

function handleMouseDown(event, canvas, ctx) {
    isDrawing = true;
    canvas.classList.add('pressed');

    startSound();

    // Get the bounding box of the canvas
    const rect = canvas.getBoundingClientRect();

    // Initialize x and y coordinates
    let x, y;

    if (event.touches && event.touches.length > 0) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }

    startX = x;
    startY = y;

    startScrollX = window.scrollX || window.pageXOffset;
    startScrollY = window.scrollY || window.pageYOffset;

    handleMouseMove(event, canvas, ctx);

    // Prevent default behavior
    event.preventDefault();
}

function handleMouseMove(event, canvas, ctx) {
    if (!isDrawing) return;

    // Get the bounding box of the canvas
    const rect = canvas.getBoundingClientRect();

    // Initialize x and y coordinates
    let x, y;

    if (event.touches && event.touches.length > 0) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else {
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

    // Navigation logic
    const deltaX = x - startX;
    const deltaY = y - startY;

    // Calculate the proportion
    const proportionX = deltaX / canvas.width;
    const proportionY = deltaY / canvas.height;

    // Calculate the new scroll positions
    const contentWidth = document.getElementById('canvas-container').scrollWidth - window.innerWidth;
    const contentHeight = document.getElementById('canvas-container').scrollHeight - window.innerHeight;

    // Corrected calculation (changed '-' to '+')
    let newScrollX = startScrollX + proportionX * contentWidth;
    let newScrollY = startScrollY + proportionY * contentHeight;

    // Clamp the scroll positions
    newScrollX = Math.max(0, Math.min(newScrollX, contentWidth));
    newScrollY = Math.max(0, Math.min(newScrollY, contentHeight));

    // Scroll to the new positions
    window.scrollTo(newScrollX, newScrollY);

    // Prevent default behavior
    event.preventDefault();
}

function handleMouseUp(event, canvas) {
    if (isDrawing) {
        isDrawing = false;
        canvas.classList.remove('pressed');

        stopSound();
    }
}

function setupEventListeners(canvas, ctx) {
    // Mouse events
    canvas.addEventListener('mousedown', function (event) {
        handleMouseDown(event, canvas, ctx);
    });

    canvas.addEventListener('mousemove', function (event) {
        handleMouseMove(event, canvas, ctx);
    });

    window.addEventListener('mouseup', function (event) {
        handleMouseUp(event, canvas);
    });

    // Touch events
    canvas.addEventListener('touchstart', function (event) {
        handleMouseDown(event, canvas, ctx);
    }, { passive: false });

    canvas.addEventListener('touchmove', function (event) {
        handleMouseMove(event, canvas, ctx);
    }, { passive: false });

    window.addEventListener('touchend', function (event) {
        handleMouseUp(event, canvas);
    }, { passive: false });
}

export { setupEventListeners };