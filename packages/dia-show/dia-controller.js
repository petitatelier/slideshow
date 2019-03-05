import { LitElement, html } from "lit-element";

export class DiaController extends LitElement {

  static get properties() {
    return {
    }
  }

  render() {
    return html`
      <div>‹dia-controller ${this.id}›</div>
      <slot></slot>
    `;
  }

  constructor() {
    super();
    this._bindings = {
      FULLSCREEN: "KeyF",
      HOME: "Escape",
      NEXT: "ArrowRight",
      PREV: "ArrowLeft",
      RESYNC: "Space",
      FOCUS: "Enter"
    }
  }

  firstUpdated() {
    const diaShow = this.closest("dia-show");
    if(!diaShow){ throw new Error("The controller should be a child of ‹dia-show›"); }

    // Set dia-show to be focusable and focus it to listen the keyboard
    diaShow.setAttribute("tabIndex", "-1");
    diaShow.focus();

    // Listen to the bindings and execute the corresponding action on dia-show
    const B = this._bindings;

    diaShow.addEventListener("keyup", (e) => {
      switch(e.code){
        case B.FULLSCREEN:
          diaShow.fullscreen();
          break;
        case B.HOME:
          diaShow.removeAttribute("slide");
          diaShow.removeAttribute("display");
          break;
        case B.NEXT:
          diaShow.next();
          break;
        case B.PREV:
          diaShow.previous();
          break;
        case B.RESYNC:
          diaShow.resync();
          break;
        case B.FOCUS:
          diaShow.focus();
          break;
      }
    });

  }
}

// Register the element with the browser
customElements.define( "dia-controller", DiaController);

