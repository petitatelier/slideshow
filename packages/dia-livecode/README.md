# @petitatelier/dia-livecode

Defines the ‹dia-livecode› web component, which displays the Glitch collaborative code editor and/or preview inside a diapositive of a slideshow.

## Features

1. [Glitch](https://glitch.com/) as the provider of the live-coding collaborative editor (and [Stackblitz](https://stackblitz.com/) could easily be added, both use a similar URL scheme);
2. Specification of Glitch project with `project="‹projectId›"`;
3. Editor / Preview / Embed views of Glitch with `mode="editor|preview|embed"` attribute;
4. Selection of file to edit with `file="‹filename›"` attribute;
5. Auto-refresh with `refresh="‹timeout›"` attribute (timeout in milliseconds); useful for `preview` mode.

## Usage

```html
    <dia-show slide="s01" display="proj01">
      <dia-slide id="s01">
        <dia-po display="proj01"><dia-livecode project="power-asteroid" mode="editor" file="index.html"></dia-livecode></dia-po>
        <dia-po display="tv01"><dia-livecode project="power-asteroid" mode="preview" refresh="5000"></dia-livecode></dia-po>
        <dia-po display="tv02"></dia-po>
        <dia-po display="pres01"></dia-po>
        <dia-po display="pres02"></dia-po>
      </dia-slide>
      <dia-slide id="s02">
        <dia-po display="proj01"><dia-livecode project="power-asteroid" mode="embed" file="index.html"></dia-livecode></dia-po>
        <dia-po display="tv01"></dia-po>
        <dia-po display="tv02"></dia-po>
        <dia-po display="pres01"></dia-po>
        <dia-po display="pres02"></dia-po>
      </dia-slide>
      <dia-slide id="s03">
        <dia-po display="proj01"></dia-po>
        <dia-po display="tv01"></dia-po>
        <dia-po display="tv02"></dia-po>
        <dia-po display="pres01"></dia-po>
        <dia-po display="pres02"></dia-po>
      </dia-slide>
    </dia-show>
<dia-show>
```