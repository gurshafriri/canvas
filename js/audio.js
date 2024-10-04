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
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);

  real[1] = blend;

  for (let i = 1; i < harmonics; i++) {
    if (i % 2 !== 0) {
      imag[i] = Math.pow((1 - blend) / i, 1.3);
    }
  }

  return audioCtx.createPeriodicWave(real, imag);
}

// Function to start sound with ADSR envelope and reverb
function startSound() {
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
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.8, now + 0.1);
  gainNode.gain.linearRampToValueAtTime(0.6, now + 0.2);
}

// Function to stop sound with Release
function stopSound() {
  const now = audioCtx.currentTime;

  if (oscillator) {
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
    oscillator.stop(now + 0.3);
  }

  if (oscillatorDrone) {
    gainNodeDrone.gain.linearRampToValueAtTime(0, now + 0.3);
    oscillatorDrone.stop(now + 0.3);
  }
}

// Function to update the waveform based on mouse position
function updateWaveform(waveformBlend) {
  const customWaveform = createCustomWaveform(waveformBlend);
  if (oscillator) {
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
  startSound,
  stopSound,
  updateWaveform,
  updateGain,
};