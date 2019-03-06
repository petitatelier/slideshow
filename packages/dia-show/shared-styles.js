import { css } from "lit-element";

const
  CommonStyles = css`
    :host([ hidden]) { display: none }
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
  `;

export {
  CommonStyles,
  DiaShowStyles,
  DiaSlideStyles,
  DiaPoStyles
};