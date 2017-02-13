import {gotoTopPage, reload} from './conductor.js';


const backToTopButtonElements = document.getElementsByClassName('back-to-top-button');
const reloadButtonElements = document.getElementsByClassName('reload-button');


Array.from(reloadButtonElements).forEach(element => {
  element.addEventListener('click', event => {
    reload();
  });
});

Array.from(backToTopButtonElements).forEach(element => {
  element.addEventListener('click', event => {
    gotoTopPage();
  });
});
