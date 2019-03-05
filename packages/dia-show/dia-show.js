import { LitElement, html } from "lit-element";
import { CommonStyles, DiaShowStyles } from "./shared-styles.js";

export class DiaShow extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaShowStyles ];
  }

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

  // Propagate the active slide id to the ‹dia-slide› child elements,
  // which will in turn hide/reveal themselves, and propagate the id
  // to their child ‹dia-po› elements
  _switchActiveSlide() {
    const activeSlideId = this.slide != null ? this.slide : undefined;
    console.log( `dia-show › Switch to slide: ${activeSlideId}`);
    this.querySelectorAll( "dia-slide")
      .forEach(( element) => element.activeSlide = activeSlideId);
  }

  // Propagate the active display id to the ‹dia-slide› child elements,
  // which will in turn propagate the id to their child ‹dia-po› elements,
  // and the later will hide/reveal themselves
  _switchActiveDisplay() {
    const activeDisplayId = this.display != null ? this.display : undefined;
    console.log( `dia-show › Switch to display: ${activeDisplayId}`);
    this.querySelectorAll( "dia-slide")
      .forEach(( element) => element.activeDisplay = activeDisplayId);
  }

  // Sets the next slide as the current one.
  next() {
    if(this.slide === null) { return; }
    var slide = this.querySelectorAll( `dia-slide[id="${this.slide}"]`)[0];
    var nextSlide = slide.nextElementSibling;
    if(nextSlide != null && nextSlide.tagName == "DIA-SLIDE"){
      this.slide = nextSlide.getAttribute("id");
    }
  }

  // Sets the previous slide as the current one.
  previous() {
    if(this.slide === null) { return; }
    var slide = this.querySelectorAll( `dia-slide[id="${this.slide}"]`)[0];
    var prevSlide = slide.previousElementSibling;
    if(prevSlide != null && prevSlide.tagName == "DIA-SLIDE"){
      this.slide = prevSlide.getAttribute("id");
    }
  }

  fullescreen() {
    this.requestFullscreen();
  }
}

// Register the element with the browser
customElements.define( "dia-show", DiaShow);
