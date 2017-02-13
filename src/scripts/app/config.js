import {loadConfig, saveConfig} from './util.js';


export const proxyUnsupportedURLPatterns = [
  /^data:/i,
  // /^file:/i,
];

export const CORSSupportedURLPatterns = [
  /^https?:\/\/crossorigin\.me(\/|$)/i,
  /^https?:\/\/cors-anywhere\.herokuapp\.com(\/|$)/i,
];

// '%u' will be replaced by `url`
// '%U' will be replaced by `encodeURIComponent(url)`, in the future
export const CORSProxyWrappers = [
  'SSL',
  [
    'crossorigin.me (SSL)',
    'https://crossorigin.me/%u',
  ],
  [
    'CORS Anywhere (SSL)',
    'https://cors-anywhere.herokuapp.com/%u',
  ],
  'Non-SSL',
  [
    'crossorigin.me (Non-SSL)',
    'http://crossorigin.me/%u',
  ],
  [
    'CORS Anywhere (Non-SSL)',
    'http://cors-anywhere.herokuapp.com/%u',
  ],
  'Other',
  [
    'No CORS proxy: Access directly',
    '%u',
  ],
];


export function isValidProxyId(proxyId) {
  if (typeof proxyId !== 'number') return false;
  if (isNaN(proxyId) || !isFinite(proxyId)) return false;
  if (proxyId < 0 || proxyId >= CORSProxyWrappers.length) return false;
  if (typeof CORSProxyWrappers[proxyId] !== 'object') return false;
  return true;
}


export function isProxySupported(url) {
  return !proxyUnsupportedURLPatterns.some(r => r.test(url));
}


export function isCORSSupported(url) {
  return CORSSupportedURLPatterns.some(r => r.test(url));
}


export function wrapCORSProxy(url, proxyId) {
  if (!isValidProxyId(proxyId)) proxyId = defaultCORSProxy;
  let wrappedUrl = CORSProxyWrappers[proxyId][1];
  wrappedUrl = wrappedUrl.replace(/%u/g, url);
  //wrappedUrl = wrappedUrl.replace(/%U/g, encodeURIComponent(url));
  return wrappedUrl;
}


export function autoWrapCORSProxy(url, proxyId) {
  return (isProxySupported(url) && !isCORSSupported(url)) ? wrapCORSProxy(url, proxyId) : url;
}


function fallback(value, defaultValue, condition = 'sameType') {
  if (value === undefined) return defaultValue;
  if (condition) {
    switch (typeof condition) {
      case 'string':
        {
          const type = condition === 'sameType' ? typeof defaultValue : condition;
          if (typeof value !== type) return defaultValue;
        }
        break;

      case 'function':
        if (!condition(value)) return defaultValue;
        break;
    }
  }
  return value;
}


function loadSaveConfig(key, defaultValue, condition = 'sameType') {
  const rawValue = loadConfig(key);
  const value = fallback(rawValue, defaultValue, condition);
  saveConfig(key, value);
  return value;
}


export const defaultProtocol = loadSaveConfig('defaultProtocol', 'http://');

export const defaultCORSProxy = loadSaveConfig('defaultCORSProxy', 1, isValidProxyId);   // https://crossorigin.me

export const useHashString = loadSaveConfig('useHashString', true);

export const backgroundColor = loadSaveConfig('backgroundColor', '#F5F5F5');

export const checkeredSize = loadSaveConfig('checkeredSize', 11, v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v > 0);

export const checkeredColor1 = loadSaveConfig('checkeredColor1', '#FFF');

export const checkeredColor2 = loadSaveConfig('checkeredColor2', '#EEE');
