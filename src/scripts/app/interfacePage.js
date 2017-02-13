import {loadConfig, saveConfig, toCamelCase} from './util.js';
import {changeSource} from './conductor.js';
import {unloadAppPage} from './appPage.js';


const htmlElement = document.documentElement;
const interfacePageElement = document.getElementById('page-interface');
const fileInputElement = document.getElementById('input-file');
const urlInputFormElement = document.getElementById('form-url-input');
const urlInputElement = document.getElementById('input-url');
const backgroundColorInputElement = document.getElementById('input-background-color');
const checkeredSizeInputElement = document.getElementById('input-checkered-size');
const checkeredColor1InputElement = document.getElementById('input-checkered-color-1');
const checkeredColor2InputElement = document.getElementById('input-checkered-color-2');


fileInputElement.addEventListener('change', event => {
  const file = fileInputElement.files[0];
  changeSource(file);
});

urlInputFormElement.addEventListener('submit', event => {
  event.preventDefault();
  event.stopPropagation();
  if (!urlInputFormElement.checkValidity()) return;
  changeSource(urlInputElement.value);
});

// todo: maybe this should be in commonInterface or something
[
  ['--background-color', backgroundColorInputElement],
  ['--checkered-size', checkeredSizeInputElement],
  ['--checkered-color-1', checkeredColor1InputElement],
  ['--checkered-color-2', checkeredColor2InputElement],
].forEach(v => {
  const property = v[0];
  const element = v[1];
  const camelProperty = toCamelCase(property);

  function fromConfigValue(value) {
    if (element.type === 'number') return value;
    if (element.type === 'color') {
      if (/^#[\da-f]{3}$/i.test(value)) return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
    }
    return value;
  }

  function toConfigValue(value) {
    if (element.type === 'number') {
      if (!value) return 0;
      const v = parseInt(value, 10);
      if (isNaN(v) || !isFinite(v)) return 0;
      return v;
    }
    return value;
  }

  function configValueToProperty(value) {
    if (typeof value === 'number') return value ? `${value}px` : '0';
    return value;
  }

  element.value = fromConfigValue(loadConfig(camelProperty));

  function syncProperty() {
    const value = toConfigValue(element.value);
    saveConfig(camelProperty, value);
    htmlElement.style.setProperty(property, configValueToProperty(value));
  }

  element.addEventListener('change', syncProperty);
  element.addEventListener('keyup', syncProperty);
  syncProperty();
});


export function unloadInterfacePage() {
  interfacePageElement.classList.add('fx-fade-hidden');
}

export function bootInterfacePage() {
  unloadAppPage();
  interfacePageElement.classList.remove('fx-fade-hidden');
}
