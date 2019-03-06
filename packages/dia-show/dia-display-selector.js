import { LitElement, html, css } from "lit-element";
import { CommonStyles, DiaDisplaySelectorStyles } from "./shared-styles.js";

export class DiaDisplaySelector extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaDisplaySelectorStyles ];
  }

  static get properties() {
    return {
      displayList: { type: Object, attribute: false } // an object of type `Set` actually
    }
  }

  render() {
    return html`<div class="select">${
        Array.from( this.displayList.values())
          .map(( display) =>
            html`<span id="${display}" class="item"
                       @click=${this._onSelected}>${display}</span>`)
      }</div>`;
  }

  constructor() {
    super();
    this.displayList = new Set();
  }

  _onSelected( e) {
    const selectedDisplay = e.target.id;
    this.dispatchEvent(
      new CustomEvent( "display-selected", {
        detail: { display: selectedDisplay },
        bubbles: true, composed: true
      })
    );
  }
}

// Register the element with the browser
customElements.define( "dia-display-selector", DiaDisplaySelector);