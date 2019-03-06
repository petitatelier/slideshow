import { LitElement } from "lit-element";

/**
 * Mapping of navigation features to keyboard strokes.
 */
const KEYBOARD_BINDINGS = Object.freeze({
  FULLSCREEN: "KeyF",
  DETACH: "Escape",
  NEXT: "ArrowRight",
  PREV: "ArrowLeft",
  RESYNC: "Space",
  FOCUS: "Enter"
});

export default class DiaControllerKeyboard extends LitElement {

  static get properties() {
    return {
      target: { type: Object }
    }
  }

  constructor() {
    super();

    // Private properties
    this._controller = undefined;

    this._isDetached = false;
  }

  updated( changedProperties) {
  }

  /**
   * Helper function that registers keyboard listeners on
   * a target ‹dia-show› element, to allow to navigate
   * the slideshow with specific keyboard strokes
   **/
  registerKeyboardListeners( target, controller) {
    // Set ‹dia-show› to be focusable and focus it to listen the keyboard
    target.setAttribute( "tabIndex", "-1");
    target.focus();

    // Listen to the bindings and execute the corresponding action
    // on target ‹dia-show› element
    target.addEventListener( "keyup", this.onKeyUp.bind( target));

    // The current controller to talk to
    this._controller = controller;
  }

  onKeyUp( e) {
    // @assert This function must have been bound previously
    // to its target ‹dia-show› element
    // console.log( "on-keyup", this, e);
    switch( e.code){
      case KEYBOARD_BINDINGS.FULLSCREEN:
        this._controller.fullscreen();
        break;
      case KEYBOARD_BINDINGS.DETACH:
        this._controller.detach();
        break;
      case KEYBOARD_BINDINGS.NEXT:
        this._controller.next();
        break;
      case KEYBOARD_BINDINGS.PREV:
        this._controller.previous();
        break;
      case KEYBOARD_BINDINGS.RESYNC:
        this._controlle.resync();
        break;
      case KEYBOARD_BINDINGS.FOCUS:
        this._controller.focus();
        break;
    }
  }
}

customElements.define("dia-controller-keyboard", DiaControllerKeyboard);
