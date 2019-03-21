'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var litElement = require('lit-element');

const 
  CommonStyles = litElement.css`
    :host([ hidden]) { display: none }
    button {
      display: inline-flex;
      font-size: 1em;
      background-color: white;
      padding: 0.25em 0.5em;
      border: 1px solid #cfcfcf;
      border-radius: 0.25em;
      height: 2em;
    }
    button:hover {
      box-shadow: 1px 1px 1px 0px #333;
      cursor: pointer;
    }
    img.small-user-profile {
      display: inline-flex;
      border-radius: 1em;
      height: 2em; width: 2em;
    }
  `,
  DiaShowStyles = litElement.css`
    :host {
      display: flex; flex-direction: column;
      position: relative;
      flex-grow: 1;
      box-sizing: border-box;
      border: 2px solid #ccc;
    }
    :host(:focus) {
      outline: none;
      border: 2px solid transparent;
    }
    :host(:fullscreen) {
      border: none;
    }

    /* Hides the display-selector and the clone button by default */
    dia-display-selector,
    button[id="cloneWindow"] {
      display: none;
    }

    :host([dashboard][speaker]) dia-display-selector,
    :host([dashboard][speaker]) button[id="cloneWindow"] {
      display: initial;
    }

    /* Hides the controller in the fullscreen mode */
    :host(:fullscreen) dia-controller {
      display: none;
    }

    dia-controller {
      z-index: 1;
      opacity: 0.95;
      display: flex;
      flex-direction: row;
      align-items: end;
      padding: 5px;
      background-color: white;
      box-shadow: 1px 1px 5px 1px #efefef;
    }
    dia-controller > * {
      margin-right: 5px;
    }

    :host(:not(:fullscreen)) dia-controller {
      position: absolute;
      top: 0px; right: 0px;
    }

    /* INFO */
    :host([speaker]) .info,
    :host([detached]) .info {
      display: block;
    }
    :host([speaker]) .info {
      color: var(--info-speaker-color, steelblue);
    }
    :host([detached]) .info {
      color: var(--info-detached-color, indianred);
    }
    .info {
      z-index: 1;
      display: none;
      position: absolute;
      bottom: 5px; right: 5px;
      padding: 10px;
      background-color: white;
      box-shadow: 2px 2px 5px 0px #afafaf;
    }
  `,
  DiaSlideStyles = litElement.css`
    :host {
      display: flex; flex-grow: 1;
    }
  `,
  DiaPoStyles = litElement.css`
    :host {
      display: flex; flex-direction: column;
      flex-grow: 1; box-sizing: border-box;
      background-color: var(--background-color, white);
      align-items: center; justify-content: center }
    :host([ default]) {
      box-shadow: 1px 1px 5px 1px #dfdfdf }
    :host([ fullbleed]) div {
      display: flex; flex-grow: 1;
      width: 100%; height: 100%;
      flex-direction: column }
  `,
  DiaDisplaySelectorStyles = litElement.css`
    :host { display: inline-flex }
    div.select {
      display: inline-flex;
      background-color: white;
      border-radius: 1em;
      padding: 0.25em 0.5em }
    span.item {
      padding: 0 0.5em;
      cursor: pointer;
      color: #333;
    }
    span.item:hover { text-decoration: underline }
    span.item:hover,
    span.item[ selected] { color: blue }
  `,
  DiaControllerStyles = litElement.css`
    :host {
      display: inline-flex;
    }
    dia-controller {
      opacity: 0.9;
      display: block;
      position: absolute;
      top: 55px; right: 5px;
      padding: 10px;
      background-color: white;
      box-shadow: 2px 2px 5px 0px #afafaf;
    }
  `;

exports.CommonStyles = CommonStyles;
exports.DiaControllerStyles = DiaControllerStyles;
exports.DiaDisplaySelectorStyles = DiaDisplaySelectorStyles;
exports.DiaPoStyles = DiaPoStyles;
exports.DiaShowStyles = DiaShowStyles;
exports.DiaSlideStyles = DiaSlideStyles;
