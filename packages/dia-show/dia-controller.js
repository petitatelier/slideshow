import { LitElement, html } from "lit-element";

export class DiaController extends LitElement {

  static get properties() {
    return {
    }
  }

  render() {
    return html`
      <div>‹dia-controller ${this.id}›</div>
      <slot></slot>
    `;
  }
}

// Register the element with the browser
customElements.define( "dia-controller", DiaController);
