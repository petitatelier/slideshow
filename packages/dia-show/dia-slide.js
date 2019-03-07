import { LitElement, html } from "lit-element";
import { CommonStyles, DiaSlideStyles } from "./shared-styles.js";

export class DiaSlide extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaSlideStyles ];
  };

  static get properties() {
    return {
      // Public observed property/attribut, set by the slideshow author
      id: { type: String },   // Identifier of the slides (must be unique among all slides)

      // Computed property, set by parent ‹dia-slide›, reflected
      // to an attribute, to allow CSS selectors to act upon it
      hidden: { type: Boolean, reflect: true },

      // Computed properties, set by parent ‹dia-show›, with no
      // linked attribute; we want to set/read/observe them, but
      // not expose them as attributes in the DOM
      activeSlide: { type: String, attribute: false },
      activeDisplay: { type: String, attribute: false }
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

    // Register event listeners
    this.addEventListener( "click", this._onClick);

    // Public observed properties
    this.id = undefined;
    this.activeSlide = undefined;
    this.activeDisplay = undefined;
    this.hidden = false;
  }

  // When a ‹dia-slide› is clicked and we are in « summary / contact
  // sheet », dispatch a `slide-selected` event towards ‹dia-show›,
  // to request it to switch to the slide clicked.
  _onClick( e) {
    // Noop when on a single slide, that is, not on « contact sheet »
    // (as ‹dia-show›'s updated handler won't be called by Lit-Element,
    // if we don't actually change slide)
    e.stopPropagation();
    this.dispatchEvent( new CustomEvent("slide-selected", {
      detail: { slide: this.id },
      bubbles: true, composed: true
    }));
  }

  updated( changedProperties) {
    console.debug( `dia-slide[${this.id}] › updated()`, changedProperties);
    if( changedProperties.has( "activeSlide")) {
      this._updatedActiveSlide();
    }
    if( changedProperties.has( "activeDisplay")) {
      this._updatedActiveDisplay();
    }
    if( changedProperties.has( "id")) {
      this._updatedId();
    }
  }

  _updatedActiveSlide() {
    this.querySelectorAll( "dia-po")
      .forEach(( element) => element.activeSlide = this.activeSlide);

    this.hidden = (typeof this.activeSlide !== "undefined"
                  && this.activeSlide !== this.id);
  }

  _updatedActiveDisplay() {
    this.querySelectorAll( "dia-po")
      .forEach(( element) => element.activeDisplay = this.activeDisplay);
  }

  _updatedId() {
    this.querySelectorAll( "dia-po")
      .forEach(( element) => element.parentSlide = this.id);
  }

}

// Register the element with the browser
customElements.define( "dia-slide", DiaSlide);
