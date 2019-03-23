/*
 * Copyright 2019 Le Petit Atelier de Génie logiciel sàrl.
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { LitElement } from "lit-element";

const TOUCH_EVENT_RE = /^touch(start|end|move)$/;
const SWIPE_RATIO_THRESHOLD = 0.15;

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
 * Derivated from GoogleWebComponents › model-viewer › three-components › SmoothControls.ts
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
    this.lastPointerPosition = { x: undefined, y: undefined };
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
    target.removeEventListener( "wheel", this.onWheel);
    target.removeEventListener( "keydown", this.onKeyDown);
    target.removeEventListener( "touchstart", this.onTouchStart);
    target.removeEventListener( "touchmove", this.onTouchMove);

    self.removeEventListener( "mouseup", this.onMouseUp);
    self.removeEventListener( "touchend", this.onTouchEnd);

    target.style.cursor = "";
  }

  pixelLengthToWidthRatio( pixelLength) {
    return pixelLength / this.target.clientWidth;
  }

  twoTouchDistance( touchOne, touchTwo) {
    const { clientX: xOne, clientY: yOne } = touchOne,
          { clientX: xTwo, clientY: yTwo } = touchTwo;
    const xDelta = xTwo - xOne,
          yDelta = yTwo - yOne;
    return Math.sqrt( xDelta * xDelta + yDelta * yDelta);
  }

  // event is MouseEvent or TouchEvent
  handlePointerMove( event) {
    if( !this.pointerIsDown) { return; }

    console.debug( "dia-controller-pointer › handlePointerMove()", this);
    let handled = false;

    if( TOUCH_EVENT_RE.test( event.type)) {
      const { touches } = event; // TouchEvent
      if( this.touchMode === "swipe") {
          const { clientX: xOne } = this.lastTouches[ 0],
                { clientX: xTwo } = touches[ 0];
          const deltaWidth = this.pixelLengthToWidthRatio( xTwo - xOne);
          if( deltaWidth >= SWIPE_RATIO_THRESHOLD) {
            this.dispatchEvent( new CustomEvent( "previous-slide-requested", BUBBLING_AND_COMPOSED));
            handled = true;
          }
          if( deltaWidth <= -SWIPE_RATIO_THRESHOLD) {
            this.dispatchEvent( new CustomEvent( "next-slide-requested", BUBBLING_AND_COMPOSED));
            handled = true;
          }
      }
      this.lastTouches = touches;
    } else {
      const { clientX: x } = event; // MouseEvent
      const deltaWidth = this.pixelLengthToWidthRatio( x - this.lastPointerPosition.x);
      if( deltaWidth >= SWIPE_RATIO_THRESHOLD) {
        this.dispatchEvent( new CustomEvent( "previous-slide-requested", BUBBLING_AND_COMPOSED));
        handled = true;
      }
      if( deltaWidth <= -SWIPE_RATIO_THRESHOLD) {
        this.dispatchEvent( new CustomEvent( "next-slide-requested", BUBBLING_AND_COMPOSED));
        handled = true;
      }
      this.lastPointerPosition.x = x;
    }

    if( handled && event.cancelable) {
      event.preventDefault();
    }
  }

  // event is MouseEvent or TouchEvent
  handlePointerDown( event) {
    console.debug( "dia-controller-pointer › handlePointerDown()", this);
    this.pointerIsDown = true;

    if( TOUCH_EVENT_RE.test( event.type)) {
      const { touches } = event; // TouchEvent

      switch( touches.length) {
        default:
        case 1:
          this.touchMode = "swipe";
          break;
        case 2:
          this.touchMode = "zoom";
          break;
      }

      this.lastTouches = touches;

    } else {
      const { clientX: x, clientY: y } = event; // MouseEvent

      this.lastPointerPosition.x = x;
      this.lastPointerPosition.y = y;

      this.target.style.cursor = "grabbing";
    }
  }

  // eslint-disable-next-line no-unused-vars
  handlePointerUp( _event) {
    console.debug( "dia-controller-pointer › handlePointerUp()", this);
    this.target.style.cursor = "grab";
    this.pointerIsDown = false;
  }
}

customElements.define( "dia-controller-pointer", DiaControllerPointer);