(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], function(){
            return (root.Khoai = factory());
        });
    } else {
        // Browser globals
        root.Khoai = factory();
    }
}(this, function () {
    "use strict";

    var Khoai = {};
    var proxyCounter = 0;

    /**
     * Khoai's version
     * @constant {string} VERSION
     * @default
     */
    var version = '0.0.1';


    Object.defineProperty(Khoai, 'VERSION', {
        value: version
    });

    var BaseClass = function () {
        this.proxiedMethods = {}
    };


    /**
     *
     * @return {number}
     */
    Khoai.getProxyCounter = function () {
        return proxyCounter;
    };

    BaseClass.prototype.dispose = function () {
        for (var key in this.proxiedMethods) {
            if (this.proxiedMethods.hasOwnProperty(key)) {
                this.proxiedMethods[key] = null
            }
        }

        this.proxiedMethods = {}
    };

    /*
     * Creates a proxied method reference or returns an existing proxied method.
     */
    BaseClass.prototype.proxy = function (method) {
        if (method.khoaiProxyId === undefined) {
            proxyCounter++;
            method.khoaiProxyId = proxyCounter
        }

        if (this.proxiedMethods[method.khoaiProxyId] !== undefined)
            return this.proxiedMethods[method.khoaiProxyId];

        this.proxiedMethods[method.khoaiProxyId] = method.bind(this);

        return this.proxiedMethods[method.khoaiProxyId]
    };

    Khoai.baseClass = BaseClass;

    return Khoai;
}));
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash', 'khoai'], function (_, Khoai) {
            factory(_, Khoai);
        });
    } else {
        factory(root._, root.Khoai)
    }
}(this, function (_, Khoai) {
    /*
     |--------------------------------------------------------------------------
     | Type Definitions
     |--------------------------------------------------------------------------
     */

    /**
     * Loop callback. Useful in _.each, _.map, _.omit,...
     * @callback loopCallback
     * @param value Item value
     * @param key Item name/index
     * @param object object of items
     *
     * @see http://underscorejs.org/#each
     * @see http://underscorejs.org/#map
     * @see http://underscorejs.org/#omit
     *
     * @example <caption>Alerts each number value in turn...</caption>
     * _.each([1, 2, 3], alert);
     * _.each({one: 1, two: 2, three: 3}, alert);
     * @example <caption>Log to console each number value in turn...</caption>
     * var logger = function(item, key, object){
     *  console.log(key, '=>', item, '<------ Object', object);
     * };
     * _.each([1, 2, 3], logger);
     * _.each({one: 1, two: 2, three: 3}, logger);
     *
     */

    /*
     |--------------------------------------------------------------------------
     | Core
     |--------------------------------------------------------------------------
     */


    var Util = {};
    var slice = Array.prototype.slice;

    /**
     * Slice arguments of a function as array
     * @param args
     * @param {Number} [start]
     * @param {Number} [end]
     * @return {*}
     */
    Util.sliceArguments = function (args, start, end) {
        return slice.apply(args, slice.call(arguments, 1));
    };

    Util.beNumber = function (value, default_value) {
        value = parseFloat(value);

        if (Util.isNumeric(value)) {
            return value;
        }
        if (_.isUndefined(default_value)) {
            return 0;
        }

        return Util.isNumeric(default_value) ? parseFloat(default_value) : Util.beNumber(default_value, 0);
    };

    /**
     * Make sure first argument is object or arguments are name and value of object
     * @param {*} [name]
     * @param {*} [value]
     * @returns {*}
     * @example
     * Khoai.util.beObject(); //{}
     * Khoai.util.beObject(['foo', 'bar', 123]); //{0: "a", 1: 'bar', 2: 123}
     * Khoai.util.beObject('yahoo'); //{0: "yahoo"}
     * Khoai.util.beObject(235); //{0: 235}
     * Khoai.util.beObject('yahoo', 123); //{yahoo: 123}
     * Khoai.util.beObject({yahoo: 123, goooo:'ASDWd'}); //{yahoo: 123, goooo:'ASDWd'}
     *
     */
    Util.beObject = function (name, value) {
        switch (true) {
            case arguments.length == 1:
                if (_.isObject(name)) {
                    return name;
                } else if (_.isArray(name) || _.isArguments(name)) {
                    return _.zipObject(Object.keys(name), name);
                }

                return {0: name};
                break;

            case arguments.length >= 2:
                if (_.isObject(name)) {
                    return name;
                }
                var obj = {};

                obj[name] = value;

                return obj;
        }

        return {};
    };

    var cast_types = {};

    cast_types['string'] = function (value) {
        return value + '';
    };
    cast_types['boolean'] = function (value) {
        return Boolean(value);
    };

    cast_types['number'] = function (value) {
        return Util.beNumber(value);
    };
    cast_types['integer'] = function (value) {
        return Math.floor(Util.beNumber(value));
    };
    cast_types['array'] = _.castArray;
    cast_types['object'] = function (value) {
        return Util.beObject(value);
    };

    /**
     * Convert array|object item to other type. Support types:
     * - string
     * - boolean
     * - number
     * - integer
     * - array
     * - object
     *
     * @param object
     * @param type
     * @return {Array|object}
     * @throws Error when cast type is unsupported
     */
    Util.castItemsType = function (object, type) {
        if (!cast_types.hasOwnProperty(type)) {
            throw new Error('Invalid cast type. Available types are: string, number, integer, array and object');
        }
        if (_.isArray(object)) {
            return _.map(_.clone(object), cast_types[type]);
        }

        return _.mapObject(_.clone(object), cast_types[type]);
    };

    /**
     * Loop over array or object like _.each but breakable
     * @param {object|Array} obj Loop object
     * @param {loopCallback} callback callback apply on every item, return break value to break the loop
     * @param {string} [break_on=break] Value of callback result that break the loop, default is 'break'
     * @returns {*}
     * @example
     * Khoai.util.loop([1,2,3,4,5], function(item){
     *  console.log('Number', item);
     *  if(item > 3){
     *      return 'break';
     *  }
     * });
     * //Console will log:
     * // Number 1
     * // Number 2
     * // Number 3
     *  @example
     * Khoai.util.loop([1,2,3,4,5], function(item){
     *  console.log('Number', item);
     *  if(item > 3){
     *      return 'yahoo';
     *  }
     * }, 'yahoo');
     * //Console will log:
     * // Number 1
     * // Number 2
     * // Number 3
     *
     */
    Util.loop = function (obj, callback, break_on) {
        var i, length;
        if (_.isUndefined(break_on)) {
            break_on = 'break';
        }
        if (_.isArray(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
                if (callback(obj[i], i, obj) === break_on) {
                    break;
                }
            }
        } else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                if (callback(obj[keys[i]], keys[i], obj) === break_on) {
                    break;
                }
            }
        }
        return obj;
    };

    var unique_id_current_status = {};

    /**
     * Return Next ID of type, start from 1
     * @param {string} [type="unique_id"] Type of ID
     * @param {boolean} [type_as_prefix = true]  Use type as prefix of return ID
     * @returns {string|number}
     * @example <caption>Default type</caption>
     * Khoai.util.nextID(); //unique_id_1
     * Khoai.util.nextID(); //unique_id_2
     * Khoai.util.nextID(null, false); //3
     * Khoai.util.nextID('superman'); //superman_1
     * Khoai.util.nextID('superman'); //superman_2
     * Khoai.util.nextID(); //unique_id_4
     * Khoai.util.nextID('superman', false); //3
     *
     */
    Util.nextID = function (type, type_as_prefix) {
        if (_.isEmpty(type)) {
            type = 'unique_id';
        }
        if (!unique_id_current_status.hasOwnProperty(type)) {
            unique_id_current_status[type] = 1;
        } else {
            unique_id_current_status[type]++;
        }

        return get_unique_id_with_prefix(type, unique_id_current_status[type], type_as_prefix);
    };

    /**
     * Return current ID of type
     * @param {string} [type="unique_id"] Type of ID
     * @param {boolean} [type_as_prefix = true] Use type as prefix of return ID
     * @returns {boolean|string|number}
     * @example
     * Khoai.util.currentID(); //false
     * Khoai.util.nextID(); //unique_id_0
     * Khoai.util.nextID(); //unique_id_1
     * Khoai.util.currentID(); //unique_id_1
     * Khoai.util.currentID(null, false); //1
     * Khoai.util.currentID('superman'); //false
     * Khoai.util.nextID('superman'); //superman_0
     * Khoai.util.nextID('superman'); //superman_1
     * Khoai.util.currentID('superman'); //superman_1
     * Khoai.util.currentID('superman', false); //1
     * Khoai.util.nextID(); //2
     * Khoai.util.currentID(); //unique_id_2
     */
    Util.currentID = function (type, type_as_prefix) {
        if (_.isEmpty(type)) {
            type = 'unique_id';
        }

        if (!unique_id_current_status.hasOwnProperty(type)) {
            return false;
        }

        return get_unique_id_with_prefix(type, unique_id_current_status[type], type_as_prefix);
    };

    /**
     *
     * @param {string} [type] a type, do not require existed
     * @param {number} [value]
     * @returns {number|*}
     */
    Util.resetID = function (type, value) {
        if (!arguments.length) {
            type = 'unique_id';
        }

        type = String(type);

        if (_.isUndefined(value)) {
            delete unique_id_current_status[type];
        } else {
            value = arguments.length > 1 ? Util.beNumber(value) : 0;
            value = Math.max(value, 0);
            unique_id_current_status[type] = value;
        }

        return value;
    };

    function get_unique_id_with_prefix(type, id, type_as_prefix) {
        if (type_as_prefix || _.isUndefined(type_as_prefix)) {
            return type + '_' + id;
        }

        return id;
    }


    /**
     * Get constructor name of object
     * @param obj
     * @param {boolean} [constructor_only = false] Return object's constructor name only
     * @returns {string}
     * @example
     * Khoai.util.className(Khoai.App); //"[object Object]"
     * Khoai.util.className(Khoai.App, true); //App
     * Khoai.util.className(new Khoai.EventEmitter(), true); //EventEmitter
     */
    Util.className = function (obj, constructor_only) {
        if (constructor_only) {
            return obj.constructor.name;
        }
        return Object.prototype.toString.call(obj);
    };

    /**
     * Get type of content. If is object then return constructor name
     * @param content
     * @returns {string}
     * @example
     * Khoai.util.contentType(123); //number
     * Khoai.util.contentType('123'); //string
     * Khoai.util.contentType('Yahooooooo'); //string
     * Khoai.util.contentType(true); //boolean
     * Khoai.util.contentType(true); //boolean
     * Khoai.util.contentType([1,2]); //Array
     * Khoai.util.contentType({}); //Object
     * Khoai.util.contentType(_.App); //App
     */
    Util.contentType = function (content) {
        var type = typeof content;

        if (type === 'object') {
            var class_name = Util.className(content, true);

            if (class_name) {
                return class_name;
            }
        }

        return type;
    };

    /**
     * Check object is an instance of a constructor type
     * @param {*} obj
     * @param {string} class_name Name of class
     * @returns {boolean}
     * @example
     * Khoai.util.isInstanceOf(Khoai.App, 'App');//true
     * Khoai.util.isInstanceOf(123, 'Object'); //false
     * Khoai.util.isInstanceOf(123, 'Number'); //true
     * Khoai.util.isInstanceOf('123', 'String'); //true
     * Khoai.util.isInstanceOf(new Khoai.util.EventEmitter(), 'EventEmitter'); //true
     */
    Util.isInstanceOf = function (obj, class_name) {
        return Util.className(obj, true) === class_name;
    };

    /**
     * Check if object is primitive type: null, string, number, boolean
     * @param value
     * @returns {boolean}
     * @example
     * Khoai.util.isPrimitiveType(123); //true
     * Khoai.util.isPrimitiveType('123'); //true
     * Khoai.util.isPrimitiveType(null); //true
     * Khoai.util.isPrimitiveType(); //true
     * Khoai.util.isPrimitiveType(_.App); //false
     */
    Util.isPrimitiveType = function (value) {
        if (_.isObject(value)) {
            return false;
        }

        var type = typeof value;
        return value == null || type === 'string' || type === 'number' || type === 'boolean';
    };

    Util.mergeObject = function () {
        var next_index = 0;

        for (var i = 0, length = arguments.length; i < length; i++) {
            if (_.isArray(arguments[i]) || !_.isObject(arguments[i])) {
                arguments[i] = _.castArray(arguments[i]);
                arguments[i] = _.zipObject(_.range(next_index, next_index += arguments[i].length), arguments[i]);
            }
        }

        return _.extend.apply(_, arguments);
    };

    function is_diff_strict_cb(value_1, value_2) {
        return value_1 !== value_2;
    }

    function is_diff_loose_cb(value_1, value_2) {
        return value_1 != value_2;
    }

    /**
     * Get dirty of object with others object
     * @param {function} cb Callback return true if 2 item is difference
     * @param object
     * @param [others...]
     * @return {{}}
     */
    function diff_object(cb, object, others) {
        if (arguments.length < 2) {
            return {};
        }

        var result = {};

        if (!_.isFunction(cb)) {
            cb = cb ? is_diff_strict_cb : is_diff_loose_cb;
        }

        others = Util.mergeObject.apply(Util, slice.call(arguments, 2));

        _.each(object, function (value, key) {
            if (!others.hasOwnProperty(key)) {
                result[key] = value;
            } else {
                if (cb(value, others[key])) {
                    result[key] = value;
                }
            }
        });

        return result;
    }

    /**
     * Get dirty of object with others object. Strict comparison
     * @param {object} object
     * @param {object} others
     * @return {*}
     * @example
     * Khoai.util.diffObject({a: 0, b: 1}, {a: '0', b: 1}); //{a: 0}
     */
    Util.diffObject = function (object, others) {
        var args = _.flatten(_.toArray(arguments));

        args.unshift(is_diff_strict_cb);

        return diff_object.apply(null, args);
    };

    /**
     * Get dirty of object with others object. Loose comparison
     * @param {object} object
     * @param {object} others
     * @return {*}
     * @example
     * Khoai.util.diffObjectLoose({a: 0, b: 1}, {a: '0', b: 2}); //{b: 1}
     */
    Util.diffObjectLoose = function (object, others) {
        var args = _.flatten(_.toArray(arguments));

        args.unshift(is_diff_loose_cb);

        return diff_object.apply(null, args);
    };

    /**
     * Get dirty of object with others object, use callback
     * @param {function} callback Callback with 2 parameters: base value, other object value. Return true when difference
     * @param {object} object
     * @param {object} others
     * @return {*}
     */
    Util.diffObjectWith = function (callback, object, others) {
        return diff_object.apply(null, slice.apply(arguments))
    };


    /**
     * Get random string
     * @param {number} [length]
     * @param {string} [chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']
     * @returns {string}
     * @example
     * Khoai.util.randomString(10); //'mYJeC1xBcl'
     * Khoai.util.randomString(10, 'ABCDEF'); //'CDABBEFADE'
     */
    Util.randomString = function (length, chars) {
        var result = '', chars_length, i;
        if (_.isUndefined(chars) || !chars.toString().length) {
            chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        chars_length = chars.length;

        length = Util.beNumber(length, 10);

        for (i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars_length - 1))];
        }
        return result;
    };


    /**
     * Setup a object with field name and value or object of fields
     * @param {Object} object host object
     * @param {(string|Object)} option field name of object of fields
     * @param {*} value value of field when option param is field name
     * @returns {{}}
     * @example
     * var obj = {a: 'A', b: 'B'}
     * Khoai.util.setup(obj, 'a', '123'); //obj -> {a: '123', b: 'B'}
     * Khoai.util.setup(obj, {b: 'Yahoo', c: 'ASD'}); //obj -> {a: 123, b: 'Yahoo', c: 'ASD'}
     */
    Util.setup = function (object, option, value) {
        if (!_.isObject(object)) {
            object = {};
        }
        if (_.isObject(option)) {
            _.each(option, function (val, path) {
                _.set(object, path, val);
            });
        } else {
            _.set(object, option, value);
        }

        return object;
    };

    /**
     * Get all of valid keys that exists in object.
     *
     * @param {object} object
     * @param {Array} keys
     * @return {Array}
     */
    Util.validKeys = function (object, keys) {
        var result = [];

        keys = _.castArray(keys);
        for (var i = 0, length = keys.length; i < length; i++) {
            if (object.hasOwnProperty(keys[i])) {
                result.push(keys[i]);
            }
        }

        return result;
    };


    /**
     * Like _.pairs but array item is an object with field is "key", "value"
     * @param {{}} object
     * @param {string} [key = 'key']
     * @param {string} [value = 'value']
     * @returns {Array}
     * @example
     * Khoai.util.pairsAsObject({one: 1, two: 2, three: 3});
     * => [{key: 'one', value: 1},{key: 'two', value: 2},{key: 'three', value: 3}]
     */
    Util.pairsAsObject = function (object, key, value) {
        var result = [],
            field_key = key || 'key',
            field_value = value || 'value';

        _.each(object, function (value, key) {
            var item = {};

            item[field_key] = key;
            item[field_value] = value;

            result.push(item);
        });

        return result;
    };

    /**
     * A convenient version of what is perhaps the most common use-case for map: extracting a list of property values, with a column as key.
     * @param {Array} collection
     * @param {string} key_field If key field not found then use as "undefined"
     * @param {string} value_field If value field not found then use as "undefined"
     * @returns {{}}
     * @example
     * var stooges = [{name: 'moe', id: 1, age: 40}, {name: 'larry', id: 2, age: 50}, {name: 'curly', id: 4, age: 60}];
     * Khoai.util.pluckBy(stooges, 'id', 'name');
     * => {1: 'moe', 2: 'larry', 3: 'curly'}
     */
    Util.pluckBy = function (collection, key_field, value_field) {
        var result = {};

        _.each(collection, function (object) {
            if (object.hasOwnProperty(key_field)) {
                result[object[key_field]] = object.hasOwnProperty(value_field) ? object[value_field] : undefined;
            }
        });

        return result;
    };

    /**
     * Check value is numeric
     * @param value
     * @returns {boolean}
     *
     * @example
     * Khoai.util.isNumeric(123); //true
     * Khoai.util.isNumeric(123.5); //true
     * Khoai.util.isNumeric('123.5'); //true
     */
    Util.isNumeric = function (value) {
        return !_.isArray(value) && (value - parseFloat(value) + 1) >= 0;
    };

    /**
     * Make sure value is in array
     * @param {*} value
     * @param {Array} values
     * @param {*} [default_value] Default value if not found value in values
     * @returns {*} If found then return value itself, else, return default_value or first item of array
     * @example
     * var items = [1,2,3,'a'];
     * Khoai.util.oneOf(1, items); // 1
     * Khoai.util.oneOf(0, items); // 1
     * Khoai.util.oneOf('a', items); // 'a'
     * Khoai.util.oneOf('b', items, 'C'); // 'C'
     */
    Util.oneOf = function (value, values, default_value) {
        if (-1 !== values.indexOf(value)) {
            return value;
        }

        if (arguments.length >= 3) {
            return default_value;
        }

        return _.first(values);
    };

    /**
     * Escape URL
     * @param {string} url
     * @param {boolean} [param = false] Include param?
     * @returns {string}
     */
    Util.escapeURL = function (url, param) {
        return param ? encodeURIComponent(url) : encodeURI(url);
    };

    /**
     * Unescape URL
     * @param {string} url
     * @param {boolean} [param = false] Include param?
     * @returns {string}
     */
    Util.unescapeURL = function (url, param) {
        return param ? decodeURI(url) : decodeURIComponent(url);
    };


    /**
     * Split array to n of chunks
     * @param {Array} array
     * @param {number} chunks Number of chunks
     * @return {Array}
     * @example
     * var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
     * Khoai.util.chunks(arr, 3)
     * => [
     *   [0, 1, 2, 3],
     *   [4, 5, 6, 7],
     *   [8, 9]
     * ]
     */
    Util.chunks = function (array, chunks) {
        return _.chunk(array, Math.ceil(array.length / chunks));
    };

    /**
     * Toggle array's elements
     * @param {Array} array
     * @param {Array} elements
     * @param {boolean} status If this param is boolean then add/remove base on it value. By default it is undefined -
     *     add if none exists, remove if existed
     * @returns {Array}
     * @example
     * var arr = ['A', 'B', 'C', 'D'];
     * Khoai.util.toggle(arr, ['A', 'V']) => ['B', 'C', 'D', 'V']
     * Khoai.util.toggle(arr, ['A', 'V'], true) => ['A', 'B', 'C', 'D', 'V']
     * Khoai.util.toggle(arr, ['A', 'V'], false) => ['B', 'C', 'D']
     */
    Util.toggle = function (array, elements, status) {
        elements = _.uniq(_.castArray(elements));
        if (_.isUndefined(status)) {
            var exclude = _.intersection(array, elements);
            var include = _.difference(elements, array);

            array = _.union(_.difference(array, exclude), include);
        } else {
            if (status) {
                array = _.union(array, elements);
            } else {
                array = _.difference(array, elements);
            }
        }
        return array;
    };

    /**
     * Create, define and return a object with properties. Object's properties are fixed and enumerable
     * @param {{}} properties
     * @returns {{}}
     * @example
     * var obj = Khoai.util.defineObject({name: 'Manh', old: 123, hello: function(){
     *  alert('Hello ' + this.name);
     * }});
     *
     * obj.old = 10;
     * console.log(obj); //{name: 'Manh', old: 123}
     * _.each(obj, function(value, key){
     *  console.log(key, '=>', value);
     * });
     * //name => Manh
     * //old => 123
     */
    Util.defineObject = function (properties) {
        var obj = {};
        _.each(properties, function (value, key) {
            key = key.trim();
            if (!_.has(obj, key)) {
                Object.defineProperty(obj, key, {
                    enumerable: !_.isFunction(value),
                    value: value
                });
            }
        });
        return obj;
    };

    /**
     * Define a MaDnh constant
     * @param {object} target
     * @param {(string|Object)} name
     * @param {*} [value = undefined]
     * @example
     * Khoai.util.defineConstant(obj, 'TEST', 123) => obj.TEST = 123
     */
    Util.defineConstant = function (target, name, value) {
        var obj = {};

        if (_.isObject(name)) {
            obj = name;
            value = undefined;
        } else {
            obj[name] = value;
        }
        _.each(obj, function (val, key) {
            key = key.trim().toUpperCase();

            if (!target.hasOwnProperty(key)) {
                Object.defineProperty(target, key, {
                    enumerable: true,
                    value: val
                });
            }
        });
    };

    /**
     * Inherit constructor prototype
     * @param {function} subclass_constructor Destination constructor
     * @param {function} base_class_constructor Source constructor
     * @param {boolean} [addSuper = true] Add property to destination prototype that reference back to source prototype
     *
     * @see https://github.com/Olical/Heir
     *
     * @example
     * function MyEE(){
     *  M.EventEmitter.call(this);
     * }
     *
     * M.inherit(MyEE, M.EventEmitter);
     */
    Util.inherit = function (subclass_constructor, base_class_constructor, addSuper) {
        var proto = subclass_constructor.prototype = Object.create(base_class_constructor.prototype);
        proto.constructor = subclass_constructor;

        if (addSuper || _.isUndefined(addSuper)) {
            proto._super = base_class_constructor.prototype;
        }
    };

    /**
     * Call callback with arguments
     * @param {string|function|Array} callback
     * @param {*} [args] Callback arguments, if only one argument as array passed then it must be wrapped by array, eg:
     *     [users]
     * @param {Object|null} context context of "this" keyword
     * @returns {*}
     *
     * @example
     * Khoai.util.callFunc(null, alert, 123);
     * Khoai.util.callFunc(null, function(name, old){
     *      alert('My name is ' + name + ', ' + old + 'years old');
     * }, ['Manh', 10]);
     *
     * var obj = {name: 'Manh', old: 10};
     * Khoai.util.callFunc(obj, function(say_hi){
     *      alert((say_hi ? 'Hi' : 'Hello') + '! my name is ' + this.name + ', ' + this.old + ' years old');
     * }, true);
     */
    Util.callFunc = function (callback, args, context) {
        if (arguments.length >= 2) {
            args = _.castArray(args);
        } else {
            args = [];
        }

        if (callback) {
            if (_.isFunction(callback)) {
                return callback.apply(context || null, args);
            } else if (_.isString(callback)) {
                if (window.hasOwnProperty(callback) && _.isFunction(window[callback])) {
                    return window[callback].apply(context || null, args);
                }

                throw new Error('Invalid callback!');
            } else if (_.isArray(callback)) {
                var result = [],
                    this_func = arguments.callee;

                _.each(callback, function (tmpFunc) {
                    result.push(this_func(tmpFunc, args, context));
                });

                return result;
            }
        }

        return undefined;
    };

    /**
     * Call callback asynchronous. Similar to Khoai.util.callFunc
     *
     * @param {(string|function|Array)} callback
     * @param {*} [args] Callback arguments, if only one argument as array passed then it must be wrapped by array, eg:
     *     [users]
     * @param {number} [delay=1] Delay milliseconds
     * @param {Object|null} context context of "this" keyword
     * @see callFunc
     */
    Util.async = function (callback, args, delay, context) {
        delay = parseInt(delay);
        if (_.isNaN(delay)) {
            delay = 1;
        }

        return setTimeout(function () {
            Util.callFunc(callback, args, context || null);
        }, Math.max(1, delay));
    };

    function createConsoleCB(name, description) {
        return function () {
            console[name].apply(console, (description ? [description] : []).concat(slice.apply(arguments)));
        }
    }

    /**
     * Like console.log with dynamic arguments
     * @example
     * var args = [1,2,3,4];
     * Khoai.util.logArgs('a',123);
     * Khoai.util.logArgs.apply(null, args);
     */
    Util.logArgs = function () {
        console.log.apply(console, slice.apply(arguments));
    };

    /**
     * Create console log callback with description as first arguments
     * @param {string} description
     * @returns {*}
     * @example
     * var cb = Khoai.util.logCb('Test 1');
     * cb(1,2,3); // Console log: 'Test 1' 1 2 3
     */
    Util.logCb = function (description) {
        return createConsoleCB.apply(null, ['log'].concat(slice.apply(arguments)));
    };

    /**
     * Like console.warn with dynamic arguments
     * @example
     * var args = [1,2,3,4];
     * Khoai.util.warnArgs('a',123);
     * Khoai.util.warnArgs.apply(null, args);
     */
    Util.warnArgs = function () {
        console.warn.apply(console, slice.apply(arguments));
    };

    /**
     * Create console waring callback with description as first arguments
     * @param {string} description
     * @returns {*}
     * @example
     * var cb = Khoai.util.warnCb('Test 1');
     * cb(1,2,3); // Console warn as: 'Test 1' 1 2 3
     */
    Util.warnCb = function (description) {
        return createConsoleCB.apply(null, ['warn'].concat(slice.apply(arguments)));
    };

    /**
     * Like console.error with dynamic arguments
     * @example
     * var args = [1,2,3,4];
     * Khoai.util.errorArgs('a',123);
     * Khoai.util.errorArgs.apply(null, args);
     */
    Util.errorArgs = function () {
        console.error.apply(console, slice.apply(arguments));
    };

    /**
     * Create console error callback with description as first arguments
     * @param {string} description
     * @returns {*}
     * @example
     * var cb = Khoai.util.errorCb('Test 1');
     * cb(1,2,3); // Console error as: 'Test 1' 1 2 3
     */
    Util.errorCb = function (description) {
        return createConsoleCB.apply(null, ['error'].concat(slice.apply(arguments)));
    };


    var debug_types_status = {},
        all_debugging = false;

    /**
     *
     * @param type
     * @returns {boolean}
     */
    Util.isDebugging = function (type) {
        if (all_debugging || _.isEmpty(type)) {
            return all_debugging;
        }

        return debug_types_status.hasOwnProperty(type) && debug_types_status[type];

    };
    /**
     *
     * @param [type] default is all debug type
     */
    Util.debugging = function (type) {
        if (_.isEmpty(type)) {
            all_debugging = true;
            return;
        }

        debug_types_status[type] = true;
    };
    /**
     *
     * @param [type] default is all debug type
     */
    Util.debugComplete = function (type) {
        if (_.isEmpty(type)) {
            all_debugging = false;
            debug_types_status = {};

            return;
        }

        delete debug_types_status[type];
    };

    /**
     * Run callback if is in debugging of a type
     * @param type null - all debug type
     * @param {function} callback
     */
    Util.onDebugging = function (type, callback) {
        if (Util.isDebugging(type)) {
            Util.callFunc(callback);
        }
    };

    /**
     * Get json string of an array
     * @param {array} details
     * @param {string} [glue="\n"]
     * @returns {string}
     */
    Util.getDebugString = function (details, glue) {
        var result = [];

        _.each(_.castArray(details), function (item) {
            result.push(JSON.stringify(item));
        });

        return result.join(glue || "\n");
    };

    /**
     *
     * @param args
     * @param order
     * @param rules
     * @returns {{}}
     * @example
     * var order = ['int', 'bool', 'str'],
     * rules = {int: 'number', bool: 'boolean', str: 'string'};
     *
     * Khoai.util.optionalArgs([1, true, 'A'], order, rules); //{int: 1, bool: true, str: "A"}
     * Khoai.util.optionalArgs([true, 'A'], order, rules);//{bool: true, str: "A"}
     * Khoai.util.optionalArgs(['A'], order, rules); //{str: "A"}
     * Khoai.util.optionalArgs(['A', 'V'], order, rules); //{int: "A", bool: "V"}
     * Khoai.util.optionalArgs([1, []], order, rules); //{int: 1, bool: []}
     * Khoai.util.optionalArgs([true, []], order, rules); //{int: true, bool: []}
     * Khoai.util.optionalArgs(['A', []], order, rules); //{int: "A", bool: []}
     * Khoai.util.optionalArgs([[], []], order, rules); //{int: Array[0], bool: []}
     *
     * Khoai.util.optionalArgs(['A', 'V'], ['int', 'bool', 'str', 'str2'], {int: 'number', bool: 'boolean', str: 'string', str2: 'string'});
     * //=> {str: "A", str2: "V"}
     */
    Util.optionalArgs = function (args, order, rules) {
        var result = {},
            arg, index = 0, last_index, missing_rules, type, args_cloned, args_with_type, found;

        missing_rules = _.difference(order, Object.keys(rules));
        missing_rules.forEach(function (missing) {
            rules[missing] = true;
        });

        args_with_type = order.map(function (arg_name) {
            return rules[arg_name];
        });

        if (_.isEmpty(args)) {
            return result;
        }
        if (args.length >= order.length) {
            result = _.zipObject(order, args.slice(0, order.length));
        } else {
            args_cloned = args.slice(0);

            while (arg = args_cloned.shift()) {
                type = Util.contentType(arg);
                found = false;
                last_index = index;

                Util.loop(args_with_type.slice(index), (function (tmp_arg, tmp_type) {
                    return function (types) {
                        if (types === true || tmp_type === types
                            || (_.isArray(types) && -1 != types.indexOf(tmp_type))
                            || (_.isFunction(types) && types(tmp_arg))) {
                            found = true;

                            return 'break';
                        }

                        index++;
                    }
                })(arg, type));

                if (!found) {
                    result = _.zipObject(order.slice(0, args.length), args);
                    break;
                }

                result[order[index++]] = arg;
            }
        }

        return result;
    };

    /**
     * Sort number asc
     */
    function sortNumberCallback(a, b) {
        return a - b;
    }

    /**
     * Sort number desc
     */
    function sortNumberDescCallback(a, b) {
        return b - a;
    }

    function is_equal_strict(a, b) {
        return a === b;
    }

    function is_equal_loose(a, b) {
        return a == b;
    }


    Util.defineConstant(Util, {
        /**
         * Array sort compare function. Sort number
         * @constant
         * @example
         * var scores = [1, 10, 2, 21];
         * scores.sort(); // [1, 10, 2, 21]
         * scores.sort(Khoai.util.SORT_NUMBER); // [1, 2, 10, 21]
         */
        SORT_NUMBER: sortNumberCallback,
        /**
         * Array sort compare function. Sort number desc
         * @constant
         * @example
         * var scores = [1, 10, 2, 21];
         * scores.sort(Khoai.util.SORT_NUMBER_DESC); // [21, 10, 2, 1]
         */
        SORT_NUMBER_DESC: sortNumberDescCallback
    });


    Khoai.util = Util;
}));
//# sourceMappingURL=khoai.js.map
