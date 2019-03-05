# @petitatelier/slideshow

A multiplex slideshow system, spreading a presentation on multiple displays.

## Usage

```html
<dia-show slide="s01" display="proj01">
  <dia-slide id="s01">
    <dia-po display="proj01"></dia-po>
    <dia-po display="tv01"></dia-po>
    <dia-po display="tv02"></dia-po>
    <dia-po display="pres01"></dia-po>
    <dia-po display="pres02"></dia-po>
  </dia-slide>
  <dia-slide id="s02">
    <dia-po display="proj01"></dia-po>
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
```