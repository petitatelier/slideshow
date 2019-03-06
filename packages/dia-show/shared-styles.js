import { css } from "lit-element";

const
  CommonStyles = css`
    :host([ hidden]) { display: none }
    button {
      background-color: white;
      border-radius: 1em;
      padding: 0.25em 0.5em;
      font-size: 1em
    }
  `,
  DiaShowStyles = css`
    :host {
      display: flex; flex-direction: column;
      flex-grow: 1;
      background-color: lightgray
    }
  `,
  DiaSlideStyles = css`
    :host {
      display: flex; flex-grow: 1;
      background-color: red
    }
  `,
  DiaPoStyles = css`
    :host {
      display: flex; flex-direction: column;
      flex-grow: 1; box-sizing: border-box;
      background-color: green;
      border: 1px dashed black }
    :host([ default]) {
      border: 2px solid red }
  `,
  DiaDisplaySelectorStyles = css`
    :host { display: inline-flex }
    div.select {
      display: inline-flex;
      background-color: white;
      border-radius: 1em;
      padding: 0.25em 0.5em }
    span.item {
      padding: 0 0.5em;
      cursor: pointer }
    span.item:hover {
      color: blue }
  `;

export {
  CommonStyles,
  DiaShowStyles,
  DiaSlideStyles,
  DiaPoStyles,
  DiaDisplaySelectorStyles
};