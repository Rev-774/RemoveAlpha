export function getResponseText(response, callback) {
  switch (typeof response) {
    case 'boolean':
    case 'number':
      callback(response.toString());
      return;

    case 'string':
      callback(response);
      return;
  }
  if (response instanceof Blob) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      callback(fileReader.result);
    };
    fileReader.readAsText(response);
    return;
  }
  // todo: ArrayBuffer?
  callback(JSON.stringify(response));
}


export function retrieve(url, type, callback) {
  const xhr = new XMLHttpRequest();
  if (type) {
    xhr.responseType = type;
  }
  xhr.open('GET', url);
  xhr.onload = () => {
    if (xhr.response && (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
      callback(false, xhr.response, xhr);
      return;
    }

    let errorMessage = `Server returned an error (${xhr.status}`;
    if (xhr.statusText) {
      errorMessage += ' ' + xhr.statusText;
    }
    errorMessage += ')';
    getResponseText(xhr.response || '', responseText => {
      if (responseText) {
        errorMessage += `:\n${responseText}`;
      }
      callback(errorMessage, xhr.response, xhr);
    });
  };
  xhr.onerror = () => {
    callback(xhr.status || xhr.statusText || 'Unknown client error', xhr.response, xhr);
  };
  xhr.onabort = () => {
    callback('Aborted by user', xhr.response, xhr);
  };
  xhr.ontimeout = () => {
    callback('Request timed out', xhr.response, xhr);
  };
  xhr.send();
  return xhr;
}


export function saveConfig(key, value) {
  if (value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}


export function loadConfig(key) {
  const rawValue = localStorage.getItem(key);
  if (rawValue == null) {
    return undefined;
  }
  return JSON.parse(rawValue);
}


export function toCamelCase(str) {
  str = str.replace(/^-+|-+$/g, '');
  str = str.replace(/-+/g, '-');
  str = str.replace(/-(.)/g, (m, c) => c.toUpperCase());
  return str;
}
