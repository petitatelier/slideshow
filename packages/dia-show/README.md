# @petitatelier/dia-show

A multiplex slideshow system, allowing one or more speakers to drive the same presentation, spreading its display on multiple displays — including computers &tablets of the audience.

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

## Adjustment of diapositives to displays

Scale all the diapositives:

```css
dia-po {
  transform: scale( 1)
}
```

Perspective of the diapositives displayed on projector:

```css
dia-po[ display="pj01"] {
  transform: skew( 0, -5deg)
}
```

See also: [MDN › CSS › `transform` property](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)