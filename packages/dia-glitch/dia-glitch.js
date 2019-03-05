import { LitElement, html, css } from "lit-element";
import { CommonStyles } from "@petitatelier/slideshow/shared-styles.js";

export class DiaGlitch extends LitElement {
  static get styles() {
    return [ CommonStyles, css`:host { display: flex; flex-grow: 1 }` ];
  };

  static get properties() {
    return {
      project: { type: String },
      mode: { type: String },
      file: { type: String }
    }
  }

  render() {
    const url = this.getGlitchURL( this.project, this.mode, this.file);
    return html`
      <div>‹dia-glitch ${this.project} ${this.mode}›</div>
      <iframe
        allow="geolocation; microphone; camera; midi; encrypted-media"
        src="${url}"
        alt="${this.project} on Glitch"
        style="height: 100%; width: 100%; border: 0;">
      </iframe>
      <slot></slot>
    `;
  }

  constructor() {
    super();
  }

  getGlitchURL( project, mode, file = "README.md") {
    switch( mode) {
      case "app":
        return `https://${project}.glitch.me/`;
      case "editor":
        return `https://glitch.com/edit/#!/${project}?path=${file}`;
      case "preview":
        // @see https://glitch.com/help/how-can-i-customize-a-glitch-app-embed/
        return `https://glitch.com/embed/#!/embed/${project}?path=${file}&previewSize=100`;
      default:
        return undefined;
    }
  }

}

// Register the element with the browser
customElements.define( "dia-glitch", DiaGlitch);