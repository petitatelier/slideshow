import { LitElement, html, css } from "lit-element";
import { CommonStyles, DiaDisplaySelectorStyles } from "@petitatelier/dia-styles";

export class DiaDisplaySelector extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaDisplaySelectorStyles ];
  }

  static get properties() {
    return {
      displayList: { type: Set, attribute: false }, // An object of type `Set` actually
      selectedDisplayId: { type: String, attribute: false } // Identifier of the selected display
    }
  }

  render() {
    return html`<div class="select">${
        Array.from( this.displayList.values())
          .map(( displayId) =>
            html`<span id="${displayId}" class="item"
                       ?selected="${(displayId === this.selectedDisplayId)}"
                       @click=${this._onSelected}>${displayId}</span>`)
      }</div>`;
  }

  constructor() {
    super();
    this.displayList = new Set();
    this.selectedDisplayId = undefined;
  }

  _onSelected( e) {
    const selectedDisplayId = e.target.id;
    this.dispatchEvent(
      new CustomEvent( "display-selected", {
        detail: { display: selectedDisplayId },
        bubbles: true, composed: true
      })
    );
    this.selectedDisplayId = selectedDisplayId;
  }
}

// Register the element with the browser
customElements.define( "dia-display-selector", DiaDisplaySelector);