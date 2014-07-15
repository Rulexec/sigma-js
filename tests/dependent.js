var assert = require('assert');
var util = require('../lib/util');

var sigma = require('../lib');

var serializer = sigma.jsonParsed;

describe('dependent types', function() {
  it('must work with union-typed parameters', function() {
    var tripleUnion = {
      type: 'union',
      variants: {
        first: {type: 'product', components: {}},
        second: {type: 'product', components: {x: sigma.UINT32}},
        third: {type: 'product', components: {}}
      }
    };

    var dependentTypeSchema = {
      type: 'dependent',
      parameters: {
        t: tripleUnion
      },
      cases: function(parameters) {
        switch (parameters.t.name) {
        case 'first': return {type: 'product', components: {}};
        case 'second': return {type: 'product', components: {y: sigma.UINT32}};
        case 'third': return {type: 'product', components: {s: sigma.UTF8}};
        default: throw new Error('unknown tripleUnion variant: ' + util.fullInspect(parameters.t));
        }
      }
    };

    var data;

    // first
    
    data = serializer.validateAndNormalize({
      parameters: {t: 'first'}
    }, dependentTypeSchema)

    assert.deepEqual(data, {parameters: {t: {name: 'first', value: {}}}, value: {}});

    // second

    data = serializer.validateAndNormalize({
      parameters: {t: {name: 'second', value: {x: 42}}},
      value: {y: 14}
    }, dependentTypeSchema);

    assert.deepEqual(data, {
      parameters: {t: {name: 'second', value: {x: 42}}},
      value: {y: 14}
    });

    // third

    data = serializer.validateAndNormalize({
      parameters: {t: 'third'},
      value: {s: 'some message'}
    }, dependentTypeSchema);

    assert.deepEqual(data, {
      parameters: {t: {name: 'third', value: {}}},
      value: {s: 'some message'}
    });
  });
});
