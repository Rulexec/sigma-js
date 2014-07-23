var assert = require('assert');

var sigma = require('../lib'),
    serializer = sigma.jsonParsed;

describe('list', function() {
  it('sigma.LIST must be comprehension for ...', function() {
    assert.deepEqual(sigma.LIST('uint64'), {
      type: 'builtin',
      name: 'list',
      parameter: 'uint64'
    });
  });

  it('it should validate list of uints', function() {
    var schema = sigma.LIST('uint64');

    assert(serializer.validate(['1', '2', 'abcdef', '100'], schema));

    assert(!serializer.validate(['1', '2', 15, '100'], schema));
    assert(!serializer.validate('string, not list', schema));
  });
});