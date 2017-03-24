"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _socket = require("socket.io-client");

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class MappingService
 * @classdesc JavaScript Library for the MediaScape MappingService
 * @param {string} url URL for the WS connection. if(!url) it tries to connect to the server wich hosts the socket.io.js
 * @param {Object} options
 * @param {string} [options.userid] User ID
 * @param {boolean} [options.reconnection] if the Client should try to reconnect,Default = true
 * @param {boolean} [options.logToConsole] if things should get logged to console, Default = false
 * @param {function} [options.errorFunction] function to call for error messages, overrides logToConsole
 * @param {number} [options.maxTimeout] timeout value in ms, Default = 2000
 * @param {boolean} [options.multiplex] enable socket.io multiplexing, Default = socket.io default
 * @param [options.socketIo] override bundled socket.io import
 * @returns {Object} MappingService
 * @author Andreas Bosl <bosl@irt.de>
 * @copyright 2014 Institut für Rundfunktechnik GmbH, All rights reserved.
 *
 */
var MappingService = function MappingService(url, options) {

    var _connection = null;

    var self = {};

    // READY STATE for Shared State
    var STATE = Object.freeze({
        CONNECTING: "connecting",
        OPEN: "open",
        CLOSED: "closed"
    });

    if ((typeof url === "undefined" ? "undefined" : _typeof(url)) === 'object') {
        options = url;
        url = {};
        console.log('options', options);
    }

    // Event Handlers
    var _callbacks = {
        'readystatechange': []
    };
    /* <!-- defaults */
    if (!options) {
        options = {};
    }

    var socketIo = options.socketIo || _socket2.default;

    if (!options.maxTimeout) {
        options.maxTimeout = 2000;
    }

    var _error = function _error() {};

    if (options.logToConsole === true) {
        _error = console.error.bind(console);
    }
    if (options.errorFunction) _error = options.errorFunction;

    var connectURL = url || {};
    /* defaults --> */

    var onConnect = void 0,
        readystate = void 0;

    /* <!-- internal functions */
    var _init = function _init() {

        _connection = socketIo(connectURL, options);
        _connection.on('connect', onConnect);
        readystate.set('connecting');
        if (_connection.connected === true) {
            onConnect();
        }
    };

    onConnect = function onConnect() {
        readystate.set('open');
    };

    var parseMapping = function parseMapping(response) {
        var host = url;

        if ((typeof url === "undefined" ? "undefined" : _typeof(url)) === 'object' || !url) {
            host = window.location.protocol + '//' + window.location.host + '/';
        }
        if (!response.group) {
            var result = {};
            if (response.user) {
                result.user = host + response.user;
            }
            if (response.app) {
                result.app = host + response.app;
            }
            if (response.userApp) {
                result.userApp = host + response.userApp;
            }
            return result;
        } else {
            var _result = {
                group: host + response.group
            };
            return _result;
        }
    };

    /*
    Internal method for invoking callback handlers
    Handler is only supplied if on one specific callback is to used.
    This is helpful for supporting "immediate events", i.e. events given directly
    after handler is registered - on("change", handler);
    If handler is not supplied, this means that all callbacks are to be fired.
    This function is also sensitive to whether an "immediate event" has already been fired
    or not. See callback registration below.
    */
    var _do_callbacks = function _do_callbacks(what, e, handler) {
        if (!_callbacks.hasOwnProperty(what)) throw "Unsupported event " + what;
        var h;
        for (var i = 0; i < _callbacks[what].length; i++) {
            h = _callbacks[what][i];
            if (handler === undefined) {
                // all handlers to be invoked, except those with pending immeditate
                if (h['_immediate_pending_' + what]) {
                    continue;
                }
            } else {
                // only given handler to be called
                if (h === handler) handler['_immediate_pending_' + what] = false;else {
                    continue;
                }
            }
            try {
                h.call(self, e);
            } catch (ex) {
                _error("Error in " + what + ": ", +ex);
            }
        }
    };

    /*
    READYSTATE
    encapsulate protected property _readystate by wrapping
    getter and setter logic around it.
    Closure ensures that all state transfers must go through set function.
    Possibility to implement verification on all attempted state transferes
    Event
    */
    readystate = function () {
        var _readystate = STATE["CONNECTING"];
        // accessors
        return {
            set: function set(new_state) {
                // check new state value
                var found = false;
                for (var key in STATE) {
                    if (!STATE.hasOwnProperty(key)) continue;
                    if (STATE[key] === new_state) found = true;
                }
                if (!found) throw "Illegal state value " + new_state;
                // check state transition
                if (_readystate === STATE["CLOSED"]) return; // never leave final state
                // perform state transition
                if (new_state !== _readystate) {
                    _readystate = new_state;
                    // trigger events
                    _do_callbacks("readystatechange", new_state);
                }
            },
            get: function get() {
                return _readystate;
            }
        };
    }();

    var getMappingCommon = function getMappingCommon(request) {
        return new Promise(function (fulfill, reject) {
            _connection.emit('getMapping', request, function (response) {
                if (response.error) {
                    reject({
                        error: 'negative acknowledgement',
                        msg: response.error
                    });
                } else {
                    fulfill(parseMapping(response));
                }
            });
            setTimeout(function () {
                reject({
                    error: 'timeout'
                });
            }, options.maxTimeout);
        });
    };

    var getUserMapping = function getUserMapping(appId, scopeList) {
        if (appId && Array.isArray(scopeList)) {
            var request = {
                appId: appId
            };
            for (var i = 0, len = scopeList.length; i < len; i++) {
                if (scopeList[i] === 'user') {
                    request.user = true;
                }
                if (scopeList[i] === 'app') {
                    request.app = true;
                }
                if (scopeList[i] === 'userApp') {
                    request.userApp = true;
                }
            }
            if (options.userId) {
                request.userId = options.userId;
            }
            return getMappingCommon(request);
        } else {
            throw 'appId or scopeList undefined';
        }
    };

    var getGroupMapping = function getGroupMapping(groupId) {
        if (groupId) {
            var request = {
                groupId: groupId
            };
            return getMappingCommon(request);
        } else {
            throw 'groupId undefined';
        }
    };

    /**
     * registers a function on event, function gets called immediatly
     * @method on
     * @param {string} what change || presence || readystatechange
     * @param {function} handler the function to call on event
     * @returns {Object} SharedState
     * @memberof SharedState
     */
    /*
    register callback
    The complexity of this method arise from the fact that we are to give
    an "immediate callback" to the given handler.
    In addition, I do not want to do so directly within the on() method.
    As a programmer I would like to ensure that initialisation of an object
    is completed BEFORE the object needs to process any callbacks from the
    external world. This can be problematic if the object depends on events
    from multiple other objects. For example, the internal initialisation code
    needs to register handlers on external objects a and b.
    a.on("event", internal_handler_a);
    b.on("event", internal_handler_b);
    However, if object a gives an callback immediately within on, this callback
    will be processed BEFORE we have completed initialisation, i.e., any code
    subsequent to a.on).
    It is quite possible to make this be correct still, but I find nested handler
    invocation complicated to think about, and I prefer to avoid the problem.
    Therefore I like instead to make life easier by delaying "immediate callbacks"
    using
    setTimeout(_do_callbacks("event", e, handler), 0);
    This however introduces two new problems. First, if you do :
    o.on("event", handler);
    o.off("event", handler);
    you will get the "immediate callback" after off(), which is not what you
    expect. This is avoided by checking that the given handler is indeed still
    registered when executing _do_callbacks(). Alternatively one could cancel the
    timeout within off().
    Second, with the handler included in _callbacks[what] it is possible to receive
    event callbacks before the delayed "immediate callback" is actually invoked.
    This breaks the expectation the the "immediate callback" is the first callback.
    This problem is avoided by flagging the callback handler with ".immediate_pending"
    and dropping notifications that arrive before the "immediate_callback has executed".
    Note however that the effect of this dropped notification is not lost. The effects
    are taken into account when we calculate the "initial state" to be reported by the
    "immediate callback". Crucially, we do this not in the on() method, but when the
    delayed "immediate callback" actually is processed.
    */

    var on = function on(what, handler) {
        if (!handler || typeof handler !== "function") throw "Illegal handler";
        if (!_callbacks.hasOwnProperty(what)) throw "Unsupported event " + what;
        var index = _callbacks[what].indexOf(handler);
        if (index === -1) {
            // register handler
            _callbacks[what].push(handler);
            // flag handler
            handler['_immediate_pending_' + what] = true;
            // do immediate callback
            setTimeout(function () {
                switch (what) {
                    case 'readystatechange':
                        _do_callbacks("readystatechange", readystate.get(), handler);
                        break;
                }
            }, 0);
        }
        return self;
    };

    /**
     * deregisters a function on event
     * @method off
     * @param {string} what change || presence || readystatechange
     * @param {function} handler the function to call on event
     * @returns {Object} SharedState
     * @memberof SharedState
     */
    // unregister callback
    var off = function off(what, handler) {
        if (_callbacks[what] !== undefined) {
            var index = _callbacks[what].indexOf(handler);
            if (index > -1) {
                _callbacks[what].splice(index, 1);
            }
        }
        return self;
    };

    /**
     * Destroy the instance
     * After this method is called, the instance may no longer be used, other than further calls
     * to destroy().
     * The result of attempting to use the instance after destruction is undefined.
     * After destroy() has been called, further calls to destroy() have no effect.
     *
     * @method destroy
     * @memberof SharedState
     */
    var destroy = function destroy() {
        if (_connection) {
            _connection.close();
            _connection = null;
            readystate.set('closed');
            for (var prop in _callbacks) {
                _callbacks[prop].length = 0;
            }
        }
    };

    /* API functions --> */

    /* <!-- public */
    self.__defineGetter__("readyState", readystate.get);
    self.__defineGetter__("STATE", function () {
        return STATE;
    });

    self.getUserMapping = getUserMapping;
    self.getGroupMapping = getGroupMapping;

    self.on = on;
    self.off = off;

    self.destroy = destroy;

    /* public --> */

    _init();

    return self;
};

exports.default = MappingService;

