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

    // Register event listeners
    this.addEventListener( "click", this._onClick);

    // Public observed properties
    this.display = undefined;
    this.parentSlide = undefined;
    this.activeSlide = undefined;
    this.activeDisplay = undefined;
    this.hidden = false;
  }

  // When a ‹dia-po› is clicked and we are in « summary / contact
  // sheet », dispatch the `slide-selected` and `display-selected`
  // events towards ‹dia-show›, to request it to switch to the
  // combination of slide/display linked to the diapo.
  _onClick( e) {
    // TODO: noop when not in « summary / contact sheet »
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
