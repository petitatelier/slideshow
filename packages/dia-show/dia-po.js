import { LitElement, html } from "lit-element";
import { CommonStyles, DiaPoStyles } from "./shared-styles.js";

export class DiaPo extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaPoStyles ];
  }

  static get properties() {
    return {
      // Public observed properties/attributes, set by slideshow author
      display: { type: String },    // Target display of the diapositive
      default: { type: Boolean },   // Diapositive displayed to audience (which has a single display)

      // Computed property, set by parent ‹dia-slide›, reflected
      // to an attribute, to allow CSS selectors to act upon it
      hidden: { type: Boolean, reflect: true },

      // Computed properties, set by parent ‹dia-slide›, with no
      // linked attribute; we want to set/read/observe them, but
      // not expose them as attributes in the DOM
      parentSlide: { type: String, attribute: false },
      activeSlide: { type: String, attribute: false },
      activeDisplay: { type: String, attribute: false },
    }
  }

  render() {
    return html`
      <slot>
        <div>‹dia-po ${this.display}›</div>
      </slot>
    `;
  }

  constructor() {
    super();

    // Register event listeners
    this.addEventListener( "click", this._onClick);

    // Public observed properties
    this.display = undefined;
    this.default = false;
    this.hidden = false;
    this.parentSlide = undefined;
    this.activeSlide = undefined;
    this.activeDisplay = undefined;
  }

  // When a ‹dia-po› is clicked and we are in « summary / contact
  // sheet », dispatch the `slide-selected` and `display-selected`
  // events towards ‹dia-show›, to request it to switch to the
  // combination of slide/display linked to the diapo.
  _onClick( e) {
    // Noop when on a single slide/display, that is, not on « contact sheet »
    // (as ‹dia-show›'s updated handler won't be called by Lit-Element,
    // if we don't actually change slide/display)
    e.stopPropagation();
    this.dispatchEvent( new CustomEvent( "slide-selected", {
      detail: { slide: this.parentSlide },
      bubbles: true, composed: true
    }));
    this.dispatchEvent( new CustomEvent("display-selected", {
      detail: { display: this.display },
      bubbles: true, composed: true
    }));
  }

  updated( changedProperties) {
    console.debug( `dia-po[${this.parentSlide}:${this.display}] › updated()`, changedProperties);
    if( changedProperties.has( "activeSlide")
        || changedProperties.has( "activeDisplay")) {
      this._updatedActiveSlideOrDisplay();
    }
    if( changedProperties.has( "hidden")) {
      this._updatedHidden();
    }
  }

  _updatedActiveSlideOrDisplay() {
    this.hidden = (typeof this.activeDisplay !== "undefined"
      && typeof this.display !== "undefined"
      && this.activeDisplay !== this.display)
      || (typeof this.activeSlide !== "undefined"
        && typeof this.parentSlide !== "undefined"
        && this.activeSlide !== this.parentSlide);
  }

  _updatedHidden() {
    this.querySelectorAll( "dia-livecode")
      .forEach(( element) => element.hidden = this.hidden);
  }

}

// Register the element with the browser
customElements.define( "dia-po", DiaPo);
