'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var litElement = require('lit-element');
var diaStyles = require('@petitatelier/dia-styles');

const MIN_REFRESH_TIMEOUT = 2000;
const  DiaLiveCodeStyles = litElement.css`
  :host { display: flex; flex-grow: 1; width: 100%; height: 100% }
  iframe { display: flex; flex-grow: 1; width: 100%; border: 0 }
`;
class DiaLiveCode extends litElement.LitElement {
  static get styles() {
    return [ diaStyles.CommonStyles, DiaLiveCodeStyles ];
  };
  static get properties() {
    return {
      type: { type: String, attribute: false },
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
    this._refresh = (newVal == void 0) ? newVal
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
    return (this.hidden)
      ? litElement.html`<slot>(${this.project} on Glitch —&nbsp;hidden)</slot>`
      : litElement.html`
          <iframe
            allow="geolocation; microphone; camera; midi; encrypted-media"
            alt="${this.project} on Glitch"
            src="${url}">
          </iframe>
        `;
  }
  constructor() {
    super();
    this.type = "glitch";
    this.project = undefined;
    this.mode = undefined;
    this._refresh = undefined;
    this.hidden = false;
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
        return `https://glitch.com/embed/#!/embed/${project}?path=${file}&previewSize=100`;
      default:
        return undefined;
    }
  }
}
customElements.define( "dia-livecode", DiaLiveCode);

exports.DiaLiveCode = DiaLiveCode;
