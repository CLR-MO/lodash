/**
Lodash both provides utilities for handling data, but also general JS utilities, like currying.  As such,
this lodash extension adds in like.
*/

import lodash  from 'lodash'
let _: any = Object.assign({}, lodash) // copy lodash instead of modifying it


//+++++++++++++++     Form related     +++++++++++++++ {

// flatten keys of object with . separation
/* example
{
	bob:{
		bobs:'bill'
	}
}
=>
{
	'bob.bobs':'bill'
}
*/
_.flatten_keys = function (data) {
	var recurse, result;
	result = {};
	recurse = function (cur, prop) {
		var isEmpty, p;
		if (Object(cur) !== cur || Array.isArray(cur)) {
			result[prop] = cur;
		} else {
			isEmpty = true;
			for (p in cur) {
				isEmpty = false;
				recurse(cur[p], prop ? prop + '.' + p : p);
			}
			if (isEmpty && prop) {
				result[prop] = {};
			}
		}
	};
	recurse(data, '');
	return result;
};

// turn a js object into form-name-style flat object
/* example
{
	bob:{
		bobs:'bill'
	}
}
=> 
{
	'bob[bobs]':'bill'
}
*/


// @NOTE  does not mutate object
_.flatten_to_input = function (data) {
	var bracketFlat, first, flat, k, name, newKey, parts;
	flat = _.flatten_keys(data);
	bracketFlat = {};
	name = void 0;
	// remove the "." separation
	for (k in flat) {
		name = k;
		// add "[]" to array values
		if (Array.isArray(flat[k])) {
			name += '[]';
		}
		parts = name.split('.');
		if (parts.length > 1) {
			//first key is not bracketted: ex: bob[bill]
			first = parts.shift();
			parts = parts.map(function (v) {
				return '[' + v + ']';
			});
			newKey = first + parts.join('');
			bracketFlat[newKey] = flat[k];
		} else {
			bracketFlat[name] = flat[k];
		}
	}
	return bracketFlat;
};

// @NOTE does not mutate object
_.unflatten_input = function (o) {
	var k, new_o, v;
	if (_.isArray(o) || !_.isObject(o)) {
		throw new Error('wrong type');
	}
	new_o = {};
	for (k in o) {
		v = o[k];
		_.set(new_o, k, v);
	}
	return new_o;
};

// for some object, flatten some keys
// @NOTE mutates object
_.flatten_parts_to_input = function (o, parts) {
	var flat, k, picked;
	if (_.isArray(o) || !_.isObject(o)) {
		throw new Error('wrong type');
	}
	picked = _.pick(o, parts);
	flat = _.flatten_to_input(picked);
	for (k in picked) {
		delete o[k];
	}
	return o = _.assign(o, flat);
};

// unflatten some keys, based on original unflat key name
// @NOTE mutates object
_.unflatten_input_parts = function (o, parts) {
	var j, k, keys, len, picked, unflat;
	if (_.isArray(o) || !_.isObject(o)) {
		throw new Error('wrong type');
	}
	keys = [];
	for (k in o) {
		if (parts.indexOf(k.split('[', 1)[0]) !== -1) {
			keys.push(k);
		}
	}
	picked = _.pick(o, keys);
	unflat = _.unflatten_input(picked);
	for (j = 0, len = keys.length; j < len; j++) {
		k = keys[j];
		delete o[k];
	}
	return o = _.assign(o, unflat);
};

//+++++++++++++++ }


//+++++++++++++++     Array helpers     +++++++++++++++ {

// Does array search while conforming compared in-array-values using some conformer
_.in = function (arr, v, comform) {
	var arr_v, conform, conformed, j, len;
	if (!conform) {
		if (_.isString(v)) {
			conform = function (v) {
				return '' + v;
			};
		} else if (_.isInteger(v)) {
			conform = function (v) {
				return parseInt(v);
			};
		} else if (_.isNumber(v)) {
			conform = function (v) {
				return parseFloat(v);
			};
		} else {
			conform = function (v) {
				return v;
			};
		}
	}
	for (j = 0, len = arr.length; j < len; j++) {
		arr_v = arr[j];
		conformed = conform(arr_v);
		if (conformed === v) {
			return true;
		}
	}
	return false;
};

// find missing keys within an object and return them or false if no missing keys
_.missing = function (expected, object) {
	const missing = _.difference(expected, _.keys(object));
	return missing.length ? missing : false
};


//+++++++++++++++ }

//+++++++++++++++     Converters     +++++++++++++++ {

// convert to number, w/o NaN
_.int = function (v) {
	return parseInt(v) || 0;
};

// convert to number, w/o NaN
_.float = function (v) {
	return parseFloat(v) || 0.0;
};

_.number = function (v) {
	return _.toNumber(v) || 0;
};

// if not array, make array with `v` as first element
_.array = function (v) {
	if (v === void 0) {
		return [];
	}
	if (!_.isArray(v)) {
		return [v];
	}
	return v;
};

// Binary to decimal
_.bindec = function (bin) {
	var dec, i;
	bin = (bin + '').split('').reverse();
	dec = 0;
	i = 0;
	while (i < bin.length) {
		if (bin[i] === 1) {
			dec += 2 ** i;
		}
		i++;
	}
	return dec;
};

// Decimal to binary
_.decbin = function (dec) {
	var bits, into, lastBit;
	bits = '';
	into = dec;
	while (into >= 1) {
		bits += into % 2;
		into = Math.floor(into / 2);
	}
	lastBit = Math.ceil(into);
	if (lastBit) {
		bits += lastBit;
	}
	return bits.split('').reverse().join('');
};

// set words to upper case
_.ucwords = function (string) {
	var words;
	if (string) {
		words = string.split(/\s+/).filter(function (v) {
			return v.length > 0;
		});
		words = words.map(function (v) {
			return v[0].toUpperCase() + v.slice(1);
		});
		return words.join(' ');
	}
};

//  show number or string as some string-number with some amount of decimals
_.decimals = function (string, precision) {
	var parts, remaining;
	string = _.round(string, precision) + '';
	parts = string.split('.');
	if (parts.length === 2) {
		remaining = precision - parts[1].length;
		return string + '0'.repeat(remaining);
	} else if (precision > 0) {
		return string + '.' + '0'.repeat(precision);
	} else {
		return string;
	}
};

// htmlspecialchars() - for escaping text

// like _.escape but handles null
_.hsc = function (string) {
	if (string === null) {
		return '';
	}
	return _.escape(string);
};

// seems to be not-uneccesary to use jquery for this
// $('<a></a>').text(string).html()
_.nl2br = function (string) {
	return string.replace(/(?:\r\n|\r|\n)/g, '<br />'); // for broken syntax highlighter: /
};

_.br_hsc = function (string) {
	return _.nl2br(_.hsc(string));
};

//+++++++++++++++ }

//+++++++++++++++     Comparers     +++++++++++++++ {

// is a dictionary (and not an array or function or class instance.)
_.is_dict = function (object) {
	return object && object.constructor === Object;
};

// iframe HTMLDocument does not return true when "instanceof" HTMLDocument, so must compare the string name
_.is_class = function (thing, class_object) {
	if ((thing instanceof class_object) || thing.constructor.name === class_object.name) {
		return true;
	}
	return false;
};

_.is_date = function (date) { // adjust ot include moment as a Date
	if(date instanceof Date){
		return true
	}
	// @ts-ignore
	if (typeof (moment) != 'undefined') {// @ts-ignore
		return  (date instanceof moment!);
	}
	return false
	
};

_.is_scalar = _.isScalar = function (x) {
	return _.isString(x) || _.isNumber(x) || _.isNull(x) || _.isBoolean(x);
};

_.is_gt = function (x, y) {
	if (_.toNumber(x) > _.toNumber(y)) {
		return true;
	}
	return false;
};

_.is_gte = function (x, y) {
	if (_.toNumber(x) >= _.toNumber(y)) {
		return true;
	}
	return false;
};

_.is_lt = function (x, y) {
	if (_.toNumber(x) < _.toNumber(y)) {
		return true;
	}
	return false;
};

_.is_lte = function (x, y) {
	if (_.toNumber(x) <= _.toNumber(y)) {
		return true;
	}
	return false;
};

_.is_length_gt = function (x, y) {
	return _.is_gt(x.length, y);
};

_.is_length_gte = function (x, y) {
	return _.is_gte(x.length, y);
};

_.is_length_lt = function (x, y) {
	return _.is_lt(x.length, y);
};

_.is_length_lte = function (x, y) {
	return _.is_lte(x.length, y);
};

_.is_numeric = _.isNumeric = function (v) {
	if (typeof v === typeof 1 || typeof v === typeof '1') {
		return v - parseFloat(v) + 1 > 0; // test if it responds to arithmetic
	}
};

_.is_filled = _.isFilled = function (x) {
	if (_.isString(x)) {
		return x !== '';
	}
	if (_.isNumber(x)) {
		return true;
	}
	return _.isEmpty(x);
};

// similar to php, in interpretting a string like '0' as false
_.is_trueish = function (x) {
	if (_.isString(x)) {
		if (x === '' || x === '0') {
			return false;
		}
		return true;
	}
	if (_.isNumber(x)) {
		return !!x;
	}
	return _.isEmpty(x);
};

_.is_promise = function (x) {
	if (_.isObject(x) && x.then && _.isFunction(x.then)) {
		return true;
	}
	return false;
};

//+++++++++++++++ }

//+++++++++++++++     Misc Scenario Tools     +++++++++++++++ {

// catch JSON.parse exception and warn.  chrome error-on-bad-json-syntax is cryptic, so, instead, grab and warn
_.tryJSON = function (json, default_value=false) {
	try {
		return JSON.parse(json);
	} catch (error) {
		return default_value;
	}
};



//+++++++++++++++ }



_.input_flatten = function (data) {
	var recurse, result;
	result = {};
	recurse = function (cur, prop) {
		var i, isEmpty, j, len, p;
		if (_.isArray(cur)) {
			for (i = j = 0, len = cur.length; j < len; i = ++j) {
				p = cur[i];
				recurse(p, prop + '[' + i + ']');
			}
		} else if (_.isObject(cur)) {
			if (cur instanceof Blob) { // no point trying to extract data from a blob
				result[prop] = cur;
			} else {
				isEmpty = true;
				for (p in cur) {
					isEmpty = false;
					if (prop) { // since the original function operates on a dict, there may be no preceeding property name
						recurse(cur[p], prop + '[' + p + ']');
					} else {
						recurse(cur[p], p);
					}
				}
				if (isEmpty && prop) {
					result[prop] = {};
				}
			}
		} else {
			result[prop] = cur;
		}
	};
	recurse(data, '');
	return result;
};



// push on array, or create array if not already an arary
_.shove = function (array, item) {
	if (_.isArray(array)) {
		array.push(item);
		return array;
	}
	return [item];
};


/* About.md
Special set with special handling for collisions:
-	turn colliding keys into an array if not already
-	for a colliding key with an array value, append new values
-	allow ensuring arrays (regardless of collision)
-	allow ensuring single value (non array).  Useful for individual checkboxes
*/
/* params
< options >
		force_array: < true | false > < force the key value to be an array >
		force_single: < true | false > < force the key value to a single value, regardless of collisions >
*/
_.set_special = function (data, fullname, value, options) {
	var current_value;
	if (options.force_single) {
		return _.set(data, fullname, value);
	} else if (_.get(data, fullname) === void 0) { // value is not set
		if (options.force_array) {
			// useful, ex, in the case of a checkbox array, wherein only one item is checked, but back end still expects and array
			return _.set(data, fullname, [value]);
		} else {
			return _.set(data, fullname, value);
		}
	} else if (_.get(data, fullname).push) {
		// if current value exists as an array, add item to array
		return _.get(data, fullname).push(value);
	} else {
		// if current value exists not as an array, make it into an array and then add the new value
		current_value = _.get(data, fullname);
		return _.set(data, fullname, [current_value].concat(value));
	}
};

1;


export default _