/* global PNG, Uint8Array, Uint32Array */


function createCanvasContext(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext('2d');
}


function loadImageByPNGJS(blob, callback) {
  function testPNG(callback) {
    if (blob.size <= 8) return callback(false);

    const headerBlob = blob.slice(0, 8);

    const fileReader = new FileReader();

    fileReader.onload = () => {
      const i32a = new Uint32Array(fileReader.result);
      if (i32a[0] !== 0x474E5089 || i32a[1] !== 0x0A1A0A0D) {
        callback(false);
        return;
      }
      callback(true);
    };

    fileReader.readAsArrayBuffer(headerBlob);
  }

  function loadPNG(callback) {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      const data = new Uint8Array(fileReader.result);
      const png = new PNG(data);
      const {width, height} = png;

      const context = createCanvasContext(width, height);

      const imageData = context.createImageData(width, height);
      png.copyToImageData(imageData, png.decodePixels());

      callback(imageData);
    };

    fileReader.readAsArrayBuffer(blob);
  }

  testPNG(isPNG => {
    if (!isPNG) {
      callback(false);
      return;
    }
    loadPNG(callback);
  });
}


function loadImageByCanvas(blob, callback) {
  console.info('Using HTML + Canvas to load the image.\nThis may results in unproper output.');

  const blobURL = URL.createObjectURL(blob);

  const image = new Image();

  image.onload = () => {
    URL.revokeObjectURL(blobURL);

    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    const context = createCanvasContext(width, height);
    context.globalCompositeOperation = 'copy';
    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(0, 0, width, height);
    callback(imageData);
  };

  image.onerror = () => {
    image.onload = null;
    URL.revokeObjectURL(blobURL);
    callback(false);
  };

  image.src = blobURL;
}



/**
 * @param {Blob} blob - BLOB of image
 * @param {loadImage~callback} callback - Callback function
 */
export default function loadImage(blob, callback) {
  const methods = [
    loadImageByPNGJS,
    loadImageByCanvas,
  ];

  (function tryNextMethod() {
    if (methods.length === 0) {
      callback(false);
      return;
    }

    const method = methods.shift();

    method(blob, data => {
      if (data) {
        callback(data);
        return;
      }
      tryNextMethod();
    });
  })();
}


/**
 * Callback
 * @callback loadImage~callback
 * @param {ImageData} imageData - ImageData object
 */
