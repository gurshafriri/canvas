// audio.js

// Web Audio API Setup
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let oscillator, gainNode, filterNode, reverbNode;
let oscillatorDrone, gainNodeDrone, filterNodeDrone, reverbNodeDrone;

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
  const harmonics = 64;
  const real = new Float32Array(harmonics + 1); // +1 to include the DC component at index 0
  const imag = new Float32Array(harmonics + 1);

  real[0] = 0; // DC offset
  imag[0] = 0;

  for (let i = 1; i <= harmonics; i++) {
    if (i % 2 !== 0) {
      // For odd harmonics
      real[i] = blend / i; // Square wave harmonics decrease with frequency
      imag[i] = Math.pow((1 - blend) / i, 1.3);
    } else {
      // Even harmonics set to zero
      real[i] = 0;
      imag[i] = 0;
    }
  }

  // Create the PeriodicWave with disableNormalization set to true
  return audioCtx.createPeriodicWave(real, imag, { disableNormalization: true });
}

// Function to start sound with ADSR envelope and reverb
async function startSound() {
  // Resume the AudioContext if it's suspended
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  console.log("starting sound")
  console.log(audioCtx.state)
  stopSound(); // Ensure previous sounds are stopped

  const pitch = 178;

  // Setup drone oscillator
  oscillatorDrone = audioCtx.createOscillator();
  gainNodeDrone = audioCtx.createGain();
  filterNodeDrone = audioCtx.createBiquadFilter();
  reverbNodeDrone = audioCtx.createConvolver();

  filterNodeDrone.type = 'lowpass';
  filterNodeDrone.frequency.setValueAtTime(pitch * 3, audioCtx.currentTime);
  oscillatorDrone.frequency.setValueAtTime(pitch / 1.7, audioCtx.currentTime);

  reverbNodeDrone.buffer = createReverbBuffer(3, 7);

  oscillatorDrone.connect(filterNodeDrone);
  filterNodeDrone.connect(gainNodeDrone);
  gainNodeDrone.connect(reverbNodeDrone);
  reverbNodeDrone.connect(audioCtx.destination);

  oscillatorDrone.start();

  // Setup main oscillator
  oscillator = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();
  filterNode = audioCtx.createBiquadFilter();
  reverbNode = audioCtx.createConvolver();

  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(pitch * 3, audioCtx.currentTime);
  oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);

  reverbNode.buffer = createReverbBuffer(3, 7);

  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(reverbNode);
  reverbNode.connect(audioCtx.destination);

  oscillator.start();

  // ADSR envelope
  const now = audioCtx.currentTime;
  gainNode.gain.setValueAtTime(0, now); // Start at 0 (silent)
  gainNode.gain.linearRampToValueAtTime(0.8, now + 0.1); // Attack to 80% volume
  gainNode.gain.linearRampToValueAtTime(0.6, now + 0.2); // Decay to 60% volume (sustain)
}

// Function to stop sound with Release
function stopSound() {
  const now = audioCtx.currentTime;

  if (oscillator) {
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3); // Smooth release
    oscillator.stop(now + 0.3);
    oscillator = null; // Reset oscillator
  }

  if (oscillatorDrone) {
    gainNodeDrone.gain.linearRampToValueAtTime(0, now + 0.3); // Smooth release
    oscillatorDrone.stop(now + 0.3);
    oscillatorDrone = null; // Reset oscillatorDrone
  }
}

// Function to update the waveform based on mouse position
function updateWaveform(waveformBlend) {
  if (oscillator) {
    const customWaveform = createCustomWaveform(waveformBlend);
    oscillator.setPeriodicWave(customWaveform);
  }
}

// Function to update gain based on mouse position
function updateGain(gainValue) {
  if (gainNode) {
    gainNode.gain.setValueAtTime(gainValue, audioCtx.currentTime);
  }
}

export {
  audioCtx,
  startSound,
  stopSound,
  updateWaveform,
  updateGain,
};