var context = new (window.AudioContext || window.webkitAudioContext)();

// from https://gist.github.com/i-Robi/8684800
let freqs = {
  C: [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5, 2093.0, 4186.01],
  Db: [17.32, 34.65, 69.3, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
  D: [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
  Eb: [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
  E: [20.6, 41.2, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
  F: [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
  Gb: [23.12, 46.25, 92.5, 185.0, 369.99, 739.99, 1479.98, 2959.96],
  G: [24.5, 49.0, 98.0, 196.0, 392.0, 783.99, 1567.98, 3135.96],
  Ab: [25.96, 51.91, 103.83, 207.65, 415.3, 830.61, 1661.22, 3322.44],
  A: [27.5, 55.0, 110.0, 220.0, 440.0, 880.0, 1760.0, 3520.0],
  Bb: [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
  B: [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]
};

// convenience
freqs["C#"] = freqs["Db"];
freqs["D#"] = freqs["Eb"];
freqs["F#"] = freqs["Gb"];
freqs["G#"] = freqs["Ab"];
freqs["A#"] = freqs["Bb"];

let notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
let symbols = [
  "M", // major
  "m" // minor
  // 7 chords
  // inversions
];

// One-liner to resume playback when user interacted with the page.
let isStarted = false;
document.querySelector("button").addEventListener("click", function() {
  if (isStarted) {
    return;
  }
  isStarted = true;
  context.resume().then(() => {
    console.log("Playback resumed successfully");
  });
  start();

  // Hide start button-- could replace with a start/stop toggle later
  var element = document.getElementById("startToggle");
  element.parentNode.removeChild(element);
});

let countdownNum = 0;

function start() {
  let delay = 3;
  let duration = 1;
  let interval = (delay + duration) * 1000; // twice as long.. x1000 for secs => ms

  function countdown() {
    var countdownDisplay = document.getElementById("countdownDisplay");
    countdownDisplay.innerHTML = "";
    countdownDisplay.innerHTML += countdownNum;
    countdownNum--;
    if (countdownNum == -1) {
      countdownNum = delay;
    }
  }

  function run() {
    // choose a chord
    var randChord = notes[Math.floor(Math.random() * notes.length)];
    var randChordSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    var randInversion = Math.floor(Math.random() * 3);

    // display the chord
    var chordDisplay = document.getElementById("chordDisplay");
    chordDisplay.innerHTML = "";
    chordDisplay.innerHTML += randChord;

    // display chord symbol
    if (randChordSymbol !== "M") {
      // major isn't typically displayed
      chordDisplay.innerHTML += randChordSymbol;
    }

    // display chord inversion
    var inversionDisplay = document.getElementById("inversionDisplay");
    inversionDisplay.innerHTML = "";
    switch (randInversion) {
      case 0:
        // no inversion is assumed
        break;
      case 1:
        inversionDisplay.innerHTML += "1st inversion";
        break;
      case 2:
        inversionDisplay.innerHTML += "2nd inversion";
        break;
      default:
        throw ("cannot display invalid inversion:", chordInversion);
    }

    // play the chord
    playChord(randChord, randChordSymbol, randInversion, delay, duration);
  }

  run();
  setInterval(run, interval);

  // display countdown...
  countdownNum = delay;
  countdown();
  setInterval(countdown, 1000);
}

function playChord(chord, chordType, chordInversion, delay, duration) {
  var osc1 = context.createOscillator(); // instantiate an oscillator
  var osc2 = context.createOscillator();
  var osc3 = context.createOscillator();
  osc1.type = "sine"; // this is the default - also square, sawtooth, triangle
  osc2.type = "sine";
  osc3.type = "sine";
  osc1.connect(context.destination); // connect it to the destination
  osc2.connect(context.destination); // connect it to the destination
  osc3.connect(context.destination); // connect it to the destination

  // Major triad
  let root, third, fifth;
  switch (chordType) {
    case "M":
      root = chord;
      third = notes[(notes.indexOf(chord) + 4) % 12];
      fifth = notes[(notes.indexOf(third) + 3) % 12];
      break;
    case "m":
      root = chord;
      third = notes[(notes.indexOf(chord) + 3) % 12];
      fifth = notes[(notes.indexOf(third) + 4) % 12];
      break;
    default:
      throw ("invalid chordType:", chordType);
  }

  let rootOctave = 4;
  let thirdOctave = 4;
  let fifthOctave = 4;
  if (notes.indexOf(third) < notes.indexOf(root)) {
    thirdOctave = rootOctave + 1;
  }
  if (notes.indexOf(fifth) < notes.indexOf(root)) {
    fifthOctave = rootOctave + 1;
  }

  switch (chordInversion) {
    case 0:
      break;
    case 1:
      rootOctave += 1;
      break;
    case 2:
      rootOctave += 1;
      thirdOctave += 1;
      break;
    default:
      throw ("invalid inversion:", chordInversion);
  }

  //// FOR DEBUGGING
  //console.log("NOTES");
  //console.log(root, rootOctave);
  //console.log(third, thirdOctave);
  //console.log(fifth, fifthOctave);

  osc1.frequency.value = freqs[root][rootOctave];
  osc2.frequency.value = freqs[third][thirdOctave];
  osc3.frequency.value = freqs[fifth][fifthOctave];

  let startTime = context.currentTime + delay;
  let endTime = context.currentTime + delay + duration;
  osc1.start(startTime);
  osc1.stop(endTime);
  osc2.start(startTime);
  osc2.stop(endTime);
  osc3.start(startTime);
  osc3.stop(endTime);
}
