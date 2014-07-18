var assert = require('assert');

var sigma = require('../lib').jsonParsed;

describe('validation', function() {
  describe('built-ins:', function() {
    it('() should be always valid', function() {
      assert(sigma.validate(null, '()'));
      assert(sigma.validate(undefined, '()'));
      assert(sigma.validate({answer: 42}, '()'));
    });

    it('uint64 is string in base 36, that no more than 3w5e11264sgsf and have length <= 13', function() {
      assert(sigma.validate('0', 'uint64'));
      assert(sigma.validate('00000000', 'uint64'));

      // Вообще, в теории можно разрешить хранить числа меньше либо равные 53 бит в Number,
      // но тогда с сериализацией и прочим станет кошмар.
      assert(!sigma.validate(42, 'uint64'));

      assert(sigma.validate('3w5e11264sgsf', 'uint64'));
      assert(sigma.validate('3w5e10264zzzz', 'uint64'));

      assert(!sigma.validate('zzzzzzzzzzzzzzzz', 'uint64'));
      assert(!sigma.validate('3w5e11264sgsg', 'uint64'));
    });

    it('uint128 is string in base 36 that no more than f5lxx1zz5pnorynqglhzmsp33', function() {
      assert(sigma.validate('zzzzzzzzzzzzzz', 'uint128'));
      assert(sigma.validate('f5lxx1zz5pnorynqglhzmsp33', 'uint128'));

      assert(!sigma.validate('f5lxx1zz5pnorynqglhzmsp34', 'uint128'));
    });
  });

  describe('products', function() {
    it('should work', function() {
      assert(sigma.validate({a: '42', c: undefined}, {
        type: 'product',
        components: {
          a: 'uint64',
          b: '()',
          c: '()'
        }
      }));
    });

    it('should return false, if some of components is invalid', function() {
      assert(!sigma.validate({a: 'zzzzzzzzzzzzzzzz', c: undefined}, {
        type: 'product',
        components: {
          a: 'uint64',
          b: '()',
          c: '()'
        }
      }));
    });
  });

  describe('unions', function() {
    it('should return true, if one of cases is matches', function() {
      assert(sigma.validate({name: 'some', value: {a: '42'}}, {
        type: 'union',
        variants: {
          x: 'uint64',
          some: {
            type: 'product',
            components: {a: 'uint64'}
          },
          last: '()'
        }
      }));
    });
  });

  describe('schemas', function() {
    it('should return true, if object has data about own type and it exists in schema and valid', function() {
      var schema = {
        type: 'schemas',
        schemas: {
          atom: '()',
          some: {
            type: 'product',
            components: {a: 'uint64', b: 'uint64'}
          }
        }
      };

      assert(sigma.validate('atom', schema));
      assert(sigma.validate({name: 'atom'}, schema));
      assert(sigma.validate({name: 'some', value: {a: '123', b: 'deadbeaf'}}, schema));

      assert(!sigma.validate({name: 'some', value: {b: 'deadbeaf'}}, schema));
    });
  });
});

describe('normalization', function() {
  describe('unions in products', function() {
    it('should return null, if union not matches', function() {
      assert.equal(null, sigma.validateAndNormalize({
        field: {b: '123'}
      }, {
        type: 'product',
        components: {
          field: {
            type: 'union',
            variants: {
              some: {type: 'product', components: {a: 'uint64'}}
            }
          }
        }
      }));
    });
  });

  describe('schemas', function() {
    it('should convert atoms that provided by string to oject', function() {
      assert.deepEqual({name: 'atom'}, sigma.validateAndNormalize('atom', {
        type: 'schemas',
        schemas: {
          atom: {
            type: 'product', components: {}
          }
        }
      }));
    });

    it('should not touch normal data', function() {
      var data = {name: 'atom', value: {}};

      assert.deepEqual(data, sigma.validateAndNormalize(data, {
        type: 'schemas',
        schemas: {
          atom: {
            type: 'product', components: {}
          }
        }
      }));
    });
  });

  describe('union', function() {
    it('should normalize atom', function() {
      var result = sigma.validateAndNormalize('atom', {
        type: 'union',
        variants: {
          atom: {
            type: 'product',
            components: {}
          }
        }
      });

      assert.equal('atom', result.name);
    });
  });

  describe('data', function() {
    it('should not touch data type', function() {
      var result = sigma.validateAndNormalize({a: 'abcd', b: 3.1415}, {
        type: 'product',
        components: {
          a: 'uint64',
          b: 'raw'
        }
      });

      assert.equal(3.1415, result.b);
    });
  });
});
