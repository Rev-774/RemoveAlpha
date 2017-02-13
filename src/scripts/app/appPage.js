import loadImage from './loadImage.js';
import {unloadInterfacePage} from './interfacePage.js';


const appPageElement = document.getElementById('page-app');
const spinnerElement = document.getElementById('spinner');
const srcImageElement = document.getElementById('image-source');
const resImageElement = document.getElementById('image-result');



[srcImageElement, resImageElement].forEach((element, i, a) => {
  const otherElement = a[1 - i];
  element.addEventListener('click', event => {
    otherElement.classList.remove('fx-fade-hidden');
    element.classList.add('fx-fade-hidden');
  });
});


export function prepareAppPage() {
  unloadInterfacePage();
  srcImageElement.src = '';
  resImageElement.src = '';
  srcImageElement.classList.add('fx-fade-hidden');
  resImageElement.classList.add('fx-fade-hidden');
  appPageElement.classList.remove('fx-fade-hidden');
  spinnerElement.classList.remove('fx-fade-hidden');
}


export function bootAppPage(srcBlob) {
  // make sure to call prepareAppPage() in advance

  function finalProcess() {
    spinnerElement.classList.add('fx-fade-hidden');
    srcImageElement.click();
  }

  srcImageElement.classList.remove('fx-fade-hidden');
  {
    const srcBlobUrl = URL.createObjectURL(srcBlob);
    srcImageElement.onload = () => {
      URL.revokeObjectURL(srcBlobUrl);
    };
    srcImageElement.src = srcBlobUrl;
  }

  loadImage(srcBlob, imageData => {
    if (!imageData) {
      throw new Error('Unsupported format');
    }

    for (let i = 3; i < imageData.data.length; i += 4) {
      imageData.data[i] = 255;
    }

    const {width, height} = imageData;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.putImageData(imageData, 0, 0);

    canvas.toBlob(resBlob => {
      const resBlobUrl = URL.createObjectURL(resBlob);
      resImageElement.onload = () => {
        URL.revokeObjectURL(resBlobUrl);
        finalProcess();
      };
      resImageElement.src = resBlobUrl;
    }, 'image/png');
  });
}


export function unloadAppPage() {
  //spinnerElement.classList.add('fx-fade-hidden');
  appPageElement.classList.add('fx-fade-hidden');
}
