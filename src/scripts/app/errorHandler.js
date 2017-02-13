const errorContainerElement = document.getElementById('error-container');


window.onerror = (message, source, line, column, error) => {
  document.getElementById('error-summary').innerText = `An error has occurred in ${source} at #${line}:${column}`;
  document.getElementById('error-detail').innerText = message;

  errorContainerElement.classList.remove('fx-fade-hidden');
};
