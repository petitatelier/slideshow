import { LitElement, html } from "lit-element";
import { CommonStyles, DiaPoStyles } from "./shared-styles.js";

export class DiaPo extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaPoStyles ];
  };

  render() {
    return html`
      <div>‹dia-po›</div>
      <slot></slot>
    `;
  }

}

// Register the element with the browser
customElements.define( "dia-po", DiaPo);