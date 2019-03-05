import { LitElement, html, css } from "lit-element";
import { CommonStyles } from "@petitatelier/dia-show/shared-styles.js";

// Minimum refresh timeout, to clamp refresh time and avoid receiving
// HTTP error 429 « Too Many Requests » from Glitch
const MIN_REFRESH_TIMEOUT = 2000; // in milliseconds

export class DiaLiveCode extends LitElement {
  static get styles() {
    return [
      CommonStyles,
      css`:host { display: flex; flex-grow: 1 }`
    ];
  };

  static get properties() {
    return {
      type: { type: String, attribute: false }, // no observed attribute, property only
      project: { type: String },
      mode: { type: String },
      file: { type: String },
      refresh: { type: Number, reflect: true },
      hidden: { type: Boolean, reflect: true }
    }
  }

  get refresh() { return this._refresh; }
  set refresh( newVal) {
    const oldVal = this._refresh;
    // Constrain refresh timeout value to a minimum of MIN_REFRESH_TIMEOUT
    this._refresh = (newVal == void 0) ? newVal // undefined or null
      : (Number.isInteger( newVal) && newVal > MIN_REFRESH_TIMEOUT) ? newVal : MIN_REFRESH_TIMEOUT;
    if( this._refresh) {
      this.setAttribute( "refresh", this._refresh);
    } else {
      this.removeAttribute( "refresh");
    }
    this.requestUpdate( "refresh", oldVal);
  }

  render() {
    const url = this.getGlitchURL( this.project, this.mode, this.file);
    return html`
      <div>‹dia-livecode ${this.project} ${this.type} ${this.mode}›</div>
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

    // Public observed properties
    this.type = "glitch";  // for future use
    this.project = undefined;
    this.mode = undefined;
    this._refresh = undefined;
    this.hidden = false;

    // Private properties
    this._refreshIntervalId = undefined;
  }

  updated() {
    if( typeof this._refreshIntervalId !== "undefined") {
      clearInterval( this._refreshIntervalId);
    }
    if( this._refresh && !this.hidden) {
      const iframeElement = this.shadowRoot.querySelector( "iframe");
      this._refreshIntervalId = setInterval(
        () => { iframeElement.src = iframeElement.src; },
        this._refresh
      );
    }
  }

  getGlitchURL( project, mode = "preview", file = "README.md") {
    project = encodeURIComponent( project);
    file = encodeURIComponent( file);

    switch( mode) {
      case "preview":
        return `https://${project}.glitch.me/`;
      case "editor":
        return `https://glitch.com/edit/#!/${project}?path=${file}`;
      case "embed":
        // @see https://glitch.com/help/how-can-i-customize-a-glitch-app-embed/
        return `https://glitch.com/embed/#!/embed/${project}?path=${file}&previewSize=100`;
      default:
        return undefined;
    }
  }

}

// Register the element with the browser
customElements.define( "dia-livecode", DiaLiveCode);