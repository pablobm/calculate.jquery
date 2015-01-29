(function ($) {

  $.fn.calculate = function (stringOrFunction, opts) {
    var opts = $.extend({}, $.calculate.defaults(), opts || {});
    var api = new Api(this, opts);

    if (typeof stringOrFunction === 'string') {
      api.formula(stringOrFunction);
    }
    else {
      stringOrFunction.call(stringOrFunction, api);
    }

    return this;
  }

  function Api(base, opts) {
    this.base = $(base);
    this.details = null;
    this.opts = opts || {};
  }
  Api.prototype = {
    formula: function(val) {
      this.compile(val);
      this.updateEvents();
      this.run();
    },

    compile: function(formula) {
      this.details = parseFormula(formula);
      var tree = math.parse(this.details.rside);
      this.compiled = tree.compile(math);
    },

    updateEvents: function() {
      var that = this;
      Object.keys(this.details.operands).forEach(function(selector) {
        that.base.find(selector).on('change', function() {
          that.run();
        });
      });
    },

    run: function() {
      var that = this;
      this.base.each(function() {
        var singleBase = $(this);
        var values = readValues(that.details.operands, singleBase, that.opts.inputParser);
        var result = that.compiled.eval(values);
        var formattedResult = that.opts.outputFormatter(result);
        singleBase.find(that.details.resultSelector)
          .val(formattedResult)
          .trigger('change');
      });
    }
  }

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
    },

    defaults: function() {
      return {
        inputParser: this.inputParser,
        outputFormatter: this.outputFormatter
      }
    }
  }

  // Receives a string such as '{{.foo}} = {{.bar}} - {{.baz}}'.
  // Returns an object such as:
  //   formula.operands => { '.bar': 'B', '.baz': 'C' }
  //   formula.resultSelector => '.foo'
  //   formula.rside => 'B - C'
  function parseFormula(str) {
    var formula = {
      operands: {},
    };

    var sides = str.match(/^\s*([^=\s]+)\s*=\s*(.*)$/);
    formula.rside = assignVariablesToSelectors(sides[2], formula.operands);
    formula.resultSelector = readFirstSelector(sides[1]);

    return formula;
  }

  var formulaSelectorsRegexp = '\{\{([^\}]+)\}\}';

  function assignVariablesToSelectors(formula, dict) {
    var re = new RegExp(formulaSelectorsRegexp, 'g');
    return formula.replace(re, function (_, capture) {
      var existing = dict[capture];
      if (existing) {
        return existing;
      }
      return dict[capture] = generateVarName();
    });
  }

  function readFirstSelector(formula) {
    var re = new RegExp(formulaSelectorsRegexp);
    return re.exec(formula)[1];
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
