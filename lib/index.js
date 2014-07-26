var util = require('./util'),
    fullInspect = util.fullInspect;

var UNIT = '()';
exports.UNIT = UNIT;
var BOOLEAN = 'Boolean';
exports.BOOLEAN = BOOLEAN;
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
var LIST = function(type) {
  return {type: 'builtin', name: 'list', parameter: type};
};
exports.LIST = LIST;

exports.jsonParsed = require('./jsonParsed');
