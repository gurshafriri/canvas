// main.js

import { setupEventListeners } from './events.js';

// Get canvas and context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Setup event listeners
setupEventListeners(canvas, ctx);