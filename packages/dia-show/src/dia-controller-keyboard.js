import { LitElement } from "lit-element";

// Symbols describing the slideshow navigation features
// (this clever Javascript idiom ensures uniqueness of the
// identifiers and characterizes them as _concepts_)
const $FULLSCREEN = Symbol( "FULLSCREEN"),
      $DETACH = Symbol( "DETACH"),
      $NEXT = Symbol( "NEXT"),
      $PREVIOUS = Symbol( "PREV"),
      $RESYNC = Symbol( "RESYNC"),
      $SPEAKER = Symbol( "SPEAKER"),
      $FOCUS = Symbol( "FOCUS");

// Mapping of key presses to slideshow features
const KEYBOARD_BINDINGS = Object.freeze({
  // Requests slideshow to use full screen
  [$FULLSCREEN]: { code: "KeyF" },
  // Requests to detach from synchronized live head, allowing a speaker to navigate the slideshow, without impacting audience and other speaker
  [$DETACH]:  { code: "Escape" },
  // Requests to activate next slide — either in live- or detached mode
  [$NEXT]:    { code: "ArrowRight" },
  // Requests to activate previous slide — either in live- or detached mode
  [$PREVIOUS]:    { code: "ArrowLeft" },
  // Requests to resync with live head, from detached mode
  [$RESYNC]:  { code: "Space" },
  // Requests to toggle speaker mode, allowing to control the live head
  [$SPEAKER]: { code: "KeyS", ctrlKey: true, altKey: true },
  // Requests to force the live-head to current slide of the speaker
  [$FOCUS]:   { code: "Space", ctrlKey: true },
});

// Default event init options of the custom events fired by this class
const BUBBLING_AND_COMPOSED = Object.freeze({
  bubbles: true, composed: true });

/**
 * Maps keyboard presses to slideshow features:
 *
 * - navigating thru the slides (left `⟵` and right `⟶` arrows)
 * - go fullscreen (`F`)
 * - toggle _speaker_ mode (`CTRL-ALT-S`)
 * - detach from live-head (`ESC`)
 * - display overview of all slides and diapositives (`ESC` again)
 * - resync with live-head (`SPACE`)
 * - focus the audience to speaker's current slide (`CTRL-SPACE`).
 *
 * Fires one of the following custom events, when a keypress
 * matches a slideshow action:
 *
 * @fires CustomEvent#next-slide-requested
 * @fires CustomEvent#previous-slide-requested
 * @fires CustomEvent#fullscreen-requested
 * @fires CustomEvent#speaker-toggle-requested
 * @fires CustomEvent#detach-requested (distingo between _detached_ and _overview_ modes is left to handler)
 * @fires CustomEvent#resync-requested
 * @fires CustomEvent#focus-requested
 */
export class DiaControllerKeyboard extends LitElement {

  static get properties() {
    return {
      // Target ‹dia-show› element (or other element), where to attach keyboard listener to
      target: { type: HTMLElement, attribute: false } // Observed property only
    }
  }

  constructor() {
    super();
    console.debug( "dia-controller-keyboard › constructor()");

    // Bind event listeners to this instance (at construction time,
    // to ensure that we register/unregister the same function)
    this._onKeyUp = this._onKeyUp.bind( this);

    // Public observed properties
    this.target = undefined;
  }

  updated( changedProperties) {
    console.debug( "dia-controller-keyboard › updated()", changedProperties);
    // Register keyboard listener on target ‹dia-show› element (or other element),
    // when the `target` property is newly set
    if( changedProperties.has( "target")) {
      const oldTarget = changedProperties.get( "target");
      if( typeof oldTarget !== "undefined") {
        // Unregister the same listener from previous target element, if there was one
        this._unregisterKeyboardListener( oldTarget);
      }
      this._registerKeyboardListener( this.target);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.debug( "dia-controller-keyboard › disconnected()");
    this._unregisterKeyboardListener( this.target);
    this.target = undefined;
  }

  _registerKeyboardListener( target) {
    target.setAttribute( "tabIndex", "-1"); // Set target ‹dia-show› element to be focusable
    target.focus();                         // and focus it, to listen the keyboard
    target.addEventListener( "keyup", this._onKeyUp);
  }

  _unregisterKeyboardListener( target) {
    target.removeEventListener( "keyup", this._onKeyUp);
  }

  // Map a [`keyup`](https://developer.mozilla.org/en-US/docs/Web/Events/keyup)
  // keyboard event to one of the slideshow features; return the symbol
  // describing the feature; or undefined, if there was no match.
  _matchAction( e) {
    return Reflect.ownKeys( KEYBOARD_BINDINGS)  // Symbols would be ignored by `Object.keys()`
      .find(( action) =>
           e.code    ===  KEYBOARD_BINDINGS[ action].code
        && e.ctrlKey === (KEYBOARD_BINDINGS[ action].ctrlKey || false)
        && e.altKey  === (KEYBOARD_BINDINGS[ action].altKey  || false));
  }

  _onKeyUp( keyboardEvent) {
    const matchingAction = this._matchAction( keyboardEvent);
    switch( matchingAction){
      case $FULLSCREEN:
        this.dispatchEvent( new CustomEvent( "fullscreen-requested", BUBBLING_AND_COMPOSED));
        break;
      case $DETACH:
        this.dispatchEvent( new CustomEvent( "detach-requested", BUBBLING_AND_COMPOSED));
        break;
      case $NEXT:
        this.dispatchEvent( new CustomEvent( "next-slide-requested", BUBBLING_AND_COMPOSED));
        break;
      case $PREVIOUS:
        this.dispatchEvent( new CustomEvent( "previous-slide-requested", BUBBLING_AND_COMPOSED));
        break;
      case $RESYNC:
        this.dispatchEvent( new CustomEvent( "resync-requested", BUBBLING_AND_COMPOSED));
        break;
      case $FOCUS:
        this.dispatchEvent( new CustomEvent( "focus-requested", BUBBLING_AND_COMPOSED));
        break;
      case $SPEAKER:
        this.dispatchEvent( new CustomEvent( "speaker-toggle-requested", BUBBLING_AND_COMPOSED));
        break;
    }
  }
}

customElements.define( "dia-controller-keyboard", DiaControllerKeyboard);