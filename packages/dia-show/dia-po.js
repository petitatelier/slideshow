import { LitElement, html } from "lit-element";
import { CommonStyles, DiaPoStyles } from "./shared-styles.js";

export class DiaPo extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaPoStyles ];
  }

  static get properties() {
    return {
      display: { type: String },
      parentSlide: { type: String, attribute: false },
      activeSlide: { type: String, attribute: false },
      activeDisplay: { type: String, attribute: false },
      hidden: { type: Boolean, reflect: true }
    }
  }

  render() {
    return html`
      <div>‹dia-po ${this.display}›</div>
      <slot></slot>
    `;
  }

  constructor() {
    super();
    this.display = undefined;
    this.parentSlide = undefined;
    this.activeSlide = undefined;
    this.activeDisplay = undefined;
    this.hidden = false;
  }

  firstUpdated() {
    // Checks if the element is in the valid container.
    var diaShow = this.closest("dia-show");
    if(!diaShow){ throw new Error(`The dia-po '${this.id}' needs to be in the ‹diaShow› element`); }

    // Checks if the current ‹diaShow› display was defined and
    // sets itself as the active one if none was selected.
    this.addEventListener("click", () => {
      if(diaShow.getAttribute("display") === null) {
        diaShow.setAttribute("display", this.display);
      }
    });
  }

  updated( changedProperties) {
    console.log( `dia-po[${this.parentSlide}:${this.display}] › updated()`, changedProperties);
    if( changedProperties.has( "activeSlide") || changedProperties.has( "activeDisplay")) {
      this.hidden = ( typeof this.activeDisplay !== "undefined"
                      && typeof this.display !== "undefined"
                      && this.activeDisplay !== this.display)
                  ||( typeof this.activeSlide !== "undefined"
                      && typeof this.parentSlide !== "undefined"
                      && this.activeSlide !== this.parentSlide);
    }
    if( changedProperties.has( "hidden")) {
      this.querySelectorAll( "dia-livecode")
        .forEach(( element) => element.hidden = this.hidden);
    }
  }

}

// Register the element with the browser
customElements.define( "dia-po", DiaPo);
