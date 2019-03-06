/**
 * Mapping of navigation features to keyboard strokes.
 */
export const KEYBOARD_BINDINGS = Object.freeze({
  FULLSCREEN: "KeyF",
  HOME: "Escape",
  NEXT: "ArrowRight",
  PREV: "ArrowLeft",
  RESYNC: "Space",
  FOCUS: "Enter"
});

/**
 * Helper function that registers keyboard listeners on
 * a target ‹dia-show› element, to allow to navigate
 * the slideshow with specific keyboard strokes
 * */
export function registerKeyboardListeners( target) {
  // Set ‹dia-show› to be focusable and focus it to listen the keyboard
  target.setAttribute( "tabIndex", "-1");
  target.focus();

  // Listen to the bindings and execute the corresponding action
  // on target ‹dia-show› element
  target.addEventListener( "keyup", onKeyUp.bind( target));
}

function onKeyUp( e) {
  // @assert This function must have been bound previously
  // to its target ‹dia-show› element
  console.log( "on-keyup", this, e);
  switch( e.code){
    case KEYBOARD_BINDINGS.FULLSCREEN:
      this.fullscreen();
      break;
    case KEYBOARD_BINDINGS.HOME:
      this.moveTo( undefined, undefined);
      break;
    case KEYBOARD_BINDINGS.NEXT:
      this.next();
      break;
    case KEYBOARD_BINDINGS.PREV:
      this.previous();
      break;
    case KEYBOARD_BINDINGS.RESYNC:
      this.resync();
      break;
    case KEYBOARD_BINDINGS.FOCUS:
      this.focus();
      break;
  }
}
