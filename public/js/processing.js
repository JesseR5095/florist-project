import filters from './filters.js';

const Processing = function ImageProcessingController() {
  let threshold = 60;

  function processImage() {
    const {
      hiddenCanvas,
      confirmCanvas,
      confirmCtx,
      hiddenCtx,
      previewCanvas,
      previewCtx,
      noteBackgrounds } = this;

    hiddenCanvas.height = confirmCanvas.height;
    hiddenCanvas.width = confirmCanvas.width;

    const imageData = confirmCtx.getImageData(0, 0, confirmCanvas.width, confirmCanvas.height); // get the imageData object from the canvas context

    for (let i = 0; i < imageData.data.length; i += 4) { // iterate over the imageData, incrementing by 4 in order to perform operations on individual pixel data at a time (red, green, blue, alpha)
      const luma = Math.floor(imageData.data[i] * 0.3 + imageData.data[i+1] * 0.59 + imageData.data[i + 2] * 0.11); // convert the image to greyscale by normalizing the r,g,b channels and setting them equal to one another

      imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = luma; //(noteBackgrounds.current == 0) ? luma : 255 - luma;

      if (imageData.data[i + 3] == 0) {
        // 
      } else if (luma < threshold) { // determines the pixel's opacity based on its luma score.
        imageData.data[i + 3] = 255;
      } else if (luma < threshold + 25) {
        imageData.data[i + 3] = (25 + threshold - luma) * 10;
      } else {
        imageData.data[i + 3] = 0;
      }
    }

    hiddenCtx.putImageData(imageData, 0, 0); // putImageData replaces canvas pixels with the exact data, it does not layer overtop. in order to print the letter over the digital pattern, we put the processed image into the hidden canvas then draw the hidden canvas to the preview canvas which already has the pattern printed onto it

    previewCanvas.height = confirmCanvas.height;
    previewCanvas.width = confirmCanvas.width;

    //bg.src = patterns[bg.curr];

    const pattern = previewCtx.createPattern(noteBackgrounds[noteBackgrounds.current], 'repeat'); // prints the background pattern to the preview canvas

    previewCtx.fillStyle = pattern;

    previewCtx.fillRect(0, 0, confirmCanvas.width, confirmCanvas.height);

    /**Filters.filterImage(Filters.convolute, hiddenCanvas,
        [ 1/18, 3/36, 1/18,
          3/36, 4/9, 3/36,
          1/18, 3/36, 1/18 ]
      );
    Filters.filterImage(Filters.convolute, hiddenCanvas,
        [ 0, -1, 0,
         -1, 5, -1,
          0, -1, 0 ]
      );**/

    //Filters.filterImage(Filters.blackandwhite, hiddenCanvas);

    /**Filters.filterImage(Filters.convolute, hiddenCanvas,
        [ 1/18, 1/9, 1/18,
          1/9, 3/9, 1/9,
          1/18, 1/9, 1/18 ]
      );

    Filters.filterImage(Filters.convolute, hiddenCanvas,
        [ 1/36, 1/36, 1/36,
          1/36, 7/9, 1/36,
          1/36, 1/36, 1/36 ]
      );**/

    filters.filterImage(
      filters.convolute,
      hiddenCanvas,
      hiddenCtx,
      [1/36, 2/36, 1/36, 2/36, 6/9, 2/36, 1/36, 2/36, 1/36]
    );

    previewCtx.filter = 'none'; //previewCtx.filter = 'blur(8px)';
    previewCtx.drawImage(hiddenCanvas, 0, 0); //previewCtx.drawImage(hiddenCanvas, 0, 0); // draws the handwriting to the canvas.
  }

  function mousedownPreview(e) {

  }

  function mousemovePreview(e) {

  }

  function updateThreshold(e) {
    threshold = Number(e.target.value);

    processImage.call(this);
  }

  function updatePattern(value, self) {
    self.noteBackgrounds.current = value;

    processImage.call(self);
  }

  function toggleTrace(e) {
    console.log(e.target.checked);
  }

  return {
    start: function startImageProcessingController() {
      const {
        previewAdjust,
        titleRef,
        subtitleRef,
        previewCanvas,
        thresholdInput,
        patternInput,
        traceInput,
        noteBackgrounds } = this;

      const self = this;

      previewAdjust.classList.remove('hidden');

      titleRef.innerHTML = "Step Three:";
      subtitleRef.innerHTML = "Adjust and right-click to save.";

      previewCanvas.addEventListener("mousemove", mousemovePreview, false);
      previewCanvas.addEventListener("mousedown", mousedownPreview, false);

      thresholdInput.addEventListener('input', updateThreshold.bind(this));

      for (let i = 0; i < patternInput.length; i++) {
        patternInput[i].onclick = function() {
          updatePattern(this.value, self);
        }
      }

      traceInput.addEventListener('change', toggleTrace);

      processImage.call(this);
    },

    stop: function stopImageProcessingController() {
      const {
        previewAdjust,
        previewCanvas,
        thresholdInput,
        patternInput,
        traceInput } = this;

      previewCanvas.removeEventListener("mousemove", mousemovePreview);
      previewCanvas.removeEventListener("mousedown", mousedownPreview);

      thresholdInput.removeEventListener('input', updateThreshold);

      for (let i = 0; i < patternInput.length; i++) {
        patternInput[i].onclick = undefined;
      }

      traceInput.removeEventListener('change', toggleTrace);

      previewAdjust.classList.add('hidden');
    },
  };
};

export default new Processing();
