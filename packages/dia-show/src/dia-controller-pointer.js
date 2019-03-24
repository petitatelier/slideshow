import { LitElement } from "lit-element";

const TOUCH_EVENT_RE = /^touch(start|end|move)$/;
const SWIPE_LENGTH_THRESHOLD = 0.05;

// Event init options of the custom events fired by this class
const BUBBLING_AND_COMPOSED = Object.freeze({
  bubbles: true, composed: true });

/**
 * Maps touch- and mouse gestures to slideshow features:
 *
 * - swipe rigth-to-left navigates to next slide
 * - swipe left-to-right navigates to previous slide
 *
 * Fires one of the following custom events, when a gesture
 * matches a slideshow action:
 *
 * @fires CustomEvent#next-slide-requested
 * @fires CustomEvent#previous-slide-requested
 *
 * Inspired from GoogleWebComponents › model-viewer › three-components › SmoothControls
 * although gestures are detected at time of `handlePointerUp()`, rather than `handlePointerMove()`
 * @see https://github.com/GoogleWebComponents/model-viewer/blob/master/src/three-components/SmoothControls.ts
 */
export class DiaControllerPointer extends LitElement {

  static get properties() {
    return {
      // Target ‹dia-show› element (or other element), where to attach keyboard listener to
      target: { type: HTMLElement, attribute: false } // Observed property only
    }
  }

  constructor() {
    super();
    console.debug( "dia-controller-pointer › constructor()");

    // Create event listener proxys, redirecting both touch- and
    // mouse gesture listeners to unified touch/mouse gesture listeners
    this.onMouseMove = (event) => this.handlePointerMove( event);
    this.onMouseDown = (event) => this.handlePointerDown( event);
    this.onMouseUp = (event) => this.handlePointerUp( event);
    this.onTouchMove = (event) => this.handlePointerMove( event);
    this.onTouchStart = (event) => this.handlePointerDown( event);
    this.onTouchEnd = (event) => this.handlePointerUp( event);

    // Public observed properties
    this.target = undefined;

    // Private properties
    this.pointerIsDown = false;
    this.touchMode = undefined; // "swipe" | "zoom"
    this.lastTouches = undefined; // TouchList
    this.initialTouches = undefined; // TouchList
    this.lastPointerPosition = { x: undefined, y: undefined };
    this.initialPointerPosition = { x: undefined, y: undefined };
  }

  updated( changedProperties) {
    console.debug( "dia-controller-pointer › updated()", changedProperties);
    // Register keyboard listener on target ‹dia-show› element (or other element),
    // when the `target` property is newly set
    if( changedProperties.has( "target")) {
      const oldTarget = changedProperties.get( "target");
      if( typeof oldTarget !== "undefined") {
        // Unregister the same listener from previous target element, if there was one
        this._unregisterPointerListeners( oldTarget);
      }
      this._registerPointerListeners( this.target);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.debug( "dia-controller-pointer › disconnected()");
    this._unregisterPointerListeners( this.target);
    this.target = null;
  }

  _registerPointerListeners( target) {
    target.addEventListener( "mousemove", this.onMouseMove);
    target.addEventListener( "mousedown", this.onMouseDown);
    target.addEventListener( "touchstart", this.onTouchStart);
    target.addEventListener( "touchmove", this.onTouchMove);

    self.addEventListener( "mouseup", this.onMouseUp);
    self.addEventListener( "touchend", this.onTouchEnd);

    target.style.cursor = "grab";
  }

  _unregisterPointerListeners( target) {
    target.removeEventListener( "mousemove", this.onMouseMove);
    target.removeEventListener( "mousedown", this.onMouseDown);
    target.removeEventListener( "touchstart", this.onTouchStart);
    target.removeEventListener( "touchmove", this.onTouchMove);

    self.removeEventListener( "mouseup", this.onMouseUp);
    self.removeEventListener( "touchend", this.onTouchEnd);

    target.style.cursor = "";
  }

  pixelLengthToWidthRatio( pixelLength) {
    return pixelLength / this.target.clientWidth;
  }

  // event is MouseEvent or TouchEvent
  handlePointerMove( event) {
    if( !this.pointerIsDown) { return; }

    if( TOUCH_EVENT_RE.test( event.type)) {
      const { touches } = event; // TouchEvent
      this.lastTouches = touches;
    } else {
      const { clientX: x, clientY: y } = event; // MouseEvent
      this.lastPointerPosition.x = x;
      this.lastPointerPosition.y = y;
    }
  }

  // event is MouseEvent or TouchEvent
  handlePointerDown( event) {
    this.pointerIsDown = true;

    if( TOUCH_EVENT_RE.test( event.type)) {
      const { touches } = event; // TouchEvent

      this.initialTouches = touches;
      this.lastTouches = touches;

      switch( touches.length) {
        default:
        case 1:
          this.touchMode = "swipe";
          break;
        case 2:
          this.touchMode = "zoom"; // for future use
          break;
      }
    } else {
      const { clientX: x, clientY: y } = event; // MouseEvent

      this.initialPointerPosition.x = x;
      this.initialPointerPosition.y = y;
      this.lastPointerPosition.x = x;
      this.lastPointerPosition.y = y;

      this.target.style.cursor = "grabbing";
    }
  }

  handlePointerUp( event) {
    this.target.style.cursor = "grab";
    this.pointerIsDown = false;

    let handled = false;
    if( TOUCH_EVENT_RE.test( event.type)) {
      // this.touchMode === "zoom": no-op
      if( this.touchMode === "swipe") {
        const { clientX: x1 } = this.initialTouches[ 0],
              { clientX: x2 } = this.lastTouches[ 0],
              deltaWidth = this.pixelLengthToWidthRatio( x2 - x1);
        if( deltaWidth >= SWIPE_LENGTH_THRESHOLD) {
          this.dispatchEvent( new CustomEvent( "previous-slide-requested", BUBBLING_AND_COMPOSED));
          handled = true;
        }
        else if( deltaWidth <= -SWIPE_LENGTH_THRESHOLD) {
          this.dispatchEvent( new CustomEvent( "next-slide-requested", BUBBLING_AND_COMPOSED));
          handled = true;
        }
      }
    } else {
      const { x: x1 } = this.initialPointerPosition,
            { x: x2 } = this.lastPointerPosition,
            deltaWidth = this.pixelLengthToWidthRatio( x2 - x1);
      if( deltaWidth >= SWIPE_LENGTH_THRESHOLD) {
        this.dispatchEvent( new CustomEvent( "previous-slide-requested", BUBBLING_AND_COMPOSED));
        handled = true;
      }
      else if( deltaWidth <= -SWIPE_LENGTH_THRESHOLD) {
        this.dispatchEvent( new CustomEvent( "next-slide-requested", BUBBLING_AND_COMPOSED));
        handled = true;
      }
    }
    if( handled && event.cancelable) {
      event.stopPropagation();
    }
  }
}

customElements.define( "dia-controller-pointer", DiaControllerPointer);