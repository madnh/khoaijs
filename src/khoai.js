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