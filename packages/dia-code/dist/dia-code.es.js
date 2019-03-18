import { LitElement, css, html } from 'lit-element';
import { CommonStyles } from '@petitatelier/dia-show/shared-styles.js';

class DiaCode extends LitElement {
  static get styles() {
    return [
      CommonStyles,
      css`
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
    return html`<pre><code class="${this.type}"><slot></slot></code></pre>`;
  }
  constructor() {
    super();
    this.type = "javascript";
  }
}
customElements.define( "dia-code", DiaCode);

export { DiaCode };
