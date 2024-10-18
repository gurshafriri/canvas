// main.js

import { setupEventListeners } from './events.js';

// Function to draw the background canvas
function drawBackground() {
    const backgroundCanvas = document.getElementById('backgroundCanvas');
    const bgCtx = backgroundCanvas.getContext('2d');

    const width = backgroundCanvas.width;
    const height = backgroundCanvas.height;

    // Divide the canvas into 4 equal areas
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Draw first quadrant (top-left)
    bgCtx.fillStyle = '#C0C0C0'; // Silver
    bgCtx.fillRect(0, 0, halfWidth, halfHeight);

    // Draw second quadrant (top-right)
    bgCtx.fillStyle = '#B0C4DE'; // Light Steel Blue
    bgCtx.fillRect(halfWidth, 0, halfWidth, halfHeight);

    // Draw third quadrant (bottom-left)
    bgCtx.fillStyle = '#D2B48C'; // Tan
    bgCtx.fillRect(0, halfHeight, halfWidth, halfHeight);

    // Draw fourth quadrant (bottom-right)
    bgCtx.fillStyle = '#778899'; // Light Slate Gray
    bgCtx.fillRect(halfWidth, halfHeight, halfWidth, halfHeight);
}

// Call the function to draw the background
drawBackground();

// Set up event listeners for the small canvas
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Setup event listeners for the small canvas
setupEventListeners(canvas, ctx);