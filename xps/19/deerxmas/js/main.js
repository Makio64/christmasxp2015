(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Emitter = require("fz/events/Emitter");
var interactions = require("fz/events/interactions");
var config = require("xp/config");

var Loader = (function (_Emitter) {
  _inherits(Loader, _Emitter);

  function Loader() {
    _classCallCheck(this, Loader);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Loader).call(this));

    _this._binds = {};
    _this._binds.onProgress = _this._onProgress.bind(_this);
    _this._binds.onLoad = _this._onLoad.bind(_this);

    _this._manager = new THREE.LoadingManager();
    _this._manager.onProgress = _this._binds.onProgress;
    _this._manager.onLoad = _this._binds.onLoad;

    config.tex = new THREE.TextureLoader(_this._manager);
    config.texPart0 = new THREE.TextureLoader(_this._manager);
    config.texPart1 = new THREE.TextureLoader(_this._manager);
    config.texPart2 = new THREE.TextureLoader(_this._manager);
    return _this;
  }

  _createClass(Loader, [{
    key: "_onProgress",
    value: function _onProgress() {
      console.log("progress");
    }
  }, {
    key: "_onLoad",
    value: function _onLoad() {
      this.emit("assetsComplete");
    }
  }, {
    key: "loadAssets",
    value: function loadAssets() {
      config.tex.load("img/stroke.png", function (tex) {
        config.tex = tex;
      });
      config.texPart0.load("img/part_0.png", function (tex) {
        config.texPart0 = tex;
      });
      config.texPart1.load("img/part_1.png", function (tex) {
        config.texPart1 = tex;
      });
      config.texPart2.load("img/part_2.png", function (tex) {
        config.texPart2 = tex;
      });
    }
  }, {
    key: "loadSound",
    value: function loadSound() {
      var _this2 = this;

      var h = new Howl({ onload: function onload() {
          _this2.emit("soundLoaded");
          h.play();

          var isPlaying = true;

          var dom = document.getElementById("bt-sound");
          var domMinus = dom.querySelector(".icon--minus");
          var domPlus = dom.querySelector(".icon--plus");
          var domText = dom.querySelector(".text");
          interactions.on(dom, "click", function () {
            if (isPlaying) {
              domMinus.style.display = "none";
              domPlus.style.display = "block";
              h.pause();
              isPlaying = false;
            } else {
              domMinus.style.display = "block";
              domPlus.style.display = "none";
              h.play();
              isPlaying = true;
            }
          });
          interactions.on(dom, "over", function () {
            TweenLite.to(domText, .4, {
              css: {
                alpha: 1
              },
              ease: Quart.easeInOut
            });
          });
          interactions.on(dom, "out", function () {
            TweenLite.to(domText, .25, {
              css: {
                alpha: 0
              },
              ease: Quart.easeInOut
            });
          });
        },
        urls: ["mp3/nujabes_feather.mp3"],
        loop: false,
        volume: .4
      });
    }
  }]);

  return Loader;
})(Emitter);

module.exports = Loader;

},{"fz/events/Emitter":5,"fz/events/interactions":6,"xp/config":19}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"fz/events/Emitter":5,"fz/utils/timeout":9}],4:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var loop = require("fz/core/loop");
var stage = require("fz/core/stage");

var Three = (function () {
  function Three() {
    _classCallCheck(this, Three);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(55, 0, 1, 1000);
    this.camera.position.z = 10;
    this.camera.rotation.x = 0;

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    // this.renderer.setPixelRatio( window.devicePixelRatio )
    this.renderer.setClearColor(0xff9900);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.sortObjects = false

    this.dom = this.renderer.domElement;

    // this._composer = new THREE.EffectComposer( this.renderer, new THREE.WebGLRenderTarget( stage.width * 2, stage.height * 2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: true }) )
    // let pass = new THREE.RenderPass( this.scene, this.camera )
    // this._composer.addPass( pass )

    // pass = new THREE.BloomPass()
    // this._composer.addPass( pass )

    // pass = new THREE.ShaderPass( THREE.FXAAShader )
    // pass.uniforms.resolution.value.x = 1 / stage.width
    // pass.uniforms.resolution.value.y = 1 / stage.height
    // this._composer.addPass( pass )

    // pass = new THREE.ShaderPass( THREE.FilmShader )
    // this._composer.addPass( pass )

    // pass = new THREE.ShaderPass( THREE.CopyShader )
    // pass.renderToScreen = true
    // this._composer.addPass( pass )

    this._binds = {};
    this._binds.onUpdate = this._onUpdate.bind(this);
    this._binds.onResize = this._onResize.bind(this);
  }

  _createClass(Three, [{
    key: "_onUpdate",
    value: function _onUpdate() {
      this.renderer.render(this.scene, this.camera);
      // this._composer.render()
    }
  }, {
    key: "_onResize",
    value: function _onResize() {
      var w = stage.width;
      var h = stage.height;

      this.renderer.setSize(w, h);
      // this._composer.setSize( w, h )

      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      loop.add(this._binds.onUpdate);
      stage.on("resize", this._binds.onResize);
      this._onResize();
    }
  }]);

  return Three;
})();

module.exports = new Three();

},{"fz/core/loop":2,"fz/core/stage":3}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"fz/utils/browsers":7}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"fz/utils/now":8}],10:[function(require,module,exports){
"use strict";

var loop = require("fz/core/loop");
var stage = require("fz/core/stage");
var timeout = require("fz/utils/timeout");

stage.init();
loop.start();

var three = require("fz/core/three");
three.bindEvents();
document.getElementById("main").appendChild(three.dom);

TweenLite.set(three.dom, {
  css: {
    alpha: 0
  }
});

//

var config = require("xp/config");

var xp = null;

var loader = new (require("Loader"))();
loader.on("assetsComplete", function () {

  xp = new (require("xp/Xp"))();
  three.scene.add(xp);

  TweenLite.to(three.dom, 1, {
    delay: .4,
    css: {
      alpha: 1
    },
    ease: Cubic.easeInOut
  });
});
loader.on("soundLoaded", function () {
  TweenLite.killTweensOf(domAL);
  TweenLite.to(domAL, 1, {
    css: {
      alpha: 0
    },
    ease: Quart.easeInOut
  });
  timeout(function () {
    xp.start();
    hideTitle(1.65);
  }, 1000);
});
loader.loadAssets();
loader.loadSound();

var domTitle = document.getElementById("title");
var domD = domTitle.querySelector(".d");
var domE1 = domTitle.querySelector(".e1");
var domE2 = domTitle.querySelector(".e2");
var domR = domTitle.querySelector(".r");
var domX = domTitle.querySelector(".x");
var domM = domTitle.querySelector(".m");
var domA = domTitle.querySelector(".a");
var domAL = domTitle.querySelector(".aL");
var domS = domTitle.querySelector(".s");
function showTitle() {
  TweenLite.to(domD, 1, {
    delay: .4,
    css: {
      alpha: 1
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domE1, 1, {
    css: {
      alpha: 1
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domE2, 1, {
    delay: .4,
    css: {
      alpha: 1
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domR, 1, {
    delay: .6,
    css: {
      alpha: 1
    },
    ease: Quart.easeInOut
  });

  TweenLite.to(domX, 1, {
    delay: .8,
    css: {
      alpha: 1
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domM, 1, {
    delay: .4,
    css: {
      alpha: 1
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domA, 1, {
    delay: .2,
    css: {
      alpha: 1
    },
    ease: Quart.easeInOut,
    onComplete: animLoad
  });
  TweenLite.to(domS, 1, {
    delay: .2,
    css: {
      alpha: 1
    },
    ease: Quart.easeInOut
  });
}
showTitle();

function animLoad() {
  TweenLite.to(domAL, 1.2, {
    css: {
      alpha: 1
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domAL, 1.2, {
    delay: 1.2,
    css: {
      alpha: 0
    },
    ease: Quart.easeInOut,
    onComplete: animLoad
  });
}

function hideTitle() {
  var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  TweenLite.to(domD, 1, {
    delay: delay + .4,
    css: {
      alpha: 0
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domE1, 1, {
    delay: delay,
    css: {
      alpha: 0
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domE2, 1, {
    delay: delay + .4,
    css: {
      alpha: 0
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domR, 1, {
    delay: delay + .6,
    css: {
      alpha: 0
    },
    ease: Quart.easeInOut
  });

  TweenLite.to(domX, 1, {
    delay: delay + .2,
    css: {
      alpha: 0
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domM, 1, {
    delay: delay + .4,
    css: {
      alpha: 0
    },
    ease: Quart.easeInOut
  });
  TweenLite.to(domA, 1, {
    delay: delay + .8,
    css: {
      alpha: 0
    },
    ease: Quart.easeInOut,
    onComplete: function onComplete() {
      domTitle.remove();
    }
  });
  // TweenLite.killTweensOf( domAL )
  // TweenLite.to( domAL, 1, {
  //   delay: delay + .8,
  //   css: {
  //     alpha: 0
  //   },
  //   ease: Quart.easeInOut,
  // })
  TweenLite.to(domS, 1, {
    delay: delay + .2,
    css: {
      alpha: 0
    },
    ease: Quart.easeInOut
  });
}

// xp.start( 1 )

// } )
// loader.load()

},{"Loader":1,"fz/core/loop":2,"fz/core/stage":3,"fz/core/three":4,"fz/utils/timeout":9,"xp/Xp":17,"xp/config":19}],11:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Credits = (function () {
  function Credits() {
    _classCallCheck(this, Credits);

    this._isShown = false;
  }

  _createClass(Credits, [{
    key: "bindElements",
    value: function bindElements() {
      this.dom = document.getElementById("credits");
      this._domB = this.dom.querySelector(".b");
      this._domY = this.dom.querySelector(".y");
      this._domF = this.dom.querySelector(".f");
      this._domL = this.dom.querySelector(".l");
      this._domO = this.dom.querySelector(".o");
      this._domZ = this.dom.querySelector(".z");
      this._domMusic = this.dom.querySelector(".music");
      this._domMusicTitle = this.dom.querySelector(".music-title");
      this._domTwitter = document.getElementById("twitter");

      this._domLetters = [this._domB, this._domY, this._domF, this._domL, this._domO, this._domZ, this._domMusic, this._domMusicTitle, this._domTwitter];
    }
  }, {
    key: "show",
    value: function show() {
      if (this._isShown) {
        return;
      }
      this._isShown = true;

      TweenLite.killTweensOf(this._domLetters);
      TweenLite.to(this._domB, 1, {
        delay: .4,
        css: {
          alpha: 1
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domY, 1, {
        delay: .2,
        css: {
          alpha: 1
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domF, 1, {
        delay: .2,
        css: {
          alpha: 1
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domL, 1, {
        delay: .4,
        css: {
          alpha: 1
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domO, 1, {
        css: {
          alpha: 1
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domZ, 1, {
        delay: .2,
        css: {
          alpha: 1
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domMusic, 1, {
        delay: .4,
        css: {
          alpha: 1
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domMusicTitle, 1, {
        delay: .6,
        css: {
          alpha: 1
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domTwitter, 1, {
        delay: .8,
        css: {
          alpha: 1
        },
        ease: Cubic.easeOut
      });
    }
  }, {
    key: "hide",
    value: function hide() {
      if (!this._isShown) {
        return;
      }
      this._isShown = false;

      TweenLite.killTweensOf(this._domLetters);
      TweenLite.to(this._domB, .6, {
        delay: .4,
        css: {
          alpha: 0
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domY, .6, {
        delay: .2,
        css: {
          alpha: 0
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domF, .6, {
        delay: .2,
        css: {
          alpha: 0
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domL, .6, {
        delay: .4,
        css: {
          alpha: 0
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domO, .6, {
        css: {
          alpha: 0
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domZ, .6, {
        delay: .2,
        css: {
          alpha: 0
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domMusic, .6, {
        delay: .2,
        css: {
          alpha: 0
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domMusicTitle, .6, {
        css: {
          alpha: 0
        },
        ease: Quart.easeInOut
      });

      TweenLite.to(this._domTwitter, .6, {
        css: {
          alpha: 0
        },
        ease: Quart.easeInOut
      });
    }
  }]);

  return Credits;
})();

module.exports = Credits;

},{}],12:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xp/config");
var Particles = require("xp/Particles");
var Part = require("xp/Part");
var data = require("xp/data");
var colors = require("xp/colors");
var browsers = require("fz/utils/browsers");

var Deer = (function (_THREE$Object3D) {
  _inherits(Deer, _THREE$Object3D);

  function Deer() {
    _classCallCheck(this, Deer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Deer).call(this));

    var datas = null;
    if (browsers.mobile || browsers.tablet) {
      datas = [{ id: "end_head", speed: .75, colors: colors.pinks }, { id: "top_head", speed: .75, colors: colors.pinks }, { id: "right_ear", speed: .48, colors: colors.pinks }, { id: "left_ear", speed: .48, colors: colors.pinks }, { id: "left_hood", speed: .2, freq: 1.25, colors: colors.cHoods },
      // { id: "left_hood", speed: .25, freq: 1.25, colors: colors.cHoods, scale: 1.02 },
      // { id: "left_hood", speed: .2, freq: 1.25, colors: colors.pinksPale, scale: 2 },
      // { id: "left_hood", speed: .2, freq: 1, colors: colors.cHoods, scale: 1.075 },
      // { id: "left_hood", speed: .22, freq: 1.25, colors: colors.cHoods, scale: 1.01 },
      { id: "right_hood", speed: .2, freq: 1.25, colors: colors.cHoods },
      // { id: "right_hood", speed: .25, freq: 1.25, colors: colors.cHoods, scale: 1.02 },
      // { id: "right_hood", speed: .25, freq: 1, colors: colors.cHoods, scale: 1.075 },
      // { id: "right_hood", speed: .2, freq: 1.25, colors: colors.pinksPale, scale: 2 },
      // { id: "right_hood", speed: .22, freq: 1.25, colors: colors.cHoods, scale: 1.01 },
      { id: "rightToLeft_fullbody", speed: .6, colors: colors.pinks }, { id: "rightToLeft_ears", speed: .7, colors: colors.pinks }, { id: "rightToLeft_ears2", speed: .7, colors: colors.pinks }, { id: "leftToRight_neck", speed: .6, colors: colors.pinks }, { id: "rightToLeft_neck", speed: .6, colors: colors.pinks }, { id: "backToFront_mouth", speed: .49, colors: colors.pinks },
      // { id: "backToFront", speed: .49, colors: colors.pinks },
      { id: "backToFront", speed: .6, colors: colors.blacks, scale: .75 }, { id: "mouth", speed: .4, colors: colors.greens, scale: .9 }, { id: "left_eye", speed: .3, colors: colors.blues, scale: 1.2, freq: 1 }, { id: "right_eye", speed: .3, colors: colors.blues, scale: 1.2, freq: 1 },
      // { id: "bottom_neck", speed: .15, colors: colors.pinks, scale: 1.2, freq: 1  },
      { id: "bottom_neck2", speed: .15, colors: colors.pinks, scale: 1, freq: 1 }, { id: "bottom_neck2", speed: .15, colors: colors.blacks, scale: .9, freq: 1 }, { id: "back", speed: .25, colors: colors.pinks, scale: 1.2, freq: 1 }];
    } else
      // { id: "back2", speed: .15, colors: colors.pinks, scale: 1, freq: 1  },
      // { id: "back2", speed: .15, colors: colors.blacks, scale: .8, freq: 1  },
      {
        datas = [{ id: "end_head", speed: .75, colors: colors.pinks }, { id: "top_head", speed: .75, colors: colors.pinks }, { id: "right_ear", speed: .48, colors: colors.pinks }, { id: "left_ear", speed: .48, colors: colors.pinks }, { id: "left_hood", speed: .2, freq: 1.25, colors: colors.cHoods }, { id: "left_hood", speed: .25, freq: 1.25, colors: colors.cHoods, scale: 1.02 }, { id: "left_hood", speed: .2, freq: 1.25, colors: colors.pinksPale, scale: 2 }, { id: "left_hood", speed: .2, freq: 1, colors: colors.cHoods, scale: 1.075 }, { id: "left_hood", speed: .22, freq: 1.25, colors: colors.cHoods, scale: 1.01 }, { id: "right_hood", speed: .2, freq: 1.25, colors: colors.cHoods }, { id: "right_hood", speed: .25, freq: 1.25, colors: colors.cHoods, scale: 1.02 }, { id: "right_hood", speed: .25, freq: 1, colors: colors.cHoods, scale: 1.075 }, { id: "right_hood", speed: .2, freq: 1.25, colors: colors.pinksPale, scale: 2 }, { id: "right_hood", speed: .22, freq: 1.25, colors: colors.cHoods, scale: 1.01 }, { id: "rightToLeft_fullbody", speed: .6, colors: colors.pinks }, { id: "rightToLeft_ears", speed: .7, colors: colors.pinks }, { id: "rightToLeft_ears2", speed: .7, colors: colors.pinks }, { id: "leftToRight_neck", speed: .6, colors: colors.pinks }, { id: "rightToLeft_neck", speed: .6, colors: colors.pinks }, { id: "backToFront_mouth", speed: .49, colors: colors.pinks }, { id: "backToFront", speed: .49, colors: colors.pinks }, { id: "backToFront", speed: .6, colors: colors.blacks, scale: .75 }, { id: "mouth", speed: .4, colors: colors.greens, scale: .9 }, { id: "left_eye", speed: .3, colors: colors.blues, scale: 1.2, freq: 1 }, { id: "right_eye", speed: .3, colors: colors.blues, scale: 1.2, freq: 1 }, { id: "bottom_neck", speed: .15, colors: colors.pinks, scale: 1.2, freq: 1 }, { id: "bottom_neck2", speed: .15, colors: colors.pinks, scale: 1, freq: 1 }, { id: "bottom_neck2", speed: .15, colors: colors.blacks, scale: .9, freq: 1 }, { id: "back", speed: .25, colors: colors.pinks, scale: 1.2, freq: 1 }, { id: "back2", speed: .15, colors: colors.pinks, scale: 1, freq: 1 }, { id: "back2", speed: .15, colors: colors.blacks, scale: .8, freq: 1 }];
      }

    // const datas = [
    //   { id: "end_head", speed: .75, colors: [ pinks[ 1 ] ] },
    //   { id: "top_head", speed: .75, colors: [ pinks[ 0 ] ] },
    //   { id: "right_ear", speed: .48, freq: 2, colors: [ pinks[ 2 ] ] },
    //   { id: "left_ear", speed: .48, freq: 2, colors: [ pinks[ 0 ] ] },
    //   { id: "left_hood", speed: .15, freq: 2, colors: [ cHoods[ 0 ], cHoods[ 1 ], cHoods[ 2 ] ] },
    //   { id: "left_hood", speed: .15, freq: 2, colors: [ greens[ 0 ], greens[ 1 ], cHoods[ 0 ] ] },
    //   { id: "right_hood", speed: .15, freq: 2, colors: [ greens[ 0 ], greens[ 1 ], cHoods[ 0 ] ] },
    //   { id: "right_hood", speed: .15, freq: 2, colors: [ cHoods[ 0 ], cHoods[ 1 ], cHoods[ 2 ] ] },
    //   { id: "rightToLeft_fullbody", speed: .6, colors: [ pinks[ 0 ] ] },
    //   { id: "rightToLeft_ears", speed: .7, colors: [ pinks[ 1 ] ] },
    //   { id: "rightToLeft_ears2", speed: .7, colors: [ pinks[ 1 ] ] },
    //   { id: "leftToRight_neck", speed: .6, colors: [ pinks[ 1 ] ] },
    //   { id: "rightToLeft_neck", speed: .6, colors: [ pinks[ 1 ] ] },
    //   { id: "backToFront_mouth", speed: .49, colors: [ pinks[ 1 ] ] },
    //   { id: "backToFront", speed: .49, freq: 1, colors: [ pinks[ 1 ] ] },
    //   { id: "backToFront", speed: .6, freq: 1.5, colors: [ blacks[ 0 ] ], scale: .75 },
    //   { id: "mouth", speed: .4, colors: [ greens[ 1 ] ], scale: .9 },
    //   { id: "left_eye", speed: .25, colors: blues, scale: 1.2, freq: 1 },
    //   { id: "right_eye", speed: .25, colors: blues, scale: 1.2, freq: 1  }
    // ]

    _this._parts = [];
    _this._partsById = {};

    var scale = 1;
    var part = null;
    var n = datas.length;
    for (var i = 0; i < n; i++) {
      scale = datas[i].scale || 1;
      part = new Part(data.paths[datas[i].id], datas[i].speed, datas[i].freq || 1, datas[i].colors, scale);
      _this._parts.push(part);
      _this._partsById[datas[i].id] = part;
      part.position.y = -1.35;
      part.scale.set(scale, scale, scale);
      _this.add(part);
    }

    return _this;
  }

  _createClass(Deer, [{
    key: "update",
    value: function update() {
      var n = this._parts.length;
      for (var i = 0; i < n; i++) {
        this._parts[i].update();
      }
    }
  }]);

  return Deer;
})(THREE.Object3D);

module.exports = Deer;

},{"fz/utils/browsers":7,"xp/Part":15,"xp/Particles":16,"xp/colors":18,"xp/config":19,"xp/data":20}],13:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xp/config");
var browsers = require("fz/utils/browsers");
var stage = require("fz/core/stage");
// const depthManager = require( "xp/depthManager" )

var Linoel = (function (_THREE$Object3D) {
  _inherits(Linoel, _THREE$Object3D);

  function Linoel(path, speed, colors, size) {
    _classCallCheck(this, Linoel);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Linoel).call(this));

    _this._path = path;
    _this._speed = speed;
    _this._colors = colors;
    _this._size = size;
    _this.freq = 1;

    _this._countVertices = _this._path.length;
    _this._lengthGeo = _this._countVertices * 3;

    _this._lengthPath = _this._path.length / 3 >> 0;

    _this._time = Math.random() * 1000;
    // this._time = Math.random() * 100
    // this._time = 0

    _this._geo = [];
    for (var i = 0; i < _this._lengthGeo; i += 3) {
      if (!_this._path[i] && _this._path[i] != 0) {
        break;
      }
      _this._geo.push(new THREE.Vector3(_this._path[i], _this._path[i + 1], _this._path[i + 2]));
      // this._geo[ i ] = this._path[ i ]
      // this._geo[ i + 1 ] = this._path[ i + 1 ]
      // this._geo[ i + 2 ] = this._path[ i + 2 ]
    }

    if (browsers.tablet || browsers.mobile) {
      _this._pointsComputed = _this._geo;
    } else {
      var spline = new THREE.CatmullRomCurve3(_this._geo);
      _this._pointsComputed = spline.getPoints(_this._geo.length * 6);
    }
    _this._geo = new THREE.Geometry();
    _this._geo.vertices = _this._pointsComputed;
    // this._path = points

    _this._percent = 0;
    _this._order = 1;

    _this._create();

    stage.on("resize", function () {
      _this._mat.uniforms.resolution.value.x = window.innerWidth;
      _this._mat.uniforms.resolution.value.y = window.innerHeight;
    });
    return _this;
  }

  _createClass(Linoel, [{
    key: "_create",
    value: function _create() {
      this._line = new THREE.MeshLine();
      this._line.setGeometry(this._geo);

      this._mat = new THREE.MeshLineMaterial({
        // map: Math.random() > .25 ? config.tex : config.tex2,
        map: config.tex,
        useMap: true,
        color: new THREE.Color(this._colors[this._colors.length * Math.random() >> 0]), //new THREE.Color( 0xffffff * Math.random() ),
        opacity: .95,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        sizeAttenuation: 5,
        lineWidth: (browsers.mobile ? 25 : 50) * this._speed * this._size,
        near: 0.1,
        far: 1000,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        transparent: true
      });
      this.mesh = new THREE.Mesh(this._line.geometry, this._mat);
      // this._mesh.posAverage = this._posAverage
      this.add(this.mesh);

      // depthManager.register( this._mesh )
    }
  }, {
    key: "update",
    value: function update() {
      var alpha = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      this._time += .01 * this.freq;
      this._mat.uniforms.time.value = this._time;
      this._mat.uniforms.alpha.value = alpha;
    }
  }, {
    key: "kill",
    value: function kill() {
      // depthManager.unregister( this._mesh )
    }
  }]);

  return Linoel;
})(THREE.Object3D);

module.exports = Linoel;

},{"fz/core/stage":3,"fz/utils/browsers":7,"xp/config":19}],14:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var timeout = require("fz/utils/timeout");
var Linoel = require("xp/Linoel");
var depthManager = require("xp/depthManager");

var LinoelEmitter = (function (_THREE$Object3D) {
  _inherits(LinoelEmitter, _THREE$Object3D);

  function LinoelEmitter(path, speed, freq, colors, scale, size) {
    _classCallCheck(this, LinoelEmitter);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LinoelEmitter).call(this));

    _this._path = path;
    _this._speed = speed;
    _this._freq = freq || 1;
    _this._colors = colors;
    _this._scale = scale;
    _this._size = size;

    _this._renderOrder = 0;
    _this._isForceOrder = false;

    _this._calculatePosAverage();
    _this._createLines();

    // this._start()

    depthManager.register(_this);
    return _this;
  }

  _createClass(LinoelEmitter, [{
    key: "_calculatePosAverage",
    value: function _calculatePosAverage() {
      this.posAverage = new THREE.Vector3();

      var n = this._path.length;
      for (var i = 0; i < n; i += 3) {
        this.posAverage.x += this._path[i];
        this.posAverage.y += this._path[i + 1];
        this.posAverage.z += this._path[i + 2];
      }
      var lengthPath = n / 3 >> 0;
      this.posAverage.x /= lengthPath;
      this.posAverage.y /= lengthPath;
      this.posAverage.z /= lengthPath;

      this.posAverage.x *= this._scale;
      this.posAverage.y *= this._scale;
      this.posAverage.z *= this._scale;
    }
  }, {
    key: "_createLines",
    value: function _createLines() {
      this._lines = [];

      var line = new Linoel(this._path, this._speed, this._colors, this._size);
      line.freq = this._freq;
      line.mesh.renderOrder = this._renderOrder;
      this._lines.push(line);
      this.add(line);
    }

    // _createLines() {
    //   this._lines = []

    //   let line = null

    //   const n = this._colors.length
    //   for( let i = 0; i < n; i++ ) {
    //     line = new Linoel( this._path, this._speed, [ this._colors[ i ] ], this._size )
    //     line.mesh.renderOrder = this._renderOrder
    //     this._lines.push( line )
    //     this.add( line )
    //   }
    // }

    // _start() {
    //   this._emit()
    // }

    // _emit() {
    //   timeout( ::this._create, ( 1000 + Math.random() * 8000 ) / this._freq )   
    // }

    // _create() {
    //   const line = new Linoel( this._path, this._speed, this._colors )
    //   line.mesh.renderOrder = this._renderOrder
    //   this._lines.push( line )
    //   this.add( line )

    //   this._emit()
    // }

  }, {
    key: "update",
    value: function update(alpha) {
      var i = this._lines.length;
      while (--i > -1) {
        this._lines[i].update(alpha);
      }
    }
  }, {
    key: "setRenderOrder",
    value: function setRenderOrder(value) {
      if (!this._isForceOrder) {
        this._renderOrder = value;
      }

      var i = this._lines.length;
      while (--i > -1) {
        this._lines[i].mesh.renderOrder = this._renderOrder;
      }
    }
  }, {
    key: "setForceOrder",
    value: function setForceOrder(value) {
      this._isForceOrder = true;
      this._renderOrder = value;
    }
  }]);

  return LinoelEmitter;
})(THREE.Object3D);

module.exports = LinoelEmitter;

},{"fz/utils/timeout":9,"xp/Linoel":13,"xp/depthManager":21}],15:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// const Linoel = require( "xp/Linoel" )
var LinoelEmitter = require("xp/LinoelEmitter");
var depthManager = require("xp/depthManager");

var Part = (function (_THREE$Object3D) {
  _inherits(Part, _THREE$Object3D);

  function Part(paths, speed, freq, colors, scale) {
    var size = arguments.length <= 5 || arguments[5] === undefined ? 1 : arguments[5];

    _classCallCheck(this, Part);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Part).call(this));

    _this._paths = paths;
    _this._speed = speed;
    _this._freq = freq;
    _this._colors = colors;
    _this._scale = scale;
    _this._size = size;
    // this._createLines()
    _this._createEmitters();

    _this.alpha = 1;
    return _this;
  }

  _createClass(Part, [{
    key: "_createEmitters",
    value: function _createEmitters() {
      this._emitters = [];

      var emitter = null;
      var n = this._paths.length;
      for (var i = 0; i < n; i++) {
        emitter = new LinoelEmitter(this._paths[i], this._speed, this._freq, this._colors, this._scale, this._size);
        this._emitters.push(emitter);
        this.add(emitter);
      }
    }

    // _createLines() {
    //   this._lines = []

    //   let line = null
    //   const n = this._paths.length
    //   for( let i = 0; i < n; i++ ) {
    //     line = new Linoel( this._paths[ i ], this._speed )
    //     this._lines.push( line )
    //     this.add( line )
    //   }
    // }

  }, {
    key: "update",
    value: function update() {
      var n = this._emitters.length;
      for (var i = 0; i < n; i++) {
        this._emitters[i].update(this.alpha);
      }
    }
  }, {
    key: "setForceOrder",
    value: function setForceOrder(value) {
      var emitter = null;
      var n = this._emitters.length;
      for (var i = 0; i < n; i++) {
        emitter = this._emitters[i];
        emitter.setForceOrder(value);
      }
    }
  }]);

  return Part;
})(THREE.Object3D);

module.exports = Part;

},{"xp/LinoelEmitter":14,"xp/depthManager":21}],16:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var browsers = require("fz/utils/browsers");

var vs = ["uniform float size;", "uniform float time;", "uniform float speedX;", "uniform float speedY;", "uniform float speedZ;", "uniform float scale;", "varying float alpha;", "void main() {", "  vec3 pos = position;", "  pos.x = pos.x + cos( time * pos.x * .1);", "  pos.y = pos.y + sin( time * pos.y * .1);", "  pos.z = pos.z;", "  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );", "  alpha = sin( pos.x * pos.y * .1 + time );", "  gl_PointSize = alpha * size * ( scale / length( mvPosition.xyz ) );", "  gl_Position = projectionMatrix * mvPosition;", "}"].join("\n");

var fs = ["uniform sampler2D map;", "varying float alpha;", "void main() {", "  gl_FragColor = vec4( 1., 1., 1., alpha ) * texture2D( map, gl_PointCoord );", "}"].join("\n");

var Particles = (function (_THREE$Object3D) {
  _inherits(Particles, _THREE$Object3D);

  function Particles(tex) {
    _classCallCheck(this, Particles);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Particles).call(this));

    _this._tex = tex;

    _this._createGeometry();
    _this._createMat();

    _this._mesh = new THREE.Points(_this._geo, _this._mat);
    _this._mesh.renderOrder = 999;
    _this.add(_this._mesh);
    return _this;
  }

  _createClass(Particles, [{
    key: "_createGeometry",
    value: function _createGeometry() {
      var countPart = 1750 / (browsers.mobile || browsers.tablet ? 4 : 1) >> 0;
      // const countPart = 1750

      var n = countPart * 3;
      var aPos = new Float32Array(n);
      for (var i = 0; i < n; i += 3) {
        aPos[i] = Math.random() * 30 - 15;
        aPos[i + 1] = Math.random() * 30 - 15;
        aPos[i + 2] = Math.random() * 30 - 15;
      }

      this._geo = new THREE.BufferGeometry();
      this._geo.addAttribute("position", new THREE.BufferAttribute(aPos, 3));
    }
  }, {
    key: "_createMat",
    value: function _createMat() {
      this._uniforms = {
        map: { type: "t", value: this._tex },
        scale: { type: "f", value: 40 },
        size: { type: "f", value: 5 + Math.random() * 2 },
        speedX: { type: "f", value: 0 },
        speedY: { type: "f", value: 0 },
        time: { type: "f", value: Math.random() * 10 }
      };

      this._mat = new THREE.ShaderMaterial({
        uniforms: this._uniforms,
        vertexShader: vs,
        fragmentShader: fs,
        depthTest: false,
        depthWrite: false,
        transparent: true
      });
    }
  }, {
    key: "update",
    value: function update() {
      this._uniforms.time.value += .01;
    }
  }]);

  return Particles;
})(THREE.Object3D);

module.exports = Particles;

},{"fz/utils/browsers":7}],17:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var three = require("fz/core/three");
var loop = require("fz/core/loop");
var timeout = require("fz/utils/timeout");
var interactions = require("fz/events/interactions");
var browsers = require("fz/utils/browsers");

// const dgui = require( "fz/utils/dgui" )

var config = require("xp/config");
var Particles = require("xp/Particles");
var Deer = require("xp/Deer");
var Part = require("xp/Part");
var data = require("xp/data");
var colors = require("xp/colors");
var depthManager = require("xp/depthManager");
var Credits = require("xp/Credits");

var Xp = (function (_THREE$Object3D) {
  _inherits(Xp, _THREE$Object3D);

  function Xp() {
    _classCallCheck(this, Xp);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Xp).call(this));

    _this._percent = .625;
    _this._percentTo = _this._percent;
    _this._isStarted = false;
    _this._vToLook = new THREE.Vector3();

    _this._zBase = 9;

    _this._parts = [];
    _this._partsByName = {};

    if (!browsers.mobile) {
      var datas = [{ name: "bg2Bg", id: "bg2", speed: 10, colors: colors.yellows, scale: 1.2, freq: 1 }, { name: "bg3Bg", id: "bg3", speed: 10, colors: colors.yellows, scale: .8, freq: 1 }];

      var scale = 1;
      var part = null;
      var n = datas.length;
      for (var i = 0; i < n; i++) {
        scale = datas[i].scale || 1;
        part = new Part(data.paths[datas[i].id], datas[i].speed, datas[i].freq || 1, datas[i].colors, scale);
        _this._parts.push(part);
        _this._partsByName[datas[i].name] = part;
        part.position.y = -1.38;
        part.scale.set(scale, scale, scale);
        _this.add(part);
      }
      _this._partsByName["bg2Bg"].setForceOrder(-2);
      _this._partsByName["bg3Bg"].setForceOrder(-1);
    }

    _this._deer = new Deer();
    _this.add(_this._deer);

    _this._particles0 = new Particles(config.texPart0);
    _this.add(_this._particles0);

    _this._particles1 = new Particles(config.texPart1);
    _this.add(_this._particles1);

    _this._particles2 = new Particles(config.texPart2);
    _this.add(_this._particles2);

    _this._posStart = new THREE.Vector3(0, 1, 2.5);
    _this._rotStart = new THREE.Euler(1.2, 0, 0, "XYZ");

    three.camera.position.copy(_this._posStart);
    three.camera.rotation.copy(_this._rotStart);

    _this._credits = new Credits();
    _this._credits.bindElements();

    // this._controls = new THREE.OrbitControls( three.camera, three.renderer.domElement )

    // let f = dgui.addFolder( "position" )
    // f.add( three.camera.position, "x" ).step( .01 ).listen()
    // f.add( three.camera.position, "y" ).step( .01 ).listen()
    // f.add( three.camera.position, "z" ).step( .01 ).listen()
    // f.open()

    // f = dgui.addFolder( "rotation" )
    // f.add( three.camera.rotation, "x" ).step( .01 ).listen()
    // f.add( three.camera.rotation, "y" ).step( .01 ).listen()
    // f.add( three.camera.rotation, "z" ).step( .01 ).listen()
    // f.open()

    // dgui.add( { click: () => {
    //   this._isStarted = !this._isStarted
    // } }, "click" )

    loop.add(_this._update.bind(_this));

    timeout(function () {
      depthManager.update(true);
    }, 100);
    return _this;
  }

  _createClass(Xp, [{
    key: "_update",
    value: function _update() {
      if (this._controls) {
        this._controls.update();
      }

      this._deer.update();

      var i = this._parts.length;
      while (--i > -1) {
        this._parts[i].update();
      }

      this._particles0.update();
      this._particles1.update();
      this._particles2.update();

      depthManager.update();

      if (this._isStarted) {
        this._percent += (this._percentTo - this._percent) * .09;

        if (this._percent > 0) {
          three.camera.position.x = 6.79 * this._percent;
          three.camera.position.y = -0.94 * this._percent;
          three.camera.position.z = this._zBase + (3.99 - this._zBase) * this._percent;

          three.camera.rotation.x = 0.1 * this._percent;
          three.camera.rotation.y = 0.83 * this._percent;
          three.camera.rotation.z = -0.07 * this._percent;
        } else {

          var px1 = -7.6 * -this._percent;
          var py1 = 1.87 * this._easeOutQuart(-this._percent);
          var pz1 = this._zBase + (-3.74 - this._zBase) * this._easeInQuart(-this._percent);

          three.camera.position.x = px1;
          three.camera.position.y = py1;
          three.camera.position.z = pz1;

          this._vToLook.z = -1.75 * -this._percent;
          three.camera.lookAt(this._vToLook);
        }
      }
    }
  }, {
    key: "start",
    value: function start() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      TweenMax.to(three.camera.position, 8, {
        bezier: {
          type: "soft",
          values: [{
            x: 0,
            y: -0.96,
            z: 3.2
          }, {
            x: 6.79 * this._percent,
            y: -0.94 * this._percent,
            z: this._zBase + (3.99 - this._zBase) * this._percent
          }]
        },
        ease: Cubic.easeInOut
      });
      // onComplete: ::this._onStartReady
      TweenMax.to(three.camera.rotation, 7, {
        delay: .175,
        x: 0.1 * this._percent,
        y: 0.83 * this._percent,
        z: -0.07 * this._percent,
        ease: Quart.easeInOut
      });

      var domSound = document.getElementById("bt-sound");
      TweenMax.to(domSound, 1, {
        delay: delay + 5,
        css: {
          autoAlpha: 1
        },
        ease: Quart.easeInOut
      });

      timeout(this._onStartReady.bind(this), 7500);
    }
  }, {
    key: "_onStartReady",
    value: function _onStartReady() {
      var _this2 = this;

      // return
      this._isStarted = true;

      TweenMax.killTweensOf([three.camera.position, three.camera.rotation]);

      var dom = document.getElementById("main");
      dom.classList.add("grab");

      var x = 0;
      var y = 0;
      var dx = 0;
      var dy = 0;
      var isDown = false;
      interactions.on(dom, "down", function (e) {
        x = e.x;
        y = e.y;
        isDown = true;
        dom.classList.remove("grab");
        dom.classList.add("grabbing");
      });
      interactions.on(window, "move", function (e) {
        if (!isDown) {
          return;
        }

        dx = e.x - x;
        dy = e.y - y;

        _this2._percentTo += -dx / 500;
        if (_this2._percentTo > 1) {
          _this2._percentTo = 1;
        } else if (_this2._percentTo < -1) {
          _this2._percentTo = -1;
        }

        if (_this2._percentTo > -.16 && _this2._percentTo < .16) {
          _this2._credits.show();
        } else {
          _this2._credits.hide();
        }

        x = e.x;
        y = e.y;
      });
      interactions.on(window, "up", function (e) {
        isDown = false;
        dom.classList.add("grab");
        dom.classList.remove("grabbing");
      });
    }
  }, {
    key: "_easeInQuad",
    value: function _easeInQuad(t) {
      return t * t;
    }
  }, {
    key: "_easeInQuart",
    value: function _easeInQuart(t) {
      return t * t * t * t;
    }
  }, {
    key: "_easeOutQuart",
    value: function _easeOutQuart(t) {
      return 1 - --t * t * t * t;
    }
  }]);

  return Xp;
})(THREE.Object3D);

module.exports = Xp;

},{"fz/core/loop":2,"fz/core/three":4,"fz/events/interactions":6,"fz/utils/browsers":7,"fz/utils/timeout":9,"xp/Credits":11,"xp/Deer":12,"xp/Part":15,"xp/Particles":16,"xp/colors":18,"xp/config":19,"xp/data":20,"xp/depthManager":21}],18:[function(require,module,exports){
"use strict";

var pinks = module.exports.pinks = [0xff0159, 0xff2529, 0xff2529, 0xfd4d36, 0xff0130, 0xff000b];
module.exports.oranges = [0xff923b, 0xffa44b, 0xff7e3c];

var greens = module.exports.greens = [0x85c567];
var blacks = module.exports.blacks = [0x020100, 0x410d00];
module.exports.blues = [0x32dcff];
module.exports.yellows = [0xfe9400, 0xff9d04];
module.exports.pinksPale = [0xff913c];

module.exports.cHoods = greens.concat([0xff2b03, 0x390a00, 0xfe2a02]).concat(greens).concat(greens);
module.exports.cEars = pinks.concat(blacks);

},{}],19:[function(require,module,exports){
"use strict";

var config = {};

// config.tex = new THREE.TextureLoader().load( 'img/stroke.png' )

// config.texPart0 = new THREE.TextureLoader().load( 'img/part_0.png' )
// config.texPart1 = new THREE.TextureLoader().load( 'img/part_1.png' )
// config.texPart2 = new THREE.TextureLoader().load( 'img/part_2.png' )

config.tex = null;

config.texPart0 = null;
config.texPart1 = null;
config.texPart2 = null;

config.geoms = {};

module.exports = config;

},{}],20:[function(require,module,exports){
"use strict";module.exports={"paths":{"backToFront":[[-1.4999999999999998,-2.5018249659170566,-1.5366593034980056,-1.4999999999999998,-2.2798231051670426,-1.7056772575550525,-1.4999999999999998,-2.0861916250047705,-1.853095826514338,-1.4999999999999998,-1.8869412444830296,-1.9549720252436336,-1.4999999999999998,-1.7505553934421,-2.0889954384214526,-1.4999999999999998,-1.6981507446280562,-2.3134014939241005,-1.4999999999999998,-1.7685516846290916,-2.7336465596666097],[-1.2999999999999998,-2.4562772698096023,-1.508683209274818,-1.2999999999999998,-2.171004680865199,-1.6242634359677717,-1.2999999999999998,-1.965640861127841,-1.7460145235573572,-1.2999999999999998,-1.7929657600259317,-1.8576083984166205,-1.2999999999999998,-1.6396731740682307,-1.9566760320537373,-1.2999999999999998,-1.5265142722357927,-2.0795800426187903,-1.2999999999999998,-1.5095141353041206,-2.3332527732191486,-1.2999999999999998,-1.4517279456224526,-2.5360917601576056,-1.2999999999999998,-1.3925165618073847,-2.743933411846963,-1.2999999999999998,-1.4409680422483797,-3.2020452718949493],[-1.0999999999999999,-2.6442398489817927,-1.2827771614344456,-1.0999999999999999,-2.267582127786885,-1.3927837560899303,-1.0999999999999999,-1.104355948572258,-0.8262372731709471,-1.0999999999999999,-1.0197595986997796,-0.9058191173565748,-1.0999999999999999,-0.9435212099543189,-0.9775384241972391,-1.0999999999999999,-0.8739839347989871,-1.0429538304747754,-1.0999999999999999,-0.8098597301075983,-1.1032770296904615,-1.0999999999999999,-0.7501267430065703,-1.1594693036997037,-1.0999999999999999,-0.6939582863330915,-1.2123083372262564,-1.0999999999999999,-1.275323488242786,-2.5130061833954986,-1.0999999999999999,-1.219333473620305,-2.7095403017939708,-1.0999999999999999,-1.161068445076565,-2.9140600915371193,-1.0999999999999999,-1.099938141206098,-3.128637466799832,-1.0999999999999999,-1.0899498394570135,-3.5330173079680263],[-0.8999999999999999,-0.27689634133059127,-1.2698610918034818,-0.8999999999999999,-0.20744163819939265,-1.1322210486508308,-0.8999999999999999,-0.15375148714834785,-1.0258219946720284,-0.8999999999999999,-0.11072779830791679,-0.9405609234757839,-0.8999999999999999,-0.07629664696420418,-0.8823864573961497,-0.8999999999999999,-0.047120569072314406,-0.8436985853774992,-0.8999999999999999,-0.02073694641887494,-0.8087135465937765,-0.8999999999999999,0.003402480023028929,-0.7767043421952788,-0.8999999999999999,0.025726356671428002,-0.7471025812617595,-0.8999999999999999,0.04657659144771992,-0.7194548892870882,-0.8999999999999999,0.06623126678765229,-0.6933925252182433,-0.8999999999999999,0.08509649806244468,-0.6699913827888349,-0.8999999999999999,0.10363448140274412,-0.6498233218584213,-0.8999999999999999,0.12175028546082689,-0.6301145631795544,-0.8999999999999999,0.13958498157381982,-0.6107116307634746,-0.8999999999999999,0.15727127175254862,-0.591470153877359,-0.8999999999999999,0.17493751871805618,-0.572250482639574,-0.8999999999999999,0.1927115033327309,-0.5529136001910024,-0.8999999999999999,0.21072414583418708,-0.5333170742464879,-0.8999999999999999,0.2291134233707699,-0.5133107950835427,-0.8999999999999999,0.24802873767766376,-0.49273222380874593,-0.8999999999999999,0.26763603692478877,-0.47140082013673856,-0.8999999999999999,0.2881240835508332,-0.44911122341448184,-0.8999999999999999,0.309712401361077,-0.4256246067210885,-0.8999999999999999,0.3326616580721944,-0.40065738136754536,-0.8999999999999999,0.3572875913264726,-0.37386604634347553,-0.8999999999999999,0.38398014927062407,-0.3448263646734673,-0.8999999999999999,0.48022822841189106,-0.36375195457656684,-0.8999999999999999,0.5413814448002991,-0.3373538682187176,-0.8999999999999999,0.3477811784134288,-0.17171687854357076,-0.8999999999999999,0.8836473462107979,-0.3253111086463345,-0.8999999999999999,0.9684456864790334,-0.23754938900660016,-0.8999999999999999,0.9149389842748739,-0.1136627340030639,-0.8999999999999999,0.3849691005727651,-0.0015669995107049344,-0.8999999999999999,0.3524666185727541,0.04090712168360733,-0.8999999999999999,0.32023559101891896,0.07590545829327511,-0.8999999999999999,0.2930532601782385,0.1054216244474101,-0.8999999999999999,0.26966355006605003,0.13081954098425075,-0.8999999999999999,0.24717896631746328,0.15182111594346548,-0.8999999999999999,0.217773470381053,0.16292985841135432,-0.8999999999999999,0.1936738570999701,0.1720341564002139,-0.8999999999999999,0.17342935072293608,0.1796820807276367,-0.8999999999999999,0.15606782530253938,0.18624087895916341,-0.8999999999999999,0.1409126346751095,0.1919661729686899,-0.8999999999999999,0.12747748375271128,0.19704167422657948,-0.8999999999999999,0.11540310475501614,0.20160310611112076,-0.8999999999999999,0.10441753182155544,0.20575321127662827,-0.8999999999999999,0.0943102951926229,0.2095715005180554,-0.8999999999999999,0.08491513804100581,0.21312078196763107,-0.8999999999999999,0.07609812057158893,0.21645165510149766,-0.8999999999999999,0.06774922335800793,0.21960568281241155,-0.8999999999999999,0.05977627609210501,0.22261768499317647,-0.8999999999999999,0.05210046030224458,0.22551743750967468,-0.8999999999999999,0.0446528913832549,0.22833096343393855,-0.8999999999999999,0.037371944954102454,0.23108154308676365,-0.8999999999999999,0.030201093447174032,0.23379053132617944,-0.8999999999999999,0.023087082935788983,0.2364780463014684,-0.8999999999999999,0.01597832036031377,0.2391635787232671,-0.8999999999999999,0.00882336499792069,0.24186656175276422,-0.8999999999999999,0.0015694294081608044,0.24460693731111416,-0.8999999999999999,-0.005839203890234623,0.24740575422373734,-0.8999999999999999,-0.013462952925228588,0.25028583707806984,-0.8999999999999999,-0.021369017785439703,0.25327257257324476,-0.8999999999999999,-0.029633933270753032,0.25639487385473725,-0.8999999999999999,-0.03834681117885452,0.2596864053781154,-0.8999999999999999,-0.047613582668500465,0.26318718557954046,-0.8999999999999999,-0.05756269633691713,0.2669457394827006,-0.8999999999999999,-0.06835296024796267,0.2710220612426735,-0.8999999999999999,-0.08018459681371559,0.2754917904343479,-0.8999999999999999,-0.09331521922997599,0.2804522475944897,-0.8999999999999999,-0.10806400682047701,0.28597968074450364,-0.8999999999999999,-0.12051403896776436,0.2820304771557849,-0.8999999999999999,-0.13391594755411274,0.2777793342785029,-0.8999999999999999,-0.14849222598306455,0.2731556762508971,-0.8999999999999999,-0.1645248867854081,0.2680700474887976,-0.8999999999999999,-0.18237882392901628,0.26240670206075745,-0.8999999999999999,-0.2025367581970905,0.2560125188642144,-0.8999999999999999,-0.2256531413315881,0.24867990300001974,-0.8999999999999999,-0.25264028301277586,0.24011946592518063,-0.8999999999999999,-0.2848117321981132,0.22991454427727454,-0.8999999999999999,-0.3219937584105015,0.21600665191669277,-0.8999999999999999,-0.3399974227094793,0.18353735814034144,-0.8999999999999999,-0.3594542721021057,0.14844727045595385,-0.8999999999999999,-0.38070691203712137,0.11011850592704542,-0.8999999999999999,-0.40419305613859047,0.06776165568586551,-0.8999999999999999,-0.4697889850871739,0.022204366261806024],[-0.7,-0.48193629020420314,-2.210185012620883,-0.7,-0.38220490961320747,-2.086082848737495,-0.7,-0.2967214634699036,-1.97971030501327,-0.7,-0.22213563976104733,-1.8868983729770088,-0.7,-0.15604160267040035,-1.8046533165651586,-0.7,-0.09666323125248735,-1.7307649943824428,-0.7,-0.04245749490249939,-1.6557862757862267,-0.7,0.006951022142449031,-1.5867511474555394,-0.7,0.052476452895893436,-1.523934924587477,-0.7,0.09466080678756206,-1.4621976007758257,-0.7,0.1341460695122389,-1.4044104302793503,-0.7,0.171443157813585,-1.349825680122807,-0.7,0.2069777143264372,-1.2978204170441985,-0.7,0.24111159494745416,-1.2478650604619994,-0.7,0.2741590784263823,-1.199499659537802,-0.7,0.30639943864272134,-1.1523154934938713,-0.7,0.33808701533676444,-1.1059403329736814,-0.7,0.36945959843058573,-1.0600261694844142,-0.7,0.4007457388248703,-1.01423851595536,-0.7,0.43217147630199393,-0.968246560368522,-0.7,0.46396691107102983,-0.9217135482211938,-0.7,0.49637302858402044,-0.8742867943229182,-0.7,0.5296492146996965,-0.8255866842604052,-0.7,0.5640819746864276,-0.7751939140288444,-0.7,0.599995508128256,-0.7226340135260998,-0.7,0.6377650175913423,-0.6673578691547062,-0.7,0.6895062292955136,-0.6191984843990257,-0.7,0.7474688245611536,-0.5661750597592237,-0.7,0.8053203389083408,-0.5018235000391488,-0.7,0.8465363792992973,-0.4179771466932225,-0.7,0.8970585857189379,-0.33024840089467655,-0.7,0.9831439222715019,-0.2411547093469386,-0.7,0.9740074386875774,-0.12100079931372967,-0.7,0.8550848520816914,-0.0034805846568715607,-0.7,0.8226611921623028,0.09547769836597567,-0.7,0.8830472366335256,0.2093087310439457,-0.7,0.9380379835552326,0.33744544578558744,-0.7,0.7368260178397004,0.35745002027687267,-0.7,0.7108813298392533,0.4366342266394745,-0.7,0.6859833880017605,0.5132267768158423,-0.7,0.6469379108303721,0.5746537989150082,-0.7,0.6045759474871022,0.6263730086605137,-0.7,0.5653803588206832,0.6746870136038086,-0.7,0.5285648512779131,0.7200672381119606,-0.7,0.49367551518695363,0.7630731888762896,-0.7,0.45875875381524533,0.8014272226137842,-0.7,0.41651313770828,0.8207330141535865,-0.7,0.3486961816986014,0.7748547692936087,-0.7,0.3117937499989829,0.782542775592201,-0.7,0.27762219076280514,0.789661850150186,-0.7,0.2456675853082937,0.7963190593553424,-0.7,0.21858973632582346,0.8140677915289349,-0.7,0.19223990853874284,0.8321126398740075,-0.7,0.16319205203611908,0.8344767228252077,-0.7,0.1351120667914455,0.8354369814617235,-0.7,0.10804145313424596,0.8363627223527397,-0.7,0.08174095008184301,0.8372621275689731,-0.7,0.055995608560201415,0.838142547780409,-0.7,0.030607365010074356,0.839010756218646,-0.7,0.005388733687594332,0.8398731643829498,-0.7,-0.019842824685364274,0.8407360146169971,-0.7,-0.04527022462154312,0.8416055620964604,-0.7,-0.07108210090844858,0.8424882576147539,-0.7,-0.09747851249757844,0.8433909426404265,-0.7,-0.12467737992577643,0.8443210694593626,-0.7,-0.15292211342603235,0.8452869620352819,-0.7,-0.1824910291645956,0.8462981380192773,-0.7,-0.21370937520513544,0.8473657200048801,-0.7,-0.24650026530682156,0.8469057915160851,-0.7,-0.2784227771845569,0.8367798338497101,-0.7,-0.3121534666635446,0.8260803144939017,-0.7,-0.3481166037819441,0.8146726531730852,-0.7,-0.38682932921407165,0.8023928106476257,-0.7,-0.42893433694536065,0.7890369216291693,-0.7,-0.4701297945249241,0.7660100475168514,-0.7,-0.4977606878052858,0.7161782146008164,-0.7,-0.5261204166965812,0.6650319394038609,-0.7,-0.552867205506584,0.6092845073015747,-0.7,-0.5779803117531195,0.5493356883486797,-0.7,-0.603888285819318,0.48748939854751105,-0.7,-0.6308263089134163,0.42318422444585013,-0.7,-0.659064243934026,0.3557759621012564,-0.7,-0.6789487064852053,0.2803919443436179,-0.7,-0.6767324467627984,0.1957431388653298,-0.7,-0.7380630141865732,0.12373387192637553,-0.7,-0.8554446644119411,0.04043220945630696],[-0.49999999999999994,-0.5525887798287819,-2.534201022302228,-0.49999999999999994,-0.4382366485790953,-2.3919053190976083,-0.49999999999999994,-0.3402212175770583,-2.269938421525011,-0.49999999999999994,-0.25470101469227874,-2.163520139026015,-0.49999999999999994,-0.17891750543547696,-2.069217849919882,-0.49999999999999994,-0.11063582940348338,-1.9809457864682085,-0.49999999999999994,-0.04797484811292618,-1.870955770488373,-0.49999999999999994,0.007767398976622613,-1.7731103406553839,-0.49999999999999994,0.05828787547819679,-1.692700710877912,-0.49999999999999994,0.10572586860820607,-1.633116351583554,-0.49999999999999994,0.15060694003957065,-1.5767436066752007,-0.49999999999999994,0.1934322834099953,-1.5229529532785775,-0.49999999999999994,0.23462960883360284,-1.4712071672947689,-0.49999999999999994,0.2745719006880958,-1.421037762733834,-0.49999999999999994,0.3135920464496126,-1.3720266172074922,-0.49999999999999994,0.35199463144129683,-1.323791157167992,-0.49999999999999994,0.39006583584972976,-1.275971926788154,-0.49999999999999994,0.42808214517034204,-1.2282216472306509,-0.49999999999999994,0.46631845114935144,-1.1801950414824178,-0.49999999999999994,0.5050560535677078,-1.1315387837361923,-0.49999999999999994,0.5445910625019046,-1.0818809457541998,-0.49999999999999994,0.5852437442035361,-1.0308192580021327,-0.49999999999999994,0.6273694588025831,-0.977907371377372,-0.49999999999999994,0.6713720229193036,-0.9226380731374939,-0.49999999999999994,0.7177206287640865,-0.864422035711975,-0.49999999999999994,0.7669719218038558,-0.8025600861107178,-0.49999999999999994,0.8171168945544796,-0.7337969131938402,-0.49999999999999994,0.8688359804475865,-0.658105391137461,-0.49999999999999994,0.9252200809399436,-0.5765372571530594,-0.49999999999999994,0.9643885139781434,-0.4761666116581458,-0.49999999999999994,0.9957795590145393,-0.36659211811077064,-0.49999999999999994,1.0285259977311514,-0.2522864480162342,-0.49999999999999994,1.0225812031437884,-0.12703511085122463,-0.49999999999999994,0.9855160261372617,-0.0040114989188776784,-0.49999999999999994,1.0390743100463469,0.12059451023048448,-0.49999999999999994,1.1586254397611768,0.2746290464326429,-0.49999999999999994,1.0626951328297176,0.3822890321272191,-0.49999999999999994,0.8522764017319917,0.4134574644551675,-0.49999999999999994,0.7866223977757381,0.48315555338577265,-0.49999999999999994,0.7731396300975819,0.5784337745253916,-0.49999999999999994,0.7565885137856989,0.6720528452326409,-0.49999999999999994,0.7303550754652943,0.7566869107366077,-0.49999999999999994,0.7002004760286984,0.8355723023013608,-0.49999999999999994,0.6502423742045274,0.8858292967547976,-0.49999999999999994,0.6035088819717431,0.9328423892097302,-0.49999999999999994,0.5454401187328091,0.9528549718622092,-0.49999999999999994,0.49062562527246834,0.9667705812748872,-0.49999999999999994,0.4378865549021582,0.9730490417837743,-0.49999999999999994,0.3916536956000103,0.9829759898226786,-0.49999999999999994,0.35381993959445057,1.006396885466886,-0.49999999999999994,0.31742758865885445,1.0289254827699068,-0.49999999999999994,0.2821468357974789,1.050765947959087,-0.49999999999999994,0.2476834058708529,1.0721004513516221,-0.49999999999999994,0.21376811818159747,1.0930956286106976,-0.49999999999999994,0.17954469912201576,1.110176796447667,-0.49999999999999994,0.14530469212713215,1.124822226586236,-0.49999999999999994,0.11123770730496702,1.1393936501936914,-0.49999999999999994,0.07709754086942572,1.1539963756699314,-0.49999999999999994,0.042635863815872754,1.1687366204315963,-0.49999999999999994,0.0075949286908671,1.1837246304352176,-0.49999999999999994,-0.02830031684698711,1.199078053432764,-0.49999999999999994,-0.0653512357000787,1.2149257909555344,-0.49999999999999994,-0.10389627925963946,1.231412608342107,-0.49999999999999994,-0.14432440209388037,1.2487048725840735,-0.49999999999999994,-0.1870923137843702,1.2669979314298012,-0.49999999999999994,-0.2325853854250165,1.285630897030548,-0.49999999999999994,-0.27956039706698654,1.2964551988379092,-0.49999999999999994,-0.3298970198073782,1.3080541059474577,-0.49999999999999994,-0.3843758029714117,1.320607477845686,-0.49999999999999994,-0.443976973949321,1.3343411851974598,-0.49999999999999994,-0.5099565143340667,1.3495446398273114,-0.49999999999999994,-0.5687146952317277,1.3309227558509957,-0.49999999999999994,-0.6001401226319103,1.2448593821967942,-0.49999999999999994,-0.6309131520380582,1.1605827009435226,-0.49999999999999994,-0.6613398948780274,1.0775598785697684,-0.49999999999999994,-0.6916435056888677,0.9951368663293678,-0.49999999999999994,-0.7219850463855457,0.9126106883156169,-0.49999999999999994,-0.7525847798546919,0.8293822498953942,-0.49999999999999994,-0.7789059186233438,0.7403034502472494,-0.49999999999999994,-0.786410371577198,0.634830527523091,-0.49999999999999994,-0.7835515277609477,0.5256385805468831,-0.49999999999999994,-0.7808251185440449,0.421504899316983,-0.49999999999999994,-0.7782037251568175,0.3213822392000113,-0.49999999999999994,-0.7887801411328976,0.22815264945336572,-0.49999999999999994,-0.9023607808294432,0.15127785993935494,-0.49999999999999994,-1.0802625758767208,0.051058127489382904],[-0.29999999999999993,-0.774954014833299,-3.553979610726566,-0.29999999999999993,-0.494268387544983,-2.697727789457721,-0.29999999999999993,-0.38372097168421315,-2.5601665380367526,-0.29999999999999993,-0.2872663896235101,-2.440141905075021,-0.29999999999999993,-0.2017934082005536,-2.3337823832746056,-0.29999999999999993,-0.12263677480136248,-2.1958239353259703,-0.29999999999999993,-0.05317879999523244,-2.073903026947146,-0.29999999999999993,0.008609948189699288,-1.9654440583791124,-0.29999999999999993,0.0643128360481232,-1.867667716555459,-0.29999999999999993,0.1151351261320005,-1.778458381123301,-0.29999999999999993,0.1637592779454311,-1.7144388861918594,-0.29999999999999993,0.21032451130229557,-1.655950754382466,-0.29999999999999993,0.2551195537012736,-1.5996860660009014,-0.29999999999999993,0.2985499618342512,-1.5451354226926162,-0.29999999999999993,0.3409776938733763,-1.4918441879024837,-0.29999999999999993,0.38273393424200686,-1.4393963783569284,-0.29999999999999993,0.4241298549266702,-1.3874011473479793,-0.29999999999999993,0.46546608659606015,-1.3354808885606042,-0.29999999999999993,0.5070415269892983,-1.283260172321139,-0.29999999999999993,0.5491620414868408,-1.2303548172694057,-0.29999999999999993,0.5921495991314563,-1.1763604150849791,-0.29999999999999993,0.6363524346731355,-1.1208395664789554,-0.29999999999999993,0.6819903891305326,-1.0630473310131818,-0.29999999999999993,0.7275243096402964,-0.9998057772626148,-0.29999999999999993,0.7751766350967002,-0.9336219945364042,-0.29999999999999993,0.8254690044693658,-0.8637714842944231,-0.29999999999999993,0.8790231646837618,-0.7893907091744992,-0.29999999999999993,0.9365949694698963,-0.7094298723711157,-0.29999999999999993,0.9655336139650226,-0.6016580410997462,-0.29999999999999993,0.9702787671192283,-0.4790749228204485,-0.29999999999999993,1.0013384232980251,-0.3686385909606352,-0.29999999999999993,1.0426397169893278,-0.2557483926902612,-0.29999999999999993,1.051284123384587,-0.13060087036580767,-0.29999999999999993,1.0152563361012306,-0.00413255552080343,-0.29999999999999993,0.9806556405201141,0.11381446498086384,-0.29999999999999993,0.9481170333963771,0.22473222825304484,-0.29999999999999993,0.9162025985241953,0.3295904853630125,-0.29999999999999993,0.8843231988767959,0.429004049418066,-0.29999999999999993,0.8545969551246531,0.5249065700933228,-0.29999999999999993,0.8257946559722487,0.6178282696188215,-0.29999999999999993,0.7976747580274965,0.7085484129547335,-0.29999999999999993,0.7700167230677095,0.7977784983864586,-0.29999999999999993,0.7228959559056056,0.8626555663404507,-0.29999999999999993,0.6713185705569935,0.914541532274685,-0.29999999999999993,0.62307031352633,0.9630784521623181,-0.29999999999999993,0.5775216213034002,1.0088996561076904,-0.29999999999999993,0.5341486703176448,1.0525321016475973,-0.29999999999999993,0.49250672593001155,1.0944231842088454,-0.29999999999999993,0.44644321908335516,1.1204872317259262,-0.29999999999999993,0.40331679384878694,1.1471845415245654,-0.29999999999999993,0.3618334158436124,1.1728647268882817,-0.29999999999999993,0.3216171404552578,1.197760515425137,-0.29999999999999993,0.28248238961342087,1.2227282499552885,-0.29999999999999993,0.2439424274251143,1.2473908799840383,-0.29999999999999993,0.20569421460052129,1.2718668127196437,-0.29999999999999993,0.16746053526259352,1.296333445134639,-0.29999999999999993,0.12896459539381938,1.3209679042437,-0.29999999999999993,0.08992195113412979,1.345952212376024,-0.29999999999999993,0.05003195807483915,1.371478758973653,-0.29999999999999993,0.008968184139072067,1.3977564356152063,-0.29999999999999993,-0.03363288735211452,1.425017865190096,-0.29999999999999993,-0.07818573793110134,1.453528284198474,-0.29999999999999993,-0.12740732578933395,1.5100732046434673,-0.29999999999999993,-0.1979936143357638,1.71305466972091,-0.29999999999999993,-0.2897765972755822,1.9623807194349907,-0.29999999999999993,-0.36161709898722705,1.9988621146723538,-0.29999999999999993,-0.43333434070345356,2.009578483698373,-0.29999999999999993,-0.5099055466249971,2.021794693076197,-0.29999999999999993,-0.5891191271294595,2.0240481284586784,-0.29999999999999993,-0.6709806368814641,2.016584532068903,-0.29999999999999993,-0.760117581221298,2.011568787811789,-0.29999999999999993,-0.783305382021643,1.833114154520623,-0.29999999999999993,-0.8308426781900726,1.7234013592335498,-0.29999999999999993,-0.8696944982994383,1.599827783858273,-0.29999999999999993,-0.7684872868759149,1.252141408588618,-0.29999999999999993,-0.7846603801651346,1.1289695709245935,-0.29999999999999993,-0.794728797931048,1.0045609655422036,-0.29999999999999993,-0.8042941575688451,0.8863683080475877,-0.29999999999999993,-0.8134575333861742,0.7731426918154041,-0.29999999999999993,-0.8243882934314313,0.6654882414042043,-0.29999999999999993,-0.8409808411561097,0.5641645251788545,-0.29999999999999993,-0.8495649312001512,0.4586120147575141,-0.29999999999999993,-0.8580437037681401,0.3543545191754345,-0.29999999999999993,-0.9414003851849131,0.27229766683511014,-0.29999999999999993,-1.1009951302954373,0.18457826476195896,-0.29999999999999993,-1.3180579882776164,0.062297421299872986],[-0.09999999999999992,-0.7675220073997714,-3.5198960362434955,-0.09999999999999992,-0.6200186623592698,-3.3840755702321355,-0.09999999999999992,-0.4355147883228552,-2.9057322121083473,-0.09999999999999992,-0.31983176455474144,-2.7167636711240264,-0.09999999999999992,-0.2216508599921363,-2.563437908602084,-0.09999999999999992,-0.13463772019924158,-2.410702084183733,-0.09999999999999992,-0.058382751877538705,-2.276850283405919,-0.09999999999999992,0.00945249740277596,-2.1577777761028405,-0.09999999999999992,0.07060633842574528,-2.050433272189711,-0.09999999999999992,0.12640197789262522,-1.9524941216981109,-0.09999999999999992,0.1778686567621522,-1.8621536783360884,-0.09999999999999992,0.22721673919459573,-1.7889485554863538,-0.09999999999999992,0.2756094985689445,-1.7281649647070338,-0.09999999999999992,0.3225280229804067,-1.6692330826513984,-0.09999999999999992,0.3683633412971399,-1.6116617585974753,-0.09999999999999992,0.4127685024182418,-1.5523512140550113,-0.09999999999999992,0.45614026391999474,-1.4921126588073532,-0.09999999999999992,0.4992093313164103,-1.4322945120226245,-0.09999999999999992,0.5422875764492097,-1.3724636183823136,-0.09999999999999992,0.5856871375569837,-1.3121864525722704,-0.09999999999999992,0.62972953362713,-1.251016460461078,-0.09999999999999992,0.6747553668466415,-1.1884805834744863,-0.09999999999999992,0.7211352488276055,-1.1240640832828301,-0.09999999999999992,0.7692827236604509,-1.0571925931166677,-0.09999999999999992,0.8196701955704706,-0.9872099960224985,-0.09999999999999992,0.8728492445420031,-0.9133502087191836,-0.09999999999999992,0.9294773045080655,-0.8347001285582589,-0.09999999999999992,0.9903536136637316,-0.7501497025351218,-0.09999999999999992,1.0125387438433568,-0.6309485950019557,-0.09999999999999992,1.01751490556845,-0.502397755545197,-0.09999999999999992,1.0223926402854973,-0.3763896136952648,-0.09999999999999992,1.0272091376664025,-0.25196343629946394,-0.09999999999999992,1.0546613618016947,-0.13102042419230991,-0.09999999999999992,1.0185398658262332,-0.0041459209817321365,-0.09999999999999992,0.989004013875511,0.11478337354330381,-0.09999999999999992,0.9639435570195547,0.2284835899458046,-0.09999999999999992,0.9397886644849127,0.33807522764634457,-0.09999999999999992,0.9124572800899375,0.4426524924108818,-0.09999999999999992,0.8849858367867671,0.5435718877574904,-0.09999999999999992,0.8581773646024387,0.6420557851323552,-0.09999999999999992,0.8323681706955175,0.7393654373603906,-0.09999999999999992,0.8009526761734964,0.829829799969318,-0.09999999999999992,0.7420949136502639,0.8855663152954873,-0.09999999999999992,0.6879882871910814,0.9372507926195532,-0.09999999999999992,0.6375831963222123,0.9855109840869525,-0.09999999999999992,0.5901370508869423,1.03093814280497,-0.09999999999999992,0.54508196199646,1.0740759921561822,-0.09999999999999992,0.5054165681871754,1.1231107734880363,-0.09999999999999992,0.46758598814677366,1.1735515448709024,-0.09999999999999992,0.43013992967775816,1.2234796208456267,-0.09999999999999992,0.3928054314472613,1.2732589498415696,-0.09999999999999992,0.35531277333185507,1.3232491586756785,-0.09999999999999992,0.3154547967137399,1.365449690699823,-0.09999999999999992,0.27406115446717083,1.4014019137576659,-0.09999999999999992,0.23248367700424366,1.4375138058937953,-0.09999999999999992,0.19110433661972903,1.4793631387953705,-0.09999999999999992,0.15000185886596773,1.5364499111849486,-0.09999999999999992,0.10666816978390306,1.5966096965199603,-0.09999999999999992,0.06057218527312935,1.6604080408456152,-0.09999999999999992,0.011092774055323426,1.728889157962584,-0.09999999999999992,-0.04262565282156369,1.8060393135500443,-0.09999999999999992,-0.10283166025893237,1.9117134486747553,-0.09999999999999992,-0.17222925368369055,2.041317321686192,-0.09999999999999992,-0.236623102263731,2.0472797148363093,-0.09999999999999992,-0.30374522065197723,2.0569768926546574,-0.09999999999999992,-0.376317409610704,2.080119041022016,-0.09999999999999992,-0.4503325072042902,2.0884071073586896,-0.09999999999999992,-0.5289073723463498,2.09713764758311,-0.09999999999999992,-0.610551263667552,2.097682939910428,-0.09999999999999992,-0.6997933634177356,2.1031791302823843,-0.09999999999999992,-0.7984631222462858,2.1130461057731607,-0.09999999999999992,-0.8389267848343805,1.963280987444931,-0.09999999999999992,-0.8972649662672969,1.861179863588983,-0.09999999999999992,-0.9516331593208038,1.7505562830386734,-0.09999999999999992,-0.9984789583093984,1.6268803279571982,-0.09999999999999992,-0.7998628572771178,1.1508428991771227,-0.09999999999999992,-0.8172289164335229,1.0330017881555316,-0.09999999999999992,-0.8340117308216739,0.919118409332683,-0.09999999999999992,-0.8480091481490051,0.8059819333835587,-0.09999999999999992,-0.8572335236821771,0.6920025850602778,-0.09999999999999992,-0.8750494417052004,0.5870191431578604,-0.09999999999999992,-0.8930389807263419,0.4820801697044338,-0.09999999999999992,-0.9062350513450756,0.3742565611390868,-0.09999999999999992,-1.0619107308883777,0.30715497779542,-0.09999999999999992,-1.2775999502762745,0.21418549037422305,-0.09999999999999992,-1.55566871114476,0.07352798584215472],[0.10000000000000009,-0.7675220073997714,-3.5198960362434955,0.10000000000000009,-0.6200186623592697,-3.3840755702321346,0.10000000000000009,-0.4355147883228551,-2.9057322121083464,0.10000000000000009,-0.31983176455474144,-2.7167636711240264,0.10000000000000009,-0.22165085999213632,-2.5634379086020846,0.10000000000000009,-0.13463772019924156,-2.410702084183732,0.10000000000000009,-0.05838275187753869,-2.2768502834059188,0.10000000000000009,0.00945249740277596,-2.1577777761028405,0.10000000000000009,0.07060633842574529,-2.0504332721897116,0.10000000000000009,0.12640197789262522,-1.9524941216981109,0.10000000000000009,0.1778686567621522,-1.8621536783360884,0.10000000000000009,0.22721673919459573,-1.7889485554863538,0.10000000000000009,0.27560949856894446,-1.7281649647070334,0.10000000000000009,0.3225280229804067,-1.6692330826513984,0.10000000000000009,0.3683633412971399,-1.6116617585974753,0.10000000000000009,0.4127685024182417,-1.5523512140550109,0.10000000000000009,0.45614026391999474,-1.4921126588073532,0.10000000000000009,0.4992093313164102,-1.432294512022624,0.10000000000000009,0.5422875764492097,-1.3724636183823136,0.10000000000000009,0.5856871375569837,-1.3121864525722704,0.10000000000000009,0.62972953362713,-1.251016460461078,0.10000000000000009,0.6747553668466415,-1.1884805834744863,0.10000000000000009,0.7211352488276053,-1.1240640832828297,0.10000000000000009,0.7692827236604509,-1.0571925931166677,0.10000000000000009,0.8196701955704706,-0.9872099960224985,0.10000000000000009,0.8728492445420031,-0.9133502087191836,0.10000000000000009,0.9294773045080655,-0.8347001285582589,0.10000000000000009,0.9903536136637316,-0.7501497025351218,0.10000000000000009,1.0125387438433568,-0.6309485950019558,0.10000000000000009,1.0175149055684503,-0.5023977555451971,0.10000000000000009,1.022392640285497,-0.3763896136952648,0.10000000000000009,1.0272091376664028,-0.251963436299464,0.10000000000000009,1.0546613618016947,-0.13102042419230991,0.10000000000000009,1.0185398658262332,-0.0041459209817321365,0.10000000000000009,0.989004013875511,0.11478337354330381,0.10000000000000009,0.9639435570195547,0.2284835899458046,0.10000000000000009,0.9397886644849127,0.33807522764634457,0.10000000000000009,0.9124572800899375,0.4426524924108818,0.10000000000000009,0.8849858367867671,0.5435718877574904,0.10000000000000009,0.8581773646024387,0.6420557851323552,0.10000000000000009,0.8323681706955173,0.7393654373603902,0.10000000000000009,0.8009526761734964,0.829829799969318,0.10000000000000009,0.7420949136502639,0.8855663152954873,0.10000000000000009,0.6879882871910812,0.9372507926195528,0.10000000000000009,0.6375831963222125,0.9855109840869529,0.10000000000000009,0.5901370508869426,1.0309381428049704,0.10000000000000009,0.54508196199646,1.0740759921561822,0.10000000000000009,0.5054165681871754,1.1231107734880363,0.10000000000000009,0.46758598814677366,1.1735515448709024,0.10000000000000009,0.43013992967775816,1.2234796208456267,0.10000000000000009,0.3928054314472613,1.2732589498415696,0.10000000000000009,0.35531277333185507,1.3232491586756785,0.10000000000000009,0.3154547967137399,1.365449690699823,0.10000000000000009,0.27406115446717094,1.4014019137576663,0.10000000000000009,0.23248367700424366,1.4375138058937953,0.10000000000000009,0.19110433661972903,1.4793631387953705,0.10000000000000009,0.15000185886596773,1.5364499111849486,0.10000000000000009,0.10666816978390303,1.5966096965199599,0.10000000000000009,0.06057218527312935,1.6604080408456152,0.10000000000000009,0.01109277405532342,1.7288891579625831,0.10000000000000009,-0.04262565282156369,1.8060393135500443,0.10000000000000009,-0.10283166025893237,1.9117134486747553,0.10000000000000009,-0.17222925368369058,2.0413173216861926,0.10000000000000009,-0.236623102263731,2.0472797148363093,0.10000000000000009,-0.3037452206519773,2.056976892654658,0.10000000000000009,-0.376317409610704,2.080119041022016,0.10000000000000009,-0.4503325072042902,2.0884071073586896,0.10000000000000009,-0.5289073723463498,2.09713764758311,0.10000000000000009,-0.610551263667552,2.097682939910428,0.10000000000000009,-0.6997933634177355,2.103179130282384,0.10000000000000009,-0.7984631222462858,2.1130461057731607,0.10000000000000009,-0.8389267848343805,1.963280987444931,0.10000000000000009,-0.8972649662672971,1.8611798635889834,0.10000000000000009,-0.9516331593208038,1.7505562830386732,0.10000000000000009,-0.9984789583093983,1.6268803279571982,0.10000000000000009,-0.7998628572771178,1.1508428991771227,0.10000000000000009,-0.8172289164335227,1.0330017881555311,0.10000000000000009,-0.8340117308216739,0.919118409332683,0.10000000000000009,-0.8480091481490051,0.8059819333835587,0.10000000000000009,-0.8572335236821771,0.6920025850602778,0.10000000000000009,-0.8750494417052002,0.5870191431578602,0.10000000000000009,-0.8930389807263417,0.4820801697044337,0.10000000000000009,-0.9062350513450756,0.3742565611390868,0.10000000000000009,-1.061910730888378,0.30715497779542006,0.10000000000000009,-1.2775999502762743,0.21418549037422302,0.10000000000000009,-1.5556620374584234,0.0735276704133549],[0.3000000000000001,-0.7749540148332991,-3.5539796107265667,0.3000000000000001,-0.494268387544983,-2.697727789457721,0.3000000000000001,-0.38372097168421315,-2.5601665380367526,0.3000000000000001,-0.2872663896235101,-2.440141905075021,0.3000000000000001,-0.2017934082005536,-2.3337823832746056,0.3000000000000001,-0.12263677480136245,-2.19582393532597,0.3000000000000001,-0.05317879999523242,-2.073903026947145,0.3000000000000001,0.008609948189699287,-1.965444058379112,0.3000000000000001,0.06431283604812321,-1.8676677165554594,0.3000000000000001,0.11513512613200053,-1.7784583811233015,0.3000000000000001,0.1637592779454311,-1.7144388861918594,0.3000000000000001,0.21032451130229557,-1.655950754382466,0.3000000000000001,0.2551195537012736,-1.5996860660009014,0.3000000000000001,0.2985499618342512,-1.5451354226926162,0.3000000000000001,0.3409776938733762,-1.4918441879024833,0.3000000000000001,0.38273393424200686,-1.4393963783569284,0.3000000000000001,0.4241298549266703,-1.3874011473479797,0.3000000000000001,0.46546608659606015,-1.3354808885606042,0.3000000000000001,0.5070415269892983,-1.283260172321139,0.3000000000000001,0.5491620414868403,-1.2303548172694048,0.3000000000000001,0.5921495991314565,-1.1763604150849796,0.3000000000000001,0.6363524346731353,-1.120839566478955,0.3000000000000001,0.6819903891305326,-1.0630473310131818,0.3000000000000001,0.7275243096402964,-0.9998057772626148,0.3000000000000001,0.7751766350967002,-0.9336219945364042,0.3000000000000001,0.8254690044693658,-0.8637714842944231,0.3000000000000001,0.8790231646837618,-0.7893907091744992,0.3000000000000001,0.9365949694698965,-0.7094298723711157,0.3000000000000001,0.9655336139650228,-0.6016580410997463,0.3000000000000001,0.9702787671192283,-0.4790749228204486,0.3000000000000001,1.0013384232980251,-0.3686385909606352,0.3000000000000001,1.0426397169893278,-0.2557483926902612,0.3000000000000001,1.051284123384587,-0.13060087036580767,0.3000000000000001,1.0152563361012306,-0.00413255552080343,0.3000000000000001,0.9806556405201141,0.11381446498086384,0.3000000000000001,0.9481170333963771,0.22473222825304484,0.3000000000000001,0.9162025985241955,0.3295904853630126,0.3000000000000001,0.8843231988767959,0.429004049418066,0.3000000000000001,0.8545969551246528,0.5249065700933226,0.3000000000000001,0.8257946559722487,0.6178282696188215,0.3000000000000001,0.7976747580274965,0.7085484129547335,0.3000000000000001,0.7700167230677093,0.7977784983864582,0.3000000000000001,0.7228959559056056,0.8626555663404507,0.3000000000000001,0.6713185705569935,0.914541532274685,0.3000000000000001,0.62307031352633,0.9630784521623181,0.3000000000000001,0.5775216213034002,1.0088996561076904,0.3000000000000001,0.5341486703176448,1.0525321016475973,0.3000000000000001,0.49250672593001155,1.0944231842088454,0.3000000000000001,0.44644321908335494,1.1204872317259258,0.3000000000000001,0.4033167938487867,1.147184541524565,0.3000000000000001,0.36183341584361217,1.1728647268882813,0.3000000000000001,0.3216171404552577,1.1977605154251365,0.3000000000000001,0.28248238961342087,1.2227282499552885,0.3000000000000001,0.24394242742511407,1.2473908799840374,0.3000000000000001,0.20569421460052129,1.2718668127196437,0.3000000000000001,0.16746053526259352,1.296333445134639,0.3000000000000001,0.12896459539381933,1.3209679042436995,0.3000000000000001,0.08992195113412979,1.345952212376024,0.3000000000000001,0.05003195807483915,1.371478758973653,0.3000000000000001,0.008968184139072063,1.397756435615206,0.3000000000000001,-0.033632887352114504,1.4250178651900955,0.3000000000000001,-0.07818573793110137,1.4535282841984745,0.3000000000000001,-0.12740732578933395,1.5100732046434668,0.3000000000000001,-0.19799361433576362,1.7130546697209081,0.3000000000000001,-0.2897765972755822,1.9623807194349907,0.3000000000000001,-0.36161709898722694,1.9988621146723533,0.3000000000000001,-0.43333434070345345,2.009578483698373,0.3000000000000001,-0.509905546624997,2.0217946930761967,0.3000000000000001,-0.5891191271294596,2.024048128458679,0.3000000000000001,-0.6709806368814639,2.0165845320689026,0.3000000000000001,-0.7601175812212978,2.0115687878117887,0.3000000000000001,-0.7849988410058383,1.8370772367428039,0.3000000000000001,-0.8315215222744655,1.7248094727651018,0.3000000000000001,-0.8696944982994381,1.5998277838582726,0.3000000000000001,-0.7684872868759147,1.2521414085886176,0.3000000000000001,-0.7846603801651346,1.1289695709245935,0.3000000000000001,-0.794728797931048,1.0045609655422036,0.3000000000000001,-0.8042941575688451,0.8863683080475877,0.3000000000000001,-0.8134575333861744,0.7731426918154041,0.3000000000000001,-0.8243882934314313,0.6654882414042043,0.3000000000000001,-0.8409808411561097,0.5641645251788545,0.3000000000000001,-0.8495649312001514,0.45861201475751423,0.3000000000000001,-0.8580437037681401,0.3543545191754345,0.3000000000000001,-0.9414003851849131,0.27229766683511014,0.3000000000000001,-1.1009951302954366,0.18457826476195885,0.3000000000000001,-1.318057988277616,0.062297421299872965],[0.5000000000000001,-0.5525887798287819,-2.534201022302228,0.5000000000000001,-0.4382366485790953,-2.3919053190976083,0.5000000000000001,-0.3402212175770583,-2.269938421525011,0.5000000000000001,-0.2547010146922787,-2.1635201390260144,0.5000000000000001,-0.17891750543547694,-2.0692178499198817,0.5000000000000001,-0.11063582940348332,-1.9809457864682076,0.5000000000000001,-0.047974848112926155,-1.8709557704883721,0.5000000000000001,0.007767398976622613,-1.7731103406553839,0.5000000000000001,0.05828787547819679,-1.692700710877912,0.5000000000000001,0.10572586860820601,-1.6331163515835532,0.5000000000000001,0.15060694003957065,-1.5767436066752007,0.5000000000000001,0.1934322834099953,-1.5229529532785775,0.5000000000000001,0.23462960883360284,-1.4712071672947689,0.5000000000000001,0.2745719006880958,-1.421037762733834,0.5000000000000001,0.3135920464496126,-1.3720266172074922,0.5000000000000001,0.3519946314412967,-1.3237911571679915,0.5000000000000001,0.39006583584972987,-1.2759719267881544,0.5000000000000001,0.42808214517034204,-1.2282216472306509,0.5000000000000001,0.46631845114935144,-1.1801950414824178,0.5000000000000001,0.5050560535677078,-1.1315387837361923,0.5000000000000001,0.5445910625019046,-1.0818809457541998,0.5000000000000001,0.5852437442035361,-1.0308192580021327,0.5000000000000001,0.6273694588025831,-0.977907371377372,0.5000000000000001,0.6713720229193036,-0.9226380731374939,0.5000000000000001,0.717720628764086,-0.8644220357119743,0.5000000000000001,0.7669719218038558,-0.8025600861107178,0.5000000000000001,0.8171168945544791,-0.7337969131938398,0.5000000000000001,0.8688359804475863,-0.6581053911374606,0.5000000000000001,0.9252200809399436,-0.5765372571530594,0.5000000000000001,0.9643885139781432,-0.4761666116581458,0.5000000000000001,0.9957795590145391,-0.3665921181107705,0.5000000000000001,1.0285259977311512,-0.2522864480162341,0.5000000000000001,1.0225812031437884,-0.12703511085122463,0.5000000000000001,0.9855160261372617,-0.0040114989188776784,0.5000000000000001,1.0390743100463475,0.12059451023048454,0.5000000000000001,1.1586254397611773,0.274629046432643,0.5000000000000001,1.0626951328297176,0.3822890321272191,0.5000000000000001,0.8522764017319922,0.4134574644551676,0.5000000000000001,0.7866223977757381,0.48315555338577265,0.5000000000000001,0.7731396300975819,0.5784337745253916,0.5000000000000001,0.7565885137856989,0.6720528452326409,0.5000000000000001,0.7303550754652939,0.7566869107366072,0.5000000000000001,0.7002004760286984,0.8355723023013608,0.5000000000000001,0.6502423742045274,0.8858292967547976,0.5000000000000001,0.6035088819717431,0.9328423892097302,0.5000000000000001,0.5454401187328091,0.9528549718622092,0.5000000000000001,0.49062562527246834,0.9667705812748872,0.5000000000000001,0.4378865549021582,0.9730490417837743,0.5000000000000001,0.39165369560001007,0.9829759898226782,0.5000000000000001,0.35381993959445057,1.006396885466886,0.5000000000000001,0.31742758865885423,1.028925482769906,0.5000000000000001,0.2821468357974788,1.0507659479590865,0.5000000000000001,0.2476834058708529,1.0721004513516221,0.5000000000000001,0.21376811818159736,1.0930956286106972,0.5000000000000001,0.17954469912201576,1.110176796447667,0.5000000000000001,0.14530469212713204,1.124822226586235,0.5000000000000001,0.11123770730496696,1.139393650193691,0.5000000000000001,0.07709754086942572,1.1539963756699314,0.5000000000000001,0.042635863815872754,1.1687366204315963,0.5000000000000001,0.0075949286908670935,1.1837246304352167,0.5000000000000001,-0.02830031684698711,1.1990780534327636,0.5000000000000001,-0.06535123570007861,1.214925790955533,0.5000000000000001,-0.10389627925963935,1.2314126083421062,0.5000000000000001,-0.1443244020938803,1.248704872584073,0.5000000000000001,-0.1870923137843702,1.2669979314298012,0.5000000000000001,-0.2325853854250164,1.2856308970305474,0.5000000000000001,-0.2795603970669863,1.2964551988379083,0.5000000000000001,-0.32989701980737807,1.3080541059474573,0.5000000000000001,-0.3843758029714116,1.3206074778456856,0.5000000000000001,-0.4439769739493208,1.3343411851974594,0.5000000000000001,-0.5099565143340662,1.34954463982731,0.5000000000000001,-0.5687146952317275,1.3309227558509953,0.5000000000000001,-0.6001401226319103,1.2448593821967942,0.5000000000000001,-0.630913152038058,1.1605827009435226,0.5000000000000001,-0.6613398948780274,1.0775598785697684,0.5000000000000001,-0.6916435056888677,0.9951368663293678,0.5000000000000001,-0.7219850463855457,0.9126106883156169,0.5000000000000001,-0.7525847798546916,0.829382249895394,0.5000000000000001,-0.7789059186233438,0.7403034502472494,0.5000000000000001,-0.786410371577198,0.634830527523091,0.5000000000000001,-0.7835515277609477,0.5256385805468831,0.5000000000000001,-0.7808251185440449,0.421504899316983,0.5000000000000001,-0.7782037251568175,0.3213822392000113,0.5000000000000001,-0.7887801411328976,0.22815264945336572,0.5000000000000001,-0.9023607808294425,0.15127785993935483,0.5000000000000001,-1.0802625758767206,0.05105812748938289],[0.7000000000000002,-0.48193629020420303,-2.2101850126208826,0.7000000000000002,-0.3822049096132074,-2.0860828487374947,0.7000000000000002,-0.2967214634699036,-1.97971030501327,0.7000000000000002,-0.22213563976104733,-1.8868983729770088,0.7000000000000002,-0.1560416026704003,-1.8046533165651581,0.7000000000000002,-0.09666323125248732,-1.7307649943824424,0.7000000000000002,-0.0424483917909359,-1.655431266447395,0.7000000000000002,0.006951022142449028,-1.5867511474555385,0.7000000000000002,0.05247645289589341,-1.523934924587476,0.7000000000000002,0.09466080678756203,-1.4621976007758253,0.7000000000000002,0.1341460695122389,-1.4044104302793503,0.7000000000000002,0.17144315781358493,-1.3498256801228066,0.7000000000000002,0.20697771432643708,-1.2978204170441976,0.7000000000000002,0.24111159494745416,-1.2478650604619994,0.7000000000000002,0.2741590784263822,-1.1994996595378016,0.7000000000000002,0.30639943864272146,-1.1523154934938717,0.7000000000000002,0.33808701533676433,-1.105940332973681,0.7000000000000002,0.36945959843058573,-1.0600261694844146,0.7000000000000002,0.4007457388248703,-1.0142385159553595,0.7000000000000002,0.4321714763019937,-0.9682465603685211,0.7000000000000002,0.4639669110710296,-0.9217135482211933,0.7000000000000002,0.49637302858402044,-0.8742867943229182,0.7000000000000002,0.5296492146996965,-0.8255866842604052,0.7000000000000002,0.5640819746864276,-0.7751939140288444,0.7000000000000002,0.5999955081282558,-0.7226340135260996,0.7000000000000002,0.6377650175913423,-0.6673578691547062,0.7000000000000002,0.6895062292955134,-0.6191984843990253,0.7000000000000002,0.7474688245611536,-0.5661750597592237,0.7000000000000002,0.8053203389083408,-0.5018235000391488,0.7000000000000002,0.846536379299297,-0.4179771466932225,0.7000000000000002,0.896283229486492,-0.3299629567108011,0.7000000000000002,0.9774644564460644,-0.23976159700666716,0.7000000000000002,0.9690987353880665,-0.12039099183255161,0.7000000000000002,0.8550848520816914,-0.0034805846568715607,0.7000000000000002,0.8226611921623028,0.09547769836597567,0.7000000000000002,0.8830472366335285,0.20930873104394637,0.7000000000000002,0.938037983555231,0.3374454457855869,0.7000000000000002,0.7368260178397004,0.35745002027687267,0.7000000000000002,0.7108813298392533,0.4366342266394745,0.7000000000000002,0.6859833880017605,0.5132267768158423,0.7000000000000002,0.6469379108303719,0.574653798915008,0.7000000000000002,0.604575947487102,0.6263730086605135,0.7000000000000002,0.5653803588206825,0.6746870136038079,0.7000000000000002,0.5285648512779129,0.7200672381119602,0.7000000000000002,0.49367551518695296,0.7630731888762887,0.7000000000000002,0.45771228794299734,0.7995991022115443,0.7000000000000002,0.4090381181350051,0.8060035979844193,0.7000000000000002,0.3486961816986014,0.7748547692936087,0.7000000000000002,0.3117937499989831,0.7825427755922019,0.7000000000000002,0.2776221907628049,0.7896618501501851,0.7000000000000002,0.2456675853082937,0.796319059355342,0.7000000000000002,0.21858973632582335,0.8140677915289345,0.7000000000000002,0.19223990853874273,0.8321126398740071,0.7000000000000002,0.16319205203611886,0.8344767228252068,0.7000000000000002,0.1351120667914455,0.8354369814617235,0.7000000000000002,0.10804145313424596,0.8363627223527397,0.7000000000000002,0.0817409500818429,0.8372621275689722,0.7000000000000002,0.055995608560201415,0.838142547780409,0.7000000000000002,0.030607365010074356,0.839010756218646,0.7000000000000002,0.005388733687594332,0.8398731643829498,0.7000000000000002,-0.019842824685364274,0.8407360146169971,0.7000000000000002,-0.04527022462154312,0.8416055620964604,0.7000000000000002,-0.07108210090844852,0.842488257614753,0.7000000000000002,-0.09747851249757844,0.8433909426404265,0.7000000000000002,-0.12467737992577632,0.8443210694593617,0.7000000000000002,-0.15292211342603212,0.845286962035281,0.7000000000000002,-0.18249102916459548,0.8462981380192769,0.7000000000000002,-0.21370937520513544,0.8473657200048801,0.7000000000000002,-0.24650026530682112,0.8469057915160838,0.7000000000000002,-0.27842277718455666,0.8367798338497097,0.7000000000000002,-0.3121534666635444,0.8260803144939013,0.7000000000000002,-0.3481166037819441,0.8146726531730852,0.7000000000000002,-0.386829329214071,0.8023928106476248,0.7000000000000002,-0.42893433694536,0.7890369216291684,0.7000000000000002,-0.4701297945249241,0.7660100475168514,0.7000000000000002,-0.4977606878052854,0.7161782146008155,0.7000000000000002,-0.5261204166965805,0.6650319394038604,0.7000000000000002,-0.5528672055065837,0.6092845073015745,0.7000000000000002,-0.5779803117531199,0.54933568834868,0.7000000000000002,-0.6038882858193175,0.48748939854751083,0.7000000000000002,-0.6308263089134163,0.42318422444585013,0.7000000000000002,-0.659064243934026,0.3557759621012564,0.7000000000000002,-0.6789487064852051,0.2803919443436178,0.7000000000000002,-0.6767324467627982,0.1957431388653298,0.7000000000000002,-0.7380630141865729,0.12373387192637547,0.7000000000000002,-0.8554446644119411,0.04043220945630696],[0.9000000000000001,-0.27252746222001256,-1.2498251838869767,0.9000000000000001,-0.20538351327677795,-1.1209877573098832,0.9000000000000001,-0.15292949880835083,-1.020337730850116,0.9000000000000001,-0.11054517691875526,-0.9390096730665731,0.9000000000000001,-0.07629664696420402,-0.882386457396148,0.9000000000000001,-0.047120569072314294,-0.8436985853774974,0.9000000000000001,-0.0207369464188749,-0.8087135465937747,0.9000000000000001,0.0034024800230289254,-0.776704342195278,0.9000000000000001,0.025726356671428002,-0.7471025812617595,0.9000000000000001,0.04657659144771986,-0.7194548892870873,0.9000000000000001,0.06623126678765223,-0.6933925252182425,0.9000000000000001,0.08509649806244457,-0.669991382788834,0.9000000000000001,0.10363448140274412,-0.6498233218584213,0.9000000000000001,0.12175028546082678,-0.6301145631795535,0.9000000000000001,0.1395849815738196,-0.6107116307634737,0.9000000000000001,0.1572712717525484,-0.5914701538773581,0.9000000000000001,0.17493751871805618,-0.572250482639574,0.9000000000000001,0.19271150333273046,-0.552913600191002,0.9000000000000001,0.21072414583418708,-0.5333170742464879,0.9000000000000001,0.22911342337076968,-0.5133107950835423,0.9000000000000001,0.2480287376776633,-0.49273222380874504,0.9000000000000001,0.26763603692478855,-0.4714008201367381,0.9000000000000001,0.28812408355083297,-0.4491112234144814,0.9000000000000001,0.309712401361077,-0.4256246067210885,0.9000000000000001,0.3326616580721937,-0.4006573813675445,0.9000000000000001,0.35728759132647236,-0.3738660463434753,0.9000000000000001,0.3839801492706236,-0.34482636467346706,0.9000000000000001,0.4802282284118906,-0.3637519545765666,0.9000000000000001,0.5413814448002991,-0.3373538682187176,0.9000000000000001,0.3477811784134288,-0.17171687854357076,0.9000000000000001,0.5530186831494919,-0.20359153647543526,0.9000000000000001,0.9467458977893595,-0.2322266624801953,0.9000000000000001,0.9025806958953537,-0.11212746567484,0.9000000000000001,0.3849691005727647,-0.0015669995107049327,0.9000000000000001,0.35246661857275363,0.04090712168360727,0.9000000000000001,0.3202355910189185,0.075905458293275,0.9000000000000001,0.2930532601782381,0.10542162444740999,0.9000000000000001,0.2696635500660496,0.13081954098425053,0.9000000000000001,0.24717896631746283,0.15182111594346526,0.9000000000000001,0.21777347038105255,0.1629298584113541,0.9000000000000001,0.19367385709996876,0.17203415640021302,0.9000000000000001,0.1734293507229352,0.1796820807276358,0.9000000000000001,0.1560678253025385,0.18624087895916253,0.9000000000000001,0.14091263467510862,0.19196617296868856,0.9000000000000001,0.12747748375271084,0.1970416742265786,0.9000000000000001,0.11540310475501592,0.2016031061111203,0.9000000000000001,0.10441753182155544,0.20575321127662827,0.9000000000000001,0.09431029519262335,0.2095715005180563,0.9000000000000001,0.08491513804100559,0.21312078196763018,0.9000000000000001,0.07609812057158849,0.21645165510149722,0.9000000000000001,0.06774922335800748,0.21960568281240977,0.9000000000000001,0.059776276092104785,0.22261768499317558,0.9000000000000001,0.052100460302244245,0.2255174375096729,0.9000000000000001,0.0446528913832549,0.22833096343393855,0.9000000000000001,0.03737194495410234,0.23108154308676276,0.9000000000000001,0.030201093447174032,0.23379053132617944,0.9000000000000001,0.023087082935788816,0.23647804630146663,0.9000000000000001,0.01597832036031377,0.2391635787232671,0.9000000000000001,0.00882336499792069,0.24186656175276422,0.9000000000000001,0.0015694294081608044,0.24460693731111416,0.9000000000000001,-0.005839203890234582,0.24740575422373556,0.9000000000000001,-0.013462952925228533,0.25028583707806895,0.9000000000000001,-0.021369017785439537,0.253272572573243,0.9000000000000001,-0.029633933270753032,0.25639487385473725,0.9000000000000001,-0.03834681117885441,0.2596864053781145,0.9000000000000001,-0.047613582668500465,0.26318718557954046,0.9000000000000001,-0.05756269633691691,0.26694573948269973,0.9000000000000001,-0.06835296024796245,0.2710220612426726,0.9000000000000001,-0.08018459681371515,0.27549179043434613,0.9000000000000001,-0.09331521922997577,0.28045224759448883,0.9000000000000001,-0.10806400682047657,0.28597968074450275,0.9000000000000001,-0.12051403896776436,0.28203047715578533,0.9000000000000001,-0.1339159475541125,0.27777933427850243,0.9000000000000001,-0.1484922259830641,0.2731556762508962,0.9000000000000001,-0.16452488678540744,0.26807004748879626,0.9000000000000001,-0.18237882392901628,0.26240670206075745,0.9000000000000001,-0.20253675819709005,0.25601251886421394,0.9000000000000001,-0.22565314133158765,0.24867990300001974,0.9000000000000001,-0.2526402830127754,0.2401194659251802,0.9000000000000001,-0.2848117321981123,0.2299145442772741,0.9000000000000001,-0.3219937584105006,0.21600665191669233,0.9000000000000001,-0.33999742270947886,0.18353735814034122,0.9000000000000001,-0.35945427210210523,0.14844727045595374,0.9000000000000001,-0.3807069120371209,0.11011850592704531,0.9000000000000001,-0.4041930561385896,0.06776165568586534,0.9000000000000001,-0.46978898508717304,0.022204366261805983],[1.1,-2.304321473374875,-1.4153496261932847,1.1,-1.12247887774005,-0.839796162039002,1.1,-1.037461770163326,-0.9215433776144324,1.1,-0.9607081096763954,-0.9953449713038673,1.1,-0.8905880660642276,-1.0627680874825676,1.1,-0.8258308722209926,-1.1250346175498906,1.1,-0.7654255575230247,-1.1831166486053486,1.1,-0.708551991911847,-1.2378027672122962,1.1,-1.2792904578759758,-2.520823038734128,1.1,-1.2224350927933472,-2.7164325608289195,1.1,-1.1633377399128426,-2.9197555882551374,1.1,-1.10140880794422,-3.1328205957283544,1.1,-1.072076891916245,-3.47508305198667],[1.3,-2.54624460622762,-1.5639425285321926,1.3,-2.21265897618704,-1.655427601314162,1.3,-1.9862096776230218,-1.7642851308911731,1.3,-1.8057891430721345,-1.8708941089270068,1.3,-1.6466087401630616,-1.964952471627857,1.3,-1.5461622868988911,-2.1063466571952896,1.3,-1.5167275582492095,-2.3444025456508197,1.3,-1.4578852217863922,-2.546848195198668,1.3,-1.3976568854706808,-2.754062344050914,1.3,-1.42315483767717,-3.1624616823897025,1.3,-1.4872042832317576,-3.7325987697847935],[1.5,-2.3728168606728604,-1.7752516615960574,1.5,-2.126786259352048,-1.8891547132370015,1.5,-1.9047266673439758,-1.973398674325547,1.5,-1.7646004683082408,-2.105755889097603,1.5,-1.7168273173590851,-2.3388447070157667,1.5,-1.7684216245146027,-2.7334455260255726]],"backToFront_mouth":[[1.237813606956931,-1.451173320677114,-2.3707958175752646,1.237813606956931,-1.406189413801978,-2.525561871983914,1.237813606956931,-1.3604725497428705,-2.682849648032456,1.237813606956931,-1.3136652945633336,-2.843888888620074,1.237813606956931,-1.29345100914528,-3.076806532591167,1.237813606956931,-1.342954315141132,-3.5174609434532984],[0.9540449768827246,0.013286639010774426,0.020397538825216444,0.9540449768827246,0.012234801159515918,0.020794899775456788,0.9540449768827246,0.011267811160581953,0.021160207093871897,0.9540449768827246,0.01036959150422434,0.02149953450612241,0.9540449768827246,0.009527208021562705,0.021817768253594494,0.9540449768827246,0.008730051393767368,0.022118916301016256,0.9540449768827246,0.007969246360177706,0.02240633152450755,0.9540449768827246,0.007237214866660846,0.022682876744402947,0.9540449768827246,0.006527344697966786,0.02295104990858743,0.9540449768827246,0.005833730848610497,0.023213081796821022,0.9540449768827246,0.005150966804806201,0.0234710148697852,0.9540449768827246,0.004473969212373863,0.023726769505653778,0.9540449768827246,0.003797823361505137,0.023982202372497596,0.9540449768827246,0.003117639269406114,0.024239160797081105,0.9540449768827246,0.0024284093012568175,0.024499536552478496,0.9540449768827246,0.0017248584361125863,0.02476532242430718,0.9540449768827246,0.001001277484993901,0.025038675217200712,0.9540449768827246,0.00025132766867520806,0.02532198958099574,0.9540449768827246,-0.0005321983680342812,0.025617988294212246,0.9540449768827246,-0.0013576794001419479,0.02592983667172888,0.9540449768827246,-0.0022350610840531915,0.026261291961368727,0.9540449768827246,-0.003176386155708699,0.02661690364097513,0.9540449768827246,-0.004196522857189744,0.027002288601774893,0.9540449768827246,-0.0053141900017869,0.02742451839517912,0.9540449768827246,-0.006553435653326889,0.02789267784493532,0.9540449768827246,-0.007945827718702114,0.028418692604286644,0.9540449768827246,-0.009533796464661348,0.029018591884477196,0.9540449768827246,-0.011375908687073721,0.029714500918625042,0.9540449768827246,-0.013555519873183375,0.030537909556213716,0.9540449768827246,-0.016195635467962877,0.031535286519053685,0.9540449768827246,-0.019485891751288342,0.03277827217669582,0.9540449768827246,-0.023735007623925775,0.03438349366479576,0.9540449768827246,-0.02948200596014594,0.03655458183887417,0.9540449768827246,-0.037760677657219244,0.039682079911270485,0.9540449768827246,-0.05083706140909783,0.044622046910127944,0.9540449768827246,-0.07482618781023032,0.05368460541266429,0.9540449768827246,-0.13389954123677095,0.07600120470924199,0.9540449768827246,-0.21094271806964615,0.0899036484270811,0.9540449768827246,-0.2575705167683209,0.07511311071791282,0.9540449768827246,-0.2929352545814017,0.04759506842523903,0.9540449768827246,-0.31281101460650884,0.011749482739658201,0.9540449768827246,-0.40861247267021295,-0.034401370029632616,0.9540449768827246,-0.9273384014049955,-0.18894175473233887,0.9540449768827246,-1.256281685062098,-0.4045321738458728],[0.667048160602564,0.5642688374506011,0.8077391657830582,0.667048160602564,0.5290562708674367,0.8451778126740321,0.667048160602564,0.48219883180678047,0.8571159204931522,0.667048160602564,0.435104373087152,0.8592372924232543,0.667048160602564,0.3925768983594944,0.8611529443618924,0.667048160602564,0.3380691298810985,0.8247316741398221,0.667048160602564,0.30029261872532165,0.8168421979425173,0.667048160602564,0.27407606886334723,0.8347957751048809,0.667048160602564,0.24840086775475467,0.852378626650534,0.667048160602564,0.2205238744749599,0.8597980708047777,0.667048160602564,0.1920530383162229,0.8607716954727405,0.667048160602564,0.16458082108672378,0.8617111701066853,0.667048160602564,0.13786678901235827,0.8626247168835821,0.667048160602564,0.11169432859983508,0.8635197433920014,0.667048160602564,0.0858632395393556,0.8644030959345628,0.667048160602564,0.060183409816907674,0.8652812758217809,0.667048160602564,0.0344691338331265,0.8661606336768513,0.667048160602564,0.00853370595278622,0.8670475543214629,0.667048160602564,-0.017816048162194925,0.8679486437892292,0.667048160602564,-0.044785646803368634,0.868870930243189,0.667048160602564,-0.07259962291130995,0.8698220920953337,0.667048160602564,-0.10150946891839169,0.8708107296984791,0.667048160602564,-0.13180348551523247,0.8718467021471272,0.667048160602564,-0.16381940472151701,0.8729415589519274,0.667048160602564,-0.19796103627726203,0.8741091093007078,0.667048160602564,-0.23472078623908377,0.8753661921328204,0.667048160602564,-0.27471086298231606,0.8767337432989994,0.667048160602564,-0.31870757865114396,0.8782383105497016,0.667048160602564,-0.3677158542463539,0.879914259432546,0.667048160602564,-0.4230657661198487,0.8818070749181612,0.667048160602564,-0.48020334402724374,0.8724269088705303,0.667048160602564,-0.514245304213647,0.8130365844530907,0.667048160602564,-0.543089016918924,0.7441822382832912,0.667048160602564,-0.5721464480772995,0.6748177135347868,0.667048160602564,-0.6016328175797296,0.6044292474674655,0.667048160602564,-0.6317760768774825,0.5324726851628543,0.667048160602564,-0.6628242178422095,0.4583560321592015,0.667048160602564,-0.6950539147207779,0.38141882478580236,0.667048160602564,-0.6953002416653127,0.2870827573938184,0.667048160602564,-0.6929089738340757,0.19574961469110308,0.667048160602564,-0.7743697374052247,0.12110225288539278,0.667048160602564,-0.9024586048282173,0.03020205187648299,0.667048160602564,-1.1307168760465518,-0.09864164445570275,0.667048160602564,-1.436336981014789,-0.29679883393210127],[0.37779426449604087,0.6743342847670846,0.8920924555102172,0.37779426449604087,0.6291999747406096,0.9374967980659776,0.37779426449604087,0.5866353727985778,0.9803160583181434,0.37779426449604087,0.5461439665723891,1.021049719202289,0.37779426449604087,0.5002537579788089,1.0453853059395937,0.37779426449604087,0.4506991738261916,1.0533579246980302,0.37779426449604087,0.41073174058571116,1.0759135410942986,0.37779426449604087,0.3729900954414833,1.0992774157313767,0.37779426449604087,0.33639355038307817,1.121932418914922,0.37779426449604087,0.3006374774009648,1.1440671298814369,0.37779426449604087,0.2654430291115175,1.165854168432976,0.37779426449604087,0.23054808958596296,1.1874557968047088,0.37779426449604087,0.19569930327363005,1.2090288541408212,0.37779426449604087,0.16064465452685195,1.2307293501217647,0.37779426449604087,0.12512613048639926,1.2527170069873819,0.37779426449604087,0.08887200909001242,1.2751600336266735,0.37779426449604087,0.05158827323029758,1.2982404406226973,0.37779426449604087,0.012948554738670522,1.3221602654051199,0.37779426449604087,-0.027418159022355712,1.3471491824546895,0.37779426449604087,-0.06994309888744724,1.3734741441822584,0.37779426449604087,-0.11446728553521751,1.3932875265629816,0.37779426449604087,-0.1615610688755943,1.4134308844184704,0.37779426449604087,-0.21187381682869294,1.4349510854901757,0.37779426449604087,-0.26615138464379473,1.4581671533971194,0.37779426449604087,-0.4006247982686483,1.8268452003961886,0.37779426449604087,-0.49347489595985017,1.9095567329026983,0.37779426449604087,-0.5779852909500459,1.923764605449748,0.37779426449604087,-0.6677900913997761,1.9298259162909916,0.37779426449604087,-0.7602691596283839,1.9196329560166985,0.37779426449604087,-0.7656379108182466,1.695468824664574,0.37779426449604087,-0.8130637597269548,1.5816296085286485,0.37779426449604087,-0.7578956884614167,1.294536753686167,0.37779426449604087,-0.7685088055895568,1.1497062341182702,0.37779426449604087,-0.7793103127027541,1.0162393411839867,0.37779426449604087,-0.7894746077248507,0.8906460456142262,0.37779426449604087,-0.7991238647471903,0.7714167250759403,0.37779426449604087,-0.8109599636380405,0.6593922814920239,0.37779426449604087,-0.8237367177120674,0.551464390599475,0.37779426449604087,-0.8325143473276078,0.44353206035648884,0.37779426449604087,-0.8385982707971171,0.3367608160955744,0.37779426449604087,-0.8929732732940194,0.24528741320158753,0.37779426449604087,-1.0475736170645853,0.1581943904176283,0.37779426449604087,-1.262147629953455,0.03731562043824445,0.37779426449604087,-1.5453424588111129,-0.13995415417859763],[0.087262032186418,0.7373301157057828,0.8920888458886527,0.087262032186418,0.6843056157893843,0.9425647374595041,0.087262032186418,0.6349246922289815,0.989844343244997,0.087262032186418,0.5883906572525643,1.0343982047498783,0.087262032186418,0.5441550155987513,1.0767514769907747,0.087262032186418,0.505638748528026,1.1259990248721952,0.087262032186418,0.46839244973301875,1.175660754625492,0.087262032186418,0.43150095447815784,1.224849413010725,0.087262032186418,0.39469579242734665,1.2739229604617996,0.087262032186418,0.3577110006226335,1.3232360142418917,0.087262032186418,0.31944866840759667,1.3696056747265488,0.087262032186418,0.2783853866659568,1.4052709649628734,0.087262032186418,0.23710040297341828,1.4411288132240183,0.087262032186418,0.1961626628252403,1.484041373921992,0.087262032186418,0.1552893883566155,1.5408098084281958,0.087262032186418,0.11216777914988987,1.6007009299465662,0.087262032186418,0.06626160997155464,1.6642992384332809,0.087262032186418,0.016941170126002388,1.7325603339919171,0.087262032186418,-0.03664202854943527,1.8095095140331865,0.087262032186418,-0.09661398072990843,1.9136274824314539,0.087262032186418,-0.16595790238368777,2.0448646859940784,0.087262032186418,-0.23072020645794517,2.0508611953923035,0.087262032186418,-0.29779519175500396,2.0570718419322795,0.087262032186418,-0.37096344086852356,2.0811814175074015,0.087262032186418,-0.4456259274094817,2.089535372053231,0.087262032186418,-0.5250172682778615,2.098356631799192,0.087262032186418,-0.6077520526620781,2.0992083153300114,0.087262032186418,-0.698703665439293,2.1061272726426505,0.087262032186418,-0.7990288917657369,2.1161597948766384,0.087262032186418,-0.8404030402318173,1.9640940633459938,0.087262032186418,-0.9003744105633716,1.861230605597913,0.087262032186418,-0.9556406181779741,1.7481783329266765,0.087262032186418,-1.006817176696888,1.6277269796270246,0.087262032186418,-0.8021524613232656,1.142414541594862,0.087262032186418,-0.8197611638533973,1.022926922031265,0.087262032186418,-0.8367665973462106,0.9075329136296655,0.087262032186418,-0.8513940009541041,0.7934402878731235,0.087262032186418,-0.8616661234526282,0.6789126470951923,0.087262032186418,-0.8798818179050751,0.5726544336782401,0.087262032186418,-0.8981013257942101,0.46637397521482604,0.087262032186418,-0.9359902416280448,0.36695941728443715,0.087262032186418,-1.1020284636751143,0.295391220970082,0.087262032186418,-1.3344873722867934,0.19519341951551647,0.087262032186418,-1.6185047384470566,0.041777006986748313],[-0.7821723252011541,0.4237349041842202,0.3592541915324563,-0.7821723252011541,0.39033219814849485,0.39552480523099454,-0.7821723252011541,0.35960246199480883,0.42889295174871234,-0.7821723252011541,0.33103968955936636,0.45990808220123247,-0.7821723252011541,0.30423628777326095,0.48901278500437506,-0.7821723252011541,0.278857501472509,0.5165705569126695,-0.7821723252011541,0.2546229242249416,0.5428858796459166,-0.7821723252011541,0.2312928048328977,0.5682190890902219,-0.7821723252011541,0.20865764212938465,0.5927976738774716,-0.7821723252011541,0.1865300474721463,0.6168251115656687,-0.7821723252011541,0.16473816188533996,0.6404880166918714,-0.7821723252011541,0.14312011021136017,0.6639621627788181,-0.7821723252011541,0.12003444904753469,0.679019345700659,-0.7821723252011541,0.09653336650567834,0.6878975320859064,-0.7821723252011541,0.07367469980139435,0.69653302805327,-0.7821723252011541,0.050369778338127114,0.692569236624152,-0.7821723252011541,0.02801959853544833,0.685479663742651,-0.7821723252011541,0.006741583258368475,0.6787301860466162,-0.7821723252011541,-0.01368305033331578,0.6722514046808916,-0.7821723252011541,-0.033443946010742104,0.6659831638279892,-0.7821723252011541,-0.05270926946390175,0.6598721206098714,-0.7821723252011541,-0.07163182588892242,0.6538698045630262,-0.7821723252011541,-0.09035413410393855,0.6479310081071539,-0.7821723252011541,-0.10901283130662553,0.642012389337185,-0.7821723252011541,-0.12774270605521776,0.6360711927444118,-0.7821723252011541,-0.14668061607591043,0.6300640064711756,-0.7821723252011541,-0.16596953503713952,0.6239454786567098,-0.7821723252011541,-0.1857629863936665,0.6176669110027828,-0.7821723252011541,-0.20623016513557157,0.6111746341329551,-0.7821723252011541,-0.22756212713041712,0.604408044306695,-0.7821723252011541,-0.24997955491307366,0.5972971400775546,-0.7821723252011541,-0.2737428130258901,0.5897593326961337,-0.7821723252011541,-0.2991653276919648,0.5816952020203452,-0.7821723252011541,-0.32663183770234605,0.5729827072557288,-0.7821723252011541,-0.35662389433076,0.563469098273139,-0.7821723252011541,-0.3897563702156912,0.5529593348347874,-0.7821723252011541,-0.4161383685365654,0.5276412502690366,-0.7821723252011541,-0.4363506765403957,0.4911887061882352,-0.7821723252011541,-0.4574999388633816,0.45304638137510755,-0.7821723252011541,-0.47981715032013383,0.4127976807203535,-0.7821723252011541,-0.50357752817658,0.3699462546969383,-0.7821723252011541,-0.5291155251951822,0.32388892359553334,-0.7821723252011541,-0.5568455471797571,0.27387831379467464,-0.7821723252011541,-0.5872912383449507,0.21897004210895865],[-0.4937041655184392,0.7427765079226154,0.72193448416822,-0.4937041655184392,0.7144055061919563,0.8134647361145702,-0.4937041655184392,0.6629183194292829,0.8746487810786254,-0.4937041655184392,0.6108832896783709,0.9269951294402974,-0.4937041655184392,0.5501924617409357,0.955776535083503,-0.4937041655184392,0.48944988978738646,0.9711265102022577,-0.4937041655184392,0.4316242194654083,0.9780105183003758,-0.4937041655184392,0.3832000581337771,0.9936056231016823,-0.4937041655184392,0.3419764867539624,1.019124975798948,-0.4937041655184392,0.302526458414736,1.043546420943286,-0.4937041655184392,0.26447001524441605,1.0671051705411534,-0.4937041655184392,0.2274731554348418,1.0900079876084332,-0.4937041655184392,0.1912352123416866,1.1124409991080255,-0.4937041655184392,0.1547019885989772,1.1289093171695046,-0.4937041655184392,0.1186689052231254,1.1443216973520527,-0.4937041655184392,0.08300013800132416,1.159578249097319,-0.4937041655184392,0.04743571927931223,1.1747901680052162,-0.4937041655184392,0.011718712984928471,1.1900673529812997,-0.4937041655184392,-0.024412254537704223,1.2055216010125767,-0.4937041655184392,-0.06123074043142557,1.2212699203118378,-0.4937041655184392,-0.09903100347755184,1.2374381737746445,-0.4937041655184392,-0.13813787542680644,1.2541653012298553,-0.4937041655184392,-0.17891872202870618,1.2716084355139423,-0.4937041655184392,-0.22179848413939618,1.2899493359829277,-0.4937041655184392,-0.267279190331963,1.3094027346138186,-0.4937041655184392,-0.3140904921910218,1.3223316588004308,-0.4937041655184392,-0.3634131471974936,1.3336969205655471,-0.4937041655184392,-0.4163946087755973,1.345905269435951,-0.4937041655184392,-0.4738870549706262,1.359153070075183,-0.4937041655184392,-0.5369660122531916,1.3736881526106397,-0.4937041655184392,-0.5795348663477673,1.3269069034268295,-0.4937041655184392,-0.6081662635322904,1.2484954119058216,-0.4937041655184392,-0.6362663516550622,1.1715389920923536,-0.4937041655184392,-0.66410342939373,1.0955472789818206,-0.4937041655184392,-0.6918953225348647,1.0199559059651038,-0.4937041655184392,-0.7197819700639496,0.9441068097969596,-0.4937041655184392,-0.7479668915442019,0.867446436131833,-0.4937041655184392,-0.7761464865147865,0.7888730622599234,-0.4937041655184392,-0.7841462419524627,0.6900255133659119,-0.4937041655184392,-0.7883405927190672,0.5905073569237076,-0.4937041655184392,-0.7856835939348525,0.48902476850360554,-0.4937041655184392,-0.7831110690752641,0.39076861457644785,-0.4937041655184392,-0.7806012863208709,0.2949088604052901,-0.4937041655184392,-0.8188940893328034,0.21120185150655513],[-0.20356546721797875,0.7690034992568979,0.8403395886356522,-0.20356546721797875,0.7121975924362256,0.8974853575853372,-0.20356546721797875,0.6591804050824634,0.9502956919544401,-0.20356546721797875,0.608717851675106,0.9986109007437394,-0.20356546721797875,0.5610760816479856,1.0442253595954472,-0.20356546721797875,0.5157076188883243,1.0876632477456525,-0.20356546721797875,0.4754247266537819,1.1372085281678719,-0.20356546721797875,0.4369133187106353,1.1885570700516594,-0.20356546721797875,0.3965756308559092,1.2329992199695345,-0.20356546721797875,0.3545684372390939,1.2694843397362288,-0.20356546721797875,0.3131872959534572,1.3054257051523792,-0.20356546721797875,0.27178433567943716,1.3394100757660756,-0.20356546721797875,0.22937466699809406,1.3665490221723884,-0.20356546721797875,0.18720413295379695,1.3935349406890616,-0.20356546721797875,0.14496783394988927,1.420562943753191,-0.20356546721797875,0.10235896098999334,1.4478293656717556,-0.20356546721797875,0.05977387754748184,1.4933778045357364,-0.20356546721797875,0.015317587370663285,1.5636758289003594,-0.20356546721797875,-0.03316061503004851,1.640333639076689,-0.20356546721797875,-0.08664921493906808,1.7251721220507599,-0.20356546721797875,-0.15374834742603977,1.91102328886199,-0.20356546721797875,-0.22363144582047523,2.0125139021709093,-0.20356546721797875,-0.2900830123970047,2.0361810094054844,-0.20356546721797875,-0.3608165204759666,2.064850463797772,-0.20356546721797875,-0.4316437779892519,2.0728065033799328,-0.20356546721797875,-0.5063318660442396,2.081196230806128,-0.20356546721797875,-0.5845131221879555,2.08555632261522,-0.20356546721797875,-0.666461754199519,2.085093858570326,-0.20356546721797875,-0.7544880553783304,2.0845970961680633,-0.20356546721797875,-0.8083327003002282,1.9818791788247243,-0.20356546721797875,-0.8594486752527907,1.8753875685718147,-0.20356546721797875,-0.9080842323505963,1.7656745979429502,-0.20356546721797875,-0.9316790600020477,1.6135922965048644,-0.20356546721797875,-0.7832431781230949,1.2058260617774115,-0.20356546721797875,-0.8001816989229411,1.090886103774332,-0.20356546721797875,-0.8148269755191802,0.9779099970513594,-0.20356546721797875,-0.8240997262679097,0.8633329090193682,-0.20356546721797875,-0.8330446526632398,0.7528065240437092,-0.20356546721797875,-0.8453107866285887,0.6480979975884251,-0.20356546721797875,-0.8624890332037041,0.5478915632154323,-0.20356546721797875,-0.8734270152676731,0.443785409664463,-0.20356546721797875,-0.883125356374973,0.3392694863011675,-0.20356546721797875,-1.0380897357246666,0.27247449785635597,-0.20356546721797875,-1.2401072776971078,0.17622172410514983]],"leftToRight_neck":[[-0.5569471860604298,0.9478622150895033,-0.4397513746388997,-0.6094977613565908,0.9078669184546784,-0.43739407636100225,-0.6613554767538385,0.867737103132896,-0.4364142521569643,-0.7128230324873241,0.8272430319930617,-0.43679701640473656,-0.7644533415220405,0.7864139506576002,-0.43869548676103043,-0.8147934387652032,0.7433183762428706,-0.44116401599680133,-0.831306348147351,0.671637049968135,-0.4274887734404236,-0.8494067094257716,0.6058317612193922,-0.4173293914249909,-0.8662151712045323,0.5425392985920237,-0.4088378873522607,-0.8757828901288067,0.4779392220039336,-0.39908326360740154,-0.8776878373347965,0.41272391077092396,-0.3879540109502626,-0.8962867147174265,0.357528445374377,-0.3859857954341377,-0.9144269742701208,0.3025823342515632,-0.385275539898174,-0.9322217027967237,0.24754933521570632,-0.3858119700643745,-0.9497784334287522,0.19209204203987718,-0.38760359652024334,-0.9668538869752341,0.13581450970733722,-0.3905385040799252,-0.9687744157454024,0.07723622294584515,-0.3887393579740104,-0.9706157019419832,0.01898516806707866,-0.38832054335826527,-0.9723908900974889,-0.03934744243508054,-0.3892746617740783,-0.974111982054553,-0.09817267965512161,-0.39161859580217406,-0.9757901667843889,-0.15791562623832678,-0.3953942426699406,-0.9774284011313328,-0.21902623185375136,-0.40066719747505286,-0.9790419883449055,-0.28199694254712937,-0.40753806998576736,-0.9806438327571216,-0.34737827603901095,-0.41614112863564223,-0.9822447459156258,-0.4157989337098922,-0.4266508631943702,-0.9838562861010249,-0.48799281533174876,-0.43929219060045366,-0.9865028814929477,-0.5654137687315066,-0.454819641627765,-1.0006158290884257,-0.6562050367525418,-0.4786375810872727,-1.0166273630752953,-0.757623199973191,-0.5071526962942889,-1.0350401680724497,-0.8725856619853465,-0.5415110542954189,-1.0565443525238347,-1.0050845005021847,-0.5832983212044736,-1.061568533433353,-1.138707484553303,-0.6227143790282732,-1.048639896854938,-1.269645878050425,-0.6586830848201732,-1.0345904602249962,-1.4179140449679037,-0.7020948835370684,-1.0190471116696767,-1.5886178214230546,-0.7549477966953997,-1.0014903138789835,-1.7889402045226892,-0.8200770601987211,-0.9530231350170744,-1.9711272062329765,-0.8757712540639451,-0.8771186358578071,-2.1316786782977544,-0.9220317642145153,-0.7960535026303361,-2.3213959434906766,-0.9816378399801013,-0.6883138591587696,-2.4836410534254614,-1.0309024280479993,-0.527779601974504,-2.47189321096657,-1.011043607738696,-0.3724944088729738,-2.4587564664016055,-0.99472492243541,-0.22144856976865462,-2.4442328876303403,-0.9816976217166944,-0.07373080833495003,-2.42830455847659,-0.9717694591468422],[-0.6370176554146743,0.9404636381022775,-0.3272391580782066,-0.6864645589522822,0.9023453268207722,-0.3260504040519845,-0.755512770891217,0.8876081953426693,-0.3348060709116103,-0.8278653858721348,0.8711825803756574,-0.3449983292108212,-0.8832586685417381,0.8331083301185873,-0.3485577132441775,-0.8798300529095897,0.7432572249176217,-0.3308457917326122,-0.8761106721291609,0.6613553911312535,-0.31570846744122183,-0.872121132180327,0.5859698333743482,-0.3027355731523329,-0.9138364048761707,0.5432866856690683,-0.3070508183075138,-0.9277117546598395,0.483973096964617,-0.3030911998993109,-0.9247228037719784,0.4184700593888826,-0.29501647547981524,-0.9252666392480391,0.3574568828578799,-0.28943140269335244,-0.9425099255126499,0.303892997217315,-0.29020829701718776,-0.9596408206722615,0.24977599512302207,-0.29196170735794613,-0.969948493766938,0.19338753419535482,-0.29266323183005793,-0.9718025996202755,0.13533291616492804,-0.2918652510640196,-0.9736016018518701,0.07738193755138206,-0.2921045680561154,-0.9753580879025971,0.01912499656684101,-0.293385435106005,-0.9770839835255432,-0.039856173384462096,-0.29573075377345837,-0.9787908840162114,-0.10000071590136234,-0.2991830828959696,-0.9804903807528458,-0.1617821635936182,-0.3038065527872278,-0.9821889639322481,-0.2257229123299056,-0.30968813389502725,-0.9838988929640178,-0.2924146058814434,-0.3169451494052695,-0.9856391477489335,-0.36254397101943314,-0.3257316325311861,-0.9874251190948895,-0.43692121468881506,-0.3362433106760532,-0.9892745998618686,-0.5165224002634083,-0.3487309386179107,-0.9912087249112416,-0.602546067702525,-0.3635166868922026,-0.9932532646649088,-0.6964923116018964,-0.38101741445112847,-1.0104453736213683,-0.8123389881403913,-0.40783456884136426,-1.0310543774001197,-0.9469225611224332,-0.44073240320284235,-1.0369204767515328,-1.0864097698004427,-0.47287143111955654,-1.0215724768500642,-1.221958752419225,-0.5011809196169925,-1.0045882934542554,-1.3758856659213978,-0.5353496379127606,-0.9469119960130259,-1.4929027545419644,-0.5544197421392542,-0.8760688599015023,-1.6031622345147327,-0.5713947277174586,-0.8019142484974575,-1.7239284545477216,-0.5927060231349208,-0.72307431755448,-1.8580358091451386,-0.6191435840081546,-0.6378098140419786,-2.0091985415064944,-0.6517908496515791,-0.5459519392365929,-2.1909152763894153,-0.694846568136606,-0.4439618270993106,-2.4169285207507,-0.7524086895599986,-0.3098618411333566,-2.575033425747623,-0.7899221960515812,-0.14993486889413665,-2.5593818338828784,-0.7765757602412063,0.005227085260475367,-2.5443278394228406,-0.7664246934496899,0.15957840373266868,-2.572401279659334,-0.7720760329003311],[-0.7533470621059246,0.9895180675264568,-0.22953859933307807,-0.8245587969429766,0.9773476278870463,-0.23543432098556627,-0.8992104773748779,0.9638528184288386,-0.24237704336101373,-0.9589662596503419,0.9303461725852062,-0.2456185284690272,-0.9510912876927913,0.834822916913851,-0.23285004391678243,-0.9399561431772869,0.7452622677963534,-0.2211588637790498,-0.9294904154240546,0.6637290975316437,-0.21122772918347987,-0.9195486362424252,0.5887268666733996,-0.2027733115954753,-0.8056525033051685,0.4595433697937237,-0.17314758667324148,-0.7886900770038188,0.39733219278333776,-0.16588785867730538,-0.9847643110356477,0.43303201802666935,-0.20352165682566503,-0.972268591202119,0.36717631435034437,-0.19820079156315662,-0.969699568519578,0.3074147083106742,-0.1957142805610147,-0.9730413089852901,0.250433283080405,-0.19515333828456605,-0.9748359634112678,0.1932682011209953,-0.19498842599618071,-0.9765993668766306,0.1359888688249511,-0.19551993935279954,-0.9783438638762951,0.07818502637313762,-0.19675740084277138,-0.980081625556998,0.019431337566164497,-0.19872322265493536,-0.9818250000746462,-0.040725426111445556,-0.2014537094919795,-0.9835868850259408,-0.10278097711248474,-0.20500072970080563,-0.9853811471088174,-0.16729091881012448,-0.2094342014281103,-0.9872197205979778,-0.23489152903488109,-0.2148448837668847,-0.9891147427431539,-0.30632668173498523,-0.22134953579958794,-0.9910943184068626,-0.38248922069108904,-0.2291011081698764,-0.9931824986781916,-0.46446539704792866,-0.2382937358765287,-0.9954086859581928,-0.5536043511408066,-0.249177918708966,-0.9978096662978171,-0.6516146552773037,-0.2620798788270724,-1.0004325512713832,-0.7607045822209613,-0.27742990434676507,-1.004878767148682,-0.8851476873881818,-0.2962587710444027,-1.0121321876866283,-1.0304436040512557,-0.3197374348050752,-0.9627039143836078,-1.1331909778394715,-0.32882230033771376,-0.895150267320808,-1.2218238389534917,-0.3340837236414288,-0.8260004453686258,-1.3150393125469062,-0.3411164349142217,-0.7544137833908187,-1.414128011085456,-0.35011009474556143,-0.679416600639279,-1.5206415267205569,-0.3613219475068119,-0.5998428802015678,-1.6364929881799655,-0.3750964832109972,-0.5142518192123342,-1.764099308174576,-0.39189440907924356,-0.4208088178639866,-1.9065886844314872,-0.4123359083700152,-0.3190882688641653,-2.08103140448528,-0.4399980060613671,-0.20303408587487606,-2.2897542555317063,-0.47521223294429604,-0.06636284814024251,-2.5399783369820845,-0.5194457531594454,0.08658480811857353,-2.485785563356046,-0.5028299641483338,0.21147924423429093,-2.233344519775829,-0.44849838463296376,0.3127503245459899,-2.032120616216778,-0.40661142467668854],[-0.7917056192914944,0.943838354344031,-0.10947113598164493,-0.8527365847753843,0.9275065829522569,-0.11171402903954492,-0.9166819795835188,0.910554771597214,-0.11448717539559178,-0.993002038264208,0.9007198167366579,-0.11889847159525357,-1.0043592362167124,0.8309900671216077,-0.11589048988915324,-0.8526639459274241,0.6420784859716977,-0.09526938002265523,-0.8332404217714595,0.5690969640860373,-0.09055581550978709,-0.8156383314750246,0.5028004011730491,-0.08658896696314078,-0.8388860544412373,0.4636501278809879,-0.08734746922729886,-0.8710427314393119,0.42779401422450536,-0.08930289851113177,-0.9048216070546156,0.39016804430852203,-0.09168796245132305,-0.9406135616350388,0.3503398817020158,-0.09455626514517995,-0.9559008057792502,0.3005624165262051,-0.09567589891414424,-0.9610140885501393,0.24668537366606857,-0.09611636597331258,-0.9662796947423731,0.1921298125651819,-0.09691995248502439,-0.9717414385876784,0.1364645983858329,-0.09810196316342423,-0.9774482994899927,0.07922356534606956,-0.09968547384378484,-0.9834562238249211,0.019889118995997712,-0.10170246410454187,-0.9867438780433679,-0.041996474481361123,-0.10387055922636174,-0.9886398963282481,-0.10664952274883766,-0.10635834859707055,-0.9906166463155497,-0.17472310387628676,-0.10936933693604722,-0.9926944198586738,-0.2470256373402998,-0.11297170774927362,-0.994889437973407,-0.32453119654913043,-0.1172519959766054,-0.9972440521018506,-0.4084459693781226,-0.1223242632079583,-0.9997979668078165,-0.5002830776206313,-0.12833498934445475,-0.9921137583211617,-0.5956847961810297,-0.13405918632421526,-0.9771048661561865,-0.6957070012298896,-0.1399069258992358,-0.9610407843937878,-0.8055805330217887,-0.1468981096231473,-0.921989775146232,-0.906599079112385,-0.1517192739893774,-0.8545377577887967,-0.985362911869657,-0.1528746495948904,-0.7907659951961292,-1.072359327375366,-0.15558527543541856,-0.7237636326163264,-1.161727948622079,-0.15882584156583796,-0.6522769508011461,-1.252599504676493,-0.16245988744740458,-0.5774590424247663,-1.3487637006147715,-0.16696359286778728,-0.4983423231778946,-1.4515509212116977,-0.1724526117896486,-0.4137565933896624,-1.5625876598265847,-0.17907841345587178,-0.32225164002436735,-1.6839063226615343,-0.18703977440677594,-0.2221086333336767,-1.819101799407857,-0.19670760636556212,-0.1115131697913401,-1.9854061333082744,-0.20988985029125934,0.01512718834404687,-2.129519321011652,-0.22097865506553604,0.1323426322335385,-1.9376273331969882,-0.19813009323353464,0.2282889899588766,-1.7842155657321896,-0.18045745018704862,0.3107843566678751,-1.6662149602236918,-0.1673039496357268,0.38249169539476424,-1.564645586172293,-0.1565366656463617],[-0.7450375916774314,0.8194917193748221,0,-0.7815070952379912,0.791593389462137,0,-0.8183367234765568,0.7634195724685786,0,-0.8491197145661245,0.7290213654479674,0,-0.8464842361399971,0.6677456738988781,0,-0.8288162925791109,0.599125233926447,0,-0.8126273130413328,0.5362489351224209,0,-0.8102034919552894,0.4855545402876702,0,-0.8388380850990735,0.4534207111486892,0,-0.8688439135299229,0.41974807752233234,0,-0.9005555348790706,0.3841611977983317,0,-0.9163601459271362,0.33953691333395186,0,-0.9314163096445638,0.2929678488126142,0,-0.9377998945965942,0.24215365912667486,0,-0.9426812301001046,0.18960751811829124,0,-0.9477170062286797,0.13539886920481248,0,-0.9529529289785268,0.0790357007799839,0,-0.9584414426717109,0.019953465141595794,0,-0.9642440372825969,-0.04250975919912414,0,-0.9704342945504232,-0.10914605802337346,0,-0.9771020128556258,-0.18092208448526448,0,-0.978879425222809,-0.25759868553770005,0,-0.9493055016609602,-0.3300632632972351,0,-0.9283683156092724,-0.40877223845633126,0,-0.9116610051929692,-0.49505251306955733,0,-0.8935900358647344,-0.5883750262279794,0,-0.8738332271870397,-0.6904035895166019,0,-0.8306555850721269,-0.7831638580930824,0,-0.759592074263066,-0.8534652937192044,0,-0.6898697673052792,-0.9262054286727373,0,-0.6250232809169463,-1.0097751963422081,0,-0.5573430226562255,-1.096996937621869,0,-0.486115425129652,-1.1887902499272425,0,-0.4104956474380701,-1.2862439070931533,0,-0.32946323404906963,-1.3906730032212322,0,-0.24091826491318113,-1.4984532549147516,0,-0.14457288509779276,-1.613524481651536,0,-0.039150946354986865,-1.7445945471805149,0,0.07061331867145423,-1.7024230585047695,0,0.16352118438691704,-1.590406560285397,0,0.24260741379840378,-1.4962154705840955,0,0.31111469300498995,-1.414319362454095,0,0.37031213031400445,-1.3380297073305072,0,0.4229039536859305,-1.2702529208723203,0],[-0.7579301460509393,0.7799877471180374,0.0904669155854756,-0.7903205676509595,0.7550538746004687,0.09094286986627187,-0.8228487781834342,0.7294778029612488,0.09171974688389045,-0.8257169080983484,0.6784368965097034,0.08955627329382387,-0.8240747619249187,0.6262422096994036,0.08733620213141363,-0.8092829883855077,0.5671308205340102,0.08414890522651236,-0.795438520181512,0.5119606803010965,0.08146417893489649,-0.8099312151785716,0.4762053366863901,0.0820089404658561,-0.8365027111829431,0.446146439406371,0.08404993343799966,-0.86451129367292,0.4144252504426753,0.08651214100744814,-0.8789943389006716,0.3741405859988203,0.08792157251466298,-0.8922349475153606,0.3317080694911285,0.08952756396794326,-0.9059322073406548,0.28750713576212306,0.09152010413076289,-0.9150530772135488,0.23974692817154342,0.09341292978442695,-0.9193559126171178,0.18871059270203194,0.09519512580535461,-0.9237596664632579,0.13548155818609942,0.09739527311631241,-0.9283032412742296,0.07952038510808707,0.10005895638643059,-0.9330313697628889,0.020190714576722946,0.10324466482891614,-0.937996745178447,-0.04327276551313777,0.10702723046706475,-0.9432628871502566,-0.11180789130234925,0.11150263379090686,-0.9477771073355483,-0.18636328250675338,0.11665560068930941,-0.9381947485240563,-0.26435279450574056,0.12089589957201691,-0.9132377957484277,-0.3430509481760202,0.12394311802075403,-0.8778942755276224,-0.42180201891038016,0.12632422658350556,-0.8409434494642576,-0.5038871771992686,0.12925953007291713,-0.8020057319120832,-0.5901327430253713,0.1328096937515526,-0.7502544962404425,-0.6722148088085809,0.13518263763062788,-0.6810171950020727,-0.7408371720323603,0.13509211760851814,-0.6113612392641741,-0.8092685874136856,0.13543102499621312,-0.5408685322611242,-0.8779152486620632,0.13620462511478948,-0.47421749545570857,-0.9575182511501081,0.13892334130598988,-0.40473466663100366,-1.0410262898882547,0.1423240929856044,-0.331323737734427,-1.1284685434396509,0.14636032656143422,-0.2532039094655095,-1.2207097140292182,0.15111177711116347,-0.16943700130227968,-1.3187807999490744,0.15667875649819613,-0.07859558051029544,-1.4188243111361292,0.16260259385324732,0.019087558239052546,-1.475701558515496,0.16391344511386163,0.10878138544704538,-1.4053197779687938,0.15196350737073022,0.18434162753794947,-1.328408280059734,0.1404344483225763,0.2493481660937138,-1.2615407580012912,0.13090915741541498,0.306155774991021,-1.2024500008434291,0.12295529005708516,0.3564809948197134,-1.14947987652577,0.11625961097029203,0.4016064176458016,-1.1013894151727515,0.1105900520906658,0.442511435660111,-1.0572273623788861,0.1057714587887923],[-0.7660698014352705,0.7466532220187596,0.17320121824368162,-0.7947312029544658,0.724309053133454,0.17447958663064478,-0.8020042062122443,0.6828853688454926,0.17172304058317778,-0.8047794855543011,0.6391949785388715,0.16875237912491148,-0.8055736144072769,0.595439023527276,0.16608073397247136,-0.7928798611985792,0.5436629284922501,0.16133364151073837,-0.7838688408562984,0.49650518703877866,0.15800974158891679,-0.8072932285303347,0.4697718111240641,0.16180200230045794,-0.8319185522232972,0.44159754032816023,0.16638592440792255,-0.8447306876561171,0.40526661813865217,0.16920051457565533,-0.8562284659578783,0.36677456009902043,0.17238117054951763,-0.8680509098175655,0.3266003462913929,0.17629799262593526,-0.8803023847024063,0.28434885768434404,0.181029503812149,-0.8922058678699201,0.23931397116570552,0.18648847228556742,-0.8957253160149308,0.18936152217639246,0.19104697482179067,-0.8992719210015347,0.13668682971092194,0.1965234425900486,-0.9028728539685447,0.08068056294750181,0.20303757126487532,-0.9065589658588911,0.020606545663508113,0.21074201135638648,-0.9103663206287651,-0.044440780710487876,0.2198322026723072,-0.9143382884060904,-0.11559574856552074,0.23056029891901153,-0.9064116251123129,-0.19174312375348157,0.24004631146906807,-0.8944080998381243,-0.27370726288907454,0.25034791728407935,-0.8725678536987531,-0.35976738166386024,0.2599654149488134,-0.8334480985738031,-0.4448096711974643,0.26642943927123186,-0.7920062966541779,-0.5344021466809694,0.2741747497282432,-0.7444870183087091,-0.6268229770416249,0.28213370161619944,-0.6657951338675381,-0.6957252427984839,0.2798211885703624,-0.5712698483233101,-0.7418862691703887,0.2705668422440687,-0.48249922846076276,-0.7852619310081144,0.26282702643089406,-0.40419576486612474,-0.8384499673510235,0.260163526387302,-0.33532138819461177,-0.9128969938714615,0.26489876407992485,-0.26238548927073346,-0.9857108911110135,0.26952327695483236,-0.18531513188788595,-1.054193528951676,0.27345398337117155,-0.10554177471482157,-1.1235683105977339,0.2781732662056092,-0.0226344544261277,-1.1941330905420657,0.2837397810564173,0.059791451646763555,-1.1849078475382866,0.2715897775003774,0.13258742206147622,-1.1493416224108857,0.2553260770851796,0.19716525249947237,-1.116485233975364,0.24146107489891777,0.2540872864570134,-1.0817953678552055,0.2287268725482995,0.3028300805026789,-1.0413552530858192,0.2161213387470141,0.346379751747669,-1.0042893666177966,0.2053851557854779,0.38567654096604187,-0.9699461519166097,0.19620276019930616,0.4214546171575342,-0.9378118174176748,0.18833058736667707,0.45429656584383027,-0.9074733984446901,0.1815783219033238],[-0.7699312707063188,0.7185307831299728,0.25001648016842903,-0.780169917475114,0.6853306725098713,0.2476350639154421,-0.7829450966435578,0.6466065878259522,0.24390019406253183,-0.7854260203917098,0.608727977285263,0.2410632855132866,-0.7876383868962096,0.571428548228317,0.23907554498290784,-0.7787839845697775,0.5271362218459386,0.23464393593602417,-0.7808019859826576,0.49095750696246787,0.23436633946047736,-0.8023166778224251,0.46605807462423954,0.24078433787478604,-0.8131442133410012,0.43327381396334985,0.24487454347390414,-0.822968104887198,0.3985446639878687,0.2495911057435949,-0.8329932808895464,0.3622218398943393,0.2553621415675429,-0.8433008050797666,0.32395012031636705,0.26230111160882186,-0.8539832188235605,0.28331027046067714,0.27055243743927604,-0.8651486648614433,0.23979889297499968,0.2802995307096796,-0.8712198218520433,0.19154655834082912,0.2898771890504741,-0.873646073436825,0.13903452457108323,0.2998483116336035,-0.876003281258102,0.08254704883746972,0.31160204574827843,-0.8782989222118438,0.021214323273811952,0.3254365794218186,-0.8805399630656243,-0.046056439910561325,0.34173641206062566,-0.8750237080593402,-0.11961001708815416,0.35785037472102754,-0.861443354870072,-0.19901830394192954,0.3737313404587419,-0.8461525808891905,-0.2859972306175521,0.39238351009597916,-0.8258074390221521,-0.3809187822868241,0.41287390552618186,-0.7817217477162854,-0.4737258478696458,0.4256242170153999,-0.7343911737574331,-0.5726126092747277,0.44066791221048107,-0.6687038202793978,-0.6645366818183946,0.44866302154249116,-0.5844113510360265,-0.7400403760831857,0.44646715014831373,-0.4844503345592033,-0.788719507531642,0.4314704735156405,-0.3894802549290761,-0.8318743373630597,0.4176422856242681,-0.2943542394070475,-0.8557947584924293,0.3983181899390791,-0.2073182836902171,-0.8775722682980209,0.38197268282772057,-0.12685161045131244,-0.8976014489607467,0.36814722162189195,-0.05404132431790046,-0.95694880074275,0.37234357960667075,0.020281668060409014,-0.9963468077793185,0.37001361178394987,0.08869624512257213,-0.9775595948678464,0.34841913470234553,0.1495533650286962,-0.9593762468046774,0.32984436125157446,0.2041520214546234,-0.9416600225192675,0.31378445904550234,0.2535124287666424,-0.9242978702184255,0.29984537700743874,0.29844727123384196,-0.9071940425823009,0.28771567477547855,0.33874639916703075,-0.8879959260519672,0.27644005410960815,0.37335722362775225,-0.8637566849050584,0.26496765850576964,0.4060363928633046,-0.8428584223667714,0.2557427779864181,0.4366802661620768,-0.8234062438647429,0.2480336331900337,0.46527664818698033,-0.8044141238423101,0.2414354519476114],[-0.759941350588015,0.6859145069484249,0.31822330557490397,-0.7626256370884263,0.6519113148599942,0.31407923522296377,-0.7649720267793292,0.6184393214013517,0.31103399057087033,-0.7670044298898677,0.5852812459175709,0.3090374800238713,-0.7687412066912396,0.5522297414938317,0.3080574741152238,-0.7663977488433327,0.516522242351729,0.3065591193094739,-0.7753246084949943,0.48811971491385053,0.3106822326590095,-0.7838814391722275,0.4584575325886018,0.31581012306833633,-0.7920961154032993,0.42733009605703876,0.32202042161258304,-0.8003962684610526,0.3946986986664047,0.3295767276536401,-0.8088413717122531,0.3602451533004396,0.33862480098922343,-0.8174980565473962,0.3235931691784959,0.3493494529410843,-0.8264428967120598,0.28429044839386175,0.3619846355662555,-0.8357660769034756,0.24178452113850835,0.3768273598886276,-0.8452412465870265,0.19531202442737228,0.3941008815762588,-0.8462236823979823,0.14259037843200595,0.4100227082439454,-0.8469580862828661,0.08518057980760796,0.42872427784928013,-0.8474135892815946,0.02203622045153203,0.4507264338702355,-0.8439109513273939,-0.04797842115922224,0.4746632185821329,-0.8286945409843582,-0.12444595145017473,0.496424758205533,-0.8114513548585744,-0.2084504271191605,0.5219249084357087,-0.7917506662857412,-0.3017098612735003,0.5519213088948998,-0.7690278672215942,-0.40646107864705205,0.5874119131219597,-0.7203620956931771,-0.5099851572269949,0.6109357249848115,-0.6543943319543637,-0.6104024333515261,0.6263333163501494,-0.5799195557204093,-0.7104755546632822,0.6395716350125535,-0.4870997620874016,-0.79114898464777,0.636401371121436,-0.37215345481979467,-0.8211974648021703,0.5989834672606071,-0.2693030112427738,-0.8469876499887978,0.5669732268428189,-0.17632514440004377,-0.8690291618868438,0.539303953947746,-0.09168026440198684,-0.8888037154012212,0.5158150531769188,-0.013828184636923722,-0.9067112986331338,0.49584478098670237,0.05720217072632583,-0.9033072391712635,0.46862925255296317,0.1201056779963281,-0.8931593260250352,0.4422571277935172,0.17606624121715797,-0.8818954653704867,0.4190970474577169,0.22660262442868861,-0.8716113380289987,0.3995597292294124,0.2727639973449387,-0.8621100544494174,0.38303525066208466,0.315370624169117,-0.853236829418472,0.36905724447633004,0.3550762843409012,-0.8448673893395915,0.3572651194926477,0.3904123546717657,-0.832635569013862,0.3456079245395185,0.42152863200110735,-0.8170613922182195,0.33419109452923745,0.45077026280847177,-0.8024564806783943,0.3246451901227987,0.47849879624147196,-0.7886375039186984,0.3167470521780589,0.5050178523083395,-0.7754508725985927,0.31032329632195355]],"rightToLeft_neck":[[0.55694718606043,0.9478622150895024,-0.4397513746388999,0.6094977613565891,0.9078669184546793,-0.43739407636100247,0.661355476753839,0.8677371031328955,-0.43641425215696383,0.7128230324873241,0.8272430319930622,-0.4367970164047368,0.7644100545903787,0.7863694202133069,-0.43867064576613357,0.8102243008445233,0.7391500508508835,-0.43869008930712994,0.8313063481473519,0.671637049968135,-0.4274887734404236,0.8494067094257716,0.6058317612193926,-0.41732939142499137,0.8662151712045327,0.5425392985920245,-0.40883788735226134,0.8757828901288058,0.47793922200393335,-0.3990832636074013,0.8776878373347965,0.41272391077092463,-0.3879540109502624,0.8962867147174265,0.357528445374377,-0.3859857954341377,0.9144269742701208,0.3025823342515632,-0.385275539898174,0.9322217027967237,0.24754933521570632,-0.3858119700643745,0.9497784334287531,0.1920920420398774,-0.3876035965202438,0.9668538869752341,0.13581450970733722,-0.3905385040799252,0.9687744157454024,0.07723622294584515,-0.3887393579740104,0.9706157019419823,0.018985168067078617,-0.3883205433582644,0.972390890097488,-0.03934744243508054,-0.3892746617740783,0.974111982054553,-0.09817267965512161,-0.39161859580217406,0.9757901667843889,-0.15791562623832678,-0.3953942426699406,0.9774284011313337,-0.21902623185375147,-0.4006671974750533,0.9790419883449055,-0.2819969425471296,-0.4075380699857676,0.9806438327571216,-0.34737827603901095,-0.41614112863564223,0.9822447459156263,-0.41579893370989285,-0.42665086319437084,0.9838562861010249,-0.48799281533174876,-0.43929219060045366,0.9864647179829387,-0.5653918953295853,-0.4548020466320777,1.0001022425103958,-0.6558682260710449,-0.4783919105409542,1.0155539431323977,-0.7568232531277768,-0.5066172121650301,1.0332971214226396,-0.8711161948460902,-0.5405991292724683,1.0539855073114102,-1.0026502859270492,-0.5818856307546469,1.0601306416979752,-1.1371651083152314,-0.6218709140696712,1.047403275271738,-1.268148632427284,-0.6579063246362238,1.033562113282691,-1.4165046877114307,-0.7013970256363324,1.0182372879865085,-1.5873553671944327,-0.7543478493540856,1.0009134233060863,-1.7879097175322878,-0.8196046694840817,0.949783578503155,-1.9644268673365852,-0.8727942954083134,0.8737994405607492,-2.1236119726611493,-0.9185426085058053,0.7917737059848821,-2.308915497718005,-0.9763602922766914,0.6971172299338035,-2.5154062326013134,-1.0440874252498293,0.5329400525659391,-2.4960625474372735,-1.020929250465323,0.3750575607804116,-2.475675287668882,-1.0015696723741545,0.22235194979562167,-2.454203921420478,-0.9857023711034538,0.07383068005429357,-2.4315938069850604,-0.9730857648931366],[0.6370176554146738,0.9404636381022775,-0.3272391580782066,0.686463053550888,0.9023433479976903,-0.3260496890307556,0.7520534873534213,0.8835440834752561,-0.33327308672645595,0.8201831293256152,0.8630983577526119,-0.341796884002038,0.8685818253052391,0.8192648199491819,-0.3427658347171265,0.861216028711794,0.7275325881834571,-0.32384629046224256,0.8541032578038337,0.6447425103937752,-0.3077780457832964,0.8471716753262877,0.56920653234185,-0.2940749779186582,0.9138364048761698,0.5432866856690679,-0.3070508183075136,0.9277117546598386,0.48397309696461654,-0.30309119989931066,0.9247228037719792,0.41847005938888304,-0.29501647547981547,0.9252666392480382,0.3574568828578799,-0.28943140269335244,0.9425099255126499,0.303892997217315,-0.29020829701718776,0.9596408206722615,0.24977599512302207,-0.29196170735794613,0.969948493766938,0.19338753419535482,-0.29266323183005793,0.9718025996202764,0.13533291616492815,-0.29186525106401984,0.9736016018518692,0.07738193755138201,-0.29210456805611495,0.9753580879025963,0.019124996566840996,-0.2933854351060048,0.9770839835255423,-0.03985617338446207,-0.29573075377345814,0.9787908840162114,-0.10000071590136234,-0.2991830828959696,0.9804903807528449,-0.16178216359361808,-0.30380655278722735,0.9821889639322481,-0.2257229123299056,-0.30968813389502725,0.9838988929640187,-0.29241460588144363,-0.31694514940526997,0.9856391477489335,-0.3625439710194327,-0.32573163253118564,0.9874251190948891,-0.43692121468881484,-0.3362433106760532,0.9892745998618686,-0.5165224002634083,-0.3487309386179114,0.9912087249112416,-0.6025460677025245,-0.3635166868922024,0.9932532646649088,-0.6964923116018946,-0.38101741445112847,1.009871703476994,-0.8118777908933428,-0.4076030248884739,1.0297614862601217,-0.9457351671145382,-0.44017974659063985,1.0361347416795215,-1.0855865338070876,-0.4725131088795067,1.0210288346612302,-1.221308472242454,-0.5009142101095254,1.004301164373491,-1.3754924134924553,-0.5351966255290588,0.9452822403886012,-1.4903332795842301,-0.5534655154562594,0.8743660192136062,-1.600046121150612,-0.5702840910589256,0.8001538285360468,-1.7201439625411048,-0.5914048721498493,0.7212793248419549,-1.8534233361861974,-0.6176065936956516,0.6360149238854081,-2.0035443627758593,-0.6499566148147574,0.5439355162889844,-2.182823333633882,-0.6922802166606572,0.4426274953511883,-2.409664417710014,-0.7501473176564665,0.3116334540290066,-2.589755995029156,-0.7944385196620268,0.15034844768127492,-2.566441606185928,-0.7787178587631189,-0.005226584033792828,-2.544083863106467,-0.7663512007689951,-0.15911256536320492,-2.5648919726999195,-0.7698222026084167],[0.7461054243139582,0.9800062079944079,-0.22733213238144634,0.8126900259292205,0.9632796011565885,-0.23204545889966455,0.8818372318106142,0.9452306469531946,-0.2376941843425736,0.931511506575859,0.9037107991452378,-0.2385865854973389,0.920826624962765,0.8082580284045826,-0.22544052588522856,0.913520442108624,0.7243022148489646,-0.21493890377986757,0.9098077173229324,0.6496741065055289,-0.20675481418068553,0.9059031328219738,0.5799905430508328,-0.1997642875940272,0.9018044114164101,0.5143883205439095,-0.1938121669670887,0.7886900770038197,0.3973321927833382,-0.1658878586773056,0.9847643110356477,0.43303201802666935,-0.20352165682566503,0.9722685912021198,0.3671763143503446,-0.19820079156315684,0.969699568519578,0.30741470831067375,-0.19571428056101492,0.9730413089852892,0.2504332830804046,-0.1951533382845657,0.9748359634112669,0.1932682011209952,-0.1949884259961806,0.9765993668766324,0.13598886882495131,-0.19551993935279988,0.9783438638762951,0.07818502637313768,-0.1967574008427715,0.9800816255569988,0.019431337566164525,-0.1987232226549357,0.9818250000746462,-0.040725426111445556,-0.2014537094919795,0.9835868850259408,-0.10278097711248485,-0.2050007297008054,0.9853811471088174,-0.16729091881012437,-0.2094342014281103,0.9872197205979782,-0.2348915290348813,-0.2148448837668846,0.9891147427431539,-0.30632668173498523,-0.22134953579958794,0.9910943184068621,-0.38248922069108926,-0.2291011081698765,0.9931824986781912,-0.4644653970479282,-0.23829373587652847,0.9954086859581923,-0.5536043511408069,-0.2491779187089661,0.9978096662978171,-0.6516146552773037,-0.2620798788270724,1.0004325512713832,-0.7607045822209622,-0.27742990434676496,1.0048206601521148,-0.8850965038272243,-0.2962416399157982,1.0119763514582703,-1.0302849484460452,-0.3196882053896777,0.9622208294622798,-1.1326223424925077,-0.328657297274242,0.8945622178008534,-1.2210211883280082,-0.33386425459753266,0.8253195223061751,-1.313955244613331,-0.3408352316184893,0.7536543365028294,-1.4127044486574065,-0.34975764887598426,0.6785965235561107,-1.5188060648454655,-0.36088582061718744,0.5989854474537324,-1.6341537378096054,-0.3745603094579719,0.513388404898908,-1.7611374351464613,-0.39123642940953784,0.41998305079206766,-1.902847322348609,-0.41152676796884646,0.3183984079705475,-2.076532266395823,-0.4390467413259629,0.20275456168997188,-2.286601870112524,-0.4745579915074556,0.06633295757144667,-2.538834302339964,-0.5192117889843719,-0.08663574338783697,-2.4872478771239313,-0.5031257640718343,-0.2117833603156466,-2.236556163481722,-0.44914334424459335,-0.31341590199383107,-2.036445259701675,-0.40747675197792255],[0.7861765548563056,0.9372468347811922,-0.10870661827470057,0.845242974457121,0.9193559148275878,-0.1107323174352211,0.9089869442144236,0.9029111707312718,-0.11352611923478773,1.0000894739445707,0.9071485988752226,-0.11974709550281154,0.9929993019917398,0.8215910471656942,-0.11457969560861297,0.8526639459274241,0.6420784859716977,-0.09526938002265523,0.8332404217714595,0.5690969640860373,-0.09055581550978709,0.8156383314750242,0.5028004011730478,-0.08658896696314083,0.8388860544412373,0.4636501278809879,-0.08734746922729886,0.871042731439311,0.42779401422450514,-0.08930289851113166,0.9048216070546165,0.3901680443085227,-0.09168796245132321,0.9406135616350388,0.35033988170201535,-0.09455626514517984,0.9559008057792502,0.3005624165262051,-0.09567589891414424,0.9610140885501401,0.2466853736660688,-0.09611636597331269,0.9662796947423757,0.19212981256518236,-0.09691995248502461,0.9717414385876784,0.13646459838583302,-0.09810196316342429,0.9774482994899936,0.07922356534606961,-0.09968547384378496,0.9834562238249216,0.019889118995997726,-0.10170246410454187,0.9867438780433688,-0.04199647448136115,-0.10387055922636185,0.9886398963282481,-0.10664952274883788,-0.10635834859707055,0.9906166463155501,-0.17472310387628665,-0.10936933693604722,0.9926944198586733,-0.24702563734029948,-0.11297170774927351,0.9948894379734066,-0.32453119654913065,-0.11725199597660546,0.9972440521018497,-0.40844596937812194,-0.12232426320795797,0.9997979668078161,-0.5002830776206315,-0.1283349893444546,0.9921137583211621,-0.5956847961810305,-0.13405918632421565,0.9771048661561861,-0.6957070012298898,-0.1399069258992357,0.9610407843937874,-0.8055805330217898,-0.14689810962314753,0.9219897751462307,-0.9065990791123859,-0.15171927398937735,0.8545377577887967,-0.985362911869657,-0.1528746495948905,0.7907659951961294,-1.0723593273753664,-0.15558527543541867,0.7237240898357786,-1.1616644776886718,-0.1588171641259734,0.6521408040418417,-1.2523380553595147,-0.1624259779444462,0.577243278457694,-1.3482597434761598,-0.16690120796339242,0.4980673308673911,-1.4507499349757862,-0.17235745001036,0.41344783712234234,-1.561421615004789,-0.17894478034070388,0.3219420711150075,-1.6822886891756919,-0.18686009588298103,0.221774164086961,-1.8163624479499156,-0.19641138805141328,0.11142879680844778,-1.9839039373072653,-0.20973104364285106,-0.015128742307645826,-2.129738079146295,-0.2210013554364137,-0.13246166589212685,-1.9393701039622275,-0.19830829846850717,-0.2285411821811219,-1.78618659941439,-0.18065680261920647,-0.3110575897665254,-1.6676798508040314,-0.16745103868829542,-0.3827543670251561,-1.565720087951164,-0.15664416534289455],[0.7450375916774306,0.819491719374823,0,0.7815070952379912,0.7915933894621361,0,0.8183367234765582,0.7634195724685782,0,0.8491197145661249,0.72902136544797,0,0.8464842361399971,0.6677456738988776,0,0.8288162925791118,0.5991252339264483,0,0.8126273130413342,0.5362489351224231,0,0.8102034919552885,0.4855545402876702,0,0.8388380850990744,0.4534207111486892,0,0.8688439135299237,0.4197480775223328,0,0.9005555348790706,0.384161197798333,0,0.9163601459271362,0.33953691333395186,0,0.9314163096445638,0.2929678488126142,0,0.9377998945965942,0.24215365912667486,0,0.9426812301001055,0.18960751811829113,0,0.9477170062286788,0.13539886920481248,0,0.9529529289785277,0.07903570077998401,0,0.95844144267171,0.019953465141595766,0,0.9642440372825964,-0.04250975919912414,0,0.9704342945504227,-0.10914605802337357,0,0.9771020128556263,-0.1809220844852646,0,0.9788794252228081,-0.25759868553770005,0,0.9493055016609606,-0.3300632632972358,0,0.9283683156092724,-0.4087722384563315,0,0.9116610051929692,-0.4950525130695578,0,0.893590035864734,-0.5883750262279801,0,0.8738332271870393,-0.6904035895166021,0,0.830655585072126,-0.7831638580930824,0,0.759592074263066,-0.853465293719204,0,0.6898697673052787,-0.9262054286727377,0,0.625023280916946,-1.0097751963422086,0,0.557343022656225,-1.0969969376218702,0,0.4861154251296511,-1.188790249927243,0,0.4104956474380692,-1.2862439070931555,0,0.32946323404906885,-1.3906730032212336,0,0.24088776583760474,-1.4982635580518586,0,0.1445283044802998,-1.6130269338736012,0,0.03914054119189281,-1.7441308855711806,0,-0.07064719226955796,-1.703239720227642,0,-0.1635657616200139,-1.5908401183238903,0,-0.24263734342824061,-1.4964000534642632,0,-0.31111469300499195,-1.4143193624540928,0,-0.3703121303140051,-1.338029707330505,0,-0.42290395368593003,-1.2702529208723203,0],[0.7579301460509393,0.7799877471180392,0.09046691558547554,0.790320567650959,0.7550538746004682,0.09094286986627176,0.8228487781834346,0.7294778029612479,0.09171974688389056,0.8257169080983489,0.6784368965097056,0.08955627329382387,0.8240747619249196,0.6262422096994036,0.08733620213141363,0.8092829883855099,0.5671308205340129,0.0841489052265127,0.7954385201815111,0.5119606803010956,0.08146417893489633,0.8099312151785716,0.4762053366863901,0.0820089404658561,0.8365027111829431,0.44614643940637055,0.08404993343799955,0.86451129367292,0.4144252504426753,0.08651214100744814,0.8789943389006716,0.3741405859988203,0.08792157251466298,0.8922349475153606,0.3317080694911285,0.08952756396794326,0.9059322073406557,0.2875071357621237,0.09152010413076306,0.9150530772135483,0.23974692817154386,0.09341292978442689,0.9193559126171178,0.18871059270203172,0.09519512580535472,0.923759666463257,0.13548155818609942,0.09739527311631241,0.9283032412742291,0.07952038510808696,0.1000589563864307,0.9330313697628889,0.020190714576722946,0.10324466482891614,0.937996745178447,-0.04327276551313777,0.10702723046706486,0.9432628871502566,-0.11180789130234925,0.11150263379090686,0.9477771073355479,-0.1863632825067535,0.11665560068930969,0.9381947485240572,-0.26435279450574123,0.12089589957201724,0.9132377957484277,-0.34305094817602044,0.1239431180207543,0.8778942755276229,-0.42180201891038016,0.12632422658350562,0.8409434494642576,-0.5038871771992695,0.12925953007291707,0.8020057319120824,-0.5901327430253722,0.13280969375155277,0.7502544962404429,-0.6722148088085811,0.13518263763062804,0.6810171950020729,-0.7408371720323608,0.1350921176085182,0.6113612392641741,-0.8092685874136856,0.13543102499621335,0.5408685322611224,-0.877915248662064,0.1362046251147897,0.4742174954557081,-0.9575182511501095,0.1389233413059902,0.40473466663100366,-1.0410262898882547,0.1423240929856044,0.33132373773442525,-1.1284685434396526,0.1463603265614346,0.25320390946550975,-1.2207097140292178,0.15111177711116341,0.16943700130227735,-1.3187807999490766,0.15667875649819651,0.07859558051029564,-1.4188243111361287,0.16260259385324727,-0.01908755823905523,-1.4757015585154938,0.1639134451138614,-0.1087813854470451,-1.4053197779687943,0.15196350737073028,-0.1843416275379514,-1.3284082800597314,0.140434448322576,-0.24934816609371369,-1.2615407580012912,0.13090915741541498,-0.30615577499102264,-1.202450000843426,0.12295529005708511,-0.3564809948197136,-1.14947987652577,0.11625961097029203,-0.40160641764580096,-1.1013894151727501,0.11059005209066558,-0.44251143566011075,-1.0572273623788861,0.1057714587887923],[0.7660698014352696,0.7466532220187587,0.1732012182436815,0.7947312029544649,0.7243090531334544,0.174479586630645,0.8020042062122452,0.6828853688454926,0.17172304058317778,0.8047794855543016,0.6391949785388706,0.16875237912491114,0.8055736144072796,0.5954390235272804,0.16608073397247247,0.7928798611985783,0.5436629284922492,0.16133364151073826,0.7838688408562984,0.4965051870387782,0.15800974158891667,0.8072932285303356,0.4697718111240641,0.1618020023004585,0.8319185522232981,0.4415975403281607,0.16638592440792277,0.8447306876561171,0.40526661813865306,0.1692005145756551,0.8562284659578783,0.36677456009902043,0.17238117054951763,0.8680509098175664,0.32660034629139356,0.1762979926259356,0.8803023847024063,0.2843488576843445,0.18102950381214933,0.8922058678699201,0.2393139711657053,0.1864884722855671,0.8957253160149303,0.18936152217639224,0.19104697482179045,0.8992719210015352,0.13668682971092228,0.1965234425900486,0.9028728539685447,0.08068056294750187,0.20303757126487532,0.9065589658588915,0.020606545663508127,0.2107420113563867,0.9103663206287651,-0.04444078071048779,0.21983220267230708,0.9143382884060904,-0.1155957485655208,0.23056029891901175,0.9064116251123129,-0.1917431237534819,0.24004631146906819,0.8944080998381243,-0.27370726288907465,0.25034791728407946,0.8725678536987536,-0.3597673816638607,0.25996541494881364,0.8334480985738022,-0.4448096711974643,0.2664294392712321,0.792006296654177,-0.5344021466809707,0.2741747497282436,0.7444870183087082,-0.6268229770416258,0.2821337016161998,0.6657951338675381,-0.6957252427984839,0.27982118857036253,0.5712698483233101,-0.7418862691703887,0.270566842244069,0.48249922846076165,-0.7852619310081153,0.26282702643089484,0.4041957648661241,-0.838449967351024,0.2601635263873019,0.3353213881946111,-0.9128969938714624,0.2648987640799251,0.2623854892707326,-0.985710891111014,0.2695232769548326,0.18531513188788507,-1.0541935289516773,0.27345398337117155,0.10554177471482051,-1.1235683105977348,0.27817326620560945,0.02263445442612664,-1.1941330905420666,0.2837397810564175,-0.059791451646764526,-1.1849078475382862,0.27158977750037727,-0.13258742206147722,-1.1493416224108852,0.2553260770851793,-0.19716525249947314,-1.1164852339753621,0.24146107489891744,-0.25408728645701495,-1.0817953678552032,0.2287268725482995,-0.3028300805026791,-1.0413552530858183,0.21612133874701356,-0.34637975174766833,-1.0042893666177957,0.20538515578547767,-0.38567654096604254,-0.969946151916611,0.19620276019930571,-0.42145461715753463,-0.9378118174176748,0.18833058736667685,-0.4542965658438307,-0.9074733984446883,0.181578321903324],[0.7699312707063202,0.7185307831299714,0.2500164801684286,0.7801699174751149,0.6853306725098713,0.2476350639154421,0.7829450966435596,0.6466065878259539,0.2439001940625316,0.7854260203917107,0.6087279772852621,0.24106328551328615,0.7876383868962105,0.5714285482283161,0.2390755449829085,0.7787839845697784,0.527136221845939,0.2346439359360244,0.7808019859826585,0.4909575069624683,0.23436633946047758,0.802316677822426,0.4660580746242404,0.24078433787478648,0.8131442133410012,0.43327381396334985,0.24487454347390414,0.822968104887198,0.3985446639878687,0.2495911057435949,0.8329932808895455,0.3622218398943393,0.2553621415675429,0.8433008050797661,0.3239501203163677,0.2623011116088223,0.8539832188235605,0.28331027046067647,0.2705524374392765,0.8651486648614437,0.23979889297500057,0.28029953070967983,0.8712198218520433,0.19154655834082923,0.2898771890504743,0.873646073436825,0.13903452457108334,0.2998483116336039,0.8760032812581029,0.08254704883746983,0.3116020457482789,0.8782989222118451,0.021214323273811994,0.32543657942181925,0.8805399630656243,-0.04605643991056141,0.3417364120606263,0.8750237080593402,-0.11961001708815405,0.357850374721028,0.8614433548700715,-0.19901830394192954,0.3737313404587417,0.8461525808891905,-0.285997230617552,0.39238351009597916,0.8258074390221517,-0.38091878228682474,0.4128739055261825,0.7817217477162848,-0.4737258478696469,0.42562421701540054,0.7343911737574329,-0.5726126092747283,0.4406679122104815,0.6687038202793976,-0.6645366818183953,0.4486630215424918,0.5844113510360254,-0.7400403760831871,0.44646715014831484,0.4844503345592017,-0.7887195075316427,0.4314704735156414,0.3894802549290748,-0.8318743373630593,0.4176422856242681,0.2943542394070465,-0.8557947584924293,0.3983181899390791,0.20731828369021466,-0.8775722682980205,0.3819726828277197,0.1268516104513105,-0.8976014489607462,0.3681472216218924,0.0540413243178996,-0.9569488007427505,0.37234357960667097,-0.02028166806041106,-0.9963468077793185,0.3700136117839492,-0.08869624512257285,-0.9775595948678459,0.34841913470234553,-0.14955336502869787,-0.9593762468046769,0.3298443612515738,-0.20415202145462386,-0.9416600225192662,0.3137844590455019,-0.2535124287666437,-0.9242978702184237,0.2998453770074392,-0.2984472712338424,-0.9071940425823017,0.2877156747754792,-0.3387463991670314,-0.8879959260519663,0.27644005410960726,-0.3733572236277516,-0.8637566849050593,0.264967658505769,-0.4060363928633055,-0.8428584223667714,0.25574277798641787,-0.43668026616207634,-0.8234062438647411,0.24803363319003413,-0.46527664818698167,-0.8044141238423093,0.24143545194761118],[0.7599413505880159,0.6859145069484245,0.3182233055749035,0.7626256370884272,0.6519113148599955,0.3140792352229631,0.7649720267793301,0.6184393214013517,0.31103399057087033,0.7670044298898668,0.5852812459175722,0.309037480023872,0.7687412066912396,0.5522297414938317,0.3080574741152238,0.7663977488433327,0.5165222423517286,0.30655911930947366,0.7753246084949943,0.488119714913851,0.31068223265900974,0.7838814391722257,0.4584575325886022,0.31581012306833833,0.7920961154032993,0.42733009605703876,0.32202042161258304,0.8003962684610517,0.3946986986664043,0.32957672765364077,0.808841371712254,0.36024515330044116,0.33862480098922365,0.8174980565473957,0.3235931691784961,0.34934945294108455,0.8264428967120594,0.28429044839386175,0.3619846355662546,0.8357660769034743,0.241784521138509,0.37682735988862803,0.8452412465870265,0.1953120244273725,0.394100881576259,0.8462236823979827,0.14259037843200606,0.41002270824394516,0.8469580862828656,0.0851805798076079,0.4287242778492808,0.8474135892815946,0.022036220451532043,0.45072643387023636,0.8439109513273944,-0.04797842115922235,0.47466321858213356,0.8286945409843582,-0.12444595145017495,0.4964247582055332,0.811451354858574,-0.20845042711916062,0.5219249084357085,0.7917506662857403,-0.30170986127350086,0.5519213088949013,0.769027867221594,-0.40646107864705283,0.5874119131219613,0.7203620956931764,-0.5099851572269956,0.6109357249848126,0.6543943319543633,-0.6104024333515261,0.6263333163501494,0.5799195557204078,-0.7104755546632839,0.6395716350125551,0.4870997620873996,-0.7911489846477708,0.6364013711214365,0.3721534548197927,-0.8211974648021705,0.5989834672606076,0.269303011242773,-0.8469876499887983,0.5669732268428196,0.1763251444000415,-0.8690291618868438,0.5393039539477456,0.09168026440198473,-0.8888037154012212,0.515815053176919,0.013828184636921682,-0.9067112986331343,0.4958447809867026,-0.05720217072632769,-0.9033072391712631,0.46862925255296317,-0.12010567799632965,-0.8931593260250339,0.44225712779351656,-0.17606624121715997,-0.8818954653704867,0.41909704745771714,-0.22660262442869128,-0.8716113380289983,0.3995597292294122,-0.2727639973449396,-0.8621100544494178,0.383035250662084,-0.31537062416911743,-0.8532368294184729,0.3690572444763296,-0.3550762843409019,-0.8448673893395924,0.35726511949264794,-0.39041235467176727,-0.8326355690138607,0.34560792453951783,-0.42152863200111,-0.8170613922182186,0.3341910945292379,-0.4507702628084713,-0.8024564806783969,0.32464519012279913,-0.47849879624147285,-0.7886375039186975,0.31674705217805865,-0.5050178523083391,-0.7754508725985927,0.3103232963219529]],"rightToLeft_fullhead":[[0.619974902757598,-0.7191086126320863,0.3138066739419836,0.5884030604711445,-0.7345848203128797,0.31293978558013147,0.5569082670692405,-0.7500529979588872,0.31321086104090945,0.5252601478883441,-0.7656263682270357,0.3146248518624406,0.4932236299867445,-0.7814210112026787,0.31720775475786467,0.460551867297299,-0.7975593683644524,0.32100779021975323,0.4269784033224959,-0.8141741485214524,0.3260976381531686,0.3922080249637694,-0.831412909113415,0.33257792739034087,0.35464077552268836,-0.8464248771528444,0.3393719251599798,0.3130254123350569,-0.8557320710215865,0.34515007175308265,0.26978112850762503,-0.8653038385823608,0.3523807125162224,0.2244950319649941,-0.8752253946260105,0.3612088204555859,0.17668504629947557,-0.8855948178069606,0.3718210565462814,0.1257772427764946,-0.8965275263508481,0.38445622042280414,0.07107540778071075,-0.9081622468580481,0.39941977246821225,0.011718441532736788,-0.9206070191130813,0.41707605832929207,-0.052011905790414564,-0.9104113628922401,0.4268363133006985,-0.11830358732445734,-0.894095297286464,0.4359541878073654,-0.1877189798166583,-0.8768842269407853,0.447053251824614,-0.2609952377012168,-0.8585859130564364,0.46036777331806156,-0.3390104433246639,-0.8389697184680083,0.4761970528642019,-0.42283028631479924,-0.8177541595181674,0.49492363797626027,-0.5048100152678698,-0.780728952658118,0.5080196795642531,-0.5898269909423992,-0.7393652250906286,0.522223378305666,-0.6494215028211636,-0.6641185696065468,0.5149397955318873,-0.7049067629529775,-0.5884472952883342,0.5077379641001878,-0.7493401429924034,-0.5080161160358689,0.4960877498832508,-0.7874311530349045,-0.4284739299337095,0.48390765317634665,-0.8144125179545867,-0.34845017006259016,0.4685612596144195,-0.8288895634931657,-0.26952770218367905,0.44981441890453877,-0.8418668744184128,-0.19632378450933508,0.4337891171076449,-0.8535690067990376,-0.1278551324603679,0.4201181553217779,-0.8641766972827214,-0.06331455095182059,0.40851099670737323,-0.863581913198296,-0.0020049875707524815,0.394057486335893,-0.8614256825173583,0.05521112180406726,0.3812111836294598,-0.8591052259339893,0.10896478294669709,0.3703407688465634,-0.8566204886576667,0.1598628683790131,0.3612172018583857,-0.8535391753933679,0.20831149341845723,0.3534818581093866,-0.842159983371416,0.2523705084375316,0.34385799215593305,-0.8310545732240096,0.29413752886207933,0.3358033882171454,-0.8201381241725159,0.3340184097062744,0.32916222301508613,-0.8093341611081977,0.37236224781137217,0.3238122749709851,-0.7985719515424154,0.40947477918703523,0.31965911915358514,-0.7877843425451267,0.44562896629741333,0.31663189581157725,-0.7769058816726178,0.4810735974665139,0.3146802836611555,-0.7652294132588517,0.5156081367866507,0.31350953437258333,-0.7654911043798833,0.5586902873784334,0.31841865744636366,-0.762279325399887,0.6005623213553908,0.3231943724245141,-0.758665572962637,0.6436199741853708,0.3291920479368893,-0.7546044250307022,0.6881995910657044,0.3365186074330542,-0.7330719214152648,0.7180637187946948,0.33749896534296275,-0.7041166638428971,0.7406184914313365,0.3362639034351027,-0.6750764701082259,0.762871669194991,0.3361476247511537,-0.6429874285132633,0.7815866762244448,0.33569717495401497,-0.6449874692607991,0.8450188388728455,0.35524921367135076,-0.6542731087409832,0.9265250774802016,0.3827793516226621,-0.6451618947199451,0.99136664049963,0.4040352329122108,-0.6338430487453732,1.0622711817256172,0.42868482010500397,-0.5968168824556317,1.0981910952356846,0.4404440752843859,-0.4591882725130716,0.9358070697685728,0.37435364590836784,-0.3832488798018303,0.8749962344762903,0.3503882043200499,-0.3418556376838282,0.8879029085959296,0.35721049582116726,-0.29851252198510214,0.9009267021941758,0.3654653171850668,-0.25202843185103174,0.9112815723783463,0.3741246311180402,-0.2016858908042809,0.9157234177391,0.38192948592169196,-0.14894988822726551,0.9200342667682326,0.3913624372232747,-0.09330254772217011,0.9242315844239064,0.40260747465838365,-0.03413026280883791,0.9283320258644245,0.41589743341490926,0.029093546840625414,0.925586773500426,0.4283958489068951,0.09557822472984656,0.9139883133833933,0.4391468389488111,0.16567466148669707,0.9013658476340374,0.451928992921357,0.2401453502558366,0.8875483988735073,0.46700505391430314,0.31687677657030755,0.8640594784362614,0.480113774802541,0.3964249311712533,0.8350832498179863,0.49342951627909293,0.47553507953690577,0.7954928703001429,0.5037875258594477,0.558208215923274,0.7538714241011344,0.5163644529168863,0.6452774475989773,0.7097812186921566,0.5314161315577479,0.7128896144359436,0.640386160292248,0.5307733225078117,0.7350660282084709,0.5376193462792194,0.5010210325631514,0.7519562981330679,0.44367807234725665,0.474158012090224,0.7735361675308514,0.36198321483182316,0.4553130668139913,0.8007206882884521,0.28886393080426154,0.4434087226512744,0.8262365871062998,0.2191272333995269,0.4334355777351928,0.8426708978022281,0.15078350985428746,0.42137551550047503,0.8519514605317133,0.08528043317759054,0.40838016766148777,0.8603920643940421,0.02347239361139275,0.39740474956025906,0.8681082825365989,-0.03529372479063636,0.38822599643046884,0.8710597615896747,-0.09113979064023103,0.37886899350740655,0.8687803782082839,-0.14370101625074894,0.36908964357885865,0.8662380541338854,-0.1937100954716775,0.3609150289457024,0.863435350684151,-0.24161972138610066,0.3541938075005462,0.860370364438241,-0.28782239217288197,0.3488072334506338,0.8570370213174474,-0.33266455997840905,0.344663779878289,0.8470603532620773,-0.3736503187541407,0.33914685477951534,0.8321432664651436,-0.4109079436851011,0.3329019221645133,0.8174988909596355,-0.446827721023038,0.32795552484313717,0.8030232486556876,-0.4816941317445429,0.3242194421834961,0.7886190892542464,-0.5157633227898049,0.3216290649457616,0.7741930509499095,-0.5492710847814037,0.3201406084650229,0.7596531047260591,-0.5824396551844129,0.3197292854228888,0.7427283081096698,-0.6136843397699092,0.3194516014123743,0.7227129712722746,-0.6422689037173219,0.3189761351209037,0.7024971632849581,-0.6706918083983497,0.3195652525260595,0.6751294427996082,-0.6921429562058292,0.3180160332817241,0.6428767269809335,-0.7079008858525002,0.3151429802450163,0.6111059524259463,-0.7234530816600055,0.31344843616522833,0.5795789318426232,-0.7389156538724602,0.31290115558646403,0.54806447983557,-0.7544018315671712,0.31349113404819695,0.5163315931361527,-0.7700252987659901,0.31522915831993736,0.4841426367593207,-0.7859035521124387,0.3181472914541439,0.45124610455934544,-0.8021614930296996,0.3223003336849084,0.4173684754099485,-0.8189354926862658,0.327768384910365],[0.574962169854965,-0.7216033608711885,0.6297906786334067,0.5507426096661545,-0.751538443537016,0.6403243651986359,0.5213579529158343,-0.776278862296377,0.6483247757941348,0.48435734174036105,-0.7906990588814926,0.6498563387894984,0.4442200536426255,-0.8001481569510505,0.6496195948185304,0.40306725318633463,-0.8078208362590953,0.6502758084900537,0.3614884942925023,-0.8151001994908249,0.6529370906576513,0.31928561211428574,-0.822130340086602,0.6577295145495992,0.2761888269281254,-0.8289483475137258,0.6647295091330778,0.23190708088713596,-0.8355888350474165,0.6740510403645135,0.18611966097044885,-0.8420847097924193,0.6858502107694622,0.13860522054990765,-0.8493201414018174,0.7010352495450887,0.08877326095393256,-0.8570807736536796,0.7196986079809724,0.0360120225035081,-0.8650956290609333,0.7419546775251993,-0.020101833506794106,-0.864028591184387,0.7600186078883358,-0.07846970983074919,-0.8545769499831133,0.7743229813333503,-0.13886716922226383,-0.8421021728324187,0.789620607836905,-0.2018796837596053,-0.828867269459435,0.8082989774221412,-0.2681203194174153,-0.8147281127359447,0.830729624188189,-0.3383117729970406,-0.7995119731054188,0.857385478150694,-0.41332152689274904,-0.783008816318139,0.8888675776719426,-0.48367506410517236,-0.7486538595430332,0.9062050921717741,-0.5330282273442433,-0.6820044130462506,0.8875594076472852,-0.5801872409921853,-0.6174203957030802,0.8721842844025063,-0.6255068071449026,-0.5544641176872847,0.8598333263315023,-0.6693524478584587,-0.4927791767553946,0.8503826866402813,-0.6911233963193397,-0.4193123832668799,0.8189336131153833,-0.7083420707975256,-0.3493341672367747,0.7890584011401334,-0.7237503216727266,-0.28379878745767684,0.7632489736155272,-0.737585807775877,-0.22200536970870532,0.741008924575437,-0.7500424732394673,-0.16336692206551506,0.7219379258046392,-0.7612795765307236,-0.10738520837075793,0.7057123915389472,-0.7714284867413328,-0.05363156152340731,0.6920710112773825,-0.7805978497337263,-0.0017319849377171528,0.6808038522376534,-0.7888775444356204,0.04864462079975351,0.6717441293110689,-0.7892752587941585,0.09692813300572284,0.6588631359502832,-0.7872793886111911,0.14312675609697,0.6468024360208764,-0.7779727908833323,0.18605843863703808,0.6314417080601094,-0.7685698897347324,0.22699598594269177,0.6185697721731298,-0.7590285330373074,0.26626780579580367,0.6079715955001577,-0.7536806715919626,0.30593637300565923,0.6029769241058887,-0.750183910914644,0.3459203359169234,0.6016359155116531,-0.7465283255709432,0.3857866912401624,0.6023337219832903,-0.7426893005518984,0.4257974227660166,0.6050820543479105,-0.7372542084658811,0.46534513225861796,0.6087839323989215,-0.7296274089307113,0.5040710960490618,0.6129891417070841,-0.7216773987746716,0.5433363110435225,0.6193356949738726,-0.7091272514045115,0.5799674042247296,0.6242223148866635,-0.6949366329167947,0.6160804225727072,0.6302128092193788,-0.6829034780931118,0.6554127315594505,0.6409727136766743,-0.6607552996885415,0.6862375709774882,0.6450805523864367,-0.6260114403811725,0.7038251475471808,0.6391171546165584,-0.5916072934743974,0.7209394045051871,0.6353416392291975,-0.5573209916115633,0.7376960821531622,0.6336916897041567,-0.5229352862591359,0.7542036919313198,0.6341403438153361,-0.4882318986993508,0.7705663911514185,0.6366949168592932,-0.44950811013360026,0.7808454430020682,0.6364730414426254,-0.4103804512020255,0.7905935645871818,0.6380959322659456,-0.37066808310967647,0.7999042297949277,0.6416243590692834,-0.33015062738272616,0.8088195059692493,0.6471088768676889,-0.28859193289862484,0.817376520015447,0.6546293111146992,-0.24573419651670037,0.8256081180309875,0.664297599074632,-0.20129104384771146,0.8335434025115225,0.676261905090557,-0.15443103093546218,0.8384494065551351,0.6884470935144602,-0.10538775784649035,0.8412799842139567,0.70176130840981,-0.05428887887884851,0.8452687283983473,0.7191176276870763,-0.00039916495429640343,0.8489091840877849,0.7395920861824439,0.05580761367074219,0.836975401707698,0.749938409326147,0.11372781214118133,0.8239826485125858,0.7627393914870777,0.1736329559625135,0.8093381103432176,0.7777304536473646,0.23470575642826785,0.7891282939957165,0.791310112597094,0.2979365533302638,0.7674917397867467,0.807668678739792,0.3633834186541063,0.7434336123433187,0.826176268752242,0.42848969617827537,0.7120656883128649,0.8414831173292896,0.49538110287843384,0.6781321522543822,0.8589254082467828,0.5642875174394022,0.6414109147836906,0.8786691881897579,0.613006972628094,0.5803845569420814,0.8690726323650066,0.6563890584349097,0.5169548802427018,0.8569387547283269,0.6849702340974533,0.4460932625466887,0.8314511319855984,0.6949816752351472,0.3700325598290586,0.7909063526577871,0.7183739345753173,0.30690845062677496,0.7720768376010501,0.7456939282990871,0.2481507001391936,0.7618270973976249,0.7534432163986633,0.18604936141807427,0.7360145172506045,0.7692550585447089,0.1292514658350985,0.7224052961506007,0.7795219755799372,0.0738457595477548,0.7072464935163225,0.7806964766661979,0.020303177987144247,0.6874952334935429,0.7809997635402692,-0.03047632514675347,0.670470559161628,0.7806829986824919,-0.07891068096422632,0.6560649319881877,0.7797838796603385,-0.12537595015809522,0.6440450591729325,0.7783295980653255,-0.17020032265138396,0.6342246048324691,0.7763381810902787,-0.213674445952734,0.6264568566125512,0.7738194305539432,-0.2560597601665535,0.6206292419950454,0.770775534174807,-0.29759537559446647,0.6166592980830008,0.7672013979399468,-0.33850389704276784,0.6144918189576201,0.7630847283869269,-0.3789965093351322,0.6140969936954788,0.7584058770908415,-0.4192775790042167,0.6154694169934811,0.7447072808198394,-0.454405077304902,0.6117033651855901,0.730183301039105,-0.48859857889128877,0.6093783606504237,0.7153668489688769,-0.5223992127184784,0.608956875594135,0.6986753070992915,-0.5548121043170289,0.6091263741342852,0.6782341748848912,-0.5841905196894075,0.6081973579924802,0.6574463569112741,-0.6132721759203812,0.6091504269319774,0.6361917248234867,-0.642221441755987,0.6119998921785172,0.6143420645082194,-0.6712020958460152,0.6167888472677086,0.591757863967262,-0.7003812171601571,0.6235907554139541,0.5682845882949299,-0.7299333103398848,0.6325122124186917,0.5437482244573082,-0.7600448918644691,0.6436970815698277,0.5115347303748603,-0.7811238481817515,0.6491908973494724,0.47311346827727174,-0.7933642175292208,0.6495670595074694,0.4327513546020101,-0.802404722923586,0.649654499109908,0.39146298657945255,-0.8098882410367398,0.6508097249788096,0.34973559146764255,-0.8170938452812964,0.6540625785055583],[0.5100147998150999,-0.7038308620285494,0.9214191762596817,0.48421326972497747,-0.7354532654925712,0.9399292532729868,0.4569318628100607,-0.7679507454906922,0.9620540743922206,0.4148725560905193,-0.7771216218650583,0.9580460599518821,0.37249432392280735,-0.7851574841391127,0.9561735828875886,0.33003045435704403,-0.7929534732668504,0.9574619230758747,0.2872116204094253,-0.8005579985496842,0.9619320620991196,0.24376034566845917,-0.8080167501884166,0.9696573139364757,0.1993835884275066,-0.8153738405964424,0.9807662705015225,0.15308629001135377,-0.8190445095247005,0.9910576480811342,0.10542448791058179,-0.821170981550174,1.0032250037756603,0.05636803504344351,-0.8229032194473689,1.0188457844257401,0.0055709117151377,-0.8242323581623272,1.0381732370921082,-0.04698338736349966,-0.8186206949407993,1.053142739357443,-0.10111694988825948,-0.8115658011761306,1.070806770828316,-0.15720985959993772,-0.8037668049352806,1.0924266832376555,-0.21569888485655697,-0.7951337657107351,1.1183690548149823,-0.27708752971984896,-0.7855572447252754,1.149095532567178,-0.34101404556624004,-0.7727472867638197,1.1818864227663024,-0.40557914413792173,-0.7528809597839543,1.2110685457048271,-0.4503219621893042,-0.6958612212005493,1.1849071144424919,-0.4929241054678979,-0.6405400550652733,1.1630087501207331,-0.533685128380812,-0.5865532513844851,1.1450091371705655,-0.5728703325070197,-0.5335844943036183,1.1306332287643084,-0.5902959480508452,-0.4652533020562979,1.0822349405468792,-0.6019581138331236,-0.3994031592877505,1.0338673416074364,-0.6118357758538306,-0.3385233850159932,0.9917242724456461,-0.6201675232317587,-0.2818524530588973,0.9549511620659974,-0.6271449596170608,-0.22876422200751256,0.9228583702452955,-0.6359780625573417,-0.1796005229871116,0.8992052122420846,-0.6493432235990695,-0.13374787146097022,0.8865717093996182,-0.6609142210024861,-0.08880946412869717,0.8754549198037687,-0.6707633799699928,-0.04472935335261835,0.8657930497236972,-0.6789526910725803,-0.001454392638246517,0.8575329576099451,-0.6855344345404966,0.04106579106750738,0.8506296362758166,-0.6905517064687876,0.08287883063229906,0.8450457760967902,-0.6940388531221338,0.1240296515922803,0.840751404311388,-0.6960218185697631,0.1645604995059109,0.8377235962670726,-0.6946235234695433,0.20395458285999024,0.833672053689229,-0.6860032584036295,0.24057404646959935,0.8239572172323593,-0.6766513715318654,0.27611030030456485,0.8162880632136575,-0.6665586052625017,0.3107055153939686,0.81058372896642,-0.6743482734160384,0.35428300867318807,0.829719925913853,-0.6814499204527067,0.39949492349311466,0.8515570882457242,-0.6719041411344122,0.43625171900887505,0.8560840715953191,-0.6606449950304509,0.47240914505505227,0.8617286687283761,-0.6460751374835407,0.5067328437934076,0.8664184546421909,-0.628113611905369,0.5388313207599036,0.8699209608886571,-0.6085936062780832,0.5700460372250156,0.8746836484523,-0.5874777356961323,0.6003810111571162,0.8807301737464392,-0.5647209214679267,0.6298347424667776,0.8880907154440107,-0.5309478061733497,0.647039180354863,0.8813279292058347,-0.49600161985963753,0.6619566002838022,0.8750428723164712,-0.4605586067956593,0.6754422655576464,0.870322130441977,-0.42457260088470505,0.6875398462636211,0.8671332940174636,-0.3879934922055588,0.6982833981718173,0.8654546095870437,-0.3507670125121929,0.7076977232648547,0.8652746706505674,-0.31283445942417787,0.715798598481947,0.8665922563855455,-0.2741323572199126,0.7225928769971768,0.8694163144196718,-0.23459205061890587,0.7280784633337625,0.8737660872462563,-0.19413922636533076,0.7322441606239734,0.8796713852778115,-0.1524664322616972,0.7339769702830177,0.8858545510028195,-0.1096921848271335,0.7333490257342374,0.8924598426639498,-0.06600883986652228,0.7315078164153928,0.9009567413794288,-0.021281661781969524,0.7281983766243405,0.9111498938833016,0.024466914315131927,0.7198174030589519,0.9185836986477529,0.07068806139818584,0.706774070060777,0.9236403352691047,0.1173967865606046,0.6923951347795456,0.930589545897571,0.16466711440771853,0.6764340728747031,0.9392362461580932,0.21249219746598214,0.6585415342305727,0.9492345651663037,0.26035195631896557,0.6373261513487156,0.9586323904910516,0.30869844319709405,0.6143170018876489,0.9697132402620747,0.3575952931384063,0.5894289796848362,0.9825468482562547,0.4071079882268003,0.5625644092675133,0.9972151317890976,0.4479817788107572,0.5227342087574631,0.9931464512535095,0.4824915319824852,0.4769784856911272,0.9801196607658555,0.5131991003444654,0.4297128750614685,0.9651834159538337,0.5420699259118908,0.382981882679994,0.9522843196873119,0.572694805653521,0.338750017733531,0.9470690638660093,0.5885477657342566,0.2877309950715279,0.9224928961538383,0.6076431248747336,0.2407034277102691,0.908291418271868,0.6248033949261504,0.19449701526319263,0.8956639846714838,0.6401138776371704,0.1490626478879732,0.8845416505797141,0.6536490974105074,0.10435277726745429,0.8748643407519738,0.665473467072164,0.06032152453041062,0.8665802945686281,0.6756418613650448,0.01692475965793086,0.8596455885048284,0.684200103074426,-0.02587983874095212,0.8540237316066657,0.6911853661718306,-0.06813273578390283,0.8496853300854106,0.69662649975331,-0.10987249835137503,0.8466078176830463,0.7005442758791212,-0.15113575312741856,0.8447752490425309,0.7029515637158248,-0.19195713950084548,0.8441781539190512,0.7026802858163466,-0.23198195167110014,0.8434053601111593,0.6991527320772253,-0.27081658865784175,0.8417548515532918,0.6949331038303033,-0.30933041939341943,0.8422990712923948,0.6900022305365878,-0.3476855185653096,0.8450445839605729,0.6843322415702344,-0.3860427665894859,0.8500246437634766,0.6778859434497955,-0.4245647641512953,0.8573001533485662,0.670615914239785,-0.4634188513495152,0.8669614448245335,0.6589066706776752,-0.5000810542186085,0.8744111464182946,0.6383381998338464,-0.5303587492304049,0.8734186747064365,0.617592747189756,-0.5605410160234876,0.8753639955673025,0.5962937628843381,-0.5905859867903125,0.8799250645607382,0.5743191824653198,-0.6206513968497931,0.8871673302761796,0.5515349657615909,-0.6508980945548668,0.8971962868870715,0.5277916607260553,-0.6814937781828561,0.9101612297730544,0.5029202654160256,-0.7126171425388241,0.9262607399534266,0.47672713674201406,-0.7444626683903803,0.9457502815492136,0.44547181318434514,-0.7711601266008223,0.9613650941911258,0.402989454252737,-0.7794007641215916,0.9572017202358074,0.3606141907333913,-0.7873643165663617,0.9562159021800349,0.3180782262200412,-0.7951019054928885,0.9583915895263893,0.2751106657625828,-0.802661058969286,0.9637642571791467],[0.4472389815297264,-0.692012546320401,1.2079296599832663,0.4189456614587419,-0.7243962719060257,1.234397486780435,0.3886696605430733,-0.757175702970633,1.2647407824890102,0.34436027999488794,-0.7642384696983173,1.2562180473131788,0.29962735952895736,-0.7690247111070327,1.2487025481341059,0.2550954132729706,-0.7732484613645179,1.2448918022615265,0.21053280833497423,-0.7769366589536046,1.2447322722760656,0.1657084469586516,-0.7801086377391933,1.2482217248960872,0.14995761799802043,-0.9750517465529596,1.563778179447458,0.0949812504689424,-1.0031306220904894,1.6184065920488973,0.03512691980731708,-1.0138102348292803,1.6514299693419252,-0.027019952403498915,-1.0088872605920178,1.6654863060815472,-0.08952421988699971,-0.9934314463334402,1.6683870436220953,-0.1499571942692024,-0.9617274085135348,1.649663055228653,-0.208250756385446,-0.9261288581882137,1.6292867451540403,-0.2651432186298308,-0.8906653668583093,1.6140446152911458,-0.320962571330917,-0.8551530476799556,1.6037162498498976,-0.3736515452613438,-0.8142606648793462,1.5881096697334582,-0.40216474386550116,-0.7315478879151094,1.491831428186754,-0.4249075349111344,-0.6540441097331264,1.402775544628999,-0.46215881639952316,-0.607382584303104,1.3789951662824436,-0.4978008078381593,-0.5615578767366358,1.359471005087789,-0.5157047401769459,-0.5004854798654308,1.3026619404449633,-0.5298138777891768,-0.4421020923205323,1.2490500790287076,-0.5419683114061828,-0.38751553590466514,1.201876772952743,-0.5524071214692401,-0.3361963790564537,1.16033953359468,-0.5613261846398654,-0.28769986510195067,1.1237783543864062,-0.5688866719712005,-0.24164864410735354,1.0916475434697048,-0.575221536826747,-0.19771946796475226,1.063494191358446,-0.5804405121857221,-0.15563281121433525,1.038941555493956,-0.5846339868025607,-0.11514467699698694,1.0176761394245162,-0.5878760261813305,-0.07604005166388406,0.9994375859883835,-0.5902267318140408,-0.038127613963954254,0.9840107430812282,-0.5917340805189477,-0.0012354053371036872,0.971219430676709,-0.5924353483786797,0.034792760289266755,0.9609215605997887,-0.5923581962949775,0.07010031700723995,0.9530053507122096,-0.5915214735395429,0.10482052999699332,0.9473864425617275,-0.5899357798025564,0.13907874615448623,0.9440057830213897,-0.5876038136386796,0.17299439759593493,0.942828170848462,-0.5845205247974858,0.20668282940771388,0.943841401944467,-0.5806730788664831,0.24025701354483164,0.9470559750634822,-0.5760406342692548,0.2738292049904767,0.9525053449175616,-0.5705939233430684,0.3075125937044838,0.960246733900159,-0.5604315608298167,0.3390856857880702,0.9637196111887407,-0.5442494926596662,0.3670186113864906,0.9602981443858036,-0.5277337380380946,0.3945618731188292,0.9596350429500164,-0.5130670915245763,0.42372385321181705,0.9659847934769337,-0.4968677907750396,0.4522138679888923,0.9734408707924507,-0.4791082849425923,0.48000180154316796,0.9820253093505311,-0.4590130186528798,0.5062323945121276,0.9901582195067462,-0.43687356183765047,0.5310119413574128,0.9983291237368599,-0.41216150174669597,0.5534459530259448,1.0051269238238705,-0.38078474634304316,0.5669867709452001,0.999335872675271,-0.34890393998784663,0.5791719758126561,0.9950343423562176,-0.3165023892991572,0.5900278601933371,0.9922000492081908,-0.2835601794592022,0.5995739134716214,0.9908183574380729,-0.25005430306541476,0.6078229223762008,0.9908821458340791,-0.21578109200501938,0.6142752467512009,0.9915753271993166,-0.18070120209313956,0.6185874191913108,0.992370690348026,-0.1451146481036214,0.6215372765296037,0.9945415163164215,-0.10899894547308142,0.6231174448332011,0.9980980213304882,-0.07232961695881102,0.6233139963280756,1.0030569762755421,-0.035080316854385035,0.6221062982892791,1.009441833940067,0.002776618956708537,0.6193714510783455,1.017126309511391,0.04097728840929177,0.6109639850746058,1.0192822689293521,0.07932373118923397,0.6013124250851272,1.023140570798919,0.11783018052290284,0.5901923996231044,1.0283823906448406,0.1565115056944939,0.5775776399413557,1.0350307922460118,0.19538204097425171,0.5634354033813933,1.043115112904795,0.23445530689186422,0.5477263200970608,1.0526711493248246,0.2735975029943849,0.5301209347390579,1.0631732754996568,0.3124542405874693,0.5101034110355926,1.073612982795761,0.3465267631708251,0.481691859661626,1.0706063774791748,0.3750282648358394,0.4467816493828223,1.0559677885307384,0.40476345890419374,0.41464244276882445,1.0503761788839574,0.43330247254179044,0.3818563037250531,1.0462103486729344,0.4606695668631611,0.34841931604693466,1.0434519269744893,0.48688429336064365,0.3143240241509031,1.0420887707283581,0.5119614061790001,0.27955968264830733,1.042114885432241,0.5338084560211018,0.24315486455232826,1.0394367843895784,0.5515216566548977,0.2052800932289469,1.0328292028386867,0.562044007790075,0.16567736366173236,1.0172649522415966,0.570412338065621,0.12669666312222239,1.00242841614081,0.5777924817454192,0.0885828373964479,0.9902047991453236,0.5842430442765432,0.051186496374511836,0.9804617163656779,0.5898115569869598,0.014368782363769206,0.9730958761679904,0.5945355757297106,-0.02200097503791168,0.9680304934888779,0.5984435087285727,-0.058047339507787066,0.9652134129608179,0.601555209579625,-0.09389065861883361,0.9646158567045937,0.6038823600893464,-0.12964882856326732,0.9662317412987829,0.6054286580624604,-0.16543899028745113,0.9700775341152035,0.6061898165857382,-0.2013792108683532,0.9761926427916068,0.6061533731811171,-0.23759020346528836,0.9846403547611153,0.6052982988523699,-0.27419714164164954,0.9955093680890217,0.6035943879321097,-0.3113316294994317,1.0089159821198113,0.6010013990727288,-0.34913389841751963,1.0250070486575202,0.5974679048792875,-0.3877553150959554,1.0439638241702145,0.5929297914572378,-0.4273613054102863,1.0660069142537898,0.5873083280461433,-0.4681348262470255,1.0914025680273012,0.5805076988255689,-0.5102805559331038,1.1204706689281192,0.5635863912231902,-0.5454879791202307,1.1358087354583164,0.5408123203936834,-0.5761383652977559,1.1445323788457085,0.5171638662088514,-0.6068629436450803,1.1566105767581671,0.4925003805970296,-0.6378104184960298,1.1722083564225168,0.4666629544658756,-0.6691370272020776,1.1915444162260282,0.43947008747527017,-0.70101020630648,1.2148987044104915,0.4107172782866093,-0.7336217529073648,1.2426376030610067,0.37641711313251314,-0.7596247706065071,1.2626460903141759,0.3317902791572769,-0.7656383933976594,1.2537330745623683,0.287137270146002,-0.7702638189212951,1.2472642325447856,0.24261997744389308,-0.7743351040978173,1.2444798939029829,0.19800742322033726,-0.7778769989264083,1.2453410060941446],[0.4207394253088994,-0.7480690444192173,1.6322225501438652,0.3832969181589525,-0.7769212200370386,1.6548773762265494,0.3441251955952378,-0.8054439461235412,1.6817064432250302,0.30298381161880816,-0.8335566597401813,1.7126998982350656,0.2597733026864477,-0.8616147439106561,1.7488068177327474,0.21422535695284695,-0.8897019957009702,1.7904702955201461,0.16388748023656563,-0.9060564259175168,1.8144942397260237,0.11078520149697485,-0.9129795230277855,1.8260291257817318,0.05669214028477648,-0.9181411344437871,1.840631890528016,0.0015241011773856165,-0.921770748623076,1.858930211925646,-0.054120810826098015,-0.9114026590313844,1.855768483038398,-0.10947781515725608,-0.8985791501474947,1.8542350170806738,-0.16463821088388353,-0.8840946774817136,1.8559560786626559,-0.2177339205472667,-0.8601798750307896,1.8443466258317578,-0.2667393006047669,-0.8252823651699761,1.8148414320163972,-0.31354353500592347,-0.7892828475867018,1.7879017438707212,-0.3586401873536631,-0.7531619119877635,1.7655582241970134,-0.4022565316914595,-0.7168732007678984,1.7477100872252187,-0.4475845636992646,-0.6849049829731566,1.7458918202762312,-0.45032552596437236,-0.596395864053179,1.5989164961539277,-0.45050192227598673,-0.5189100790403174,1.4726601264688597,-0.469635165057539,-0.4716063208049164,1.4271349969219145,-0.4833677569541388,-0.4232047768320335,1.3768949799048738,-0.49531493084403744,-0.37725527621230937,1.3323018052619329,-0.5056640940192327,-0.33345274816070347,1.292751760119769,-0.5145720083564056,-0.29153322202992316,1.2577378280625098,-0.5221700238215998,-0.2512664262945934,1.2268330876425377,-0.5285682059002665,-0.21244986404561805,1.1996775993332314,-0.5338586081576704,-0.17490402231755287,1.1759679869580921,-0.5381178762910857,-0.13846845913860295,1.155449124142196,-0.5414093230717807,-0.10299857462838591,1.1379074843901282,-0.543784579106152,-0.06836291796773608,1.1231658219869178,-0.5452848987002676,-0.03444091551736578,1.1110789316202894,-0.545942180750103,-0.0011209301321495023,1.1015302954402255,-0.5457797497164814,0.031701419855880375,1.0944294728226733,-0.5448129301040154,0.0641247397900766,1.0897101243968006,-0.5430494385180493,0.09624318360682904,1.0873285908388333,-0.5383614741400233,0.1276430933176098,1.0829819579398539,-0.5316814473735327,0.15830575799332314,1.0784679324720123,-0.5239229437063662,0.18842400614821075,1.0755754277735559,-0.5150880708317596,0.21802763119982593,1.0742889864597203,-0.5031648867552523,0.24616141477536058,1.0703298763099216,-0.48919364848295643,0.2730209703472175,1.0656778796598818,-0.47419478238598245,0.2990508925835096,1.0624202893452175,-0.45817391563577914,0.32426530754229077,1.0605435373740555,-0.441132153947005,0.34867529928888263,1.0600398144270375,-0.42306623479851213,0.3722887695466106,1.0609070254079302,-0.4039686540050704,0.3951102817567764,1.0631487774878874,-0.3838277683653426,0.4171408857118588,1.066774400681867,-0.36262787719807266,0.43837791897673073,1.0717990008901843,-0.34034928573414946,0.4588147812895338,1.0782435452190633,-0.31805629820728276,0.4800828513510962,1.0898629688247556,-0.2917630270736993,0.49605952239446616,1.0929048549151759,-0.26236659854088806,0.50666043147318,1.0880717435469975,-0.2323885625838351,0.5155736043633921,1.0837457646749584,-0.20205166644608719,0.52318103737408,1.0807203341541598,-0.17136071189246538,0.529493182750576,1.0789847705095124,-0.1403187419738925,0.5345159952280847,1.078532945256839,-0.10892732757096402,0.5382509109753988,1.0793632628420724,-0.07719946164666913,0.5407831865819359,1.0816554185306408,-0.04518070499471838,0.5428486416062777,1.086906167452529,-0.012704712854996317,0.5437644454963664,1.0938040933599087,0.020149431937215356,0.5405039214967369,1.0962902788234015,0.05297116971896082,0.5341754698383943,1.0965227799131831,0.08573904312883718,0.5266763601723241,1.0983296243770102,0.11847563973265673,0.5179955642446243,1.1017198696616042,0.15120304395935036,0.5081161698326593,1.106710544289239,0.18394272862547534,0.4970152907708627,1.113326794942198,0.2167154318162816,0.4846639270708555,1.121602103749007,0.24954101413061092,0.47102677462802545,1.1315785776977698,0.28056465562873667,0.45303656619614374,1.1357228569009283,0.30699428646261673,0.4279681861046569,1.1259290540047342,0.3327813999428826,0.40289685886592563,1.1193461595738725,0.35749150762239656,0.37711158946825485,1.1141283771116104,0.38113734492899143,0.350624668931109,1.1102571818113542,0.40372850310998665,0.32344502561489286,1.1077188255242607,0.4252712695102616,0.29557851868659846,1.1065042919945682,0.4457684640184172,0.26702821309094027,1.1066092668283325,0.465219267810427,0.2377946401893638,1.108034122936683,0.4836190408994465,0.20787604834322848,1.1107839217987205,0.4996074617328259,0.1767903502277366,1.111860346655968,0.512206249697317,0.14455005015873867,1.1094281124266683,0.5236515998430074,0.11209000630310584,1.1085750476242051,0.5339537005701374,0.07938937194175733,1.1092969502946435,0.5404745248715228,0.04620021592220558,1.1061887950907554,0.5445676776130304,0.013019924478786873,1.1021841045376686,0.5478275238614465,-0.02000964775449826,1.1005165201171625,0.5502667071382881,-0.05297899145220125,1.1011709061175292,0.5518904194601184,-0.08597799438563469,1.1041531970812795,0.5526964454061591,-0.11909701581060728,1.1094905199434244,0.5526750532950642,-0.15242797563913202,1.1172317547488557,0.5518087284560771,-0.1860654877705199,1.127448554991064,0.5500717375189881,-0.220108069118218,1.14023686636353,0.5474295058813787,-0.25465945958922287,1.1557190028300983,0.5438377826005851,-0.28983009383630076,1.1740463627197126,0.5392415573543259,-0.32573877344422497,1.1954028966921832,0.5335736821056241,-0.3625145989655736,1.2200094760789462,0.526753134738561,-0.4002992358001052,1.2481293572067482,0.5186828418876543,-0.43924960761476584,1.2800749989031086,0.5092469516250775,-0.4795411376860348,1.316216572124457,0.4983074109786467,-0.5213716948877258,1.3569926106099963,0.485349712623083,-0.5645593979273471,1.4019126082142215,0.4598954625030016,-0.595901105972608,1.4196482275924218,0.4351624591651091,-0.6302913615355261,1.447986697040502,0.42129654312374454,-0.6856958358034388,1.5262887330368269,0.41040289738693625,-0.7561771156246806,1.6381334212622871,0.37251412331028,-0.784972080648656,1.6620210294020215,0.3327900936555621,-0.8133326532503853,1.6898989713228794,0.2910938344207956,-0.8414217451291233,1.7222854166883206,0.24725694858905434,-0.8694794338054868,1.7599012378603032,0.2009335678163794,-0.8972917074997415,1.8026134341577098,0.1491000333695105,-0.9081661616160259,1.817409055301301],[0.3528500858920629,-0.7447519599097108,1.9499819471967168,0.31507682104144696,-0.7795834226992766,1.9926575861240376,0.2516144347450402,-0.7454402570725618,1.8677078985694724,0.21843047975613872,-0.7993137657613163,1.9708096709884249,0.17161045227194982,-0.8140929393399396,1.9828230089805512,0.1228865426357365,-0.8213720668562008,1.983552642636031,0.07378583557861862,-0.826836767035874,1.9870160507423318,0.024280699879007037,-0.8304803724293368,1.99322939040316,-0.025562628586534714,-0.8292010838056223,1.9947965312818123,-0.07522948933407092,-0.8231514747339199,1.9920542902796132,-0.12465960086882932,-0.8152718202412146,1.9920359908375946,-0.1547822761315606,-0.7170914337077186,1.7756780311822524,-0.2106608705082258,-0.7503776083813332,1.8902969363434305,-0.2758221134025931,-0.7922106427407334,2.038333239314042,-0.3162437471830708,-0.7551179945724891,1.9926553341471855,-0.35399553758656754,-0.7174296368333422,1.9501658287202925,-0.3900328314186994,-0.6807229086723536,1.9148965087209238,-0.415801938696581,-0.6313601893549112,1.8470790713214438,-0.43217817844450757,-0.5749518361704213,1.7587322027623529,-0.4218840207745651,-0.49397903590340775,1.5892086653164412,-0.4195363975890434,-0.4333920110680398,1.4759531401134378,-0.4349884901308805,-0.3966409477596091,1.440337381722678,-0.448519950692317,-0.3604980767423318,1.4074547906028503,-0.46024365213635177,-0.32496458174817056,1.3771605367786854,-0.4702623279824354,-0.2900368137750138,1.349320778702273,-0.47866912337453904,-0.25570729792109415,1.323812384472605,-0.48554814537224855,-0.22196558066961702,1.3005225856828275,-0.49097499903171204,-0.18879894243697204,1.2793485919339744,-0.49501729980816034,-0.15619299691605493,1.2601971874163578,-0.4977351558970682,-0.12413219581422119,1.242984325732861,-0.49918161644665116,-0.09260025500712654,1.227634735053945,-0.4994030832895433,-0.06158051589031188,1.2140815425280174,-0.49843968509205894,-0.03105625378671195,1.2022659244375795,-0.49632561371355965,-0.0010109436325638002,1.192136786740857,-0.4930894231910754,0.028571508212758223,1.1836504792476692,-0.48875429218387456,0.0577065583336448,1.1767705456482354,-0.48333825098104377,0.08640884004425031,1.171467510864849,-0.4768543743353435,0.11469199059657953,1.167718706665024,-0.4687351847897112,0.14239358156628024,1.1640782757798274,-0.457670289309025,0.16892694111554007,1.1571370591276455,-0.4455780797050819,0.19475069729702832,1.1515156756610985,-0.43247750605933977,0.21986648736975356,1.147196868912614,-0.418383844945617,0.24427462704725045,1.144167349234877,-0.4033088884849185,0.26797387356076774,1.1424177784290137,-0.38726112396763757,0.2909611962374892,1.1419427578056816,-0.37024590554969183,0.3132315505987795,1.1427408208609346,-0.35226561988207195,0.3347776523264101,1.1448144312336765,-0.33331984788575575,0.3555897477445029,1.148169986124076,-0.31340552525221677,0.37565537773172997,1.1528178248712813,-0.2926013164753085,0.3950728357627149,1.1591058371855798,-0.2716240317866214,0.41497548284790486,1.170262129430121,-0.24804373915886968,0.43165440948570977,1.1759074207406144,-0.22195464350042293,0.4441660468620672,1.1742894723460804,-0.19447875929451608,0.4535060959731396,1.1687050448047014,-0.16678056420464094,0.46172632696497473,1.164669285748424,-0.1388545085166608,0.46884063007956644,1.162165062283803,-0.11069359420459612,0.474858280948693,1.161181756408725,-0.08228957340438692,0.47978395090075043,1.1617152016515035,-0.05363313557237559,0.48361769057053117,1.1637676581349048,-0.024714087786186195,0.4863548859439497,1.1673478261079637,0.004472970087445419,0.4873871881820415,1.1710317024021464,0.03364246047806746,0.48398745115945196,1.1682723126109238,0.06263470244345792,0.47948365341230836,1.167029315831826,0.09145833614468712,0.47387806115329134,1.167297530407886,0.12012137221547614,0.4671683339545867,1.1690780742510416,0.14863099741166974,0.4593475563762741,1.172378371258601,0.17699337320729325,0.45040424383507727,1.1772121938392122,0.2052134227311646,0.4403223236784104,1.1835997414133157,0.23266524311213388,0.4279235617319044,1.1883532656940101,0.25818276108493254,0.41178125551172906,1.1870990080405637,0.2803214507896241,0.39085070937569366,1.1757940547741068,0.3015682678575269,0.36956524005610936,1.1667341301700809,0.3225253541101889,0.3484871655779238,1.1618192453972167,0.34251601509939533,0.3266854028099129,1.1581807225979137,0.3615418469486831,0.3041748584374968,1.155807965718589,0.37960203309597773,0.28096784624186144,1.154694051852946,0.39669316548543465,0.2570743407330647,1.1548357274951329,0.41280906765306025,0.23250222528701814,1.1562334065720368,0.4279406170015756,0.2072575378102104,1.1588911707009633,0.4420755639552887,0.18134471722107537,1.1628167716160185,0.45519834606597165,0.15476685432515414,1.1680216352022743,0.46728989552202815,0.12752595098210073,1.1745208660511945,0.47571189656376944,0.09907844223225448,1.1758681342471533,0.48305556164507824,0.07029830491395872,1.1787224412227033,0.4893209963156808,0.04117740171845352,1.1831108443805682,0.49449758534060617,0.011705063346207467,1.1890515755739877,0.4985699034764961,-0.018130071113297036,1.1965693558956492,0.5015175439587738,-0.048339857255739915,1.2056955322885834,0.5033149160377937,-0.07893643479329182,1.2164682481745341,0.5039310104768946,-0.10993199750962401,1.228932647004319,0.5033291321122544,-0.1413385372567466,1.2431411071167098,0.5014665988573483,-0.1731675547097664,1.2591535055850205,0.4982944069519277,-0.20542972862365372,1.2770375077777096,0.49375686285348674,-0.23813453417640296,1.2968688780932744,0.48779118300779256,-0.2712897996177954,1.318731805665955,0.4803270638878918,-0.30490118885494955,1.3427192366750944,0.47128622625213623,-0.3389715957815853,1.3689332021006102,0.4605819396555062,-0.373500434089292,1.3974851261992374,0.4481185359999529,-0.4084828039897159,1.428496096445464,0.4337909245036249,-0.443908514747704,1.4620970699718026,0.42671657891583736,-0.49037061379187286,1.5315659961613122,0.43247801914982187,-0.5592097787813777,1.6663541353950357,0.42975846153313935,-0.6276110519276714,1.794231106919602,0.41032998248518426,-0.6807456074907474,1.8766760464188064,0.3784429037184962,-0.7192508756660754,1.9211745799267845,0.34252777279278446,-0.7545868795641568,1.9616261234865338,0.30069313881441606,-0.7805816962482672,1.9832703246090677,0.23451136660111827,-0.7344183700213716,1.8311221265638924,0.20612387894947082,-0.8064101576388882,1.9807452741659208,0.15799228665754717,-0.8163158192773201,1.9827522054800006,0.1091654856821257,-0.8230866418674232,1.9842470746646015,0.05995428543061909,-0.828042030483525,1.9884789563526013],[0.25776772818509075,-0.6763995836233332,2.066184299628519,0.21762488586579987,-0.6985922428165114,2.083246351419014,0.17498621465262498,-0.7143833800140511,2.088210352114986,0.13184624439558867,-0.7295189357906402,2.098508589050324,0.08786310205805237,-0.7426841048007047,2.11038105964057,0.04305741199867924,-0.753240540775943,2.1221900683830963,-0.002406740538494623,-0.760675251637017,2.1326897002024268,-0.0478227236566281,-0.7576447854342669,2.121486818078962,-0.09258249682121322,-0.7518494206180115,2.1101649364877293,-0.1365230499303245,-0.7433555895921362,2.098769821091757,-0.17950942129785874,-0.7323187453035089,2.087573090826318,-0.2220474723054764,-0.7208893947457344,2.082596399598554,-0.2614098890415293,-0.701090035243177,2.060491126163143,-0.2963614971758173,-0.6731834852730203,2.020760094414346,-0.32915586489327975,-0.6443700405917139,1.9838073551530453,-0.3611440893846818,-0.6169363649485589,1.9564979127190263,-0.38640989499914724,-0.5811816730077832,1.907364263485741,-0.4071325413430835,-0.5425416601815263,1.8517748239338,-0.40657492622978575,-0.48204222362904847,1.720283885586177,-0.40145902328656824,-0.42449183647254385,1.5932669171920057,-0.39607460175258824,-0.37378531677118243,1.485117086261008,-0.4074553488677872,-0.34292257968895523,1.4528124632065964,-0.41819360290439667,-0.3131223974981472,1.426239383717835,-0.42740186026096394,-0.2835075167525205,1.4017156028508548,-0.435147439483516,-0.2541014838489346,1.3791645120016316,-0.4414922158031924,-0.22492315883615444,1.3585145069508275,-0.4464927362105735,-0.19598743442174205,1.3396991472326683,-0.4502003617145185,-0.16730587341975434,1.3226572456155754,-0.45266142654897923,-0.1388872742186471,1.3073329049725846,-0.4539174063094684,-0.11073817326068314,1.2936755167118577,-0.45400508881790724,-0.08286329288465677,1.2816397323244626,-0.4529567429951049,-0.05526594223466852,1.2711854174224921,-0.4508002822227768,-0.027948378309194333,1.2622775958234378,-0.44755941965234314,-0.0009121336358117113,1.2548863897288012,-0.4432538137102524,0.02584168347978294,1.2489869607949693,-0.4378992026959976,0.052312110659662237,1.2445594558577469,-0.42993571412862863,0.07821213217910294,1.2370663354477731,-0.4204780632404246,0.10350969089346762,1.2295125001622669,-0.4100075300069257,0.12824765143752304,1.2231732676108429,-0.39854809212445375,0.15241478785325757,1.2180350348854905,-0.3861209313581764,0.17599975671541968,1.2140866683083313,-0.37274458836603985,0.19899081067936386,1.2113195480529146,-0.35843512120709464,0.22137552711427855,1.209727600268895,-0.3432062676912162,0.2431405487392424,1.2093073184837486,-0.3270696121806975,0.26427133344471976,1.2100577755024116,-0.3100347578774949,0.28475191074723005,1.211980626498626,-0.2925292644387998,0.30500229890425645,1.216826161299533,-0.274464774119783,0.32506946489699207,1.2245595931701647,-0.2554511213632873,0.3445882790848893,1.233724994340088,-0.2352313052305366,0.3631626116060449,1.2430650140044097,-0.21236048203853564,0.37805173171034534,1.2438234305831202,-0.18887931065447505,0.3919759688269453,1.2457852402934115,-0.16407672314813837,0.403139642529756,1.2434608221286183,-0.13845356061119873,0.4118510973174381,1.2382513399196107,-0.11267737551190504,0.4194955107425935,1.234502835109847,-0.0867528578755038,0.42608156373914596,1.2322025606149491,-0.06068370111494126,0.4316144332286136,1.231342690519968,-0.034472850683384404,0.43609576151522766,1.231920298722752,-0.008122747038465022,0.43952361680048213,1.2339373508401597,0.018272347118761717,0.43967663321899586,1.231195929037666,0.044437930424507166,0.4377883433804124,1.2271722531558975,0.07035603423271553,0.4348511813501492,1.22460894334605,0.09602648576999728,0.43087190086944194,1.2234970378135248,0.12144853141496181,0.42585355923539314,1.2238326485676811,0.14662060895624318,0.41979556919106287,1.225616949170563,0.17154011816165715,0.41269373916288377,1.228856178444735,0.1958490000320352,0.40381002708026337,1.2313348363018797,0.21856413529549945,0.3916677387133696,1.2282838674173995,0.24062177125754625,0.3785560717943848,1.226468420517012,0.2601682343428644,0.36192287061484896,1.2172595379234838,0.27841612332910515,0.3441484866857949,1.2078500154858975,0.2957149157225425,0.32577594887829564,1.1999042568731202,0.31267835048844894,0.30741085758885944,1.195687723529936,0.3289349228997418,0.2885397252947839,1.1934356482108388,0.34429316704473845,0.26897210760001355,1.1923847261298395,0.3587464091695214,0.24872136570592351,1.1925324064276417,0.37228583142244487,0.22779912957858395,1.193879047759978,0.3849003116664811,0.20621552088603545,1.196427917592528,0.39657626668599555,0.18397938067281472,1.2001851856537336,0.4072974975749828,0.1610985043958355,1.2051599109607665,0.4170450365021514,0.13757988724710213,1.2113640212973102,0.4257969944802422,0.11342998300174445,1.2188122834577246,0.4335284102386403,0.08865497995809501,1.2275222619647774,0.4400633151978717,0.06323986015968786,1.2370988107719842,0.44387343393167633,0.03709278514479453,1.2433767133244533,0.44663517040040457,0.010557057160796732,1.2511707619500836,0.4483282459084865,-0.016370448851155406,1.2605084043886414,0.4489281987217497,-0.04369289405148613,1.2714224899462785,0.4484062260963677,-0.07141320268922213,1.2839513561252716,0.4467290133980262,-0.09953376201297226,1.2981389202953437,0.4438585518836815,-0.128056088701606,1.314034771642648,0.4397519474921694,-0.15698045470869282,1.3316942573359736,0.43436122395895715,-0.18630546462137776,1.3511785552625852,0.42763312478167714,-0.21602757575324238,1.372554723749463,0.41950892007522667,-0.24614055123251655,1.3958957163289387,0.409924226233195,-0.27663483533061406,1.4212803467546689,0.3988088486336978,-0.30749683923363946,1.4487931860393424,0.3861861273480929,-0.33879538525653086,1.4789052789758674,0.3914231137549522,-0.38991601526848374,1.5908276930250569,0.3966087326333749,-0.4485852503884806,1.7237509190335114,0.3991327871002839,-0.5135538728526354,1.8713028429089213,0.37631029769738733,-0.5530295863848416,1.9225945291153668,0.3500746794289564,-0.5914433633982137,1.972639620594098,0.3171693650688967,-0.6219327831236927,2.0002980080697466,0.28335071736950024,-0.6537422113289497,2.0372285306501183,0.24749330300030192,-0.6851053669693572,2.077835424718133,0.20576751553158967,-0.7032628011289566,2.0846252126436013,0.16290751261331438,-0.7184811002790354,2.089950101466993,0.11961221883646411,-0.7334662208980935,2.1018394835629017,0.07538264877282219,-0.7459094395306831,2.1136989017701833,0.030375269730151006,-0.755719052978642,2.1254816336170173,-0.015190771707594197,-0.7601082731609319,2.1295648349984067],[0.17065589946637938,-0.5984932416608459,2.0893775459583583,0.13283613685979567,-0.6143560872477725,2.0937700523817355,0.09438104267806458,-0.6280906872834064,2.0982498624620813,0.05555869658382301,-0.6412122112112453,2.107986927690572,0.01617911189148842,-0.6523650697583747,2.118553313451576,-0.02352339090328273,-0.6575702516105881,2.117311204723322,-0.06285116456026252,-0.6578545329019789,2.1079009675487157,-0.10159673909661937,-0.655721304628659,2.098388707210642,-0.13988141137354415,-0.6524296620847609,2.0927202536671015,-0.17755995547349723,-0.6471866192177869,2.0882845519063835,-0.2144504400777003,-0.6396683575218249,2.0839550830321887,-0.25019405613143686,-0.6293203493690145,2.077783048618329,-0.28085467627466953,-0.6081695948543349,2.042742407892934,-0.3102908248005578,-0.5870560355298649,2.0139691238694652,-0.33840285879642007,-0.5654394773402904,1.9894921478197194,-0.36156693845383314,-0.5377660704458975,1.9490562058141805,-0.38149159987338077,-0.5079120547697276,1.9050316617329308,-0.3989659455845862,-0.47731721672465754,1.861890473422303,-0.38852848097967607,-0.4186675293339941,1.7075611550237575,-0.3854291929411948,-0.3744360014044408,1.6061597619559578,-0.38138714874513413,-0.3339080137463162,1.5162026335261345,-0.38425624392333413,-0.30267088282041543,1.465467074097008,-0.39262957613003246,-0.2773675192189895,1.4438625108539291,-0.3996666628317307,-0.25200455075281525,1.4239530167397945,-0.4054133273946583,-0.22661568946208144,1.4056940087076004,-0.40991209996740263,-0.20123047352268397,1.3890433588110778,-0.41320217858842767,-0.17587480051342075,1.3739616723766837,-0.41531942366584396,-0.15057141804545804,1.3604125049677425,-0.4162963781683473,-0.12534037520805907,1.3483625294826531,-0.41616230725001824,-0.10019943851003354,1.3377816630436232,-0.41494325222782447,-0.07516447609763699,1.328643161835636,-0.4126620948622097,-0.0502498140431884,1.3209236907329238,-0.4093386287793921,-0.025468568452439333,1.3146033733866975,-0.4044310444969863,-0.0008318081798498207,1.30785944111261,-0.397400436564169,0.02351354774376474,1.2988147422236214,-0.3893448495294658,0.04747688641928682,1.290885083674091,-0.38029295622255166,0.07103534936460654,1.2840600392422132,-0.3702713117654799,0.09416710528509298,1.2783303620061268,-0.3593044452405252,0.11685104029136473,1.2736880975414344,-0.3474149650787206,0.13906646514775378,1.270126674815307,-0.33462367682584704,0.16079283770813735,1.2676409770696377,-0.32094971243094594,0.18200949875579608,1.2662273945300342,-0.30651612211966617,0.20276517734929733,1.266319515261582,-0.291777932804671,0.22340717026619572,1.2698965499845887,-0.2761746410685024,0.24359924625171425,1.2747468215063584,-0.25970687768920664,0.2633225411127267,1.2808816830323337,-0.24237384986878308,0.282556187858209,1.2883153908137217,-0.22417352386063705,0.3012770603256216,1.2970650602000866,-0.2041306587171583,0.3179453031364541,1.300954845024874,-0.18269603963588388,0.33259340432620466,1.3010628976626393,-0.1607358745277545,0.34633899332574236,1.3022694097572831,-0.13827230573839078,0.35916478263566276,1.3045761420520492,-0.11472546065761291,0.36911627841514694,1.3011631209445067,-0.09078611497098721,0.37726048251025635,1.2962890187663607,-0.06676901402256952,0.3843889005314969,1.2927887367809028,-0.042686118906968606,0.39050637389825393,1.2906528294889963,-0.01854873574676233,0.3956151150806768,1.2898755204000416,0.005623530720829745,0.399097804482186,1.288463235843965,0.02960351175148701,0.3995294760173449,1.2818926788005083,0.05329072505961441,0.3989496480913495,1.2767439795793987,0.07667965438302826,0.3973706794397742,1.2730020389326686,0.09976459788806769,0.3948018897793375,1.2706558560302188,0.12253942667171014,0.3912496099003677,1.2696985220443153,0.14499734972176914,0.38671722927578767,1.2701272154308665,0.16675928678292506,0.3803581327671637,1.269116707510351,0.18734281382443552,0.37156216071777237,1.2644352763881344,0.2072935035498733,0.36183055018875265,1.260945300037962,0.22660017642141161,0.35117902661074396,1.2586398121991138,0.24399353510011235,0.33788012850254034,1.2510675270884164,0.26002057546851587,0.32317681200750226,1.2422222327047958,0.27517676733231156,0.3078420801198747,1.2347728648700862,0.2894707023265526,0.29189428455674227,1.2286978942869062,0.30290904380129424,0.27534912179339077,1.2239796870654214,0.31609253296323603,0.25870775557465775,1.2229108196690675,0.3284382054652313,0.24140168650450322,1.223042095515094,0.3399231646279315,0.2234325616407551,1.224321588716636,0.35053561175163583,0.20481252862989852,1.2267518924731355,0.3602617969840116,0.185552697297672,1.2303379148609324,0.36908589322152086,0.16566335163521684,1.2350868556882624,0.3769898762257835,0.1451541730447421,1.2410081710529415,0.3839534110433007,0.12403447727261052,1.2481135240240473,0.3899537452684996,0.10231346772451055,1.256416719316574,0.39496561018783716,0.08000050812068349,1.2659336192384867,0.3989611313970114,0.05710541770618738,1.2766820375553465,0.4019097511062659,0.033638792476758606,1.2886816072316716,0.40377816505322883,0.00961235610609662,1.3019536172649229,0.4044815195880487,-0.014958852334873901,1.3163621323875336,0.4030593903848363,-0.03995921186193119,1.3288866496734109,0.4005444050301934,-0.06535978543368404,1.3429895230811724,0.3969031449975233,-0.09115586971748979,1.3587117709089735,0.3920984467303379,-0.11734132483261117,1.376098619142324,0.3860893257452842,-0.14390815171440186,1.3951994184064418,0.37883091758359555,-0.17084601906409058,1.4160675176606468,0.3702744429207425,-0.1981417325981294,1.438760082106329,0.36036720588590754,-0.22577863886439786,1.4633378403459645,0.35828776415647656,-0.26044922352213673,1.5292831268324303,0.36176399205341436,-0.30336632123167595,1.6335222368730005,0.36703139206170476,-0.3539748440836088,1.7659045238210034,0.3683276510424949,-0.4082847795746263,1.9037381195778327,0.34879237663826634,-0.44516438461566343,1.9549780214579808,0.3240597260309044,-0.47826594146517953,1.9916795785837724,0.2965552466796302,-0.5097851987072017,2.025435906790019,0.26722101294415057,-0.5409386119507174,2.061932851596186,0.23384302623876163,-0.5664377044408804,2.082070130193424,0.1974119165101631,-0.585796913922255,2.0862783359789088,0.1601286305852163,-0.603149518106668,2.0905988572532728,0.12211778126457462,-0.6184225746598369,2.09501733777285,0.08354029591001078,-0.6317931361579312,2.1003294366512364,0.04457695908845705,-0.6445672370566147,2.110958047155936,0.005055549822885759,-0.6550778153632173,2.1214942427916625,-0.03459517534881193,-0.6578957272905122,2.1146865241286825,-0.07377427221403005,-0.6574989378863627,2.1052438623158345],[0.09975566575203187,-0.5341255489444441,2.0977491179166705,0.06528709617584494,-0.5482794750247573,2.102148192379442,0.030433064653023784,-0.5604209298376235,2.106210230633188,-0.004672139377876049,-0.5713804095064301,2.1132165210417106,-0.039712319335753754,-0.5762507638642917,2.1052939136024253,-0.07447066789158896,-0.5799711525136155,2.1008809989562085,-0.1088323788271528,-0.5816797924825119,2.096799144888065,-0.1426738290644185,-0.5813084354360791,2.092790685126717,-0.175879680861182,-0.5788702720481718,2.0888692139261984,-0.20833806963088852,-0.574385360787061,2.085047875179045,-0.2399408889777841,-0.5678804037120955,2.0813393299019722,-0.2685951376194815,-0.5552767591777732,2.0624833099733717,-0.29415956948830635,-0.5379612193386398,2.032789425142248,-0.3180056608998214,-0.5193117994907119,2.004259559315873,-0.3403558544111309,-0.4997654985826596,1.9782214045977184,-0.3589096202784008,-0.4762724946415884,1.9419542276837092,-0.3753253454671235,-0.4516996106813074,1.905969366826195,-0.3827906677353181,-0.4187379933415327,1.8375616571387177,-0.3749839031765321,-0.37324312638011836,1.7125818143221885,-0.37241645262425216,-0.33727378300712774,1.6275946333190348,-0.3691912922365179,-0.3038590227208866,1.5522263930227993,-0.3658210595217435,-0.2729831118385495,1.4869409579908535,-0.3700814969487727,-0.2494688573842061,1.46096260042982,-0.37521988050888755,-0.22729313656336014,1.4448611735091283,-0.3791951048449045,-0.20494557985729633,1.430183943575976,-0.38203723206677154,-0.18245955403229175,1.4169064742599993,-0.3837741595696107,-0.1598654474864596,1.4050058425672987,-0.3844315653109378,-0.13719103525522036,1.3944608654653194,-0.38403287863421465,-0.11446182557602746,1.3852522856864162,-0.382599272265292,-0.09170138915365689,1.377362922869498,-0.38014967188395143,-0.06893167257749933,1.3707777952931544,-0.37538727898549684,-0.046012297926178225,1.3607229697695793,-0.3695759171513906,-0.023276352911678955,1.3516295047892726,-0.36275755020156986,-0.0007595537780423853,1.343534848747094,-0.35496096332023885,0.021506312243471992,1.3364340064380293,-0.34621356776856516,0.04349095794484037,1.330322231719574,-0.33654143486884713,0.06516531701281247,1.3251951711762224,-0.3259693496485294,0.08650127624921877,1.321048983907282,-0.31457543209124816,0.10749005838895442,1.3181090094427361,-0.3027980146915423,0.12829432610319835,1.3182099749407357,-0.29018449323254236,0.14877102912045825,1.3194728529404998,-0.2767446166183838,0.1688994955501939,1.3218997681778326,-0.2624869388237241,0.18865815056225577,1.3254947841878426,-0.24741897577591088,0.20802428528087802,1.3302638725112708,-0.23154737593341146,0.22697382634293417,1.3362148658761406,-0.21487810638798255,0.24548110519722233,1.3433573938640997,-0.197416656631745,0.2635186264637306,1.3517027990585113,-0.1777739754088068,0.2788696512796567,1.3506706773935804,-0.157587950288004,0.29331720985855103,1.3502055124627965,-0.13695009012073278,0.3069264016842701,1.3507389710499105,-0.11588843158088102,0.31967739180584376,1.3522714981783999,-0.0944308609316451,0.3315495005691771,1.3548043625686432,-0.07216230013031699,0.3404309928452287,1.3500509565602599,-0.049795623202087524,0.3480642030486587,1.3454650123699743,-0.027427510889461493,0.354730085783836,1.3421691969321934,-0.005075045569585143,0.36043064294046445,1.340156570466629,0.017163882139893505,0.36344594569470345,1.3331139579315838,0.03909252698038557,0.36497616108879516,1.3255915098282571,0.060694361588710666,0.3655394671094818,1.3194399767263612,0.0819601912297574,0.365148902004945,1.3146442729793826,0.10288082244445795,0.36381506286468657,1.311192567499873,0.12344682212533864,0.3615461330245626,1.309076307450578,0.14312418210828692,0.3570404733369168,1.3035169072730426,0.16203942519458936,0.3511140294073023,1.2973417837319126,0.18034868809956217,0.34427749706904454,1.2923198471342587,0.19804023007935756,0.3365484011656372,1.2884429042822383,0.2151019506116567,0.3279424552860224,1.285704550493687,0.2306741305584219,0.3173084767896608,1.2794021931674529,0.24485918248675853,0.3051320701326965,1.271037836322769,0.25823531808319355,0.2923067852016006,1.2640100421465235,0.27080733024272075,0.2788515201910484,1.2583012582824793,0.28257850846814314,0.2647828560967116,1.2538971275208866,0.29355051302145707,0.2501152389089305,1.2507865145460997,0.30372325874579875,0.23486115803726415,1.2489615240816008,0.31340259794454095,0.2192466434751803,1.2496447846843566,0.32238171356254597,0.20308869334502155,1.251950940334055,0.33052133944578355,0.18630202514966454,1.2553658649908037,0.3378065270711019,0.16889810914225878,1.259895271041323,0.3442205819868631,0.1508879576568285,1.265546650856134,0.349744980808147,0.13228233804940404,1.2723292161158248,0.3543592984804169,0.11309200120191387,1.2802538187017163,0.3580411470195113,0.09332792782406907,1.2893328507318174,0.36076612742670555,0.07300159497669545,1.2995801207858833,0.3625077970189041,0.05212526540463802,1.3110107027972546,0.36323765501381633,0.030712302399722002,1.3236407534932617,0.36292514987219615,0.008777513001930845,1.3374872936440276,0.36153771263047574,-0.013662477625269093,1.3525679477354693,0.3590408212596117,-0.03658881786252871,1.368900636027412,0.3553981019582091,-0.05997998472123589,1.3865032123083516,0.35057147422743107,-0.08381130002201231,1.40539304003698,0.3445213475677331,-0.10805440581039805,1.4255864990023532,0.33720687866770094,-0.13267669784848968,1.4470984141806795,0.3293650628908362,-0.15801433238313733,1.473425223591196,0.33263714159895086,-0.19095162992411563,1.5598696778245582,0.3365699703054821,-0.22829872234487647,1.6646301488661344,0.33828271011712996,-0.26895965955392453,1.7766607116008117,0.33679332593420686,-0.31246160845975846,1.8928093482997923,0.32498952161664985,-0.3513230916105985,1.9717599373610462,0.3021702385065814,-0.381188059485682,1.9995663819937235,0.2777086198682621,-0.4106838020797907,2.028997745336115,0.25172944832703403,-0.43995863418048975,2.061172707570922,0.22181874208545094,-0.46402069378363864,2.074059229651432,0.1901313567191405,-0.4851816265364053,2.0805751368551153,0.1575468627854706,-0.5046892029570569,2.0869869617673142,0.12418312717720303,-0.5224574254009142,2.0932861371451743,0.09015337488778519,-0.5383533583710225,2.0992573023346264,0.05555122230695442,-0.5518774276300018,2.1032816878120606,0.020628641462538955,-0.5638134038793385,2.10863026016092,-0.014525819089798636,-0.5729627204865269,2.111009869096545,-0.04948303394502768,-0.5774503233283008,2.1038565131836986,-0.08414603597462533,-0.5806602522156794,2.0997304807770583,-0.11837376756490425,-0.5817850588038445,2.095667799392311]],"rightToLeft_fullbody":[[1.366687571964087,-1.5852203039271542,-3.458814859829732,1.3848304161828362,-1.7288751041181318,-3.682582252020361,1.281423805404943,-1.725842160609126,-3.6034287618080967,1.1693909844880097,-1.7045202764579717,-3.5022594684074972,1.02312648440172,-1.6209534244150512,-3.2900254085464145,0.8410018560088464,-1.456402539431597,-2.9309201258089708,0.7177411277763039,-1.3686084987411622,-2.740814110877441,0.6438452281482947,-1.364840085062034,-2.729784934378909,0.569081612998896,-1.3582330843445725,-2.722900691438203,0.4933899692920578,-1.348803016004473,-2.72012393551495,0.41670444354373437,-1.336549952724099,-2.72143958950907,0.3389537130528313,-1.3214586294848383,-2.7268547951641375,0.2600610012468504,-1.30349839922239,-2.73639898438804,0.1799440443169581,-1.2826230355496238,-2.750124173441492,0.09851501583565286,-1.2587703809818067,-2.7681054839095607,0.01568041587225851,-1.2318618371125654,-2.7904418973698837,-0.06912084329639337,-1.2098845484205976,-2.8362050454133803,-0.1569701507258623,-1.186323058771074,-2.8922113064083756,-0.24812949642304194,-1.15907747775229,-2.954605292386124,-0.34285950883965854,-1.1278916314334206,-3.023838098266989,-0.44144570886030343,-1.0924724868335494,-3.100422858618339,-0.5442011653485712,-1.0524855503068347,-3.1849423901568903,-0.6514694683171955,-1.007549494472952,-3.278058086513764,-0.7636280484116855,-0.9572298870170892,-3.380520265555784,-0.6292526564673206,-0.6434932818189651,-2.494737492149283,-0.6510062385562501,-0.543451815796826,-2.3445695200623424,-0.6681656174332873,-0.4529837417780074,-2.2117377588911076,-0.6814235520070366,-0.37079080012586174,-2.0938089038001166,-0.6913434966260099,-0.2957945189447986,-1.988775789073662,-0.6983865608985789,-0.227092405653759,-1.894971048600521,-0.7029321142655154,-0.16392412757787866,-1.8110007086601403,-0.7041456728261863,-0.10547318090683977,-1.7328674002288107,-0.7029010361364993,-0.05149856922373364,-1.6613662678110117,-0.7001657415461775,-0.001625582458145385,-1.5974486491407127,-0.6965076284190848,0.04464107385065455,-1.5411457008146368,-0.690472476383591,0.08757621447129638,-1.4882350849006372,-0.6835276367892256,0.12756020907774668,-1.4411395922876924,-0.6757472188943012,0.16492027126507391,-1.3992584607316072,-0.6671899059393542,0.1999371367803917,-1.3620843187334888,-0.6579013658266488,0.23285291750278025,-1.3291877265064223,-0.647916133943589,0.26387740101855384,-1.3002048599520482,-0.6372590814825223,0.293193140017872,-1.2748276474467986,-0.6259465535976538,0.32095959083240055,-1.2527958412124356,-0.6139872403793296,0.34731649827677336,-1.2338906311424314,-0.6013828276609363,0.37238667795199376,-1.217929502540665,-0.586888070833874,0.3954425424086576,-1.2022212073133698,-0.5710357944740521,0.41676794190381594,-1.1876588113818993,-0.5544155818382226,0.4367967196928664,-1.175317170910919,-0.5370303396624738,0.4555939608549253,-1.1651122946529,-0.5188770505225282,0.4732161144807172,-1.1569756065484835,-0.4999470245597486,0.4897115946858821,-1.1508529967254528,-0.4802260632497366,0.5051212686387769,-1.1467040822347254,-0.4596945415567202,0.5194788409392777,-1.144501660905096,-0.43832741279647935,0.5328111413590388,-1.1442313461782252,-0.4160941386979502,0.5451383208224208,-1.1458913748751804,-0.3929585454442348,0.5564739585046405,-1.1494925836794287,-0.3688786048310777,0.5668250809857849,-1.1550585538219877,-0.3438061380512827,0.5761920924669948,-1.1626259271379809,-0.31768643794721463,0.5845686130648513,-1.1722449004486162,-0.2904578038176995,0.5919412200892369,-1.1839799092277303,-0.2620509809684224,0.5982890849067797,-1.197910515867786,-0.23205050588266607,0.6027056347829953,-1.2123666706728837,-0.20048781025277163,0.6050828974275868,-1.2272741638862534,-0.1676762629851274,0.606281947879312,-1.244538554158865,-0.13352591921078039,0.6062536680620143,-1.2642799523067136,-0.09793716318974732,0.604938662237589,-1.286638323024162,-0.06079966607140763,0.6022662089887323,-1.311775541755443,-0.021991182841930412,0.5981530067069296,-1.3398778311411732,0.018442319987773084,0.5867269311251273,-1.357794800725788,0.059278721815787916,0.5668661363514143,-1.3618197751584766,0.10028017443748805,0.545582068021869,-1.3677262967322008,0.14146738837421058,0.5228464923871474,-1.375541630608943,0.18276341030498355,0.49835920036354553,-1.384563926820963,0.22316853678896775,0.47011247856746863,-1.3888877123740144,0.2633581240489873,0.4405553218505114,-1.3950236632261799,0.3033379120831827,0.4096639519856953,-1.402997219977431,0.3431114352996847,0.37740983138399775,-1.4128415018891296,0.38267965257296366,0.34375974676958965,-1.4245974870387084,0.42204053745176706,0.3086758864385972,-1.4383142312599233,0.46118862019791873,0.2721159175153205,-1.4540491242283746,0.5001144725682067,0.23403307067337686,-1.4718681803201434,0.5388041253519256,0.19437624112771945,-1.4918463608840167,0.5772384076496433,0.15309011638326397,-1.5140679232495469,0.6153921957333397,0.11011534331091555,-1.538626790057755,0.6532335580841111,0.06538874968860786,-1.5656269302361867,0.6890281474217166,0.01879740708324837,-1.5912690835831018,0.7109454082922064,-0.028904126462327345,-1.5897065786275917,0.7309508224981873,-0.07648006241180427,-1.589641805505389,0.7511766205632382,-0.12424871286959704,-1.5956363547266186,0.7706471475572494,-0.1723338426612434,-1.6054370749484512,0.7894151685649726,-0.22090625885944504,-1.6191482317185848,0.8075265835964185,-0.27014439669324464,-1.6369178042645505,0.8250208798077718,-0.32023728395344553,-1.6589412583131011,0.8419314351555389,-0.37138788033639303,-1.685466667595641,0.8582856751232848,-0.42381692681047456,-1.7168014362991695,0.8741050772024819,-0.47776747332656155,-1.7533209679678023,0.8880712128669712,-0.5327102204393306,-1.7927871561437616,0.900097159823174,-0.5886708910674114,-1.8354704560095438,0.9110458324193154,-0.6463647949882056,-1.8836565813422155,0.9208488617484529,-0.7060313321659359,-1.9378736604748426,0.9294196812340529,-0.7679393625092072,-1.99874302832254,0.9366502809151673,-0.8323931809759477,-2.0669968468967124,0.942407084291832,-0.8997398774615637,-2.1435001706327554,0.9465256913259408,-0.9703784912748299,-2.2292787625028927,1.3051131138264882,-1.437119576181027,-3.198881052823764,1.3815202550139167,-1.6355021283918023,-3.543046518739115,1.364024805416686,-1.7390198739425635,-3.682025988302965,1.2497128459725593,-1.720209381599728,-3.574158805512057,1.1385431596337994,-1.697953501799006,-3.475499143315483,0.9685333234826299,-1.5722097610722563,-3.182287926670063,0.795774735602027,-1.4146157575126193,-2.8418911568556515,0.697116427009236,-1.367840213738603,-2.7373021542998863],[1.4605840486547068,-1.83309861692282,-3.199731277747924,1.46106822675137,-1.9937606456484662,-3.3974403592036575,1.3171014977977942,-1.9611056981505102,-3.275713081510145,1.1798087150855483,-1.9260028914321548,-3.1658699310825327,1.0485499108259175,-1.8886929388683416,-3.0667619015945142,0.9227552474465099,-1.849371065900277,-2.977396004404862,0.7453602250364788,-1.6806711076899683,-2.69260761828537,0.5964650246609906,-1.5358411872276232,-2.457440211716544,0.5089885139802315,-1.5276692843088067,-2.4500606256639124,0.42092765362318585,-1.5166524729851396,-2.4469000408054464,0.332149243057107,-1.5027848078442725,-2.447937280455334,0.24251523499455596,-1.4860412389986921,-2.4531792901938783,0.1518819586067281,-1.4663774337887951,-2.4626612340716036,0.060099266959437736,-1.4437293309841426,-2.4764469827845277,-0.03309664242805069,-1.422578956311471,-2.502663659555574,-0.12915603599672587,-1.4065780484221904,-2.5489704770385853,-0.2287447024450358,-1.3871270800124185,-2.6013568505170124,-0.3322131470667262,-1.3639837301093567,-2.660273109799241,-0.43995107394739386,-1.3368643933893116,-2.726241644912559,-0.5523933699148325,-1.3054382033427596,-2.799867408668903,-0.670027188895852,-1.2693197957106332,-2.8818505962924963,-0.7934003789558257,-1.2280605306107448,-2.973001987898413,-0.9754228710852597,-1.248044040708487,-3.2484048733386395,-1.1801899088955314,-1.2559278609935423,-3.5483134354654737,-0.8227073805789709,-0.7292673983352247,-2.2618178269539495,-0.8231234433633796,-0.6059858212013951,-2.0914838735361334,-0.8218476580193177,-0.49862427173157364,-1.9476657152587329,-0.819205494606142,-0.4040088553992276,-1.8251096593806677,-0.8144558402899995,-0.31936646242576017,-1.7178094863427527,-0.802849680361752,-0.2416490911704019,-1.613151370237234,-0.7915859667640603,-0.1724155198597831,-1.5238495187438597,-0.780574581426813,-0.1101069392369976,-1.4471980376607325,-0.7700364544636167,-0.05353478409552115,-1.3816443569830934,-0.7648322327564467,-0.001697004299290112,-1.334107519137378,-0.7591622013829333,0.04681228116107525,-1.2928819068837623,-0.7530465331595186,0.09247900996808034,-1.2572409810792369,-0.746496996726032,0.13571255023709805,-1.2265939714652498,-0.7395181179862034,0.17686169489306547,-1.2004599364777384,-0.732107982651101,0.21622701534112876,-1.1784481127433244,-0.7242587584089923,0.2540705415358584,-1.1602429519819797,-0.7159569892399702,0.29062346000391326,-1.1455927143578233,-0.7014181984810559,0.32343378111239796,-1.1250531339313188,-0.6854869884799752,0.35424209385708094,-1.106165472894757,-0.6690718581874329,0.383591190353453,-1.0902092548191593,-0.6521469502727761,0.41162655342208687,-1.077014089116318,-0.6346814872944471,0.43847666497537174,-1.0664425579191619,-0.6166396188922523,0.4642554919151758,-1.0583868292494456,-0.5979801558557161,0.4890645481225575,-1.0527660766251277,-0.5786561889459207,0.5129946134999583,-1.0495245901116546,-0.5582734075377882,0.5357997297261572,-1.0479900380716156,-0.5341082163528301,0.5547062962670939,-1.042875701190515,-0.5092045496613884,0.572499069791601,-1.039729761805103,-0.48352009007685925,0.589223103993715,-1.03852826027736,-0.45700660127573833,0.6049152720847415,-1.039262075993082,-0.42960955903341613,0.6196046127042658,-1.0419367773809114,-0.4012676789756955,0.6333125469632854,-1.0465727134354132,-0.3719123319879065,0.6460529700848205,-1.0532053493762676,-0.34146683494808805,0.6578322174927722,-1.0618858561410347,-0.309845600719417,0.6686489015173045,-1.072681970911474,-0.2763861452528813,0.6771045908116147,-1.0834565389394113,-0.24132230408275301,0.6834951453149554,-1.0948099074813538,-0.2050098673961409,0.6887841138838331,-1.1084135999656057,-0.16733679725691997,0.6929393413868903,-1.1243769135633395,-0.1281787185205704,0.6959182349917921,-1.1428307598719893,-0.08739722280779816,0.6976667473197997,-1.1639300556772598,-0.04483786991919231,0.6981181058327666,-1.1878566407232896,-0.0003278257739913401,0.6971912421832602,-1.2148228218982933,0.0452198299393452,0.6781849794175927,-1.215321175880712,0.09077121948653588,0.6576571590807023,-1.2175523895553777,0.13638040421665998,0.6356964783827412,-1.2217403436123426,0.1821015514844775,0.612262301716652,-1.2279102259967631,0.22798901597365395,0.5873051982578397,-1.2360993321588571,0.272752919901571,0.5580157984936189,-1.240243654981155,0.3170402640073793,0.5268586288697623,-1.2452296148789248,0.36108911056321613,0.49429849923432645,-1.2521616585769877,0.40493689088053797,0.46028121052180104,-1.2610790002679648,0.44861885818961866,0.4247446911247601,-1.2720324218953785,0.4921679683898166,0.3876186385021563,-1.2850848152611736,0.5356147123209904,0.3488240840160117,-1.3003118579429227,0.5789868910481495,0.3082728783165771,-1.317802832946997,0.6223093239198176,0.26586709403332676,-1.3376616040661355,0.6591675353650244,0.21935660088176423,-1.3468573931165677,0.6949865282203338,0.1716145250966613,-1.3578201062284316,0.720287922359955,0.12102392926016903,-1.3528407882049747,0.7395484104436649,0.0700589794802351,-1.341958370532729,0.757750221434109,0.01970642634544985,-1.3345767042250154,0.7749822238112056,-0.030241507537417334,-1.3306092759456485,0.7931848357072306,-0.08017435453543342,-1.333142277135634,0.8135807034438756,-0.1308099030836578,-1.34391758013696,0.8334857608029322,-0.18226153260342415,-1.3583375952622179,0.8529648117570874,-0.234764678601038,-1.376579608706181,0.8720790517352359,-0.28857423840306873,-1.3988735342320142,0.8908869607933481,-0.3439702325182783,-1.425508993360256,0.9094451678804338,-0.4012645627352449,-1.4568446224255025,0.927809318599361,-0.46080923912745986,-1.493320183405939,0.9460349823955321,-0.5230065708266998,-1.5354722758844783,0.9641786417568006,-0.5883219911062327,-1.5839547564337284,0.9822988169083335,-0.6573004412796091,-1.6395654128617014,1.0004573964995211,-0.7305876097600166,-1.7032810821903093,1.0187212709430482,-0.8089578754271165,-1.7763043511564272,1.037164405372752,-0.8933516407970701,-1.8601264121160161,1.0493279018642445,-0.9788229851231773,-1.9444888018400048,1.0601293695825955,-1.070177095387558,-2.0396337599639107,1.3556288313700091,-1.481098178639627,-2.7220559767233388,1.452949427799087,-1.719653511474717,-3.062218134914822,1.4635603828103445,-1.8798705738481778,-3.2579444693977466,1.4200091146165839,-1.9848720886261222,-3.3620550165236107,1.2779817547915537,-1.9515039095728741,-3.2437841379075056,1.1424412922533964,-1.9157603887330108,-3.1370581504310167,1.0127684888370414,-1.8778686884028302,-3.0407743307231136,0.8884113537068283,-1.8380126173810263,-2.9539791428359923,0.6928038699855206,-1.6186107218218488,-2.591312389452839],[1.5696128600382697,-2.1660978715369597,-2.8357439608956265,1.5269235743535372,-2.3191866046003233,-2.9639834857524616,1.3466227962951236,-2.2632257990278912,-2.8352672538043104,1.1783393448635462,-2.2072151299108222,-2.7210847043507336,1.0205300410759732,-2.1511114346688567,-2.6196476111196936,0.871890305708052,-2.0948625712914914,-2.5294688953502247,0.7313083087908503,-2.03840887486997,-2.449305179583598,0.5786332631939505,-1.9180534372592568,-2.3017524618465557,0.4267011469778398,-1.7449829032680286,-2.0989395157382136,0.3237009151343556,-1.731869374123911,-2.09559110493156,0.22030213971158064,-1.7159744181826309,-2.0964068151926343,0.11626040058822831,-1.6972572818009195,-2.1013934394497205,0.011325590599468045,-1.6756535958046288,-2.1105926024065624,-0.09564256814839553,-1.6664397779115405,-2.143848748914038,-0.20632877210996847,-1.6559970947319487,-2.184977359742333,-0.3212152015099955,-1.6422768703651554,-2.232074108354575,-0.4408286202603241,-1.6250326054942703,-2.2856357727755086,-0.5657636612970512,-1.6039687653340042,-2.346249563603946,-0.8078607681010682,-1.830634910056145,-2.79988371657479,-1.0009530776782718,-1.8580800435952631,-2.988868647768449,-1.1690555374565728,-1.8064862082027893,-3.0760707667381615,-1.346962959018769,-1.7503378681831445,-3.17803428570479,-1.3446497691402264,-1.4778539856553996,-2.884915074607884,-1.0221342141428549,-0.9520391209247303,-2.0173132403442167,-1.0053994851782737,-0.792425277370536,-1.84327616623594,-0.977068617571466,-0.6482914404359084,-1.6781222995470788,-0.9521544665333361,-0.5268187408935809,-1.5433466509226097,-0.9298192351756982,-0.42258232254719497,-1.4317614610246645,-0.9094668052333934,-0.33174701151694475,-1.3383015215212328,-0.8906597388085262,-0.2515227557540993,-1.2592979642259126,-0.873068142964168,-0.17982940534070868,-1.1920314061951522,-0.8564369583136249,-0.11508257034093733,-1.1344466873782375,-0.8429721886935906,-0.056212968716617295,-1.0880729089801138,-0.8338297627921536,-0.0017861566564232184,-1.053146282549923,-0.8245428229111385,0.049392855538435115,-1.023114997887542,-0.8150816547616886,0.09782470129851378,-0.9974362572391664,-0.8054157059581728,0.14393348289877883,-0.9756721583994947,-0.7955130511075117,0.18808322032594726,-0.9574700623905494,-0.7853398617396881,0.2305906127457309,-0.9425478309607627,-0.7748598567926743,0.2717351104559733,-0.9306827096327064,-0.7640337110113515,0.3117670136581119,-0.9217029986645473,-0.7528183983146439,0.3509141230789419,-0.9154819092015121,-0.7411664451427997,0.38938733658001423,-0.9119331837813105,-0.72902506500066,0.4273854964624859,-0.9110081944065556,-0.7112940677908992,0.4618266815124752,-0.906271422331085,-0.6887649234917772,0.4925169358706203,-0.8984075941724399,-0.6657658495671765,0.5221767603776639,-0.892824665537038,-0.6422214137779401,0.5509337897590338,-0.8894598983171669,-0.6180508933762225,0.5789043114125532,-0.8882758622023754,-0.5931670628749202,0.6061952978897986,-0.8892594537688332,-0.5674748249248314,0.6329061783010466,-0.8924215556844413,-0.5408696371243096,0.6591304128479352,-0.8977973196511257,-0.5108427452900131,0.6817633519977524,-0.9012254904875165,-0.47779558102708464,0.7007215259046324,-0.9028950102321129,-0.44383170376861747,0.7187274467079003,-0.9064674603973684,-0.40884918045875196,0.7358179990277929,-0.9119751103104772,-0.3727360917646818,0.7520219237016654,-0.9194681584547624,-0.3346114995858156,0.7656267883030994,-0.9269174980670698,-0.29466859890867814,0.776724910570616,-0.9345474202188866,-0.25351955818449046,0.7868217608441963,-0.9442638478620706,-0.21101941882611608,0.7959119859832793,-0.956157845864567,-0.16700796097663406,0.8039802295653837,-0.9703431771192523,-0.12130705010823362,0.8110004113033416,-0.9869588341615607,-0.07371748172455345,0.8169347347569254,-1.0061722377116888,-0.024015201136167133,0.8217323750760923,-1.0281832401520195,0.027643429679457376,0.8132705868513792,-1.0378425146386547,0.07930699780889,0.7929504433563208,-1.036259031532433,0.13077506219857538,0.7712989381531479,-1.0366374524508295,0.18215433763244449,0.7482696283328609,-1.0389807152125066,0.23355092175481662,0.7238053169364194,-1.043307049858214,0.2850712209530679,0.6978374454298781,-1.0496502882722343,0.33553850038064814,0.6677293329921721,-1.0540258093528951,0.38493794740925713,0.6344982328824869,-1.0576749030497137,0.4340874454829424,0.5998461204414149,-1.0633015850185377,0.4830760944258947,0.5636845334641136,-1.0709482652131523,0.5319918148537637,0.5259131682713845,-1.0806731362978832,0.5792677695671848,0.48503362247533577,-1.0894400325478744,0.620459343868847,0.43836537738474113,-1.08999536024033,0.6608959766622071,0.39092117058555576,-1.0929279046210967,0.7006901895006621,0.3425555191945371,-1.098265527204303,0.7298558332175622,0.28911509667128743,-1.0909722545183707,0.7512771977731547,0.23386744340504895,-1.076965864805942,0.7715637191512044,0.17967323473052688,-1.0661856733752506,0.7908413017195257,0.12625502970810765,-1.0584866663309542,0.8092200049294518,0.07335136078769855,-1.0537671972525802,0.826796650099451,0.020711171685904542,-1.0519657432305678,0.8436569550583006,-0.03191128713878097,-1.0530589775085613,0.8603343319719716,-0.08480638421313824,-1.0576228847178513,0.8816438171889001,-0.13905358019669134,-1.0714587347859474,0.9028182605685595,-0.19477443817092777,-1.0886942441358975,0.9239517228027143,-0.2523063307641866,-1.1095783833852257,0.9451417791877041,-0.3120278723731904,-1.1344243729647623,0.9664918705147825,-0.3743703190012553,-1.1636216003555182,0.9881140784769236,-0.4398318926226412,-1.1976513509641213,1.0101325151842486,-0.5089961043870748,-1.237107611050913,1.0326875877013597,-0.5825555909277433,-1.2827247432338336,1.0559415071037868,-0.6613436393732877,-1.3354146441808261,1.0800855788154076,-0.7463765885443072,-1.3963172272841877,1.1053500731156114,-0.8389118739316452,-1.4668699948545125,1.1320178943661006,-0.9405290091031904,-1.548905532049572,1.1604439564360716,-1.0532449374427841,-1.6447907831820752,1.1910833358217996,-1.1796821818715877,-1.7576304606987891,1.2245333064934991,-1.323320429420236,-1.8915717557835574,1.5355061295729078,-1.8121389865757909,-2.497847794731955,1.554694650537145,-2.007448791172098,-2.6810252990884695,1.5757229547776062,-2.2327340270083837,-2.9021107527781784,1.47508297813451,-2.3035068183951943,-2.9263283634598594,1.2983215969908235,-2.2475357979376893,-2.8018856130521073,1.1331178688850747,-2.1915038310034456,-2.6914410833354006,0.9780008137408303,-2.135365058003776,-2.593297641842919,0.8317240044798666,-2.079065105036897,-2.5060416746328404,0.693222846233567,-2.0225423915033707,-2.4284896392801927],[1.730242954035894,-2.6772036468733766,-2.3365715752329894,1.596648292581619,-2.7607543819979505,-2.3522127341914523,1.3686386726476083,-2.666274356549374,-2.2267922113735823,1.1611564713639282,-2.576953546351643,-2.1179354876577423,0.9708857565455353,-2.4918790447546098,-2.023092150282003,0.7951613014149712,-2.4103030507953194,-1.940234387021011,0.6318132336443508,-2.3316026927702906,-1.8677334145396887,0.47905388723350417,-2.255250605701748,-1.8042697292009078,0.3344618974222691,-2.174732178269888,-1.7439067918924995,0.1910693101952628,-2.017950648704582,-1.6278361762533406,0.0692773586001946,-1.9994379118941592,-1.6284762059521327,-0.05325865577313893,-1.9886037741064735,-1.6414085514633854,-0.1792123199084915,-1.9886814360648475,-1.6699140912380277,-0.3138051196422255,-2.0125408851676463,-1.7260682788118307,-0.4833284073439036,-2.149449028626057,-1.8907027789716806,-0.6290194918088199,-2.1129934204166654,-1.9145606078740092,-0.7786407075070133,-2.0745626859581408,-1.945271609467773,-0.9332915919431424,-2.033827082530597,-1.9833577843350851,-1.0942128471676345,-1.9904009724501512,-2.0294930615254447,-1.2628309379949076,-1.9438279360168722,-2.084533941238117,-1.440815207475596,-1.8935613325251786,-2.1495610773953944,-1.2513736863405776,-1.411646464290144,-1.7087218585459998,-1.1949781779496542,-1.1597124870611835,-1.5092478998187664,-1.151073944079163,-0.9605112671200025,-1.3568434700308765,-1.1158526637564234,-0.7978515235776247,-1.2372655101611438,-1.0869099366824555,-0.6614961517896922,-1.1415354002272533,-1.0626527679891367,-0.5446477758682067,-1.0637185753780232,-1.0407747342400921,-0.44209473651202247,-0.9985812973977022,-1.0117044884443906,-0.3477506671538706,-0.935241274837685,-0.985327208505582,-0.2641945904985866,-0.8818279920025254,-0.9610831663496442,-0.18928699537603788,-0.8364818232222491,-0.9385426214710191,-0.12139775436836808,-0.7977998167770743,-0.9224153871137402,-0.05958641975803325,-0.7689135391357662,-0.9092234496082092,-0.001898250479811325,-0.7461590519781822,-0.8962188274307721,0.0526334677950292,-0.7268269834426015,-0.8833194116894418,0.10453298555734758,-0.7105566623313901,-0.8704500424112442,0.15424805161422694,-0.6970605514734247,-0.8575401605222224,0.20216710765104884,-0.6861110127758443,-0.8445218419163059,0.24863274183709994,-0.6775304762956615,-0.8314539142971826,0.29399694320160785,-0.6712857759737019,-0.8181563090069588,0.3385171425522058,-0.6671911004497293,-0.8044608191230536,0.38241202693261345,-0.6651034531301003,-0.7902988939667708,0.42591912171379276,-0.6649930017570642,-0.7755956460315327,0.469269398638855,-0.6668581738387855,-0.760268195957317,0.5126923981095093,-0.6707256025591719,-0.7444477145773449,0.5565887938009135,-0.6768546930582122,-0.7252204849036978,0.5989337912482662,-0.6827098949703174,-0.6956121797583714,0.6330969329648921,-0.6814059379272641,-0.6654164619600169,0.6666574353970116,-0.6819500178143634,-0.6344947980622373,0.6997662547158328,-0.6843490424077672,-0.6026986727518611,0.7325693752794122,-0.6886336121082666,-0.569866558178934,0.765210576563716,-0.6948589547848107,-0.5358204194468055,0.7978341893846586,-0.7031066391282255,-0.5003615911460519,0.8305879588946987,-0.7134871661289743,-0.45970583608451543,0.8569895835034629,-0.7205635227499445,-0.41502207870025054,0.8775435689807027,-0.7250868142038986,-0.36791645732750267,0.89431796830387,-0.7289653572347841,-0.3197436109527587,0.9102307514068819,-0.7346562961202334,-0.2703034495206127,0.9253193188570012,-0.7422231221958402,-0.21937786391817915,0.9396123813305444,-0.7517517916993737,-0.16672646714439598,0.9531300485722607,-0.7633530592336908,-0.11208154744167631,0.9658836889774962,-0.7771655844462226,-0.05514199718308624,0.9778755388738611,-0.7933599772582323,0.004423723092727372,0.986785667688189,-0.810245340422918,0.06474474578958422,0.9653324911386005,-0.8052408291454585,0.12437440536668853,0.9428184250580838,-0.8021086388137593,0.1835122873186521,0.9191834955380411,-0.8008169210467075,0.242352024170439,0.8943566770650335,-0.8013526113191651,0.301084072859481,0.8682549593473143,-0.8037211227004266,0.35989841329326566,0.840782135133376,-0.8079464725794003,0.4179411236072754,0.8098002967414843,-0.8120392702572934,0.4739199081424954,0.7737074115129037,-0.8142097307281047,0.5268181811216914,0.7323071587488497,-0.8138114633916818,0.5738055550771279,0.6835905886576374,-0.8078326886997123,0.6196214233929465,0.6347444042579959,-0.8039702803460993,0.6644665950288493,0.5855742212549182,-0.8021784689903937,0.7085289055425052,0.5358833628832533,-0.8024361765849646,0.7412701921311653,0.4785511320678286,-0.7932781503010591,0.7647700162822195,0.41760738303786393,-0.7783577123988397,0.7869941454136526,0.3584833710913853,-0.7662211553743661,0.8081173581198628,0.3007867499182879,-0.7566767294772854,0.828291600797689,0.24416089640897343,-0.7495783284307223,0.8476505146207027,0.18827519064624965,-0.7448199364811301,0.8663131069333785,0.1328166694971018,-0.7423317394651554,0.8843867862711696,0.07748258446994555,-0.7420776292444193,0.9019699287406189,0.021973475173910448,-0.7440539335722485,0.919154108208907,-0.03401358542065028,-0.7482892877097624,0.9360260993596716,-0.09079190263608278,-0.7548456394011298,0.9580115574066586,-0.14952631887640477,-0.7681033465128775,0.9816782121280401,-0.21075864877002337,-0.7853587974975937,0.9937109672332283,-0.27154072881642555,-0.7961108810093669,1.0023494908134687,-0.33298538502545516,-0.807079046584104,1.0116890632320157,-0.3965455295834517,-0.8216978756555315,1.0218500673316688,-0.4628930366728268,-0.8402975167283353,1.0329792635993833,-0.5328066725028799,-0.8633192331478319,1.045257851725836,-0.6072114793536421,-0.8913429048057377,1.0589126000544518,-0.6872318756204101,-0.9251262188202518,1.0742315154779334,-0.7742653335721763,-0.9656608923245469,1.0915863888606165,-0.8700874482453025,-1.0142544649328729,1.111466028195053,-0.9770059965019513,-1.072651651840363,1.1345266114712862,-1.0980936342455232,-1.1432189066189622,1.1616704277352592,-1.237551135600854,-1.2292336619871111,1.170655216412285,-1.3736985838421405,-1.309055304815872,1.1662301821553034,-1.510321189278005,-1.38788193765189,1.6835047811098978,-2.4139378832881637,-2.149271441438163,1.7431021202768695,-2.7804676854538077,-2.409370475867389,1.530456350975543,-2.7336957325846627,-2.3152210925962278,1.308579233693524,-2.6407651659156763,-2.194736099455419,1.1062234778833566,-2.5527184476188443,-2.0900385713566267,0.9202742983540293,-2.4686937893672143,-1.9987395155696581,0.7482188464169768,-2.3879819148949553,-1.9189337176913752,0.5880043148015347,-2.3099893141108088,-1.8490869510679784],[0.9895377400915424,-1.7593848047483651,-0.7677653751654079,0.9290718276630867,-1.8831761583606417,-0.8022500968043249,0.8648758390933666,-2.024289466923038,-0.8453128627662163,0.7952828383417551,-2.187949589567099,-0.8991112951009355,0.7219398275322914,-2.3945262780484797,-0.9720269783882931,0.6058157684802714,-2.5160210066199213,-1.0126673643591007,0.4509421864273966,-2.493046235991121,-0.9985289889635067,0.2995802511354329,-2.4688372733396067,-0.9875728106108865,0.15086649309086403,-2.443314583295029,-0.9796408355735942,0.003995365486555776,-2.4163822521826614,-0.974621071205221,-0.14419752108185824,-2.428308115375947,-0.9888884178613904,-0.2972776121508181,-2.440014570081182,-1.007003213303785,-0.45631085000830174,-2.450354578099863,-1.028792637244979,-0.6225104454793295,-2.4592904764305112,-1.054612930111265,-0.7972806479440548,-2.4667593314809824,-1.084907960359177,-0.8982271936246115,-2.2611064748965424,-1.0243821266116715,-0.9885849263139677,-2.076076634799095,-0.9733456029285683,-1.012201371629383,-1.8038738464989819,-0.8795554120954636,-1.0316123714473342,-1.5785987967533552,-0.8048014820349436,-1.048595702869727,-1.3887246096392016,-0.744624441851947,-1.0637946809695689,-1.2253305806016326,-0.6954944837965911,-1.0745514881500613,-1.0790616025948743,-0.6530729165247176,-1.0476137785550979,-0.9172212026580002,-0.5968350730140053,-1.025178206396827,-0.7808242056463524,-0.5515064012991604,-1.0061254132540278,-0.6634746030259329,-0.5144404810502172,-0.9896751301234628,-0.5607051583885196,-0.4838008397016491,-0.9822653055195438,-0.4726626993727747,-0.4615644417253628,-0.9806463500943203,-0.3941557237623188,-0.44514953640553423,-0.9790565636753028,-0.32076083151334633,-0.4313273809620044,-0.9774827054721862,-0.25152579021208976,-0.41977105227815437,-0.9759129554615882,-0.18565923985869937,-0.4102251693164165,-0.974328440792751,-0.12248956265187616,-0.4024874724792844,-0.9727246196138468,-0.06143857371740177,-0.3964070282149501,-0.9710938692113307,-0.001993852861211478,-0.3918690859104672,-0.9694258725657994,0.056308752058547684,-0.38878989086860805,-0.9677099474771227,0.11389991893619833,-0.3871139134102384,-0.9582100924184926,0.16982098372150978,-0.3837180026776963,-1.6416522121345958,0.3892283838535918,-0.6604780662634837,-2.062947100355116,0.6142332143337011,-0.8369004805827027,-2.085041770758262,0.7498658498391926,-0.8560876065644878,-1.9589946878525804,0.829207654985751,-0.8171520704390349,-1.8286005099157951,0.8945991670495324,-0.7779580050666186,-1.709032083652375,0.953817776008087,-0.7446039795591639,-1.5982833719715455,1.0079572503613548,-0.7161819343357905,-1.4800921391745212,1.0475116900410422,-0.6851992657598232,-1.198733490290988,0.9474910290602576,-0.5761109070041579,-0.9614707349910745,0.8460726180508766,-0.48220868203388934,-0.8112478594241241,0.7934585199465105,-0.42700202673428067,-0.7466486321810102,0.8114516390254454,-0.41503284168678856,-0.7010383684695047,0.847479635231251,-0.41440400485310014,-0.6551013554335179,0.8831227145588394,-0.41507876617798556,-0.6085670329802366,0.9185876779620386,-0.41706746700577013,-0.5611532094559668,0.9540804256960707,-0.42040081165647347,-0.5071965088702803,0.9794554773932398,-0.42068326745596485,-0.4453670257178184,0.9880842678352728,-0.41539447766363025,-0.38426216798972757,0.9949864963183663,-0.4110631165751537,-0.32063105495976285,0.9907285976137725,-0.40377519611506196,-0.2588760035186002,0.9861360123023326,-0.3979600937174661,-0.2017636822356179,0.996990270364635,-0.3998561448943838,-0.14427603341903716,1.010655404008444,-0.40429544450985944,-0.08527828040496788,1.0246232032405755,-0.41030563348995974,-0.024275772465882223,1.0390082880712517,-0.4180014077565497,0.0386016661850305,1.0354809016119844,-0.4200478853885039,0.10119307630041813,1.0204580975643278,-0.4189468117151436,0.16367249282709329,1.0054046515654504,-0.4193336921138724,0.22648118161920217,0.990214087287105,-0.4212153966120986,0.29138961782465045,0.9792116128156065,-0.42655750056149766,0.36348400427892846,0.9821378068446753,-0.44000269488289945,0.43743587207169665,0.9782846833891443,-0.452786393898176,0.51198090200383,0.9664011095818803,-0.46432977994925984,0.5723487314285021,0.9241894827130421,-0.4633723623846375,0.6305520975079943,0.8790269047819721,-0.4625212637202152,0.6883984849635114,0.8334407730944866,-0.4631005221641802,0.7462157572021,0.7871700565876925,-0.46511882538191185,0.84177008972812,0.7743805821022902,-0.490417063554218,0.9605069701448348,0.7695052471366988,-0.527072844587767,1.0926134913302343,0.7594048797048789,-0.5685695716243993,1.2400945331745241,0.7428525209530255,-0.6157008460326556,1.4052928757933913,0.7183088424792785,-0.6694101327434339,1.6259249058393999,0.6988782817569072,-0.7468900480425917,1.690037050185183,0.5980339864496879,-0.7522246260946415,0.9236511972222772,0.26066418940916347,-0.40012186687705964,0.9430797804486231,0.20187051575228765,-0.3993016398069624,0.9621306734328732,0.14305163501662443,-0.3997682273516989,0.9682220341580594,0.08276443195795857,-0.3963318587865772,0.9702623480570405,0.023197745690095695,-0.3927547598665233,0.9722043481681784,-0.03551020294693466,-0.3906072256272415,0.9740631425677568,-0.09378158306610479,-0.38985095024019323,0.9758522068812061,-0.15202622224628715,-0.39047256343414904,0.9775777330886015,-0.2106519622144376,-0.3924806234541802,0.9792532652779564,-0.27007839773914766,-0.39591178845047015,0.9808930895230952,-0.3307493008736875,-0.400829649606226,0.98250755995047,-0.3931447976043021,-0.40732554135185906,0.98410700541903,-0.4577980461146067,-0.41552424732745075,0.985702036685566,-0.52531494303519,-0.42559010349085336,0.9881427641910299,-0.5969057977923544,-0.4381074516789203,1.0003386070405544,-0.6796387474172763,-0.45745231476222004,1.0139619888516171,-0.7705473066982496,-0.4805118914026285,1.029357873851497,-0.8717177544160499,-0.5080774503532846,1.046985098807808,-0.9859114989700752,-0.5412144867713458,1.0551837395645882,-1.1040231844722315,-0.5746960634652603,1.0440402212418851,-1.2144289022665857,-0.6031334155866428,1.0321495084104284,-1.3373887844932737,-0.6372270829767976,1.0192662774712977,-1.4763100912408427,-0.6783140316616549,1.005062209506026,-1.6358239416630012,-0.7282353256430907,0.9728891020911163,-1.792571348121688,-0.7766622328763526,0.9115205585751669,-1.9207813734965362,-0.8133739057310043,0.8460013070333958,-2.067611088252312,-0.8591942883812183,0.7745214609075516,-2.2387942381998833,-0.9165065413957847,0.7004570903575814,-2.463158418012251,-0.9971289441391338,0.5620062683954675,-2.5097029315428183,-1.0083731260038151,0.4082080555554121,-2.4863894029839275,-0.9951453394711978],[0.5339938925809995,-1.1270877179300842,0,0.4823981925298706,-1.1935807679959742,0,0.42698390384167695,-1.2649949569392094,0,0.36686184312723,-1.3424762041979688,0,0.30079338747396067,-1.426916424383319,0,0.22668745395955814,-1.5151760200549758,0,0.14400051623243199,-1.6136555256090808,0,0.05055094495162958,-1.729009781401773,0,-0.05321319386287701,-1.7261307018754386,0,-0.14717883492635092,-1.6104120351163584,0,-0.23094348579841772,-1.5103667485494605,0,-0.3065240000734393,-1.4200962808665398,0,-0.3742231945519159,-1.332989392150663,0,-0.43626564451048644,-1.253033277063209,0,-0.49374696840652277,-1.178955232887331,0,-0.5475253364388244,-1.1096493078879575,0,-0.5983011533966824,-1.0442128677239566,0,-0.6466573506221724,-0.9818946698911071,0,-0.6930889924988639,-0.9220567088810041,0,-0.7429580954412978,-0.869920892071034,0,-0.7936062415453629,-0.819815889624921,0,-0.8441933405244813,-0.7697712796428982,0,-0.8718325159767777,-0.700735708112707,0,-0.8863395020012175,-0.625818399053939,0,-0.9000333359244492,-0.5551003886761947,0,-0.9130717302524358,-0.48776721444867754,0,-0.9255885521037479,-0.423127556735591,0,-0.937699873349926,-0.3605819945229265,0,-0.9611334652285062,-0.30326680790455374,0,-0.9802564629422683,-0.24447014795810096,0,-0.9771336202737091,-0.1812623290446279,0,-0.9714225564752463,-0.11978440697881837,0,-0.9658856636694519,-0.06018138442231927,0,-0.9604767809283157,-0.0019563525618592047,0,-0.9551536767677655,0.055345298107603635,0,-0.94987667643192,0.11215065466405155,0,-0.9446074540322185,0.16887228402553378,0,-0.939307909496327,0.22592032226485192,0,-0.9339390595667934,0.2837144126827651,0,-0.9167375750816351,0.33836951618166644,0,-0.894496047301077,0.39096117353129567,0,-0.8553751993011756,0.434862710357347,0,-0.8175390486296159,0.47732255586140315,0,-0.8137740213674198,0.5407026300068836,0,-0.8363468464139054,0.6283731152997856,0,-0.8495724450035316,0.718746352912031,0,-0.8100051465019904,0.7697930368823025,0,-0.7585087782247695,0.8091865720621114,0,-0.7075919977733434,0.8481367359097467,0,-0.6568824449035437,0.8869283754322659,0,-0.6060137849339098,0.9258417282200972,0,-0.5540091256958759,0.9641061000486655,0,-0.5859115669293884,1.172500923564999,0,-0.4267814116174473,0.995213937597315,0,-0.3629087542494023,1.004700559217477,0,-0.3003113503127959,1.0139977751158114,0,-0.23663652607291286,1.0151338457125214,0,-0.1742836737199761,1.01614950832167,0,-0.11280190442476506,1.0171509819008406,0,-0.05186081111747021,1.0205822320537363,0,0.009417146883344177,1.0261183621712324,0,0.07077026452408353,1.0181157816093962,0,0.13282729798456594,1.016824789229542,0,0.196048154701717,1.0157949877391061,0,0.26091615144008595,1.0147383560641896,0,0.32682487464606447,1.0100598808190795,0,0.39305337142370833,1.0002233605412192,0,0.46142420211308943,0.9900686522930733,0,0.5504596431234967,1.0124187348496938,0,0.5887661234151631,0.9390357918703813,0,0.6434708265542346,0.8971879544460228,0,0.6980456360292493,0.8554394826817262,0,0.7528849155090613,0.8134886974575379,0,0.8083907241024137,0.7710280328193044,0,0.8497414664903427,0.7149103000374382,0,0.8333761416545804,0.6168352095491514,0,0.8096508898480579,0.5246888195740054,0,0.827547460737724,0.4660910847865567,0,0.868193436443665,0.42047804492377816,0,0.9059797275594286,0.37164378875035387,0,0.9245091290227241,0.3143319191080687,0,0.9365517054552144,0.25559004811918307,0,0.9420680404834099,0.19620832399211707,0,0.9474859503174491,0.1378861181315758,0,0.9528462529249984,0.08018403712090694,0,0.9581880740640552,0.022680903682825826,0,0.9635500023716066,-0.035038677510220384,0,0.9689712109869939,-0.0933963937817553,0,0.9744926156041029,-0.15283269054239768,0,0.9801581427900645,-0.21382042436774218,0,0.9742399767847796,-0.27357377999948085,0,0.9501661399713672,-0.3281134723664143,0,0.9330375186312767,-0.38465943340721087,0,0.9214664419879641,-0.4444150520842576,0,0.9095673338459478,-0.5058646985302735,0,0.8972360909447747,-0.5695459851841305,0,0.8843543871866029,-0.636069974386889,0,0.8707847103755393,-0.7061468097660191,0,0.8443228504894114,-0.7696431585247776,0,0.797432063857828,-0.8160310948975762,0,0.7505030440778504,-0.8624568544118176,0,0.7031953991146134,-0.9092571787856358,0,0.6603085237204724,-0.9643019608982262,0,0.6158125795338276,-1.0216453255894677,0,0.5691754112280571,-1.0817481551666215,0,0.5198753737568145,-1.1452827104992798,0,0.4672884141348044,-1.2130532288853906,0,0.41065314861682967,-1.2860409302219353,0,0.34902243476899875,-1.3654664276455497,0,0.28078249284800505,-1.450749245656283,0,0.20446686113102897,-1.541640574856776,0,0.11899302515969548,-1.6434392547407461,0],[0.3242889634704835,-0.850955708883669,0.3713424870539668,0.26920190480275985,-0.8641583507256088,0.36813928290564046,0.21483913426677925,-0.8770834159792127,0.3662568547437628,0.1608181441408577,-0.8898234599497634,0.36566213741922815,0.1076450781945083,-0.9098960389796886,0.3693605309429795,0.05382932251945777,-0.9416828862218445,0.3790157252039208,-0.003070289609631762,-0.9703968018363831,0.38866881947172804,-0.059431412680732765,-0.9415586663748803,0.3766379212385491,-0.11241016973340645,-0.9128671605048977,0.36601179152243746,-0.16341241756666358,-0.889765750684143,0.35887718024339454,-0.215152537809846,-0.8777268368345554,0.3574397736003243,-0.266635365558884,-0.8656464552369223,0.35725555605170434,-0.3182159547391348,-0.8534414506696741,0.3583213175007083,-0.37025236784749893,-0.8410261852277658,0.3606556842324333,-0.4184828392903741,-0.8192404659959585,0.36031099250925425,-0.46593703445893375,-0.7959523879340558,0.36060194815497737,-0.5136570154395619,-0.7725683204515379,0.3622101251316199,-0.5619982699893571,-0.7489145264913417,0.3651651285098576,-0.6113346809201996,-0.7248089096516943,0.3695221901090533,-0.66207042874067,-0.7000552381897149,0.375364732060145,-0.6962963092231536,-0.6571119060852038,0.3729750266209213,-0.7281430512160041,-0.6128197708029202,0.37089262935485157,-0.755303340760237,-0.5655332631935845,0.3679920235727965,-0.7779929003801853,-0.516064284566299,0.3645029884602369,-0.8001026766514947,-0.46721469304739616,0.36226579035405426,-0.8217822341010708,-0.41866617202565237,0.36124341385198333,-0.8431722054006978,-0.3701093968844986,0.36141912060544557,-0.8540766326532463,-0.3173965397301617,0.3584596493207364,-0.8607644041192639,-0.2641029582396448,0.3551394874005491,-0.8669907008509403,-0.2115119735698725,0.3529920476146349,-0.8728006346666684,-0.15930027306215022,0.3519834592601343,-0.878232283764163,-0.10715445881695296,0.35209797765949014,-0.8789047538492287,-0.054489678749109816,0.3515721527110247,-0.874341710550592,-0.0017819231332587126,0.3502167100577964,-0.8695168605631665,0.050692805783045886,0.350013980201896,-0.8644005284526299,0.10326261345142468,0.35096069229462357,-0.8589582337278605,0.15625813977517578,0.35307215859136676,-0.8522966780094055,0.20981110170268513,0.35602652962052694,-0.8355994560930653,0.26136999919146997,0.35611991150710387,-0.8185275391857068,0.31302546343160187,0.3573668808099033,-0.8009722820296159,0.36509527281295484,0.3597872695612494,-0.7828156956280838,0.41790849484471204,0.3634200331552335,-0.7639271714566087,0.4718142008199431,0.368324789472237,-0.7498130602096298,0.5311964730062728,0.3774300124470509,-0.7424920561937913,0.5999315083237939,0.3924277245951704,-0.7341833190681646,0.6743118235343513,0.410007466398183,-0.6939099699750613,0.7234973105374798,0.41234839318291594,-0.6361254786800026,0.7534116887131255,0.40545070719952503,-0.5950338397197421,0.8026650489222127,0.4105387679997097,-0.5907902685884423,0.9120934674989103,0.4459991367565561,-0.47639616557336106,0.8480975068727612,0.39861647871578554,-0.4092954480331352,0.8493994351384204,0.38565384599460417,-0.3545846193851838,0.8712211821565292,0.38389016507041585,-0.3013038143904423,0.8962738555428493,0.38495615450393883,-0.2444219960961138,0.9099779758202478,0.38255828804904857,-0.18697808747481803,0.9183318895448278,0.3793944641092504,-0.130228069007294,0.9262505938550931,0.37749694122722,-0.0738149062373693,0.9337889704107516,0.3768351845395044,-0.017390344124295007,0.9409953197754088,0.37739862876639774,0.039010654544038154,0.9386902042803538,0.375506994660473,0.09460882666447085,0.9320560408403287,0.37323754046915014,0.14968400759855383,0.9251554361088346,0.3721974878612302,0.20457899618236597,0.9179482124774525,0.37237017597046496,0.2596325820706078,0.9103894290040024,0.37375836363173587,0.3118778379029046,0.8929504209029702,0.372431335272674,0.3630471360259291,0.8734241392892255,0.37153550930509205,0.4140311972885371,0.8536676161829346,0.37186887890580467,0.5134705368293548,0.9201411008443525,0.4122278576615892,0.603619264824085,0.9496386655164386,0.4395279555802103,0.6146759689114947,0.8550824497399452,0.41084415341576475,0.6213733274253763,0.7680758130792036,0.3850997124012059,0.6756083715274985,0.7442876453043081,0.3916249439064401,0.720986227674012,0.7088402321836189,0.3938663576973791,0.7424138924217396,0.6512409770478853,0.38480177917100056,0.7493394469817298,0.5854063619459362,0.37073924068716013,0.7554821519953956,0.5237809990788076,0.35876394885251006,0.7690814518327853,0.4705956297964584,0.3523368927332535,0.786049901917917,0.42113681141125636,0.34905217895572394,0.8024736516188398,0.37228300791884705,0.3469399275232643,0.8184622762172018,0.323726635660776,0.34596611280223666,0.8341170718800472,0.27516868121160054,0.3461152092143944,0.8495336887757867,0.2263111133390543,0.3473895872290653,0.8585844981318731,0.1755774008727854,0.34729362938556374,0.8634944701934257,0.12408957451757341,0.34677736631218425,0.8681294975038831,0.07254622256516213,0.3474001881847093,0.8725171808608145,0.02062357459191387,0.3491721650304478,0.8766813664059887,-0.03201151745063055,0.3521221784678137,0.8792874985989974,-0.08557853043420383,0.3557507809013716,0.8732027615290665,-0.1390663246153565,0.3571856450655837,0.8666774446717813,-0.1931006581905481,0.3597795430877053,0.8596626443094664,-0.248018282774912,0.3635735502128874,0.852100392904863,-0.30417854405987055,0.36862898549198286,0.8435446195780898,-0.3618116986754978,0.37486225667613904,0.8200953645666984,-0.414287863187079,0.37603186380706677,0.7961713691526664,-0.467141579834927,0.3784602664415544,0.7716109631990498,-0.5207168985968504,0.38218753165767705,0.7462380523064795,-0.5753780117623992,0.3872763351769173,0.7133011121385722,-0.6257685296734463,0.3902281107983683,0.6776273648669444,-0.6750182926377057,0.39343190078184964,0.6322728084338962,-0.7151336638553896,0.39257144202164707,0.5768275866085397,-0.7421891927826647,0.38634442957152015,0.5229414108997386,-0.7685202184021933,0.3816775304072577,0.47017035202157453,-0.7943423238246448,0.37848114756516127,0.4181045623275983,-0.8198551396306248,0.3766954167968597,0.364611523290731,-0.8412258339239203,0.37449651732336076,0.30875523668467,-0.8546892670154591,0.3703087607816751,0.2539107199261226,-0.8678044426526665,0.3674803903612456,0.19968169306905836,-0.8806685476953984,0.36596117637212666,0.14568945370096076,-0.8933727178562676,0.3657245162816509,0.09285468882641446,-0.9187948424183991,0.37194397420872005,0.03820877821593105,-0.9506121902895401,0.38194631479763386,-0.019231492763173513,-0.962295861981449,0.38514652656338066],[0.2364615917046251,-0.8292749620147921,0.7237627614018503,0.18165023822688808,-0.8401172470295868,0.7157951100476887,0.1278126102436472,-0.8505724023970358,0.7103725076958196,0.07457797629282625,-0.8607168999048636,0.707402300563829,0.02159200510478282,-0.8706207121180283,0.7068344397640551,-0.031101791595786438,-0.8694160212389823,0.699858410119115,-0.08223864875285958,-0.8607806751126983,0.6895294959484799,-0.13212436791489335,-0.8527514138027481,0.6822273137041575,-0.18106300571039946,-0.8445073185330214,0.6772061697106544,-0.22936341990175624,-0.8360045816783384,0.6743864139805189,-0.2773195838081033,-0.8271960767200603,0.6737239103961139,-0.3252180079882083,-0.8180302664772858,0.6752083508214239,-0.3733447925509883,-0.8084499579585085,0.6788628647970532,-0.42199268378258603,-0.7983908390563772,0.6847448971325512,-0.4716035578993969,-0.7880053680364374,0.6931469038572358,-0.5190421281631719,-0.7719822140038382,0.6994847795691026,-0.5502854330070099,-0.7326415708267442,0.6869818190077543,-0.5802934621191205,-0.6942548939016815,0.6770269999646894,-0.6092064477223031,-0.6564639937826771,0.6693571491191537,-0.6372182801643747,-0.6190435732847233,0.6638536856618829,-0.664504344125405,-0.5817797647423761,0.6604333941688312,-0.6912261390590331,-0.5444648695917875,0.6590453399036496,-0.7125018737566249,-0.5033367050711184,0.6550415499580677,-0.7317922875539367,-0.4614219894218352,0.6518168341251256,-0.7477348122176766,-0.41796465127194526,0.6481572475621071,-0.755395540301909,-0.37083219130141587,0.6399403424632415,-0.7623191506701614,-0.3244724628744555,0.6337075101574121,-0.7685607955032543,-0.27863683285417484,0.6293708272791014,-0.7741651110489789,-0.2330890936856198,0.626870231230479,-0.7791674352913844,-0.18760021789910653,0.6261715016079785,-0.7835946944373173,-0.1419434690503928,0.6272651301262839,-0.7874660051841804,-0.09588964147300827,0.6301660092150678,-0.7907930217515213,-0.049202212520832456,0.6349139202578615,-0.7935800410914302,-0.0016321852106245174,0.6415748513512574,-0.7958238650001226,0.04708762427915919,0.6502432263361531,-0.7902677754544358,0.09636560869218147,0.6550394108688753,-0.7822793875901892,0.14612284737053793,0.6603420367714992,-0.7662255463167935,0.19486587105036224,0.6613322102455141,-0.7537637562737447,0.2451349551090325,0.6679989194687619,-0.7476077696935732,0.299259330480258,0.6833014305902188,-0.7409522068963943,0.3560411776091452,0.7017296178961709,-0.7337105629781764,0.41608478408660954,0.7236682091582387,-0.7143930447907643,0.47258209918089644,0.737848508530075,-0.690929649355426,0.5290277997782749,0.7517782184250028,-0.6689546284023509,0.5900499865771165,0.7719280298406854,-0.6471161286466951,0.656125339869496,0.7978987727947917,-0.5957013672839828,0.6944606752453208,0.7915986400927904,-0.5334648976680025,0.7169478954893855,0.7716552201304276,-0.47371461380654845,0.7378378996737842,0.7547633043753557,-0.4160082204908542,0.7573321816745118,0.7406466799745952,-0.3599563869726705,0.7756011722433369,0.729084582048793,-0.30521065662478497,0.7927901292984068,0.7199029097085883,-0.25145361483962336,0.8090237508885534,0.7129676542200816,-0.19839068397133808,0.8244098250540168,0.7081800590866107,-0.14517482400505666,0.8357707808190007,0.7027225880347943,-0.09231172855534375,0.8444974457619825,0.6977818357920751,-0.04002694388647737,0.8537112301435679,0.6958664970549906,0.012104211706674889,0.8590269275543028,0.6933291804184316,0.06319705656950586,0.8529085031874786,0.68414048997179,0.11311562090587901,0.8468159722644666,0.6775085525033253,0.16236027564048938,0.841386330760117,0.673858546947752,0.21049462786033946,0.8329976627671174,0.6702433458753934,0.25738777689881576,0.8217997263409433,0.6667341458929505,0.303753364751443,0.8101297011654376,0.6651939088711227,0.34983435426541165,0.7979306240341999,0.6656010475105809,0.39586918775885693,0.7851382594429959,0.6679612572522928,0.4420969580586873,0.7716796852375039,0.6723077084891083,0.48876264933970015,0.7574715701879953,0.6787021736810259,0.5351055045613089,0.7410094557194218,0.6859332564367335,0.5786996284035713,0.719259622744894,0.6911698652747202,0.622923263747932,0.6968683989068252,0.6987951330602158,0.6647054674468102,0.670270688197196,0.7053582639008757,0.6810147883630489,0.6190532364134023,0.687952608716377,0.6978948680807586,0.5711960774766132,0.6750105555852821,0.7158892833587287,0.5261777633588789,0.6664592567996523,0.7295953298340123,0.4795652973058675,0.6569567819247855,0.7387350091873532,0.4316314238745447,0.6463284614851346,0.7440264848587623,0.3832105493344131,0.6352352661632996,0.7489886704694673,0.3361818367094984,0.6265926705312093,0.7536666473638807,0.2901877897749914,0.6202464088640998,0.7621257403908581,0.24620140128073809,0.6193586358589358,0.7746417255054272,0.20324533907472908,0.6239668340248277,0.7868731413397665,0.15938160060001372,0.6305163905435038,0.7936197862516474,0.11359499917975135,0.6348990202429996,0.7969983336088715,0.06670667102451894,0.6388729625799123,0.795770816390287,0.018944145890044242,0.6414764235558787,0.790233593018363,-0.0292250376236165,0.6429425865051557,0.7840509492987424,-0.07773062417343324,0.6462539169426487,0.7771821645070496,-0.12681854715019214,0.6514555510891737,0.7695763794905384,-0.1767469093421662,0.6586194255489204,0.7611711801223109,-0.22779186055123657,0.6678466968128633,0.7518907317331682,-0.28025433048696935,0.6792712473948335,0.7416433494166337,-0.33446798540467815,0.69306450981935,0.7303183438000143,-0.390808884478443,0.7094419425771501,0.7177819184859024,-0.44970747035325287,0.7286716336010635,0.6921449908946151,-0.5031392179067282,0.7385722886662984,0.6597298895063353,-0.5532331408941427,0.7447420614758378,0.6238832189902777,-0.6016895828118636,0.7504250471344696,0.5869798289589112,-0.6506569067050374,0.758465915231711,0.5493083460515806,-0.7010833040307651,0.7697170404673139,0.5105182336271943,-0.7534521078301646,0.7844146146017628,0.456057644843862,-0.7839734407053918,0.7787044233538172,0.3937676920418145,-0.7971085298170544,0.7595983294621371,0.334174422558396,-0.8094703350424557,0.7438479080118734,0.2767367574846771,-0.821184158328295,0.7311487473953986,0.22098040576515765,-0.8323572415573834,0.721266056668973,0.16648067623806606,-0.8430828611862724,0.7140235834436943,0.11284853172950671,-0.8534435627209698,0.7092957072167643,0.05971885678567296,-0.8635137816856711,0.707002024568967,0.006737144781706297,-0.8729721276620124,0.7067883003814055,-0.045589648706008234,-0.8669773975690527,0.6966854105110576,-0.09633305756064087,-0.8585497508631761,0.68724696320721],[0.15112042009019933,-0.8091498034611542,1.0592973192835213,0.09716703000804072,-0.8160063982480117,1.04287834531205,0.044649657609481974,-0.8222176412309228,1.0300371949999665,-0.00676149931722099,-0.8268991860656838,1.0194125152333076,-0.056851887449804794,-0.8249566914763813,1.004641503584394,-0.10562770515659703,-0.8226194773252287,0.9932825232161218,-0.15340116425837702,-0.8198879630675338,0.9851585024852598,-0.20013196350329854,-0.8154151279722326,0.9785357080139176,-0.24536839344184247,-0.8075774755118559,0.9713884715990186,-0.29002091745198166,-0.7995839147477186,0.9675100007119841,-0.3343765714018645,-0.7913861750222173,0.9668368905655953,-0.3787156442610853,-0.782932995209821,0.9693581976663559,-0.4233189232724599,-0.7741688109243281,0.9751150055367939,-0.4627195271712736,-0.7556334363195543,0.9721106148351231,-0.4910577018280553,-0.7210503183838446,0.9513776478929863,-0.5179528728246039,-0.6873226375364458,0.9341634720764027,-0.5436165603752667,-0.6542360958218967,0.9201941052725449,-0.5682330535542031,-0.6215950091033573,0.9092552488348753,-0.5919650284932252,-0.5892169665706772,0.9011840543236636,-0.6149581007812803,-0.5569282548605448,0.8958631280427616,-0.637344592008863,-0.5245597849588202,0.8932163514957496,-0.6589798164437481,-0.4917441362364223,0.8928446062678255,-0.6680043180345914,-0.4502961518523989,0.8790219934622305,-0.6760204395276794,-0.40950603649463657,0.8677184910417433,-0.6831659949563367,-0.36923433131443195,0.8588833068606299,-0.6894965116044469,-0.3293009566988474,0.8524056376973759,-0.6950564304602826,-0.28953358248112426,0.8482057492752224,-0.6998802308850278,-0.24976433283286115,0.8462326202693697,-0.7027380364945381,-0.2094525834479155,0.8449532366038497,-0.7028674668640367,-0.16846326633274677,0.8434443543831058,-0.7014942034438629,-0.12720034324156415,0.8431702464648163,-0.6986186333515043,-0.08563169423700978,0.8441294939274178,-0.694233367587823,-0.04372368468050897,0.8463270641599641,-0.6883231887849499,-0.0014412338992400454,0.8497743564716442,-0.6808649272013669,0.04125212412952148,0.8544893068348687,-0.6718272637903491,0.08439418323211034,0.8604965528994715,-0.6611704584091584,0.12802400553895954,0.867827661052214,-0.6488460004929117,0.17218185449753198,0.8765214179264476,-0.6347961787986405,0.21690911420050374,0.8866241893842668,-0.6189535661458798,0.2622481879174463,0.8981903505871012,-0.601240414463057,0.3082423675092847,0.9112827913228916,-0.5815679549287407,0.35493566384732644,0.9259735012419474,-0.5577294207552379,0.40085880655761885,0.9387990141681195,-0.530851110191024,0.44632762075640464,0.9513849282781095,-0.5018559046917122,0.49194319089770966,0.9653709349595374,-0.468507479555909,0.5352324432107975,0.9763255973686276,-0.4296444368438319,0.5735043526548265,0.9805852552165417,-0.38180594318014527,0.5989295676507154,0.9669471037068789,-0.33442221531700334,0.6224574336567636,0.9551041556705675,-0.28743176191430964,0.6441791775117163,0.9449799850269756,-0.24077419062265903,0.6641738456758319,0.9365101446695165,-0.19434252632521787,0.6823422650898121,0.9294140351306135,-0.14779627036443543,0.697239846403507,0.9216839255456417,-0.10164548077032476,0.7104872071635846,0.9154783041003123,-0.05585847148985079,0.7224381557337267,0.9111474500127876,-0.010320047449191176,0.7329316133790194,0.9083977149845675,0.03479599593338259,0.7368067168792427,0.9008651127767013,0.07901159087794363,0.7376690469413774,0.8930700412244912,0.12240482657819662,0.7371985454303722,0.8869897043921791,0.16508313107023942,0.7354780796064091,0.8826463578259736,0.20666589950507674,0.730827820325981,0.8779698844684427,0.24733854010756695,0.7243952593047549,0.8742901523634261,0.2872740921173802,0.7166397481972586,0.8721252425235191,0.32653918456184816,0.707559217228769,0.8714606083243988,0.3651960024281635,0.6971426683524262,0.8722917939413612,0.4033026486298463,0.6853701469032547,0.8746243725279736,0.4409134492570166,0.6722125889923865,0.8784740235527453,0.4780792047040867,0.6576315422203138,0.8838667510822047,0.5148473879636222,0.6415787543530325,0.8908392480769427,0.5509015506694932,0.6235872863327594,0.898850832965171,0.5752273412047391,0.5923141681823267,0.8909277389053232,0.5978756994992027,0.5602239043669681,0.8843260660321421,0.6188942916319284,0.527319445016853,0.8790135479978938,0.6377722471004028,0.4931724002190996,0.8742091962759941,0.6549759073783537,0.45820063455640003,0.8705386533884454,0.6656532566712299,0.4193372155768693,0.8616754461832175,0.6696386250279582,0.3774492508421323,0.8477934416670916,0.6637584311500717,0.3318690876712571,0.8251923724609664,0.6684895940374327,0.2930302103870215,0.8192467380297037,0.6795972795637102,0.2570407640017469,0.8240971006777409,0.6899438435444836,0.22019213357173228,0.8308923026011614,0.6968422243348646,0.18164068950975532,0.836460258912628,0.6973874450467701,0.14111744960169426,0.8373946361807114,0.6964503492076775,0.10014311303684986,0.8395716995944111,0.6940185689525622,0.058680337422292395,0.8430029659339988,0.6900717390709676,0.0166897049270176,0.847706644226113,0.6845812867113308,-0.025870265218862404,0.8537078094271813,0.6775101415451816,-0.06904311070269226,0.861038642182355,0.668812362816992,-0.11287442190069197,0.8697387374589072,0.658432678776729,-0.1574118342254326,0.8798554856038638,0.6463059330608614,-0.2027050110585491,0.8914445301201903,0.6342848942991011,-0.2495643790045945,0.907328925500674,0.6281599661439166,-0.30136249670458626,0.9366979509434623,0.6207832962930557,-0.35636303777448086,0.9703677263587167,0.6119887705912359,-0.41511800440360425,1.0089382576913177,0.601570392954859,-0.478292751145442,1.0531491860314803,0.5803197351304692,-0.5383943917440632,1.0871500265144798,0.5438544378161452,-0.5879224090956727,1.099882017639116,0.5059752972657723,-0.6382883458862803,1.1160719638618337,0.46645618937393607,-0.6898093456609753,1.136009098297314,0.42498837300998105,-0.7427708810974996,1.159941677205131,0.36829128239652165,-0.7704253245934765,1.147871044429018,0.307227188378987,-0.7839894983451621,1.1206449767803681,0.24837157989411396,-0.7956391671513883,1.096707015186964,0.1910500459454163,-0.8037767883308042,1.0734749069622538,0.13583462357195975,-0.8111401916351046,1.0543211343936498,0.08231957635685777,-0.8178094766733293,1.038928579843624,0.030142807896238882,-0.8238506230922611,1.0270515870155759,-0.020950861500510273,-0.8263948853871605,1.0149163848693048,-0.0706396909958773,-0.8243413783135498,1.0011227562431593,-0.11910426402916108,-0.8218938799682851,0.9906858185134331,-0.16664946344596088,-0.8190511283454631,0.9834439997815014]],"rightToLeft_ears":[[0.9057555899738863,-1.0505855040144136,-0.22922875412361243,0.8750086125735823,-1.0923941216840567,-0.23268489407608506,0.8438096948820344,-1.136456448534556,-0.2372835677943077,0.8118301489173665,-1.1833347171522814,-0.24313851085737215,0.7786978312450983,-1.2337017322735147,-0.2504026324638121,0.7439772532390303,-1.2883804633188194,-0.25927860789874535,0.707142690347512,-1.3483991071136243,-0.27003422112831155,0.6675404186397673,-1.4150697744222431,-0.2830248168698263,0.624333812290137,-1.4901040907977503,-0.2987267432898699,0.5764207625822277,-1.5757881421344595,-0.3177883643393594,0.5223049584772996,-1.675256115878521,-0.3411102074431873,0.4598872000322216,-1.7929348039845072,-0.3699754769899837,0.3861114273975145,-1.935298353544375,-0.40627195647389314,0.29894533607594254,-2.1308522650837896,-0.4568846934616546,0.18694857480676327,-2.388725482479706,-0.5252939064588734,0.0337549371330927,-2.651805870911615,-0.6006931932584127,-0.14659188610079127,-2.5659301805195702,-0.6015040140539227,-0.3032449123553188,-2.2918142737239275,-0.5587357596773748,-0.44029685746789454,-2.056741251536092,-0.5242840710391332,-0.566775298127446,-1.8644987208451236,-0.4998655995963338,-0.6848965134237769,-1.6949549677930609,-0.48102603862416504,-0.7959456593544321,-1.5393596314028666,-0.46582793866594596,-0.9018014426523118,-1.3947078594586102,-0.4537676215513542,-1.0033356931272843,-1.2577103658909392,-0.44416868275425947,-1.0281334276367198,-1.0514011290981278,-0.4076141725419148,-1.0082302552136435,-0.841657929657164,-0.3631095657118394,-0.9951570363898141,-0.6746679958364978,-0.32941329753910686,-0.9921957314658703,-0.5398948246917892,-0.30487180120746094,-0.9895852884504404,-0.4233986517275279,-0.2846722754316091,-0.9872434476446852,-0.3210191920117711,-0.2678742484391704,-0.9851100370649788,-0.22972816309981903,-0.25379904247183327,-0.9831297831481418,-0.14726189405765583,-0.2419433388795359,-0.9812750641719559,-0.0718938502318123,-0.23193269140988648,-0.9795220424950002,-0.002274167036693829,-0.22348082328789443,-0.9778481801274328,0.06267295725515276,-0.21636611823956153,-0.9762347950320591,0.12382093524112125,-0.21041633414223904,-0.9746660157690838,0.1818925732637452,-0.20549714583307555,-0.9731280076660558,0.23749788458253251,-0.2015039884780635,-0.971608381780658,0.29116237550319357,-0.19835619948568983,-0.9618236352661169,0.34042099808295,-0.1943215560060665,-1.0130830046740726,0.41259924901443434,-0.20330030033280977,-0.960661001218801,0.44198540848535184,-0.19217885468631402,-0.9186839447241226,0.4710632582098704,-0.18386928064769148,-0.8865471600540058,0.5014965050363958,-0.17816367554816592,-1.4926493899556417,0.9242743924607661,-0.3022935882700797,-1.3992922029693062,0.9428367925907688,-0.28664047630883394,-1.3211288409149642,0.9642200249899022,-0.27477267170765807,-1.251246172085593,0.9857952074202769,-0.26525428924865235,-1.187951181391401,1.0078078351635833,-0.2577315329626416,-1.1112329038169175,1.0134449316997367,-0.2477791919329413,-1.0107288522925488,0.9900361713065147,-0.2326647167391508,-0.9317940069173947,0.9800987636927978,-0.2224977095794084,-0.8756555537754265,0.9895365096067277,-0.2180119938520273,-0.8210666064948406,0.998051737050333,-0.21433524826972017,-0.7676597167711781,1.0057356978715823,-0.2114076038273094,-0.7151003093658517,1.0126633063313188,-0.20918300714739446,-0.6630772914657324,1.018895741071816,-0.20762741111085636,-0.6112949985759011,1.0244824200652296,-0.20671748867034634,-0.5620649467905738,1.0342447367939744,-0.20739877089296765,-0.5103239101205908,1.0400194246014771,-0.2080210098815396,-0.4579975290633638,1.0456550154487232,-0.20936386281743513,-0.40472229539228644,1.0511867105283446,-0.2114504426290449,-0.3501093756227416,1.0566487566066018,-0.21431736457912565,-0.29206186770464604,1.0560340199670866,-0.2167762139297681,-0.23097037698627532,1.0486850724506458,-0.21869253469771033,-0.16851801598203886,1.040902756735949,-0.221388623501796,-0.10424450032203136,1.0326198164170375,-0.22491140942181043,-0.03833731904300203,1.0427625844177486,-0.23358145062194302,0.03280881035825105,1.0437847639627345,-0.24155112888164698,0.10725785059307502,1.0256773678082323,-0.24640521506612645,0.18926569516908398,1.0297146964010842,-0.25814042486875033,0.2798929821468076,1.0344508769196654,-0.2721506726623123,0.37867675953993096,1.0325756493909832,-0.2868748073312527,0.48266071952191014,1.0167420122316262,-0.3003835362435008,0.5890954286658927,0.985460870492425,-0.3120473559928697,0.6777571839119536,0.9153247101269977,-0.31347596425317525,0.7988256086247005,0.8786784911232701,-0.32893510869174436,1.1733275245151016,1.0539958683280117,-0.43679339407230555,1.5977461406424909,1.1685742541331914,-0.544511914874851,1.834404956602532,1.082357122442291,-0.5783566210899596,1.9677680643056805,0.9208347842796314,-0.5791264518358272,1.1691022324565807,0.42175938666116775,-0.32370221921603526,0.9686762149337356,0.2569038243413516,-0.25407900195306055,0.9730202437483362,0.1741075998878059,-0.24327819310669974,0.9758777492429909,0.09768546805691708,-0.23389191598089476,0.9784919776184102,0.026694282519243134,-0.22597683974806937,0.9809045144320896,-0.039879557279537264,-0.21933475361265664,0.9831490737049058,-0.1028677993138794,-0.21381121964728134,0.9852534214476423,-0.1629662932979027,-0.2092858237123878,0.9872400685682545,-0.22076883718417661,-0.20566504566687938,0.9891210308652418,-0.27679101591731814,-0.20287595575246553,0.9909219991190499,-0.33149623933106986,-0.2008674260321397,0.9926579530653399,-0.3853067171566611,-0.19960237056260055,0.9943423496075567,-0.4386184932995618,-0.19905788244296452,0.995987545114164,-0.4918133818919481,-0.199224209088946,0.9976051606109255,-0.5452700246153741,-0.20010432286355972,0.9992064130650395,-0.5993747583033127,-0.20171405150003618,1.0008024330211227,-0.6545329619134805,-0.2040827790717168,1.0024045880644379,-0.7111816036070726,-0.20725477602603937,1.0040248328956989,-0.7698038405032763,-0.21129127253704827,1.00567611049743,-0.8309467582617809,-0.21627346129988634,0.9999506394554127,-0.8886476741158518,-0.22066878758496644,0.9885511177689263,-0.9437947532347666,-0.2248454542560212,0.957491359183039,-0.9816204980460213,-0.22551053519917097,0.9277755711505344,-1.0216159974776198,-0.22740126234152291,0.8971667220122379,-1.0621039235928755,-0.23008735627419485,0.8663243660303621,-1.1044925897423568,-0.2338541658008514,0.8349413858879378,-1.1492832211167388,-0.23879190456231747,0.8026786242537987,-1.1970657144954546,-0.24502442857317874,0.7691484378157467,-1.2485504136286756,-0.25271735397569695,0.7338931428784154,-1.304611415516796,-0.26208980249232483,0.6963555472774203,-1.3663472609768088,-0.2734314478714619],[0.715098933285665,-0.897481296455561,0,0.6841468725532334,-0.933580708529246,0,0.6535157749672464,-0.9730559962632999,0,0.6214094083746384,-1.014432510956591,0,0.5874684594696684,-1.0581733113059526,0,0.5512630355127524,-1.1048324140109949,0,0.5122685928408077,-1.1550858154825825,0,0.46983255289388137,-1.2097745148508068,0,0.42312687089574164,-1.2699656402427735,0,0.3710789143576496,-1.3370415278939767,0,0.3122679091209333,-1.4128331754877745,0,0.2439204215541818,-1.4946516884664853,0,0.1645958662079876,-1.5891266225192147,0,0.07085479500637697,-1.702103053280441,0,-0.040545803464551805,-1.7427630884553542,0,-0.14780408685009805,-1.6096652581974968,0,-0.24608530371175408,-1.492281941933396,0,-0.33650371186579786,-1.3815997113869973,0,-0.41948135069315984,-1.2746637402221577,0,-0.49706368598685047,-1.174680871498599,0,-0.5702702409034275,-1.0803372126976583,0,-0.6399484020071988,-0.9905407093033616,0,-0.7073939498614366,-0.9051036527117011,0,-0.7815681925024345,-0.83172484430814,0,-0.8556334513680053,-0.7584538509531922,0,-0.8818131736195078,-0.6491933676175496,0,-0.9015998035616644,-0.5470108006728645,0,-0.9196942490060365,-0.4535670516184971,0,-0.9364200345159368,-0.36719136750431813,0,-0.9665790020349165,-0.29092985038106534,0,-0.9801266685179817,-0.21348161308591385,0,-0.9730456643164302,-0.13725668550450776,0,-0.9665372941140342,-0.0671959945022432,0,-0.960493017553095,-0.0021311350521294996,0,-0.954825549996428,0.058877486293163056,0,-0.9494633242933546,0.11660026886154207,0,-0.9443464952057576,0.1716814290397919,0,-0.9394239864304148,0.22467078820965647,0,-0.9346512518840209,0.27604787185614454,0,-0.9216092683837367,0.3233012555030699,0,-0.9070902662257154,0.36820886682904885,0,-0.8809147410365874,0.40620215749764044,0,-0.8509985353893903,0.4397742161585234,0,-0.8226185461834561,0.47162232796965675,0,-0.8054550457796408,0.5083926012258813,0,-0.8205080789506596,0.5668570034668816,0,-0.8367606107960426,0.6299801327689862,0,-0.8505894910618879,0.6956638293267252,0,-0.8413106722966055,0.745845030974901,0,-0.8055958552072653,0.7731660431261944,0,-0.7703885236349537,0.8000988405501723,0,-0.7354282991990315,0.8268426067085297,0,-0.7004620135242821,0.8535910095749277,0,-0.665236322299688,0.8805378517098701,0,-0.6294903083942627,0.9078827287066478,0,-0.5929476102568954,0.9358370507840807,0,-0.5548248777722247,0.9637923492500708,0,-0.5690136065422142,1.0961986473214234,0,-0.4589582059377848,0.9904349118726152,0,-0.4074091066988603,0.9980911895271047,0,-0.35513810494202236,1.0058546870205096,0,-0.3017432397104862,1.0137851051960416,0,-0.2451096953501346,1.0149958266662211,0,-0.1871224652269522,1.0159403778651122,0,-0.12738947976238102,1.0169133655886853,0,-0.06543498235627049,1.018811687979111,0,-0.00048303829330094525,1.0272836806829764,0,0.06791051320300753,1.0184887926512767,0,0.1403274265291583,1.0167026199968747,0,0.21784940517193008,1.0154398682201156,0,0.30153337249913204,1.0138162755106443,0,0.388541946402581,1.0008934153644682,0,0.5965186626526218,1.2203969731160758,0,0.5725397573602622,0.9514485880229793,0,0.65112554152346,0.8913322738704865,0,0.7306432072047575,0.8305030918285716,0,0.8116957839817958,0.7684997381650318,0,0.8461364698349505,0.6663949860399534,0,0.8104563887381713,0.5278172927914144,0,0.8429440980907663,0.44881293064854666,0,0.9001811534161912,0.3845813298358496,0,0.9264576991082318,0.30830494651800944,0,0.9387607602528618,0.2318102229444946,0,0.9455365751625577,0.15887056832835433,0,0.9519179271220506,0.09017719135262986,0,0.9579806541706812,0.024913717829143575,0,0.963788789822984,-0.03760915419269106,0,0.9693975459741058,-0.09798576452537539,0,0.9748556042830714,-0.15674015691010823,0,0.9802069309360228,-0.21434561440952904,0,0.9763771742528844,-0.2687319222872542,0,0.9554426042811839,-0.31615955149900277,0,0.937436350008694,-0.36194288778952544,0,0.9282181796934816,-0.40954757378685347,0,0.919126894988997,-0.45649699421089096,0,0.9100953890820511,-0.5031377036013112,0,0.9010582982539401,-0.549807254769354,0,0.8919500966699365,-0.5968440377295616,0,0.8827031810848878,-0.6445971707068892,0,0.8732458251962867,-0.6934370643134211,0,0.8634998691418914,-0.7437673534975584,0,0.8349844646001587,-0.7788814008656213,0,0.8029560581940087,-0.8105663391065576,0,0.7709136817492248,-0.8422650975733794,0,0.7386250763535935,-0.8742074444661081,0,0.7058507919574217,-0.9066302620054851,0,0.6756929017626292,-0.9444756145481223,0,0.6446812735390663,-0.9844413044418703,0,0.6120996773926537,-1.0264302628559103,0,0.5775710408916894,-1.070928435247998,0,0.540641707249403,-1.1185204638151682,0,0.5007551168363416,-1.1699236049812969,0]],"rightToLeft_ears2":[[-0.22328447068525267,-2.3088650871516787,-0.5037745765051258,-0.32719554167240356,-2.0728226582866576,-0.4415206115704784,-0.4098411739974893,-1.8942628542694186,-0.39550785160387947,-0.4798901402242227,-1.7591394775031324,-0.36144849529964884,-0.5395754804199804,-1.6467391489644823,-0.3342362315744126,-0.5916371055903458,-1.5512265025550915,-0.31217474928335376,-0.6379767460540915,-1.4685720417150896,-0.2941003930981775,-0.6799623846848277,-1.3958989684864682,-0.279190508528787,-0.7186100354077498,-1.3310936609288357,-0.2668493273716085,-0.7546971009791261,-1.27256332363512,-0.25663717496216343,-0.7888358147091328,-1.219079619044884,-0.24822503126579631,-0.8215225182394099,-1.1696744952078424,-0.24136453725245421,-0.8531718697460455,-1.123568744080091,-0.2358677518917588,-0.8841414460837234,-1.0801216454979934,-0.23159327138300834,-0.9147501498644708,-1.038794489561068,-0.22843663678884896,-0.9451164192749375,-0.9989371137071714,-0.22628154318506777,-0.9741534918420482,-0.9588302415295238,-0.22476848491626422,-0.9966596844308637,-0.9133882620291107,-0.22268064664593668,-1.0044330884445243,-0.8563481695637982,-0.2182917779426562,-1.0047265168156847,-0.7956126604698945,-0.2133009774294471,-1.0030946562632534,-0.735983689474101,-0.2088712239362267,-1.001486274625293,-0.6785533115887512,-0.20533804054889848,-0.99988904757469,-0.6228134267356116,-0.20263208915289976,-0.9982914016078341,-0.5683092523091267,-0.20070214799922503,-0.9966821454270032,-0.5146235316713614,-0.19951266859752625,-0.9950501377935064,-0.4613632244041499,-0.19904214544386634,-0.9933839698096771,-0.408147739905488,-0.19928215613473943,-0.9916716418591371,-0.35459794797234645,-0.20023699090746738,-0.9899002155332686,-0.30032528416956494,-0.20192384096020577,-0.9880554188844339,-0.24492027819547857,-0.2043735610882753,-0.9861165514766594,-0.1879388899332437,-0.20763109609487018,-0.9840648583751244,-0.12889009098127152,-0.21175945861654344,-0.9818833763763744,-0.06721640316801367,-0.21684304350626038,-0.9795464289470139,-0.0022691720807598917,-0.22298997241968965,-0.9770230473510377,0.06672039984487785,-0.23033912159364034,-0.9742752897163025,0.14068153626184793,-0.2390685636808666,-0.9712559236134246,0.22075906949649315,-0.24940742705594066,-1.1699498466256397,0.37276567035505015,-0.3162713195373288,-1.0775515374512445,0.4531054599569382,-0.3086809442598736,-1.778209872066159,0.9526753010445095,-0.5438129489956076,-1.5936939397512246,1.0649354410710328,-0.5247263428664651,-1.2417308632470172,1.0222852212488096,-0.4444979386437191,-0.864708938789847,0.8722242918097769,-0.34045375075093265,-0.7307198533424892,0.9032917673661456,-0.32090708459607675,-0.6269470049084829,0.9555796826727878,-0.31253231022020633,-0.5302211082762505,1.0094090263495143,-0.30687971277426174,-0.4220011545889262,1.0260133926315125,-0.29238185662463456,-0.3217664320424509,1.0365355206499944,-0.278907313346044,-0.2268716033651612,1.031719298417603,-0.2638465261833859,-0.14136603215147192,1.0270739526849004,-0.2511113787157766,-0.06429181938274062,1.0361316267370264,-0.2434974382007805,0.008541488286962232,1.0497512484629534,-0.2383099102493519,0.07643655193719245,1.0338173411239802,-0.2277678262794114,0.1412783702630338,1.0374255574428553,-0.22279091971026166,0.20445073353233,1.045413154691464,-0.21974788258046918,0.26607060082171863,1.0529398692799057,-0.21750282332170556,0.3262383537769433,1.0589721386821025,-0.21579405500488225,0.38155088100456713,1.053529469319987,-0.21257852928717358,0.4353488040158162,1.048031732213928,-0.21016349939743095,0.48803531467170513,1.042444811372039,-0.20850612717207329,0.5399834066759768,1.0367340247667522,-0.20757767804163252,0.5915468520987046,1.030863214276779,-0.20736228946355884,0.6392379117718985,1.0186868949321757,-0.2066176572755294,0.6884323569873185,1.0090081082084916,-0.20712302197299615,0.7376711251964849,0.9987376911523604,-0.2082765197237303,0.7872375721971774,0.9878067369178112,-0.21009568123135514,0.8374256788077661,0.9761348332880164,-0.21260860739851017,0.8885475426285865,0.9636276977120466,-0.2158550362801377,0.9409419189722308,0.9501741712854792,-0.21988790374447875,1.1163596608174022,1.0497787296622585,-0.2521952436242473,1.233272942467318,1.0793046398925137,-0.2705721878870265,1.3696429289526963,1.1140537788048386,-0.2930931686060848,1.532086805441423,1.155784814181383,-0.32110533119799056,1.632757600280692,1.1389498030231269,-0.33648827856046715,1.675918882559115,1.0766273809437967,-0.3409153398908318,1.6898041462316464,0.9944080742386199,-0.34056005096797193,0.9148620881173679,0.48976202494587984,-0.18334342599272868,0.9552228468157589,0.460999444168416,-0.19104582658677294,1.0036866702693419,0.43148678405643137,-0.20105671008817183,0.9737589272340479,0.3669472920371222,-0.1960779779060552,0.9677427473566529,0.3125995694037016,-0.1965984371624233,0.9724764684002052,0.26066052686967933,-0.20005812242306342,0.9740051644291969,0.20594555973223938,-0.20368105616016408,0.9755591852438457,0.14899798789797025,-0.20819287208433268,0.9771516831110305,0.08924696721555875,-0.21368730244880174,0.9787975758899998,0.026021926091710446,-0.2202850973096423,0.9805142338282691,-0.041480731557669265,-0.22814109926296844,0.9823223954194851,-0.11424276292950064,-0.2374541366759464,0.9842474252748437,-0.1934867382141967,-0.24848102368357938,0.9863083566349444,-0.2807614827794609,-0.261553323892206,0.9885546813861024,-0.37807878795168515,-0.27711555305084135,0.9910416623363782,-0.48810421747350863,-0.29576274529442603,0.9938410039630883,-0.6144573326871825,-0.3183104128549804,0.9970524480322023,-0.762193405843073,-0.34590562800436553,1.0254071653021226,-0.9616660226227582,-0.38955254130686423,1.0141015521604488,-1.1646826279292477,-0.4274176428039098,0.9447797661722217,-1.3340010363520456,-0.44894575558960514,0.8405628443589889,-1.4742014046873146,-0.45965465008893636,0.7318951305213185,-1.62412140958729,-0.47330656090632617,0.617060066134039,-1.786459240211129,-0.4903369226542208,0.4939535528495587,-1.9646052978471515,-0.5113347920657515,0.3630368982470634,-2.181728551901081,-0.541766335985202,0.21607371672455863,-2.4395637809620867,-0.5811907987800752,0.04388935778313998,-2.6490440001309365,-0.608572591367864,-0.12818637460447502,-2.5280332582605665,-0.5627143227878046,-0.25521380240426506,-2.235893666420768,-0.484369609403844,-0.3519783313726471,-2.0172186580904414,-0.4271056147472153,-0.4307220999347613,-1.8536661863963748,-0.38514481977928106,-0.49752424273463325,-1.725641706152944,-0.35321734458862586,-0.5548402016595457,-1.6184690160404331,-0.32759206417357467,-0.6051337594372079,-1.5269073376739826,-0.3067479234010303,-0.6501330355899737,-1.4473017469117915,-0.2896319431138402],[-0.28434110707837634,-1.446590677529917,0,-0.34773974419907117,-1.3671194725349625,0,-0.40178633244773465,-1.297467883453939,0,-0.44894701785185087,-1.2366903804331417,0,-0.4907415151330021,-1.1828284578806705,0,-0.5282919135062734,-1.13443604307568,0,-0.5624471926380235,-1.090419028419975,0,-0.593864049513273,-1.0499311072356745,0,-0.6230609962244458,-1.0123040561924026,0,-0.6504555732331858,-0.97699977737128,0,-0.6763906016795871,-0.9435764660635932,0,-0.70115315500987,-0.9116641614196381,0,-0.728051139941349,-0.8846679874583825,0,-0.7545406408933313,-0.8584625562217023,0,-0.7806568915887295,-0.8326263725578911,0,-0.8065929364475521,-0.8069684622283853,0,-0.8325365628234187,-0.7813030516849695,0,-0.8586757781351992,-0.7554441496741182,0,-0.8689184815626168,-0.7157844312896491,0,-0.8768111067542348,-0.6750251557399696,0,-0.8846037938869991,-0.6347819825998013,0,-0.8923538117415193,-0.5947591631223488,0,-0.9001171866430333,-0.5546673648772904,0,-0.907950332743078,-0.5142152526128307,0,-0.9159117064335573,-0.47310094449279605,0,-0.9240635892462219,-0.43100280480628306,0,-0.9324741176684865,-0.38756896154642817,0,-0.9434929221279007,-0.34323176244626974,0,-0.9630253314745438,-0.2989807523057757,0,-0.979676879844273,-0.24999583427374128,0,-0.9782356811840076,-0.19312569060843177,0,-0.9726340400732227,-0.13282567159233172,0,-0.9667493649439134,-0.0694788746121239,0,-0.9605136429236771,-0.002353161100160728,0,-0.9538450654743973,0.06943211379502606,0,-0.9466432890227381,0.14695711912758974,0,-0.9387828195776122,0.2315727608015974,0,-0.9219772750638788,0.32216300228310113,0,-0.8778521209471846,0.40963903925029266,0,-0.8086327745204969,0.4873172042592444,0,-0.8396395700624446,0.6411617086463608,0,-0.806099043068778,0.7727811160063263,0,-0.7064275979612584,0.8490274749365019,0,-0.6091098168927191,0.9234733351087485,0,-0.5723186069720008,1.11112228603288,0,-0.3915936271239969,1.000440167582044,0,-0.28773276666041014,1.0143015415103176,0,-0.19130300467898131,1.0158722812593068,0,-0.10451103848468218,1.0172860314168628,0,-0.025574959396283403,1.0240108214086745,0,0.047465133158549944,1.021155581352727,0,0.11476262300725276,1.0171190438502768,0,0.17784973317516084,1.0160914209509415,0,0.23741205131089393,1.0151212132192686,0,0.29413377514710315,1.0141972757913411,0,0.34647381004774824,1.007141542627501,0,0.39626645178042974,0.9997461410417423,0,0.4442035598924432,0.9926263307040726,0,0.5876834141157841,1.1805016508942203,0,0.5477104418547922,1.0000047919922395,0,0.5697696690636036,0.9535676417430032,0,0.6017098128069494,0.9291341677273559,0,0.6324387992287677,0.9056272011558271,0,0.6622345213148506,0.88283416029735,0,0.6913450722381058,0.86056525959108,0,0.7199975252819679,0.8386467932072947,0,0.7484053051369748,0.8169154961753562,0,0.7767746796328612,0.7952135783582261,0,0.805310801620001,0.7733841025523955,0,0.8342236814828627,0.7512664156526943,0,0.8496575291265738,0.7168153132499286,0,0.8465400858999876,0.667962588509778,0,0.8323378291287042,0.6128025125853562,0,0.8189479345438304,0.5607975662014075,0,0.8062136091327456,0.5113387817396258,0,0.817339782822625,0.4775461725673553,0,0.8419047633118701,0.4499792753573919,0,0.8680852575930151,0.42059944356512813,0,0.8962555209037939,0.3889866868032905,0,0.9131786639166997,0.3493773111801919,0,0.9272501157703514,0.30585398335377945,0,0.9363458816020058,0.25780568136253135,0,0.9411882316639897,0.20567920716587784,0,0.94632913626831,0.15033888113113736,0,0.95183796075341,0.09103800579152865,0,0.9578001347248888,0.026856956569147827,0,0.9643229432853548,-0.04335915911116581,0,0.9715438541176429,-0.12109014042344746,0,0.9796428103353119,-0.20827302206070764,0,0.962835760963519,-0.29941022756695623,0,0.9313201325823579,-0.39352839772435844,0,0.9103576377911842,-0.5017833928189499,0,0.886906831010216,-0.6228885856086424,0,0.8568320452155043,-0.7572681106590178,0,0.7653793482054139,-0.8477400816958096,0,0.6769447107995714,-0.9428623676906553,0,0.5931033172794247,-1.0509114875088736,0,0.5051415084100703,-1.1642707200658582,0,0.412061649540564,-1.2842257494540248,0,0.3126674685025134,-1.4123182503692586,0,0.204349262526073,-1.5417806338889322,0,0.08767113293330724,-1.6807433869805086,0,-0.03740258750146001,-1.7468901565694948,0,-0.14439266471584328,-1.6137397299641556,0,-0.2311572743476351,-1.51011140770522,0,-0.30334902696705124,-1.4238883469823032,0,-0.36368914043136114,-1.3465649689398278,0,-0.41562294743495865,-1.279636189491531,0,-0.46114652542041323,-1.220968479834219,0,-0.5016520735502081,-1.168767667807793,0,-0.538174881532872,-1.1216995420273173,0,-0.5715032785860852,-1.0787481570925443,0]],"end_head":[[-0.08465661345003922,-0.8753886850770609,1.910023095572516,-0.13896097058189605,-0.8803342703491137,1.875151855741823,-0.1911521653607754,-0.8834945567433392,1.8446702539392241,-0.23694762190024155,-0.868581954174855,1.7846659937763274,-0.2787966827622992,-0.8508641121882752,1.7269864180890409,-0.3177223605412631,-0.8330433325918394,1.676448236706106,-0.3540857305568672,-0.8150773636849582,1.6322969950130606,-0.388232613064738,-0.7970051231011395,1.594071423807426,-0.3990456442010357,-0.7391590727171939,1.4818198535899327,-0.41099812357495447,-0.6930212630547921,1.3976123296642147,-0.4300216999112849,-0.6645624860506398,1.3531605426004631,-0.4513847804572042,-0.6426765590762784,1.3261751959196193,-0.47153533598387387,-0.6209796455179468,1.3036057983152602,-0.4906192954537092,-0.5993707489517979,1.285135179908666,-0.5087630879448906,-0.5777537093899694,1.2705122677450102,-0.5260771026980748,-0.5560351421677807,1.2595436520315015,-0.5389252779673166,-0.5304480852012956,1.2434736335311793,-0.5452807118261789,-0.49972223164351304,1.2183041354015316,-0.5505113782863589,-0.4693487466144939,1.1964172519434833,-0.5546885488334476,-0.43924115138141717,1.1775901964852764,-0.5578709197152971,-0.4093172017004769,1.1616369509278073,-0.5601060441476955,-0.3794977731866509,1.1484039324244844,-0.5614314635123199,-0.34970585437998425,1.137766541633944,-0.561875585844752,-0.31986561595932184,1.1296264478061246,-0.5614583478859583,-0.2899015289891138,1.1239095012090807,-0.5601916873554584,-0.25973750803736184,1.1205641914517184,-0.5580798441989447,-0.22929605673045672,1.1195605931572796,-0.5551195028290277,-0.19849739396960708,1.1208897597610417,-0.5512997813856133,-0.16725853869832785,1.1245635431843652,-0.5466020684285029,-0.13549232978539294,1.1306148328104726,-0.540999701909409,-0.10310635520600309,1.1390982224793103,-0.5344574794307917,-0.07000176112700507,1.150091130016584,-0.5269309823372224,-0.03607190650401587,1.1636954110520321,-0.5138189051730806,-0.0011902891784708255,1.1696889510018078,-0.49825497855948075,0.034025575429691424,1.1746663950478364,-0.4813807094811269,0.06950948920847944,1.1812163976040129,-0.46316977444825636,0.10527495991550273,1.1893670754197476,-0.4401661380970374,0.14024432415506527,1.189896521745041,-0.4153585649199094,0.17465636404755713,1.1898574645364004,-0.38945112939999316,0.20864830286436287,1.1910212090015868,-0.36245548230110014,0.2421993830090039,1.1933906187121845,-0.33438095870581375,0.27528728041606554,1.1969715118281492,-0.30523486689692847,0.3078877222981147,1.2017726501180004,-0.2760637300172597,0.3412608723470676,1.2123771696816714,-0.2458245707443527,0.37468073611636576,1.2254324592369308,-0.21135901540184343,0.40237496134501605,1.2232970910877974,-0.1748526334676428,0.4251200304166134,1.2114596619712064,-0.13789244359172748,0.4442054906249284,1.1952524298064464,-0.10154246126441091,0.4617735994340917,1.1809157808790811,-0.06577534764614024,0.4778810388039978,1.1683809739551965,-0.030564369941764424,0.492577603993801,1.1575882985570818,0.004111753575618861,0.5053356399219449,1.1471907384909201,0.03789371001298786,0.5125188609127749,1.1291676221099785,0.07059145639660236,0.5183623003762126,1.1132019335305774,0.10226811924591495,0.5229251826006722,1.099198925408734,0.13301422087574188,0.526386515115659,1.0873417992466035,0.16323862916765575,0.5298738123335376,1.0797604056576198,0.19268787312778302,0.5320452994007914,1.0735476372936876,0.22137460738180015,0.5329235112222683,1.0686801418983798,0.2493095824822671,0.5325259727542297,1.065139631242296,0.27630010526130677,0.5304787455124798,1.0621388284106263,0.30223748154100116,0.526696238160846,1.0594707065330624,0.3273871876861114,0.5217228695652691,1.058197151577362,0.3517603753418439,0.5155612853811942,1.0583127189139532,0.3714816127719902,0.5029513499618536,1.0488535447134257,0.3898189267645673,0.48913539652507865,1.0403374517160966,0.40630426280004794,0.47360351356455066,1.031539701731866,0.4213066952455238,0.45690610945712606,1.0234812165284648,0.43495638173370965,0.43922404903649914,1.0164458089419064,0.44726885885520495,0.42059324691354893,1.0104187994569394,0.46035980304742363,0.40288605574613623,1.0099999346177349,0.4724911696434022,0.3843195637826935,1.0110951629931275,0.4836238415090639,0.3648390481577142,1.0136122395380074,0.4937569368950232,0.3444261205222472,1.0175633033007063,0.5028845207550727,0.32305814447950043,1.0229674544704803,0.5109954403989247,0.30070821696406913,1.029850906773687,0.518073114910008,0.27734512242220566,1.038247196337414,0.5239703857689317,0.2528729891725212,1.0479476678128723,0.5268921696404911,0.22651193301359873,1.0554609255765914,0.5287579195907641,0.19925495038915275,1.0647171571475695,0.5295413886469644,0.17105208023994933,1.075771528179116,0.5292092091767531,0.14184811228926342,1.0886906182014382,0.5277204110745544,0.11158223735350348,1.1035531905822271,0.5250258400151973,0.08018764513723842,1.1204511136239415,0.5210674647426146,0.04759106671639857,1.1394904481992612,0.5157775602762955,0.013712258677253758,1.1607927201115533,0.5090777515814868,-0.021536574204420983,1.184496398411918,0.5008778996312047,-0.0582514207260425,1.2107586042177125,0.4910748088698611,-0.09653717200312295,1.239757078146548,0.479550731859101,-0.1365083988582385,1.2716924382615868,0.466171643360735,-0.17829019802136048,1.3067907643246919,0.4507852523352409,-0.22201910494960564,1.3453065480072581,0.43321871641206666,-0.2678440675070075,1.387526052233115,0.4132760195092504,-0.3159274694974219,1.4337711255774739,0.3937651278584271,-0.3692879835139329,1.4959151001258988,0.40167206973478153,-0.46131522109184786,1.692944151997951,0.39649090840522194,-0.5598334147858046,1.884067767238193,0.35798741399285183,-0.6278478190064432,1.957623759120752,0.3098826334012854,-0.6876490884805233,2.0039685657600685,0.2592684177849901,-0.750611627728158,2.060235058064931,0.20180200845881713,-0.8026286938260694,2.089030181855331,0.11963666055280953,-0.7189757279287035,1.7853588863876624,0.07363087310554506,-0.8313237440992594,1.9805086247318648,0.014146294365348498,-0.8538324118975349,1.9615340608788436,-0.04403801878253022,-0.8684977358448052,1.9331870483575653,-0.10009978180408574,-0.8769606739032505,1.8997911459762395,-0.1537920552255474,-0.8813957440425555,1.8661788080585744,-0.20459149170806157,-0.8804849583085423,1.82942442967774,-0.24899383792742258,-0.8636245521242314,1.7677317947009872,-0.2899835631204797,-0.8458821308688877,1.7121382649438353,-0.3281573304401868,-0.8280249249796121,1.6634599886638508,-0.3638596399883338,-0.8100106651370629,1.6209816880769647],[-0.09424739566799678,-0.47948538062496127,2.0923920233271573,-0.12476851728584881,-0.4905204894932895,2.089661704952043,-0.1547512505492985,-0.49973023295451124,2.0867983592866217,-0.184084315368088,-0.5070872351344091,2.0838133697635293,-0.21265896527587946,-0.5125693836674756,2.080709131439132,-0.240370417760559,-0.5161632397265601,2.0774932569229954,-0.2652269941572478,-0.5141968260579803,2.059490231025709,-0.28770019321611473,-0.5086439946362891,2.0346540649227087,-0.3087214551206481,-0.5015880999549367,2.0111048684158916,-0.32839305151285725,-0.49325419201738985,1.9894862601569585,-0.34628462968001417,-0.48307298521628983,1.9672350351148253,-0.3609226990746657,-0.4692844743522233,1.9367547203234636,-0.3741451389822248,-0.45463046338668445,1.9087869061064637,-0.3842347955575254,-0.43715496145191945,1.8746434356898192,-0.38154363422700976,-0.40694355684540895,1.7897826456113606,-0.3762259537019057,-0.37640111336256954,1.7052649985577766,-0.3746403483852072,-0.35158533636649203,1.6483690219827203,-0.37225100248063736,-0.32749828188358077,1.5968571573989614,-0.36939883546640573,-0.3042977459610343,1.5513712377901747,-0.36626719888051085,-0.2819758680772009,1.5119349216202806,-0.3628658659918784,-0.2603885665242136,1.4779588017168095,-0.3635111846952279,-0.24228238300793992,1.4663487433252733,-0.3637003678431423,-0.22411828996268657,1.4583358470784091,-0.3628498939944267,-0.20549907100885179,1.451466953801674,-0.36097554633630313,-0.18645669742064008,1.445735415924645,-0.358091909067177,-0.167021641132171,1.4411354883969452,-0.3542123569456255,-0.14722308399463002,1.437662431650331,-0.34891013380603386,-0.1269294526253748,1.4335092347020648,-0.34175591171979836,-0.1061015076669709,1.4267479355942108,-0.3336088685730072,-0.08513095402770587,1.4207493443721795,-0.3246978265798788,-0.06410264234217933,1.4163861345367508,-0.31507885256496326,-0.04302806448490415,1.413855723317738,-0.3045699969692883,-0.0218890039108246,1.412297595121018,-0.293190410160884,-0.0007182867970836025,1.4117109445261917,-0.2809586752657247,0.02045149198632984,1.412095464164775,-0.2678929173438789,0.04158775731477893,1.4134513557553454,-0.25401092856266194,0.0626577423173329,1.4157793228738171,-0.2393303093875554,0.08362827706821618,1.4190805453627142,-0.22386862600126234,0.10446557761288,1.4233566350430706,-0.20764358432523933,0.12513503556140937,1.42860957215348,-0.19067322115281327,0.1456010086070041,1.4348416217077222,-0.17297611300536797,0.1658266124989276,1.442055228735537,-0.15413301948391123,0.18524639851902336,1.4461379207415561,-0.13393214578072565,0.20305495316648692,1.4427624691732213,-0.11340593705895397,0.22017083229448398,1.4401833799486994,-0.09259629572408179,0.23656425231441203,1.438401439017202,-0.07154473429892327,0.2522060143813607,1.4374171578324706,-0.05029253076439255,0.26706735758625966,1.4372308078762472,-0.02888088904717334,0.28111982646595113,1.437842439665097,-0.007304848805426756,0.2924831320200818,1.4301957973070074,0.014009706581947723,0.3014020843780667,1.4166276469247165,0.034832812483888864,0.30871651413884127,1.4016692980292547,0.05514201889314696,0.3150374832221985,1.388164038185785,0.07493063685505796,0.3203867645791645,1.3760845090326832,0.0939393924718801,0.3239106963721712,1.3617331933030243,0.11229492854706846,0.326422616331528,1.3485640105302288,0.12999420279287044,0.32796418171675334,1.336630456719881,0.14703118663003023,0.32855888709890824,1.3259157344464185,0.16340043856751452,0.32822857145971707,1.3164041328113214,0.17909683241883245,0.32699338366265795,1.3080812201205134,0.1941153114546541,0.32487176805013096,1.3009340035559305,0.2084506655651106,0.32188046719490515,1.2949510601745828,0.22191722390646662,0.31777663644255405,1.2890764470476128,0.23377837414657288,0.31165324064592514,1.2794854765809838,0.24486261461780634,0.30479751425803236,1.2712480174221064,0.2551772444990519,0.29722821299253166,1.2643437538134634,0.2647281227883962,0.28896174879421466,1.2587555101509231,0.27351956679871314,0.2800123113794033,1.2544692888175355,0.2815542609080621,0.27039198897388506,1.2514742968508656,0.2888331732789773,0.2601108882753991,1.2497629640303067,0.29535547865328304,0.2491772540032322,1.2493309543086895,0.30111848569311306,0.2375975887047126,1.2501771719016261,0.3061175676804959,0.22537677377646004,1.252303762774119,0.3104800795447096,0.21260994212003892,1.2562582343650774,0.3140619944828007,0.1991929630440028,1.2614937703047922,0.3168105800323193,0.18510255233239237,1.267860474783209,0.31871022814772765,0.17034349223391265,1.2753687656849912,0.3197436570076855,0.15492027199471536,1.284030676942244,0.31989189618883884,0.138837291298616,1.2938597453035108,0.3191342868272482,0.12209908470581521,1.3048708712571546,0.31744849934468444,0.10471056986990623,1.3170801501792866,0.3149287854737519,0.08670987048165024,1.3310042830365845,0.3115634244723653,0.06808639969293706,1.3467549208276992,0.3072382043435722,0.04880949567281956,1.3640169551914987,0.30192099036394815,0.028877063116479307,1.3828283273985882,0.2955772397425753,0.008288060110656692,1.4032290473423643,0.28817007711953213,-0.012957082802918962,1.4252608393800585,0.2796604124858759,-0.03485598563077752,1.4489667027841087,0.27148481269147196,-0.05771793738115938,1.4824594489260114,0.26559890975903677,-0.08259251809769541,1.5388398311066354,0.2585376246370741,-0.109244816702053,1.6014354025169872,0.25466894515433136,-0.14037191762922707,1.701144232482111,0.25429804644451437,-0.17859750870611757,1.850395257958656,0.24748113046762787,-0.21872380840499872,1.9852650449566625,0.2246543113053221,-0.24882885155686507,2.0159163200979364,0.19870672358118613,-0.2767627678935818,2.0313394745018094,0.1716107701990448,-0.3040747278394602,2.046670950404934,0.14345319153321023,-0.3306367578617797,2.0618447758667173,0.11428580892130735,-0.3561816023829567,2.075991219459663,0.08398753464275144,-0.37937150464543423,2.0825536003671665,0.053190591983012736,-0.40131402291717677,2.089028495304298,0.02200758207368614,-0.4219073804135349,2.0953588879109653,-0.009432444835076853,-0.44054291789672284,2.0990596134226074,-0.04083231762466033,-0.4563440486890671,2.0967449408335987,-0.07201049496044387,-0.47043239379405843,2.0942686970297615,-0.10284852417368795,-0.48276012796028844,2.091640923069452,-0.1332301729900216,-0.49328688654650144,2.0888722011387877,-0.1630419206835474,-0.501979843505933,2.0859735995484456,-0.19217342234376966,-0.5088137466279292,2.0829566164666673,-0.22051627350964154,-0.5137670195989612,2.0798173679776113,-0.2479680645769866,-0.5168313758553085,2.0765759307126217,-0.2716711682245596,-0.5127963093798318,2.0524011917238276]],"top_head":[[-0.5112665823683558,0.0735292433227907,1.1410156680455454,-0.45472884919714396,0.07598233480135755,1.212764993409356,-0.38880555443334597,0.07784594748092308,1.272547442399378,-0.318377400587063,0.07986465984761246,1.3316647499772247,-0.2468293907154847,0.083275062845451,1.4107653585352513,-0.17287789120212815,0.08953128267264593,1.5351994759903205,-0.08391381858693372,0.09419324231984891,1.6287335590353367,0.014807105264894916,0.09716569843636585,1.6881089842511567,0.110403579767617,0.09238013732627923,1.6067754322204295,0.19147162122603328,0.08572676668143878,1.4873648052259951,0.2636832143353931,0.08078822788973053,1.393160769696678,0.3315072705819613,0.07740963649451849,1.3219303524441322,0.3974303809992781,0.07518946545603569,1.266799223015255,0.4580640757834782,0.07305753764132478,1.209721539793624,0.5102179183662365,0.07055459849988885,1.1436382795526767,0.5520933951336173,0.06759942018998,1.0681871156621847,0.5820141617214496,0.06414553812683857,0.983819662456864,0.6116238313417557,0.06148895045305089,0.9111243016961201,0.6596886205347858,0.06116925389409905,0.871340774129794,0.7074233658105156,0.061071195837944514,0.8318229216256352,0.7515580906351129,0.060900090630127995,0.7884928638266078,0.772755730299922,0.059198324791395335,0.7238472938365748,0.7921659226718742,0.05773999725348364,0.661912176232816,0.8074431766908607,0.05632269089548969,0.6003201058494061,0.8220238826609436,0.0551660226033753,0.5414622008202277,0.8360515021738344,0.05424618422472696,0.4847640448860555,0.8496513595637327,0.05354506684528826,0.42972282691983565,0.8629354707680932,0.053049349675279966,0.3758880477588675,0.876006450419685,0.05274986276040122,0.3228458721179468,0.8889608016999069,0.05264116483074033,0.2702059093324194,0.9018918215743144,0.05272129928301572,0.21758949091864555,0.9148923113877121,0.052991707625690915,0.16461868018623826,0.9280572620015572,0.05345729318617226,0.11090532861257812,0.9414866802393336,0.054126640373343915,0.05603949879953318,0.9552887389974787,0.055012407998767054,-0.0004234945651136624,0.969583469631913,0.056131930922037776,-0.058978327700514144,0.9828317562846896,0.05741021258169618,-0.11998381434521949,0.9797671156597829,0.057960634866101035,-0.18093261049372145,0.9766252359521106,0.058734751396045365,-0.2432863793382144,0.9733798784677021,0.05974735880029311,-0.3075606468447072,0.970001589161305,0.06101852617475939,-0.37433195071037506,0.9664565476688067,0.0625746129336475,-0.44426022355731565,0.9538972810843176,0.06386004062183553,-0.5133771528677937,0.9332729678886409,0.06491883415125482,-0.5809960974747228,0.9118120684321789,0.06625123187436222,-0.6511069384445416,0.8913887358277122,0.06804306421947137,-0.7260702904369603,0.8709001666544687,0.07028699282501066,-0.8065603469808922,0.8488659603439745,0.07294977398140287,-0.8927915558477975,0.8249398969495498,0.07610072881379482,-0.9860824136432202,0.7986867173565217,0.07982963058722448,-1.0880870214588012,0.7695486069718382,0.08425404808290099,-1.2009218848979333,0.7367958183090695,0.08953022215698239,-1.3273526434048097,0.6969832253034023,0.09553124957784634,-1.4658851259016865,0.6210291298524449,0.0980175265249944,-1.5494757135202253,0.533229704643752,0.09961084677197873,-1.61517447387096,0.44210123115447664,0.10160692398935212,-1.6829343022966219,0.3468203979855987,0.10404407183293424,-1.753341910848838,0.2483585274074938,0.10780817776450538,-1.8413633693440303,0.14211696060210452,0.1122810217119398,-1.936466904580275,0.02623446342483668,0.11754412292476016,-2.0395259579832183,-0.09340420602491059,0.1138864059350087,-1.9808546858321283,-0.2018915899460787,0.10851228609875563,-1.8851568384088653,-0.300855055338067,0.10394979300604054,-1.7972636070169115,-0.39345708877204,0.10043547360453733,-1.7219140390126553,-0.4819626598387151,0.09782688498260148,-1.656946011425657,-0.5661690991370973,0.0956667858292522,-1.5947296180110588,-0.6468942063679033,0.09391223124056838,-1.5346882137228284,-0.7082434517962726,0.09041048434634336,-1.4425009238878648,-0.7415386757489117,0.08473944933518238,-1.3143840045159005,-0.7709371192253556,0.08000194098534491,-1.2009037689417545,-0.7972473242737412,0.07601902422577209,-1.0990036803353385,-0.8210799540509224,0.07265732257370322,-1.0063729018949341,-0.8429062977035344,0.06981575923751959,-0.921225543414685,-0.8630973871797827,0.06741672803750415,-0.8421530162163058,-0.881950869023429,0.06540006894737826,-0.7680225523931017,-0.8997099255074685,0.06371887279934774,-0.6979056876492233,-0.9186397080229836,0.06247680282398474,-0.6324468042324658,-0.9377374042130002,0.06155363409069589,-0.5697707444735185,-0.9562843680811275,0.060869383083445056,-0.5086711505544839,-0.9665013151337289,0.05992004797499584,-0.4450239773277125,-0.9697627403616749,0.05880481013712466,-0.38049249898169113,-0.972909722136182,0.05793464026615547,-0.3180967221402937,-0.9759694519214928,0.057292661440307646,-0.25730336561595823,-0.9789664846138497,0.05686680459443483,-0.19762887466872037,-0.9819235632165393,0.05664924065886551,-0.1386232824193192,-0.9745195916623492,0.05604124898868279,-0.0790176322087256,-0.9601603454572709,0.05523661948772676,-0.020319395495733902,-0.9461399159631201,0.05464762094826378,0.03691952606535867,-0.9323486755802817,0.054263258289350386,0.09314910505902452,-0.9186840120601181,0.05407650797458108,0.14878928461565932,-0.9050471913917235,0.054084000361742934,0.20424285600623437,-0.891340469517738,0.05428587010212832,0.25990726084661175,-0.8774642707383968,0.054685762083615,0.31618606334216426,-0.8633142581582991,0.05529099341046967,0.3735008026113744,-0.8487781102511263,0.056112884978237215,0.4323039760605394,-0.8337317857169744,0.05716729111870214,0.49309402887522125,-0.8180350008690418,0.05847537472008882,0.5564334531571888,-0.8015255494873612,0.06006470118417173,0.6229714739122723,-0.7832941555371313,0.06191402570900584,0.6928384894677255,-0.7600776322966438,0.06380376336988394,0.7636491793677567,-0.71977584944515,0.06466241299666312,0.8214730739484422,-0.6663685303532607,0.06463464799561405,0.8656917444686876,-0.6128109569506002,0.06483979674858664,0.9100268505883897,-0.5794632846724035,0.06770599176368028,0.9902597864017171,-0.5460439397239172,0.07151768534122097,1.0845027753883936,-0.4957938717757626,0.07417424412104048,1.1606626084386535,-0.437424710808773,0.07661736520780726,1.231634432348581,-0.36943029600254906,0.07837379118482282,1.2888280457335695,-0.298897883697239,0.08075661709278262,1.3530726012991452,-0.22564673332744167,0.08434068679766493,1.4342098188140229,-0.14990707109916163,0.09140718219672553,1.5716342533558536,-0.05709052006061756,0.09536342649055224,1.6517619951027602],[-0.5331089646378846,0.48434822960933643,0.9453467094565555,-0.4571746616828598,0.48258222366352466,0.996405809816677,-0.3814628090696208,0.4824860845605976,1.0471171542363984,-0.305371221182697,0.4839155312071566,1.0975004356498888,-0.22448583979257708,0.4784494844570317,1.1279454249879723,-0.14471517098879666,0.4734547234590796,1.1545477724624384,-0.06623155152108498,0.4696563862431744,1.1792331259696645,0.011230946589456142,0.4655734609110156,1.1984271768827464,0.08598453830968195,0.45451147602251174,1.1944880922938887,0.15733515593052683,0.4450070032491704,1.1893230684583713,0.22574481682218484,0.43693056532447105,1.1829892373867401,0.2854420252490628,0.4210647892046584,1.1506271803889652,0.33884560248864704,0.40497370883516215,1.1128626029065614,0.38871119024056466,0.39164707030533186,1.0783704957701676,0.4353395636105528,0.3803004131801966,1.0454274409823974,0.47925722352557587,0.370704730681628,1.0137239181474658,0.5209056770589253,0.36267785017116716,0.9829942661797784,0.5606606805610426,0.3560752784114569,0.9530058564113202,0.5935487134182238,0.3476799127245278,0.9153796130854372,0.6207022257775239,0.33850833599176666,0.8732680817489826,0.6495889007110494,0.33252401955693855,0.8370959471402033,0.6767393787265918,0.327504802381938,0.8010722956526144,0.7098405512435817,0.3268514756673344,0.7732554052531029,0.7402370540734635,0.32619048538716977,0.742748557823592,0.7456033940367539,0.3160997521047577,0.6891334220408272,0.7505751372973313,0.30765174219681035,0.6384826352246336,0.755215919388903,0.30066223797746594,0.5902305163035635,0.7664824600617752,0.29766858695488074,0.5488401361302753,0.7788172174553623,0.29626381802052304,0.5089381763731717,0.7908146561635876,0.29583300854449046,0.46911154813945766,0.8025506022902213,0.29636923718178054,0.4291130985610323,0.8140967173660334,0.29788112251431964,0.38869278768279303,0.8255222982907524,0.30039316103701763,0.3475912761982527,0.8368960129487988,0.3039466992514932,0.30553304067902354,0.848287666258206,0.3086016124974147,0.26221861917478706,0.8597700978963205,0.3144388197760568,0.21731550679617806,0.8714213298435283,0.32156383679678213,0.17044708489921934,0.8833271122205528,0.3301116694131758,0.1211787570931,0.8955840651520024,0.3402534925707994,0.06900014462961002,0.9083036919405245,0.3522057712880968,0.013301703718690772,0.9214691491462794,0.36618378454248557,-0.046649112189806746,0.9193289309340584,0.37602421042248335,-0.10983427286487951,0.9930897157072862,0.4199959527666086,-0.19141038235703778,0.9523211669967653,0.41847980437061283,-0.25851715056254776,0.902154625592722,0.4140937193424623,-0.3219741571547077,0.8732758523556243,0.4211116091569893,-0.39354033184604376,0.846906585298048,0.4317885685438121,-0.46985165716381116,0.8186838526426379,0.44445735567556177,-0.5501763070302492,0.7882666585584763,0.45937642842885906,-0.6353701320898919,0.7573059760428342,0.47817633939344795,-0.7284491777348165,0.7234925876697038,0.5004006294621282,-0.8297561196835606,0.6647563164336068,0.5102864352992276,-0.9118865953887085,0.6028245157201795,0.521967040014828,-0.9966457722055102,0.5322212471637815,0.5306559242426128,-1.0745391010647083,0.45097137592215586,0.5321944190183372,-1.1352565197112714,0.36853818193651167,0.5350730901899088,-1.1952030455111182,0.28458289437531026,0.5393249867837839,-1.2545983854468021,0.19856870428764795,0.5445182908172879,-1.31249884619904,0.10962781865570637,0.5471548575805125,-1.3601489954263792,0.01947088050522061,0.5511164403945616,-1.4066604133890772,-0.06958513130959257,0.535982915793987,-1.3987671300984403,-0.15250387561617285,0.5178102070660138,-1.376169267129745,-0.22894222172108103,0.49971369283759093,-1.3472552385936893,-0.2992129107991526,0.48250201134365,-1.3146898684148627,-0.36467445244410435,0.46760507216615266,-1.2829252916439682,-0.42602304036921845,0.454754650959569,-1.2517615923316914,-0.48384251192577077,0.44373324012391424,-1.2210217872165248,-0.5386278884694897,0.434364281696358,-1.1905459422581344,-0.5899330255773239,0.4258764069526084,-1.1584771234652513,-0.630126813146143,0.4130841854339913,-1.1110954452617636,-0.6675948752724783,0.40213442800243615,-1.0655000634075584,-0.7027241472573231,0.39283290563911644,-1.0213388753875505,-0.7294625398917636,0.38168597533030546,-0.9698242063876332,-0.7477201037229091,0.368957181486278,-0.9123258050599947,-0.7645649836238317,0.3581601464474069,-0.8580208023943228,-0.7802154189459851,0.3490672809033848,-0.8063219298993238,-0.7948519067956519,0.3414985350435309,-0.75673263395745,-0.8086256533231815,0.33531193788792035,-0.7088251922658433,-0.8221241882278947,0.3305813211697157,-0.6625940187763812,-0.8363898204842481,0.32757253603711356,-0.6182992660282922,-0.8501601203344293,0.32566953095735784,-0.5744531635453445,-0.863528304733507,0.3248414125017083,-0.5307784935485591,-0.8765800456917692,0.325074867707686,-0.4870040701885028,-0.8893957179530112,0.3263736416331078,-0.4428578131491627,-0.9020524300390669,0.3287586838635461,-0.3980598158317361,-0.9146259490393556,0.3322689747178549,-0.35231502837564865,-0.9271926233299066,0.33696309239701416,-0.30530514148793997,-0.9398314110784538,0.34292164021817095,-0.2566791818197216,-0.9579866156075107,0.352221605582796,-0.2072016129129487,-0.9453418133925182,0.3515283774807496,-0.14972199677358056,-0.9373021347402362,0.35383943232885273,-0.09271691695484136,-0.9217423646341594,0.3546351411783404,-0.034471182603536155,-0.903878827782894,0.3558640214980813,0.02419064707225528,-0.8854660139401087,0.3582501801644524,0.08344063003192276,-0.8663811345083658,0.3618315692245275,0.1436499517515064,-0.8464876926322282,0.36666625599260527,0.20521399573191268,-0.8256314306732118,0.37283475224778373,0.26856342507262654,-0.8036353430229775,0.38044337001718675,0.33417728846023587,-0.7802934004837487,0.3896288729743811,0.40259904661407675,-0.7557802704263001,0.40078636246948096,0.47471914153811534,-0.7463137474203592,0.4235504225569766,0.5639096336649252,-0.7344375511177228,0.4500231177826295,0.6631152075904527,-0.707583676791586,0.47295734025634406,0.761620700701334,-0.6657778154295066,0.4914275970061912,0.8557547478669085,-0.5881912253144244,0.48666872904602587,0.9081850185829641,-0.5117765955056162,0.48368368351133406,0.9597108901318485,-0.4359564176653725,0.4823874675233848,1.010637640053357,-0.3602150791208143,0.482757776154203,1.061313200025682,-0.28296391678053656,0.48296468713980345,1.107867985513412,-0.20198260921198052,0.47692611323776357,1.1356023939545512,-0.12260399518325127,0.4722716390472852,1.1616530120138795,-0.04442640944310311,0.4688005411467404,1.1858255380224465],[-0.49195929718071385,0.7794203243124871,0.5614332629057313,-0.4279106222846094,0.7876677393182749,0.6327180336821487,-0.3567904441016876,0.7869490706257349,0.6951500772330617,-0.284805733406709,0.7870294902553581,0.7557348455365362,-0.21199626448164266,0.7879091984362669,0.8144380738783275,-0.13532071342894153,0.772021674405488,0.8518354551586231,-0.06093489760699633,0.7534981873248752,0.8809333388926746,0.010179751265588004,0.7358848190460319,0.9056232615249806,0.07727925499486166,0.7123414879488394,0.9173278827224252,0.14032914455704226,0.6921333428734031,0.9276212646111444,0.19984486812132685,0.6745101081976275,0.9361405644075118,0.25544021344684065,0.6570843189770028,0.9399818490271712,0.30795784486143707,0.6418256514169172,0.9422248432501448,0.35777889482016834,0.6286130315170442,0.9430825415358934,0.40521457008371,0.6172833106798086,0.9426413998854506,0.45053672423290436,0.6077017412655579,0.94096912489977,0.4939844857955804,0.5997580345026172,0.938116985255566,0.5293106563233123,0.5862099465192405,0.9228602009871603,0.5612624164982196,0.573310659559318,0.9051088527302404,0.5917271198361789,0.5627407464010927,0.8877329989177651,0.6209663510526875,0.5543107690854097,0.8706091624852892,0.6492093104233838,0.5478753823083142,0.8536237731985841,0.6691149836505601,0.5372683067038264,0.8273399342648649,0.6811339758251207,0.5234001407330036,0.7935781623530325,0.693563073397824,0.5127469247029737,0.7624742284453792,0.7051301771469887,0.5040055614559984,0.7320815303814836,0.7159403103713364,0.49703318785257933,0.7022023859932829,0.7257724252863049,0.49150967550308744,0.6723676626545578,0.7305482803562189,0.48461049708666826,0.63882207400095,0.7349429965793934,0.4794313171598823,0.6058701769459836,0.7389951947029161,0.47588622580876594,0.5732943590022863,0.7427370324957909,0.47391764552610605,0.5408885601378115,0.7461952039156623,0.47349403115255395,0.5084527808785109,0.7490654802939138,0.47440203045502916,0.4755808529862806,0.7516164493901663,0.476817446377519,0.44226268110236067,0.7540612010758663,0.48090715571204656,0.40840455922503205,0.7572014290523192,0.4872493447082906,0.37415338905304596,0.7636901695924587,0.49768819492702576,0.3403074840665665,0.7643451847502494,0.506391714117771,0.3024187310117925,0.7735278984688301,0.5230487798789603,0.2659601292426299,0.7839565059220108,0.5432642173646385,0.2270453023387311,0.7958861226360847,0.5676709049314566,0.1849876391237859,0.8096509931847438,0.5971113093232057,0.138913051972139,0.8256969216947949,0.6327214459074622,0.08767942328293626,0.8430111408752099,0.6747638387846835,0.02969610711926579,0.8598769970891733,0.7230742851115801,-0.03667013662381481,0.9913425940979126,0.8813739695278175,-0.1280244355703779,0.9409960945885403,0.8908457600077679,-0.21315629626623245,0.8784394006452638,0.8927054356509241,-0.296763409379566,0.7749527211829239,0.8532822854609128,-0.3621266318813765,0.6974139246652571,0.8411533879439772,-0.43304781225245237,0.6353028742791242,0.8504194693742484,-0.5131491207456431,0.5685848673712135,0.8585158033362079,-0.5922182081999514,0.497237909843838,0.8645415369941731,-0.6689329335014447,0.4203274144135951,0.8649875924496135,-0.73946489932189,0.3382189757624513,0.8563068416086419,-0.7988917484186846,0.25695389965338555,0.8491761448848258,-0.8556791893671298,0.17640346502361937,0.8435476214061675,-0.9099679855243412,0.09644290893762186,0.8393838530496858,-0.9618820851172996,0.01695075491541808,0.8366573732354996,-1.0115297187539132,-0.060212806971489785,0.8087684333489671,-1.0253054807516149,-0.13130994272424906,0.7774780936702164,-1.0277467074450857,-0.1970006742703435,0.7498318650209672,-1.0282457482469796,-0.25796428952810535,0.7254027736946549,-1.0270037253102369,-0.3147726577611172,0.7038363585469041,-1.0241830211982297,-0.36581283890153116,0.6809321327060807,-1.014098648060699,-0.4131378697124979,0.6607143928994796,-1.0030018796958249,-0.4572714158466826,0.6430431950069795,-0.9911674122727443,-0.49859444362514527,0.6276667589249043,-0.9786177394328361,-0.5374316927895673,0.614376654976339,-0.965364259610868,-0.5686781337425639,0.5973455245638486,-0.9424860342377075,-0.596938193654792,0.5819064513925216,-0.9186044278632473,-0.623189752567761,0.5686228848258752,-0.8948714191138052,-0.6476665338997125,0.5573001888068037,-0.8711874755373019,-0.6705670830633665,0.5477796685224421,-0.8474583184549518,-0.692061018760878,0.5399329416713514,-0.8235928797162391,-0.7122939703264533,0.5336576205433103,-0.7995015010073643,-0.7300288890486013,0.5278887054037646,-0.7736502471374358,-0.7406925916653262,0.5193734066019249,-0.7415002710761831,-0.7506412852366231,0.5126630468891809,-0.7098696975217949,-0.759956573718684,0.5076518796696412,-0.678566312861574,-0.7695965898096011,0.5048458264645537,-0.6481570296255081,-0.779027262589743,0.5037850708805229,-0.6178649073894946,-0.7880386023670702,0.5042760682974543,-0.587282830708328,-0.7966802970554259,0.5063261431108903,-0.5562371490376274,-0.8049968333261273,0.5099660532675299,-0.524546061036339,-0.8228071093286209,0.5214482637967657,-0.49793286509825796,-0.8396715478817365,0.5342631208658934,-0.4689657925385413,-0.8526446878953209,0.5466702808802042,-0.43596868591987104,-0.8659812880236055,0.5615402007107395,-0.4011340683596658,-0.8797977927097222,0.5791756762374192,-0.3640831285836128,-0.8647784943905865,0.5802002654065586,-0.31367798029606453,-0.890148717310804,0.6111351479142471,-0.2754423926961269,-0.9166395546121877,0.6467164941762706,-0.23227009789246378,-0.9469993929319354,0.6896805719286512,-0.1836667845609966,-0.8560097638443813,0.6465912707224817,-0.11153877342376756,-0.8549571010031629,0.6732483777192102,-0.05256565123791129,-0.8471009144443373,0.6993055342179839,0.011628364878374355,-0.8266046402961629,0.7197668825800236,0.08009184336952901,-0.7930596942228814,0.7333715970060783,0.150722884748822,-0.75039492272658,0.7426332457339178,0.22206710546441943,-0.7050999905608881,0.7534101765554784,0.294927366299539,-0.6544889054447229,0.7628642732665405,0.3680650089058446,-0.5895123946496801,0.758794169547599,0.43385001415870406,-0.5321969664235056,0.7678707378089018,0.5060187250339776,-0.47577881392760624,0.7841279574237885,0.5832695226857023,-0.4080691348887151,0.7873856783546582,0.6503987963873046,-0.33670253878046563,0.7868910448757238,0.7123163415040259,-0.2644827675455771,0.7871953552291497,0.772377477830489,-0.1906936813961524,0.7851890779323538,0.8272696193763407,-0.11411356498289993,0.7665232631739838,0.8602058898314362,-0.0406902808550442,0.748752697230481,0.8886223470022805],[-0.5536996363001678,1.1655477801509866,0.22007142011105707,-0.3785217142148516,0.9257507627767536,0.23961180872693622,-0.31478415866756726,0.9224855470842517,0.3024961115060638,-0.2491867600759613,0.914914542702951,0.3621401458356728,-0.18383128828202522,0.9077801507293888,0.41966528874285536,-0.11888682249404398,0.9011814085648533,0.4750257222681029,-0.05448189191043373,0.8951206904194486,0.5281511375820027,0.00925969978249782,0.8893708130310034,0.5788282843702692,0.07097485104720586,0.8692467820578313,0.6165412771830647,0.12995927301722376,0.8516525602707556,0.6516698934536027,0.1862525636050809,0.8352394727576558,0.6835011555234294,0.2382439244191712,0.8142672323288713,0.7072165181334498,0.287110926168491,0.7950396863518105,0.7279439915429293,0.3330353424006398,0.7774496552621684,0.7458757155067008,0.3761838816236467,0.7614001452138046,0.7611837022588075,0.41670897237180937,0.7468036375345792,0.7740214652957143,0.454749542657078,0.7335814238541927,0.7845255055584461,0.4904317739354398,0.7216629915381727,0.7928166568584789,0.5238698156933799,0.7109854616525952,0.7990012951148451,0.5551664511829499,0.7014930800199912,0.8031724176000079,0.5844137080624119,0.6931367608179015,0.8054105992411182,0.6116934100109002,0.6858736814732365,0.8057848333222246,0.6344394971068397,0.6768523931044239,0.8010223975072046,0.6483498058500059,0.6619481391144899,0.7862721235468619,0.6568776842069299,0.6452305163436987,0.7664716653621264,0.664644477307768,0.6312025099186522,0.7471649983782997,0.671740428433079,0.6196170347075971,0.7282172044069304,0.6782402841415278,0.6102790735112822,0.709506286251055,0.6842061731927069,0.6030372948641136,0.6909193949043146,0.689689812231844,0.5977778845885346,0.6723496694217772,0.6954433669132163,0.595026871272367,0.6543607539726333,0.7008491628715392,0.5941630624667802,0.6361861410444849,0.7057761137347649,0.5950347109442449,0.6175765589912383,0.7102476062124881,0.5976539904399316,0.5984337680483063,0.7142808074144016,0.6020577227173516,0.5786512820620153,0.7163596270357786,0.6070144573077818,0.5569245104540697,0.7175419427528693,0.613480016091819,0.5340578994627245,0.7184174032498403,0.6220571308139458,0.5103744257268112,0.7189781337790055,0.6328867868473371,0.48569848789093406,0.720808696423827,0.6475890826340223,0.4608520163259393,0.7266631413290598,0.6690607506726285,0.43709118323115304,0.732568703415823,0.6942363569073078,0.4113958923287915,0.7255757796695117,0.7109736584355404,0.37663964772199465,0.7168524203536064,0.7298522224079353,0.33938830271039033,0.7062423806691132,0.7510788817693794,0.29937538596270863,0.6935599812601367,0.7748968604585791,0.2562920814346532,0.7119054897821879,0.8409536981669112,0.22007996508538663,0.8221506980033899,1.0341401876592036,0.19826571016019578,0.6428083572992587,0.8679429424366529,0.10506263961105644,0.6170110571174181,0.9026590863536992,0.04507856505185778,0.5896734562830859,0.944951355474906,-0.020172918442521517,0.5700341437289873,1.0138332564940424,-0.09383951454768225,0.5152743760241687,1.0337245546151888,-0.16894886644741913,0.4489891696409114,1.037219770370021,-0.24242598917361413,0.37525626839287307,1.0260379080687292,-0.3110693282465491,0.29726823970833394,0.9999844454684466,-0.3715269400061132,0.22545602582791113,0.9899601413347958,-0.43415003267092955,0.15793422773292698,1.003441466833758,-0.5057295323350706,0.08798919492199597,1.0174965439806187,-0.5775546636140239,0.01573809690428437,1.0321055241824757,-0.6494096278337385,-0.057159465658167125,1.0200859557899289,-0.7023591957982975,-0.1257177022660813,0.9890090677568146,-0.7371799919984703,-0.18750404994244385,0.948244039984993,-0.7581521154793562,-0.24408526380906093,0.911957232101857,-0.775907451055986,-0.29608050437946587,0.8796254738887526,-0.7908154160287846,-0.3440127308543346,0.8508102024024904,-0.8031834183532558,-0.3883262051002929,0.8251421070666214,-0.8132680844523246,-0.4276765447117443,0.7990883780996403,-0.8179871945036155,-0.4635160432316794,0.7752820959793194,-0.820254025147181,-0.4966119867661498,0.7542961982624727,-0.8210938097181959,-0.524829297228179,0.7324710163897019,-0.8168426013549506,-0.5488733160392121,0.7109011423279683,-0.8088672567782842,-0.5708641146038325,0.6920700637679129,-0.8002604051949938,-0.5910279855776754,0.6757080116172145,-0.7910446930133466,-0.6095554750775691,0.6615919372311585,-0.7812331799350476,-0.626607611786592,0.64953774426874,-0.7708304632585881,-0.6423208020277853,0.639394246523235,-0.759833470163815,-0.6568106986951423,0.6310384630541872,-0.7482319804476267,-0.6701752706665958,0.6243719666083982,-0.7360089226564801,-0.6824972407968768,0.6193180771586135,-0.723140471820864,-0.6938460177853703,0.615819748426349,-0.7095959653789761,-0.7042792153830781,0.6138380376367238,-0.6953376442009107,-0.7138438282648352,0.6133510817675925,-0.680320217005209,-0.7231506660524909,0.6148411779351837,-0.6650176822053502,-0.7336414830040452,0.6195030440530274,-0.6505646183642773,-0.7432699298354866,0.6256147047497258,-0.6349305765032738,-0.750507786291335,0.6319484921525271,-0.6167750837965662,-0.7576176093935603,0.640485215307057,-0.5979414419935831,-0.7646378521121422,0.6513680562776281,-0.578285913479271,-0.7716071291465587,0.664786001546799,-0.5576446435974907,-0.7785652450849447,0.6809821821496467,-0.5358278698017553,-0.7855543659302904,0.7002652546044481,-0.5126125127157022,-0.7926204212200298,0.7230248735849969,-0.4877325095912548,-0.803459365641753,0.7531691980039419,-0.4629659901645611,-0.8124628424673883,0.7861675048610985,-0.4344335221415849,-0.816069121031846,0.8190140521605969,-0.4000998125917379,-0.8180310468326653,0.8558823451963851,-0.3617585231964462,-0.8181163637646742,0.8973465210540126,-0.3188373050154054,-0.8160384446463977,0.944099853348602,-0.27064562476833387,-0.8114419231561016,0.996985722422906,-0.21634406418025987,-0.7386007496774512,0.9711974516136017,-0.1423239402851787,-0.6776477190690429,0.9620508849718474,-0.07269645952729126,-0.6011049465757892,0.9309118926153439,-0.004013480942074576,-0.5487050035584777,0.9383897478590457,0.06283164735563979,-0.5180625268236847,0.9931416415527687,0.13703778137196232,-0.5717123368087895,1.251908800581477,0.2610414889205379,-0.3607136238456645,0.9247611978356347,0.2573564242547468,-0.2965417404151065,0.9208042886659489,0.3195869259962838,-0.23083750440663597,0.9128613129587841,0.37847526446329116,-0.16558381182929127,0.9058767479385881,0.4354012322257075,-0.10077790515577223,0.899428577914231,0.4901421293793726,-0.036572476223445755,0.8941602678042018,0.5430188797697846]],"left_hood":[[-0.7571226630332832,1.4714566579575934,-0.17072114123911408,-1.3134015625833202,2.2146275787571987,-0.8481030672572256,-1.4994679943720968,3.276513820892305,-1.6991388017779903,-1.466881373022015,4.060006175011299,-2.17389901162566,-1.4452755275473734,4.677420697329107,-2.2537219759822253,-1.4476303350895074,4.252768662658769,-2.315603989787995,-1.5499221564279475,4.226432454514093,-2.290239972836816,-1.3535407860028323,4.750366157193886,-2.894403200272844],[-0.8024943938567857,1.5862335225928912,-0.1302269114055674,-1.442328163251993,2.467162954615078,-0.9845073840358296,-1.5294298300278308,3.128695729915192,-1.4737144756220024,-1.6572194848261015,3.7826917109744196,-1.2640725756381475,-1.7899830003500696,4.486813524835346,-1.0570474117983295,-1.848383391498782,4.793824318109519,-0.9927092674089453],[-1.2238552598343002,1.7507142185959377,-0.5920138581635599,-1.531104137340181,2.122895458184725,-0.9935437681612678,-1.7838239422452986,2.492480684339062,-0.8844895575053655,-1.9523414411290538,2.7206343762806604,-0.49006402329798515,-2.1596416391686715,3.1869259611283036,-0.11911365877478164],[-0.8828716480536833,1.3525905486547476,0.2639388661128139,-1.6762257568207444,2.267896139800783,-0.951558688895835,-1.7254509865982692,2.852709148742171,-1.2564224134622233,-1.5862505792931927,3.102588323728927,-1.6004712317934287,-1.5428897269854405,3.120921233489785,-1.4112085312585583,-1.566299363790474,3.6070676516641624,-1.5352590608017098,-1.659988127768413,3.839494063546345,-1.257333239316094],[-1.3258841029717,2.111951367794025,-0.6053341579727691,-1.0089506191736586,1.3842827872330958,-0.0016195959683962258,-0.7942503672505055,1.424007223922863,0.48656681695471615,-0.6468743257446059,2.430158353319496,1.2124549155587712,-0.6337402805801675,2.6629737886651883,1.291882945711384,-0.6411653810632361,1.651430087757249,0.7814888239018698],[-0.6709234328429368,0.9834644787640012,0.37587550472160736,-0.8110533241316018,1.3207573365488123,0.39842740464439164,-0.8096544683118907,1.6293875728312033,0.6196869690065752,-0.6506400132731196,2.2039915210295558,1.1202208214419063,-0.6366988020551325,2.620737768313389,1.2894175112468824,-0.6351478210996628,1.458357741994528,0.23736640716664725,-0.5553084200782106,1.1764418841388484,0.09336426349101667,-1.7763568394002505e-15,0.9325149410420834,0.24932834545509197]],"right_hood":[[1.4991433530081464,2.6602400092204257,-1.3586032319565344,1.7213055822320218,3.1949312723940446,-1.6061475129259595,1.6271952697081353,3.9373563493822346,-2.1217827560201856,1.5065027184490551,4.271415001287808,-2.4045574150015514,1.354647033562502,4.735828351031913,-2.907929376319437],[1.5937585571449624,3.8946262031235905,-1.9354801353893367,1.5304024676755317,4.267999016092817,-2.2728354557424675,1.47888670760823,4.613075328509612,-2.2632227660603785,1.4417138897371373,4.861865610755016,-2.2918632281980176,1.4740175948991618,3.989565413843996,-2.107657478619519,1.5418965359879744,3.4885409225261013,-1.614619470643997],[1.3475252257102905,1.7863351961804286,-0.4598871470816872,1.6851518381525716,2.3031080259603454,-1.1287036531656143,1.7075335563995644,2.8853666492394714,-1.4432336264614378,1.7494610155559664,3.4733533487138604,-1.4198071103455985,1.8965033968332854,4.691859601422372,-1.0387441262571167,1.7172379025206137,3.6887647940750288,-1.532155967966399,1.6187575233261402,3.2589193358801927,-1.685799107363244,1.4970422957163985,3.7116546618023603,-2.0025517335874223],[0.733915405053879,1.4801068343277897,-0.07110518779757286,1.0899011635897153,1.918486670088574,-0.5777465440075401,1.3902791779481518,2.3447593638444646,-0.8986641665225782,1.9257614025968675,2.8166328202256588,-0.5093521131564961],[0.8907435070321794,1.5177889028131588,0.3345311339028223,0.9558278280430201,1.397029088722082,0.06545034123037574,1.2830152205744154,1.7175740789762526,-0.48199995161049625,1.4865284448742528,2.2663483206887287,-0.8099164526814584,1.3269946860557806,2.301007577768474,-0.7511275802327102,1.2567946431290196,2.0864504950766416,-0.859446645906349,1.5683948970386186,2.2896431485988176,-1.1517387948611244,1.8361049458354888,2.543831525875607,-0.720864804990045,2.1381135742027615,3.1343719622209036,-0.14297126107243807,1.5374978868112747,2.442157758399758,-0.795746884421467],[1.3592219663490521,0.7835853831214621,-0.40769362321543046,0.8685141388220687,1.3057240408462703,0.27723251305297136,0.6447564890226225,1.780637147630339,0.8852411934224529,0.6728908989901665,2.3706687504876776,1.1674147923966594,0.8305560652459897,1.6336344479999196,0.3254702466151417]],"right_ear":[[0.8472762454925258,0.7123294073619653,0.0090107485870341,1.2556349684258277,1.084013449146676,-0.27079471305189573,1.530337210148394,1.1865578714389553,-0.4518524155229815,1.980774636960008,0.9917737607815882,-0.6412068539222449,2.1341469175218797,0.9460551940327608,-0.798569018324629,1.8590371537011103,0.716605767537621,-0.7773587086305418,1.607777320742012,0.5379419916073958,-0.6266200855947553,1.271354031484277,0.4162356161268397,-0.4165114151080298,0.9872160093660023,0.7491877840032717,-0.22623584332281937,1.7536294334444262,0.8518951598745574,-0.517047066857661,1.9848333047751168,0.7811413860238776,-0.6942895919113903],[0.8434134885686998,0.42737004840823667,0.14962324204637456,1.5256341730336307,1.1833806648520753,-0.42260664402376946,1.675775609150444,0.6110504404273525,-0.6005878464165528,1.1600962330412115,0.5413409955518862,-0.3938315644874555,1.3401234450695219,0.770613207796198,-0.41856725202988576,2.0948369938784555,0.8914600585109533,-0.8484090376585556,1.7789024851805166,1.0764107797968285,-0.4550095776582417,1.3974101868654973,0.9440319300897095,-0.6325818030061336,1.061397412980743,0.8339401301236027,-0.5477545973477032,1.079616381707194,0.9881198366471602,-0.17146779717091976,0.8924947760123336,0.5916000080225721,-0.17910237731906875,0.7580791039015011,0.4858073651784274,0.37277142862419277],[1.016525782115171,0.6202734082879333,-0.31848469447018246,1.2714430369328946,0.412885292891517,-0.4457579553332067,1.5468338225004588,0.5291075460153426,-0.5717357800764731,1.9651693918185833,0.8425060327702807,-0.6527035412892959,1.3740611296611462,0.8263231890410287,-0.3446058180025009,1.2095595023062438,0.9881890038384862,-0.19096891436679542,1.101395899479462,0.8475730987566243,-0.5577717691621578,1.444548683159082,0.4923803167477967,-0.7167108382256857,1.6568443792416667,0.8999933221503045,-0.7263231904799894,0.6791636895000281,0.8957897696818549,-0.3509754037856805,0.1200299056578511,0.9228012386717133,0.39505514999562497]],"left_ear":[[-2.0257877280373777,0.7808975485860479,-0.7838279951254847,-1.5844766511047639,1.0551178233996459,-0.3871763732420246,-1.110778482792845,0.9646082482528252,-0.21029890992290579,-0.968115062842844,0.6777593640933938,-0.2508804758002827,-1.0102746541373573,0.4358092105307982,-0.2376690262206571,-1.501010429259445,0.5973523775024248,-0.5745975793642124,-0.8803035858005661,0.8925854317833993,-0.09447157944388351,-0.9116188931460975,0.9702539985677969,-0.17163711572062823,-1.4723672327080046,1.0506368671372517,-0.6258887104747428,-1.2457083896431902,0.3862032187654252,-0.6254624924776522,-1.7246545808313047,0.4887202378119384,-0.8023292760423297,-2.1171249587454506,0.7124057677491373,-0.9537164592669121,-1.5025511749423703,0.9697893687272887,-0.7509560743913348],[-2.066161463155272,0.6429043350567647,-0.7458936772732203,-1.596812410549832,0.9620795029789081,-0.34919885937971085,-1.1342966118662408,0.9249465906856917,-0.18248469288078972,-1.1469357136046594,0.6267184601965167,-0.4427335991265702,-1.2144295082291414,0.36352989536874214,-0.35171563024883046,-1.7567755021767875,0.44358582611346214,-0.708284980199239,-2.0122658767600154,0.622213807411411,-0.7270740155220703,-1.2748389174693353,0.8434147940807223,-0.2546233746327271,-1.449797504262564,0.5268159676142351,-0.5489835497136459],[-0.0028809280426417283,0.9907310031262853,0.16442180430880882,-0.738845804072576,0.8682389764663245,-0.3564202988324281,-0.9350330126704793,0.9482751360898898,-0.25512870673911703,-1.7256955491553185,0.9591994049042833,-0.7018536420187509,-1.9312542290992227,0.6756994419663673,-0.8859283194967826,-1.4241318915768963,0.49480936017719745,-0.696420440455034,-1.1240754343347068,0.9229408910661991,-0.5304469539479495,-1.6658232074598498,0.765459988358622,-0.7971492140412337,-2.092962257287584,0.7143354164485736,-0.9452824335349925]],"mouth":[[-0.49529246793786164,-0.663240615145805,1.0914599585593359,-0.29975865068348284,-0.8295994166728314,1.7268573544569912,-0.06952857157035552,-0.8673288870454009,1.9289563194099957,0.33036544576332405,-0.8212796685489602,1.6764992644049168,0.6428948634747299,-0.1507204416386554,0.8924909397089964],[-0.7203462023057505,-0.36245286702705126,0.7485942776888801,-0.4293765144771653,-0.6549411995357158,1.382135085314264,-0.3412191402053333,-0.7657963361086358,1.9625417407696335,-0.05092248122376519,-0.7941036699617632,2.1243887646002877,0.10569020021067355,-0.7684166644763694,2.1086758121192672,0.4815313813375157,-0.5705985875812327,1.4009096026956716,0.7482547097983048,-0.09454919983438659,0.7491737448691094]],"left_eye":[[-0.810200103278671,0.48227011508812856,0.02793070734171721,-0.7438666356789279,0.6751614131743373,0.376043399256913,-0.5297101922168377,0.5758918891389013,0.9252855518936096,-0.4239770554081712,0.04329817319817808,1.2637871593250396],[-0.7506716414422083,0.5713298330604033,0.36825165481544797,-0.5685574214824722,0.5721438069017228,0.9005925006392346,-0.5295382466333534,0.16647096414880247,1.0777350482254482],[-0.8299985864097561,0.2764851345110144,0.3585180136628132,-0.7344863552649397,0.4070323796577471,0.7241628648405731,-0.6587713218334015,0.569045884592829,0.8391289499861907,-0.4862387370160741,0.10466698175220968,1.1599232850641483]],"right_eye":[[0.5092058986614227,0.011306064734979193,1.170283659016194,0.6860012804031692,0.6535638700773978,0.6292891371474649,0.8296703231723226,0.6176687179029979,0.02920603688959167],[0.48252826215937805,0.1725138328868545,1.133609769379993,0.4587857177107777,0.39818046939267115,1.014262132479546,0.6733716974336836,0.6156601879069222,0.7252366130943013,0.8606973854169397,0.4201898408247523,0.07390163231135505],[0.7463224366230425,0.49207609163469734,0.47412567091617275,0.6875397737049012,0.4338844319775509,0.82787339834552,0.5926970561124785,0.13641854114573193,0.9367593593551224,0.8058161301830173,0.25190137988946837,0.46643134591216784],[0.7156609196332044,0.6559520353651661,0.477550754430053,0.5557752806723815,0.4284261687605688,0.9368257613611859,0.5493069293208266,0.1421373538599341,1.0589426807730389,0.6957441031032643,0.3633082020998507,0.783396651844896]],"bottom_neck":[[0.9824702741221545,-0.7113344195977307,-0.15116334919623586,1.0359797212117892,-1.3839494669921604,-0.688965832588619,1.1302647544744362,-1.998193573166927,-1.5754097887884706,1.1438574503276273,-2.845220086739923,-1.4183646408211095,1.5127237794131219,-3.385109998925741,-2.0323873530609378,1.2409052539780259,-3.936525591352445,-3.1723382784473086],[0.5476461986723091,-1.0787360467656129,0.017327023738797465,0.7304173535818466,-1.6716601503908004,-0.503796332689717,0.6865285073805918,-2.3729100033356665,-0.9291873105052053,0.6736310332605084,-3.037022640128482,-1.297348759641265,1.0599263708418318,-3.352410491055364,-1.5934517343629828],[0.4822317341395279,-1.7724662500825632,-0.3740672774946594,0.44528418353427845,-2.2207911949420183,-0.6343019654171682,0.3771436835311577,-2.9319809215408332,-1.0269090280336224,0.05372176894022718,-3.602253744201057,-1.1818654460977607],[0.08051818507582098,-1.3285710270330906,0.20067044587318783,0.24268667956394374,-1.7970967203184092,-0.20045730966487252,0.3157301043798304,-2.4841780080916545,-0.6916152919772909,-0.04939866155829975,-3.1804974562257335,-0.9771918628489669,-0.07342195397847817,-3.7936261864789653,-1.3230738878349069],[0.08119379394258308,-1.9360998841223687,-0.15481131000769377,-0.02304270335412406,-2.6172269972489,-0.5321763513825424,-0.6319809347628973,-3.0348313365401527,-1.2129039916195987,-0.15028303957677824,-3.8919587092534664,-1.441980925901837],[-0.126364043134906,-0.8597904222531287,0.6474179477252431,-0.11645229190737805,-0.9929743246839502,0.3297285330255537,-0.3212194371928603,-1.6389633880291408,-0.1564775999545196,-0.09901451482077261,-2.259237133101297,-0.37077744652415134,-0.3349025129244887,-2.5336770339463404,-0.7358791571062042],[-0.352109751908424,-0.9962674845872961,0.20574425608427216,-0.4941045287836303,-1.341568905135052,-0.09630922179410817,-0.5238477857456423,-1.9197558514531368,-0.5025039016779838,-0.4773970931945475,-2.5907327433800322,-0.8849986885000742,-0.7386261932617368,-3.593327681560492,-0.003923350520652846],[-0.4772040949161558,-0.6344759099208712,1.2435788274156208,-0.727853762326633,-0.5780918849186811,0.45477275870422407,-0.5724804350290693,-1.0718864674114315,0.0031560709099700546,-0.7141402768044376,-1.8829376667135085,-0.6285628549601769,-1.2694504466843515,-2.5440801937359767,-1.4322655700864164,-1.3020376688889437,-3.3879761899913823,-1.4177290195415573]],"back":[[0.7980754883610413,0.36613695995776707,0.36838527454014125,1.2149643781450647,-1.3958500535131773,-1.5316476904260832,1.3168942392354488,-1.4171628011316262,-2.818732887699997,1.3318256188359063,-1.65913858338277,-3.996555386905415],[0.914280617218381,-0.3847504799415411,-1.4046767628669548,1.0315439424105648,-0.7910881722993315,-1.6877059207095035,0.9410461327352988,-1.1098921232786303,-2.4379546831137215,0.3779004247767297,-0.7484569893552528,-4.081847797715099,-0.5688362195798922,-0.9193088649461307,-4.72510137921822,-0.283436626737092,-1.1259759080474012,-5.5493111673843725],[0.2368995888561236,-0.7278197909720401,-3.4657151581435794,-0.09886238555496751,-0.6611233890601413,-3.9802940746995246,-0.7666185112113829,-0.8786649212148925,-4.46472753149219,-0.06068944969380796,-0.8658242523852593,-5.1940161620350045],[-0.325027410718276,0.33579415158822856,-1.4790569213975635,0.4082976367677913,0.030698135228056866,-1.8217249767434094,0.45303842207649403,-0.668769714783588,-2.734210232270855,-0.6571723589036504,-0.8544748492301473,-3.3503882480285645,-1.113625522412003,-1.2116283435954847,-4.00607994525462,-0.8392884926191203,-1.2450935388167466,-5.138206906787516],[-0.2558801166026168,0.1529238695591033,-1.7620684621126586,-0.5029941256612203,-0.10521874021110378,-1.9685355691548194,-0.4883717904632956,-0.5891789420671851,-2.593459530504282,-1.2261359450479334,-1.2546442867569851,-2.9918599861469617,-1.3429812770048448,-1.627428520888441,-3.7819948865594664],[-1.3642079895274941,-1.7562760703514853,-4.319492683224765,-1.3535427261417432,-1.9088031391285918,-4.075787286022694,-1.2839817860690443,-1.4249028160178028,-3.299207101603707,-0.5404138054919585,-0.7891191814225887,-2.838689617485254,-0.7607715511475472,-0.0717424564556052,-1.4553844188539715,-0.7969256891793304,0.3770455178081983,-0.7011487623166519],[-1.027234708578061,-0.48631422328612445,-1.1437923040347662,-1.0178013314953187,-0.7432014644151236,-1.6929881784261203,-1.310696460919801,-1.5372896901566118,-2.1950664910107,-1.4629399099684512,-2.4837780533491993,-3.0754984901735627,-1.4188005329005735,-2.9058249752525804,-4.464129069813099],[-0.8133116401259493,-0.3586841890970353,-1.779169524761822,-0.7887342155645332,-0.5689720460392013,-2.135569064799756,-0.8722256951772014,-0.9496400343347923,-2.427624247151209,-1.3190849967798925,-1.435843104860964,-2.6531410565707807,-1.4399099641965583,-2.226415410454946,-3.2882346734475956,-1.391650570564285,-2.1734415611646623,-4.348618575897504]],"back2":[[1.0640431142288573,-1.8823142532192643,-7.600560797991086,1.0640431142288573,-1.8823142532192643,-7.600560797991086,0.4918055287523222,-1.176261729143179,-5.389795255902148,0.4391183237621368,-0.7940310190638664,-3.3168692961987833,0.7925200587029604,-0.437877690489632,-1.9372371850360324,0.5689727009953103,0.4486775572523265,-1.149169630047102],[-1.3416311039561917,-3.9495073637898406,-6.538771815542881,-1.3561128617416145,-2.5698052255051453,-6.542076328560332,-1.4022708395987502,-1.9372880535172983,-4.929085741817818,-1.3487343995810033,-1.5536867609969907,-3.2808193509205603,-0.5107075458344159,-0.8281696820582598,-3.074647112728382,-0.7040592295869734,-0.08629144328159122,-1.7067817576193196,-0.16211526874996363,0.5948502563446951,-1.2636241686590068],[0.9110373484418686,-1.8265064740343124,-8.08215605872866,0.5372717167607961,-1.539228319503879,-7.373277013590235,-0.011906109287207478,-1.177362113182574,-6.216978327474965,0.4342567981242196,-0.7621443979103839,-4.160965718217196,0.5797734589880381,-0.3078390427738533,-2.135471199978932],[-0.4162227826128775,-1.60384139221759,-8.03395336147118,0.015538368268560587,-1.4069855781405431,-7.453119015814719,-0.3313593920631708,-1.3319812510882345,-6.454378165204842,-0.020230237491096315,-0.7581227883482953,-4.9754823293594255,0.16097344878790643,-0.5419276111768285,-3.0454150387710923,0.10193769509473882,0.22869587942511505,-1.785596574974024],[-1.2160560552439734,-2.1934956083810904,-7.595052779378515,-0.9665934960394913,-1.6909556404717927,-7.366518500956104,-0.6763841765087362,-1.4227829240793017,-6.23894096191166,-1.0781897514213812,-1.547685866350983,-5.172689907410918,-0.520699251178177,-0.7854804160345559,-4.498610627357419,-0.24680001789384187,0.17703617442338038,-1.73878371654002]],"bottom_neck2":[[1.4208504146178038,-2.971389658512994,-3.5159092031635995,1.664293165274926,-2.478316733386862,-2.561333687147652,0.9671950487673717,-1.9222668785340127,-0.8585260006509778,0.9079437834685535,-0.9303422755468365,-0.15870793684140394,0.6867803302220228,-0.6602503249538261,0.3976986942285008],[-0.2922453861602614,-3.2727106235323404,-1.168418213337179,-0.8508545425745773,-2.702636959728674,-1.2146146371504898,-0.9030048110436679,-2.1102343702245303,-0.9283017200839998,-0.9874117277693788,-1.6028248180045508,-0.6591887896711812,-1.1122872571959057,-1.0904854375164978,-0.9343831198690058,-0.9958007288012771,-0.44933519729425875,-0.1765697425375512],[0.11266313356447377,-4.30190310005125,-2.1253141190629465,-0.010804597783803604,-4.136783049896818,-1.7236385171415316,0.2301128013984134,-3.242509320537918,-1.1584973596154367,-0.017059488686973157,-2.7047052402305694,-0.5826439025065193,-0.3535287418735653,-1.9630161476283972,-0.3945013604994312,-0.19157516879585812,-0.8394980353990151,0.7006303565016703],[0.43969060073689853,-3.9649005110780013,-2.210444135321999,0.5265099863994278,-3.7960682324122246,-1.4291139343268817,1.0390635600445848,-2.7226542409723944,-1.3197749981368112,0.6358984608090374,-2.0439089509517565,-0.6767480574770888,0.5233374253174001,-0.976081035282033,0.09280513693085535,0.3173451705525015,-0.845287470542269,0.46110066781867953]],"bg1":[[9.62158524553324,11.101830064170912,-13.52007494637326,4.671097700166932,10.21669400347367,-16.434729140375016,-2.052348155548713,6.802727605186821,-18.57992319712308,-5.112995548200358,3.3386229449860045,-18.93552245926895,-8.239220220471708,-0.6128346134503776,-18.13063363007084,-10.034879504857642,-6.738599486413275,-15.856343830615103],[14.039977673551677,8.223168873523042,-11.455843442811936,9.976153311336581,4.655538603926329,-16.589501203040474,-0.02379290530174409,-4.401687851418973,-19.488148482332335,-5.790284755897507,-11.80249779579237,-15.0044930526661,-6.762121019663663,-14.69494639882365,-11.655688835359655],[-8.76993867503434,-13.701944944915299,-11.523119007237547,-8.679397782516608,-10.387472362565154,-14.615472948228458,-2.2334908253097674,0.3122084212219053,-19.764682404724,10.228074417677963,7.604440738362931,-15.403488652100478,15.17237299804261,7.073720454011211,-10.82407835294212],[-12.209190406672079,-0.6011316665599903,-15.690443437973041,-9.82970399026196,5.88083851954396,-16.312340306134647,-0.6414575923717571,12.353232738326401,-15.645211473473946,7.885679386305108,13.831091194201834,-12.061519330472645],[7.864468420494424,14.092706342711855,-11.805290573284239,3.015913344954161,13.12222009577405,-14.7538035677212,-0.14871914484150947,11.493866304753412,-16.3310918566173,-3.2473855350226675,9.300336226874617,-17.378934685964396,-5.348474512019817,7.273030806516072,-17.735248297080282,-9.226759308025652,2.588803189278712,-17.422886443629125,-11.652085696771417,-3.6347863968210876,-15.741914139656089,-12.023149178207744,-7.492687799868723,-13.995326525704932,-11.081390949002937,-10.900027039405865,-12.477763390134232],[-11.470156551188984,-5.948240977795547,-15.160596107693863,-10.54773516245144,-3.786915377160589,-16.516263503562122,0.022519178060028365,8.850037722713488,-17.909532606999385,11.906240070247378,11.462105824635135,-11.171025033802081,13.527357733733284,9.343993137640943,-11.248877881229323],[-1.6772847217942413,15.169290574272159,-12.843646311840452,-4.61364267061009,13.055628230934344,-14.3319055219708,-8.666200070434616,8.748933027286673,-15.63390182760017,-12.226103041743485,2.609605406774802,-15.466608658155526,-13.890660669134665,-3.0803559725871184,-14.010642149964227,-13.457517501306759,-7.577842921649767,-12.630674286210699,-12.905958488433974,-9.683847550878546,-11.703151630658834,-9.902348271310801,-14.384632327532955,-9.699272082223615]],"bg2":[[-15.52638923826029,-9.757692081949529,-7.772097275794888,-14.922967800760299,-9.405597673598495,-9.340587397494634,-9.962285633949493,-9.911066490851175,-14.159317597012393,-1.2394936911329801,-8.0999478263491,-18.144436683193234,3.8549233130458185,-5.208560945470293,-18.889867691618377,13.673514349130897,-2.9501956520479413,-14.213706370198786,17.554933901415648,-1.9217579935671307,-9.180525410412304,18.45054143523123,-3.4240138101966346,-6.668336112285068],[18.80971347918372,-0.4852867663274594,-6.477073780818731,15.035422754263895,0.46908547846144855,-13.017511312193715,-2.2475526249002082,-2.786965489522537,-19.559712119747566,-12.859876274292702,-2.9596051758517463,-14.8796445022316,-16.75862162096534,-8.545528897268932,-6.654942063086171],[-18.864590756657023,-1.3214790576662623,-6.155333697412285,-16.981984472843138,-0.7893353341194737,-10.369886386795983,-13.498134985293675,0.28608766346693654,-14.65255913376965,-0.27123268122330685,2.6821900734774866,-19.769904194828307,0.26693084359077657,5.546230217124204,-19.17750889824636,5.934671346228839,7.12728532688666,-17.61165987303214,12.145802971532998,8.668477697248498,-13.202592964480196,15.872049836754465,4.438597033762752,-11.220451585293539,17.490240403895783,5.843654736376681,-7.6540956188446145],[18.149866412272754,1.3482759041429606,-8.126963709752957,16.06945766106647,2.2351370517306486,-11.578666574896069,9.316757897624457,3.0117618700254396,-17.30398459832047,-1.9494020835014294,-2.789144754301035,-19.58875415922096,-8.304764303386365,-6.011866921073532,-17.07453373587306,-9.565635123849743,-10.928549755547573,-13.699703162382452,-12.741578942782068,-12.177217016563823,-9.321172225029034,-15.099286137248935,-11.659900289183351,-5.840362141450349],[14.741078424182339,11.935085361340912,-6.238704289020898,12.269658148009302,11.634630609750763,-10.527476551931592,5.136096183949192,11.98422543821682,-15.062774368424996,-4.3226736703615645,10.901838287776926,-16.11335156401647,-11.197869690336551,7.282531250918071,-14.769422977793639,-16.30237674843551,1.333193045763341,-11.407129752855475,-18.37937032833596,-2.4008180606112886,-7.423294871591075,-18.778042807327203,-3.6290571414511485,-5.484438162372193],[-15.22584537882306,-12.894616550013785,-0.4769462387011245,-16.903125479371976,-6.167641572151249,-8.50777794950207,-14.745546977630891,-3.8029284092573032,-12.827036165568238,-8.819387489296865,1.1131266700378073,-17.792793931770383,-9.361378701571129,6.1768632996849835,-16.443143045964263,-3.7846688865430274,11.081729255484833,-16.164422004446315,2.3191273870888764,14.042190086512132,-14.004306888850621,6.313459325232698,13.155137470521074,-13.593218686870806,11.729991325437382,12.874381806989057,-9.694495800479444,13.07591522740579,14.302347101185141,-4.772046344530022]],"bg3":[[16.251709921948088,-11.466902311520176,-1.1577392175312466,17.07845340842453,-8.918329805647037,4.996111806742224,13.114939963445646,-8.66889415519626,12.252299697556314,7.2546681464690845,-11.992571249682562,14.149924400160227,-0.5156246687249277,-9.892257934333488,17.30933629806538,-4.683027607072322,-4.838088929608608,18.73517230008957,-17.5456932011931,2.2394774610080694,9.106398433748687,-19.72835273224599,1.4802910334606167,2.0197172397014107,-17.343084236315793,8.498645708349898,-4.804246776612716,-8.091915983211694,9.54239881613193,-15.50105701339654,-0.8109474977690034,11.496140444327947,-16.264181544618143,9.256689389885695,12.985026605018636,-11.960184798389008,11.076225508077037,14.517262248441211,-8.039340570831854,15.597639376144908,12.311003016140997,-1.4424592620628225,18.314263400865116,7.787798729076137,1.0141844416474761,19.575001477329316,2.054941716109287,3.194796085131749,13.491592413396688,-5.755178219445555,13.583600724347342,8.852355902663135,-5.607990642464833,16.92096613724844],[17.496426082296697,6.929557844017763,-6.557092664889623,15.16667550566926,9.795696011830179,-8.396985197975614,6.806509359956426,12.553017558557293,-13.92043330649945,2.9150617533742205,10.581787988581542,-16.659724147939148,-1.7521428297435784,6.40511355557353,-18.75175952313247,-9.70342129563528,3.5500409505871033,-17.0072076717517,-13.972986466916865,4.9439099541097224,-13.335907162012997,-19.80753748878837,2.4456454114630084,0.24539046605707693,-18.831680462876694,4.08975521196225,5.007513524083905,-17.71092744553751,4.801772376982849,7.80078149209599,-8.12905633311546,2.6164875306598145,18.004987647141995,-2.898507332835324,-2.9860029485639266,19.466073987456387,-0.5043838960452067,-7.858689122793538,18.330945814868866,14.879748494164751,-3.6147762747559895,12.707293754963608,18.22021476312531,-1.6055976716458948,7.968663524994831,17.943450682039053,2.9355569178847998,8.14426462753593,18.576945026738166,5.3104496641761445,4.798994926626245,17.793487423999785,8.91995525745553,-0.8649960544804571,13.426981325529887,7.163704130330856,-12.900337413996311],[-4.642126783379088,-13.178212718372325,-14.207720492783746,-2.0189089819941124,-11.762402043657586,-15.947734436802655,4.55779465912593,-9.99752870630303,-16.6057123655567,15.203549813711891,-8.12478389838223,-10.094541724410782,18.911103262281564,-3.2757397547036566,-5.225471180368716,19.931653718939238,-1.0866379068896082,0.1519215516270016,15.631932190802555,8.740836295029036,8.677969460762458,11.05583708679935,13.110523017910179,10.180208756003898,4.338755904311174,10.570600046604733,16.314944279568316,2.4822174023967314,7.2122555480179535,18.391053592310193,-4.306138747405168,6.175425688319017,18.459861575538312,-11.559439748170767,-5.292483289400377,15.318487104454587,-16.1121738904861,-5.320130839708376,10.517724312357256,-19.173806166877657,-4.378768219987018,3.2736567657649775,-19.788444137719416,-0.23969305121765938,-2.028404291666996,-13.140943260502478,0.23607502808904152,-14.94886197797679],[3.696307586005485,14.123132778744786,13.603979092911272,7.558291991146223,12.496791592350466,13.565652596834733,13.174909425050604,7.479596877382525,13.030178525770692,16.684031657318673,6.655053615393378,8.549493178283816,19.788097067555242,2.105704626674475,0.9547504019777486,17.984903659933586,-1.1736912491410063,-8.45369344292159,15.390315853757858,-0.0028640212774289076,-12.621003000066468,-2.222042698968214,-3.2305774131496783,-19.49642130867888,-6.248615472782269,-5.41490533860131,-18.109997135276927,-7.421123933723075,-8.059704403181915,-16.667254965128166,-9.315147294142857,-9.838801816570353,-14.646752957416929,-10.490728821594914,-17.00070554949987,-0.011956026884285542,-11.83941873123755,-15.323419131020657,4.9544941455598615,-12.819274093738333,-13.095990284150862,7.874581218991532,-14.890737358756983,-8.316092581045131,10.350244639567329,2.138579246685314,-3.276499449050048,19.49782983408767,7.105232090473411,-3.3949467927329993,18.322494659673826],[12.26860634240747,-14.643170649846581,-5.736033750876423,7.323169214791076,-13.074000831096907,-13.136499751698938,1.0549764386871328,-12.219351978863417,-15.703776262886525,-13.607698137334904,-8.351113182727921,-11.887649571759702,-15.953868031663678,-10.340108088883873,-6.002689060538273,-17.63476593079466,-8.754267932718294,-3.272160784121917,-16.74139000697493,-7.841398493835914,7.500404411727792,-14.165716216490331,-8.036841552155884,11.440875676546455,5.341930052250596,-13.698443963029245,13.505083717149539,7.953367377349235,-15.484858026714893,9.764592155255617,13.838964446892405,-9.900446223651256,-10.36262264726147],[12.764086993503732,12.703809021798888,-8.676967959963175,11.654230024934334,8.098047747227207,-13.95335230932628,4.327096421362857,4.28031736096918,-18.988441893351933,-8.749349940284192,0.2923947526994129,-17.87572774893242,-11.065643092449095,-2.5798514969509525,-16.42465520833589,-14.360388708449653,-7.030424020965468,-11.83778648713395,-14.453731179465553,-11.377864221391315,-7.648750336979855,-13.249248943539392,-14.765946590138906,2.0775134003726303,-12.836632078947918,-13.36587290373705,7.325706370576696,-10.0217532708732,-13.447182352357022,10.79304922165376,-4.991387270998463,-15.62842140321587,11.393454995914968,3.736246126828738,-18.26550812441853,7.145549002128034,11.07835226235177,-16.567175288751397,1.1873399251831813,18.4863201290218,-6.625721899853341,3.6457533484334155,19.920539100470535,-0.1727729195873957,0.7206015020125278,18.334495299064802,3.9105910121814533,-6.80036918491373,14.94257617080931,3.282786309511133,-12.707991290767815,9.004799583663111,8.228358517998405,-15.730750717917193]]}};

},{}],21:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var three = require("fz/core/three");

var DepthManager = (function () {
  function DepthManager() {
    _classCallCheck(this, DepthManager);

    this._objs = [];
    this._count = 0;

    this._camElt0 = 9999;

    this._posCam = new THREE.Vector3();
  }

  _createClass(DepthManager, [{
    key: "register",
    value: function register(obj) {
      this._objs.push(obj);
      this._count++;
    }
  }, {
    key: "unregister",
    value: function unregister(obj) {
      var idx = this._objs.indexOf(obj);
      if (idx < 0) {
        return;
      }
      this._objs.splice(idx, 1);
      this._count--;
    }
  }, {
    key: "update",
    value: function update() {
      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      // return
      if (this._camElt0 == three.camera.matrixWorld.elements[0] && !force) {
        return;
      }
      // if( !force ) {
      //   return
      // }
      this._camElt0 = three.camera.matrixWorld.elements[0];

      this._posCam.setFromMatrixPosition(three.camera.matrixWorld);

      var dist = 0;
      var pos = null;
      var obj = null;
      var bb = null;
      var objs = [];

      var i = this._count;
      while (--i > -1) {
        obj = this._objs[i];
        obj.__dist = this._posCam.distanceTo(obj.posAverage);
        objs.push(obj);
      }

      objs.sort(this._compareDist);
      this._updateDepths(objs);
    }
  }, {
    key: "_updateDepths",
    value: function _updateDepths(objs) {
      var i = objs.length;
      while (--i > -1) {
        objs[i].setRenderOrder(i);
      }
    }
  }, {
    key: "_compareDist",
    value: function _compareDist(a, b) {
      if (a.__dist > b.__dist) {
        return -1;
      } else {
        return 1;
      }
      return -1;
    }
  }]);

  return DepthManager;
})();

module.exports = new DepthManager();

},{"fz/core/three":4}]},{},[10]);
