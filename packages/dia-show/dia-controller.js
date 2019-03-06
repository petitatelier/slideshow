import { LitElement, html } from "lit-element";
import controllerKeyboard from "./dia-controller-keyboard.js";
import controllerRemoteFirbase from "./dia-controller-remote-firebase.js";

export default class DiaController extends LitElement {

  static get properties() {
    return {
      target: { type: Object }, // The target to bind to (eg: keyboard events, clicks, ...)
      head: { type: String, attribute: true}, // the current (alias of active-slide)
      liveHead: {type: String, attribute: "live-head"},
      detachedHead: { type: String, attribute: "detached-head"}
    }
  }

  render() {
    return html`
      ‹dia-controller ${this.head} ${this.liveHead} ${this.detachedHead}›
      <dia-controller-keyboard></dia-controller-keyboard>
      <dia-controller-remote-firebase></dia-controller-remote-firebase>
    `;
  }

  constructor(){
    super();
    this.head         = undefined;
    this.liveHead     = undefined;
    this.detachedHead = undefined;

    // Private properties
    this._target = undefined;
    this._keyboardController = undefined;
    this._remoteController = undefined;
  }

  firstUpdated() {
    this._keyboardController = this.shadowRoot.querySelector("dia-controller-keyboard");
        // controller.next();
        // controller.detach();
    this._remoteController = this.shadowRoot.querySelector("dia-controller-remote-firebase");
        // controller.next();
        // controller.detach();

  }

  updated(changedProperties){
    if( changedProperties.has("target")) {
      this._keyboardController.registerKeyboardListeners( this.target, this);
    }
  }

  // Detach from the head
  detach(){
    if( this._isDetached) {
      this.moveTo( undefined, undefined);
    } else {
      console.warn("To implement: detach");
    }
    this._isDetached = true;
  }

  // Move to the specified slide and/or display
  moveTo( slide, display) {
    console.log( "dia-controller › moveTo()", slide, display);
    this.target.slide = slide != null ? slide : undefined; // cast null to undefined
    this.target.display = display != null ? display : undefined; // cast null to undefined
  }

  // Set the next slide as the current one.
  next() {
    if(this.target.slide === null) { return; }
    const slide = this.target.querySelectorAll( `dia-slide[id="${this.head}"]`)[0];
    const nextSlide = slide.nextElementSibling;
    if(nextSlide != null && nextSlide.tagName == "DIA-SLIDE"){
      const nextSlideID = nextSlide.getAttribute("id");
      this.dispatchEvent( new CustomEvent("slide-selected", {
        detail: {slide: nextSlideID }, bubbles: true, composed: true
      }))
    }
  }

  // Set the previous slide as the current one.
  previous() {
    if(this.target.slide === null) { return; }
    var slide = this.target.querySelectorAll( `dia-slide[id="${this.head}"]`)[0];
    var prevSlide = slide.previousElementSibling;
    if(prevSlide != null && prevSlide.tagName == "DIA-SLIDE"){
      const prevSlideID = prevSlide.getAttribute("id");
      this.dispatchEvent( new CustomEvent("slide-selected", {
        detail: {slide: prevSlideID }, bubbles: true, composed: true
      }))
    }
  }

  // Activate the fullscreen mode
  fullscreen() {
    this.target.requestFullscreen();
  }

}

customElements.define("dia-controller", DiaController);
