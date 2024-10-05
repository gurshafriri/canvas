// main.js

import { setupEventListeners } from './events.js';
import { audioCtx } from './audio.js'

// Get canvas and context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Setup event listeners
setupEventListeners(canvas, ctx);

function isiOS() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isIOS || isIPadOS;
}

if (isiOS()) {
    // Create a button element
    const activateButton = document.createElement('button');
    activateButton.innerText = 'Click here to activate';

    // Style the button to overlay the canvas
    activateButton.style.position = 'absolute';
    const canvasRect = canvas.getBoundingClientRect();
    activateButton.style.left = `${canvasRect.left + window.scrollX}px`;
    activateButton.style.top = `${canvasRect.top + window.scrollY}px`;
    activateButton.style.width = `${canvasRect.width}px`;
    activateButton.style.height = `${canvasRect.height}px`;
    activateButton.style.zIndex = '1000';
    activateButton.style.opacity = 0.7

    // Append the button to the body
    document.body.appendChild(activateButton);



    // Add click event listener to the button
    activateButton.addEventListener('click', async () => {
        // Your function to run on click
        // Example: initializeCanvas();
    	if (audioCtx.state === 'suspended') {
	        console.log(audioCtx.state)
	        var audio = new Audio('https://github.com/anars/blank-audio/raw/refs/heads/master/10-minutes-of-silence.mp3');
	        await audio.play()
	        console.log("played silence")
	        audioCtx.resume();
      	}
        // Remove the button after activation
        activateButton.remove();
    });
}