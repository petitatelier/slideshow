'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var litElement = require('lit-element');
var diaStyles = require('@petitatelier/dia-styles');

class DiaCode extends litElement.LitElement {
  static get styles() {
    return [
      diaStyles.CommonStyles,
      litElement.css`
        :host {
          @import url( https://cdn.jsdelivr.net/gh/tonsky/FiraCode@1.206/distr/fira_code.css); }
        code {
          font-family: "Fira Code", "Fira Mono", "Courier New", Courier, monospace;
          font-size: 1.25em }`
    ];
  };
  static get properties() {
    return {
      type: { type: String, reflect: true }
    }
  }
  render() {
    return litElement.html`<pre><code class="${this.type}"><slot></slot></code></pre>`;
  }
  constructor() {
    super();
    this.type = "javascript";
  }
}
customElements.define( "dia-code", DiaCode);

exports.DiaCode = DiaCode;
