describe('KhoaiJS', function () {
    var expect = chai.expect,
        chai_assert = chai.assert;

    describe('STATIC PROPERTIES', function () {
        it('VERSION', function () {
            expect(Khoai).to.have.property('VERSION');
        });

        describe('SORT_NUMBER', function () {
            it('Array of numbers', function () {
                var scores = [1, 10, 2, 21];
                scores.sort(Khoai.util.SORT_NUMBER);

                chai_assert.deepEqual(scores, [1, 2, 10, 21]);
            });

            it('Array of numbers and characters', function () {
                var scores = [1, 10, 'A', 2, 21];
                scores.sort(Khoai.util.SORT_NUMBER);

                chai_assert.deepEqual(scores, [1, 10, 'A', 2, 21]);
            });
        });

        describe('SORT_NUMBER_DESC', function () {
            it('Array of numbers', function () {
                var scores = [21, 10, 2, 1];
                scores.sort(Khoai.util.SORT_NUMBER_DESC);

                chai_assert.deepEqual(scores, [21, 10, 2, 1]);
            });

            it('Array of numbers and characters', function () {
                var scores = [21, 10, 'A', 2, 1];
                scores.sort(Khoai.util.SORT_NUMBER_DESC);

                chai_assert.deepEqual(scores, [21, 10, 'A', 2, 1]);
            });
        });

    });

    describe('Functions', function () {
        describe('Debugging', function () {
            beforeEach(function () {
                Khoai.util.debugComplete('test');
                Khoai.util.debugComplete();
            });

            it('debugging and debugComplete', function () {
                Khoai.util.debugging('test');
                chai_assert.isTrue(Khoai.util.isDebugging('test'));
                Khoai.util.debugComplete('test');
                chai_assert.isFalse(Khoai.util.isDebugging('test'));
            });

            it('on debugging', function (done) {
                Khoai.util.debugging('test');
                Khoai.util.onDebugging('test', done);
            });

            it('if not debugging', function (done) {
                Khoai.util.debugComplete('test');

                if (Khoai.util.isDebugging('test')) {
                    done('it must be by pass this');
                } else {
                    done();
                }
            });

        });
        describe('Khoai.util.beNumber', function () {
            it('Parameter is number', function () {
                expect(Khoai.util.beNumber(123)).to.be.a('number').with.equal(123);
            });
            it('Parameter is number, with default value', function () {
                expect(Khoai.util.beNumber(123, 567)).to.be.a('number').with.equal(123);
            });

            it('Parameter is string of number', function () {
                expect(Khoai.util.beNumber('123')).to.be.a('number').with.equal(123);
            });
            it('Parameter is string of number, with default value', function () {
                expect(Khoai.util.beNumber('123', 567)).to.be.a('number').with.equal(123);
            });

            it('Parameter isn\'t a number, with default value', function () {
                expect(Khoai.util.beNumber(true, 567)).to.be.a('number').with.equal(567);
                expect(Khoai.util.beNumber([], 567)).to.be.a('number').with.equal(567);
                expect(Khoai.util.beNumber(new Array(), 567)).to.be.a('number').with.equal(567);
            });
        });
        describe('Khoai.util.beObject', function () {
            it('Parameter is empty', function () {
                var obj = Khoai.util.beObject();
                //
                chai_assert.isObject(obj);
            });
            it('Parameter is string', function () {
                var obj = Khoai.util.beObject('yahoo');
                //
                chai_assert.isObject(obj);
            });
            it('Parameter is number', function () {
                var result = Khoai.util.beObject(123);
                //
                chai_assert.isObject(result);
            });
            it('Parameters is string and number', function () {
                var obj = Khoai.util.beObject('yahoo', 123);
                //
                chai_assert.isObject(obj);
                chai_assert.property(obj, 'yahoo', 'Object missing key');
                chai_assert.propertyVal(obj, 'yahoo', 123, 'Wrong object value');
            });


        });
        describe('Khoai.util.callFunc', function () {
            it('Call function object', function () {
                function test(old) {
                    return old + 1;
                }

                //
                chai_assert.strictEqual(Khoai.util.callFunc(test, 10), 11);
            });
            it('Call function as string', function () {
                window.func_as_string = function (old) {
                    return old + 1;
                };
                //
                chai_assert.doesNotThrow(function () {
                    Khoai.util.callFunc('func_as_string', 10);
                });
            });
            it('Call callback with first parameter is array', function () {
                function test(arr) {
                    arr.push(4);

                    return arr;
                }

                //
                var result = Khoai.util.callFunc(test, [[1, 2, 3]]);
                //
                chai_assert.isArray(result);
                chai_assert.deepEqual(result, [1, 2, 3, 4]);
            });
            it('Call function with context', function () {
                var obj = {name: 'Manh'};
                //
                function say_hi() {
                    return 'Hi, ' + this.name;
                }

                var result = Khoai.util.callFunc(say_hi, [], obj);
                //
                chai_assert.strictEqual(result, 'Hi, Manh');
            });
        });
        describe('Khoai.util.castItemsType', function () {
            var arr = [];

            beforeEach(function () {
                arr = [1, 2, 'ABC', 0, false, {'name': 'Manh'}];
            });

            it('cast to string', function () {
                chai_assert.deepEqual(Khoai.util.castItemsType(arr, 'string'), ['1', '2', 'ABC', '0', 'false', "[object Object]"]);
            });
            it('cast to number', function () {
                chai_assert.deepEqual(Khoai.util.castItemsType(arr, 'number'), [1, 2, 0, 0, 0, 0]);
            });
            it('cast to boolean', function () {
                chai_assert.deepEqual(Khoai.util.castItemsType(arr, 'boolean'), [true, true, true, false, false, true]);
            });
            it('cast to array', function () {
                var cast_result = Khoai.util.castItemsType(arr, 'array'),
                    result_expect = [[1], [2], ['ABC'], [0], [false], [{'name': 'Manh'}]];

                chai_assert.isArray(cast_result);

                for (var i = 0, len = cast_result.length; i < len; i++) {
                    if (cast_result.hasOwnProperty(i)) {
                        chai_assert.deepEqual(cast_result[i], result_expect[i]);
                    }
                }
            });
            it('cast to object', function () {
                var cast_result = Khoai.util.castItemsType(arr, 'object'),
                    result_expect = [{0: 1}, {0: 2}, {0: 'ABC'}, {0: 0}, {0: false}, {'name': 'Manh'}];

                chai_assert.isArray(cast_result);

                for (var i = 0, len = cast_result.length; i < len; i++) {
                    if (cast_result.hasOwnProperty(i)) {
                        chai_assert.deepEqual(cast_result[i], result_expect[i]);
                    }
                }
            });
        });

        describe('Khoai.util.chunks', function () {
            var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                chunked = Khoai.util.chunks(arr, 3);

            it('test', function () {
                chai_assert.isArray(chunked);
                chai_assert.lengthOf(chunked, 3);
                chai_assert.deepEqual(chunked[0], [0, 1, 2, 3]);
                chai_assert.deepEqual(chunked[1], [4, 5, 6, 7]);
                chai_assert.deepEqual(chunked[2], [8, 9]);
            });

        });
        describe('Khoai.util.className', function () {
            it('Default', function () {
                chai_assert.strictEqual(Khoai.util.className(new Object()), '[object Object]');
            });
            it('Constructor only', function () {
                function ABC() {
                    //
                }

                chai_assert.strictEqual(Khoai.util.className(new ABC(), true), 'ABC');
            });
        });
        describe('Khoai.util.contentType', function () {
            it('test', function () {
                function ABC() {

                }
                chai_assert.strictEqual(Khoai.util.contentType(123), 'number');
                chai_assert.strictEqual(Khoai.util.contentType('123'), 'string');
                chai_assert.strictEqual(Khoai.util.contentType('Yahooooooo'), 'string');
                chai_assert.strictEqual(Khoai.util.contentType(true), 'boolean');
                chai_assert.strictEqual(Khoai.util.contentType([1, 2]), 'Array');
                chai_assert.strictEqual(Khoai.util.contentType({color: 'red'}), 'Object');
                chai_assert.strictEqual(Khoai.util.contentType(new ABC()), 'ABC');
            });
        });
        describe('Khoai.util.currentID', function () {
            before(function () {
                Khoai.util.resetID();
                Khoai.util.resetID('superman');
            });

            it('Default type', function () {
                chai_assert.isFalse(Khoai.util.currentID());
                chai_assert.isFalse(Khoai.util.currentID(null));
                Khoai.util.nextID();
                chai_assert.strictEqual(Khoai.util.currentID(), 'unique_id_1');
                chai_assert.strictEqual(Khoai.util.currentID(null), 'unique_id_1');
                chai_assert.strictEqual(Khoai.util.currentID(null, false), 1);
            });

            it('Custom type', function () {
                chai_assert.isFalse(Khoai.util.currentID('superman'));
                Khoai.util.nextID('superman');
                chai_assert.strictEqual(Khoai.util.currentID('superman'), 'superman_1');
                chai_assert.strictEqual(Khoai.util.currentID('superman', false), 1);
            });

        });
        describe('Khoai.util.defineConstant', function () {
            it('Define constant by name and value', function () {
                var obj = {};
                Khoai.util.defineConstant(obj, 'TEST_DEFINECONSTANT', 123);
                chai_assert.property(obj, 'TEST_DEFINECONSTANT');
                chai_assert.propertyVal(obj, 'TEST_DEFINECONSTANT', 123);
            });
            it('Define constant by name (LOWERCASE) and value', function () {
                var obj = {};
                Khoai.util.defineConstant(obj, 'test_defineconstant_lower', 123);
                chai_assert.property(obj, 'TEST_DEFINECONSTANT_LOWER');
                chai_assert.propertyVal(obj, 'TEST_DEFINECONSTANT_LOWER', 123);
            });
            it('Define constant by object of name and value', function () {
                var obj = {};

                Khoai.util.defineConstant(obj, {
                    X: 'A',
                    y: 'B'
                });
                chai_assert.property(obj, 'X');
                chai_assert.propertyVal(obj, 'X', 'A');
                chai_assert.property(obj, 'Y');
                chai_assert.propertyVal(obj, 'Y', 'B');
            });
        });
        describe('Khoai.util.defineObject', function () {
            it('test', function () {
                var obj = Khoai.util.defineObject({
                    name: 'Manh',
                    old: 123
                });
                //
                chai_assert.property(obj, 'name');
                chai_assert.propertyVal(obj, 'name', 'Manh');
                //
                chai_assert.property(obj, 'old');
                chai_assert.propertyVal(obj, 'old', 123);
                //
                obj.old = 456;
                chai_assert.propertyVal(obj, 'old', 123);
            });
        });
        describe('Khoai.util.inherit', function () {
            function SourceClass() {
                this.foo = 'bar';
            }

            SourceClass.prototype.test = function () {
                return 'SourceClass.foo: ' + this.foo;
            };

            function DestClass() {
                SourceClass.call(this)
            }

            Khoai.util.inherit(DestClass, SourceClass);

            var obj = new DestClass();

            it('Has property', function () {
                chai_assert.property(obj, 'foo');
                chai_assert.propertyVal(obj, 'foo', 'bar');
                chai_assert.property(obj, 'test');
                chai_assert.isFunction(obj.test);
            });
            it('Correct property', function () {
                chai_assert.strictEqual(obj.test(), 'SourceClass.foo: bar');
                obj.foo = 'Ohoho';
                chai_assert.strictEqual(obj.test(), 'SourceClass.foo: Ohoho');

            });
            it('Inherit and override parent methods', function () {
                function FooClass() {
                    SourceClass.call(this)
                }

                //
                Khoai.util.inherit(FooClass, SourceClass);
                //
                FooClass.prototype.test = function () {
                    return 'FooClass.foo: ' + this.foo;
                };
                //
                var obj_foo = new FooClass();
                //
                chai_assert.strictEqual(obj_foo.test(), 'FooClass.foo: bar');
                obj_foo.foo = 'Ohoho';
                chai_assert.strictEqual(obj_foo.test(), 'FooClass.foo: Ohoho');
                chai_assert.strictEqual(obj_foo.constructor.prototype._super.test.call(obj_foo), 'SourceClass.foo: Ohoho');
            });
        });
        describe('Khoai.util.isInstanceOf', function () {
            it('test', function () {
                chai_assert.isFalse(Khoai.util.isInstanceOf(123, 'Object'));
                chai_assert.isTrue(Khoai.util.isInstanceOf(new Array(), 'Array'));
                chai_assert.isTrue(Khoai.util.isInstanceOf(123, 'Number'));
                chai_assert.isTrue(Khoai.util.isInstanceOf('123', 'String'));
            });
        });
        describe('Khoai.util.isNumeric', function () {
            it('test', function () {
                chai_assert.isTrue(Khoai.util.isNumeric(123));
                chai_assert.isTrue(Khoai.util.isNumeric(123.5));
                chai_assert.isTrue(Khoai.util.isNumeric('123.5'));
                chai_assert.isFalse(Khoai.util.isNumeric('123.5 yahoo'));
            })
        });
        describe('Khoai.util.isPrimitiveType', function () {
            it('test', function () {
                chai_assert.isTrue(Khoai.util.isPrimitiveType(123));
                chai_assert.isTrue(Khoai.util.isPrimitiveType('123'));
                chai_assert.isTrue(Khoai.util.isPrimitiveType(null));
                chai_assert.isTrue(Khoai.util.isPrimitiveType());
                chai_assert.isFalse(Khoai.util.isPrimitiveType(Khoai.util));
            });
        });
        describe('Khoai.util.mergeObject', function () {
            var result,
                object = {a: 'A', b: 'B'},
                object2 = {b: 'BB', c: 'C'},
                array = ['D', 'E', 'F'],
                string = 'foo',
                array_cloned = _.cloneDeep(array),
                string_cloned = string;

            before(function () {
                result = Khoai.util.mergeObject(object, array, object2, string);
                console.log('result', result);
                console.log('obj', object);
                console.log('arr', array_cloned);
                console.log('string', string_cloned);
            });

            it('result must contain all of data', function () {
                chai_assert.deepEqual(result, {
                    a: 'A', b: 'BB',
                    c: 'C',
                    0: 'D', 1: 'E', 2: 'F',
                    3: 'foo'
                });
            });
            it('result is first object assigned to function', function () {
                chai_assert.deepEqual(result, object);
            });
            it('except first object, all of other parameter will be reserved', function () {
                chai_assert.deepEqual(array, array_cloned);
                chai_assert.isTrue(string === string_cloned);
            });

        });
        describe('Khoai.util.loop', function () {
            it('Loop over array', function () {
                var array = [1, 2, 3, 4, 5],
                    array_looped = [];
                //
                Khoai.util.loop(array, function (item) {
                    array_looped.push(item);
                });
                //
                chai_assert.deepEqual(array, array_looped);
            });

            it('Loop over object', function () {
                var obj = {a: 'A', b: 'B', c: 123, d: [1, 'A', true], e: false, f: (new Array())},
                    obj_looped = {};
                //
                Khoai.util.loop(obj, function (val, key) {
                    obj_looped[key] = val;
                });
                //
                chai_assert.deepEqual(obj, obj_looped);
            });

            it('Loop over array with break', function () {
                var array = [1, 2, 3, 4, 5],
                    array_looped = [];
                //
                Khoai.util.loop(array, function (item) {
                    if (item > 3) {
                        return 'break';
                    }

                    array_looped.push(item);
                });
                //
                chai_assert.deepEqual(array_looped, [1, 2, 3]);
            });
            it('Loop over array with custom break_on value', function () {
                var array = [1, 2, 3, 4, 5],
                    array_looped = [];
                //
                Khoai.util.loop(array, function (item) {
                    if (item > 3) {
                        return 'break_loop';
                    }

                    array_looped.push(item);
                }, 'break_loop');
                //
                chai_assert.deepEqual(array_looped, [1, 2, 3]);
            });
        });
        describe('Khoai.util.nextID', function () {
            before(function () {
                Khoai.util.resetID();
                Khoai.util.resetID('superman');
            });

            it('Default type', function () {
                chai_assert.strictEqual(Khoai.util.nextID(), 'unique_id_1');
                chai_assert.strictEqual(Khoai.util.nextID(), 'unique_id_2');
                chai_assert.strictEqual(Khoai.util.nextID(null, false), 3);
            });
            it('Custom type', function () {
                chai_assert.strictEqual(Khoai.util.nextID('superman'), 'superman_1');
                chai_assert.strictEqual(Khoai.util.nextID('superman'), 'superman_2');
                chai_assert.strictEqual(Khoai.util.nextID('superman', false), 3);
            });
        });
        describe('Khoai.util.oneOf', function () {
            it('Exists in array', function () {
                var items = [1, 2, 3, 'a'];
                //
                chai_assert.strictEqual(Khoai.util.oneOf(1, items), 1);
            });
            it('Exists in array, with default value', function () {
                var items = [1, 2, 3, 'a'];
                //
                chai_assert.strictEqual(Khoai.util.oneOf(3, items, 'A'), 3);
            });
            it('Not exists in array', function () {
                var items = [1, 2, 3, 'a'];
                //
                chai_assert.strictEqual(Khoai.util.oneOf('FOO', items), 1);
            });
            it('Not exists in array, with default value', function () {
                var items = [1, 2, 3, 'a'];
                //
                chai_assert.strictEqual(Khoai.util.oneOf('FOO', items, 'BAR'), 'BAR');
            });
        });
        describe('Khoai.util.optionalArgs', function () {
            it('test', function () {
                var order = ['int', 'bool', 'str'],
                    rules = {int: 'number', bool: 'boolean', str: 'string'};

                expect(Khoai.util.optionalArgs([1, true, 'A'], order, rules)).to.be.a('object').with.eql({
                    int: 1,
                    bool: true,
                    str: "A"
                });
                expect(Khoai.util.optionalArgs([true, 'A'], order, rules)).to.be.a('object').with.eql({bool: true, str: "A"});
                expect(Khoai.util.optionalArgs([true], order, rules)).to.be.a('object').with.eql({bool: true});
                expect(Khoai.util.optionalArgs(['A'], order, rules)).to.be.a('object').with.eql({str: "A"});
                expect(Khoai.util.optionalArgs(['A', 'V'], order, rules)).to.be.a('object').with.eql({int: "A", bool: "V"});
                expect(Khoai.util.optionalArgs([1, []], order, rules)).to.be.a('object').with.eql({int: 1, bool: []});
                expect(Khoai.util.optionalArgs([true, []], order, rules)).to.be.a('object').with.eql({int: true, bool: []});
                expect(Khoai.util.optionalArgs(['A', []], order, rules)).to.be.a('object').with.eql({int: "A", bool: []});
                expect(Khoai.util.optionalArgs([[], []], order, rules)).to.be.a('object').with.eql({int: [], bool: []});
            })
        });
        describe('Khoai.util.pairsAsObject', function () {
            it('test', function () {
                chai_assert.deepEqual(Khoai.util.pairsAsObject({one: 1, two: 2, three: 3}), [
                    {key: 'one', value: 1},
                    {key: 'two', value: 2},
                    {key: 'three', value: 3}
                ]);
            });
        });
        describe('Khoai.util.pluckBy', function () {
            it('test', function () {
                var stooges = [{name: 'moe', id: 1, age: 40}, {name: 'larry', id: 2, age: 50}, {
                    name: 'curly',
                    id: 4,
                    age: 60
                }];
                //
                chai_assert.deepEqual(Khoai.util.pluckBy(stooges, 'id', 'name'), {
                    1: "moe", 2: "larry", 4: "curly"
                });
            });
        });
        describe('Khoai.util.randomString', function () {
            it('default chars', function () {
                var rx = /^[0-9a-zA-Z]{10}$/;

                chai_assert.isTrue(rx.test(Khoai.util.randomString(10)));
            });
            it('Custom chars', function () {
                var rx = /^[ABCDEF]{10}$/;

                chai_assert.isTrue(rx.test(Khoai.util.randomString(10, 'ABCDEF')));
            });

        });
        describe('Khoai.util.setup', function () {
            var obj = {};

            beforeEach(function () {
                obj = {a: 'A', b: 'B'}
            });

            it('setup by key and value', function () {
                chai_assert.deepEqual(Khoai.util.setup(obj, 'a', '123'), {a: '123', b: 'B'});
            });
            it('setup by an object', function () {
                chai_assert.deepEqual(Khoai.util.setup(obj, {b: 'Yahoo', c: 'ASD'}), {a: 'A', b: 'Yahoo', c: 'ASD'});
            });

        });
        describe('Khoai.util.toggle', function () {
            var arr = [];

            beforeEach(function () {
                arr = ['A', 'B', 'C', 'D'];
            });

            it('Toogle mode is ad', function () {
                chai_assert.sameMembers(Khoai.util.toggle(arr, ['A', 'V'], true), ['A', 'B', 'C', 'D', 'V']);
            });
            it('Toogle mode is remove', function () {
                chai_assert.sameMembers(Khoai.util.toggle(arr, ['A', 'V'], false), ['B', 'C', 'D']);
            });
            it('Toogle', function () {
                chai_assert.sameMembers(Khoai.util.toggle(arr, ['A', 'V']), ['B', 'C', 'D', 'V']);
            });
        });
    });
});