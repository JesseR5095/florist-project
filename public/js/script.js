import getOrientation from './orientation.js';
import framing from './framing.js';
import processing from './processing.js';

const self = {
  LOADING: 0, // app states
  FRAMING: 1,
  ADJUSTING: 2,

  appState: 0,

  ratios: [
    { w: 6, h: 4, },
    { w: 8.5, h: 11, }
  ],

  patterns: [
    "seamless0.jpg",
    "seamless1.jpg"
  ],

  titleRef: document.getElementById('title'),
  subtitleRef: document.getElementById('subtitle'),

  fileInput: document.getElementById('file-input'), // gets references to the image uploader and preview canvas DOM objects
  scaleInput: document.getElementById('format-scale'),

  thresholdInput: document.getElementById('format-zoom'),
  patternInput: document.forms["patternRadio"].elements["pattern"],
  traceInput: document.querySelector('input[name=toggle-trace]'),

  frameConfirm: document.getElementById('frame-confirm'),
  previewAdjust: document.getElementById('preview-adjust'),

  previewUi: document.getElementById('preview-ui'),
  confirmationUi: document.getElementById('confirmation-ui'),

  confirmCanvas: document.getElementById('confirm-canvas'),

  previewCanvas: document.getElementById('preview-canvas'),

  hiddenCanvas: document.getElementById('hidden-canvas'), // gets references to the hidden image processing canvas DOM object

  noteImage: new Image(), // creates image JavaScript objects for the uploaded image and the background pattern
  noteBackgrounds: [
    new Image(),
    new Image()
  ],

  h: undefined,
  w: window.innerWidth,

  orientation: undefined,
};

self.confirmCtx = self.confirmCanvas.getContext('2d'),
self.previewCtx = self.previewCanvas.getContext('2d'),
self.hiddenCtx = self.hiddenCanvas.getContext('2d'),

self.noteBackgrounds[0].src = 'seamless0.jpg'; // sets the background pattern to the local file path
self.noteBackgrounds[1].src = 'seamless1.jpg';
self.noteBackgrounds.current = 0;

self.confirmCanvas.width = self.w = (self.w < 639) ? self.w : 639;
self.confirmCanvas.height = self.w * 4/6;

function importImage(imageFile) { // declares the function that's fired after an image is uploaded by the user
  self.noteImage.onload = function() { // runs when the uploaded image's onload hook is fired
    self.h = self.noteImage.height; // gets references to the uploaded image's pixel height and width
    self.w = self.noteImage.width;

    // updates dimensions to match the uploaded image's dimensions
    //canvas.height = h;
    //canvas.width = w;

    // draw the uploaded image onto the preview canvas

    //processImage();

    self.appState = self.FRAMING;

    framing.start.call(self);
  }

  getOrientation(imageFile[0], function(orientation) {
    self.orientation = orientation;

    self.noteImage.src = URL.createObjectURL(imageFile[0]); // stores uploaded image into JavaScript image object
  });
}

window.rotate = function rotate() {
  framing.rotateCCW.call(self);
}

window.goToAdjust = function goToAdjust() {
  framing.stop.call(self);

  processing.start.call(self);
}

window.goToConfirm = function goToConfirm() {
  titleRef.innerHTML = "Final Step:";
  subtitleRef.innerHTML = "Preview and submit finished file.";

  previewCanvas.removeEventListener("mousemove", mousemovePreview, false);
  previewCanvas.removeEventListener("mousedown", mousedownPreview, false);

  thresholdInput.removeEventListener('input', (e) => updateThreshold(e));

  for (let i = 0; i < patternInput.length; i++) {
    const new_element = patternInput[i].cloneNode(true);

    patternInput[i].parentNode.replaceChild(new_element, patternInput[i]);
  }

  traceInput.removeEventListener('change', (e) => toggleTrace(e.target.checked));

  startConfirmation();

  previewUi.classList.add('hidden');
  confirmationUi.classList.remove('hidden');
}

function startConfirmation() { }

window.uploadPicture = function uploadHandwrittenNote() {
  self.fileInput.click();
}

self.fileInput.addEventListener('change', (e) => importImage(e.target.files)); // listens to the image uploader DOM object for changes then triggers new image processing
