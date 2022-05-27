function Filters() {
  const getPixels = function(image, context) {
    return context.getImageData(0, 0, image.width, image.height);
  };

  const getCanvas = function(w, h) {
    const c = document.createElement('canvas');

    c.width = w;
    c.height = h;

    return c;
  };

  const tmpCanvas = document.createElement('canvas');

  const tmpCtx = tmpCanvas.getContext('2d');

  const createImageData = function(w, h) {
    return tmpCtx.createImageData(w, h);
  };

  return {
    filterImage: function(filter, hiddenCanvas, hiddenCtx, opts) {
      const args = [getPixels(hiddenCanvas, hiddenCtx)];

      for (let i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
      }

      return filter.apply(null, args);
    },

    blackandwhite: (pixels, targetCtx, opaque) => {
      const src = pixels.data;

      const sw = pixels.width;
      const sh = pixels.height;

      const w = sw; // pad output by the convolution matrix
      const h = sh;

      const output = createImageData(w, h);
      const dst = output.data;

      const alphaFac = opaque ? 1 : 0; // go through the destination image pixels

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const sy = y;
          const sx = x;

          const dstOff = (y * w + x) * 4;

          const color = (bg.curr == 0) ? 0 : 255;

          dst[dstOff] = (src[dstOff+3] > 50) ? color : color;
          dst[dstOff+1] = (src[dstOff+3] > 50) ? color : color;
          dst[dstOff+2] = (src[dstOff+3] > 50) ? color : color;
          dst[dstOff+3] = (src[dstOff+3] > 50) ? 255 : 0;
        }
      }

      targetCtx.putImageData(output, 0, 0);
    },

    convolute: (pixels, targetCtx, weights, opaque) => {
      const side = Math.round(Math.sqrt(weights.length));

      const halfSide = Math.floor(side/2);

      const src = pixels.data;

      const sw = pixels.width;
      const sh = pixels.height;

      const w = sw; // pad output by the convolution matrix
      const h = sh;

      const output = createImageData(w, h);

      const dst = output.data;

      const alphaFac = opaque ? 1 : 0; // go through the destination image pixels

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const sy = y;
          const sx = x;

          const dstOff = (y * w + x) * 4;

          let r = 0; // calculate the weighed sum of the source image pixels that fall under the convolution matrix
          let g = 0;
          let b = 0;
          let a = 0;

          for (var cy = 0; cy < side; cy++) {
            for (var cx = 0; cx < side; cx++) {
              const scy = sy + cy - halfSide;
              const scx = sx + cx - halfSide;

              if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                const srcOff = (scy * sw + scx) * 4;

                const wt = weights[cy*side+cx];

                r += src[srcOff] * wt;
                g += src[srcOff + 1] * wt;
                b += src[srcOff + 2] * wt;
                a += src[srcOff + 3] * wt;
              }
            }
          }

          dst[dstOff] = r;
          dst[dstOff + 1] = g;
          dst[dstOff + 2] = b;
          dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
      }

      targetCtx.putImageData(output, 0, 0);
    },
  };
};

export default new Filters();
