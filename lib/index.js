var util = require('./util'),
    fullInspect = util.fullInspect;

var UNIT = '()';
exports.UNIT = UNIT;
var UINT32 = 'uint32';
exports.UINT32 = UINT32;
var UINT64 = 'uint64';
exports.UINT64 = UINT64;
var UINT128 = 'uint128';
exports.UINT128 = UINT128;
var UTF8 = 'utf8';
exports.UTF8 = UTF8;
var RAW = 'raw';
exports.RAW = RAW;
var TYPE = 'type';
exports.TYPE = TYPE;
var LIST_TYPE = {type: 'builtin', name: 'list', parameters: {T: TYPE}};
exports.LIST_TYPE = LIST_TYPE;

exports.parametrize = function(type, name, value) {
  if (type.parameters === undefined) return null;
  var schema = type.parameters[name];

  if (schema === undefined) return null;

  switch (type.type) {
  case 'builtin':
    switch (type.name) {
    case 'list': return {type: 'builtin', name: 'list', parametrizied: value};
    default: throw new Error('unknown builtin type: ' + fullInspect(type));
    }
    break;
  default: throw new Error('unknown type type: ' + fullInspect(type));
  }
};

exports.jsonParsed = require('./jsonParsed');
