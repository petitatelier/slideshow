import { LitElement, html } from "lit-element";
import { CommonStyles, DiaPoStyles } from "./shared-styles.js";

export class DiaPo extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaPoStyles ];
  };

  static get properties() {
    return {
      display: { type: String },
      hidden: { type: Boolean, reflect: true }
    }
  }

  render() {
    return html`
      <div>‹dia-po ${this.display}›</div>
      <slot></slot>
    `;
  }

  constructor() {
    super();
    this.display = undefined;
    this.hidden = false;
  }

  updated( changedProperties) {
    if( changedProperties.has( "hidden")) {
      this.querySelectorAll( "dia-livecode")
        .forEach(( element) => element.hidden = this.hidden);
    }
  }

}

// Register the element with the browser
customElements.define( "dia-po", DiaPo);