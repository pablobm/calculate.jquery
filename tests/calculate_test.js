describe("Calculate", function () {

  var expect = chai.expect;

  var dom;
  beforeEach(function() {
    var iframe = $('#fixture');
    dom = iframe.contents();
  });

  var base = null;

  describe("jQuery plugin interface", function () {
    it("is chainable", function () {
      dom.find('.basics')
        .calculate('{{.total}} = {{.base}} - {{.diff}}')
        .css('background-color', 'red');
    });
  });

  describe("Basics", function () {
    beforeEach(function () {
      base = dom.find('.basics');
      base.calculate('{{.total}} = {{.base}} - {{.diff}}');
    });

    it("calculates on init", function () {
      expect(base.find('.total').val()).to.eql('7.1');
    });

    it("updates on change", function () {
      base.find('.diff')
        .val('4.1')
        .trigger('change');
      expect(base.find('.total').val()).to.eql('8.1');
    });

    it("triggers `change` on the result field", function () {
      var gotChange = false;
      base.find('.total').on('change', function () {
        gotChange = true;
      });

      base.find('.diff').val('4.1').trigger('change');
      expect(gotChange).to.be.true;
    });
  });

  describe("One to many", function () {
    beforeEach(function () {
      base = dom.find('.one-to-many');
      base.calculate('{{.total}} = {{.operand}} * {{.product}}');
    });

    it("each operand is the sum all matching elements' values", function () {
      expect(base.find('.total').val()).to.eql("63.2");
    });
  });

  describe("Many to many", function () {
    beforeEach(function () {
      base = dom.find('.many-to-many .one');
      base.calculate('{{.total}} = {{.base}} - {{.diff}}');
    });

    it("calculates several, parallel blocks", function () {
      var totals = base.find('.total');
      expect(totals.eq(0).val()).to.eql('6.9');
      expect(totals.eq(1).val()).to.eql('-5');
    });
  });

  describe("Custom input parser", function () {
    beforeEach(function () {
      var esInputParser = function (rawVal) {
        var pair = rawVal.split(',');
        var integer = pair[0].replace(/\./g, '');
        var decimal = pair[1] || '0';
        return (integer + '.' + decimal)*1;
      };
      base = dom.find('.custom-input');
      base.calculate('{{.total}} = {{.base}} - {{.diff}}', { inputParser: esInputParser });
    });

    it("allows interpreting numbers in arbitrary formats" , function () {
      expect(base.find('.total').val()).to.eql('1234562');
    });
  });

  describe("Custom output formatter", function () {
    beforeEach(function () {
      var outputFormatter = function (result) {
        return result.toFixed(2);
      };
      base = dom.find('.custom-output');
      base.calculate('{{.total}} = {{.base}} - {{.diff}}', { outputFormatter: outputFormatter });
    });

    it("allows delivering results as we like (eg: rounding decimals)" , function () {
      base.find('.base')
        .val('12.3')
        .trigger('change');
      expect(base.find('.total').val()).to.eql('7.20');
    });
  });

  describe("Variable formulas", function () {
    var eventEmitter;

    beforeEach(function () {
      eventEmitter = $(document);

      base = dom.find('.variable');
      var calc = base.calculate(function () {
        if ($(this).find('.toggle').prop('checked')) {
          return '{{.total}} = {{.base}} - {{.diff}}';
        }
        else {
          return '{{.total}} = {{.base}}';
        }
      });
      eventEmitter.on('doStuff', function () {
        calc.run();
      });
    });

    it("updates with correct formula on change", function () {
      expect(base.find('.total').val()).to.eql('12.2');

      base.find('.toggle').prop('checked', true);
      eventEmitter.trigger('doStuff');
      expect(base.find('.total').val()).to.eql('7.1');
    });
  });
});
