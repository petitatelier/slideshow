import { LitElement, html } from "lit-element";
import { CommonStyles, DiaShowStyles } from "./shared-styles.js";
import Controller from "./dia-controller.js";

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
      <dia-display-selector .displayList=${this._displayList}></dia-display-selector>
      <dia-controller head="${this.slide}"></dia-controller>
      <slot></slot>
    `;
  }

  constructor() {
    super();

    // Attach event listeners
    this.addEventListener( "display-selected", this._onDisplaySelected);
    this.addEventListener( "slide-selected", this._onSlideSelected);

    // Public observed properties
    this.slide = undefined;
    this.display = undefined;

    // Private properties
    this._displayList = this._enumerateDisplays(); // returns a `Set`
  }

  firstUpdated(){
    this._controller = this.shadowRoot.querySelector("dia-controller");
    this._controller.target = this;
  }

  updated( changedProperties) {
    if( changedProperties.has( "slide")) {
      this._updatedActiveSlide();
    }
    if( changedProperties.has( "display")) {
      this._updatedActiveDisplay();
    }
  }

  // Propagate the active slide id to the ‹dia-slide› child elements,
  // which will in turn hide/reveal themselves, and propagate the id
  // to their child ‹dia-po› elements
  _updatedActiveSlide() {
    const activeSlideId = this.slide != null ? this.slide : undefined;
    console.log( `dia-show › Switch to slide: ${activeSlideId}`);
    this.querySelectorAll( "dia-slide")
      .forEach(( element) => element.activeSlide = activeSlideId);
  }

  // Propagate the active display id to the ‹dia-slide› child elements,
  // which will in turn propagate the id to their child ‹dia-po› elements,
  // and the later will hide/reveal themselves
  _updatedActiveDisplay() {
    const activeDisplayId = this.display != null ? this.display : undefined;
    console.log( `dia-show › Switch to display: ${activeDisplayId}`);
    this.querySelectorAll( "dia-slide")
      .forEach(( element) => element.activeDisplay = activeDisplayId);
  }


  // Returns a `Set` of distinct display identifiers used
  // on child ‹dia-po› elements
  _enumerateDisplays() {
    const diapoElements = this.querySelectorAll( "dia-po"),
          displays = new Set();

    diapoElements.forEach(( element) => {
      // We use `getAttribute( "display")` to get the attribute value
      // from the DOM, instead of `element.display`, because at the time
      // this method gets called, the ‹dia-po› custom element might not
      // have been defined yet
      displays.add( element.getAttribute( "display"));
    });
    return displays;
  }

  // Sets the active display when the custom event `display-selected` is fired from a child.
  _onDisplaySelected( e) {
    const selectedDisplay = e.detail.display;
    console.log( `dia-show › on-display-selected: ${selectedDisplay}`);
    this.display = selectedDisplay;
    e.stopPropagation();
  }

  // Sets the active slide when the custom event `slide-selected` is fired from a child.
  _onSlideSelected( e) {
    const selectedSlide = e.detail.slide;
    console.log( `dia-show › on-slide-selected: ${selectedSlide}`);
    this.slide = selectedSlide;
    e.stopPropagation();
  }
}

// Register the element with the browser
customElements.define( "dia-show", DiaShow);
