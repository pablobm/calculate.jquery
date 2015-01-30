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
      base.find('.diff').val(5.1);
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

    it("only updates those that emit a 'change' event", function() {
      var total1 = base.eq(0).find('.total');
      var total2 = base.eq(1).find('.total');
      var diff2  = base.eq(1).find('.diff');
      total1.val('stuff');
      diff2.val('10');
      diff2.trigger('change');
      expect(total1.val()).to.eql('stuff');
      expect(total2.val()).to.eql('-6');
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

  describe("API", function () {
    var api;
    var funcThis;

    function setBase(selector) {
      base = dom.find(selector);
      base.calculate(function(_api) {
        funcThis = this;
        api = _api;
      });
    }

    describe("binding", function() {
      beforeEach(function () {
        setBase('.api-binding');
      });

      it("is on the jQuery object", function() {
        expect(funcThis).to.eql(base);
      });
    });

    describe("formula()", function() {
      beforeEach(function () {
        setBase('.api-formula');
      });

      it("can change the formula", function() {
        api.formula('{{.total}} = {{.base}}');
        expect(base.find('.total').val()).to.eql('12.2');

        api.formula('{{.total}} = {{.base}} - {{.diff}}');
        expect(base.find('.total').val()).to.eql('7.1');
      });
    });

    describe("run()", function() {
      beforeEach(function () {
        setBase('.api-run');
        base.find('.diff').val('5.1');
        api.formula('{{.total}} = {{.base}} - {{.diff}}');
      });

      it("can trigger an update", function() {
        base.find('.diff').val('0.1');
        expect(base.find('.total').val()).to.eql('7.1');
        api.run();
        expect(base.find('.total').val()).to.eql('12.1');
      });
    });

    describe("clean up unused event handlers", function() {
      beforeEach(function () {
        setBase('.api-cleanup');
      });

      it("does that indeed", function() {
        api.formula('{{.total}} = {{.base}} - {{.diff}}');
        api.formula('{{.total}} = {{.base}}');
        var total = base.find('.total');
        total.val('blah');
        base.find('.diff').trigger('change');
        expect(total.val()).to.eql('blah');
      });
    });
  });

});
