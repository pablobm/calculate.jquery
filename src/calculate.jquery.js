(function ($) {
  $.fn.calculate = function (stringOrFunction, opts) {
    var opts = opts || {};
    var autoEvents = typeof stringOrFunction === 'string';
    var config = {};
    config.formulaFunction = formularise(stringOrFunction);
    config.inputParser = opts.inputParser || $.calculate.inputParser;
    config.outputFormatter = opts.outputFormatter || $.calculate.outputFormatter;
    config.bases = this.map(function(){ return $(this); });

    var runOne = function (base) {
      var formula = parseFormula(config.formulaFunction.bind(base[0])());
      var tree = math.parse(formula.rside);
      var compiled = tree.compile(math);
      var values = readValues(formula.operands, base, config.inputParser);
      var result = compiled.eval(values);
      var formattedResult = config.outputFormatter(result);
      base.find(formula.resultSelector)
        .val(formattedResult)
        .trigger('change');
    }

    this.run = function() {
      $.each(config.bases, function() {
        runOne(this);
      });
    }

    if (autoEvents) {
      var formula = parseFormula(stringOrFunction);
      config.bases.each(function() {
        var base = this;
        var operandSelectors = Object.keys(formula.operands);
        operandSelectors.forEach(function(selector) {
          if (selector != formula.resultSelector) {
            base.find(selector).on('change', function(){ return runOne(base); });
          }
        });
      });
    }

    this.run();

    return this;
  };

  $.calculate = {
    inputParser: function(rawVal) { return rawVal },

    outputFormatter: function(result) { return result },

    options: function(opts) {
      if (opts.inputParser) {
        this.inputParser = opts.inputParser;
      }
      if (opts.outputFormatter) {
        this.outputFormatter = opts.outputFormatter;
      }
    }
  }

  function formularise(stringOrFunction) {
    if (typeof stringOrFunction === 'string') {
      return function() {
        return stringOrFunction;
      }
    } else {
      return stringOrFunction;
    }
  }

  // Receives a string such as '{{.foo}} = {{.bar}} - {{.baz}}'.
  // Returns an object such as:
  //   formula.operands => { '.foo': 'A', '.bar': 'B', '.baz': 'C' }
  //   formula.resultSelector => '.foo'
  //   formula.rside => 'B - C'
  function parseFormula(str) {
    var formula = {
      operands: {},
    };
    var invOperands = {};

    var skeleton = str.replace(/\{\{([^\}]+)\}\}/g, function (_match, capture) {
      var existing = formula.operands[capture];
      if (existing) {
        return existing;
      }

      var newVarName = generateVarName();
      formula.operands[capture] = newVarName;
      invOperands[newVarName] = capture;
      return newVarName;
    });

    var sides = skeleton.match(/^\s*([^=\s]+)\s*=(.*)$/);
    var lside = sides[1];
    formula.rside = sides[2];
    formula.resultSelector = invOperands[lside];

    return formula;
  }

  // Simply returning letters in order for now
  var generateVarName_count = 0;
  function generateVarName(index) {
    return 'X' + (generateVarName_count++);
  }

  // Receives:
  //   * operands: { '.foo': 'A', '.bar': 'B', '.baz': 'C' }
  //   * element: base for DOM search
  // Returns {'A': '23.5', 'B': '12.8', C: '3'}
  function readValues(operands, element, inputParser) {
    var values = {};
    var base = $(element);
    $.each(asPairs(operands), function() {
      var selector = this[0];
      var varname = this[1];
      var matches = base.find(selector);
      values[varname] = matches.toArray().reduce(function(sum, el) {
        var rawVal = $(el).val();
        return sum + inputParser(rawVal)*1;
      }, 0);
    });
    return values;
  }

  // Receive an object and return key/value pairs
  function asPairs(obj) {
    var pairs = [];
    Object.keys(obj).forEach(function (key) {
      var value = obj[key];
      pairs.push([key, value]);
    });
    return pairs;
  }

})(jQuery);
