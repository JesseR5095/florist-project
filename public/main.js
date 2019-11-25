//Game states
var LOADING = 0;
var FRAMING = 1;
var ADJUSTING = 2;
var appState = LOADING;

const ratios = [
  {w: 6, h: 4},
  {w: 8.5, h: 11}
];

const patterns = [
  "seamless0.jpg",
  "seamless1.jpg"
];

const titleRef = document.getElementById('title');
const subtitleRef = document.getElementById('subtitle');

// gets references to the image uploader and preview canvas DOM objects.
const fileInput = document.getElementById('file-input');
const scaleInput = document.getElementById('format-scale');

const thresholdInput = document.getElementById('format-zoom');
const patternInput = document.forms["patternRadio"].elements["pattern"];
const traceInput = document.querySelector('input[name=toggle-trace]');

const frameConfirm = document.getElementById('frame-confirm');
const previewAdjust = document.getElementById('preview-adjust');

const previewUi = document.getElementById('preview-ui');
const confirmationUi = document.getElementById('confirmation-ui');

const confirmCanvas = document.getElementById('confirm-canvas');
const confirmCtx = confirmCanvas.getContext('2d');

const previewCanvas = document.getElementById('preview-canvas');
const previewCtx = previewCanvas.getContext('2d');

// gets references to the hidden image processing canvas DOM object.
const hiddenCanvas = document.getElementById('hidden-canvas');
const hiddenCtx = hiddenCanvas.getContext('2d');

// creates image JavaScript objects for the uploaded image and the background pattern.
const img = new Image();
const bg = [
  new Image(),
  new Image()
];

bg[0].src = 'seamless0.jpg';  // sets the background pattern to the local file path.
bg[1].src = 'seamless1.jpg';
bg.curr = 0;

let h, w;

let orientation = 1;

w = window.innerWidth;
confirmCanvas.width = w = (w < 959) ? w : 959;
confirmCanvas.height = window.innerWidth * 4/6;

// declares the function that's fired after an image is uploaded by the user.
function importImage(f) {  
  img.onload = function() {  // runs when the uploaded image's onload hook is fired.
    // gets references to the uploaded image's pixel height and width.
    h = img.height;
    w = img.width;

    // updates dimensions to match the uploaded image's dimensions.
    //canvas.height = h;
    //canvas.width = w;

    // draw the uploaded image onto the preview canvas.
    
    //processImage();
    appState = FRAMING;
    startFraming();
  }
  
  getOrientation(f[0], function(ori) {
      orientation = ori;
  });
  
  // stores uploaded image into JavaScript image object.
  img.src = URL.createObjectURL(f[0]);
}

function goToAdjust() {
  titleRef.innerHTML = "Step Three:";
  subtitleRef.innerHTML = "Edit generated digital letter.";
  
  //Event listeners
  confirmCanvas.removeEventListener("mousemove", mousemoveHandler, false);
  confirmCanvas.removeEventListener("mousedown", mousedownHandler, false);
  
  scaleInput.removeEventListener('input', (e) => updateScale(e));
  
  startProcessing();
  
  frameConfirm.classList.add('hidden');
  previewAdjust.classList.remove('hidden');
}

function goToConfirm() {
  titleRef.innerHTML = "Final Step:";
  subtitleRef.innerHTML = "Preview and submit finished file.";
  
  //Event listeners
  previewCanvas.removeEventListener("mousemove", mousemovePreview, false);
  previewCanvas.removeEventListener("mousedown", mousedownPreview, false);
  
  thresholdInput.removeEventListener('input', (e) => updateThreshold(e));
  
  for(let i=0; i < patternInput.length; i++) {
    const new_element = patternInput[i].cloneNode(true);
    patternInput[i].parentNode.replaceChild(new_element, patternInput[i]);
  }
  
  traceInput.removeEventListener('change', (e) => toggleTrace(e.target.checked));
  
  startConfirmation();
  
  previewUi.classList.add('hidden');
  confirmationUi.classList.remove('hidden');
}

function startConfirmation() { }

function triggerUpload() {
  fileInput.click();
}

// listens to the image uploader DOM object for changes then triggers new image processing.
fileInput.addEventListener('change', (e) => importImage(e.target.files));