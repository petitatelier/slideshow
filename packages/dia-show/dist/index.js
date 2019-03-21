'use strict';

var litElement = require('lit-element');
var diaStyles = require('@petitatelier/dia-styles');

class DiaShow extends litElement.LitElement {
  static get styles() {
    return [ diaStyles.CommonStyles, diaStyles.DiaShowStyles ];
  }
  static get properties() {
    return {
      slide: { type: String, attribute: true, reflect: true },
      display: { type: String, attribute: true, reflect: true },
      speaker: { type: Boolean, reflect: true },
      detached: { type: Boolean, reflect: true},
      detachedHead: { type: String, attribute: "detached-head", reflect: true},
      dashboard: { type: Boolean, reflect: true}
    }
  }
  render() {
    return litElement.html`
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
          windowObjRef = window.open( currentURL, "");
    this._clonedWindowsSet.add( windowObjRef);
  }
  constructor() {
    super();
    this.addEventListener( "display-selected", this._onDisplaySelected);
    this.addEventListener( "slide-selected", this._onSlideSelected);
    this.addEventListener( "speaker-toggled", this._onSpeakerToggled);
    this.addEventListener( "detach-enabled", this._onDetachEnabled);
    this.addEventListener( "detach-disabled", this._onDetachDisabled);
    this.addEventListener( "fullscreen-enabled", this._onFullscreenEnabled);
    this.speaker = false;
    this.detached = false;
    this.slide = undefined;
    this.display = undefined;
    this.dashboard = undefined;
    this._displayList = this._enumerateDisplays();
    this._clonedWindowsSet = new Set();
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
  _updatedActiveSlide() {
    const activeSlideId = this.slide != null ? this.slide : undefined;
    console.log( `dia-show › Switch to slide: ${activeSlideId}`);
    this.querySelectorAll( "dia-slide")
      .forEach(( element) => element.activeSlide = activeSlideId);
  }
  _updatedActiveDisplay() {
    const activeDisplayId = this.display != null ? this.display : undefined;
    console.log( `dia-show › Switch to display: ${activeDisplayId}`);
    this.querySelectorAll( "dia-slide")
      .forEach(( element) => element.activeDisplay = activeDisplayId);
    this.shadowRoot.querySelector( "dia-display-selector")
      .selectedDisplayId = activeDisplayId;
  }
  _enumerateDisplays() {
    const diapoElements = this.querySelectorAll( "dia-po"),
          displays = new Set();
    diapoElements.forEach(( element) => {
      displays.add( element.getAttribute( "display"));
    });
    return displays;
  }
  _onDisplaySelected( e) {
    const selectedDisplay = e.detail.display;
    console.debug( `dia-show › on-display-selected: ${selectedDisplay}`);
    this.display = selectedDisplay != undefined ? selectedDisplay : null;
    e.stopPropagation();
  }
  _onSlideSelected( e) {
    const selectedSlide = e.detail.slide;
    console.debug( `dia-show › on-slide-selected: ${selectedSlide}`);
    this.slide = selectedSlide != undefined ? selectedSlide : null;
    e.stopPropagation();
  }
  _onSpeakerToggled( e) {
    this.speaker = !this.speaker;
    e.stopPropagation();
  }
  _onDetachEnabled( e) {
    this.detached = true;
    e.stopPropagation();
  }
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
    console.debug( "dia-show › dispose(): closing windows opened by `cloneWindow` button");
    this._clonedWindowsSet.forEach(( windowObjRef) => {
      windowObjRef.close();
    });
    this._clonedWindowsSet = undefined;
  }
}
customElements.define( "dia-show", DiaShow);

class DiaSlide extends litElement.LitElement {
  static get styles() {
    return [ diaStyles.CommonStyles, diaStyles.DiaSlideStyles ];
  };
  static get properties() {
    return {
      id: { type: String },
      hidden: { type: Boolean, reflect: true },
      activeSlide: { type: String, attribute: false },
      activeDisplay: { type: String, attribute: false }
    }
  }
  render() {
    return litElement.html`
      <slot>
        <div>‹dia-slide ${this.id}›</div>
      </slot>
    `;
  }
  constructor() {
    super();
    this.addEventListener( "click", this._onClick);
    this.id = undefined;
    this.activeSlide = undefined;
    this.activeDisplay = undefined;
    this.hidden = false;
  }
  _onClick( e) {
    e.stopPropagation();
    this.dispatchEvent( new CustomEvent("slide-selected", {
      detail: { slide: this.id },
      bubbles: true, composed: true
    }));
  }
  updated( changedProperties) {
    console.debug( `dia-slide[${this.id}] › updated()`, changedProperties);
    if( changedProperties.has( "activeSlide")) {
      this._updatedActiveSlide();
    }
    if( changedProperties.has( "activeDisplay")) {
      this._updatedActiveDisplay();
    }
    if( changedProperties.has( "id")) {
      this._updatedId();
    }
  }
  _updatedActiveSlide() {
    this.querySelectorAll( "dia-po")
      .forEach(( element) => element.activeSlide = this.activeSlide);
    this.hidden = (typeof this.activeSlide !== "undefined"
                  && this.activeSlide !== this.id);
  }
  _updatedActiveDisplay() {
    this.querySelectorAll( "dia-po")
      .forEach(( element) => element.activeDisplay = this.activeDisplay);
  }
  _updatedId() {
    this.querySelectorAll( "dia-po")
      .forEach(( element) => element.parentSlide = this.id);
  }
}
customElements.define( "dia-slide", DiaSlide);

class DiaPo extends litElement.LitElement {
  static get styles() {
    return [ diaStyles.CommonStyles, diaStyles.DiaPoStyles ];
  }
  static get properties() {
    return {
      display: { type: String },
      default: { type: Boolean },
      fullbleed: { type: Boolean },
      hidden: { type: Boolean, reflect: true },
      parentSlide: { type: String, attribute: false },
      activeSlide: { type: String, attribute: false },
      activeDisplay: { type: String, attribute: false },
    }
  }
  render() {
    return litElement.html`<div><slot>‹dia-po ${this.display}›</slot></div>`;
  }
  constructor() {
    super();
    this.addEventListener( "click", this._onClick);
    this.display = undefined;
    this.default = false;
    this.fullbleed = false;
    this.hidden = false;
    this.parentSlide = undefined;
    this.activeSlide = undefined;
    this.activeDisplay = undefined;
  }
  _onClick( e) {
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
    console.debug( `dia-po[${this.parentSlide}:${this.display}] › updated()`, changedProperties);
    if( changedProperties.has( "activeSlide")
        || changedProperties.has( "activeDisplay")) {
      this._updatedActiveSlideOrDisplay();
    }
    if( changedProperties.has( "hidden")) {
      this._updatedHidden();
    }
  }
  _updatedActiveSlideOrDisplay() {
    this.hidden = (typeof this.activeDisplay !== "undefined"
      && typeof this.display !== "undefined"
      && this.activeDisplay !== this.display)
      || (typeof this.activeSlide !== "undefined"
        && typeof this.parentSlide !== "undefined"
        && this.activeSlide !== this.parentSlide);
  }
  _updatedHidden() {
    this.querySelectorAll( "dia-livecode")
      .forEach(( element) => element.hidden = this.hidden);
  }
}
customElements.define( "dia-po", DiaPo);

class DiaDisplaySelector extends litElement.LitElement {
  static get styles() {
    return [ diaStyles.CommonStyles, diaStyles.DiaDisplaySelectorStyles ];
  }
  static get properties() {
    return {
      displayList: { type: Set, attribute: false },
      selectedDisplayId: { type: String, attribute: false }
    }
  }
  render() {
    return litElement.html`<div class="select">${
        Array.from( this.displayList.values())
          .map(( displayId) =>
            litElement.html`<span id="${displayId}" class="item"
                       ?selected="${(displayId === this.selectedDisplayId)}"
                       @click=${this._onSelected}>${displayId}</span>`)
      }</div>`;
  }
  constructor() {
    super();
    this.displayList = new Set();
    this.selectedDisplayId = undefined;
  }
  _onSelected( e) {
    const selectedDisplayId = e.target.id;
    this.dispatchEvent(
      new CustomEvent( "display-selected", {
        detail: { display: selectedDisplayId },
        bubbles: true, composed: true
      })
    );
    this.selectedDisplayId = selectedDisplayId;
  }
}
customElements.define( "dia-display-selector", DiaDisplaySelector);

const KEYBOARD_BINDINGS = Object.freeze({
  FULLSCREEN: {code: "KeyF"},
  DETACH: {code: "Escape"},
  NEXT: {code: "ArrowRight"},
  PREVIOUS: {code: "ArrowLeft"},
  RESYNC: {code: "Space"},
  TOGGLESPEAKER: {ctrlKey: true, altKey: true, code: "KeyS"},
  FOCUS: {code: "Space", ctrlKey: true},
});
class DiaControllerKeyboard extends litElement.LitElement {
  static get properties() {
    return {
      controller: { type: Element },
      target: { type: Object }
    }
  }
  constructor() {
    super();
    this.controller = undefined;
  }
  registerKeyboardListeners( target) {
    target.setAttribute( "tabIndex", "-1");
    target.focus();
    target.addEventListener( "keyup", this.onKeyUp.bind( this));
  }
  getAction(e) {
    const action = Object.keys(KEYBOARD_BINDINGS).find( (action) => {
      return e.code == KEYBOARD_BINDINGS[action].code
        && e.ctrlKey == (KEYBOARD_BINDINGS[action].ctrlKey || false)
        && e.altKey == (KEYBOARD_BINDINGS[action].altKey || false);
    });
    return action;
  }
  onKeyUp( e) {
    const action = this.getAction(e);
    switch( action){
      case "FULLSCREEN":
        this.controller.fullscreen();
        break;
      case "DETACH":
        this.controller.detach();
        break;
      case "NEXT":
        this.controller.next();
        break;
      case "PREVIOUS":
        this.controller.previous();
        break;
      case "RESYNC":
        this.controller.resync();
        break;
      case "FOCUS":
        this.controller.focus();
        break;
      case "TOGGLESPEAKER":
        this.controller.toggleSpeaker();
        break;
    }
  }
  disconnectedCallback(){
    super.disconnectedCallback();
    target.removeEventListener( "keyup", this.onKeyUp);
    this.target = undefined;
  }
}
customElements.define("dia-controller-keyboard", DiaControllerKeyboard);

class DiaControllerRemoteFirebase extends litElement.LitElement {
  static get styles() {
    return [ diaStyles.CommonStyles ];
  }
  static get properties() {
    return {
      roomId:   { type: String, attribute: "room-id" },
      photoURL: { type: String },
      head:     { type: Object}
    }
  }
  render() {
    return litElement.html`
			<style>
      :host { display: inline-flex; }
      :host > * {
        margin-right: 5px;
        height: 2em;
      }
      img {
        vertical-align: middle;
      }
      button[hidden] {
        display: none;
      }
			</style>
			<img class="small-user-profile" src="${this.photoURL}"></img>
      <button id="login">LogIn</button>
      <button id="logout" hidden>Logout</button>
    `
  }
  constructor() {
    super();
    this.controller = undefined;
    this.roomId = undefined;
    this._firebaseConfig = {
			apiKey: "AIzaSyADiO_Dlp79UW1IO6DwX6Gyy3jUD8Z-rHI",
			authDomain: "slideshow-npm-package.firebaseapp.com",
			databaseURL: "https://slideshow-npm-package.firebaseio.com",
			projectId: "slideshow-npm-package",
			storageBucket: "slideshow-npm-package.appspot.com",
			messagingSenderId: "154605865517"
		};
    this._user = undefined;
    this.initFirebase( this._firebaseConfig);
    this.initFirebaseAuth();
    this.initFirebaseDB();
  }
  initFirebase(config) {
		window.firebase.initializeApp( config);
  }
  initFirebaseAuth(){
    window.firebase.auth().onAuthStateChanged(( user) => {
			if (user) ; else {
        console.warn("User is not logged in");
        this._firebaseLoginAnonymously();
			}
      this._displayLoginButton( user && user.isAnonymous);
      this._updateUser( user);
      this.updateAudienceStats( this.head);
		});
  }
  _firebaseLoginAnonymously(){
    window.firebase.auth().signInAnonymously().catch(( error) => {
		});
  }
  _firebaseLoginGoogle() {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    window.firebase.auth().signInWithPopup( provider).then(( result) => {
    }).catch( function( error) {
      throw error;
    });
  }
  _firebaseLogoutGoogle() {
		window.firebase.auth().signOut().then( function() {
      this._updateUser( undefined);
		}).catch( function( error) {
		});
  }
  _updateUser(googleUser) {
    this._user = googleUser;
    this.photoURL = "https://petit-atelier.ch/images/petit-atelier-logo.svg";
    if( googleUser && googleUser.photoURL) {
      this.photoURL = googleUser.photoURL;
    }
  }
  _displayLoginButton( b) {
    if( b) {
      this.shadowRoot.querySelector( "button[id='logout']").setAttribute( "hidden", "");
      this.shadowRoot.querySelector( "button[id='login']").removeAttribute( "hidden");
    } else {
      this.shadowRoot.querySelector( "button[id='login']").setAttribute( "hidden", "");
      this.shadowRoot.querySelector( "button[id='logout']").removeAttribute( "hidden");
    }
  }
  initFirebaseDB() {
    this._db = window.firebase.firestore();
  }
  firstUpdated(){
    const buttonLogin = this.shadowRoot.querySelector("button[id='login']");
    buttonLogin.addEventListener("click", () => { this._firebaseLoginGoogle(); });
    const buttonLogout = this.shadowRoot.querySelector("button[id='logout']");
    buttonLogout.addEventListener("click", () => { this._firebaseLogoutGoogle(); });
  }
  updated( changedProperties) {
    if( changedProperties.has('roomId')){
      this._listenRoomHeadSlide(this.roomId);
    }
  }
  _listenRoomHeadSlide( roomId){
    if(roomId == undefined) { return; }
		this._db.collection( "live").doc( this.roomId).onSnapshot(( doc) => {
      const data = doc.data();
      console.debug( "dia-controller-remote-firebase › listenRoomHeadSlide()", doc.data());
      this.dispatchEvent( new CustomEvent( "live-head-updated", {
        detail: {
          liveHead: {
            slide: data[ "head:slide"],
            display: data[ "head:display"]
          }},
        bubbles: true, composed: true
      }));
    });
  }
  updateLiveHead( head){
    if( head == undefined) { return; }
    console.debug( "dia-controller-remote-firebase › updateLiveHead( head)", head);
    this._db
      .collection( "live")
      .doc( this.roomId)
      .update( {
        "head:slide": head.slide,
        "head:display": head.display
      });
  }
  updateAudienceStats( head){
    console.debug( "dia-controller-remote-firebase › updateAudienceStats( head)", head);
    if( head) { this.head = head; }
    if( this._user == undefined || this._user.uid == undefined || head == undefined) { return; }
    const docId = this._user.isAnonymous ? "A_"+this._user.uid : this._user.email;
    this._db
      .collection( "audience")
      .doc( docId)
      .set({
        "head:slide":   head.slide,
        "head:display": head.display,
        "displayName":  this._user.displayName,
        "isAnonymous":  this._user.isAnonymous
      });
  }
}
customElements.define( "dia-controller-remote-firebase", DiaControllerRemoteFirebase);

class DiaController extends litElement.LitElement {
  static get styles() {
    return [ diaStyles.DiaControllerStyles ];
  }
  static get properties() {
    return {
      slide:         { type: String },
      display:       { type: String },
      speaker:       { type: Boolean },
      detached:      { type: Boolean },
      target:        { type: Object },
      _head:         { type: Object, attribute: true},
      _liveHead:     { type: String, attribute: "live-head"},
      _detachedHead: { type: String, attribute: "detached-head"},
    }
  }
  render() {
    return litElement.html`
      <slot></slot>
      <dia-controller-keyboard></dia-controller-keyboard>
      <dia-controller-remote-firebase room-id="room:main"></dia-controller-remote-firebase>
      <slot name="after"></slot>
    `;
  }
  constructor(){
    super();
    this.slide        = undefined;
    this.display      = undefined;
    this.head         = {slide: undefined, display: undefined};
    this.liveHead     = undefined;
    this.detachedHead = undefined;
    this.detached     = false;
    this.speaker      = false;
    this.detached     = false;
    this._target = undefined;
    this._keyboardController = undefined;
    this._remoteController = undefined;
    this.addEventListener( "live-head-updated", this._onLiveHeadUpdated.bind( this));
  }
  firstUpdated() {
    this._keyboardController = this.shadowRoot.querySelector("dia-controller-keyboard");
    this._keyboardController.controller = this;
    this._remoteController = this.shadowRoot.querySelector("dia-controller-remote-firebase");
    this._remoteController.controller = this;
  }
  updated(changedProperties){
    if( changedProperties.has( "slide")) {
      this.head.slide = this.slide;
    }
    if( changedProperties.has( "display")) {
      this.head.display = this.display;
    }
    if( changedProperties.has( "slide") || changedProperties.has("display")){
      this._remoteController.updateAudienceStats(this.head);
    }
    if( changedProperties.has( "slide")
      || changedProperties.has( "speaker")
      || changedProperties.has( "liveHead")
      || changedProperties.has( "detached")) {
      if( !this.speaker && !this.detached
        && this.liveHead && this.liveHead != undefined
        && this.liveHead.slide != this.slide) {
        this.detach();
      }
      if( this.detached){
        this.detachedHead = this.head;
      }
    }
    if( changedProperties.has( "target") && this.target != undefined) {
      this._keyboardController.registerKeyboardListeners( this.target);
    }
  }
  next() {
    console.debug( "dia-controller › next()");
    if(this.target.slide == undefined) { return; }
    const slide = this.target.querySelectorAll( `dia-slide[id="${this.head.slide}"]`)[0];
    const nextSlide = slide.nextElementSibling;
    if(nextSlide != null && nextSlide.tagName == "DIA-SLIDE"){
      const nextSlideID = nextSlide.getAttribute("id");
      this.__dispatchEvt("slide-selected", {slide: nextSlideID});
      const defaultDisplayID = this._getDefaultDisplayOfSlide(nextSlide);
      if(!this.speaker) {
        this.__dispatchEvt("display-selected", {display: defaultDisplayID});
      }
      if(this.speaker && !this.detached){
        this._remoteController.updateLiveHead({slide: nextSlideID, display: defaultDisplayID});
      }
    }
  }
  previous() {
    console.debug( "dia-controller › previous()");
    if(this.target.slide == undefined) { return; }
    var slide = this.target.querySelectorAll( `dia-slide[id="${this.head.slide}"]`)[0];
    var prevSlide = slide.previousElementSibling;
    if(prevSlide != null && prevSlide.tagName == "DIA-SLIDE"){
      const prevSlideID = prevSlide.getAttribute("id");
      this.__dispatchEvt("slide-selected", {slide: prevSlideID});
      const defaultDisplayID = this._getDefaultDisplayOfSlide(prevSlide);
      if(!this.speaker) {
        this.__dispatchEvt("display-selected", {display: defaultDisplayID});
      }
      if(this.speaker && !this.detached){
        this._remoteController.updateLiveHead({slide: prevSlideID, display: defaultDisplayID});
      }
    }
  }
  _getDefaultDisplayOfSlide(slideElement) {
    const defaultDiaPo = slideElement.querySelector( "dia-po[default]");
    return defaultDiaPo.getAttribute("display");
  }
  moveTo( slide, display) {
    console.debug( "dia-controller › moveTo()", slide, display);
    this.moveToSlide(slide);
    this.moveToDisplay(display);
  }
  moveToSlide( slide) {
    console.debug( "dia-controller › moveToSlide()", slide);
    this.__dispatchEvt("slide-selected", {slide: slide});
  }
  moveToDisplay( display) {
    console.debug( "dia-controller › moveToDisplay()", display);
    this.__dispatchEvt("display-selected", {display: display});
  }
  detach() {
    console.debug( "dia-controller › detach() from liveHead");
    if( this.detached) {
      this.moveTo( null, null);
    } else {
      this.__dispatchEvt( "detach-enabled");
      this.detachedHead = this.head;
    }
  }
  resync() {
    console.debug( "dia-controller › resync() with liveHead");
    this.detachedHead = undefined;
    this.__dispatchEvt("detach-disabled");
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
  fullscreen() {
    console.debug( "dia-controller › fullscreen()");
    this.__dispatchEvt("fullscreen-enabled");
  }
  toggleSpeaker(){
    console.debug( "dia-controller › toggleSpeaker()");
    if(!this.detached){
      this.__dispatchEvt("speaker-toggled");
      if(this.head.slide != this.liveHead.slide){this.resync();}
    }
  }
  focus(){
    console.debug( "dia-controller › focus()");
    if(this.speaker && this.detached) {
      this._remoteController.updateLiveHead(this.head);
      this.__dispatchEvt("detach-disabled");
    }
  }
  _onLiveHeadUpdated(e){
    const prevLiveHead = this.liveHead;
    this.liveHead = e.detail.liveHead;
    console.debug( "dia-controller › on-live-head-updated(): ", e.detail.liveHead);
    if(prevLiveHead == undefined){
      this.resync();
    } else if(!this.detached) {
      if(this.speaker) {
        this.moveToSlide(this.liveHead.slide);
      } else {
        this.moveTo(this.liveHead.slide, this.liveHead.display);
      }
    }
  }
  __dispatchEvt(name, detail, bubbles=true, composed=true){
    this.dispatchEvent( new CustomEvent(name, {
      detail: detail, bubbles: bubbles, composed: composed
    }));
  }
}
customElements.define( "dia-controller", DiaController);

var index = {
  DiaShow,
  DiaSlide,
  DiaPo,
  DiaDisplaySelector,
  DiaController
};

module.exports = index;
