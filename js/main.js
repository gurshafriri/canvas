    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    
    // Web Audio API Setup
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator, gainNode, filterNode, reverbNode, now;
    let oscillator_drone, gainNode_drone, filterNode_drone, reverbNode_drone;

    // Function to create reverb impulse response
    function createReverbBuffer(duration = 7, decay = 2) {
        const sampleRate = audioCtx.sampleRate;
        const length = sampleRate * duration;
        const impulse = audioCtx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = length - i;
            left[i] = (Math.random() * 2.3 - 1) * Math.pow(n / length, decay);
            right[i] = (Math.random() * 1.6 - 1) * Math.pow(n / length, decay);
        }

        return impulse;
    }

    // Helper function to blend waveforms (square to sine)
    function createCustomWaveform(blend) {
        console.log(blend)
        const harmonics = 64; // Number of harmonics for a more square-like wave
        const real = new Float32Array(harmonics);
        const imag = new Float32Array(harmonics);
        
        real[1] = blend

        for (let i = 1; i < harmonics; i++) {
            if (i % 2 !== 0) {
                // real[i] = blend / i;  // Square wave harmonics fade as blend decreases (now square at 0, sine at 1)
                imag[i] = Math.pow((1 - blend)/i,1.3); // Sine wave increases as blend approaches 1
            }
        }

        // for (let i = 1; i < harmonics; i++) {
        // // Decreasing energy for higher harmonics
        //     // real[i] = (Math.random() * 2 - 1) / Math.pow(i, blend/1.5);  // Add some randomness for texture
        //     imag[i] = (Math.random() * 2 - 1) / Math.pow(i, b);  // Imaginary part with similar approach
        // }

        return audioCtx.createPeriodicWave(real, imag);
    }

    // Function to start sound with ADSR envelope and reverb
    function startSound() {
        if (oscillator) {
            oscillator.disconnect();
            gainNode.disconnect();
            filterNode.disconnect();
            reverbNode.disconnect();
        }
        if (oscillator_drone) {
            oscillator_drone.disconnect();
            gainNode_drone.disconnect();
            filterNode_drone.disconnect();
            reverbNode_drone.disconnect();
        }
        const pitch = 178
        
        oscillator_drone = audioCtx.createOscillator();
        gainNode_drone = audioCtx.createGain();
        filterNode_drone = audioCtx.createBiquadFilter();
        reverbNode_drone = audioCtx.createConvolver();

        filterNode_drone.type = 'lowpass';
        filterNode_drone.frequency.setValueAtTime(pitch*3, audioCtx.currentTime);
        oscillator_drone.frequency.setValueAtTime(pitch/1.7, audioCtx.currentTime);

        reverbNode_drone.buffer = createReverbBuffer(3, 7); // Duration of 3s and decay 

        oscillator_drone.connect(filterNode_drone);
        filterNode_drone.connect(gainNode_drone);
        gainNode_drone.connect(reverbNode_drone);
        reverbNode_drone.connect(audioCtx.destination);

        oscillator_drone.start();

        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        filterNode = audioCtx.createBiquadFilter();
        reverbNode = audioCtx.createConvolver();

        // Set up filter (low-pass)
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(pitch*3, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);

        // Create reverb effect rate of 3
        reverbNode.buffer = createReverbBuffer(3, 7);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(reverbNode);
        reverbNode.connect(audioCtx.destination);

        oscillator.start();

        // ADSR envelope (Attack, Decay, Sustain, Release)
        now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);              // Start at 0 (silent)
        gainNode.gain.linearRampToValueAtTime(0.8, now + 0.1);  // Attack to 80% volume
        gainNode.gain.linearRampToValueAtTime(0.6, now + 0.2);  // Decay to 60% volume (sustain)
    }

    // Function to stop sound with Release
    function stopSound() {
        if (oscillator) {
            now = audioCtx.currentTime;
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3); // Smooth release
            oscillator.stop(now + 0.3);
        }

        if(oscillator_drone) {
           now = audioCtx.currentTime;
           gainNode_drone.gain.linearRampToValueAtTime(0, now + 0.3); // Smooth release
           oscillator_drone.stop(now + 0.3); 
        }
    }

    // Function to draw a rounded rectangle (to blend square and circle)
    function drawRoundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fillStyle = 'lightblue';  // Shape color
        ctx.fill();
    }

    function handleMouseMove(event) {
        if (!isDrawing) return;

        // Get the bounding box of the canvas
        const rect = canvas.getBoundingClientRect();
        
        // Calculate mouse position relative to the canvas
        const x = Math.min(Math.max(0, event.clientX - rect.left), canvas.width);
        const y = Math.min(Math.max(0, event.clientY - rect.top), canvas.height);;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Y-axis controls size of the shape
        const size = Math.max(10, y); // Minimum size of 10

        // Calculate the ratio of how far to the right the cursor is (0 = far left, 1 = far right)
        const xRatio = x / canvas.width;

        // Calculate the corner radius for the shape: closer to the right, the larger the radius (more circle-like)
        const maxRadius = size / 2;
        const radius = xRatio * maxRadius; // 0 on the far left, maxRadius on the far right

        // Draw the shape in the center of the canvas
        const centerX = (canvas.width - size) / 2;
        const centerY = (canvas.height - size) / 2;

        // Draw the shape (blended square/circle)
        drawRoundedRect(centerX, centerY, size, size, radius);

        // Audio Settings: Smooth transition between square and sine based on X-axis
        const waveformBlend = xRatio; // Now 0 = square, 1 = sine
        const customWaveform = createCustomWaveform(waveformBlend);
        oscillator.setPeriodicWave(customWaveform);

        // Y-axis controls amplitude
        const gainValue = (y / canvas.height); // Invert Y-axis: lower mouse position = lower volume
        gainNode.gain.setValueAtTime(gainValue, audioCtx.currentTime);
    }

    canvas.addEventListener('mousedown', function(event) {
        isDrawing = true;
        canvas.classList.add('pressed'); // Apply the 'pressed' effect

        startSound(); // Start playing sound
        handleMouseMove(event); // Trigger the first draw
    });

    canvas.addEventListener('mousemove', handleMouseMove);

    window.addEventListener('mouseup', function() {
        isDrawing = false;
        canvas.classList.remove('pressed'); // Remove the 'pressed' effect when mouse is released

        stopSound(); // Stop playing sound
    });

    window.addEventListener('mousemove', handleMouseMove);