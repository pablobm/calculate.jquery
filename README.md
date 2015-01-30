# calculate.jquery

A jQuery plugin to do math with form fields, and put results in other fields.

## The basics

Take the following HTML:

```html
<div class="basics">
  <p><input class="base" value="12.2"> Base</p>
  <p><input class="diff" value="5.1"> Difference</p>
  <p class="total-wrap"><input class="total"> Total</p>
</div>
```

And the following JavaScript:

```js
$('.basics').calculate('{{.total}} = {{.base}} - {{.diff}}');
```

As a result, you can expect:

  * The field `.total` will be calculated automatically, given the value `"7.1"`
  * A change in any of `.base` or `.diff` (ie: a `change` event) will result in an updated `.total`
  * In turn, an auto-updated `.total` will trigger a `change` event itself

## Multiple elements for an operand

This plugin is invoked with a formula to be applied to some selectors. These selectors will match descendants of the original jQuery object.

Each operand in the formula can actually refer to several elements. If this is the case, their values will be added up before resolving the rest of the formula. Example:

```html
<div class="one-to-many">
  <p><input class="operand" value="14"></p>
  <p><input class="operand" value="1"></p>
  <p><input class="operand" value="0.8"></p>
  <p><input class="product" value="4"></p>
  <p class="total-wrap"><input class="total"> Total</p>
</div>
```

With JavaScript:

```js
$('.one-to-many').calculate('{{.total}} = {{.operand}} * {{.product}}');
```

The values of the `.operand` elements will be added up (totalling 15.8). This is then multiplied by `.product`, yielding a result of 63.2, which will be set as the value of `.total`.

## One operation, many contexts

If the base jQuery object matches several elements, the expression will be run in each one of them. Example:

```html
<div class="many-to-many">
  <div class="one">
    <p><input class="base" value="12.3"> Base</p>
    <p><input class="diff" value="5.4"> Difference</p>
    <p class="total-wrap"><input class="total"> Total</p>
  </div>
  <div class="one">
    <p><input class="base" value="4"> Base</p>
    <p><input class="diff" value="9"> Difference</p>
    <p class="total-wrap"><input class="total"> Total</p>
  </div>
</div>
```

With JavaScript:

```js
$('.many-to-many .one').calculate('{{.total}} = {{.base}} - {{.diff}}');
```

Each individual `.total` will be calculated within the context of each `.many-to-many .one`.


## Custom input parser

You may want to preprocess the input fields before they are used. To do this, provide the option `inputParser`.

For example, the number 1234567.89 can be written as "1,234,567.89" or "1.234.567,89" depending on the locale. This HTML uses Spanish formatting:

```html
<div class="custom-input">
  <p><input class="base" value="1.234.567,89"> Base</p>
  <p><input class="diff" value="5,89"> Difference</p>
  <p class="total-wrap"><input class="total"> Total</p>
</div>
```

With JavaScript:

```js
var esInputParser = function (rawVal) {
  var pair = rawVal.split(',');
  var integer = pair[0].replace(/\./g, '');
  var decimal = pair[1] || '0';
  return (integer + '.' + decimal)*1;
};
$('.custom-input').calculate('{{.total}} = {{.base}} - {{.diff}}', { inputParser: esInputParser });
```

## Custom output formatter

Similarly, you may want to process the results to format them in a specific way.

Take this HTML:

```html
<div class="custom-output">
  <p><input class="base" value="12.2"> Base</p>
  <p><input class="diff" value="5.1"> Difference</p>
  <p class="total-wrap"><input class="total"> Total</p>
</div>
```

With this JS:

```js
var outputFormatter = function (result) {
  return result.toFixed(2);
};
$('.custom-output').calculate('{{.total}} = {{.base}} - {{.diff}}', { outputFormatter: outputFormatter });
```

As a result, the value of `.total` will be formatted with two decimals, rounding when appropriate.

## Default options

It's possible to set default values for options (at the moment these are only `inputParser` and `outputFormatter`). To do so, use `$.calculate.options(defaults)`, like so:

    $.calculate.options({
      inputParser: function() { ... },
      outputFormatter: function() { ... }
    });

Any subsequent invocations of the plugin will use those options.

## API

Instances of the calculator offer an API. This can be used to cover more advanced cases. To use the API, call `calculate()` with a function. This function will receive the api as first and only parameter:

```js
$('.example').calculate(function(api) {
  // Do stuff with `api` here
});
```

The interface is:

  * `formula(newFormula)`: receives a string with a formula. This will replace the current formula for the calculator
  * `run()`: forces a recalculation

### API usage example

Sometimes, the formula to apply will not be static, and will depend on external factors. For example, the formula may change following a change on a checkbox. See this example:

```html
<div class="api-formula">
  <p><input class="base" value="12.2"> Base</p>
  <p><input class="diff" value="5.1"> Difference</p>
  <p class="total-wrap"><input class="total"> Total</p>
</div>
```

With this JS:

```js
var api;
$('.api-formula').calculate(function(_api) {
  api = _api;
});

api.formula('{{.total}} = {{.base}}');
// At this point, the value of `.total` will be '12.2'

api.formula('{{.total}} = {{.base}} - {{.diff}}');
// Now, `.total` will have a value of '7.1'
```

The plugin knows to remove unused event handlers when appropriate, avoiding memory leaks. Or so I hope!
