import { LitElement, html } from "lit-element";
import { CommonStyles, DiaShowStyles } from "@petitatelier/dia-styles";

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
      slide: { type: String, attribute: true, reflect: true },
      // Active display (usually remains fixed, once set, although the
      // remote controller might change it for the audience, which has
      // only target display); filters out/hides all diapositives that
      // are bound to other displays.
      display: { type: String, attribute: true, reflect: true },
      // Used to know if the user is a speaker or not
      speaker: { type: Boolean, reflect: true },
      // Used to know if the user in the detached mode or not
      detached: { type: Boolean, reflect: true},
      // Current detached slide/display of a speaker or member of the audience;
      // detached head is specific to every slideshow player instance;
      detachedHead: { type: String, attribute: "detached-head", reflect: true},
      // Tells if the user is looking at the dashboard or not
      dashboard: { type: Boolean, reflect: true}
    }
  }

  render() {
    return html`
      <div class="info" title="Slide: ${this.slide}, display: ${this.display}">
        ${this.detached ? "🔇 Detached" : ""}
        ${this.speaker ? "🔈 Speaker" : ""}
      </div>
      <dia-controller slide="${this.slide}" display="${this.display}" ?speaker="${this.speaker}" ?detached="${this.detached}">
        <dia-display-selector .displayList=${this._displayList}></dia-display-selector>
        <button id="cloneWindow" @click=${this._onCloneWindowClicked}>Clone window</button>
        <span slot="after">
          <button id="fullscreen" @click="${this.fullscreen}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"
              ><path d="M4.5 11H3v4h4v-1.5H4.5V11zM3 7h1.5V4.5H7V3H3v4zm10.5 6.5H11V15h4v-4h-1.5v2.5zM11 3v1.5h2.5V7H15V3h-4z"/></svg>
          </button>
        </span>
      </dia-controller>
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
    this.addEventListener( "speaker-toggled", this._onSpeakerToggled);
    this.addEventListener( "detach-enabled", this._onDetachEnabled);
    this.addEventListener( "detach-disabled", this._onDetachDisabled);
    this.addEventListener( "fullscreen-enabled", this._onFullscreenEnabled);

    // Public observed properties
    this.speaker = false;
    this.detached = false;
    this.slide = undefined;
    this.display = undefined;
    this.dashboard = undefined;

    // Private properties
    this._displayList = this._enumerateDisplays(); // returns a `Set`
    this._clonedWindowsSet = new Set(); // List of windows opened by the user clicking the `cloneWindow` button
  }

  disconnectedCallback() {
    this._dispose();
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
    if( changedProperties.has( "slide") || changedProperties.has("display")){
      this.dashboard = this.slide == undefined && this.display == undefined;
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
    console.debug( `dia-show › on-display-selected: ${selectedDisplay}`);
    this.display = selectedDisplay != undefined ? selectedDisplay : null;
    e.stopPropagation();
  }

  // Sets the active slide when the custom event `slide-selected` is fired from a child.
  _onSlideSelected( e) {
    const selectedSlide = e.detail.slide;
    console.debug( `dia-show › on-slide-selected: ${selectedSlide}`);
    this.slide = selectedSlide != undefined ? selectedSlide : null;
    e.stopPropagation();
  }

  // Enables the speaker mode when the custom event `speaker-enabled` is fired from a child.
  _onSpeakerToggled( e) {
    this.speaker = !this.speaker;
    e.stopPropagation();
  }

  // Enables the detached mode when the custom event `detach-enabled` is fired from a child.
  _onDetachEnabled( e) {
    this.detached = true;
    e.stopPropagation();
  }

  // Disables the detached mode when the custom event `detach-enabled` is fired from a child.
  _onDetachDisabled( e) {
    this.detached = false;
    e.stopPropagation();
  }

  _onFullscreenEnabled( e) {
    this.fullscreen();
    e.stopPropagation();
  }

  fullscreen(){
    this.requestFullscreen();
    this.focus();
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
