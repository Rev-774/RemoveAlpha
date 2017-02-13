import './errorHandler.js';

import {CORSProxyWrappers} from './config.js';

import {saveConfig} from './util.js';
import {isValidProxyId} from './config.js';
import {source, changeSource} from './conductor.js';


const errorContainerElement = document.getElementById('error-container');
const retryWithMessageElement = document.getElementById('retry-with-message');
const retryWithSelectorElement = document.getElementById('retry-with-selector');


export function hideErrorDialog() {
  errorContainerElement.classList.add('fx-fade-hidden');
}

export function showProxySelector() {
  retryWithMessageElement.style.display = 'initial';
}

export function hideProxySelector() {
  // because visibility: collapse is bugggy
  retryWithMessageElement.style.display = 'none';
}


// prepare CORS proxy selector in the error dialog
{
  let currentOptgroupElement;
  CORSProxyWrappers.forEach((element, index) => {
    const isOption = typeof element === 'object';
    if (isOption) {
      // <option>
      const optionElement = document.createElement('option');
      optionElement.value = index;
      optionElement.innerText = element[0];
      (currentOptgroupElement || retryWithSelectorElement).appendChild(optionElement);
    } else {
      // <optgroup>
      if (currentOptgroupElement) {
        retryWithSelectorElement.appendChild(currentOptgroupElement);
      }
      if (element) {
        currentOptgroupElement = document.createElement('optgroup');
        currentOptgroupElement.label = element;
      } else {
        currentOptgroupElement = undefined;
      }
    }
  });

  if (currentOptgroupElement) {
    retryWithSelectorElement.appendChild(currentOptgroupElement);
  }
}

retryWithSelectorElement.addEventListener('change', event => {
  const proxyId = parseInt(retryWithSelectorElement.value, 10);
  if (!isValidProxyId(proxyId)) return;   // in case
  saveConfig('defaultCORSProxy', proxyId);
  changeSource(source.url, proxyId);
});
