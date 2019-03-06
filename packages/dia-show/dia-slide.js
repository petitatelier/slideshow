import { LitElement, html } from "lit-element";
import { CommonStyles, DiaSlideStyles } from "./shared-styles.js";

export class DiaSlide extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaSlideStyles ];
  };

  static get properties() {
    return {
      id: { type: String },
      activeSlide: { type: String, attribute: false },
      activeDisplay: { type: String, attribute: false },
      hidden: { type: Boolean, reflect: true }
    }
  }

  render() {
    return html`
      <div>‹dia-slide ${this.id}›</div>
      <slot></slot>
    `;
  }

  constructor() {
    super();
    this.id = undefined;
    this.activeSlide = undefined;
    this.activeDisplay = undefined;
    this.hidden = false;
  }

  firstUpdated() {
    // Dispatch a 'slide-selected' event when the slide is clicked.  The detail
    // contains the `id` of the clicked slide.
    this.addEventListener("click", () => {
      var event = new CustomEvent("slide-selected", {
        detail: { slide: this.id }, bubbles: true, composed: true
      });
      this.dispatchEvent(event);
     });
  }

  updated( changedProperties) {
    console.log( `dia-slide[${this.id}] › updated()`, changedProperties);
    if( changedProperties.has( "activeSlide")) {
      this.querySelectorAll( "dia-po")
        .forEach(( element) => element.activeSlide = this.activeSlide);
      this.hidden = (typeof this.activeSlide !== "undefined"
                    && this.activeSlide !== this.id);
    }
    if( changedProperties.has( "activeDisplay")) {
      this.querySelectorAll( "dia-po")
        .forEach(( element) => element.activeDisplay = this.activeDisplay);
    }
    if( changedProperties.has( "id")) {
      this.querySelectorAll( "dia-po")
        .forEach(( element) => element.parentSlide = this.id);
    }
  }

}

// Register the element with the browser
customElements.define( "dia-slide", DiaSlide);
