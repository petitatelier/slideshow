import { LitElement, html } from "lit-element";
import { CommonStyles, DiaSlideStyles } from "./shared-styles.js";

export class DiaSlide extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaSlideStyles ];
  };

  static get properties() {
    return {
      id: { type: String }
    }
  }

  render() {
    return html`
      <div>‹dia-slide ${this.id}›</div>
      <slot></slot>
    `;
  }

}

// Register the element with the browser
customElements.define( "dia-slide", DiaSlide);