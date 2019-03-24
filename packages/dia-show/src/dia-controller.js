import { LitElement, html } from "lit-element";
import { CommonStyles, DiaControllerStyles } from "@petitatelier/dia-styles";
import "./dia-controller-keyboard.js";
import "./dia-controller-pointer.js";
import "./dia-controller-remote-firebase.js";

// TODO:
// [ ] `_getDefaultDisplayOfSlide()` should handle case of no `default` diapositive on ‹dia-slide›
// [ ] Login to google
// [ ] Send the user current head to firebase
// [ ] Detached head is not synched

export class DiaController extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaControllerStyles ];
  }

  static get properties() {
    return {
      slide:         { type: String },
      display:       { type: String },
      speaker:       { type: Boolean },
      detached:      { type: Boolean },
      target:        { type: Object } // The target to bind to (eg: keyboard events, clicks, ...)
    }
  }

  render() {
    return html`
      <slot></slot>
      <dia-controller-keyboard></dia-controller-keyboard>
      <dia-controller-pointer></dia-controller-pointer>
      <dia-controller-remote-firebase room-id="room:main"></dia-controller-remote-firebase>
      <button id="prevSlide" @click="${this.previous}"> « </button>
      <button id="nextSlide" @click="${this.next}"> » </button>
      <slot name="after"></slot>
    `;
  }

  constructor(){
    super();

    // Public observed properties
    this.slide        = undefined;
    this.display      = undefined;
    this.speaker      = false;
    this.detached     = false;
    this.target       = undefined;

    // Private non-observed properties
    this.head         = { slide: undefined, display: undefined };
    this.liveHead     = undefined;
    this.detachedHead = undefined;
    this._keyboardController = undefined;
    this._pointerController = undefined;
    this._remoteController = undefined;

    // Attach event listeners
    this.addEventListener( "live-head-updated", this._onLiveHeadUpdated.bind( this));
    this.addEventListener( "next-slide-requested", this.next.bind( this));
    this.addEventListener( "previous-slide-requested", this.previous.bind( this));
    this.addEventListener( "fullscreen-requested", this.fullscreen.bind( this));
    this.addEventListener( "speaker-toggle-requested", this.toggleSpeaker.bind( this));
    this.addEventListener( "detach-requested", this.detach.bind( this));
    this.addEventListener( "resync-requested", this.resync.bind( this));
    this.addEventListener( "focus-requested", this.focus.bind( this));
  }

  firstUpdated() {
    this._keyboardController = this.shadowRoot.querySelector( "dia-controller-keyboard");
    this._pointerController = this.shadowRoot.querySelector( "dia-controller-pointer");
    this._remoteController = this.shadowRoot.querySelector( "dia-controller-remote-firebase");
    this._remoteController.controller = this;
  }

  updated( changedProperties) {
    console.debug( "dia-controller › updated()", changedProperties);
    if( changedProperties.has( "slide")) {
      this.head.slide = this.slide;
    }
    if( changedProperties.has( "display")) {
      this.head.display = this.display
    }
    if( changedProperties.has( "slide") || changedProperties.has("display")){
      // Tracks the users head
      this._remoteController.updateAudienceStats(this.head);
    }

    if( changedProperties.has( "slide")
      || changedProperties.has( "speaker")
      || changedProperties.has( "liveHead")
      || changedProperties.has( "detached")) {

      // Actions for non-speakers
      //
      // Set the detached mode when the `liveHead` differs from the user `head`
      // and the detached mode was not previously set (sanity)
      if( !this.speaker && !this.detached
        && this.liveHead && this.liveHead != undefined
        && this.liveHead.slide != this.slide) {
        this.detach();
      }

      // Actions for all
      //
      // Synchronize the deatched head with the current user active slide when
      // in detached mode.
      if( this.detached){
        this.detachedHead = this.head;
      }
    }

    if( changedProperties.has( "target")) {
      console.debug( "dia-controller › updated( target)", this.target);
      if( this._keyboardController) {
        this._keyboardController.target = this.target;
      }
      if( this._pointerController) {
        this._pointerController.target = this.target;
      }
    }
  }

  // Set the next slide as the current one.
  // eslint-disable-next-line no-unused-vars
  next( _event) {
    console.debug( "dia-controller › next()");
    if( this.target.slide == undefined) { return; }
    const slide = this.target.querySelectorAll( `dia-slide[id="${this.head.slide}"]`)[0];
    const nextSlide = slide.nextElementSibling;
    if(nextSlide != null && nextSlide.tagName == "DIA-SLIDE"){
      const nextSlideID = nextSlide.getAttribute( "id");
      this.__dispatchEvt( "slide-selected", { slide: nextSlideID });
      const defaultDisplayID = this._getDefaultDisplayOfSlide( nextSlide);

      // Do not change the display if we are in speaker mode
      if( !this.speaker) {
        this.__dispatchEvt( "display-selected", { display: defaultDisplayID });
      }

      // Updates the live head of the audience using the speaker next slide and the defaultDisplayID
      if( this.speaker && !this.detached){
        this._remoteController.updateLiveHead({ slide: nextSlideID, display: defaultDisplayID });
      }
    }
  }

  // Set the previous slide as the current one.
  // eslint-disable-next-line no-unused-vars
  previous( _event) {
    console.debug( "dia-controller › previous()");
    if(this.target.slide == undefined) { return; }
    var slide = this.target.querySelectorAll( `dia-slide[id="${this.head.slide}"]`)[0];
    var prevSlide = slide.previousElementSibling;
    if(prevSlide != null && prevSlide.tagName == "DIA-SLIDE"){
      const prevSlideID = prevSlide.getAttribute("id");
      this.__dispatchEvt("slide-selected", {slide: prevSlideID});
      const defaultDisplayID = this._getDefaultDisplayOfSlide(prevSlide);

      // Do not change the display if we are in speaker mode
      if(!this.speaker) {
        this.__dispatchEvt("display-selected", {display: defaultDisplayID});
      }

      // Updates the live head of the audience using the speaker previous slide and the defaultDisplayID
      if(this.speaker && !this.detached){
        this._remoteController.updateLiveHead({slide: prevSlideID, display: defaultDisplayID});
      }
    }
  }

  // Search for the dia-po that has the `default` attribute
  _getDefaultDisplayOfSlide( slideElement) {
    const defaultDiaPo = slideElement.querySelector( "dia-po[default]")
    return defaultDiaPo.getAttribute( "display");
  }

  // Move to the specified slide and/or display
  moveTo( slide, display) {
    console.debug( "dia-controller › moveTo()", slide, display);
    this.moveToSlide( slide);
    this.moveToDisplay( display);
  }

  // Move to the specified slide
  moveToSlide( slide) {
    console.debug( "dia-controller › moveToSlide()", slide);
    this.__dispatchEvt( "slide-selected", {slide: slide});
  }

  // Move to the specified display
  moveToDisplay( display) {
    console.debug( "dia-controller › moveToDisplay()", display);
    this.__dispatchEvt( "display-selected", {display: display});
  }

  // Detach from the head
  // eslint-disable-next-line no-unused-vars
  detach( _event) {
    console.debug( "dia-controller › detach()");
    if( this.detached) {
      this.moveTo( null, null);
    } else {
      this.__dispatchEvt( "detach-enabled");
      this.detachedHead = this.head;
    }
  }

  // eslint-disable-next-line no-unused-vars
  resync( _event) {
    console.debug( "dia-controller › resync()");
    this.detachedHead = undefined;
    this.__dispatchEvt( "detach-disabled");
    if( this.speaker && this.liveHead.slide == this.head.slide) {
      this.next();
    } else {
      if(this.speaker){
        this.moveToSlide(this.liveHead.slide);
      } else {
        this.moveTo(this.liveHead.slide, this.liveHead.display);
      }
    }
  }

  // eslint-disable-next-line no-unused-vars
  fullscreen( _event) {
    console.debug( "dia-controller › fullscreen()");
    this.__dispatchEvt( "fullscreen-enabled");
  }

  // eslint-disable-next-line no-unused-vars
  toggleSpeaker( _event) {
    console.debug( "dia-controller › toggleSpeaker()");
    if( !this.detached){
      this.__dispatchEvt( "speaker-toggled");
      if(this.head.slide != this.liveHead.slide){this.resync();}
    }
  }

  // eslint-disable-next-line no-unused-vars
  focus( _event) {
    console.debug( "dia-controller › focus()");
    if(this.speaker && this.detached) {
      this._remoteController.updateLiveHead(this.head);
      this.__dispatchEvt( "detach-disabled");
    }
  }

  _onLiveHeadUpdated( e){
    const prevLiveHead = this.liveHead;
    this.liveHead = e.detail.liveHead;
    console.debug( "dia-controller › on-live-head-updated(): ", e.detail.liveHead);
    if( prevLiveHead == undefined){
      this.resync();
    } else if( !this.detached) {
      if(this.speaker) {
        this.moveToSlide( this.liveHead.slide);
      } else {
        this.moveTo( this.liveHead.slide, this.liveHead.display);
      }
    }
  }

  // Helper to dispatch a custom event name with default options
  __dispatchEvt( name, detail, bubbles = true, composed = true){
    this.dispatchEvent(
      new CustomEvent( name, { detail, bubbles, composed }));
  }
}

customElements.define( "dia-controller", DiaController);