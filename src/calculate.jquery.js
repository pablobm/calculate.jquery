(function ($) {

  //
  // jQuery hook
  //

  $.fn.calculate = function (stringOrFunction, opts) {
    var opts = $.extend({}, $.calculate.defaults(), opts || {});
    var api = new Api(this, opts);

    if (typeof stringOrFunction === 'string') {
      api.formula(stringOrFunction);
    }
    else {
      stringOrFunction.bind(this).call(stringOrFunction, api);
    }

    return this;
  }


  //
  // Global settings
  //

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


  //
  // API
  //

  function Api(base, opts) {
    this.base = $(base);
    this.details = null;
    this.opts = opts || {};
    this.events = [];
  }
  Api.prototype = {
    formula: function(val) {
      priv.compile(this, val);
      priv.updateEvents(this);
      this.run();
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


  //
  // Private "methods"
  //

  var priv = {
    compile: function(self, formula) {
      self.details = parseFormula(formula);
      var tree = math.parse(self.details.rside);
      self.compiled = tree.compile(math);
    },

    updateEvents: function(self) {
      priv.removeEvents(self);
      priv.setEvents(self);
    },

    removeEvents: function(self) {
      self.events.forEach(function(evt) {
        evt.query.off(evt.name, evt.handler);
      });
      self.events = [];
    },

    setEvents: function(self) {
      var that = self;
      Object.keys(self.details.operands).forEach(function(selector) {
        priv.setEvent(
          self,
          that.base.find(selector),
          'change',
          function() { that.run() }
        );
      });
    },

    setEvent: function(self, query, name, handler) {
      var that = self;
      var evt = {
        query: query,
        name: name,
        handler: handler
      }
      evt.query.on(evt.name, evt.handler);
      self.events.push(evt);
    }
  };


  //
  // Utility functions
  //

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
