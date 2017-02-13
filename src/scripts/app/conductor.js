import {defaultProtocol, defaultCORSProxy, useHashString, isValidProxyId, isProxySupported} from './config.js';

import {retrieve} from './util.js';
import {autoWrapCORSProxy} from './config.js';
import {hideErrorDialog, showProxySelector, hideProxySelector} from './errorDialog.js';
import {prepareAppPage, bootAppPage} from './appPage.js';
import {bootInterfacePage} from './interfacePage.js';


let oldState, oldLocation;


function changeState(url, state, replace = false) {
  const title = '';
  if (replace) {
    history.replaceState(state, title, url);
  } else {
    history.pushState(state, title, url);
  }
  initialize();
}


function determineSource() {
  function autoDecodeURL(str) {
    return (/^[%\w.!~*'()-]+$/.test(str) && !/%.?([^\da-f]|$)/i.test(str)) ? decodeURIComponent(str) : str;
  }

  function getFromQueryString() {
    let query = location.search.substr(1);
    if (!query) return;

    // '?x=https://example.org&y=z', '?x=https://example.org', ...
    // else: '?https://example.org', '?https://example.org?query=something', ...
    if (/^.*=/.test(query)) {
      const match = query.match(/^.*?=(.*?)(?:&|$)/);
      if (!match) return;
      query = match[1];
      query = decodeURIComponent(query);
    } else {
      query = autoDecodeURL(query);
    }

    return query;
  }

  function getFromHashString() {
    let hash = location.hash.substr(1);
    if (!hash) return;

    function trimPrefix(str) {
      return str.replace(/^[!?#]+/, '');
    }

    hash = trimPrefix(autoDecodeURL(trimPrefix(hash)));

    return hash;
  }

  let url = getFromQueryString() || getFromHashString();
  if (!url) return undefined;

  let proxyId;
  {
    const match = url.match(/^(?:(\d+)|\*)?;(.*)$/);
    if (match) {
      if (!match[1]) {
        // for future use
        return {
          isEphemeral: true,
          url,
        };
      }

      proxyId = parseInt(match[1], 10);
      url = match[2];
    }
  }

  if (proxyId !== undefined && !isValidProxyId(proxyId)) {
    proxyId = null;
  }

  if (!isProxySupported(url)) {
    return {
      isEphemeral: false,
      url,
    };
  }

  url = url.replace(/^(?:(?:(?:h?t)?t)?p)?(s)?(?=:)/i, (m, s) => m && ('http' + (s || '')));

  const protocol = (i => ~i ? url.substr(0, i).toLowerCase() : undefined)(url.indexOf(':'));
  if (protocol && protocol !== 'http' && protocol !== 'https') {
    // FTP will never be supported...
    throw new Error(`Unsupported protocol: ${protocol}`);
  }

  if (!protocol) {
    console.info(`Protocol not specified, assumed as ${defaultProtocol}`);
    url = url.replace(/^:?\/*/, defaultProtocol);
  }

  return proxyId !== undefined ? {
    isEphemeral: false,
    proxyId,
    url,
  } : {
    isEphemeral: false,
    url,
  };
}


export let source = determineSource();


export function initialize() {
  function bootAppByUrl(url, proxyId) {
    if (!isValidProxyId(proxyId)) proxyId = defaultCORSProxy;

    const retryWithSelectorElement = document.getElementById('retry-with-selector');
    const optionElements = retryWithSelectorElement.getElementsByTagName('option');
    Array.from(optionElements)
      .find(element => parseInt(element.value, 10) === proxyId)
      .selected = true;

    const wrappedUrl = autoWrapCORSProxy(url, proxyId);
    prepareAppPage();
    showProxySelector();
    retrieve(wrappedUrl, 'blob', (err, blob, xhr) => {
      if (err) {
        console.log(xhr);
        throw new Error(err);
      }
      bootAppPage(blob);
    });
  }

  function bootAppByBlob(blob) {
    prepareAppPage();
    hideProxySelector();
    bootAppPage(blob);
  }


  const {state} = history;
  source = determineSource();

  console.log(state, source);

  if (state === oldState && location.href === oldLocation) {
    return;
  }
  oldState = state;
  oldLocation = location.href;

  hideErrorDialog();

  if (state) {
    if (state.blob) {
      bootAppByBlob(state.blob);
    } else {
      bootAppByUrl(state.url, state.proxyId);
    }
  } else {
    if (!source || !source.url || source.isEphemeral) {
      if (location.hash || location.search) {
        // invalid url or ephemeral object
        gotoTopPage(true);
        return;
      }
      bootInterfacePage();
      return;
    }

    if (source.proxyId === null) {
      // invalid proxy id
      changeSource(source.url, null, true);
      return;
    }

    bootAppByUrl(source.url, source.proxyId);
  }
}


export function gotoTopPage(replace = false) {
  changeState('./', null, replace);
}


export function reload(replace = true) {
  /*
  location.reload();
  /*/
  oldLocation = null;
  initialize();
  //*/
}


export function changeSource(target, subParam, replace = false) {
  function createHistoryByUrl(url, proxyId) {
    const isProxyIdValid = isValidProxyId(proxyId);

    const state = {
      url,
    };
    if (isProxyIdValid) {
      state.proxyId = proxyId;
    }

    return {
      url: (isProxyIdValid ? proxyId + ';' : '') + url,
      state,
    };
  }

  function createHistoryByBlob(blob, fileName) {
    // to make blob permanent
    blob = blob.slice();

    return {
      url: `*;local:${fileName}`,
      state: {
        blob,
      },
    };
  }

  const object = (typeof target === 'string' ? createHistoryByUrl : createHistoryByBlob)(target, subParam);
  const url = './' + (useHashString ? '#' : '?') + object.url;
  changeState(url, object.state, replace);
}



window.addEventListener('popstate', event => {
  initialize();
});

/*
window.addEventListener('hashchange', event => {
  initialize();
});
//*/
