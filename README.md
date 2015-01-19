# calculate.jquery

A jQuery plugin to do math with form fields, and put results in other fields.

## The basics

This plugin is invoked with formula to be applied to some selectors. These selectors will match descendants of the original jQuery object.

For example, the following HTML:

```html
<div class="basics">
  <p><input class="base" value="12.2"> Base</p>
  <p><input class="diff" value="5.1"> Difference</p>
  <p class="total-wrap"><input class="total"> Total</p>
</div>
```

Can be used with the following JavaScript:

```js
$('.basics').calculate('{{.total}} = {{.base}} - {{.diff}}');
```

As a result, you can expect:

  * The field `.total` will be calculated automatically, given the value `"7.1"`
  * A change in any of `.base` or `.diff` (ie: a `change` event) will result in an updated `.total`
  * In turn, an auto-updated `.total` will trigger a `change` event itself
