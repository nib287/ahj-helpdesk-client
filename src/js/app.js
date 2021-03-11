import '../style.css';
import Controller from './сontroller.js';
import XHR from './xhr.js';

const xhr = new XHR();
const controller = new Controller(xhr);
controller.init();