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
      <div>‹dia-show slide ${this.slide}, display ${this.display}›</div>
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

  // If no slide is currently active, display all slides; otherwise,
  // display only the active slide and hide all other slides
  _switchActiveSlide() {
    console.log( `New slide: ${this.slide}`);
    const activeSlideId = this.slide != null ? this.slide : undefined;
    this.querySelectorAll( "dia-slide")
      .forEach(( elt) => {
        const slideId = elt.getAttribute( "id");
        if( typeof activeSlideId === "undefined" || activeSlideId === slideId) {
          elt.removeAttribute( "hidden");
        } else {
          elt.setAttribute( "hidden", "");
        };
      });
  };

  // If no display is currently active, display slides targetting any display;
  // otherwise, display only diapositives targetting the active display
  // and hide all other diapositives
  _switchActiveDisplay() {
    const activeDisplayId = this.display != null ? this.display : undefined;
    console.log( `New display: ${this.display}, ${activeDisplayId}`);
    this.querySelectorAll( "dia-po")
      .forEach(( elt) => {
        const displayId = elt.getAttribute( "display");
        if( typeof activeDisplayId === "undefined" || activeDisplayId === displayId) {
          elt.removeAttribute( "hidden");
        } else {
          elt.setAttribute( "hidden", "");
        };
      });
  }
}

// Register the element with the browser
customElements.define( "dia-show", DiaShow);