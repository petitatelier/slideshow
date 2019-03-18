import { LitElement } from "lit-element";

/**
 * Mapping of navigation features to keyboard strokes.
 */
const KEYBOARD_BINDINGS = Object.freeze({
  FULLSCREEN: {code: "KeyF"},
  DETACH: {code: "Escape"},
  NEXT: {code: "ArrowRight"},
  PREVIOUS: {code: "ArrowLeft"},
  RESYNC: {code: "Space"},
  TOGGLESPEAKER: {ctrlKey: true, altKey: true, code: "KeyS"},
  FOCUS: {code: "Space", ctrlKey: true},
});

export class DiaControllerKeyboard extends LitElement {

  static get properties() {
    return {
      controller: { type: Element },
      target: { type: Object }
    }
  }

  constructor() {
    super();

    // The controller to talk to.
    this.controller = undefined;
  }

  /**
   * Helper function that registers keyboard listeners on a target ‹dia-show›
   * element, to allow to navigate the slideshow with specific keyboard strokes
   **/
  registerKeyboardListeners( target) {
    // Set ‹dia-show› to be focusable and focus it to listen the keyboard
    target.setAttribute( "tabIndex", "-1");
    target.focus();

    // Listen to the bindings and execute the corresponding action
    // on target ‹dia-show› element
    target.addEventListener( "keyup", this.onKeyUp.bind( this));
  }

  /**
   * Returns the action associated to a specific keybind
   */
  getAction(e) {
    const action = Object.keys(KEYBOARD_BINDINGS).find( (action) => {
      return e.code == KEYBOARD_BINDINGS[action].code
        && e.ctrlKey == (KEYBOARD_BINDINGS[action].ctrlKey || false)
        && e.altKey == (KEYBOARD_BINDINGS[action].altKey || false);
    })
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
