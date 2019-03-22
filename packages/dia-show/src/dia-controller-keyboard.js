import { LitElement } from "lit-element";

// Symbols describing the slideshow navigation features
// (this clever Javascript idiom ensures uniqueness of the
// identifiers and characterizes them as _concepts_)
const $FULLSCREEN = Symbol( "FULLSCREEN"),
      $DETACH = Symbol( "DETACH"),
      $NEXT = Symbol( "NEXT"),
      $PREV = Symbol( "PREV"),
      $RESYNC = Symbol( "RESYNC"),
      $SPEAKER = Symbol( "SPEAKER"),
      $FOCUS = Symbol( "FOCUS");

// Mapping of navigation features to key presses
const KEYBOARD_BINDINGS = Object.freeze({
  [$FULLSCREEN]: { code: "KeyF" },      // Requests slideshow to use full screen
  [$DETACH]:  { code: "Escape" },       // Requests to detach from synchronized live head, allowing a speaker to navigate the slideshow, without impacting audience and other speaker
  [$NEXT]:    { code: "ArrowRight" },   // Requests to activate next slide — either in live- or detached mode
  [$PREV]:    { code: "ArrowLeft" },    // Requests to activate previous slide — either in live- or detached mode
  [$RESYNC]:  { code: "Space" },        // Requests to resync with live head, from detached mode
  [$SPEAKER]: { code: "KeyS", ctrlKey: true, altKey: true },  // Requests to toggle speaker mode, allowing to control the live head
  [$FOCUS]:   { code: "Space", ctrlKey: true },  // Requests to force the live-head to current slide of the speaker
});

export class DiaControllerKeyboard extends LitElement {

  static get properties() {
    return {
      controller: { type: Element },
      // Target ‹dia-show› element (or other element), where to attach keyboard listener to
      target: { type: HTMLElement }
    }
  }

  constructor() {
    super();

    // Bind the event handlers to this class instance
    this._onKeyUp = this._onKeyUp.bind( this);

    // Public observed properties
    this.target = undefined;
    this.controller = undefined;    // TODO: remove this dependency, it complects DiaController and DiaControllerKeyboard
  }

  updated( changedProperties) {
    console.debug( "dia-controller-keyboard › updated()", changedProperties);
    // Register keyboard listeners on target ‹dia-show› element (or other element),
    // when the `target` property is newly set
    if( changedProperties.has( "target")) {
      const oldTarget = changedProperties.get( "target");
      if( typeof oldTarget !== "undefined") {
        // Unregister those same listeners from previous target element, if there was one
        this._unregisterKeyboardListeners( oldTarget);
      }
      this._registerKeyboardListeners( this.target);
    }
  }

  disconnectedCallback(){
    super.disconnectedCallback();
    this._unregisterKeyboardListeners( this.target);
    this.target = undefined;
  }

  _registerKeyboardListeners( target) {
    target.setAttribute( "tabIndex", "-1"); // Set target ‹dia-show› element to be focusable
    target.focus();                         // and focus it to listen the keyboard
    target.addEventListener( "keyup", this._onKeyUp);
  }

  _unregisterKeyboardListeners( target) {
    target.removeEventListener( "keyup", this._onKeyUp);
  }

  // Map a [`keyup`](https://developer.mozilla.org/en-US/docs/Web/Events/keyup)
  // keyboard event to one of the slideshow navigation features; return the symbol
  // describing the feature; or undefined, if there was no match.
  _matchAction( e) {
    return Reflect.ownKeys( KEYBOARD_BINDINGS)
      .find(( action) =>
           e.code    ===  KEYBOARD_BINDINGS[ action].code
        && e.ctrlKey === (KEYBOARD_BINDINGS[ action].ctrlKey || false)
        && e.altKey  === (KEYBOARD_BINDINGS[ action].altKey  || false));
  }

  _onKeyUp( keyboardEvent) {
    const matchingAction = this._matchAction( keyboardEvent);
    console.debug( "dia-controller-keyboard › onKeyUp()", keyboardEvent, matchingAction);
    switch( matchingAction){
      case $FULLSCREEN:
        this.controller.fullscreen();
        break;
      case $DETACH:
        this.controller.detach();
        break;
      case $NEXT:
        this.controller.next();
        break;
      case $PREV:
        this.controller.previous();
        break;
      case $RESYNC:
        this.controller.resync();
        break;
      case $FOCUS:
        this.controller.focus();
        break;
      case $SPEAKER:
        this.controller.toggleSpeaker();
        break;
    }
  }
}

customElements.define( "dia-controller-keyboard", DiaControllerKeyboard);