import { LitElement, html } from "lit-element";
import { CommonStyles, DiaSlideStyles } from "./shared-styles.js";

export class DiaSlide extends LitElement {
  static get styles() {
    return [ CommonStyles, DiaSlideStyles ];
  };

  static get properties() {
    return {
      id: { type: String },
      activeSlide: { type: String, attribute: false },
      activeDisplay: { type: String, attribute: false },
      hidden: { type: Boolean, reflect: true }
    }
  }

  render() {
    return html`
      <div>‹dia-slide ${this.id}›</div>
      <slot></slot>
    `;
  }

  constructor() {
    super();
    this.id = undefined;
    this.activeSlide = undefined;
    this.activeDisplay = undefined;
    this.hidden = false;
  }

  firstUpdated() {
    // Checks if the element is in the valid container.
    var diaShow = this.closest("dia-show");
    if(!diaShow){ throw new Error(`The slide '${this.id}' needs to be in the ‹diaShow› element`); }

    // Checks if the current ‹diaShow› slide was defined and
    // sets itself as the active one if none was selected.
    this.addEventListener("click", () => {
      if(diaShow.getAttribute("slide") === null) {
        diaShow.setAttribute("slide", this.id);
      }
    });
  }

  updated( changedProperties) {
    console.log( `dia-slide[${this.id}] › updated()`, changedProperties);
    if( changedProperties.has( "activeSlide")) {
      this.querySelectorAll( "dia-po")
        .forEach(( element) => element.activeSlide = this.activeSlide);
      this.hidden = (typeof this.activeSlide !== "undefined"
                    && this.activeSlide !== this.id);
    }
    if( changedProperties.has( "activeDisplay")) {
      this.querySelectorAll( "dia-po")
        .forEach(( element) => element.activeDisplay = this.activeDisplay);
    }
    if( changedProperties.has( "id")) {
      this.querySelectorAll( "dia-po")
        .forEach(( element) => element.parentSlide = this.id);
    }
  }

}

// Register the element with the browser
customElements.define( "dia-slide", DiaSlide);
