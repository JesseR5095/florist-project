let threshold = 100;

function startProcessing()
{
  //Event listeners
  previewCanvas.addEventListener("mousemove", mousemovePreview, false);
  previewCanvas.addEventListener("mousedown", mousedownPreview, false);
  
  thresholdInput.addEventListener('input', (e) => updateThreshold(e));
  for(let i=0; i < patternInput.length; i++) {
    patternInput[i].onclick = function() {
      updatePattern(this.value);
    }
  }
  traceInput.addEventListener('change', (e) => toggleTrace(e.target.checked));
  
  processImage();
}

function processImage() {
  hiddenCanvas.height = confirmCanvas.height;
  hiddenCanvas.width = confirmCanvas.width;

  const imageData = confirmCtx.getImageData(0, 0, confirmCanvas.width, confirmCanvas.height);  // get the imageData object from the canvas context.

  // iterate over the imageData, incrementing by 4 in order to perform operations on individual pixel data at a time.
  for(let i=0; i < imageData.data.length; i+=4) {  // (red, green, blue, alpha).
    // convert the image to greyscale by normalizing the r,g,b channels and setting them equal to one another.
    const luma = Math.floor(imageData.data[i] * 0.3 + imageData.data[i+1] * 0.59 + imageData.data[i+2] * 0.11);

    imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = (bg.curr == 0) ? luma : 255 - luma;

    // determines the pixel's opacity based on its luma score.
    if(luma < threshold) 
      imageData.data[i+3] = 255;
    else if(luma < threshold+25)
      imageData.data[i+3] = (25+threshold - luma) * 10;
    else
      imageData.data[i+3] = 0;
  }
  
  hiddenCtx.putImageData(imageData, 0, 0);  // putImageData replaces canvas pixels with the exact data, it does not layer overtop. In order to print the letter over the digital pattern, we put the processed image into the hidden canvas then draw the hidden canvas to the preview canvas which already has the pattern printed onto it.

  previewCanvas.height = confirmCanvas.height;
  previewCanvas.width = confirmCanvas.width;
  
  //bg.src = patterns[bg.curr];
  
  // prints the background pattern to the preview canvas.
  const pattern = previewCtx.createPattern(bg[bg.curr], 'repeat');
  previewCtx.fillStyle = pattern;
  previewCtx.fillRect(0, 0, confirmCanvas.width, confirmCanvas.height);
  
  previewCtx.drawImage(hiddenCanvas, 0, 0);  // draws the handwriting to the canvas.
}

function mousedownPreview(event)
{
  
}

function mousemovePreview(event) { 
  
}

function updateThreshold(event) {
  threshold = Number(event.target.value);
  
  processImage();
}

function updatePattern(value) {
  bg.curr = value;
  
  processImage();
}

function toggleTrace(isChecked) {
  console.log(isChecked);
}