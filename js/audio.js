// audio.js

// Web Audio API Setup
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let oscillator1, oscillator2, gainNode1, gainNode2, gainNodeADSR, filterNode, reverbNode;
let oscillatorDrone, gainNodeDrone, filterNodeDrone, reverbNodeDrone;

const pitch = 316;

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

// Function to start sound with ADSR envelope and reverb
async function startSound() {
  // Resume the AudioContext if it's suspended
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  console.log("starting sound");
  console.log(audioCtx.state);
  stopSound(); // Ensure previous sounds are stopped

  
  const now = audioCtx.currentTime;

  // Setup drone oscillator
  oscillatorDrone = audioCtx.createOscillator();
  gainNodeDrone = audioCtx.createGain();
  filterNodeDrone = audioCtx.createBiquadFilter();
  reverbNodeDrone = audioCtx.createConvolver();

  filterNodeDrone.type = 'lowpass';
  filterNodeDrone.frequency.setValueAtTime(pitch * 3, now);
  oscillatorDrone.frequency.setValueAtTime(pitch / 1.7, now);

  reverbNodeDrone.buffer = createReverbBuffer(3, 7);

  oscillatorDrone.connect(filterNodeDrone);
  filterNodeDrone.connect(gainNodeDrone);
  gainNodeDrone.connect(reverbNodeDrone);
  reverbNodeDrone.connect(audioCtx.destination);

  gainNodeDrone.gain.setValueAtTime(0.6,now)

  oscillatorDrone.start();

  // Setup main oscillators
  oscillator1 = audioCtx.createOscillator();
  gainNode1 = audioCtx.createGain(); // Blending gain node for oscillator1

  oscillator2 = audioCtx.createOscillator();
  gainNode2 = audioCtx.createGain(); // Blending gain node for oscillator2

  gainNodeADSR = audioCtx.createGain(); // Common gain node for ADSR envelope

  filterNode = audioCtx.createBiquadFilter();
  reverbNode = audioCtx.createConvolver();

  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(pitch * 3, now);

  oscillator1.frequency.setValueAtTime(pitch, now);
  oscillator1.type = 'sine'; // First oscillator is sine wave

  oscillator2.frequency.setValueAtTime(pitch, now);
  oscillator2.type = 'triangle'; // Second oscillator is triangle wave

  reverbNode.buffer = createReverbBuffer(3, 7);

  // Connect oscillators through blending gain nodes
  oscillator1.connect(gainNode1);
  oscillator2.connect(gainNode2);

  // Blending gain nodes connect to the ADSR gain node
  gainNode1.connect(gainNodeADSR);
  gainNode2.connect(gainNodeADSR);

  gainNodeADSR.connect(filterNode);

  filterNode.connect(reverbNode);
  reverbNode.connect(audioCtx.destination);

  oscillator1.start();
  oscillator2.start();

  // Set initial gains for blending
  gainNode1.gain.setValueAtTime(0.5, now); // Start with full gain on oscillator1 (sine wave)
  gainNode2.gain.setValueAtTime(0.5, now); // Start with zero gain on oscillator2 (triangle wave)

  // ADSR envelope applied to gainNodeADSR
  gainNodeADSR.gain.setValueAtTime(0, now); // Start at 0 (silent)

  // Attack phase
  gainNodeADSR.gain.linearRampToValueAtTime(0.8, now + 0.1);

  // Decay to sustain
  gainNodeADSR.gain.linearRampToValueAtTime(0.6, now + 0.2);
}

// Function to stop sound with Release
function stopSound() {
  const now = audioCtx.currentTime;

  if (gainNodeADSR) {
    gainNodeADSR.gain.cancelScheduledValues(now);
    gainNodeADSR.gain.linearRampToValueAtTime(0, now + 0.3); // Smooth release
  }

  if (oscillator1) {
    oscillator1.stop(now + 0.3);
    oscillator1 = null; // Reset oscillator1
  }

  if (oscillator2) {
    oscillator2.stop(now + 0.3);
    oscillator2 = null; // Reset oscillator2
  }

  if (oscillatorDrone) {
    gainNodeDrone.gain.cancelScheduledValues(now);
    gainNodeDrone.gain.linearRampToValueAtTime(0, now + 0.3); // Smooth release
    oscillatorDrone.stop(now + 0.3);
    oscillatorDrone = null; // Reset oscillatorDrone
  }
}

// Function to update the waveform based on mouse position
function updateWaveform(waveformBlend) {
  if (gainNode1 && gainNode2) {
    // Ensure waveformBlend is between 0 and 1
    waveformBlend = Math.max(0, Math.min(1, waveformBlend));

    const now = audioCtx.currentTime;

    // Cancel scheduled values to prevent conflicts
    gainNode1.gain.cancelScheduledValues(now);
    gainNode2.gain.cancelScheduledValues(now);

    // Adjust gains inversely
    gainNode1.gain.setValueAtTime((1 - waveformBlend) * 0.9, now);
    gainNode2.gain.setValueAtTime(waveformBlend * 0.9, now);

    console.log(gainNode1.gain.value,gainNode2.gain.value,gainNodeDrone.gain.value)
  }
}

// Function to update gain based on mouse position
function updateGain(gainValue) {
  if (gainNodeADSR) {
    const now = audioCtx.currentTime;
    gainNodeADSR.gain.cancelScheduledValues(now);
    gainNodeADSR.gain.setValueAtTime(gainValue, now);
  }

  if (oscillatorDrone) {
    const now = audioCtx.currentTime
    const mult = 1.4 + (0.5 * gainValue)
    oscillatorDrone.frequency.setValueAtTime(pitch / mult, now)
  }
}

export {
  audioCtx,
  startSound,
  stopSound,
  updateWaveform,
  updateGain,
};