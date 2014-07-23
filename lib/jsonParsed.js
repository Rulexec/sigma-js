var util = require('./util'),
    fullInspect = util.fullInspect,
    isUint64InBase36 = util.isUint64InBase36,
    isUint128InBase36 = util.isUint128InBase36;

module.exports = new (function() {

var self = this;

// Принимает или строку и возвращает её, или объект с {name: <name>} и возвращает <name>, иначе null
this.getAtom = function(o) {
  if (!o) return null;

  if (typeof o === 'string') return o;

  return typeof o.name === 'string' ? o.name : null;
};

/* Принимает объект, а так же схему и возвращает объект в нормальной форме, если он соответствует схеме, иначе null.

   Нормальная форма:
   
   * Атомы (product-типы с нулём полей, либо полями только с unit-типами, либо атомами),
     которые представлены строкой представляются объектом {name: 'atom_name'}

   Схема в данный момент может быть:
   
   * Строкой, которая символизирует некий встроенный тип ('uint64', 'utf8')

   * {
         type: 'product',
         components: {
             a: <schema>,
             ...
         }
     }

   * {
         type: 'union',
         variants: [<schema>, ...]
     }
   
   * {
         type: 'schemas',
         schemas: {
             schemaName: <schema>,
             ...
         }
     }

*/
this.validateAndNormalize = function(o, schema) {
  try {
    var result = self.map(o, schema, function(schema, x) {
      if (typeof schema === 'string') {
        switch (schema) {
        case '()': return true;
        case 'uint32':
          if (typeof x !== 'number' || x < 0 || x !== (x|0)) throw 'invalid';
          return x;
        case 'uint64':
          if (!isUint64InBase36(x)) throw 'invalid';
          return x;
        case 'uint128':
          if (!isUint128InBase36(x)) throw 'invalid';
          return x;
        case 'utf8':
          if (typeof x !== 'string') throw 'invalid';
          return x;
        case 'raw': return x;
        default: throw new Error('unknown builtin type: ' + schema);
        }
      } else if (typeof schema === 'object') {
        switch (schema.type) {
        case 'builtin': return (function() {
          var i, result, q;

          switch (schema.name) {
          case 'list':
            if (!Array.isArray(x)) throw 'invalid';

            result = [];
            for (i = 0; i < x.length; i++) {
              q = self.validateAndNormalize(x[i], schema.parameter);
              if (q === null) throw 'invalid';
              result.push(q);
            }
            return result;
          default: throw 'invalid';
          }
        })();
        case 'union':
          if (x) return x;
          else throw 'invalid';
        default: return x;
        }
      } else {
        throw new Error('unknown schema type ' + fullInspect(schema));
      }
    });

    if (result !== null && typeof o === 'string' && schema.type === 'schemas') {
      return {name: o};
    }

    return result;
  } catch (e) {
    if (e === 'invalid') return null;
    else throw e;
  }
};

this.validate = function(x, schema) {
  return this.validateAndNormalize(x, schema) !== null;
};

this.map = function(x, schema, fn) {
  if (typeof schema === 'string') {
    return fn(schema, x);
  } else if (typeof schema === 'object') {
    x = x || {};

    switch (schema.type) {
    case 'builtin': return fn(schema, x);
    case 'product': return (function() {
      var result = {};

      var name;
      for (name in schema.components) if (schema.components.hasOwnProperty(name)) {
        result[name] = self.map(x[name], schema.components[name], fn);
      }

      return fn(schema, result);
    })();
    case 'union': return (function() {
      if (typeof x === 'string') {
        x = {name: x};
      }
      
      if (x.name in schema.variants) {
        var result = {
          name: x.name,
          value: self.map(x.value, schema.variants[x.name], fn)
        };

        return fn(schema, result);
      } else {
        return fn(schema, x.value);
      }
    })();
    case 'dependent': return (function() {
      if (x.parameters === undefined) return null;

      var parameters = {};

      var name, parameter;
      for (name in schema.parameters) if (schema.parameters.hasOwnProperty(name)) {
        parameter = self.map(x.parameters[name], schema.parameters[name], fn);
        if (parameter === null) return null;

        parameters[name] = parameter;
      }

      var type = schema.cases(parameters);
      if (!type) return null;

      var result = self.map(x.value, type, fn);

      return {
        parameters: parameters,
        value: result
      };
    })();
    case 'schemas': return (function() {
      if (typeof x === 'string') {
        return schema.schemas[x] !== undefined ? fn(schema, {name: x, value: self.map(true, schema.schemas[x], fn)}) : null;
      } else if (typeof x === 'object') {
        if (schema.schemas[x.name] !== undefined) {
          return fn(schema, {
            name: x.name,
            value: self.map(x.value, schema.schemas[x.name], fn)
          });
        } else {
          return null;
        }
      } else {
        return null;
      }
    })();
    default: throw new Error(['unknown schema type', fullInspect(schema)]);
    }
  } else {
    throw new Error(['unknown schema:', fullInspect(schema)]);
  }
};

})();
