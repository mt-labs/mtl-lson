'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

// mtl/lson
describe('mtl-lson', function() {

	var lson = require('../src/index');

	var spies;

	beforeEach(function() {
		spies = [
			sinon.spy(lson, 'quote')
		];
	});

	afterEach(function() {
		spies.forEach(function(spy) {
			spy.restore();
		});
	});


	// mtl/lson.quote()
	describe('.quote()', function() {

		// scalars
		it('should quote un-quoted strings', function() {
			expect(lson.quote('Test')).to.equal('"Test"');
		});

		it('should quote single-quoted strings as though they were un-quoted', function() {
			expect(lson.quote('\'Test\'')).to.equal('"\'Test\'"');
		});

		it('should not quote already double-quoted strings', function() {
			expect(lson.quote('"Test"')).to.equal('"Test"');
		});

		it('should preserve pre-quoted whitespace in a string', function() {
			expect(lson.quote('"Test me"')).to.equal('"Test me"');
		});

		it('should preserve pre-quoted whitespace at the start/end of the string', function() {
			expect(lson.quote('" Test "')).to.equal('" Test "');
		});

		it('should not quote a pre-quoted empty string (i.e. "")', function() {
			expect(lson.quote('""')).to.equal('""');
		});

		it('should not quote pre-quoted numbers', function() {
			expect(lson.quote('"123"')).to.equal('"123"');
			expect(lson.quote('"12.3"')).to.equal('"12.3"');
		});

		it('should not quote pre-quoted syntax characters', function() {
			expect(lson.quote('"{}"')).to.equal('"{}"');
			expect(lson.quote('"[]"')).to.equal('"[]"');
			expect(lson.quote('":"')).to.equal('":"');
		});

		it('should not quote numbers', function() {
			expect(lson.quote('0')).to.equal('0');
			expect(lson.quote('3')).to.equal('3');
			expect(lson.quote('3.45')).to.equal('3.45');
			expect(lson.quote('0.0')).to.equal('0.0');
			expect(lson.quote('-3.45')).to.equal('-3.45');
		});

		it('should not quote exponential numbers', function() {
			expect(lson.quote('3e+2')).to.equal('3e+2');
			expect(lson.quote('3E+2')).to.equal('3E+2');
			expect(lson.quote('3e+21')).to.equal('3e+21');
			expect(lson.quote('3e-2')).to.equal('3e-2');
			expect(lson.quote('3e-21')).to.equal('3e-21');
			expect(lson.quote('3.4e+2')).to.equal('3.4e+2');
		});

		it('should not quote true/false/null', function() {
			expect(lson.quote('true')).to.equal('true');
			expect(lson.quote('false')).to.equal('false');
			expect(lson.quote('null')).to.equal('null');
		});

		it('should quote non-lowercase true/false/null', function() {
			expect(lson.quote('True')).to.equal('"True"');
			expect(lson.quote('False')).to.equal('"False"');
			expect(lson.quote('Null')).to.equal('"Null"');
		});

		it('should quote undefined', function() {
			expect(lson.quote('undefined')).to.equal('"undefined"');
		});

		// array notation
		it('should quote eligible values in array notations', function() {
			expect(lson.quote('[foo]')).to.equal('["foo"]');
			expect(lson.quote('[foo,bar]')).to.equal('["foo","bar"]');
			expect(lson.quote('[foo,123]')).to.equal('["foo",123]');
		});

		it('should strip excess whitespace from array notations', function() {
			expect(lson.quote('[ foo ]')).to.equal('["foo"]');
			expect(lson.quote('[ foo , bar ]')).to.equal('["foo","bar"]');
			expect(lson.quote('[ foo , 123 ]')).to.equal('["foo",123]');
		});

		it('should quote eligible values in nested array notations', function() {
			expect(lson.quote('[foo,[bar,baz]]')).to.equal('["foo",["bar","baz"]]');
		});

		it('should strip excess whitespace from nested array notations', function() {
			expect(lson.quote('[ foo , [ bar , baz ] ]')).to.equal('["foo",["bar","baz"]]');
		});

		it('should not quote empty arrays', function() {
			expect(lson.quote('[]')).to.equal('[]');
			expect(lson.quote('[[]]')).to.equal('[[]]');
		});

		// object notation
		it('should quote keys and eligible values in object notations', function() {
			expect(lson.quote('{foo:foo}')).to.equal('{"foo":"foo"}');
			expect(lson.quote('{foo:foo,bar:bar}')).to.equal('{"foo":"foo","bar":"bar"}');
			expect(lson.quote('{foo:123,bar:456}')).to.equal('{"foo":123,"bar":456}');
		});

		it('should strip excess whitespace from object notations', function() {
			expect(lson.quote('{ foo : foo }')).to.equal('{"foo":"foo"}');
			expect(lson.quote('{ foo : foo , bar : bar }')).to.equal('{"foo":"foo","bar":"bar"}');
		});

		it('should always quote object property names', function() {
			expect(lson.quote('{123:123}')).to.equal('{"123":123}');
			expect(lson.quote('{ 123 : 123 }')).to.equal('{"123":123}');
			expect(lson.quote('{true:true}')).to.equal('{"true":true}');
			expect(lson.quote('{false:false}')).to.equal('{"false":false}');
			expect(lson.quote('{null:null}')).to.equal('{"null":null}');
		});

		it('should quote keys and eligible values in nested object notations', function() {
			expect(lson.quote('{foo:{bar:bar}}')).to.equal('{"foo":{"bar":"bar"}}');
		});

		it('should strip excess whitespace from nested object notations', function() {
			expect(lson.quote('{ foo : { bar : bar } }')).to.equal('{"foo":{"bar":"bar"}}');
		});

		it('should not quote an empty object', function() {
			expect(lson.quote('{}')).to.equal('{}');
			expect(lson.quote('{foo:{}}')).to.equal('{"foo":{}}');
		});

	});


	// mtl/lson.parseObject()
	describe('.parseObject()', function() {

		it('should quote() the input string ', function() {

			var input = '{"foo":"foo"}';
			lson.parseObject(input);

			expect(lson.quote.calledWith(input)).to.be.true();
			expect(lson.quote.calledOnce).to.be.true();

		});

		it('should return an object when given an object-like input', function() {

			expect(lson.parseObject('foo: foo')).
				to.deep.equal({foo: 'foo'});

			expect(lson.parseObject('{foo: foo}')).
				to.deep.equal({foo: 'foo'});

			expect(lson.parseObject('foo: foo, bar: bar')).
				to.deep.equal({foo: 'foo', bar: 'bar'});

			expect(lson.parseObject('{foo: foo, bar: bar}')).
				to.deep.equal({foo: 'foo', bar: 'bar'});

		});

		it('should parse nested objects', function() {
			expect(lson.parseObject('foo: {bar: bar}')).
				to.deep.equal({foo: {bar: 'bar'}});
		});

		it('should parse nested arrays', function() {
			expect(lson.parseObject('foo: [bar, baz]')).
				to.deep.equal({foo: ['bar', 'baz']});
		});

		it('should return an empty object when given an empty string', function() {
			expect(lson.parseObject('')).to.deep.equal({}).
				and.to.be.an('object');
		});

		it('should return an empty object when given the value "{}"', function() {
			expect(lson.parseObject('{}')).to.deep.equal({}).
				and.to.be.an('object');
		});

		it('should throw an error when given non-object-like input', function() {

			expect(function() {
				lson.parseObject('string');
			}).to.throw();

			expect(function() {
				lson.parseObject('123');
			}).to.throw();

			expect(function() {
				lson.parseObject('null');
			}).to.throw();

			expect(function() {
				lson.parseObject('[]');
			}).to.throw();

		});

		it('should throw an error when given non-parsing input', function() {

			expect(function() {
				lson.parseObject(',');
			}).to.throw();

			expect(function() {
				lson.parseObject('[');
			}).to.throw();

			expect(function() {
				lson.parseObject('{');
			}).to.throw();

			expect(function() {
				lson.parseObject(']');
			}).to.throw();

			expect(function() {
				lson.parseObject('}');
			}).to.throw();

			expect(function() {
				lson.parseObject('[}');
			}).to.throw();

			expect(function() {
				lson.parseObject('{]');
			}).to.throw();

		});

	});


	// mtl/lson.parseArray()
	describe('.parseArray()', function() {

		it('should quote() the input string ', function() {

			var input = '["foo","bar"]';
			lson.parseArray(input);

			expect(lson.quote.calledWith(input)).to.be.true();
			expect(lson.quote.calledOnce).to.be.true();

		});

		it('should return an array when given an array-like input', function() {

			expect(lson.parseArray('foo')).
				to.deep.equal(['foo']);

			expect(lson.parseArray('foo, bar')).
				to.deep.equal(['foo', 'bar']);

			expect(lson.parseArray('[foo, bar]')).
				to.deep.equal(['foo', 'bar']);

		});

		it('should parse nested arrays', function() {

			expect(lson.parseArray('[[foo]]')).
				to.deep.equal([['foo']]);

			expect(lson.parseArray('foo, [bar]')).
				to.deep.equal(['foo', ['bar']]);

			expect(lson.parseArray('[foo], bar')).
				to.deep.equal([['foo'], 'bar']);

			expect(lson.parseArray('[foo], [bar]')).
				to.deep.equal([['foo'], ['bar']]);

		});

		it('should parse nested objects', function() {

			expect(lson.parseArray('[{foo: foo}]')).
				to.deep.equal([{foo: 'foo'}]);

			expect(lson.parseArray('{foo: foo}')).
				to.deep.equal([{foo: 'foo'}]);

			expect(lson.parseArray('{foo: foo}, {bar: bar}')).
				to.deep.equal([{foo: 'foo'}, {bar: 'bar'}]);

			expect(lson.parseArray('{}')).to.deep.equal([{}]).
				and.to.be.an('array');

		});

		it('should return an empty array when given an empty string', function() {
			expect(lson.parseArray('')).to.deep.equal([]).
				and.to.be.an('array');
		});

		it('should return an empty array when given the value "[]"', function() {
			expect(lson.parseArray('[]')).to.deep.equal([]).
				and.to.be.an('array');
		});

		it('should throw an error when given non-parsing input', function() {

			expect(function() {
				lson.parseArray(',');
			}).to.throw();

			expect(function() {
				lson.parseArray('[');
			}).to.throw();

			expect(function() {
				lson.parseArray('{');
			}).to.throw();

			expect(function() {
				lson.parseArray(']');
			}).to.throw();

			expect(function() {
				lson.parseArray('}');
			}).to.throw();

			expect(function() {
				lson.parseArray('[}');
			}).to.throw();

			expect(function() {
				lson.parseArray('{]');
			}).to.throw();

		});

	});


	// mtl/lson.parseObjectOrArray()
	describe('parseObjectOrArray()', function() {

		it('should return an object when given an object-like input', function() {

			expect(lson.parseObjectOrArray('foo: foo')).
				to.deep.equal({foo: 'foo'});

			expect(lson.parseObjectOrArray('{foo: foo}')).
				to.deep.equal({foo: 'foo'});

			expect(lson.parseObjectOrArray('foo: foo, bar: bar')).
				to.deep.equal({foo: 'foo', bar: 'bar'});

			expect(lson.parseObjectOrArray('{foo: foo, bar: bar}')).
				to.deep.equal({foo: 'foo', bar: 'bar'});

		});

		it('should return an array when given an array-like input', function() {

			expect(lson.parseObjectOrArray('foo, bar')).
				to.deep.equal(['foo', 'bar']);

			expect(lson.parseObjectOrArray('[foo, bar]')).
				to.deep.equal(['foo', 'bar']);

		});

		it('should return a single-value array when given a scalar input', function() {
			expect(lson.parseObjectOrArray('"foo bar"')).
				to.deep.equal(['foo bar']);
		});

		it('should throw an error when given non-parsing input', function() {

			expect(function() {
				lson.parseObjectOrArray(',');
			}).to.throw();

			expect(function() {
				lson.parseObjectOrArray('[');
			}).to.throw();

			expect(function() {
				lson.parseObjectOrArray('{');
			}).to.throw();

			expect(function() {
				lson.parseObjectOrArray(']');
			}).to.throw();

			expect(function() {
				lson.parseObjectOrArray('}');
			}).to.throw();

			expect(function() {
				lson.parseObjectOrArray('[}');
			}).to.throw();

			expect(function() {
				lson.parseObjectOrArray('{]');
			}).to.throw();

		});

		it('should only call quote() once', function() {

			lson.parseObjectOrArray('{parsing: object}');
			expect(lson.quote.calledOnce).to.be.true();
			lson.quote.reset();

			lson.parseObjectOrArray('[parsing, array]');
			expect(lson.quote.calledOnce).to.be.true();
			lson.quote.reset();

			lson.parseObjectOrArray('parsing-scalar');
			expect(lson.quote.calledOnce).to.be.true();
			lson.quote.reset();

		});

	});


	// mtl/lson.parse()
	describe('parse()', function() {

		it('should return an object when given an input wrapped with curly braces {}', function() {
			expect(lson.parse('{foo: foo}')).to.deep.equal({foo: 'foo'});
		});

		it('should return an array when given an input wrapped with square braces []', function() {
			expect(lson.parse('[foo, bar]')).to.deep.equal(['foo', 'bar']);
		});

		it('should return a string when given a string-like input', function() {
			expect(lson.parse('foo')).to.equal('foo');
		});

		it('should return a number when given a number-like input', function() {
			expect(lson.parse('123')).to.equal(123);
		});

		it('should return true/false/null when given a true/false/null input', function() {
			expect(lson.parse('true')).to.equal(true);
			expect(lson.parse('false')).to.equal(false);
			expect(lson.parse('null')).to.equal(null);
		});

		it('should throw an error when given an un-wrapped object-like input', function() {

			expect(function() {
				lson.parse('foo: bar');
			}).to.throw();

		});

		it('should throw an error when given an un-wrapped array-like input', function() {

			expect(function() {
				lson.parse('foo, bar');
			}).to.throw();

		});

		it('should throw an error when given non-parsing input', function() {

			expect(function() {
				lson.parse(',');
			}).to.throw();

			expect(function() {
				lson.parse('[');
			}).to.throw();

			expect(function() {
				lson.parse('{');
			}).to.throw();

			expect(function() {
				lson.parse(']');
			}).to.throw();

			expect(function() {
				lson.parse('}');
			}).to.throw();

			expect(function() {
				lson.parse('[}');
			}).to.throw();

			expect(function() {
				lson.parse('{]');
			}).to.throw();

		});

		it('should not throw an error when given a pre-quoted string that looks like an array/object', function() {

			expect(function() {
				lson.parse('"foo: bar"');
			}).to.not.throw();

			expect(function() {
				lson.parse('"foo, bar"');
			}).to.not.throw();

		});

	});

});
