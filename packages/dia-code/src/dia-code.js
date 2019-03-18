import { LitElement, html, css } from "lit-element";
import { CommonStyles } from "@petitatelier/dia-styles";

export class DiaCode extends LitElement {
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

  // updated() {
  //   console.debug( "dia-code › updated(): highlighting code");
  //   const codeBlocks = this.slot.querySelector( "pre code");
  //   codeBlocks.forEach(( codeBlock) => hljs.highlightBlock( codeBlock));
  // }

  constructor() {
    super();

    // Public observed properties/attributes
    this.type = "javascript";

    // Initialize Highlight.js
    // hljs.registerLanguage( "javascript", javascript);
  }
}

// Register the element with the browser
customElements.define( "dia-code", DiaCode);