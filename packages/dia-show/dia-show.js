import { LitElement, html } from "lit-element";
import { CommonStyles, DiaShowStyles } from "./shared-styles.js";
import { registerKeyboardListeners } from "./dia-controller-keyboard.js";

export class DiaShow extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaShowStyles ];
  }

  static get properties() {
    return {
      // The two properties/attributes `slide` and `display` are initially
      // set by the slideshow author, to define the slide/display first
      // displayed (defaults to first slide, first display, when left
      // undefined); subsequently set by the keyboard or remote controller.

      // Active slide (varies when speaker asks next/previous slide);
      // filters out/hides other slides.
      slide: { type: String, reflect: true },

      // Active display (usually remains fixed, once set, although the
      // remote controller might change it for the audience, which has
      // only target display); filters out/hides all diapositives that
      // are bound to other displays.
      display: { type: String, reflect: true }
    }
  }

  render() {
    return html`
      <div>‹dia-show slide ${this.slide}, display ${this.display}›</div>
      <dia-display-selector .displayList=${this._displayList}></dia-display-selector>
      <button id="cloneWindow" @click=${this._onCloneWindowClicked}>Clone window</button>
      <slot></slot>
    `;
  }

  _onCloneWindowClicked( e) {
    console.debug( "dia-show › on-clone-window-clicked");
    const currentURL = window.location.href,
          windowObjRef = window.open( currentURL, ""); // `""` ensures we open a new window
    this._clonedWindowsSet.add( windowObjRef);
  }

  constructor() {
    super();

    // Attach event listeners
    this.addEventListener( "display-selected", this._onDisplaySelected);
    this.addEventListener( "slide-selected", this._onSlideSelected);
    registerKeyboardListeners( this);

    // Public observed properties
    this.slide = undefined;
    this.display = undefined;

    // Private properties
    this._displayList = this._enumerateDisplays(); // returns a `Set`
    this._clonedWindowsSet = new Set(); // List of windows opened by the user clicking the `cloneWindow` button
  }

  disconnectedCallback() {
    this._dispose();
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
  // and the later will hide/reveal themselves.
  //
  // Also propagates the active display to the ‹dia-display-selector›
  // child element, so that it correctly highlights the selected display
  _updatedActiveDisplay() {
    const activeDisplayId = this.display != null ? this.display : undefined;
    console.log( `dia-show › Switch to display: ${activeDisplayId}`);
    // Propagate to ‹dia-slide› child elements
    this.querySelectorAll( "dia-slide")
      .forEach(( element) => element.activeDisplay = activeDisplayId);
    // Propagate to ‹dia-display-selector› child element
    this.shadowRoot.querySelector( "dia-display-selector")
      .selectedDisplayId = activeDisplayId;
  }

  moveTo( slide, display) {
    console.log( "dia-show › moveTo()", slide, display);
    this.slide = slide != null ? slide : undefined; // cast null to undefined
    this.display = display != null ? display : undefined; // cast null to undefined
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

  fullscreen() {
    this.requestFullscreen();
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

  _dispose() {
    // Close windows that would have been opened by the user clicking
    // the `cloneWindow` button from this window
    console.debug( "dia-show › dispose(): closing windows opened by `cloneWindow` button");
    this._clonedWindowsSet.forEach(( windowObjRef) => {
      windowObjRef.close();
    })
    this._clonedWindowsSet = undefined;
  }
}

// Register the element with the browser
customElements.define( "dia-show", DiaShow);
