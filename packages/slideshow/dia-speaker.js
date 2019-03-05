import { LitElement, html } from "lit-element";
import { CommonStyles, DiaSpeakerStyles } from "./shared-styles.js";

export class DiaSpeaker extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaSpeakerStyles ];
  };

  render() {
    return html`
      <div>‹dia-speaker›</div>
      <slot></slot>
    `;
  }

}

// Register the element with the browser
customElements.define( "dia-speaker", DiaSpeaker);