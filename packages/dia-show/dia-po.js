import { LitElement, html } from "lit-element";
import { CommonStyles, DiaPoStyles } from "./shared-styles.js";

export class DiaPo extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaPoStyles ];
  }

  static get properties() {
    return {
      display: { type: String },
      parentSlide: { type: String, attribute: false },
      activeSlide: { type: String, attribute: false },
      activeDisplay: { type: String, attribute: false },
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
    this.parentSlide = undefined;
    this.activeSlide = undefined;
    this.activeDisplay = undefined;
    this.hidden = false;
  }

  firstUpdated() {
    // First a 'dia-po-clicked' event when the `dia-po` is clicked The detail
    // contains the specified `display` and the `id` of the parent slide.
    this.addEventListener("click", () => {
      var event = new CustomEvent("dia-po-clicked", {
        detail: { slide: this.parentSlide, display: this.display }, bubbles: true, composed: true
      });
      this.dispatchEvent(event);
     });
  }

  updated( changedProperties) {
    console.log( `dia-po[${this.parentSlide}:${this.display}] › updated()`, changedProperties);
    if( changedProperties.has( "activeSlide") || changedProperties.has( "activeDisplay")) {
      this.hidden = ( typeof this.activeDisplay !== "undefined"
                      && typeof this.display !== "undefined"
                      && this.activeDisplay !== this.display)
                  ||( typeof this.activeSlide !== "undefined"
                      && typeof this.parentSlide !== "undefined"
                      && this.activeSlide !== this.parentSlide);
    }
    if( changedProperties.has( "hidden")) {
      this.querySelectorAll( "dia-livecode")
        .forEach(( element) => element.hidden = this.hidden);
    }
  }

}

// Register the element with the browser
customElements.define( "dia-po", DiaPo);
