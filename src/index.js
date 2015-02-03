'use strict';

/**
 * A pattern for tokenising an LSON string.
 *
 * @type  {RegExp}
 */
var tokenizerPattern = /([:,\[\]\{\}]+|(?:"[^"\\]*(?:\\.[^"\\]*)*")|[^\s":,\[\]\{\}]+)/gi;


/**
 * A pattern for testing whether a token is JSON-quoted.
 *
 * @type  {RegExp}
 */
var isQuotedNamePattern = /^(?:[:,\[\]\{\}]+|".*)$/;


/**
 * A pattern for testing whether a token is JSON-quoted.
 *
 * @type  {RegExp}
 */
var isQuotedValuePattern = /^(?:null|true|false|[:,\[\]\{\}]+|".*|(?:-?[0-9]+(?:\.[0-9]+)?(?:[eE][\+\-][0-9]+)?))$/;


/**
 * LSON (LooSe Object Notation) parsing module.
 *
 * @type  {Object}
 */
var lson = module.exports = {

	/**
	 * Quote an LSON string for JSON parsing.
	 *
	 * @param  {string}  str  An un-quoted string.
	 *
	 * @return  {string}  A JSON-compliant quoted string.
	 */
	quote: function(str) {

		var i, ix, token;
		var tokens = (str + '').match(tokenizerPattern);

		if (!tokens) {
			return '';
		}

		for (i = 0, ix = tokens.length; i < ix; i++) {

			if ((token = tokens[i])) {

				if (tokens[i + 1] === ':') {
					if (isQuotedNamePattern.test(token)) {
						continue;
					}
				}

				else if (isQuotedValuePattern.test(token)) {
					continue;
				}

				tokens[i] = '"' + token + '"';

			}

		}

		return tokens.join('');

	},


	/**
	 * Parse an LSON string as an object.
	 *
	 * @param  {string}  str  The LSON string to parse.
	 * @param  {boolean}  isQuoted  True to indicate that the string is already quoted.
	 *
	 * @return  {Object}
	 */
	parseObject: function(str, isQuoted) {

		var quoted = isQuoted ? str : lson.quote(str);

		return JSON.parse(
			(quoted.substr(0, 1) !== '{') ? '{' + quoted + '}' : quoted
		);

	},


	/**
	 * Parse an LSON string as an array.
	 *
	 * @param  {string}  str  The LSON string to parse.
	 * @param  {boolean}  isQuoted  True to indicate that the string is already quoted.
	 *
	 * @return  {Array}
	 */
	parseArray: function(str, isQuoted) {

		var out, quoted = isQuoted ? str : lson.quote(str);

		try {
			return Array.isArray(out = JSON.parse(quoted)) ? out : [out];
		}

		catch (error) {
			return JSON.parse('[' + quoted + ']');
		}

	},


	/**
	 * Parse an LSON string as an object or array.
	 *
	 * @param  {string}  str  The LSON string to parse.
	 * @param  {boolean}  isQuoted  True to indicate that the string is already quoted.
	 *
	 * @return  {Object|Array}
	 */
	parseObjectOrArray: function(str, isQuoted) {

		var quoted = isQuoted ? str : lson.quote(str);

		// Try to parse as an object
		try {
			return lson.parseObject(quoted, true);
		}

		// Parse as an array
		catch (error) {
			return lson.parseArray(quoted, true);
		}

	},


	/**
	 * Parse an LSON string to a value.
	 *
	 * @param  {string}  str  The JSON-like string to be parsed.
	 *
	 * @return  {*}
	 */
	parse: function(str) {

		return JSON.parse(lson.quote(str));

	}

};
