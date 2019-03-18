import { LitElement, html } from 'lit-element';
import { CommonStyles, DiaShowStyles, DiaSlideStyles, DiaPoStyles, DiaDisplaySelectorStyles, DiaControllerStyles } from '@petitatelier/dia-styles';

class DiaShow extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaShowStyles ];
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
    console.log( `dia-show › on-display-selected: ${selectedDisplay}`);
    this.display = selectedDisplay != undefined ? selectedDisplay : null;
    e.stopPropagation();
  }
  _onSlideSelected( e) {
    const selectedSlide = e.detail.slide;
    console.log( `dia-show › on-slide-selected: ${selectedSlide}`);
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

class DiaSlide extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaSlideStyles ];
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
    return html`
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

class DiaPo extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaPoStyles ];
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
    return html`<div><slot>‹dia-po ${this.display}›</slot></div>`;
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

class DiaDisplaySelector extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaDisplaySelectorStyles ];
  }
  static get properties() {
    return {
      displayList: { type: Set, attribute: false },
      selectedDisplayId: { type: String, attribute: false }
    }
  }
  render() {
    return html`<div class="select">${
        Array.from( this.displayList.values())
          .map(( displayId) =>
            html`<span id="${displayId}" class="item"
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

class DiaController extends LitElement {
  static get styles() {
    return [ DiaControllerStyles ];
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
    return html`
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
    this.addEventListener("live-head-updated", this._onLiveHeadUpdated);
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
      if(!this.speaker &&
         this.liveHead &&
         this.liveHead.slide != this.slide &&
         this.liveHead != undefined && !this.detached) {
        console.log("DETACHED", this.liveHead, this.head);
        this.detach();
      }
      if(this.detached){
        this.detachedHead = this.head;
      }
    }
    if( changedProperties.has( "target") && this.target != undefined) {
      this._keyboardController.registerKeyboardListeners( this.target);
    }
  }
  next() {
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
    console.log( "dia-controller › moveTo()", slide, display);
    this.moveToSlide(slide);
    this.moveToDisplay(display);
  }
  moveToSlide( slide) {
    this.__dispatchEvt("slide-selected", {slide: slide});
  }
  moveToDisplay( display) {
    this.__dispatchEvt("display-selected", {display: display});
  }
  detach(){
    if(this.detached) {
      this.moveTo(null, null);
    } else {
      this.__dispatchEvt("detach-enabled");
      this.detachedHead = this.head;
    }
  }
  resync() {
    console.log("Controller > resynchronized with liveHead");
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
    this.__dispatchEvt("fullscreen-enabled");
  }
  toggleSpeaker(){
    if(!this.detached){
      this.__dispatchEvt("speaker-toggled");
      if(this.head.slide != this.liveHead.slide){this.resync();}
    }
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

export default index;
