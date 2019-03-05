import { LitElement, html } from "lit-element";
import { CommonStyles, DiaShowStyles } from "./shared-styles.js";

export class DiaShow extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaShowStyles ];
  };

  render() {
    return html`
      <div>‹dia-show›</div>
      <slot></slot>
    `;
  }

}

// Register the element with the browser
customElements.define( "dia-show", DiaShow);