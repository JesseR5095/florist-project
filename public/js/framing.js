const Framing = function ImageFramingController() {
  function SpriteObject() {
    this.sourceX = 0;
    this.sourceY = 0;
    this.sourceWidth = 64;
    this.sourceHeight = 64;

    this.width = 64;
    this.height = 64;
    this.x = 0;
    this.y = 0;

    this.visible = true;

    this.rotation = 0;
    this.rotateState = 0;

    this.draggable = true; // a draggable property
    this.dragging = false;

    this.left = () => { // getters to define the left, right, top and bottom sides
      return this.x;
    };
    this.right = () => {
      return this.x + this.width;
    };
    this.top = () => {
      return this.y;
    };
    this.bottom = () => {
      return this.y + this.height;
    };

    this.centerX = () => {
      return this.x + (this.width / 2);
    };
    this.centerY = () => {
      return this.y + (this.height / 2);
    };
    this.halfWidth = () => {
      return this.width / 2;
    };
    this.halfHeight = () => {
      return this.height / 2;
    };
  }

  const sprites = []; // object arrays

  const dragSprite = new SpriteObject; // a variable to store the current sprite being dragged

  const image = new Image(); // load the image

  const assetsToLoad = [];
  let assetsLoaded = 0;

  let scale = 1;

  let drawingSurface = undefined;

  let mouseX = 0; // variables to store the mouse's position and velocity
  let mouseY = 0;
  let oldMouseX = null;
  let oldMouseY = null;

  const init = () => {
    image.addEventListener("load", loadHandler, false);

    image.src = "seamless0.jpg";

    assetsToLoad.push(image);
  };

  init();

  function mousedownHandler(event) {
    dragSprite.dragging = true; // assign the sprite to the dragSprite variable
  }

  function mousemoveHandler(event) {
    mouseX = Math.floor(event.pageX) - this.confirmCanvas.offsetLeft; // find the mouse's x and y position on the canvas
    mouseY = Math.floor(event.pageY) - this.confirmCanvas.offsetTop;

    if (dragSprite.dragging === true && oldMouseX !== null) { // move the dragSprite if it's not null
      dragSprite.x = mouseX - (oldMouseX - dragSprite.x);
      dragSprite.y = mouseY - (oldMouseY - dragSprite.y);

      // dragSprite.x = (dragSprite.x < 0) ? dragSprite.x : 0;
      // dragSprite.y = (dragSprite.y < 0) ? dragSprite.y : 0;

      /*
        dragSprite.x = mouseX - (dragSprite.width / 2); // use this to drag the sprite from the center
        dragSprite.y = mouseY - (dragSprite.height / 2);
      */
      update.call(this);
    }

    oldMouseX = mouseX; // capture the current mouse position to use in the next frame
    oldMouseY = mouseY;
  }

  function mouseupHandler(event) { // release the dragSprite by setting it to null
    dragSprite.dragging = false;

    oldMouseX = null;
  }

  function touchstartHandler(event) {
    mousedownHandler.call(this, event.targetTouches[0]);
  }

  function touchmoveHandler(event) {
    mousemoveHandler.call(this, event.targetTouches[0]);
  }

  function touchendHandler(event) {
    mouseupHandler.call(this, event.targetTouches[0]);
  }

  function loadHandler() {
    assetsLoaded++;

    if (assetsLoaded === assetsToLoad.length) {
      this.appState = this.FRAMING;
    }
  }

  function updateScale(e) {
    const { confirmCanvas } = this;

    const prevScale = scale;

    scale = e.target.value / 100;

    dragSprite.x = dragSprite.x + (confirmCanvas.width * prevScale - confirmCanvas.width * scale) / 2;
    dragSprite.y = dragSprite.y + (confirmCanvas.height * prevScale - confirmCanvas.height * scale) / 2;

    update.call(this);
  }

  function doRotation() {
    const {
      noteImage,
      hiddenCanvas,
      hiddenCtx } = this;

    dragSprite.width = noteImage.width;
    dragSprite.height = noteImage.height;

    if (dragSprite.rotateState % 2 !== 0) {
      hiddenCanvas.height = noteImage.width;
      hiddenCanvas.width = noteImage.height;

      hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

      hiddenCtx.save(); //Save the current state of the drawing surface before it's rotated

      hiddenCtx.translate( // rotate the canvas
        Math.floor(0 + dragSprite.halfHeight()),
        Math.floor(0 + dragSprite.halfWidth())
      );
    } else {
      hiddenCanvas.height = noteImage.height;
      hiddenCanvas.width = noteImage.width;

      hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

      hiddenCtx.save(); // Save the current state of the drawing surface before it's rotated

      hiddenCtx.translate( // rotate the canvas
        Math.floor(0 + dragSprite.halfWidth()),
        Math.floor(0 + dragSprite.halfHeight())
      );
    }

    hiddenCtx.rotate(dragSprite.rotation); //Math.PI / 180);

    hiddenCtx.drawImage(
      noteImage,
      0, 0,
      noteImage.width, noteImage.height,
      Math.floor(-dragSprite.halfWidth()), Math.floor(-dragSprite.halfHeight()),
      dragSprite.width, dragSprite.height
    );

    hiddenCtx.restore(); // restore the drawing surface to its state before it was rotated
  }

  function playGame() {
     // add game logic here
  }

  function render() {
    const {
      confirmCanvas,
      hiddenCanvas,
      noteImage } = this;

    drawingSurface.clearRect(0, 0, confirmCanvas.width, confirmCanvas.height);

    doRotation.call(this);

    const newWidth = confirmCanvas.width * scale;

    const newHeight = newWidth * hiddenCanvas.height / hiddenCanvas.width; //hiddenCanvas.height * confirmCanvas.width * scale / hiddenCanvas.height;

    drawingSurface.drawImage(
      hiddenCanvas,
      0, 0, hiddenCanvas.width, hiddenCanvas.height,
      dragSprite.x, dragSprite.y, newWidth, newHeight
    );
  }

  function update() {
    switch (this.appState) { // change what the game is doing based on the game state
      case this.LOADING: {
        console.log("loading...");
        break;
      }
      case this.FRAMING: {
        playGame();
        break;
      }
    }

    render.call(this); // render the game
  }

  return {
    start: function startImageFramingController() {
      const {
        frameConfirm,
        titleRef,
        subtitleRef,
        confirmCanvas,
        scaleInput,
        orientation,
        confirmCtx } = this;

      frameConfirm.classList.remove('hidden');

      document.getElementById('upload-file').classList.add('hidden');

      titleRef.innerHTML = "Step Two:";
      subtitleRef.innerHTML = "Adjust it to fit into the card frame.";

      confirmCanvas.addEventListener("mousemove", mousemoveHandler.bind(this), false); // event listeners
      confirmCanvas.addEventListener("mousedown", mousedownHandler, false);
      window.addEventListener("mouseup", mouseupHandler, false);

      confirmCanvas.addEventListener("touchmove", touchmoveHandler.bind(this), false); // event listeners
      confirmCanvas.addEventListener("touchstart", touchstartHandler, false);
      window.addEventListener("touchend", touchendHandler, false);

      scaleInput.addEventListener('input', updateScale.bind(this));

      let rot = 0;
      let rotState = 0;

      switch (orientation) {
        case 1: {
          rot = 0;

          rotState = 0;
          break;
        }
        case 8: {
          rot = 0 - Math.PI / 2;

          rotState = 0;
          break;
        }
        case 3: {
          rot = 0 - 2 * Math.PI / 2;

          rotState = 0;
          break;
        }
        case 6: {
          rot = 0 - 3 * Math.PI / 2;

          rotState = 0;
          break;
        }
      }

      dragSprite.rotation = rot;
      dragSprite.rotateState = rotState;

      drawingSurface = confirmCtx;

      update.call(this);
    },

    rotateCCW: function rotateImageCounterClockwise() {
      dragSprite.rotation = dragSprite.rotation - Math.PI / 2;

      dragSprite.rotateState = (dragSprite.rotateState > 3) ? 0 : dragSprite.rotateState + 1;

      update.call(this);
    },

    stop: function stopImageFramingController() {
      const {
        confirmCanvas,
        scaleInput,
        frameConfirm } = this;

      confirmCanvas.removeEventListener("mousemove", mousemoveHandler); // event listeners
      confirmCanvas.removeEventListener("mousedown", mousedownHandler);
      window.removeEventListener("mouseup", mouseupHandler);

      confirmCanvas.removeEventListener("touchmove", touchmoveHandler); // event listeners
      confirmCanvas.removeEventListener("touchstart", touchstartHandler);
      window.removeEventListener("touchend", touchendHandler);

      scaleInput.removeEventListener('input', updateScale);

      frameConfirm.classList.add('hidden');
    },
  };
};

export default new Framing();
