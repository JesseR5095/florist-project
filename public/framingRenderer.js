var spriteObject =
{
  sourceX: 0,
  sourceY: 0,
  sourceWidth: 64,
  sourceHeight: 64,
  width: 64,
  height: 64,
  x: 0,
  y: 0,
  visible: true,
  
  rotation: 0,
  rotateState: 0,
  
  //A draggable property
  draggable: true,
  dragging: false,
  
  //Getters to define the
  //left, right, top and bottom sides
  left: function()
  {
    return this.x;
  },
  right: function()
  {
    return this.x + this.width;
  },
  top: function()
  {
    return this.y;
  },
  bottom: function()
  {
    return this.y + this.height;
  },
  centerX: function()
  {
    return this.x + (this.width / 2);
  },
  centerY: function()
  {
    return this.y + (this.height / 2);
  },
  halfWidth: function()
  {
    return this.width / 2;
  },
  halfHeight: function()
  {
    return this.height / 2;
  }
};

let scale = 1;

var drawingSurface = confirmCtx;

//Object arrays
var sprites = [];
var assetsToLoad = [];
var assetsLoaded = 0;

//Load the image
var image = new Image();
image.addEventListener("load", loadHandler, false);
image.src = "seamless0.jpg";
assetsToLoad.push(image);

//Variables to store the mouse's position and velocity
var mouseX = 0;
var mouseY = 0;
var oldMouseX = 0;
var oldMouseY = 0;

//A variable to store the current sprite being dragged
var dragSprite = Object.create(spriteObject);

function startFraming()
{
  document.getElementById('upload-file').classList.add('hidden');
  
  titleRef.innerHTML = "Step Two:";
  subtitleRef.innerHTML = "Adjust the picture to fit your letter into the frame.";
  
  //Event listeners
  confirmCanvas.addEventListener("mousemove", mousemoveHandler, false);
  confirmCanvas.addEventListener("mousedown", mousedownHandler, false);
  window.addEventListener("mouseup", mouseupHandler, false);
  
  scaleInput.addEventListener('input', (e) => updateScale(e));
  
  let rot, rotState;
  switch(orientation) {
    case 1:
      rot = 0;
      rotState = 0;
      
      break;
    case 8:
      rot = 0 - Math.PI/2;;
      rotState = 0;
      
      break;
    case 3:
      rot = 0 - 2*Math.PI/2;;
      rotState = 0;
      
      break;
    case 6:
      rot = 0 - 3*Math.PI/2;;
      rotState = 0;
      
      break;
  }
  
  dragSprite.rotation = rot;
  dragSprite.rotateState = rotState;

  update();  
}

function update()
{ 
  //Change what the game is doing based on the game state
  switch(appState)
  {
    case LOADING:
      console.log("loading...");
      break;
    
    case FRAMING:
      playGame();
      break;
  }
  
  //Render the game
  render();
}

function playGame()
{
  //Add game logic here
}

function mousedownHandler(event)
{
  //Assign the sprite to the dragSprite variable
  dragSprite.dragging = true;
}

function mousemoveHandler(event)
{ 
  //Find the mouse's x and y position on the canvas
  mouseX = event.pageX - confirmCanvas.offsetLeft;
  mouseY = event.pageY - confirmCanvas.offsetTop;
  
  //Move the dragSprite if it's not null
  if(dragSprite.dragging === true)
  {
    
    dragSprite.x = mouseX - (oldMouseX - dragSprite.x);
    dragSprite.y = mouseY - (oldMouseY - dragSprite.y);
    
    dragSprite.x = (dragSprite.x < 0) ? dragSprite.x : 0;
    dragSprite.y = (dragSprite.y < 0) ? dragSprite.y : 0;
    
    /*
    //Use this to drag the sprite from the center
    dragSprite.x = mouseX - (dragSprite.width / 2);
    dragSprite.y = mouseY - (dragSprite.height / 2);
    */
    update();
  }
  
  //Capture the current mouse position to use
  //in the next frame
  oldMouseX = mouseX;
  oldMouseY = mouseY;
}

function mouseupHandler(event)
{
  //Release the dragSprite by setting it to null
  dragSprite.dragging = false;
}

function loadHandler()
{ 
  assetsLoaded++;
  if(assetsLoaded === assetsToLoad.length)
  {
    appState = FRAMING;
  }
}

function updateScale(event)
{
  const prevScale = scale;
  
  scale = event.target.value / 100;
  
  dragSprite.x = dragSprite.x + (confirmCanvas.width * prevScale - confirmCanvas.width * scale)/2;
  dragSprite.y = dragSprite.y + (confirmCanvas.height * prevScale - confirmCanvas.height * scale)/2;
  
  update();
}

function rotateCCW() {
  dragSprite.rotation = dragSprite.rotation - Math.PI/2;
  
  dragSprite.rotateState = (dragSprite.rotateState > 3) ? 0 : dragSprite.rotateState + 1;
  
  render();
}

function doRotation() {
  dragSprite.width = img.width;
  dragSprite.height = img.height;
  
  if(dragSprite.rotateState % 2 !== 0)
  {
    hiddenCanvas.height = img.width;
    hiddenCanvas.width = img.height;

    hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

    //Save the current state of the drawing surface
    //before it's rotated
    hiddenCtx.save();

    //Rotate the canvas
    hiddenCtx.translate
    (
      Math.floor(0 + dragSprite.halfHeight()), 
      Math.floor(0 + dragSprite.halfWidth())
    );
  }
  else
  {
    hiddenCanvas.height = img.height;
    hiddenCanvas.width = img.width;

    hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

    //Save the current state of the drawing surface
    //before it's rotated
    hiddenCtx.save();

    //Rotate the canvas
    hiddenCtx.translate
    (
      Math.floor(0 + dragSprite.halfWidth()), 
      Math.floor(0 + dragSprite.halfHeight())
    );
  }
  
  hiddenCtx.rotate(dragSprite.rotation/** * Math.PI / 180**/);
  console.log(Math.floor(-dragSprite.halfWidth()));console.log(Math.floor(-dragSprite.halfHeight()));console.log(dragSprite.width);console.log(dragSprite.height);console.log(dragSprite.rotateState);
  hiddenCtx.drawImage(img, 0, 0, img.width, img.height,
                           Math.floor(-dragSprite.halfWidth()), Math.floor(-dragSprite.halfHeight()),
                           dragSprite.width, dragSprite.height); 

  //Restore the drawing surface to its 
  //state before it was rotated
  hiddenCtx.restore();
}

function render()
{ 
  drawingSurface.clearRect(0, 0, confirmCanvas.width, confirmCanvas.height);
  
  doRotation();
  
  const newHeight = img.height * confirmCanvas.width * scale / img.height;
  
  drawingSurface.drawImage(hiddenCanvas, 0, 0, hiddenCanvas.width, hiddenCanvas.height,
                                dragSprite.x, dragSprite.y, confirmCanvas.width * scale, newHeight);
}