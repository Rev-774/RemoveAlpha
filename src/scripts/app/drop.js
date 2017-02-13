import {changeSource} from './conductor.js';


const dropTargetElement = document.getElementById('pages');
const dropOverlayElement = document.getElementById('drop-overlay');


function isDroppingObjectAcceptable(dataTransfer) {
  return Array.from(dataTransfer.types).some(type => /^Files$|^image\/|^text\/uri-list\b/i.test(type));
}


let counter = 0;

function onDragEnter(event) {
  if (counter++) return;
  if (!isDroppingObjectAcceptable(event.dataTransfer)) return;
  dropOverlayElement.classList.remove('fx-fade-hidden');
}

function onDragLeave(event) {
  if (--counter) return;
  dropOverlayElement.classList.add('fx-fade-hidden');
}

function onDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
  const {dataTransfer} = event;
  dataTransfer.dropEffect = dataTransfer.effectAllowed = isDroppingObjectAcceptable(dataTransfer) ? 'copy' : 'none';
}

function onDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  counter = 0;
  dropOverlayElement.classList.add('fx-fade-hidden');

  const {dataTransfer} = event;
  if (!isDroppingObjectAcceptable(dataTransfer)) return;  // in case

  const object = (() => {
    const {files, items} = dataTransfer;

    const imageFile = Array.from(files).find(file => /^image\//i.test(file.type));
    if (imageFile) {
      return imageFile;
    }

    const imageItem = Array.from(items).find(item => /^image\//i.test(item.type));
    if (imageItem) {
      return imageItem.getAsFile();
    }

    // returns a negative if it is inappropriate
    function assessUrl(url) {
      const dataURIMatch = url.match(/^data:([^;]+)/i);
      if (dataURIMatch) {
        const mime = dataURIMatch[1];
        if (/^image\//i.test(mime)) {
          if (/^\/png/i.test(mime)) {
            return 299;
          }
          return 290;
        }
        if (/^application(\/octet-stream)?$/i.test(mime)) {
          return 280;
        }
        if (/^multipart\/?$/i.test(mime)) {
          // maybe processable
          return 270;
        }
        return -1;
      }

      if (!/^https?:\/\//.test(url)) {
        // maybe file:, in the future ...
        return -1;
      }

      const extensionMatch = url.match(/^[^:]+:\/\/[^#?]+\/[^/#?]*(\.[^./]*(?=[#?]|$))/);
      if (extensionMatch && extensionMatch[1]) {
        const extension = extensionMatch[1].toLowerCase().replace(/:.*/, '');
        switch (extension) {
          case '.png':
            return 190;

          //case '.flif':
          //case '.psd':
          //case '.tga':
          case '.gif':
          case '.webp':
            return 180;

          case '.bmp':
          case '.jpg':
          case '.jpeg':
          case '.tif':
          case '.tiff':
            return 100;
        }
      }

      //return 0;
      return -1;
    }

    const urls = (dataTransfer.getData('text/uri-list') || '').split('\n').filter(url => url && url[0] !== '#');
    urls.sort((a, b) => assessUrl(b) - assessUrl(a));

    if (urls[0] && assessUrl(urls[0]) >= 0) {
      return urls[0];
    }

    return null;
  })();

  if (!object) return;

  if (typeof object === 'string') {
    changeSource(object);
  } else {
    changeSource(object, object.name || '?');
  }
}

[dropTargetElement, dropOverlayElement].forEach(element => {
  element.addEventListener('dragenter', onDragEnter);
  element.addEventListener('dragleave', onDragLeave);
  element.addEventListener('dragover', onDragOver);
  element.addEventListener('drop', onDrop);
});


// disable default drop behavior
Array.from(document.querySelectorAll('.no-drop')).forEach(element => {
  element.addEventListener('dragover', event => {
    event.preventDefault();
    event.stopPropagation();
    const {dataTransfer} = event;
    dataTransfer.dropEffect = dataTransfer.effectAllowed = 'none';
  });

  element.addEventListener('drop', event => {
    event.preventDefault();
    event.stopPropagation();
  });
});
