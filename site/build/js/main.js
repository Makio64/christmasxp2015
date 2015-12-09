(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Loop = (function () {
  function Loop() {
    _classCallCheck(this, Loop);

    this._idRAF = -1;
    this._count = 0;

    this._listeners = [];

    this._binds = {};
    this._binds.update = this._update.bind(this);
  }

  _createClass(Loop, [{
    key: "_update",
    value: function _update() {
      var listener = null;
      var i = this._count;
      while (--i >= 0) {
        listener = this._listeners[i];
        if (listener) {
          listener.apply(this, null);
        }
      }
      this._idRAF = requestAnimationFrame(this._binds.update);
    }
  }, {
    key: "start",
    value: function start() {
      this._update();
    }
  }, {
    key: "stop",
    value: function stop() {
      cancelAnimationFrame(this._idRAF);
    }
  }, {
    key: "add",
    value: function add(listener) {
      var idx = this._listeners.indexOf(listener);
      if (idx >= 0) {
        return;
      }
      this._listeners.push(listener);
      this._count++;
    }
  }, {
    key: "remove",
    value: function remove(listener) {
      var idx = this._listeners.indexOf(listener);
      if (idx < 0) {
        return;
      }
      this._listeners.splice(idx, 1);
      this._count--;
    }
  }]);

  return Loop;
})();

module.exports = new Loop();

},{}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var loop = require("fz/core/loop");
var stage = require("fz/core/stage");

var Pixi = (function () {
  function Pixi() {
    _classCallCheck(this, Pixi);

    var opts = {
      antialias: true,
      // resolution: stage.resolution,
      resolution: 2,
      // resolution: 1,
      transparent: true,
      backgroundColor: 0xe9e9e9
    };
    this.renderer = new PIXI.autoDetectRenderer(0, 0, opts);

    this.width = 0;
    this.height = 0;

    this.stage = new PIXI.Container();

    this.dom = this.renderer.view;

    this._binds = {};
    this._binds.onUpdate = this._onUpdate.bind(this);
    this._binds.onResize = this._onResize.bind(this);
  }

  _createClass(Pixi, [{
    key: "_onUpdate",
    value: function _onUpdate() {
      this.renderer.render(this.stage);
      // console.log( this.renderer.drawCount )
    }
  }, {
    key: "_onResize",
    value: function _onResize() {
      this.width = stage.width;
      this.height = stage.height;

      this.renderer.resize(this.width, this.height);
      this.renderer.view.style.width = this.width + "px";
      this.renderer.view.style.height = this.height + "px";
    }
  }, {
    key: "init",
    value: function init() {
      loop.add(this._binds.onUpdate);
      stage.on("resize", this._binds.onResize);
      this._onResize();
    }
  }]);

  return Pixi;
})();

module.exports = new Pixi();

},{"fz/core/loop":1,"fz/core/stage":3}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var timeout = require("fz/utils/timeout");
var Emitter = require("fz/events/Emitter");

var Stage = (function (_Emitter) {
  _inherits(Stage, _Emitter);

  function Stage() {
    _classCallCheck(this, Stage);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Stage).call(this));

    _this.width = 0;
    _this.height = 0;

    _this.resolution = window.devicePixelRatio;

    _this._binds = {};
    _this._binds.onResize = _this._onResize.bind(_this);
    _this._binds.update = _this._update.bind(_this);
    return _this;
  }

  _createClass(Stage, [{
    key: "_onResize",
    value: function _onResize() {
      timeout(this._binds.update, 10);
    }
  }, {
    key: "init",
    value: function init() {
      var andDispatch = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      window.addEventListener("resize", this._binds.onResize, false);
      window.addEventListener("orientationchange", this._binds.onResize, false);

      if (andDispatch) {
        this._update();
      }
    }
  }, {
    key: "_update",
    value: function _update() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.emit("resize");
    }
  }, {
    key: "forceResize",
    value: function forceResize() {
      var withDelay = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      if (withDelay) {
        this._onResize();
        return;
      }
      this._update();
    }
  }]);

  return Stage;
})(Emitter);

module.exports = new Stage();

},{"fz/events/Emitter":4,"fz/utils/timeout":10}],4:[function(require,module,exports){
'use strict';

/**
 * Expose `Emitter`.
 */

// module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function (event, fn) {
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function (event) {
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1),
      callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function (event) {
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function (event) {
  return !!this.listeners(event).length;
};

module.exports = Emitter;

},{}],5:[function(require,module,exports){
"use strict";

var browsers = require("fz/utils/browsers");

var downs = {};
var moves = {};
var ups = {};
var clicks = {};
var overs = {};
var outs = {};

var interactions = [downs, moves, ups, clicks];

var isTouchDevice = browsers.mobile || browsers.tablet;

function getEvent(action) {
  var evt = "";
  if (isTouchDevice) {

    if (window.navigator.msPointerEnabled) {
      switch (action) {
        case "down":
          evt = "MSPointerDown";break;
        case "move":
          evt = "MSPointerMove";break;
        case "up":
          evt = "MSPointerUp";break;
        case "click":
          evt = "MSPointerUp";break;
      }

      //console.log("evt", evt, action);
    } else {
        switch (action) {
          case "down":
            evt = "touchstart";break;
          case "move":
            evt = "touchmove";break;
          case "up":
            evt = "touchend";break;
          case "click":
            evt = "touchstart";break;
        }
      }
  } else {
    switch (action) {
      case "down":
        evt = "mousedown";break;
      case "move":
        evt = "mousemove";break;
      case "up":
        evt = "mouseup";break;
      case "click":
        evt = "click";break;
      case "over":
        evt = browsers.safari ? "mouseover" : "mouseenter";break;
      case "out":
        evt = browsers.safari ? "mouseout" : "mouseleave";break;
    }
  }
  return evt;
}

function getObj(action) {
  switch (action) {
    case "down":
      return downs;
    case "move":
      return moves;
    case "up":
      return ups;
    case "click":
      return clicks;
    case "over":
      return overs;
    case "out":
      return outs;
  }
}

function find(cb, datas) {
  var data = null;
  for (var i = 0, n = datas.length; i < n; i++) {
    data = datas[i];
    if (data.cb == cb) {
      return { data: data, idx: i };
    }
  }
  return null;
}

module.exports.on = function (elt, action, cb) {
  var evt = getEvent(action);
  if (evt == "") {
    return;
  }

  var obj = getObj(action);
  if (!obj[elt]) {
    obj[elt] = [];
  }

  var isOver = false;

  function proxy(e) {
    e = { x: 0, y: 0, origin: e };

    if (isTouchDevice) {

      if (window.navigator.msPointerEnabled) {
        // mspointerevents
        e.x = e.origin.clientX;
        e.y = e.origin.clientY;
      } else {
        var touch = e.origin.touches[0];
        if (touch) {
          e.x = touch.clientX;
          e.y = touch.clientY;
        }
      }
    } else {
      e.x = e.origin.clientX;
      e.y = e.origin.clientY;
    }

    cb.call(this, e);
  }

  obj[elt].push({ cb: cb, proxy: proxy });
  elt.addEventListener(evt, proxy, false);
};

module.exports.off = function (elt, action, cb) {
  var evt = getEvent(action);
  if (evt == "") {
    return;
  }

  var obj = getObj(action);
  if (!obj[elt]) {
    return;
  }

  var datas = obj[elt];
  if (cb) {
    var result = find(cb, datas);
    if (!result) {
      return;
    }
    elt.removeEventListener(evt, result.data.proxy, false);
    obj[elt].splice(result.idx, 1);
  } else {
    var data = null;
    for (var i = 0, n = datas.length; i < n; i++) {
      data = datas[i];
      elt.removeEventListener(evt, data.proxy, false);
    }
    obj[elt] = null;
    delete obj[elt];
  }
};

module.exports.has = function (elt, action, cb) {
  var evt = getEvent(action);
  if (evt == "") {
    return;
  }

  var obj = getObj(action);
  if (!obj[elt]) {
    return;
  }

  var datas = obj[elt];
  if (cb) {
    return true;
  }
  return false;
};

module.exports.unbind = function (elt) {
  for (var i = 0, n = interactions.length; i < n; i++) {
    interactions[i][elt] = null;
    delete interactions[i][elt];
  }
};

},{"fz/utils/browsers":6}],6:[function(require,module,exports){
'use strict';

/*!
 * Bowser - a browser detector
 * https://github.com/ded/bowser
 * MIT License | (c) Dustin Diaz 2015
 */

!(function (name, definition) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition();else if (typeof define == 'function' && define.amd) define(definition);else this[name] = definition();
})('bowser', function () {
    /**
     * See useragents.js for examples of navigator.userAgent
     */

    var t = true;

    function detect(ua) {

        function getFirstMatch(regex) {
            var match = ua.match(regex);
            return match && match.length > 1 && match[1] || '';
        }

        function getSecondMatch(regex) {
            var match = ua.match(regex);
            return match && match.length > 1 && match[2] || '';
        }

        var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase(),
            likeAndroid = /like android/i.test(ua),
            android = !likeAndroid && /android/i.test(ua),
            chromeBook = /CrOS/.test(ua),
            edgeVersion = getFirstMatch(/edge\/(\d+(\.\d+)?)/i),
            versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i),
            tablet = /tablet/i.test(ua),
            mobile = !tablet && /[^-]mobi/i.test(ua),
            result;

        if (/opera|opr/i.test(ua)) {
            result = {
                name: 'Opera',
                opera: t,
                version: versionIdentifier || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
            };
        } else if (/yabrowser/i.test(ua)) {
            result = {
                name: 'Yandex Browser',
                yandexbrowser: t,
                version: versionIdentifier || getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
            };
        } else if (/windows phone/i.test(ua)) {
            result = {
                name: 'Windows Phone',
                windowsphone: t
            };
            if (edgeVersion) {
                result.msedge = t;
                result.version = edgeVersion;
            } else {
                result.msie = t;
                result.version = getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i);
            }
        } else if (/msie|trident/i.test(ua)) {
            result = {
                name: 'Internet Explorer',
                msie: t,
                version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
            };
        } else if (chromeBook) {
            result = {
                name: 'Chrome',
                chromeBook: t,
                chrome: t,
                version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
            };
        } else if (/chrome.+? edge/i.test(ua)) {
            result = {
                name: 'Microsoft Edge',
                msedge: t,
                version: edgeVersion
            };
        } else if (/chrome|crios|crmo/i.test(ua)) {
            result = {
                name: 'Chrome',
                chrome: t,
                version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
            };
        } else if (iosdevice) {
            result = {
                name: iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
            };
            // WTF: version is not part of user agent in web apps
            if (versionIdentifier) {
                result.version = versionIdentifier;
            }
        } else if (/sailfish/i.test(ua)) {
            result = {
                name: 'Sailfish',
                sailfish: t,
                version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
            };
        } else if (/seamonkey\//i.test(ua)) {
            result = {
                name: 'SeaMonkey',
                seamonkey: t,
                version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
            };
        } else if (/firefox|iceweasel/i.test(ua)) {
            result = {
                name: 'Firefox',
                firefox: t,
                version: getFirstMatch(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)
            };
            if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
                result.firefoxos = t;
            }
        } else if (/silk/i.test(ua)) {
            result = {
                name: 'Amazon Silk',
                silk: t,
                version: getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
            };
        } else if (android) {
            result = {
                name: 'Android',
                version: versionIdentifier
            };
        } else if (/phantom/i.test(ua)) {
            result = {
                name: 'PhantomJS',
                phantom: t,
                version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
            };
        } else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
            result = {
                name: 'BlackBerry',
                blackberry: t,
                version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
            };
        } else if (/(web|hpw)os/i.test(ua)) {
            result = {
                name: 'WebOS',
                webos: t,
                version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
            };
            /touchpad\//i.test(ua) && (result.touchpad = t);
        } else if (/bada/i.test(ua)) {
            result = {
                name: 'Bada',
                bada: t,
                version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
            };
        } else if (/tizen/i.test(ua)) {
            result = {
                name: 'Tizen',
                tizen: t,
                version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
            };
        } else if (/safari/i.test(ua)) {
            result = {
                name: 'Safari',
                safari: t,
                version: versionIdentifier
            };
        } else {
            result = {
                name: getFirstMatch(/^(.*)\/(.*) /),
                version: getSecondMatch(/^(.*)\/(.*) /)
            };
        }

        // set webkit or gecko flag for browsers based on these engines
        if (!result.msedge && /(apple)?webkit/i.test(ua)) {
            result.name = result.name || "Webkit";
            result.webkit = t;
            if (!result.version && versionIdentifier) {
                result.version = versionIdentifier;
            }
        } else if (!result.opera && /gecko\//i.test(ua)) {
            result.name = result.name || "Gecko";
            result.gecko = t;
            result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i);
        }

        // set OS flags for platforms that have multiple browsers
        if (!result.msedge && (android || result.silk)) {
            result.android = t;
        } else if (iosdevice) {
            result[iosdevice] = t;
            result.ios = t;
        }

        // OS version extraction
        var osVersion = '';
        if (result.windowsphone) {
            osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
        } else if (iosdevice) {
            osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
            osVersion = osVersion.replace(/[_\s]/g, '.');
        } else if (android) {
            osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
        } else if (result.webos) {
            osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
        } else if (result.blackberry) {
            osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
        } else if (result.bada) {
            osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
        } else if (result.tizen) {
            osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
        }
        if (osVersion) {
            result.osversion = osVersion;
        }

        // device type extraction
        var osMajorVersion = osVersion.split('.')[0];
        if (tablet || iosdevice == 'ipad' || android && (osMajorVersion == 3 || osMajorVersion == 4 && !mobile) || result.silk) {
            result.tablet = t;
        } else if (mobile || iosdevice == 'iphone' || iosdevice == 'ipod' || android || result.blackberry || result.webos || result.bada) {
            result.mobile = t;
        }

        // Graded Browser Support
        // http://developer.yahoo.com/yui/articles/gbs
        if (result.msedge || result.msie && result.version >= 10 || result.yandexbrowser && result.version >= 15 || result.chrome && result.version >= 20 || result.firefox && result.version >= 20.0 || result.safari && result.version >= 6 || result.opera && result.version >= 10.0 || result.ios && result.osversion && result.osversion.split(".")[0] >= 6 || result.blackberry && result.version >= 10.1) {
            result.a = t;
        } else if (result.msie && result.version < 10 || result.chrome && result.version < 20 || result.firefox && result.version < 20.0 || result.safari && result.version < 6 || result.opera && result.version < 10.0 || result.ios && result.osversion && result.osversion.split(".")[0] < 6) {
            result.c = t;
        } else result.x = t;

        return result;
    }

    var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent : '');

    bowser.test = function (browserList) {
        for (var i = 0; i < browserList.length; ++i) {
            var browserItem = browserList[i];
            if (typeof browserItem === 'string') {
                if (browserItem in bowser) {
                    return true;
                }
            }
        }
        return false;
    };

    /*
     * Set our detect method to the main bowser object so we can
     * reuse it to test other user agents.
     * This is needed to implement future tests.
     */
    bowser._detect = detect;

    return bowser;
});

},{}],7:[function(require,module,exports){
"use strict";

module.exports.fit = function (wImg, hImg, wHolder, hHolder) {
  var sw = wImg / wHolder;
  var sh = hImg / hHolder;

  var ratio = 0;
  if (sw > sh) {
    ratio = sh;
  } else {
    ratio = sw;
  }
  ratio = 1 / ratio;

  var w = wImg * ratio;
  var h = hImg * ratio;
  var x = wHolder - w >> 1;
  var y = hHolder - h >> 1;

  return { x: x, y: y, width: w, height: h };
};

},{}],8:[function(require,module,exports){
"use strict";

module.exports.clamp = function (value, min, max) {
  return Math.max(min, Math.min(value, max));
};

},{}],9:[function(require,module,exports){
"use strict";

module.exports = (function () {

  var perf = window && window.performance;
  if (perf && perf.now) {
    return perf.now.bind(perf);
  } else {
    return function () {
      return new Date().getTime();
    };
  }
})();

},{}],10:[function(require,module,exports){
"use strict";

// bigup kewah

var now = require("fz/utils/now");

module.exports = function (fn, delay) {
  var start = now();

  function lp() {
    if (now() - start >= delay) {
      fn.call();
    } else {
      data.id = requestAnimationFrame(lp);
    }
  }

  var data = {};
  data.id = requestAnimationFrame(lp);

  return data;
};

module.exports.clear = function (data) {
  if (data) {
    cancelAnimationFrame(data.id);
  }
};

},{"fz/utils/now":9}],11:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var Emitter = require("fz/events/Emitter");

var Loader = (function (_Emitter) {
  _inherits(Loader, _Emitter);

  function Loader() {
    _classCallCheck(this, Loader);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Loader).call(this));

    _this._countComplete = 0;

    // this._pxLoader = new PxLoader()
    // this._pxLoader.addFont( config.fonts.medium )
    // this._pxLoader.addFont( config.fonts.bold )

    _this._pixiLoader = new PIXI.loaders.Loader();
    _this._pixiLoader.add("img/default.jpg");
    _this._pixiLoader.add("img/sprites/sprites.json");
    _this._pixiLoader.add("img/sprites/roboto_regular.fnt");
    _this._pixiLoader.add("img/sprites/roboto_medium.fnt");

    _this._loaderOfLoader = new PIXI.loaders.Loader();
    _this._loaderOfLoader.add("img/logo.png");
    _this._loaderOfLoader.add("img/sprites/advent_bold.fnt");

    _this._binds = {};
    _this._binds.onProgress = _this._onProgress.bind(_this);
    _this._binds.onPixiComplete = _this._onPixiComplete.bind(_this);
    _this._binds.onLoaderOfLoaderComplete = _this._onLoaderOfLoaderComplete.bind(_this);
    return _this;
  }

  _createClass(Loader, [{
    key: "_onProgress",
    value: function _onProgress(e) {
      console.log(e.completedCount, e.totalCount, e.completedCount / e.totalCount);
      // this.emit( "progress", e.completedCount / e.totalCount )
    }
  }, {
    key: "_onPixiComplete",
    value: function _onPixiComplete() {
      this.emit("complete");
    }
  }, {
    key: "_onLoaderOfLoaderComplete",
    value: function _onLoaderOfLoaderComplete() {
      this.emit("ready");

      this._pixiLoader.once("complete", this._binds.onPixiComplete);
      this._pixiLoader.load();
    }
  }, {
    key: "load",
    value: function load() {
      var _this2 = this;

      // this._pxLoader.addProgressListener( this._binds.onProgress )
      // this._pxLoader.start()

      this.loadConfig(function () {
        console.log('load');
        _this2._addImages();
        _this2._loaderOfLoader.once("complete", _this2._binds.onLoaderOfLoaderComplete);
        _this2._loaderOfLoader.load();
      });
    }
  }, {
    key: "loadConfig",
    value: function loadConfig(cb) {
      var _this3 = this;

      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open("GET", "/xp.json?" + (Math.random() * 10000 >> 0), true); // Replace 'my_data' with the path to your file
      xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          _this3._countComplete++;
          config.data = JSON.parse(xobj.responseText);
          if (cb) cb();
        }
      };
      xobj.send(null);
    }
  }, {
    key: "_addImages",
    value: function _addImages() {
      var idx = "";
      var j = 0;
      var m = 0;
      var data = null;
      var dataEntry = null;
      var n = config.data.totalDay;
      for (var i = 0; i < n; i++) {
        data = config.data.days[i + 1];
        m = data.length;
        idx = "" + (i + 1);
        if (i < 10) {
          idx = "0" + idx;
        }
        for (j = 0; j < m; j++) {
          dataEntry = data[j];
          dataEntry.path = "./" + idx + dataEntry.folder;
          dataEntry.pathPreview = dataEntry.path + "preview.jpg";
          this._pixiLoader.add(dataEntry.pathPreview);
        }
      }
    }
  }]);

  return Loader;
})(Emitter);

module.exports = new Loader();

},{"fz/events/Emitter":4,"xmas/core/config":15}],12:[function(require,module,exports){
"use strict";

var Xmas = require("xmas/Xmas");
var xmas = new Xmas();

},{"xmas/Xmas":13}],13:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Home = require("xmas/home/Home");
var About = require("xmas/about/About");
var XPView = require("xmas/xpview/XPView");
var Ui = require("xmas/ui/Ui");
var scrollEmul = require("xmas/core/scrollEmul");

var loop = require("fz/core/loop");
var stage = require("fz/core/stage");
var pixi = require("fz/core/pixi");
var Storyline = require("xmas/ui/Storyline");
var cookie = require("xmas/utils/cookie");
var loader = require("loader");

var Xmas = (function () {
  function Xmas() {
    _classCallCheck(this, Xmas);

    this.current = null;
    this.home = null;
    this.xp = null;
    this.status = "notLoaded";

    this.onChange = this.onChange.bind(this);
    this.onHome = this.onHome.bind(this);
    this.onIntro = this.onIntro.bind(this);
    this.onAbout = this.onAbout.bind(this);
    this.onXP = this.onXP.bind(this);
    this.onStart = this.onStart.bind(this);

    // page( "/home", this.onChange, this.onHome )
    // page( "/intro", this.onIntro, this.onIntro )
    page("/about", this.onChange, this.onAbout);
    page("/xps/:day/:name/", this.onXP);
    page("/", this.onStart);
    page();
  }

  _createClass(Xmas, [{
    key: "onStart",
    value: function onStart() {
      console.log('test');
      if (cookie.getCookie("intro") == "") {
        console.log('intro');
        cookie.createCookie("intro", Date.now(), 1);
        // page("/intro")
        this.onIntro();
      } else {
        console.log('home');
        // page("/home")
        this.onHome();
      }
    }
  }, {
    key: "onChange",
    value: function onChange(ctx, next) {
      if (this.current) {
        this.current.unbindEvents();
        this.current.hide(next);
      } else {
        next();
      }
    }
  }, {
    key: "onIntro",
    value: function onIntro() {
      if (this.status != "loaded") {
        this.init(this.onIntro);
        return;
      }
      var storyline = new Storyline();
      storyline.x = window.innerWidth / 2 - 200;
      storyline.y = window.innerHeight / 2;
      storyline.show(.6);
      storyline.hide(2.7);
      pixi.stage.addChild(storyline);
      TweenLite.set(this, { delay: 3.4, onComplete: function onComplete() {
          page("/home");
        } });
    }
  }, {
    key: "onHome",
    value: function onHome() {
      if (this.status != "loaded") {
        this.init(this.onHome);
      } else {
        if (!this.home) this.home = new Home();
        this.current = this.home;
        this.displayCurrent();
      }
    }
  }, {
    key: "onAbout",
    value: function onAbout() {
      if (this.status != "loaded") {
        this.init(this.onAbout);
      } else {
        if (!this.about) this.about = new About();
        this.current = this.about;
        this.displayCurrent();
      }
    }
  }, {
    key: "onXP",
    value: function onXP(e) {
      var _this = this;

      if (!this.xp) {
        if (this.status == "notLoaded") {
          loader.loadConfig(function () {
            _this.xp = new XPView();
            _this.current = _this.xp;
            _this.current.bindEvents();
            _this.current.show(e.params.day, e.params.name);
          });
          return;
        } else {
          this.xp = new XPView();
        }
      }
      this.current = this.xp;
      this.current.bindEvents();
      this.current.show(e.params.day, e.params.name);
    }
  }, {
    key: "displayCurrent",
    value: function displayCurrent() {
      this.current.bindEvents();
      this.current.show();
    }
  }, {
    key: "init",
    value: function init(cb) {
      var _this2 = this;

      if (this.status == "loading") {
        return;
      } else if (this.status == "loaded") {
        cb();
        return;
      }

      this.status = "loading";
      stage.init();
      pixi.init();

      var ui = null;
      loader.on("ready", function () {
        ui = new Ui();
        ui.bindEvents();
        ui.showLoading();
      });
      loader.on("complete", function () {
        _this2.status = "loaded";
        ui.hideLoading();
        ui.showBts();
      });
      loader.load();
      loop.start();
      scrollEmul.bindElements();
      scrollEmul.bindEvents();
      document.getElementById("main").appendChild(pixi.dom);
    }
  }]);

  return Xmas;
})();

module.exports = Xmas;

},{"fz/core/loop":1,"fz/core/pixi":2,"fz/core/stage":3,"loader":11,"xmas/about/About":14,"xmas/core/scrollEmul":16,"xmas/home/Home":17,"xmas/ui/Storyline":28,"xmas/ui/Ui":30,"xmas/utils/cookie":31,"xmas/xpview/XPView":33}],14:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var About = (function () {
  function About() {
    _classCallCheck(this, About);
  }

  _createClass(About, [{
    key: "bindEvents",
    value: function bindEvents() {}
  }, {
    key: "unbindEvents",
    value: function unbindEvents() {}
  }, {
    key: "show",
    value: function show() {}
  }, {
    key: "hide",
    value: function hide(cb) {
      cb();
    }
  }]);

  return About;
})();

module.exports = About;

},{}],15:[function(require,module,exports){
"use strict";

var config = {};

config.fonts = {
  regular: "Roboto Regular",
  medium: "Roboto Medium",
  bold: "Advent Pro"
};

config.colors = {
  red: 0xff5864,
  blue: 0x3e67ff
};

config.sizes = {
  entry: {
    // w: 139,
    // h: 160
    w: 210,
    h: 240
  }
};

config.data = null;

module.exports = config;

},{}],16:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Emitter = require("fz/events/Emitter");

var ScrollEmul = (function (_Emitter) {
  _inherits(ScrollEmul, _Emitter);

  function ScrollEmul() {
    _classCallCheck(this, ScrollEmul);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ScrollEmul).call(this));

    _this._binds = {};
    _this._binds.onScroll = _this._onScroll.bind(_this);
    return _this;
  }

  _createClass(ScrollEmul, [{
    key: "_onScroll",
    value: function _onScroll() {
      this._yTo = window.pageYOffset;
      this.emit("change", this._yTo);
    }
  }, {
    key: "bindElements",
    value: function bindElements() {
      this._domEmul = document.getElementById("scroll-emul");
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      document.addEventListener("DOMMouseScroll", this._binds.onScroll);
      document.addEventListener("mousewheel", this._binds.onScroll);
      document.addEventListener("scroll", this._binds.onScroll);
    }
  }, {
    key: "setHeight",
    value: function setHeight(value) {
      console.log(value);
      if (!this._domEmul) return;
      this._domEmul.style.height = value + "px";
    }
  }, {
    key: "reset",
    value: function reset() {
      window.scroll(0, 0);
      if (!this._domEmul) return;
      this._domEmul.style.height = "0px";
    }
  }]);

  return ScrollEmul;
})(Emitter);

module.exports = new ScrollEmul();

},{"fz/events/Emitter":4}],17:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var stage = require("fz/core/stage");
var pixi = require("fz/core/pixi");
var loop = require("fz/core/loop");
var interactions = require("fz/events/interactions");
var browsers = require("fz/utils/browsers");
var uMaths = require("fz/utils/maths");
var Line = require("xmas/home/Line");
var scrollEmul = require("xmas/core/scrollEmul");

var Home = (function (_PIXI$Container) {
  _inherits(Home, _PIXI$Container);

  function Home() {
    _classCallCheck(this, Home);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Home).call(this));

    _this._idx = 0;
    _this._idxToHide = 0;

    _this._isShown = false;

    _this._yLast = 0;

    _this._hLine = config.sizes.entry.h + 75;

    if (browsers.mobile) {
      _this.scale.set(.7, .7);
    }

    _this._yMin = 0;
    _this._yMax = 205;
    _this._yTo = _this._yMax;
    scrollEmul.setHeight(_this._yMin);

    _this._cntLines = new PIXI.Container();
    _this._cntLines.y = _this._yTo;
    _this.addChild(_this._cntLines);

    _this._createLines();

    _this._binds = {};
    _this._binds.onResize = _this._onResize.bind(_this);
    // this._binds.onMouseScroll = this._onMouseScroll.bind( this )
    _this._binds.onTouchDown = _this._onTouchDown.bind(_this);
    _this._binds.onTouchMove = _this._onTouchMove.bind(_this);
    _this._binds.onTouchUp = _this._onTouchUp.bind(_this);
    _this._binds.onScroll = _this._onScroll.bind(_this);
    _this._binds.onUpdate = _this._onUpdate.bind(_this);
    return _this;
  }

  _createClass(Home, [{
    key: "_onTouchDown",
    value: function _onTouchDown(e) {
      this._yLast = e.y;
    }
  }, {
    key: "_onTouchMove",
    value: function _onTouchMove(e) {
      var dy = e.y - this._yLast;
      this._yTo += dy;
      this._yTo = uMaths.clamp(this._yTo, this._yMin + this._hLine + 50, this._yMax);
      this._yLast = e.y;
    }
  }, {
    key: "_onTouchUp",
    value: function _onTouchUp(e) {}
  }, {
    key: "_onResize",
    value: function _onResize() {
      // let w = 980
      // if( stage.width < 1000 ) {
      // w = 880
      // }
      var w = 1320;
      this._cntLines.x = stage.width - w >> 1;
      if (browsers.tablet || browsers.mobile) {
        this._cntLines.x = 10;
        this._yMin = -26 * this._hLine + stage.height;
      } else {
        this._yMin = -26 * this._hLine - this._yMax;
        scrollEmul.setHeight(-this._yMin);
      }

      this._countLinesVisible = Math.ceil((stage.height - this._yMax) / this._hLine);
      this._countLinesVisible += 1;

      this._updateVisibles();
    }

    // _onMouseScroll( e ) {
    //   e.preventDefault()

    //   this._isDragDrop = false
    //   this._yTo += -e.deltaY * .4
    //   this._yTo = uMaths.clamp( this._yTo, this._yMin, this._yMax )
    // }

  }, {
    key: "_onScroll",
    value: function _onScroll(yTo) {
      this._isDragDrop = false;
      this._yTo = -yTo + this._yMax;
      // this._yTo = uMaths.clamp( this._yTo, this._yMin, this._yMax )
    }
  }, {
    key: "_onUpdate",
    value: function _onUpdate() {
      var dy = this._yTo - this._cntLines.y;
      this._cntLines.y += dy * .25;

      var idxToHide = -((this._cntLines.y - this._hLine * .5 - 25 - this._yMax) / this._hLine >> 0);
      if (idxToHide != this._idxToHide) {
        if (this._idxToHide < idxToHide) {
          this._hideLine(idxToHide);
        } else {
          this._showLine(idxToHide, true);
        }
        this._idxToHide = idxToHide;
      }

      var idx = -(this._cntLines.y - this._yMax) / this._hLine >> 0;
      if (idx != this._idx) {
        this._idx = idx;
        this._updateVisibles();
      }
    }
  }, {
    key: "_hideLine",
    value: function _hideLine(idx) {
      this._lines[idx - 1].hide();
      // TweenLite.to( this._lines[ idx - 1 ], .6, {
      //   alpha: 0,
      //   ease: Quart.easeInOut
      // })
    }
  }, {
    key: "_showLine",
    value: function _showLine(idx, fast) {
      this._lines[idx].show(0, fast);
      // TweenLite.to( this._lines[ idx ], .6, {
      //   alpha: 1,
      //   ease: Quart.easeInOut
      // })
    }
  }, {
    key: "_updateVisibles",
    value: function _updateVisibles() {
      var line = null;
      var start = this._idx - 1;
      var end = this._idx + this._countLinesVisible;
      for (var i = 0; i < 25; i++) {
        line = this._lines[i];
        if (i >= start && i < end) {
          if (!line.parent) {
            line.bindEvents();
            this._cntLines.addChild(line);
            if (this._isShown && !line.isShown && (i == start || i == end - 1)) {
              line.show(.2, true);
            }
          }
        } else {
          if (line.parent) {
            line.unbindEvents();
            this._cntLines.removeChild(line);
          }
        }
      }
    }
  }, {
    key: "_createLines",
    value: function _createLines() {
      var tmpData = [4, 3];

      var yAdd = this._hLine;

      this._lines = [];
      var line = null;

      var py = 0;
      var i = 0;
      var n = tmpData.length;
      for (; i < n; i++) {
        line = new Line(i + 1, tmpData[i]);
        line.y = py;
        this._lines.push(line);
        // this._cntLines.addChild( line )

        py += yAdd;
      }

      for (i = n; i < 25; i++) {
        line = new Line(i + 1);
        line.y = py;
        this._lines.push(line);
        // this._cntLines.addChild( line )

        py += yAdd;
      }
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      stage.on("resize", this._binds.onResize);
      this._onResize();

      if (browsers.mobile || browsers.tablet) {
        interactions.on(document.body, "down", this._binds.onTouchDown);
        interactions.on(document.body, "move", this._binds.onTouchMove);
        interactions.on(document.body, "up", this._binds.onTouchUp);
      } else {
        scrollEmul.on("change", this._binds.onScroll);
      }

      // window.addEventListener( "mousewheel", this._binds.onMouseScroll, false )

      loop.add(this._binds.onUpdate);
    }
  }, {
    key: "unbindEvents",
    value: function unbindEvents() {
      stage.off("resize", this._binds.onResize);

      if (browsers.mobile || browsers.tablet) {
        interactions.off(document.body, "down", this._binds.onTouchDown);
        interactions.off(document.body, "move", this._binds.onTouchMove);
        interactions.off(document.body, "up", this._binds.onTouchUp);
      } else {
        scrollEmul.off("change", this._binds.onScroll);
      }

      // window.removeEventListener( "mousewheel", this._binds.onMouseScroll, false )

      loop.remove(this._binds.onUpdate);
    }
  }, {
    key: "show",
    value: function show() {
      this._isShown = true;

      pixi.stage.addChildAt(this, 0);

      var n = this._lines.length;
      for (var i = 0; i < this._countLinesVisible; i++) {
        this._lines[i].show(i * .08);
      }

      TweenLite.set(this, {
        delay: 2,
        onComplete: this.bindEvents.bind(this)
      });

      this._onResize();
    }
  }, {
    key: "hide",
    value: function hide(cb) {
      pixi.stage.removeChild(this);
      cb();
    }
  }]);

  return Home;
})(PIXI.Container);

module.exports = Home;

},{"fz/core/loop":1,"fz/core/pixi":2,"fz/core/stage":3,"fz/events/interactions":5,"fz/utils/browsers":6,"fz/utils/maths":8,"xmas/core/config":15,"xmas/core/scrollEmul":16,"xmas/home/Line":18}],18:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var Entry = require("xmas/home/entry/Entry");
var uXmasTexts = require("xmas/utils/texts");

var Line = (function (_PIXI$Container) {
  _inherits(Line, _PIXI$Container);

  function Line(idx) {
    var count = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    _classCallCheck(this, Line);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Line).call(this));

    _this._idx = idx;
    _this._dataEntries = config.data.days[_this._idx];
    _this._count = _this._dataEntries ? _this._dataEntries.length : 0;

    _this.isShown = false;

    _this._createTitle();

    _this._cntEntries = new PIXI.Container();
    _this._cntEntries.x = 218;
    _this.addChild(_this._cntEntries);
    if (_this._count > 0) {
      _this._createEntries();
    } else {
      _this._createDummy();
    }
    return _this;
  }

  _createClass(Line, [{
    key: "_createTitle",
    value: function _createTitle() {
      this._cntTitle = new PIXI.Container();
      this._cntTitle.x = 35;
      this._cntTitle.y = 60;

      var cntLeft = new PIXI.Container();
      cntLeft.y = 31;
      this._cntTitle.addChild(cntLeft);

      if (this._idx == 1) {
        this._cntTfDay = uXmasTexts.create("DAY", { font: "30px " + config.fonts.bold, fill: config.colors.red }, 1);
        this._cntTfDay.alpha = 0;
        cntLeft.addChild(this._cntTfDay);
      }

      this._line = new PIXI.Graphics();
      this._line.x = 30;
      this._line.y = 39;
      this._line.lineStyle(1, config.colors.blue);
      this._line.moveTo(-30, 0);
      this._line.lineTo(0, 0);
      this._line.scale.x = 0;
      cntLeft.addChild(this._line);

      this._cntTfNumber = uXmasTexts.create(this._idx + "", { font: "180px " + config.fonts.bold, fill: config.colors.red });
      this._cntTfNumber.x = 54;
      this._cntTfNumber.alpha = 0;
      this._cntTitle.addChild(this._cntTfNumber);

      this.addChild(this._cntTitle);
    }
  }, {
    key: "_createEntries",
    value: function _createEntries() {
      var as = [0, Math.PI * .5, 0, Math.PI * .5];

      var px = 0;
      var yTime = 0;
      var entry = null;
      for (var i = 0; i < this._count; i++) {
        entry = new Entry(i + 1, this._dataEntries[i]);
        entry.x += px;
        entry.y = Math.sin(as[i]) * 38 >> 0;
        this._cntEntries.addChild(entry);

        px += config.sizes.entry.w + 60;

        yTime += Math.PI * .75;
      }
    }
  }, {
    key: "_createDummy",
    value: function _createDummy() {
      var entry = new Entry();
      this._cntEntries.addChild(entry);
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var n = this._cntEntries.children.length;
      for (var i = 0; i < n; i++) {
        this._cntEntries.children[i].bindEvents();
      }
    }
  }, {
    key: "unbindEvents",
    value: function unbindEvents() {
      var n = this._cntEntries.children.length;
      for (var i = 0; i < n; i++) {
        this._cntEntries.children[i].unbindEvents();
      }
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var fast = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (this.isShown) {
        return;
      }
      this.isShown = true;

      var timing = fast ? .6 : .8;

      if (this._idx == 1) {
        var letter = null;
        var n = this._cntTfDay.children.length;
        for (var i = 0; i < n; i++) {
          letter = this._cntTfDay.children[i];
          letter.alpha = 0;
          TweenLite.to(letter, timing, {
            delay: delay + .1 + (n - i) * .1,
            alpha: 1,
            ease: Cubic.easeInOut
          });
        }
        TweenLite.set(this._cntTfDay, {
          delay: delay + .04,
          alpha: 1
        });
      }
      TweenLite.to(this._line.scale, timing, {
        delay: delay + .04,
        x: 1,
        ease: Cubic.easeInOut
      });

      TweenLite.to(this._cntTfNumber, timing, {
        delay: delay,
        alpha: 1,
        ease: Cubic.easeInOut
      });

      this._showEntries(delay + .3 * (fast ? .5 : 1), fast);
    }
  }, {
    key: "_showEntries",
    value: function _showEntries(delay, fast) {
      var d = 0;
      var dAdd = .06;
      var dMin = .01;
      var dFriction = .85;

      var entry = null;
      var n = this._cntEntries.children.length;
      for (var i = 0; i < n; i++) {
        entry = this._cntEntries.children[i];
        entry.show(delay + d, fast);

        d += dAdd;
        dAdd *= dFriction;
        if (dAdd < dMin) {
          dAdd = dMin;
        }
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      if (!this.isShown) {
        return;
      }
      this.isShown = false;

      if (this._idx == 1) {
        var letter = null;
        var _n = this._cntTfDay.children.length;
        for (var i = 0; i < _n; i++) {
          letter = this._cntTfDay.children[i];
          // letter.alpha = 0
          TweenLite.to(letter, .4, {
            delay: delay + .1 + (_n - i) * .1,
            alpha: 0,
            ease: Cubic.easeInOut
          });
        }
        // TweenLite.set( this._cntTfDay, {
        //   delay: delay + 1,
        //   alpha: 0,
        // })
      }
      TweenLite.to(this._line.scale, .6, {
        delay: delay + .04,
        x: 0,
        ease: Cubic.easeInOut
      });

      TweenLite.to(this._cntTfNumber, .6, {
        delay: delay,
        alpha: 0,
        ease: Cubic.easeInOut
      });

      var d = 0;
      var dAdd = .06;
      var dMin = .01;
      var dFriction = .85;

      var entry = null;
      var n = this._cntEntries.children.length;
      for (var i = 0; i < n; i++) {
        entry = this._cntEntries.children[i];
        entry.hide(delay + d);

        d += dAdd;
        dAdd *= dFriction;
        if (dAdd < dMin) {
          dAdd = dMin;
        }
      }
    }
  }]);

  return Line;
})(PIXI.Container);

module.exports = Line;

},{"xmas/core/config":15,"xmas/home/entry/Entry":19,"xmas/utils/texts":32}],19:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var timeout = require("fz/utils/timeout");

var config = require("xmas/core/config");

var EntryContentPreview = require("xmas/home/entry/EntryContentPreview");
var EntryNumber = require("xmas/home/entry/EntryNumber");
var EntryComingSoon = require("xmas/home/entry/EntryComingSoon");
var EntrySmiley = require("xmas/home/entry/EntrySmiley");

var Entry = (function (_PIXI$Container) {
  _inherits(Entry, _PIXI$Container);

  function Entry() {
    var idx = arguments.length <= 0 || arguments[0] === undefined ? -1 : arguments[0];
    var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, Entry);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Entry).call(this));

    _this._data = data;

    _this._isShown = false;

    if (idx >= 0) {
      _this._content = new EntryContentPreview(data);
      _this.addChild(_this._content);

      _this._circle = new EntryNumber(idx);
      _this._circle.x = config.sizes.entry.w;
      _this._circle.y = config.sizes.entry.h - 55;
      _this.addChild(_this._circle);
    } else {
      _this._content = new EntryComingSoon();
      _this.addChild(_this._content);

      _this._circle = new EntrySmiley();
      _this._circle.x = config.sizes.entry.w;
      _this._circle.y = config.sizes.entry.h - 55;
      _this.addChild(_this._circle);
    }

    _this._binds = {};
    _this._binds.onMouseOver = _this._onMouseOver.bind(_this);
    _this._binds.onMouseOut = _this._onMouseOut.bind(_this);
    _this._binds.onClick = _this._onClick.bind(_this);
    return _this;
  }

  _createClass(Entry, [{
    key: "_onMouseOver",
    value: function _onMouseOver() {
      if (!this._isShown) {
        return;
      }
      if (this._content.over) {
        this._content.over();
      }
      if (this._circle.over) {
        this._circle.over();
      }
    }
  }, {
    key: "_onMouseOut",
    value: function _onMouseOut() {
      if (!this._isShown) {
        return;
      }

      if (this._content.out) {
        this._content.out();
      }
      if (this._circle.out) {
        this._circle.out();
      }
    }
  }, {
    key: "_onClick",
    value: function _onClick() {
      page("/xps" + this._data.path.replace("./", "/"));
    }
  }, {
    key: "show",
    value: function show() {
      var _this2 = this;

      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var fast = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      this._content.show(delay, fast);
      this._circle.show(delay + (.5 + Math.random() * .45) * (fast ? .5 : 1), fast);

      timeout(function () {
        _this2._isShown = true;
      }, delay * 1000 + 1200);
      // this._circle.x = 113
      // TweenLite.to( this._circle, .6, {
      //   delay: delay + .3,
      //   x: 133,
      //   ease: Quart.easeOut,
      //   onComplete: () => {
      //     this._isShown = true
      //   }
      // })
    }
  }, {
    key: "hide",
    value: function hide() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      this._content.hide(delay + .1);
      this._circle.hide(delay);
      this._isShown = false;
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      if (this._content.hoverZone) {
        this._content.hoverZone.interactive = true;
        this._content.hoverZone.buttonMode = true;

        this._content.hoverZone.on("mouseover", this._binds.onMouseOver);
        this._content.hoverZone.on("mouseout", this._binds.onMouseOut);
        this._content.hoverZone.on("click", this._binds.onClick);
        this._content.hoverZone.on("touchend", this._binds.onClick);
      }
    }
  }, {
    key: "unbindEvents",
    value: function unbindEvents() {
      if (this._content.hoverZone) {
        this._content.hoverZone.interactive = false;
        this._content.hoverZone.buttonMode = false;

        this._content.hoverZone.off("mouseover", this._binds.onMouseOver);
        this._content.hoverZone.off("mouseout", this._binds.onMouseOut);
        this._content.hoverZone.off("click", this._binds.onClick);
        this._content.hoverZone.off("touchend", this._binds.onClick);
      }
    }
  }]);

  return Entry;
})(PIXI.Container);

module.exports = Entry;

},{"fz/utils/timeout":10,"xmas/core/config":15,"xmas/home/entry/EntryComingSoon":20,"xmas/home/entry/EntryContentPreview":21,"xmas/home/entry/EntryNumber":22,"xmas/home/entry/EntrySmiley":23}],20:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var pixi = require("fz/core/pixi");
var stage = require("fz/core/stage");
var config = require("xmas/core/config");
var PolyShape = require("xmas/home/entry/PolyShape");
var uXmasTexts = require("xmas/utils/texts");

var EntryComingSoon = (function (_PIXI$Container) {
  _inherits(EntryComingSoon, _PIXI$Container);

  function EntryComingSoon() {
    _classCallCheck(this, EntryComingSoon);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EntryComingSoon).call(this));

    _this._layer = new PIXI.Sprite(PIXI.Texture.fromFrame("layer-blue.png"));
    _this.addChild(_this._layer);

    _this._cntContent = _this._createContent();
    _this._cntContent.y = config.sizes.entry.h - _this._cntContent.height >> 1;
    _this._cntContent.alpha = 0;
    _this.addChild(_this._cntContent);

    _this._polyShape = new PolyShape();
    _this._polyShape.x = config.sizes.entry.w >> 1;
    _this._polyShape.y = config.sizes.entry.h >> 1;
    _this._polyShape.scale.x = _this._polyShape.scale.y = 0;
    _this.addChild(_this._polyShape);

    _this.mask = _this._polyShape;
    return _this;
  }

  _createClass(EntryComingSoon, [{
    key: "_createContent",
    value: function _createContent() {
      var cnt = new PIXI.Container();

      var tfTmp = uXmasTexts.create("more fun", { font: "45px " + config.fonts.bold, fill: config.colors.red });
      var tex = tfTmp.generateTexture(pixi.renderer, stage.resolution);
      this._cntTfTop = new PIXI.Sprite(tex);
      this._cntTfTop.x = config.sizes.entry.w - this._cntTfTop.width >> 1;
      cnt.addChild(this._cntTfTop);

      tfTmp = uXmasTexts.create("coming soon", { font: "45px " + config.fonts.bold, fill: config.colors.red });
      tex = tfTmp.generateTexture(pixi.renderer, stage.resolution);
      this._cntTfBottom = new PIXI.Sprite(tex);
      this._cntTfBottom.x = config.sizes.entry.w - this._cntTfBottom.width >> 1;
      this._cntTfBottom.y = 32;
      cnt.addChild(this._cntTfBottom);

      return cnt;
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var fast = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      // this.x = -60
      // this.y = 40
      // TweenLite.to( this, .7, {
      //   delay: delay,
      //   x: 0,
      //   y: 0,
      //   ease: Cubic.easeOut
      // // })
      // TweenLite.to( this._polyShape.scale, .2, {
      //   delay: delay,
      //   x: 0.3,
      //   y: 0.3,
      //   ease: Sine.easeIn,
      // } )
      // TweenLite.set( this._polyShape.scale, {
      //   delay: delay + .2,
      //   x: .6,
      //   y: .6
      // } )
      // TweenLite.to( this._polyShape.scale, .6, {
      //   delay: delay + .2,
      //   x: 1,
      //   y: 1,
      //   ease: Cubic.easeOut,
      // } )

      var timing = fast ? .4 : .8;

      TweenLite.to(this._polyShape.scale, timing, {
        delay: delay, // + .25,
        x: 1,
        y: 1,
        ease: fast ? Quart.easeOut : Quart.easeInOut
      });

      var px = config.sizes.entry.w - this._cntTfTop.width >> 1;
      px -= 20;
      this._cntTfTop.x = px;
      this._cntTfTop.alpha = 0;
      TweenLite.set(this._cntTfTop, {
        delay: delay + .3,
        alpha: .7
      });
      TweenLite.to(this._cntTfTop, timing, {
        delay: delay + .3,
        x: px + 20,
        alpha: 1,
        ease: Cubic.easeOut
      });

      px = config.sizes.entry.w - this._cntTfBottom.width >> 1;
      px -= 25;
      this._cntTfBottom.x = px;
      this._cntTfBottom.alpha = 0;
      TweenLite.set(this._cntTfBottom, {
        delay: delay + .375,
        alpha: .7
      });
      TweenLite.to(this._cntTfBottom, timing, {
        delay: delay + .375,
        x: px + 25,
        alpha: 1,
        ease: Cubic.easeOut
      });

      // let letter = null

      // let d = .4
      // let dAdd = .02
      // let dMin = .01
      // let dFriction = .89

      // let i = this._cntTfTop.children.length
      // while( --i > -1 ) {
      //   letter = this._cntTfTop.children[ i ]
      //   letter.x = letter.xBase - 25 >> 0
      //   letter.alpha = 0
      //   TweenLite.set( letter, {
      //     delay: delay + d,
      //     alpha: .8
      //   })
      //   TweenLite.to( letter, .4, {
      //     delay: delay + d,
      //     x: letter.xBase >> 0,
      //     alpha: 1,
      //     ease: Cubic.easeInOut
      //   })

      //   d += dAdd
      //   dAdd *= dFriction
      //   if( dAdd < dMin ) {
      //     dAdd = dMin
      //   }
      // }

      // d = .6
      // dAdd = .04

      // i = this._cntTfBottom.children.length
      // while( --i > -1 ) {
      //   letter = this._cntTfBottom.children[ i ]
      //   letter.x = letter.xBase - 25 >> 0
      //   letter.alpha = 0
      //   TweenLite.set( letter, {
      //     delay: delay + d,
      //     alpha: .8
      //   })
      //   TweenLite.to( letter, .4, {
      //     delay: delay + d,
      //     x: letter.xBase >> 0,
      //     alpha: 1,
      //     ease: Cubic.easeInOut
      //   })

      //   d += dAdd
      //   dAdd *= dFriction
      //   if( dAdd < dMin ) {
      //     dAdd = dMin
      //   }
      // }

      this._cntContent.alpha = 1;

      // TweenLite.to( this._cntContent, .6, {
      //   delay: .4,
      //   alpha: 1,
      //   ease: Quart.easeOut
      // })
    }
  }, {
    key: "hide",
    value: function hide() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      TweenLite.killTweensOf(this._polyShape.scale);
      TweenLite.killTweensOf(this._cntTfTop);
      TweenLite.killTweensOf(this._cntTfBottom);

      TweenLite.to(this._polyShape.scale, .6, {
        delay: delay + .15,
        x: 0,
        y: 0,
        ease: Quart.easeInOut
      });

      TweenLite.to(this._cntTfTop, .4, {
        delay: delay,
        x: this._cntTfTop.x + 25,
        alpha: 0,
        ease: Quart.easeInOut
      });

      TweenLite.to(this._cntTfBottom, .4, {
        delay: delay + .075,
        x: this._cntTfBottom.x + 20,
        alpha: 0,
        ease: Quart.easeInOut
      });
    }
  }]);

  return EntryComingSoon;
})(PIXI.Container);

module.exports = EntryComingSoon;

},{"fz/core/pixi":2,"fz/core/stage":3,"xmas/core/config":15,"xmas/home/entry/PolyShape":24,"xmas/utils/texts":32}],21:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var uImg = require("fz/utils/images");
var pixi = require("fz/core/pixi");
var config = require("xmas/core/config");
var PolyShape = require("xmas/home/entry/PolyShape");
var uTexts = require("xmas/utils/texts");

var DefaultShape = (function (_PIXI$Container) {
  _inherits(DefaultShape, _PIXI$Container);

  function DefaultShape(data) {
    _classCallCheck(this, DefaultShape);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DefaultShape).call(this));

    _this._data = data;

    _this._cntGlobal = new PIXI.Container();
    _this.addChild(_this._cntGlobal);

    _this._cntPreview = _this._createPreview();
    _this._cntGlobal.addChild(_this._cntPreview);

    _this.pivot.x = config.sizes.entry.w >> 1;
    _this.pivot.y = config.sizes.entry.h >> 1;

    _this._layer = new PIXI.Sprite(PIXI.Texture.fromFrame("layer-blue.png"));
    _this._layer.tint = config.colors.blue;
    _this._layer.alpha = .95;
    _this._layer.x = -20;
    _this._layer.y = -20;
    _this._cntGlobal.addChild(_this._layer);

    _this._polyShape = new PolyShape();
    _this._polyShape.x = config.sizes.entry.w >> 1;
    _this._polyShape.y = config.sizes.entry.h >> 1;
    _this._cntGlobal.addChild(_this._polyShape);

    _this._cntGlobal.mask = _this._polyShape;

    _this._shapeOver = new PIXI.Graphics();
    _this._shapeOver.beginFill(0xe5f2ff);
    _this._shapeOver.drawCircle(0, 0, config.sizes.entry.h >> 1);
    // this._shapeOver = new PIXI.Sprite( PIXI.Texture.fromFrame( "circle_preview.png" ) )
    // this._shapeOver.anchor.set( .5, .5 )
    _this._shapeOver.x = _this._polyShape.x;
    _this._shapeOver.y = _this._polyShape.y;
    _this._shapeOver.scale.x = _this._shapeOver.scale.y = 0;

    _this._mskCircle = new PIXI.Graphics();
    _this._mskCircle.beginFill(0xff00ff);
    _this._mskCircle.drawCircle(0, 0, config.sizes.entry.h >> 1);
    // this._shapeOver = new PIXI.Sprite( PIXI.Texture.fromFrame( "circle_preview.png" ) )
    // this._shapeOver.anchor.set( .5, .5 )
    _this._mskCircle.x = _this._polyShape.x;
    _this._mskCircle.y = _this._polyShape.y;
    _this._mskCircle.scale.x = _this._mskCircle.scale.y = 0;
    _this.addChild(_this._mskCircle);
    return _this;
  }

  _createClass(DefaultShape, [{
    key: "_createPreview",
    value: function _createPreview() {
      var cnt = new PIXI.Container();

      this._img = new PIXI.Sprite(PIXI.Texture.fromFrame(this._data.pathPreview));
      var fit = uImg.fit(this._img.width, this._img.height, config.sizes.entry.w, config.sizes.entry.h);
      this._img.width = fit.width >> 0;
      this._img.height = fit.height >> 0;
      this._img.x = config.sizes.entry.w - fit.width >> 1;
      this._img.y = config.sizes.entry.h - fit.height >> 1;
      cnt.addChild(this._img);

      return cnt;
    }
  }, {
    key: "over",
    value: function over() {
      TweenLite.killTweensOf(this);
      TweenLite.killTweensOf(this._shapeOver.scale);
      TweenLite.killTweensOf(this._polyShape.scale);
      TweenLite.killTweensOf(this._mskCircle.scale);

      this._polyShape.scale.x = this._polyShape.scale.y = 1;
      this._shapeOver.scale.x = 0;
      this._shapeOver.scale.y = 0;
      this.scale.x = this.scale.y = 1;

      this.mask = null;
      this._mskCircle.scale.x = this._mskCircle.scale.y = 0;

      this._cntGlobal.addChild(this._shapeOver);
      TweenLite.set(this._shapeOver.scale, {
        delay: .175,
        x: .675,
        y: .675
      });
      TweenLite.to(this._shapeOver.scale, .4, {
        delay: .175,
        x: 1.1,
        y: 1.1,
        ease: Quart.easeOut
      });

      TweenLite.to(this._polyShape.scale, .4, {
        delay: .1,
        x: 1.1,
        y: 1.1,
        ease: Quart.easeOut
      });
    }
  }, {
    key: "out",
    value: function out() {
      var _this2 = this;

      TweenLite.killTweensOf(this);
      TweenLite.killTweensOf(this._shapeOver.scale);
      TweenLite.killTweensOf(this._polyShape.scale);
      TweenLite.killTweensOf(this._mskCircle.scale);
      this.rotation = 0;

      this._cntGlobal.removeChild(this._shapeOver);

      this.scale.x = this.scale.y = 1;
      this._shapeOver.scale.x = this._shapeOver.scale.y = 0;
      this._polyShape.scale.x = this._polyShape.scale.y = .93;

      TweenLite.to(this._polyShape.scale, .6, {
        delay: .2,
        x: 1,
        y: 1,
        ease: Quad.easeOut
      });

      this.mask = this._mskCircle;
      this._mskCircle.scale.x = this._mskCircle.scale.y = 0;
      TweenLite.to(this._mskCircle.scale, .155, {
        x: 0.2,
        y: 0.2,
        ease: Quad.easeIn
      });
      TweenLite.set(this._mskCircle.scale, {
        delay: .155,
        x: .75,
        y: .75
      });
      TweenLite.to(this._mskCircle.scale, .5, {
        delay: .155,
        x: 1,
        y: 1,
        ease: Quart.easeOut,
        onComplete: function onComplete() {
          _this2._mskCircle.scale.x = _this2._mskCircle.scale.y = 0;
          _this2.mask = null;
        }
      });
    }
  }]);

  return DefaultShape;
})(PIXI.Container);

var HoverShape = (function (_PIXI$Container2) {
  _inherits(HoverShape, _PIXI$Container2);

  function HoverShape(data) {
    _classCallCheck(this, HoverShape);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(HoverShape).call(this));

    _this3._data = data;

    _this3._size = config.sizes.entry.w;

    _this3._percent = 0.0001;

    _this3.pivot.x = config.sizes.entry.w >> 1;
    _this3.pivot.y = config.sizes.entry.h >> 1;

    _this3._cntPreview = _this3._createPreview();
    _this3.addChild(_this3._cntPreview);

    _this3._layer = new PIXI.Sprite(PIXI.Texture.fromFrame("layer-blue.png"));
    _this3._layer.tint = config.colors.blue;
    _this3._layer.x = -20;
    _this3._layer.y = -20;
    _this3._layer.alpha = .3;

    _this3.addChild(_this3._layer);
    _this3._msk = new PIXI.Graphics();
    _this3._msk.x = config.sizes.entry.w >> 1;
    _this3._msk.y = config.sizes.entry.h >> 1;
    _this3.addChild(_this3._msk);

    _this3._updateMsk();

    _this3.mask = _this3._msk;

    _this3._shapeOver = new PolyShape(0xe5f2ff);
    _this3._shapeOver.x = _this3._msk.x;
    _this3._shapeOver.y = _this3._msk.y;
    _this3._shapeOver.scale.x = _this3._shapeOver.scale.y = 0;

    // this._isOver = false

    _this3._binds = {};
    _this3._binds.updateMsk = _this3._updateMsk.bind(_this3);
    return _this3;
  }

  _createClass(HoverShape, [{
    key: "_createPreview",
    value: function _createPreview() {
      var cnt = new PIXI.Container();

      this._img = new PIXI.Sprite(PIXI.Texture.fromFrame(this._data.pathPreview));
      var fit = uImg.fit(this._img.width, this._img.height, config.sizes.entry.w, config.sizes.entry.h);
      this._img.width = fit.width >> 0;
      this._img.height = fit.height >> 0;
      this._img.x = config.sizes.entry.w - fit.width >> 1;
      this._img.y = config.sizes.entry.h - fit.height >> 1;
      cnt.addChild(this._img);

      return cnt;
    }
  }, {
    key: "_updateMsk",
    value: function _updateMsk() {
      this._msk.clear();
      this._msk.beginFill(0x00ff00);
      this._drawCircleMask();
    }
  }, {
    key: "_drawCircleMask",
    value: function _drawCircleMask() {
      this._msk.drawCircle(0, 0, (config.sizes.entry.w >> 1) * this._percent);
    }
  }, {
    key: "over",
    value: function over() {
      TweenLite.killTweensOf(this);
      TweenLite.killTweensOf(this._shapeOver.scale);

      // this._isOver = true

      this.scale.x = this.scale.y = 1;
      this._shapeOver.scale.x = this._shapeOver.scale.y = 0;
      this._percent = 0.0001;
      this._updateMsk();

      this.removeChild(this._shapeOver);

      TweenLite.to(this, .155, {
        _percent: 0.2,
        ease: Quad.easeIn,
        onUpdate: this._binds.updateMsk
      });
      TweenLite.set(this, {
        delay: .155,
        _percent: .75
      });
      TweenLite.to(this, .5, {
        delay: .155,
        _percent: 1,
        ease: Quart.easeOut,
        onUpdate: this._binds.updateMsk
      });
    }
  }, {
    key: "out",
    value: function out(cb) {
      // if( !this._isOver ) {
      //   return
      // }
      // this._isOver = false
      TweenLite.killTweensOf(this);
      TweenLite.killTweensOf(this._shapeOver.scale);

      this.addChild(this._shapeOver);
      TweenLite.set(this._shapeOver.scale, {
        delay: .175,
        x: .6,
        y: .6
      });
      TweenLite.to(this._shapeOver.scale, .4, {
        delay: .175,
        x: 1.3,
        y: 1.3,
        ease: Quart.easeOut
      });

      TweenLite.to(this, .4, {
        delay: .125,
        // x: 1.2,
        // y: 1.2,
        _percent: 1.2,
        ease: Quart.easeOut,
        onUpdate: this._binds.updateMsk
      });
    }
  }]);

  return HoverShape;
})(PIXI.Container);

var EntryContentPreview = (function (_PIXI$Container3) {
  _inherits(EntryContentPreview, _PIXI$Container3);

  function EntryContentPreview(data) {
    _classCallCheck(this, EntryContentPreview);

    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(EntryContentPreview).call(this));

    _this4._default = new DefaultShape(data);
    _this4._default.x = config.sizes.entry.w >> 1;
    _this4._default.y = config.sizes.entry.h >> 1;
    _this4._default.scale.x = _this4._default.scale.y = 0;
    _this4.addChild(_this4._default);

    _this4._hover = new HoverShape(data);
    _this4._hover.x = config.sizes.entry.w >> 1;
    _this4._hover.y = config.sizes.entry.h >> 1;
    // this.addChild( this._hover )

    _this4.hoverZone = new PIXI.Sprite(PIXI.Texture.fromFrame("layer-blue.png"));
    // this.hoverZone.scale.set( .5, .5 )
    _this4.hoverZone.width = config.sizes.entry.w;
    _this4.hoverZone.height = config.sizes.entry.h;
    _this4.hoverZone.tint = Math.random() * 0xffffff;
    _this4.hoverZone.alpha = 0;
    _this4.addChild(_this4.hoverZone);

    _this4._cntTf = new PIXI.Container();
    _this4._cntTf.x = 100;
    _this4._cntTf.y = 255;
    _this4.addChild(_this4._cntTf);

    _this4._tfTitle = uTexts.create(data.title, { font: "22px " + config.fonts.medium, fill: config.colors.blue });
    _this4._cntTf.addChild(_this4._tfTitle);
    _this4._initLetters(_this4._tfTitle);

    _this4._tfAuthor = uTexts.create(data.author, { font: "27px " + config.fonts.medium, fill: config.colors.blue });
    _this4._tfAuthor.x = 15;
    _this4._tfAuthor.y = 20;
    _this4._cntTf.addChild(_this4._tfAuthor);
    _this4._initLetters(_this4._tfAuthor);

    _this4._isShown = false;
    return _this4;
  }

  _createClass(EntryContentPreview, [{
    key: "_initLetters",
    value: function _initLetters(cnt) {
      var n = cnt.children.length;
      for (var i = 0; i < n; i++) {
        cnt.children[i].alpha = 0;
      }
    }
  }, {
    key: "over",
    value: function over() {
      this._default.over();

      this.addChild(this._hover);
      this._hover.over();
    }
  }, {
    key: "out",
    value: function out() {
      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this._default.out();
      this.addChild(this._default);

      this._hover.out();
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var fast = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      this._isShown = true;

      var timing = fast ? .4 : .8;
      var ratio = fast ? .5 : 1;

      TweenLite.killTweensOf(this._default.scale);
      TweenLite.to(this._default.scale, timing, {
        delay: delay, // + .25,
        x: 1,
        y: 1,
        ease: fast ? Quart.easeOut : Quart.easeInOut
      });

      this._showLetters(this._tfTitle, delay + .8 * ratio, ratio);
      this._showLetters(this._tfAuthor, delay + 1 * ratio, ratio);
    }
  }, {
    key: "_showLetters",
    value: function _showLetters(cnt, delay, ratio) {
      var n = cnt.children.length;
      for (var i = 0; i < n; i++) {
        TweenLite.killTweensOf(cnt.children[i]);
        TweenLite.to(cnt.children[i], .8 * ratio, {
          delay: delay + Math.random() * .4 * ratio,
          alpha: 1,
          ease: Quart.easeInOut
        });
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      // this._hover.out()

      TweenLite.killTweensOf(this._default.scale);
      TweenLite.to(this._default.scale, .6, {
        delay: delay, // + .25,
        x: 0,
        y: 0,
        ease: Quart.easeInOut
      });

      this._hideLetters(this._tfTitle, delay);
      this._hideLetters(this._tfAuthor, delay + .1);
    }
  }, {
    key: "_hideLetters",
    value: function _hideLetters(cnt, delay) {
      var n = cnt.children.length;
      for (var i = 0; i < n; i++) {
        TweenLite.killTweensOf(cnt.children[i]);
        TweenLite.to(cnt.children[i], .4, {
          delay: delay + Math.random() * .2,
          alpha: 0,
          ease: Quart.easeInOut
        });
      }
    }
  }]);

  return EntryContentPreview;
})(PIXI.Container);

module.exports = EntryContentPreview;

},{"fz/core/pixi":2,"fz/utils/images":7,"xmas/core/config":15,"xmas/home/entry/PolyShape":24,"xmas/utils/texts":32}],22:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var uXmasTexts = require("xmas/utils/texts");

var EntryNumber = (function (_PIXI$Container) {
  _inherits(EntryNumber, _PIXI$Container);

  function EntryNumber(idx) {
    _classCallCheck(this, EntryNumber);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EntryNumber).call(this));

    _this._percentArrowLine = 0;
    _this._percentArrowEnd = 0;

    _this._bg = new PIXI.Sprite(PIXI.Texture.fromFrame("circle_2x.png"));
    _this._bg.tint = config.colors.red;
    _this._bg.scale.set(.33, .33);
    _this.addChild(_this._bg);

    _this._cntText = uXmasTexts.create("0" + idx, { font: "30px " + config.fonts.bold, fill: 0xffffff });
    _this._cntText.x = _this._bg.width - _this._cntText.width >> 1;
    _this._cntText.y = _this._bg.height - _this._cntText.height >> 1;
    _this._cntText.x -= 1;
    _this._cntText.y -= 3;
    _this._initLetters();
    _this.addChild(_this._cntText);

    _this._createArrow();

    _this.scale.x = _this.scale.y = 0;
    _this.alpha = 0;
    _this.pivot.set(_this._bg.width >> 1, _this._bg.height >> 1);

    _this._binds = {};
    _this._binds.drawArrowLine = _this._drawArrowLine.bind(_this);
    _this._binds.drawArrowEnd = _this._drawArrowEnd.bind(_this);
    return _this;
  }

  _createClass(EntryNumber, [{
    key: "_initLetters",
    value: function _initLetters() {
      var letter = null;
      var n = this._cntText.children.length;
      for (var i = 0; i < n; i++) {
        letter = this._cntText.children[i];
        letter.alpha = 0;
        letter.y = 15;
      }
    }
  }, {
    key: "_createArrow",
    value: function _createArrow() {
      this._cntArrow = new PIXI.Container();
      this._cntArrow.x = -4;
      this._cntArrow.y = this._bg.height >> 1;
      // this.addChild( this._cntArrow )

      this._wArrowLine = 22 * 1.5;
      this._sizeArrowEnd = 5 * 1.5;

      this._arrowLine = new PIXI.Graphics();
      this._cntArrow.addChild(this._arrowLine);

      this._arrowEnd = new PIXI.Graphics();
      // this._arrowEnd.x = this._wArrowLine
      this._cntArrow.addChild(this._arrowEnd);
    }
  }, {
    key: "_drawArrowLine",
    value: function _drawArrowLine() {
      this._arrowLine.clear();
      this._arrowLine.lineStyle(2, 0xffffff);
      this._arrowLine.moveTo(0, 0);
      this._arrowLine.lineTo(-this._wArrowLine * this._percentArrowLine, 0);
    }
  }, {
    key: "_drawArrowEnd",
    value: function _drawArrowEnd() {
      this._arrowEnd.clear();
      this._arrowEnd.lineStyle(2, 0xffffff);
      this._arrowEnd.moveTo(-this._sizeArrowEnd * this._percentArrowEnd, -this._sizeArrowEnd * this._percentArrowEnd);
      this._arrowEnd.lineTo(0, 0);
      this._arrowEnd.lineTo(-this._sizeArrowEnd * this._percentArrowEnd, this._sizeArrowEnd * this._percentArrowEnd);
    }
  }, {
    key: "over",
    value: function over() {
      var letter = null;
      var n = this._cntText.children.length;
      for (var i = 0; i < n; i++) {
        letter = this._cntText.children[i];
        TweenLite.killTweensOf(letter);
        TweenLite.to(letter, .4, {
          delay: (n - i) * .04,
          x: letter.xBase + 25 >> 0,
          alpha: 0,
          ease: Cubic.easeInOut
        });
      }

      this.addChild(this._cntArrow);

      this._cntArrow.x = -30;
      TweenLite.killTweensOf(this);
      TweenLite.killTweensOf(this._cntArrow);
      TweenLite.to(this, .4, {
        delay: .2,
        _percentArrowLine: 1,
        ease: Cubic.easeInOut,
        onUpdate: this._binds.drawArrowLine
      });
      TweenLite.to(this, .4, {
        delay: .2,
        _percentArrowEnd: 1,
        ease: Cubic.easeInOut,
        onUpdate: this._binds.drawArrowEnd
      });
      TweenLite.to(this._cntArrow, .4, {
        delay: .2,
        x: 16,
        ease: Cubic.easeInOut
      });
    }
  }, {
    key: "out",
    value: function out() {
      var _this2 = this;

      var letter = null;
      var n = this._cntText.children.length;
      for (var i = 0; i < n; i++) {
        letter = this._cntText.children[i];
        letter.x = letter.xBase - 25;
        TweenLite.killTweensOf(letter);
        TweenLite.to(letter, .4, {
          delay: (n - i) * .04,
          x: letter.xBase >> 0,
          alpha: 1,
          ease: Cubic.easeInOut
        });
      }

      TweenLite.killTweensOf(this);
      TweenLite.killTweensOf(this._cntArrow);
      TweenLite.to(this, .4, {
        _percentArrowLine: 0,
        ease: Cubic.easeInOut,
        onUpdate: this._binds.drawArrowLine
      });
      TweenLite.to(this, .4, {
        _percentArrowEnd: 0,
        ease: Cubic.easeInOut,
        onUpdate: this._binds.drawArrowEnd
      });
      TweenLite.to(this._cntArrow, .4, {
        x: 46,
        ease: Cubic.easeInOut,
        onComplete: function onComplete() {
          _this2.removeChild(_this2._cntArrow);
        }
      });
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var fast = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      // TweenLite.set( this, {
      //   delay: delay,
      //   alpha: .6
      // })

      var ratio = fast ? .5 : 1;

      TweenLite.to(this, .6 * ratio, {
        delay: delay,
        alpha: 1,
        ease: Cubic.easeInOut
      });
      TweenLite.to(this.scale, .2 * ratio, {
        delay: delay,
        x: 0.4,
        y: 0.4,
        ease: Sine.easeIn
      });
      TweenLite.set(this.scale, {
        delay: delay + .2 * ratio,
        x: .6,
        y: .6
      });
      TweenLite.to(this.scale, .8 * ratio, {
        delay: delay + .2 * ratio,
        x: 1,
        y: 1,
        ease: Cubic.easeOut
      });

      var letter = null;
      var n = this._cntText.children.length;
      for (var i = 0; i < n; i++) {
        letter = this._cntText.children[i];
        TweenLite.to(letter, .6 * ratio, {
          delay: delay + .2 * ratio + i * .04 * ratio,
          y: 0,
          alpha: 1,
          ease: Cubic.easeInOut
        });
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      TweenLite.killTweensOf(this);
      TweenLite.killTweensOf(this.scale);

      TweenLite.to(this, .6, {
        delay: delay,
        alpha: 0,
        ease: Cubic.easeInOut
      });
      TweenLite.to(this.scale, .6, {
        delay: delay,
        x: 0,
        y: 0,
        ease: Cubic.easeInOut
      });
    }
  }]);

  return EntryNumber;
})(PIXI.Container);

module.exports = EntryNumber;

},{"xmas/core/config":15,"xmas/utils/texts":32}],23:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");

var EntrySmiley = (function (_PIXI$Container) {
  _inherits(EntrySmiley, _PIXI$Container);

  function EntrySmiley() {
    _classCallCheck(this, EntrySmiley);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EntrySmiley).call(this));

    _this._bg = new PIXI.Sprite(PIXI.Texture.fromFrame("circle_2x.png"));
    _this._bg.tint = config.colors.red;
    _this._bg.scale.set(.33, .33);
    _this.addChild(_this._bg);

    _this._cntSmiley = _this._createSmiley();
    _this._cntSmiley.x = _this._bg.width * .5 + 1 >> 0;
    _this._cntSmiley.y = _this._bg.height * .5 + 9;
    _this.addChild(_this._cntSmiley);

    _this.scale.x = _this.scale.y = 0;
    _this.alpha = 0;
    _this.pivot.set(_this._bg.width >> 1, _this._bg.height >> 1);
    return _this;
  }

  _createClass(EntrySmiley, [{
    key: "_createSmiley",
    value: function _createSmiley() {
      var cnt = new PIXI.Container();

      this._wSmiley = 7;
      this._hSmileyMouth = 9;

      this._eyeLeft = new PIXI.Graphics();
      this._eyeLeft.x = -this._wSmiley;
      this._eyeLeft.y = -this._hSmileyMouth - 6;
      this._drawEye(this._eyeLeft);
      cnt.addChild(this._eyeLeft);

      this._eyeRight = new PIXI.Graphics();
      this._eyeRight.x = this._wSmiley;
      this._eyeRight.y = -this._hSmileyMouth - 6;
      this._drawEye(this._eyeRight);
      cnt.addChild(this._eyeRight);

      this._mouth = new PIXI.Graphics();
      this._drawMouth();
      cnt.addChild(this._mouth);

      return cnt;
    }
  }, {
    key: "_drawEye",
    value: function _drawEye(g) {
      g.clear();
      g.beginFill(0xffffff);
      g.drawCircle(0, 0, 1.5);
    }
  }, {
    key: "_drawMouth",
    value: function _drawMouth() {
      this._mouth.clear();
      this._mouth.lineStyle(2, 0xffffff);
      this._mouth.moveTo(0, 0);
      this._mouth.quadraticCurveTo(-this._wSmiley, 0, -this._wSmiley, -this._hSmileyMouth);
      this._mouth.moveTo(0, 0);
      this._mouth.quadraticCurveTo(this._wSmiley, 0, this._wSmiley, -this._hSmileyMouth);
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var fast = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var ratio = fast ? .5 : 1;

      TweenLite.to(this, .4 * ratio, {
        delay: delay,
        alpha: 1,
        ease: Cubic.easeInOut
      });
      TweenLite.to(this.scale, .2 * ratio, {
        delay: delay,
        x: 0.4,
        y: 0.4,
        ease: Sine.easeIn
      });
      TweenLite.set(this.scale, {
        delay: delay + .2 * ratio,
        x: .6,
        y: .6
      });
      TweenLite.to(this.scale, .8 * ratio, {
        delay: delay + .2 * ratio,
        x: 1,
        y: 1,
        ease: Cubic.easeOut
      });
    }
  }, {
    key: "hide",
    value: function hide() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      TweenLite.killTweensOf(this);
      TweenLite.killTweensOf(this.scale);

      TweenLite.to(this, .6, {
        delay: delay,
        alpha: 0,
        ease: Cubic.easeInOut
      });
      TweenLite.to(this.scale, .6, {
        delay: delay,
        x: 0,
        y: 0,
        ease: Cubic.easeInOut
      });
    }
  }]);

  return EntrySmiley;
})(PIXI.Container);

module.exports = EntrySmiley;

},{"xmas/core/config":15}],24:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = require("xmas/core/config");
var pixi = require("fz/core/pixi");
var stage = require("fz/core/stage");

var Point = (function () {
  function Point() {
    _classCallCheck(this, Point);
  }

  _createClass(Point, [{
    key: "set",
    value: function set(a, radDefault, radOver) {
      var cos = Math.cos(a);
      var sin = Math.sin(a);

      this._xDefault = cos * radDefault;
      this._yDefault = sin * radDefault;

      this._xOver = cos * radOver;
      this._yOver = sin * radOver;

      this.x = this._xDefault;
      this.y = this._yDefault;
    }
  }]);

  return Point;
})();

var PolyShapeGraphics = (function (_PIXI$Graphics) {
  _inherits(PolyShapeGraphics, _PIXI$Graphics);

  function PolyShapeGraphics() {
    var color = arguments.length <= 0 || arguments[0] === undefined ? 0xff00ff : arguments[0];

    _classCallCheck(this, PolyShapeGraphics);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PolyShapeGraphics).call(this));

    _this._color = color;
    _this._countMaskPoints = 6;

    _this.rotation = Math.PI / 6;

    _this._init();
    _this._update();
    return _this;
  }

  _createClass(PolyShapeGraphics, [{
    key: "_update",
    value: function _update() {
      this.clear();

      this.beginFill(this._color);
      this._draw();
    }
  }, {
    key: "_init",
    value: function _init() {
      var a = 0;
      var radDefault = config.sizes.entry.h >> 1;
      var radOver = config.sizes.entry.w >> 1;
      var p = null;

      this._points = [];

      var aAdd = 2 * Math.PI / this._countMaskPoints;
      for (var i = 0; i < this._countMaskPoints; i++) {
        p = new Point();
        p.set(a, radDefault, radOver);
        this._points.push(p);

        a += aAdd;
      }
    }
  }, {
    key: "_draw",
    value: function _draw() {
      var p = null;
      for (var i = 0; i < this._countMaskPoints; i++) {
        p = this._points[i];
        if (i != 0) {
          this.lineTo(p.x, p.y);
        } else {
          this.moveTo(p.x, p.y);
        }
      }
    }
  }]);

  return PolyShapeGraphics;
})(PIXI.Graphics);

var tex = null;

// class PolyShape extends PIXI.Sprite {

//   constructor( color ) {
//     super()

//     this._polyShapeGraphics = new PolyShapeGraphics( color )
//     if( !tex ) {
//       console.log( "yo" )
//       tex = this._polyShapeGraphics.generateTexture( pixi.renderer, stage.resolution )
//     }

//     this.rotation = Math.PI / 6

//     this.texture = tex   
//     this.tint = color
//     // this.pivot.set( this.width * .5 >> 1, this.height * .5 >> 1 )
//     this.anchor.set( .5, .5 )
//   }
// }

module.exports = PolyShapeGraphics;

},{"fz/core/pixi":2,"fz/core/stage":3,"xmas/core/config":15}],25:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bts = (function (_PIXI$Container) {
  _inherits(Bts, _PIXI$Container);

  function Bts() {
    _classCallCheck(this, Bts);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Bts).call(this));

    _this._binds = {};
    _this._binds.onMouseOver = _this._onMouseOver.bind(_this);
    _this._binds.onMouseOut = _this._onMouseOut.bind(_this);
    _this._binds.onClick = _this._onClick.bind(_this);

    _this._initTop();
    _this._initShare();
    return _this;
  }

  _createClass(Bts, [{
    key: "_onMouseOver",
    value: function _onMouseOver(e) {
      var target = e.target.children[0];
      target.alpha = 1;
      TweenLite.to(target, .25, {
        x: 5,
        ease: Quart.easeOut
      });
    }
  }, {
    key: "_onMouseOut",
    value: function _onMouseOut(e) {
      var target = e.target.children[0];
      TweenLite.to(target, .25, {
        x: 0,
        ease: Quart.easeOut,
        onComplete: function onComplete() {
          target.alpha = 0;
        }
      });
    }
  }, {
    key: "_onClick",
    value: function _onClick(e) {
      var target = e.target;
      if (target == this._btSubmit) {
        window.open("https://github.com/Makio64/christmasxp2015/blob/master/README.md", "_blank");
      } else if (target == this._btAbout) {
        window.open("https://github.com/makio64/christmasxp2015", "_blank");
      } else if (target == this._btFB) {
        FB.ui({
          method: 'feed',
          name: "Christmas Experiments - 2015",
          caption: "Christmas Experiments 2015, discover the best experiments of the winter!",
          link: "http://christmasexperiments.com/",
          picture: "http://christmasexperiments.com/share.jpg"
        }, function (response) {
          console.log("response");
        });
      } else if (target == this._btTwitter) {
        var url = "https://twitter.com/share?";
        url += "text=" + encodeURIComponent("Christmas Experiments 2015, discover the best experiments of the winter!");
        url += "&url=" + encodeURIComponent("http://christmasexperiments.com/");
        window.open(url, "", "top=100, left=200, width=600, height = 500");
      }
    }
  }, {
    key: "_initTop",
    value: function _initTop() {
      this._cntTop = new PIXI.Container();
      this._cntTop.x = 22;
      this.addChild(this._cntTop);

      this._btSubmit = this._createBt("bt_submitxp");
      this._btSubmit.x = -2 * 1.5 >> 0;
      this._cntTop.addChild(this._btSubmit);

      this._btAbout = this._createBt("bt_about");
      this._btAbout.x = 170;
      this._btAbout.y = 25;
      this._cntTop.addChild(this._btAbout);
    }
  }, {
    key: "_initShare",
    value: function _initShare() {
      this._cntShare = new PIXI.Container();
      this._cntShare.x = 134 * 1.5 >> 0;
      this._cntShare.y = 180 * 1.5 >> 0;
      this.addChild(this._cntShare);

      this._btFB = this._createBt("bt_fb");
      this._cntShare.addChild(this._btFB);

      this._btTwitter = this._createBt("bt_twitter");
      this._btTwitter.x = 27 * 1.5 >> 0;
      this._btTwitter.y = 17 * 1.5 >> 0;
      this._cntShare.addChild(this._btTwitter);
    }
  }, {
    key: "_createBt",
    value: function _createBt(name) {
      var cnt = new PIXI.Container();
      cnt.alpha = 0;
      cnt.interactive = true;
      cnt.buttonMode = true;
      cnt.on("mouseover", this._binds.onMouseOver);
      cnt.on("mouseout", this._binds.onMouseOut);
      cnt.on("click", this._binds.onClick);
      cnt.on("touchend", this._binds.onClick);

      var hover = new PIXI.Sprite(PIXI.Texture.fromFrame(name + "_hover.png"));
      hover.scale.set(.33, .33);
      hover.alpha = 0;
      cnt.addChild(hover);

      var normal = new PIXI.Sprite(PIXI.Texture.fromFrame(name + ".png"));
      normal.scale.set(.33, .33);
      cnt.addChild(normal);

      return cnt;
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      TweenLite.to(this._btSubmit, .8, {
        delay: delay,
        alpha: 1,
        ease: Quart.easeInOut
      });

      TweenLite.to(this._btAbout, .8, {
        delay: delay + .2,
        alpha: 1,
        ease: Quart.easeInOut
      });

      TweenLite.to(this._btFB, .8, {
        delay: delay + .1,
        alpha: 1,
        ease: Quart.easeInOut
      });

      TweenLite.to(this._btTwitter, .8, {
        delay: delay + .3,
        alpha: 1,
        ease: Quart.easeInOut
      });
    }
  }]);

  return Bts;
})(PIXI.Container);

module.exports = Bts;

},{}],26:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var pixi = require("fz/core/pixi");
var stage = require("fz/core/stage");

var config = require("xmas/core/config");
var uTexts = require("xmas/utils/texts");

var Title = require("xmas/ui/Title");
var ProgressBar = require("xmas/ui/ProgressBar");

var Logo = (function (_PIXI$Container) {
  _inherits(Logo, _PIXI$Container);

  function Logo() {
    _classCallCheck(this, Logo);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Logo).call(this));

    _this._title = new Title();
    _this._title.x = -270;
    _this._title.y = -140;
    _this.addChild(_this._title);

    _this._progressBar = new ProgressBar();
    _this._progressBar.y = -200;
    _this.addChild(_this._progressBar);

    _this._a = 2 * Math.PI / 6;
    _this._rad = 32;

    // const cntTmp = new PIXI.Container()
    // this._cntLogo = new PIXI.Sprite( PIXI.Texture.fromFrame( "logo.png" ) )
    // this.addChild( this._cntLogo )

    // this._treeGray = this._createTree( 0xbcc5dd, 0xffffff )
    // this._treeGray.rotation = Math.PI / 6 * 4
    // cntTmp.addChild( this._treeGray )

    // this._treeWhite = this._createTree( 0xffffff, config.colors.red )
    // this._treeWhite.rotation = -Math.PI / 6 * 4
    // cntTmp.addChild( this._treeWhite )

    // this._treeMain = new PIXI.Graphics()
    // cntTmp.addChild( this._treeMain )

    // const tex = cntTmp.generateTexture( pixi.renderer, stage.resolution )

    // this._updateTreeMain()

    _this._cntLogo = new PIXI.Container();
    _this.addChild(_this._cntLogo);

    _this._logo = new PIXI.Sprite(PIXI.Texture.fromFrame("img/logo.png"));
    _this._logo.anchor.set(.5, .5);
    _this._cntLogo.addChild(_this._logo);
    _this._cntLogo.alpha = 0;

    _this._initDate();

    _this._canHideLoading = false;
    _this._wantsToHideLoading = false;
    return _this;
  }

  // _createTree( cBg, cDot ) {
  //   let aCurr = -Math.PI / 4 * 2
  //   let aCircle = 0

  //   const g = new PIXI.Graphics()
  //   g.beginFill( cBg )
  //   g.moveTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a * 2
  //   aCircle = aCurr
  //   g.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a
  //   g.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a
  //   g.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )

  //   g.beginFill( cDot )
  //   g.drawCircle( 3, Math.sin( aCircle ) * this._rad, 3 )

  //   return g
  // }

  // _updateTreeMain() {
  //   let aCurr = -Math.PI / 4 * 2
  //   let aCircle = 0

  //   this._treeMain.clear()

  //   this._treeMain.beginFill( config.colors.blue )
  //   this._treeMain.moveTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a * 2
  //   aCircle = aCurr
  //   this._treeMain.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a
  //   this._treeMain.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   aCurr += this._a
  //   this._treeMain.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )

  //   aCurr = -Math.PI / 4 * 2
  //   this._treeMain.beginFill( 0x305ad1 )
  //   this._treeMain.moveTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )
  //   this._treeMain.lineTo( 0, 0 )
  //   aCurr += this._a * 4
  //   this._treeMain.lineTo( Math.cos( aCurr ) * this._rad, Math.sin( aCurr ) * this._rad )

  //   this._treeMain.beginFill( 0xffffff )
  //   this._treeMain.drawCircle( 3, Math.sin( aCircle ) * this._rad, 3 )
  // }

  _createClass(Logo, [{
    key: "_initDate",
    value: function _initDate() {
      var cntTmp = uTexts.create("2015", { font: "20px " + config.fonts.bold, fill: config.colors.blue }, 10);

      var tex = cntTmp.generateTexture(pixi.renderer, stage.resolution);

      this._cntDate = new PIXI.Sprite(tex);
      this._cntDate.x = -this._cntDate.width >> 1;
      this._cntDate.y = 40;
      this._cntLogo.addChild(this._cntDate);

      this._cntDate.alpha = 0;
    }
  }, {
    key: "show",
    value: function show() {
      var _this2 = this;

      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      this._title.show();
      this._progressBar.show(.5);

      TweenLite.to(this._cntLogo, .8, {
        delay: delay + .3,
        alpha: 1,
        ease: Quart.easeInOut
      });
      TweenLite.to(this._logo.scale, 1.2, {
        delay: delay + .3,
        x: .6,
        y: .6,
        ease: Cubic.easeOut
      });

      TweenLite.to(this._cntDate, .8, {
        delay: delay + .9,
        alpha: 1,
        ease: Quart.easeInOut
      });

      //
      this._progressBar.setPercent(.2);
      TweenLite.set(this, {
        delay: .8,
        onComplete: function onComplete() {
          _this2._progressBar.setPercent(.8);
        }
      });

      TweenLite.set(this, {
        delay: 1.4,
        onComplete: function onComplete() {
          _this2._canHideLoading = true;
          if (_this2._wantsToHideLoading) {
            _this2.hideLoading();
          }
        }
      });
    }
  }, {
    key: "hideLoading",
    value: function hideLoading() {
      var _this3 = this;

      this._wantsToHideLoading = true;
      if (!this._canHideLoading) {
        return;
      }
      // tmp
      TweenLite.set(this, {
        onComplete: function onComplete() {
          _this3._progressBar.setPercent(1);
        }
      });

      TweenLite.set(this, {
        delay: .6,
        onComplete: function onComplete() {
          _this3._title.hide();
          TweenLite.to(_this3, .8, {
            delay: .4,
            y: 90 * _this3.scale.y,
            ease: Quart.easeInOut
          });
          _this3._progressBar.switchMode(.4);
          TweenLite.to(_this3._cntDate, .6, {
            delay: 3,
            alpha: 0,
            ease: Quad.easeOut,
            onComplete: function onComplete() {
              _this3._cntLogo.removeChild(_this3._cntDate);
            }
          });
          _this3._progressBar.hideBottomBar(3);
          page("/");
        }
      });
    }
  }]);

  return Logo;
})(PIXI.Container);

module.exports = Logo;

},{"fz/core/pixi":2,"fz/core/stage":3,"xmas/core/config":15,"xmas/ui/ProgressBar":27,"xmas/ui/Title":29,"xmas/utils/texts":32}],27:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var loop = require("fz/core/loop");
var stage = require("fz/core/stage");
var config = require("xmas/core/config");

var ProgressBar = (function (_PIXI$Container) {
  _inherits(ProgressBar, _PIXI$Container);

  function ProgressBar() {
    _classCallCheck(this, ProgressBar);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ProgressBar).call(this));

    _this._gTop = new PIXI.Graphics();
    _this.addChild(_this._gTop);

    _this._gBot = new PIXI.Graphics();
    _this._gBot.y = 290;
    _this.addChild(_this._gBot);

    _this._percent = 0;
    _this._percentTo = 0;

    _this._xStartTop = -stage.width * .5;
    _this._xStartBottom = stage.width * .5;

    _this.alpha = 0;

    _this._binds = {};
    _this._binds.onUpdate = _this._onUpdate.bind(_this);
    _this._binds.draw = _this._draw.bind(_this);
    return _this;
  }

  _createClass(ProgressBar, [{
    key: "_onUpdate",
    value: function _onUpdate() {
      this._percent += (this._percentTo - this._percent) * .09;
      this._draw();
    }
  }, {
    key: "_draw",
    value: function _draw() {
      var wh = stage.width >> 1;

      this._gTop.clear();
      this._gTop.lineStyle(2, config.colors.blue);
      this._gTop.moveTo(this._xStartTop, 0);
      this._gTop.lineTo(-wh + this._percent * (wh + 28), 0);

      this._gBot.clear();
      this._gBot.lineStyle(2, config.colors.blue);
      this._gBot.moveTo(this._xStartBottom, 0);
      this._gBot.lineTo(wh - this._percent * (wh + 28), 0);
    }
  }, {
    key: "setPercent",
    value: function setPercent(value) {
      if (value < 1) {
        this._percentTo = value;
        if (this._percentTo >= .4) {
          this.bindEvents();
        }
      } else {
        this.unbindEvents();
        var wh = stage.width >> 1;
        TweenLite.to(this, .8, {
          _percent: 1,
          _xStartTop: -28 >> 0,
          _xStartBottom: 28 >> 0,
          onUpdate: this._binds.draw,
          onComplete: this._binds.draw,
          ease: Cubic.easeInOut
        });
      }
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      loop.add(this._binds.onUpdate);
    }
  }, {
    key: "unbindEvents",
    value: function unbindEvents() {
      loop.remove(this._binds.onUpdate);
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      TweenLite.to(this, .8, {
        delay: delay,
        alpha: 1,
        ease: Quart.easeInOut
      });
    }
  }, {
    key: "switchMode",
    value: function switchMode() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      TweenLite.to(this._gTop, .4, {
        delay: delay,
        y: 140,
        ease: Quad.easeIn
      });
      TweenLite.to(this._gBot, .4, {
        delay: delay,
        y: 280,
        ease: Quad.easeIn
      });
    }
  }, {
    key: "hideBottomBar",
    value: function hideBottomBar(delay) {
      TweenLite.to(this._gBot, .6, {
        delay: delay,
        alpha: 0,
        ease: Quad.easeOut
      });
    }
  }]);

  return ProgressBar;
})(PIXI.Container);

module.exports = ProgressBar;

},{"fz/core/loop":1,"fz/core/stage":3,"xmas/core/config":15}],28:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var loop = require("fz/core/loop");
var timeout = require("fz/utils/timeout");

var config = require("xmas/core/config");
var uTexts = require("xmas/utils/texts");

var Storyline = (function (_PIXI$Container) {
  _inherits(Storyline, _PIXI$Container);

  function Storyline() {
    _classCallCheck(this, Storyline);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Storyline).call(this));

    _this._tf = uTexts.createWithWords("A daily dose of interactive experiments till Christmas", { font: "20px " + config.fonts.regular, fill: config.colors.blue }, 3, 10);
    _this.addChild(_this._tf);

    _this._poly = new PIXI.Sprite(PIXI.Texture.fromFrame("poly_2x.png"));
    _this._poly.tint = config.colors.blue;
    _this._poly.x = -100;
    _this._poly.y = -75;
    _this._poly.anchor.set(.5, .5);
    _this._poly.scale.set(0, 0);
    _this.addChild(_this._poly);

    _this._circle = new PIXI.Sprite(PIXI.Texture.fromFrame("circle_2x.png"));
    _this._circle.tint = config.colors.red;
    _this._circle.x = 550;
    _this._circle.y = 125;
    _this._circle.anchor.set(.5, .5);
    _this._circle.scale.set(0, 0);
    _this.addChild(_this._circle);

    _this._initWords();

    _this._binds = {};
    _this._binds.onUpdate = _this._onUpdate.bind(_this);
    return _this;
  }

  _createClass(Storyline, [{
    key: "_initWords",
    value: function _initWords() {
      var n = this._tf.children.length;
      for (var i = 0; i < n; i++) {
        this._tf.children[i].alpha = 0;
      }
    }
  }, {
    key: "show",
    value: function show() {
      var _this2 = this;

      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      this._showWords(delay);

      timeout(function () {
        loop.add(_this2._binds.onUpdate);
      }, delay * 1000);

      TweenLite.to(this._poly.scale, .8, {
        delay: delay,
        x: .5,
        y: .5,
        ease: Quart.easeInOut
      });

      TweenLite.to(this._circle.scale, .8, {
        delay: delay,
        x: .5,
        y: .5,
        ease: Quart.easeInOut
      });
    }
  }, {
    key: "_showWords",
    value: function _showWords(delay) {
      var n = this._tf.children.length;
      for (var i = 0; i < n; i++) {
        TweenLite.to(this._tf.children[i], .8, {
          delay: delay,
          alpha: 1,
          ease: Quart.easeInOut
        });

        delay += .075;
      }
    }
  }, {
    key: "_onUpdate",
    value: function _onUpdate() {
      this._poly.x += 1.1;
      this._poly.rotation += .01;

      this._circle.x -= 1.15;
    }
  }, {
    key: "hide",
    value: function hide() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      this._hideWords(delay);
      TweenLite.to(this._poly.scale, .8, {
        delay: delay + .2,
        x: 0,
        y: 0,
        ease: Quart.easeInOut
      });

      TweenLite.to(this._circle.scale, .8, {
        delay: delay,
        x: 0,
        y: 0,
        ease: Quart.easeInOut
      });
    }
  }, {
    key: "_hideWords",
    value: function _hideWords(delay) {
      var n = this._tf.children.length;
      for (var i = 0; i < n; i++) {
        TweenLite.to(this._tf.children[i], .8, {
          delay: delay,
          alpha: 0,
          ease: Cubic.easeInOut
        });

        delay += .05;
      }
    }
  }]);

  return Storyline;
})(PIXI.Container);

module.exports = Storyline;

},{"fz/core/loop":1,"fz/utils/timeout":10,"xmas/core/config":15,"xmas/utils/texts":32}],29:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var uTexts = require("xmas/utils/texts");

var Title = (function (_PIXI$Container) {
  _inherits(Title, _PIXI$Container);

  function Title() {
    _classCallCheck(this, Title);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Title).call(this));

    _this._cntTop = uTexts.create("CHRIST", { font: "120px " + config.fonts.bold, fill: config.colors.red }, 60);
    _this.addChild(_this._cntTop);

    _this._cntBotLeft = uTexts.create("MAS", { font: "120px " + config.fonts.bold, fill: config.colors.red }, 50);
    _this._cntBotLeft.y = 100;
    _this._cntBotLeft.children[1].x += 4;
    _this._cntBotLeft.children[2].x += 7;
    _this.addChild(_this._cntBotLeft);

    _this._cntBotRight = uTexts.create("XP", { font: "120px " + config.fonts.bold, fill: config.colors.red }, 50);
    _this._cntBotRight.x = 277;
    _this._cntBotRight.y = 100;
    _this._cntBotRight.children[0].x += 50;
    _this._cntBotRight.children[1].x += 52;
    _this.addChild(_this._cntBotRight);

    _this._hideLetters(_this._cntTop);
    _this._hideLetters(_this._cntBotLeft);
    _this._hideLetters(_this._cntBotRight);
    return _this;
  }

  _createClass(Title, [{
    key: "_hideLetters",
    value: function _hideLetters(cnt) {
      var n = cnt.children.length;
      for (var i = 0; i < n; i++) {
        cnt.children[i].alpha = 0;
      }
    }
  }, {
    key: "show",
    value: function show() {
      this._delay = 0;
      this._showLetter(this._cntTop.children[1]);
      this._showLetter(this._cntBotRight.children[0]);
      this._showLetter(this._cntTop.children[4], false);
      this._showLetter(this._cntBotLeft.children[2]);
      this._showLetter(this._cntTop.children[2], false);
      this._showLetter(this._cntTop.children[5], false);
      this._showLetter(this._cntBotLeft.children[0], false);
      this._showLetter(this._cntBotRight.children[1]);
      this._showLetter(this._cntBotRight.children[1], false);
      this._showLetter(this._cntTop.children[0]);
      this._showLetter(this._cntBotLeft.children[1], false);
      this._showLetter(this._cntTop.children[3]);
    }
  }, {
    key: "_showLetter",
    value: function _showLetter(letter) {
      var andIncrement = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      TweenLite.to(letter, .8, {
        delay: this._delay,
        alpha: 1,
        ease: Quart.easeInOut
      });
      if (andIncrement) {
        this._delay += .1;
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      TweenLite.to(this, .8, {
        alpha: 0,
        ease: Cubic.easeInOut
      });
    }
  }]);

  return Title;
})(PIXI.Container);

module.exports = Title;

},{"xmas/core/config":15,"xmas/utils/texts":32}],30:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var pixi = require("fz/core/pixi");
var stage = require("fz/core/stage");
var browsers = require("fz/utils/browsers");

var Logo = require("xmas/ui/Logo");
var Bts = require("xmas/ui/Bts");

var Ui = (function (_PIXI$Container) {
  _inherits(Ui, _PIXI$Container);

  function Ui() {
    _classCallCheck(this, Ui);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Ui).call(this));

    pixi.stage.addChild(_this);

    _this._logo = new Logo();
    _this.addChild(_this._logo);

    if (browsers.mobile) {
      _this._logo.scale.set(.7, .7);
    }

    _this._binds = {};
    _this._binds.onResize = _this._onResize.bind(_this);

    _this._onResize();
    _this._logo.y = stage.height >> 1;
    return _this;
  }

  _createClass(Ui, [{
    key: "_onResize",
    value: function _onResize() {
      // this._title.x = stage.width - this._title.width >> 1
      // this._title.y = stage.height - this._title.height >> 1
      // this._title.y += -100

      // this._progressBar.y = this._title.y - 50

      // this._logo.x = this._title.x + 270
      // this._logo.y = this._title.y + 142

      this._logo.x = stage.width >> 1;

      if (this._bts) {
        this._bts.x = stage.width - 215 * 1.5 >> 0;
        this._bts.y = 20 * 1.5 >> 0;
      }
    }
  }, {
    key: "showLoading",
    value: function showLoading() {
      this._logo.show();
    }
  }, {
    key: "hideLoading",
    value: function hideLoading() {
      this._logo.hideLoading();
    }
  }, {
    key: "showBts",
    value: function showBts() {
      this._bts = new Bts();
      this.addChild(this._bts);
      this._onResize();

      this._bts.show(5);
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      stage.on("resize", this._binds.onResize);
    }
  }]);

  return Ui;
})(PIXI.Container);

module.exports = Ui;

},{"fz/core/pixi":2,"fz/core/stage":3,"fz/utils/browsers":6,"xmas/ui/Bts":25,"xmas/ui/Logo":26}],31:[function(require,module,exports){
"use strict";

module.exports.createCookie = function (name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
};

module.exports.getCookie = function (name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(name + "=");
        if (c_start != -1) {
            c_start = c_start + name.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
};

},{}],32:[function(require,module,exports){
"use strict";

var stage = require("fz/core/stage");

module.exports.create = function (text, style) {
  var letterSpacing = arguments.length <= 2 || arguments[2] === undefined ? 3 : arguments[2];

  var cnt = new PIXI.Container();

  var px = 0;

  var tf = null;
  var n = text.length;
  for (var i = 0; i < n; i++) {
    // tf = new PIXI.Text( text[ i ], style )
    tf = new PIXI.extras.BitmapText(text[i], style);
    tf.tint = style.fill;
    tf.scale.set(.5, .5);
    // tf.resolution = stage.resolution
    tf.x = px;
    tf.xBase = px;
    cnt.addChild(tf);

    px += tf.width + letterSpacing; //>> 0
  }

  return cnt;
};

module.exports.createWithWords = function (text, style) {
  var letterSpacing = arguments.length <= 2 || arguments[2] === undefined ? 3 : arguments[2];
  var wordSpacing = arguments.length <= 3 || arguments[3] === undefined ? 2 : arguments[3];

  var cntGlobal = new PIXI.Container();

  var px = 0;
  var pxWords = 0;

  var cnt = new PIXI.Container();
  cntGlobal.addChild(cnt);
  var tf = null;

  var n = text.length;
  for (var i = 0; i < n; i++) {
    if (text[i] != " ") {
      tf = new PIXI.extras.BitmapText(text[i], style);
      tf.tint = style.fill;
      tf.scale.set(.5, .5);
      tf.x = px;
      tf.xBase = px;
      cnt.addChild(tf);

      px += tf.width + letterSpacing;
    } else {
      pxWords += cnt.width + wordSpacing;

      cnt = new PIXI.Container();
      cnt.x = pxWords;
      cnt.xBase = pxWords;
      cntGlobal.addChild(cnt);

      px = 0;
    }
  }

  return cntGlobal;
};

},{"fz/core/stage":3}],33:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = require("xmas/core/config");
var scrollEmul = require("xmas/core/scrollEmul");

var XPView = (function () {
	function XPView() {
		_classCallCheck(this, XPView);

		this.transitioning = false;
		this.currentXP = false;
		this.html = false;
		this.onNextClick = this.onNextClick.bind(this);
		this.onPrevClick = this.onPrevClick.bind(this);
		this.onLogoClick = this.onLogoClick.bind(this);
		this.direction = 'next';
	}

	_createClass(XPView, [{
		key: "show",
		value: function show(day, title) {
			if (this.isActive) return;
			this.isActive = true;
			this.open(this.getID(day, title));
		}
	}, {
		key: "hide",
		value: function hide(cb) {
			var _this = this;

			this.isActive = false;
			this.transitioning = true;
			TweenMax.killTweensOf(this.mask);
			if (!this.mask) this.createMask();
			var origin = "left top";
			if (this.direction == 'prev') {
				origin = "right top";
			}
			TweenMax.to(this.mask, .6, { scaleX: 1, transformOrigin: origin, ease: Expo.easeOut, onComplete: function onComplete() {
					_this.destroyXP();
					cb();
					origin = "right top";
					if (_this.direction == 'prev') {
						origin = "left top";
					}
					TweenMax.to(_this.mask, .6, { delay: .2, scaleX: 0, transformOrigin: origin, ease: Expo.easeOut, onComplete: function onComplete() {
							_this.transitioning = false;
						} });
				} });
		}

		// XP MANAGEMENT

	}, {
		key: "getID",
		value: function getID(day, title) {
			var data = config.data;
			var days = data.days[parseInt(day)];
			for (var i = 0; i < days.length; i++) {
				var d = days[i];
				if (d.folder.replace(/\//gi, "") == title) {
					this.xpDay = day;
					return d.uid;
				}
			}
		}
	}, {
		key: "getXP",
		value: function getXP(id) {
			var days = config.data.days;
			for (var i = 1; i <= 24; i++) {
				var day = days[i];
				for (var j = 0; j < day.length; j++) {
					var d = day[j];
					if (d.uid == id) {
						return d;
					}
				}
			}
		}

		// XP MANAGEMENT

	}, {
		key: "getDay",
		value: function getDay(id) {
			var days = config.data.days;
			for (var j = 1; j <= 24; j++) {
				var day = days[j];
				for (var i = 0; i < day.length; i++) {
					var d = day[i];
					if (d.uid == id) {
						return j;
					}
				}
			}
		}
	}, {
		key: "open",
		value: function open(id) {
			this.xpIndex = id;
			var day = this.getDay(this.xpIndex);
			if (day < 10) day = '0' + day;
			this.xpDay = day;
			this.xp = this.getXP(id);
			this.xpTransitionIn();
		}
	}, {
		key: "prev",
		value: function prev() {
			this.direction = 'next';
			this.xpIndex++;
			if (this.xpIndex >= config.data.totalXP) this.xpIndex = 0;
			this.open(this.xpIndex);
		}
	}, {
		key: "next",
		value: function next() {
			this.direction = 'prev';
			this.xpIndex--;
			if (this.xpIndex < 0) {
				this.xpIndex = config.data.totalXP - 1;
			}
			this.open(this.xpIndex);
		}
	}, {
		key: "xpTransitionIn",
		value: function xpTransitionIn() {
			var _this2 = this;

			//TODO MASKOUT
			if (this.transitioning) return;
			TweenMax.killTweensOf(this.mask);
			this.transitioning = true;
			if (!this.mask) this.createMask();
			var origin = "left top";
			if (this.direction == 'prev') {
				origin = "right top";
			}
			TweenMax.to(this.mask, .6, { scaleX: 1, transformOrigin: origin, ease: Expo.easeOut, onComplete: function onComplete() {
					_this2.destroyXP();
					scrollEmul.reset();
					_this2.createIframe(_this2.xp);
					origin = "right top";
					if (_this2.direction == 'prev') {
						origin = "left top";
					}
					TweenMax.to(_this2.mask, .6, { delay: .7, scaleX: 0, transformOrigin: origin, ease: Expo.easeOut, onComplete: function onComplete() {
							_this2.transitioning = false;
						} });
				} });
		}
	}, {
		key: "createMask",
		value: function createMask() {
			this.mask = document.createElement('div');
			this.mask.className = 'mask';
			document.body.appendChild(this.mask);
		}
	}, {
		key: "destroyXP",
		value: function destroyXP(cb) {
			if (this.currentXP) {
				// The iframe
				this.iframe.innerHTML = "";
				document.body.removeChild(this.iframe);
				this.iframe = null;
				console.clear();
				this.logo.removeEventListener('click', this.onLogoClick);
				this.logo.removeEventListener('touchStart', this.onLogoClick);
				document.body.removeChild(this.logo);
				this.logo = null;

				this.nextBtn.removeEventListener('click', this.onNextClick);
				this.nextBtn.removeEventListener('touchStart', this.onNextClick);
				document.body.removeChild(this.nextBtn);
				this.nextBtn = null;

				this.prevBtn.removeEventListener('click', this.onPrevClick);
				this.prevBtn.removeEventListener('touchStart', this.onPrevClick);
				document.body.removeChild(this.prevBtn);
				this.prevBtn = null;

				this.shareBtn.removeEventListener('click', this.onShareClick);
				this.shareBtn.removeEventListener('touchStart', this.onShareClick);
				document.body.removeChild(this.shareBtn);
				this.shareBtn = null;

				document.body.removeChild(this.xpinfos);
				this.xpinfos = null;
				this.currentXP = false;
			}
			if (cb) {
				cb();
			}
		}

		// CREATE IFRAME

	}, {
		key: "createIframe",
		value: function createIframe(xp) {
			this.currentXP = true;

			// UI Elements
			this.logo = document.createElement('div');
			this.logo.id = 'logo';
			this.logo.addEventListener('click', this.onLogoClick);
			this.logo.addEventListener('touchStart', this.onLogoClick);
			document.body.appendChild(this.logo);

			this.nextBtn = document.createElement('div');
			this.nextBtn.id = 'next';
			this.nextBtn.addEventListener('click', this.onNextClick);
			this.nextBtn.addEventListener('touchStart', this.onNextClick);
			document.body.appendChild(this.nextBtn);

			this.prevBtn = document.createElement('div');
			this.prevBtn.id = 'prev';
			this.prevBtn.addEventListener('click', this.onPrevClick);
			this.prevBtn.addEventListener('touchStart', this.onPrevClick);
			document.body.appendChild(this.prevBtn);

			this.shareBtn = document.createElement('div');
			this.shareBtn.id = 'share';
			this.shareBtn.addEventListener('click', this.onShareClick);
			this.shareBtn.addEventListener('touchStart', this.onShareClick);
			document.body.appendChild(this.shareBtn);

			this.xpinfos = document.createElement('div');
			this.xpinfos.id = 'xpinfos';
			// this.author = document.createElement('div')
			// this.author.innerHTML = getXP().author
			// this.xpinfos.appendChild(author)
			document.body.appendChild(this.xpinfos);

			// The iframe
			this.iframe = document.createElement('iframe');
			this.iframe.src = xp.path.replace('./', '/');
			this.iframe.className = 'xp';
			document.body.appendChild(this.iframe);
		}
	}, {
		key: "bindEvents",
		value: function bindEvents() {
			// stage.on( "resize", this._binds.onResize )
			// this._onResize()
			// window.addEventListener( "mousewheel", this._binds.onMouseScroll, false )
			// loop.add( this._binds.onUpdate )
		}
	}, {
		key: "unbindEvents",
		value: function unbindEvents() {}
		// stage.off( "resize", this._binds.onResize )
		// window.removeEventListener( "mousewheel", this._binds.onMouseScroll, false )
		// loop.remove( this._binds.onUpdate )

		//FEEBACK USER

	}, {
		key: "onNextClick",
		value: function onNextClick() {
			this.prev();
			var folder = this.xp.folder;
			page('/xps/' + this.xpDay + folder);
		}
	}, {
		key: "onPrevClick",
		value: function onPrevClick() {
			this.next();
			var folder = this.xp.folder;
			page('/xps/' + this.xpDay + folder);
		}
	}, {
		key: "onLogoClick",
		value: function onLogoClick() {
			this.direction = 'next';
			page('/home');
		}
	}, {
		key: "onShareClick",
		value: function onShareClick() {
			//TODO Twitter

			//TODO Facebook

		}
	}, {
		key: "onAuthorOver",
		value: function onAuthorOver() {
			//TODO CoolAnim to show his website / twitter / autre

		}
	}]);

	return XPView;
})();

module.exports = XPView;
module.exports.idXP = null;

},{"xmas/core/config":15,"xmas/core/scrollEmul":16}]},{},[12]);
