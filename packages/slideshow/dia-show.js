import { LitElement, html } from "lit-element";
import { CommonStyles, DiaShowStyles } from "./shared-styles.js";

export class DiaShow extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaShowStyles ];
  };

  static get properties() {
    return {
      // Active slide (varies when speaker asks next/previous slide);
      // filters out other slides
      slide: { type: String, reflect: true },
      // Active display (remains fixed, once set); filters out
      // all diapositives that are bound to other displays
      display: { type: String, reflect: true }
    }
  }

  render() {
    return html`
      <div>‹dia-show›</div>
      <slot></slot>
    `;
  }

  constructor() {
    super();
    this.slide = undefined;
    this.display = undefined;
  }

  updated( changedProperties) {
    if( changedProperties.has( "slide")) {
      this._switchActiveSlide();
    }
    if( changedProperties.has( "display")) {
      this._switchActiveDisplay();
    }
  }

  _switchActiveSlide() {
    console.log( `New slide: ${this.slide}`);
    const activeSlideId = this.slide;
    this.querySelectorAll( "dia-slide")
      .forEach(( elt) => {
        const slideId = elt.getAttribute( "id");
        if( activeSlideId === slideId) {
          elt.removeAttribute( "hidden");
        } else {
          elt.setAttribute( "hidden", "");
        };
      });
  };

  _switchActiveDisplay() {
    console.log( `New display: ${this.display}`);
    const activeDisplayId = this.display;
    this.querySelectorAll( "dia-po")
      .forEach(( elt) => {
        const displayId = elt.getAttribute( "display");
        if( activeDisplayId === displayId) {
          elt.removeAttribute( "hidden");
        } else {
          elt.setAttribute( "hidden", "");
        };
      });
  }
}

// Register the element with the browser
customElements.define( "dia-show", DiaShow);