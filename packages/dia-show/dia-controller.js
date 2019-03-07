import { LitElement, html } from "lit-element";
import controllerKeyboard from "./dia-controller-keyboard.js";
import controllerRemoteFirbase from "./dia-controller-remote-firebase.js";

// TODO:
// [ ] Login to google
// [ ] Send the user current head to firebase
// [ ] Detached head is not synched


export default class DiaController extends LitElement {

  static get properties() {
    return {
      target:       { type: Object }, // The target to bind to (eg: keyboard events, clicks, ...)
      head:         { type: String, attribute: true}, // the current (alias of active-slide)
      liveHead:     { type: String, attribute: "live-head"},
      detachedHead: { type: String, attribute: "detached-head"},
      speaker:      { type: Boolean },
      detached:     { type: Boolean },
    }
  }

  render() {
    return html`
      ‹dia-controller head: ${this.head} liveHead: ${this.liveHead} detachedHead: ${this.detachedHead}›
      <dia-controller-keyboard></dia-controller-keyboard>
      <dia-controller-remote-firebase room-id="room:main"></dia-controller-remote-firebase>
    `;
  }

  constructor(){
    super();
    this.head         = undefined;
    this.liveHead     = undefined;
    this.detachedHead = undefined;
    this.detached     = false;
    this.speaker      = false;
    this.detached     = false;

    // Private properties
    this._target = undefined;
    this._keyboardController = undefined;
    this._remoteController = undefined;

    this.addEventListener("live-head-updated", this._onLiveHeadUpdated);
  }

  firstUpdated() {
    this._keyboardController = this.shadowRoot.querySelector("dia-controller-keyboard");
    this._keyboardController.controller = this;
    this._remoteController = this.shadowRoot.querySelector("dia-controller-remote-firebase");
    this._remoteController.controller = this;
  }

  updated(changedProperties){
    if( changedProperties.has( "head") || changedProperties.has( "speaker") || changedProperties.has( "detached")) {
      // Actions for speakers
      //
      // Propagates the current head to the remote controller when
      // the speaker is not in the detached mode.
      if(this.speaker && !this.detached){
        this._remoteController.updateLiveHead(this.head);
      }

      // Actions for non-speakers
      //
      // Set the detached mode when the `liveHead` differs from the user `head`
      // and the detached mode was not previously set (sanity)
      if(!this.speaker && this.liveHead != this.head && this.liveHead != undefined && !this.detached) {
        this.detach();
      }

      // Actions for all
      //
      // Synchronize the deatched head with the current user active slide when
      // in detached mode.
      if(this.detached){
        this.detachedHead = this.head;
      }
      // Tracks the users head
      this._remoteController.updateAudienceStats(this.head);
    }

    if( changedProperties.has( "target") && this.target != undefined) {
      this._keyboardController.registerKeyboardListeners( this.target);
    }
  }

  // Set the next slide as the current one.
  next() {
    if(this.target.slide == undefined) { return; }
    const slide = this.target.querySelectorAll( `dia-slide[id="${this.head}"]`)[0];
    const nextSlide = slide.nextElementSibling;
    if(nextSlide != null && nextSlide.tagName == "DIA-SLIDE"){
      const nextSlideID = nextSlide.getAttribute("id");
      this.__dispatchEvt("slide-selected", {slide: nextSlideID});
    }
  }

  // Set the previous slide as the current one.
  previous() {
    if(this.target.slide == undefined) { return; }
    var slide = this.target.querySelectorAll( `dia-slide[id="${this.head}"]`)[0];
    var prevSlide = slide.previousElementSibling;
    if(prevSlide != null && prevSlide.tagName == "DIA-SLIDE"){
      const prevSlideID = prevSlide.getAttribute("id");
      this.__dispatchEvt("slide-selected", {slide: prevSlideID});
    }
  }

  // Move to the specified slide and/or display
  moveTo( slide, display) {
    console.log( "dia-controller › moveTo()", slide, display);
    this.moveToSlide(slide);
    this.moveToDisplay(display);
  }

  // Move to the specified slide
  moveToSlide( slide) {
    this.target.slide = slide != null ? slide : undefined; // cast null to undefined
  }

  // Move to the specified display
  moveToDisplay( display) {
    this.target.display = display != null ? display : undefined; // cast null to undefined
  }

  // Detach from the head
  detach(){
    if(this.detached) {
      this.moveTo(undefined, undefined);
    } else {
      this.__dispatchEvt("detach-enabled");
      this.detachedHead = this.head;
    }
  }

  resync() {
    console.log("Controller > resynchronized with liveHead");
    this.detachedHead = undefined;
    this.__dispatchEvt("detach-disabled");
    if( this.speaker && this.liveHead == this.head) {
      this.next();
    } else {
      this.__dispatchEvt("slide-selected", {slide: this.liveHead});
    }
  }

  fullscreen() {
    this.__dispatchEvt("fullscreen-enabled");
  }

  toggleSpeaker(){
    this.resync();
    this.__dispatchEvt("speaker-toggled");
  }

  focus(){
    if(this.speaker && this.detached) {
      this._remoteController.updateLiveHead(this.head);
      this.__dispatchEvt("detach-disabled");
    }
  }

  _onLiveHeadUpdated(e){
    const prevLiveHead = this.liveHead;
    this.liveHead = e.detail.liveHead;
    console.log("dia-controller › live head updated to", e.detail.liveHead);
    if(prevLiveHead == undefined){
      this.resync();
    } else if(!this.detached) {
      this.moveToSlide(this.liveHead);
    }
  }

  /**
   * Helper to dispatch a custom event name and its details
   */
  __dispatchEvt(name, detail, bubbles=true, composed=true){
    this.dispatchEvent( new CustomEvent(name, {
      detail: detail, bubbles: bubbles, composed: composed
    }));
  }


}

customElements.define("dia-controller", DiaController);
