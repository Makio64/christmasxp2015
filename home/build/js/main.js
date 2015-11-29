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
      resolution: stage.resolution,
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

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var timeout = require("fz/utils/timeout");
var Emitter = require("fz/events/Emitter");

var Stage = (function (_Emitter) {
  _inherits(Stage, _Emitter);

  function Stage() {
    _classCallCheck(this, Stage);

    _get(Object.getPrototypeOf(Stage.prototype), "constructor", this).call(this);

    this.width = 0;
    this.height = 0;

    this.resolution = window.devicePixelRatio;

    this._binds = {};
    this._binds.onResize = this._onResize.bind(this);
    this._binds.update = this._update.bind(this);
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

},{"fz/events/Emitter":4,"fz/utils/timeout":8}],4:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

// module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

'use strict';

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

},{}],6:[function(require,module,exports){
"use strict";

module.exports.clamp = function (value, min, max) {
  return Math.max(min, Math.min(value, max));
};

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
"use strict";

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

},{"fz/utils/now":7}],9:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var Emitter = require("fz/events/Emitter");

var Loader = (function (_Emitter) {
  _inherits(Loader, _Emitter);

  function Loader() {
    _classCallCheck(this, Loader);

    _get(Object.getPrototypeOf(Loader.prototype), "constructor", this).call(this);

    this._countComplete = 0;

    // this._pxLoader = new PxLoader()
    // this._pxLoader.addFont( config.fonts.medium )
    // this._pxLoader.addFont( config.fonts.bold )

    this._pixiLoader = new PIXI.loaders.Loader();
    this._pixiLoader.add("img/default.jpg");
    this._pixiLoader.add("img/sprites/sprites.json");

    this._fontsLoader = new PIXI.loaders.Loader();
    this._fontsLoader.add("img/sprites/advent_bold.fnt");

    this._binds = {};
    this._binds.onProgress = this._onProgress.bind(this);
    this._binds.onComplete = this._onComplete.bind(this);
    this._binds.onPixiComplete = this._onPixiComplete.bind(this);
    this._binds.onFontsComplete = this._onFontsComplete.bind(this);
  }

  _createClass(Loader, [{
    key: "_onProgress",
    value: function _onProgress(e) {
      console.log(e.completedCount, e.totalCount, e.completedCount / e.totalCount);
      // this.emit( "progress", e.completedCount / e.totalCount )
    }
  }, {
    key: "_onComplete",
    value: function _onComplete() {
      this._countComplete++;
      this._checkComplete();
    }
  }, {
    key: "_onPixiComplete",
    value: function _onPixiComplete() {
      this._countComplete++;
      this._checkComplete();
    }
  }, {
    key: "_onFontsComplete",
    value: function _onFontsComplete() {
      this.emit("ready");

      this._pixiLoader.once("complete", this._binds.onPixiComplete);
      this._pixiLoader.load();
    }
  }, {
    key: "_checkComplete",
    value: function _checkComplete() {
      console.log(this._countComplete);
      // if( this._countComplete == 2 ) {
      this.emit("complete");
      // }
    }
  }, {
    key: "load",
    value: function load() {
      // this._pxLoader.addProgressListener( this._binds.onProgress )
      // this._pxLoader.addCompletionListener( this._binds.onComplete )
      // this._pxLoader.start()

      this._fontsLoader.once("complete", this._binds.onFontsComplete);
      this._fontsLoader.load();
    }
  }]);

  return Loader;
})(Emitter);

module.exports = new Loader();

},{"fz/events/Emitter":4,"xmas/core/config":13}],10:[function(require,module,exports){
"use strict";

var loop = require("fz/core/loop");
var stage = require("fz/core/stage");
var pixi = require("fz/core/pixi");

var Xmas = require("xmas/Xmas");
var Ui = require("xmas/ui/Ui");

stage.init();
pixi.init();

var ui = null;

var loader = require("loader");
loader.on("ready", function () {
  ui = new Ui();
  ui.showLoading();
});
loader.on("complete", function () {
  var xmas = new Xmas();
  ui.hideLoading(xmas);

  // xmas.show( 1 )
});
loader.load();

loop.start();

document.getElementById("main").appendChild(pixi.dom);

},{"fz/core/loop":1,"fz/core/pixi":2,"fz/core/stage":3,"loader":9,"xmas/Xmas":11,"xmas/ui/Ui":25}],11:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Home = require("xmas/home/Home");
var About = require("xmas/about/About");
var Ui = require("xmas/ui/Ui");

var Xmas = (function () {
  function Xmas() {
    _classCallCheck(this, Xmas);

    this._home = new Home();
    this._about = new About();

    this._current = null;

    this._binds = {};
    this._binds.onChange = this._onChange.bind(this);
    this._binds.onHome = this._onHome.bind(this);
    this._binds.onAbout = this._onAbout.bind(this);
  }

  _createClass(Xmas, [{
    key: "show",
    value: function show() {
      page("/", this._binds.onChange, this._binds.onHome);
      page("/about", this._binds.onChange, this._binds.onAbout);

      // TweenLite.set( this, {
      //   delay: delay,
      //   onComplete: () => {
      page();
      // this._onHome() // tmp
      // }
      // })
    }
  }, {
    key: "_onChange",
    value: function _onChange(ctx, next) {
      if (this._current) {
        this._current.unbindEvents();
        this._current.hide(next);
      } else {
        next();
      }
    }
  }, {
    key: "_onHome",
    value: function _onHome() {
      this._current = this._home;
      this._displayCurrent();
    }
  }, {
    key: "_onAbout",
    value: function _onAbout() {
      this._current = this._about;
      this._displayCurrent();
    }
  }, {
    key: "_displayCurrent",
    value: function _displayCurrent() {
      this._current.bindEvents();
      this._current.show();
    }
  }]);

  return Xmas;
})();

module.exports = Xmas;

},{"xmas/about/About":12,"xmas/home/Home":14,"xmas/ui/Ui":25}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
"use strict";

var config = {};

config.fonts = {
  medium: "Roboto-Medium",
  bold: "Advent Pro"
};

config.colors = {
  red: 0xff5864,
  blue: 0x3e67ff
};

config.sizes = {
  entry: {
    w: 139,
    h: 160
  }
};

module.exports = config;

},{}],14:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var stage = require("fz/core/stage");
var pixi = require("fz/core/pixi");
var loop = require("fz/core/loop");
var uMaths = require("fz/utils/maths");
var Line = require("xmas/home/Line");

var Home = (function (_PIXI$Container) {
  _inherits(Home, _PIXI$Container);

  function Home() {
    _classCallCheck(this, Home);

    _get(Object.getPrototypeOf(Home.prototype), "constructor", this).call(this);

    this._idx = 0;

    this._hLine = 220;

    this._yMin = 0;
    this._yMax = 195;
    this._yTo = this._yMax;

    this._cntLines = new PIXI.Container();
    this._cntLines.y = this._yTo;
    this.addChild(this._cntLines);

    this._createLines();

    this._binds = {};
    this._binds.onResize = this._onResize.bind(this);
    this._binds.onMouseScroll = this._onMouseScroll.bind(this);
    this._binds.onUpdate = this._onUpdate.bind(this);
  }

  _createClass(Home, [{
    key: "_onResize",
    value: function _onResize() {
      var w = 980;
      // if( stage.width < 1000 ) {
      w = 880;
      // }
      this._cntLines.x = stage.width - w >> 1;

      this._yMin = -26 * this._hLine + stage.height;

      this._countLinesVisible = Math.ceil((stage.height - this._yMax) / this._hLine);
      this._countLinesVisible += 1;

      this._updateVisibles();
    }
  }, {
    key: "_onMouseScroll",
    value: function _onMouseScroll(e) {
      e.preventDefault();

      this._isDragDrop = false;
      this._yTo += -e.deltaY * .4;
      this._yTo = uMaths.clamp(this._yTo, this._yMin, this._yMax);
    }
  }, {
    key: "_onUpdate",
    value: function _onUpdate() {
      this._cntLines.y += (this._yTo - this._cntLines.y) * .25;

      var idx = -(this._cntLines.y - this._yMax) / this._hLine >> 0;
      if (idx != this._idx) {
        this._idx = idx;
        this._updateVisibles();
      }
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
            if (!line.isShown && (i == start || i == end - 1)) {
              line.show(.2);
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

      window.addEventListener("mousewheel", this._binds.onMouseScroll, false);

      loop.add(this._binds.onUpdate);
    }
  }, {
    key: "unbindEvents",
    value: function unbindEvents() {
      stage.off("resize", this._binds.onResize);

      window.removeEventListener("mousewheel", this._binds.onMouseScroll, false);

      loop.remove(this._binds.onUpdate);
    }
  }, {
    key: "show",
    value: function show() {
      // this._onResize()

      pixi.stage.addChild(this);

      var n = this._lines.length;
      for (var i = 0; i < this._countLinesVisible; i++) {
        this._lines[i].show(i * .04);
      }

      TweenLite.set(this, {
        delay: 2,
        onComplete: this.bindEvents.bind(this)
      });
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

},{"fz/core/loop":1,"fz/core/pixi":2,"fz/core/stage":3,"fz/utils/maths":6,"xmas/home/Line":15}],15:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var Entry = require("xmas/home/entry/Entry");
var uXmasTexts = require("xmas/utils/texts");

var Line = (function (_PIXI$Container) {
  _inherits(Line, _PIXI$Container);

  function Line(idx) {
    var count = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    _classCallCheck(this, Line);

    _get(Object.getPrototypeOf(Line.prototype), "constructor", this).call(this);

    this._idx = idx;
    this._count = count;

    this.isShown = false;

    this._createTitle();

    this._cntEntries = new PIXI.Container();
    this._cntEntries.x = 145;
    this.addChild(this._cntEntries);
    if (count > 0) {
      this._createEntries();
    } else {
      this._createDummy();
    }
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
        this._cntTfDay = uXmasTexts.create("DAY", { font: "10px " + config.fonts.bold, fill: config.colors.red }, 1);
        this._cntTfDay.alpha = 0;
        cntLeft.addChild(this._cntTfDay);
      }

      this._line = new PIXI.Graphics();
      this._line.x = -25;
      this._line.y = 26;
      this._line.lineStyle(1, config.colors.blue);
      this._line.moveTo(0, 0);
      this._line.lineTo(20, 0);
      this._line.scale.x = 0;
      cntLeft.addChild(this._line);

      this._cntTfNumber = uXmasTexts.create(this._idx + "", { font: "60px " + config.fonts.bold, fill: config.colors.red });
      this._cntTfNumber.x = 16;
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
        entry = new Entry(i + 1);
        entry.x += px;
        entry.y = Math.sin(as[i]) * 25 >> 0;
        this._cntEntries.addChild(entry);

        px += 180;

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

      if (this.isShown) {
        return;
      }
      this.isShown = true;

      if (this._idx == 1) {
        var letter = null;
        var n = this._cntTfDay.children.length;
        for (var i = 0; i < n; i++) {
          letter = this._cntTfDay.children[i];
          TweenLite.set(letter, {
            delay: delay + .02,
            x: letter.xBase - 25,
            alpha: 0
          });
          TweenLite.to(letter, .4, {
            delay: delay + .02 + (n - i) * .02,
            x: letter.xBase,
            alpha: 1,
            ease: Cubic.easeInOut
          });
        }
        TweenLite.set(this._cntTfDay, {
          delay: delay + .04,
          alpha: 1
        });
      }
      TweenLite.to(this._line, .4, {
        delay: delay + .04,
        x: 0,
        ease: Cubic.easeInOut
      });
      TweenLite.to(this._line.scale, .4, {
        delay: delay + .04,
        x: 1,
        ease: Cubic.easeInOut
      });

      TweenLite.to(this._cntTfNumber, .4, {
        delay: delay,
        x: 36,
        alpha: 1,
        ease: Cubic.easeInOut
      });

      this._showEntries(delay + .2);
    }
  }, {
    key: "_showEntries",
    value: function _showEntries(delay) {
      var d = 0;
      var dAdd = .04;
      var dMin = .01;
      var dFriction = .85;

      var entry = null;
      var n = this._cntEntries.children.length;
      for (var i = 0; i < n; i++) {
        entry = this._cntEntries.children[i];
        entry.show(delay + d);

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

},{"xmas/core/config":13,"xmas/home/entry/Entry":16,"xmas/utils/texts":26}],16:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EntryContentPreview = require("xmas/home/entry/EntryContentPreview");
var EntryNumber = require("xmas/home/entry/EntryNumber");
var EntryComingSoon = require("xmas/home/entry/EntryComingSoon");
var EntrySmiley = require("xmas/home/entry/EntrySmiley");

var Entry = (function (_PIXI$Container) {
  _inherits(Entry, _PIXI$Container);

  function Entry() {
    var idx = arguments.length <= 0 || arguments[0] === undefined ? -1 : arguments[0];

    _classCallCheck(this, Entry);

    _get(Object.getPrototypeOf(Entry.prototype), "constructor", this).call(this);

    this._isShown = false;

    if (idx >= 0) {
      this._content = new EntryContentPreview();
      this.addChild(this._content);

      this._circle = new EntryNumber(idx);
      this._circle.x = 133;
      this._circle.y = 124;
      this.addChild(this._circle);
    } else {
      this._content = new EntryComingSoon();
      this.addChild(this._content);

      this._circle = new EntrySmiley();
      this._circle.x = 133;
      this._circle.y = 124;
      this.addChild(this._circle);
    }

    this._binds = {};
    this._binds.onMouseOver = this._onMouseOver.bind(this);
    this._binds.onMouseOut = this._onMouseOut.bind(this);
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
    key: "show",
    value: function show() {
      var _this = this;

      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      this._content.show(delay);
      this._circle.show(delay + .3);
      this._circle.x = 113;
      TweenLite.to(this._circle, .6, {
        delay: delay + .3,
        x: 133,
        ease: Quart.easeOut,
        onComplete: function onComplete() {
          _this._isShown = true;
        }
      });
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      if (this._content.hoverZone) {
        this._content.hoverZone.interactive = true;

        this._content.hoverZone.on("mouseover", this._binds.onMouseOver);
        this._content.hoverZone.on("mouseout", this._binds.onMouseOut);
      }
    }
  }, {
    key: "unbindEvents",
    value: function unbindEvents() {
      if (this._content.hoverZone) {
        this._content.hoverZone.interactive = false;

        this._content.hoverZone.off("mouseover", this._binds.onMouseOver);
        this._content.hoverZone.off("mouseout", this._binds.onMouseOut);
      }
    }
  }]);

  return Entry;
})(PIXI.Container);

module.exports = Entry;

},{"xmas/home/entry/EntryComingSoon":17,"xmas/home/entry/EntryContentPreview":18,"xmas/home/entry/EntryNumber":19,"xmas/home/entry/EntrySmiley":20}],17:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var PolyShape = require("xmas/home/entry/PolyShape");
var uXmasTexts = require("xmas/utils/texts");

var EntryComingSoon = (function (_PIXI$Container) {
  _inherits(EntryComingSoon, _PIXI$Container);

  function EntryComingSoon() {
    _classCallCheck(this, EntryComingSoon);

    _get(Object.getPrototypeOf(EntryComingSoon.prototype), "constructor", this).call(this);

    this._layer = new PIXI.Sprite(PIXI.Texture.fromFrame("layer-blue.png"));
    this.addChild(this._layer);

    this._cntContent = this._createContent();
    this._cntContent.y = config.sizes.entry.h - this._cntContent.height >> 1;
    this._cntContent.alpha = 0;
    this.addChild(this._cntContent);

    this._polyShape = new PolyShape();
    this._polyShape.x = config.sizes.entry.w >> 1;
    this._polyShape.y = config.sizes.entry.h >> 1;
    this._polyShape.scale.x = this._polyShape.scale.y = 0;
    this.addChild(this._polyShape);

    this.mask = this._polyShape;
  }

  _createClass(EntryComingSoon, [{
    key: "_createContent",
    value: function _createContent() {
      var cnt = new PIXI.Container();

      this._cntTfTop = uXmasTexts.create("more fun", { font: "15px " + config.fonts.bold, fill: config.colors.red }, 2);
      this._cntTfTop.x = config.sizes.entry.w - this._cntTfTop.width >> 1;
      cnt.addChild(this._cntTfTop);

      this._cntTfBottom = uXmasTexts.create("coming soon", { font: "15px " + config.fonts.bold, fill: config.colors.red }, 2);
      this._cntTfBottom.x = config.sizes.entry.w - this._cntTfBottom.width >> 1;
      this._cntTfBottom.y = 32;
      cnt.addChild(this._cntTfBottom);

      return cnt;
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      console.log("yo");
      this.x = -60;
      // this.y = 40
      TweenLite.to(this, .7, {
        delay: delay,
        x: 0,
        y: 0,
        ease: Cubic.easeOut
      });
      TweenLite.to(this._polyShape.scale, .2, {
        delay: delay,
        x: 0.3,
        y: 0.3,
        ease: Sine.easeIn
      });
      TweenLite.set(this._polyShape.scale, {
        delay: delay + .2,
        x: .6,
        y: .6
      });
      TweenLite.to(this._polyShape.scale, .6, {
        delay: delay + .2,
        x: 1,
        y: 1,
        ease: Cubic.easeOut
      });

      var px = config.sizes.entry.w - this._cntTfTop.width >> 1;
      px -= 20;
      this._cntTfTop.x = px;
      this._cntTfTop.alpha = 0;
      TweenLite.set(this._cntTfTop, {
        delay: delay + .3,
        alpha: .7
      });
      TweenLite.to(this._cntTfTop, .5, {
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
      TweenLite.to(this._cntTfBottom, .5, {
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
  }]);

  return EntryComingSoon;
})(PIXI.Container);

module.exports = EntryComingSoon;

},{"xmas/core/config":13,"xmas/home/entry/PolyShape":21,"xmas/utils/texts":26}],18:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var uImg = require("fz/utils/images");
var pixi = require("fz/core/pixi");
var config = require("xmas/core/config");
var PolyShape = require("xmas/home/entry/PolyShape");

var DefaultShape = (function (_PIXI$Container) {
  _inherits(DefaultShape, _PIXI$Container);

  function DefaultShape() {
    _classCallCheck(this, DefaultShape);

    _get(Object.getPrototypeOf(DefaultShape.prototype), "constructor", this).call(this);

    this._cntGlobal = new PIXI.Container();
    this.addChild(this._cntGlobal);

    this._cntPreview = this._createPreview();
    this._cntGlobal.addChild(this._cntPreview);

    this.pivot.x = config.sizes.entry.w >> 1;
    this.pivot.y = config.sizes.entry.h >> 1;

    this._layer = new PIXI.Sprite(PIXI.Texture.fromFrame("layer-blue.png"));
    this._layer.tint = config.colors.blue;
    this._layer.alpha = .95;
    this._layer.x = -20;
    this._layer.y = -20;
    this._cntGlobal.addChild(this._layer);

    this._polyShape = new PolyShape();
    this._polyShape.x = config.sizes.entry.w >> 1;
    this._polyShape.y = config.sizes.entry.h >> 1;
    this._cntGlobal.addChild(this._polyShape);

    this._cntGlobal.mask = this._polyShape;

    this._shapeOver = new PIXI.Graphics();
    this._shapeOver.beginFill(0xe5f2ff);
    this._shapeOver.drawCircle(0, 0, config.sizes.entry.h >> 1);
    this._shapeOver.x = this._polyShape.x;
    this._shapeOver.y = this._polyShape.y;
    this._shapeOver.scale.x = this._shapeOver.scale.y = 0;

    this._mskCircle = new PIXI.Graphics();
    this._mskCircle.beginFill(0xff00ff);
    this._mskCircle.drawCircle(0, 0, config.sizes.entry.h >> 1);
    this._mskCircle.x = this._polyShape.x;
    this._mskCircle.y = this._polyShape.y;
    this._mskCircle.scale.x = this._mskCircle.scale.y = 0;
    this.addChild(this._mskCircle);
  }

  _createClass(DefaultShape, [{
    key: "_createPreview",
    value: function _createPreview() {
      var cnt = new PIXI.Container();

      this._img = new PIXI.Sprite(PIXI.Texture.fromFrame("img/default.jpg"));
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
      var _this = this;

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
          _this._mskCircle.scale.x = _this._mskCircle.scale.y = 0;
          _this.mask = null;
        }
      });
    }
  }]);

  return DefaultShape;
})(PIXI.Container);

var HoverShape = (function (_PIXI$Container2) {
  _inherits(HoverShape, _PIXI$Container2);

  function HoverShape() {
    _classCallCheck(this, HoverShape);

    _get(Object.getPrototypeOf(HoverShape.prototype), "constructor", this).call(this);

    this._size = config.sizes.entry.w;

    this._percent = 0.0001;

    this.pivot.x = config.sizes.entry.w >> 1;
    this.pivot.y = config.sizes.entry.h >> 1;

    this._cntPreview = this._createPreview();
    this.addChild(this._cntPreview);

    this._layer = new PIXI.Sprite(PIXI.Texture.fromFrame("layer-blue.png"));
    this._layer.tint = config.colors.blue;
    this._layer.x = -20;
    this._layer.y = -20;
    this._layer.alpha = .3;

    this.addChild(this._layer);
    this._msk = new PIXI.Graphics();
    this._msk.x = config.sizes.entry.w >> 1;
    this._msk.y = config.sizes.entry.h >> 1;
    this.addChild(this._msk);

    this._updateMsk();

    this.mask = this._msk;

    this._shapeOver = new PolyShape(0xe5f2ff);
    this._shapeOver.x = this._msk.x;
    this._shapeOver.y = this._msk.y;
    this._shapeOver.scale.x = this._shapeOver.scale.y = 0;

    this._binds = {};
    this._binds.updateMsk = this._updateMsk.bind(this);
  }

  _createClass(HoverShape, [{
    key: "_createPreview",
    value: function _createPreview() {
      var cnt = new PIXI.Container();

      this._img = new PIXI.Sprite(PIXI.Texture.fromFrame("img/default.jpg"));
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
        x: 1.2,
        y: 1.2,
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

  function EntryContentPreview() {
    _classCallCheck(this, EntryContentPreview);

    _get(Object.getPrototypeOf(EntryContentPreview.prototype), "constructor", this).call(this);

    this._default = new DefaultShape();
    this._default.x = config.sizes.entry.w >> 1;
    this._default.y = config.sizes.entry.h >> 1;
    this._default.scale.x = this._default.scale.y = 0;
    this.addChild(this._default);

    this._hover = new HoverShape();
    this._hover.x = config.sizes.entry.w >> 1;
    this._hover.y = config.sizes.entry.h >> 1;
    // this.addChild( this._hover )

    this.hoverZone = new PIXI.Sprite(PIXI.Texture.fromFrame("layer-blue.png"));
    this.hoverZone.scale.set(.5, .5);
    this.hoverZone.tint = Math.random() * 0xffffff;
    this.hoverZone.alpha = 0;
    this.addChild(this.hoverZone);
  }

  _createClass(EntryContentPreview, [{
    key: "over",
    value: function over() {
      this._default.over();

      this.addChild(this._hover);
      this._hover.over();
    }
  }, {
    key: "out",
    value: function out() {
      this._default.out();
      this.addChild(this._default);

      this._hover.out();
      // this._hover.out( () => {
      //   this.removeChild( this._hover )
      // })
      // this.removeChild( this._hover )
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      this.x = -60;
      // this.y = 40
      TweenLite.to(this, .7, {
        delay: delay,
        x: 0,
        y: 0,
        ease: Cubic.easeOut
      });
      TweenLite.to(this._default.scale, .2, {
        delay: delay,
        x: 0.3,
        y: 0.3,
        ease: Sine.easeIn
      });
      TweenLite.set(this._default.scale, {
        delay: delay + .2,
        x: .6,
        y: .6
      });
      TweenLite.to(this._default.scale, .6, {
        delay: delay + .2,
        x: 1,
        y: 1,
        ease: Cubic.easeOut
      });
    }
  }, {
    key: "hide",
    value: function hide() {}
  }]);

  return EntryContentPreview;
})(PIXI.Container);

module.exports = EntryContentPreview;

},{"fz/core/pixi":2,"fz/utils/images":5,"xmas/core/config":13,"xmas/home/entry/PolyShape":21}],19:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var uXmasTexts = require("xmas/utils/texts");

var EntryNumber = (function (_PIXI$Container) {
  _inherits(EntryNumber, _PIXI$Container);

  function EntryNumber(idx) {
    _classCallCheck(this, EntryNumber);

    _get(Object.getPrototypeOf(EntryNumber.prototype), "constructor", this).call(this);

    this._percentArrowLine = 0;
    this._percentArrowEnd = 0;

    this._bg = new PIXI.Sprite(PIXI.Texture.fromFrame("bg-entry-number_2x.png"));
    this._bg.scale.set(.5, .5);
    this.addChild(this._bg);

    this._cntText = uXmasTexts.create("0" + idx, { font: "10px " + config.fonts.bold, fill: 0xffffff });
    this._cntText.x = this._bg.width - this._cntText.width >> 1;
    this._cntText.y = this._bg.height - this._cntText.height >> 1;
    this._cntText.x -= 1;
    this._cntText.y -= 1;
    this.addChild(this._cntText);

    this._createArrow();

    this.scale.x = this.scale.y = 0;
    this.pivot.set(this._bg.width >> 1, this._bg.height >> 1);

    this._binds = {};
    this._binds.drawArrowLine = this._drawArrowLine.bind(this);
    this._binds.drawArrowEnd = this._drawArrowEnd.bind(this);
  }

  _createClass(EntryNumber, [{
    key: "_createArrow",
    value: function _createArrow() {
      this._cntArrow = new PIXI.Container();
      this._cntArrow.x = -4;
      this._cntArrow.y = this._bg.height >> 1;
      // this.addChild( this._cntArrow )

      this._wArrowLine = 22;
      this._sizeArrowEnd = 5;

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

      this._cntArrow.x = -4;
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
      var _this = this;

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
          _this.removeChild(_this._cntArrow);
        }
      });
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      TweenLite.to(this.scale, .2, {
        delay: delay,
        x: 0.4,
        y: 0.4,
        ease: Sine.easeIn
      });
      TweenLite.set(this.scale, {
        delay: delay + .2,
        x: .6,
        y: .6
      });
      TweenLite.to(this.scale, .4, {
        delay: delay + .2,
        x: 1,
        y: 1,
        ease: Quart.easeOut
      });
    }
  }]);

  return EntryNumber;
})(PIXI.Container);

module.exports = EntryNumber;

},{"xmas/core/config":13,"xmas/utils/texts":26}],20:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EntrySmiley = (function (_PIXI$Container) {
  _inherits(EntrySmiley, _PIXI$Container);

  function EntrySmiley() {
    _classCallCheck(this, EntrySmiley);

    _get(Object.getPrototypeOf(EntrySmiley.prototype), "constructor", this).call(this);

    this._bg = new PIXI.Sprite(PIXI.Texture.fromFrame("bg-entry-number_2x.png"));
    this._bg.scale.set(.5, .5);
    this.addChild(this._bg);

    this._cntSmiley = this._createSmiley();
    this._cntSmiley.x = this._bg.width >> 1;
    this._cntSmiley.y = this._bg.height * .5 + 7;
    this.addChild(this._cntSmiley);

    this.scale.x = this.scale.y = 0;
    this.pivot.set(this._bg.width >> 1, this._bg.height >> 1);
  }

  _createClass(EntrySmiley, [{
    key: "_createSmiley",
    value: function _createSmiley() {
      var cnt = new PIXI.Container();

      this._wSmiley = 5;
      this._hSmileyMouth = 6;

      this._eyeLeft = new PIXI.Graphics();
      this._eyeLeft.x = -this._wSmiley;
      this._eyeLeft.y = -this._hSmileyMouth - 4;
      this._drawEye(this._eyeLeft);
      cnt.addChild(this._eyeLeft);

      this._eyeRight = new PIXI.Graphics();
      this._eyeRight.x = this._wSmiley;
      this._eyeRight.y = -this._hSmileyMouth - 4;
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
      g.drawCircle(0, 0, 1);
    }
  }, {
    key: "_drawMouth",
    value: function _drawMouth() {
      this._mouth.clear();
      this._mouth.lineStyle(1, 0xffffff);
      this._mouth.moveTo(0, 0);
      this._mouth.quadraticCurveTo(-this._wSmiley, 0, -this._wSmiley, -this._hSmileyMouth);
      this._mouth.moveTo(0, 0);
      this._mouth.quadraticCurveTo(this._wSmiley, 0, this._wSmiley, -this._hSmileyMouth);
    }
  }, {
    key: "show",
    value: function show() {
      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      TweenLite.to(this.scale, .2, {
        delay: delay,
        x: 0.4,
        y: 0.4,
        ease: Sine.easeIn
      });
      TweenLite.set(this.scale, {
        delay: delay + .2,
        x: .6,
        y: .6
      });
      TweenLite.to(this.scale, .4, {
        delay: delay + .2,
        x: 1,
        y: 1,
        ease: Quart.easeOut
      });
    }
  }]);

  return EntrySmiley;
})(PIXI.Container);

module.exports = EntrySmiley;

},{}],21:[function(require,module,exports){
"use strict";

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = require("xmas/core/config");

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

var PolyShape = (function (_PIXI$Graphics) {
  _inherits(PolyShape, _PIXI$Graphics);

  function PolyShape() {
    var color = arguments.length <= 0 || arguments[0] === undefined ? 0xff00ff : arguments[0];

    _classCallCheck(this, PolyShape);

    _get(Object.getPrototypeOf(PolyShape.prototype), "constructor", this).call(this);

    this._color = color;
    this._countMaskPoints = 6;

    this.rotation = Math.PI / 6;

    this._init();
    this._update();
  }

  _createClass(PolyShape, [{
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

  return PolyShape;
})(PIXI.Graphics);

module.exports = PolyShape;

},{"xmas/core/config":13}],22:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var uTexts = require("xmas/utils/texts");

var Title = require("xmas/ui/Title");
var ProgressBar = require("xmas/ui/ProgressBar");

var Logo = (function (_PIXI$Container) {
  _inherits(Logo, _PIXI$Container);

  function Logo() {
    _classCallCheck(this, Logo);

    _get(Object.getPrototypeOf(Logo.prototype), "constructor", this).call(this);

    this._title = new Title();
    this._title.x = -270;
    this._title.y = -140;
    this.addChild(this._title);

    this._progressBar = new ProgressBar();
    this._progressBar.y = -200;
    this.addChild(this._progressBar);

    this._a = 2 * Math.PI / 6;
    this._rad = 32;

    this._cntLogo = new PIXI.Container();
    this.addChild(this._cntLogo);

    this._treeGray = this._createTree(0xbcc5dd, 0xffffff);
    this._treeGray.rotation = Math.PI / 6 * 4;
    this._cntLogo.addChild(this._treeGray);

    this._treeWhite = this._createTree(0xffffff, config.colors.red);
    this._treeWhite.rotation = -Math.PI / 6 * 4;
    this._cntLogo.addChild(this._treeWhite);

    this._treeMain = new PIXI.Graphics();
    this._cntLogo.addChild(this._treeMain);

    this._updateTreeMain();

    this._cntLogo.scale.x = this._cntLogo.scale.y = .6;
    this._cntLogo.alpha = 0;

    this._initDate();

    this._canHideLoading = false;
    this._wantsToHideLoading = false;
  }

  _createClass(Logo, [{
    key: "_createTree",
    value: function _createTree(cBg, cDot) {
      var aCurr = -Math.PI / 4 * 2;
      var aCircle = 0;

      var g = new PIXI.Graphics();
      g.beginFill(cBg);
      g.moveTo(Math.cos(aCurr) * this._rad, Math.sin(aCurr) * this._rad);
      aCurr += this._a * 2;
      aCircle = aCurr;
      g.lineTo(Math.cos(aCurr) * this._rad, Math.sin(aCurr) * this._rad);
      aCurr += this._a;
      g.lineTo(Math.cos(aCurr) * this._rad, Math.sin(aCurr) * this._rad);
      aCurr += this._a;
      g.lineTo(Math.cos(aCurr) * this._rad, Math.sin(aCurr) * this._rad);

      g.beginFill(cDot);
      g.drawCircle(3, Math.sin(aCircle) * this._rad, 3);

      return g;
    }
  }, {
    key: "_updateTreeMain",
    value: function _updateTreeMain() {
      var aCurr = -Math.PI / 4 * 2;
      var aCircle = 0;

      this._treeMain.clear();

      this._treeMain.beginFill(config.colors.blue);
      this._treeMain.moveTo(Math.cos(aCurr) * this._rad, Math.sin(aCurr) * this._rad);
      aCurr += this._a * 2;
      aCircle = aCurr;
      this._treeMain.lineTo(Math.cos(aCurr) * this._rad, Math.sin(aCurr) * this._rad);
      aCurr += this._a;
      this._treeMain.lineTo(Math.cos(aCurr) * this._rad, Math.sin(aCurr) * this._rad);
      aCurr += this._a;
      this._treeMain.lineTo(Math.cos(aCurr) * this._rad, Math.sin(aCurr) * this._rad);

      aCurr = -Math.PI / 4 * 2;
      this._treeMain.beginFill(0x305ad1);
      this._treeMain.moveTo(Math.cos(aCurr) * this._rad, Math.sin(aCurr) * this._rad);
      this._treeMain.lineTo(0, 0);
      aCurr += this._a * 4;
      this._treeMain.lineTo(Math.cos(aCurr) * this._rad, Math.sin(aCurr) * this._rad);

      this._treeMain.beginFill(0xffffff);
      this._treeMain.drawCircle(3, Math.sin(aCircle) * this._rad, 3);
    }
  }, {
    key: "_initDate",
    value: function _initDate() {
      this._cntDate = uTexts.create("2015", { font: "10px " + config.fonts.bold, fill: config.colors.blue }, 10);
      this._cntDate.x = -this._cntDate.width >> 1;
      this._cntDate.y = 40;
      this._cntLogo.addChild(this._cntDate);

      this._cntDate.alpha = 0;
    }
  }, {
    key: "show",
    value: function show() {
      var _this = this;

      var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      this._title.show();
      this._progressBar.show(.5);

      TweenLite.to(this._cntLogo, .8, {
        delay: delay + .3,
        alpha: 1,
        ease: Quart.easeInOut
      });
      TweenLite.to(this._cntLogo.scale, 1.2, {
        delay: delay + .3,
        x: 1,
        y: 1,
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
          _this._progressBar.setPercent(.8);
        }
      });

      TweenLite.set(this, {
        delay: 1.4,
        onComplete: function onComplete() {
          _this._canHideLoading = true;
          if (_this._wantsToHideLoading) {
            _this.hideLoading();
          }
        }
      });
    }
  }, {
    key: "hideLoading",
    value: function hideLoading(xmas) {
      var _this2 = this;

      if (xmas) {
        this._xmas = xmas;
      }

      this._wantsToHideLoading = true;
      if (!this._canHideLoading) {
        return;
      }
      // tmp
      TweenLite.set(this, {
        onComplete: function onComplete() {
          _this2._progressBar.setPercent(1);
        }
      });
      //

      TweenLite.set(this, {
        delay: .6,
        onComplete: function onComplete() {
          _this2._title.hide();
          TweenLite.to(_this2, .8, {
            delay: .4,
            y: 90,
            ease: Quart.easeInOut
          });
          _this2._progressBar.switchMode(.4);
          TweenLite.to(_this2._cntDate, .6, {
            delay: 1.4,
            alpha: 0,
            ease: Quad.easeOut
          });

          TweenLite.set(_this2, {
            delay: .8,
            onComplete: function onComplete() {
              _this2._xmas.show();
            }
          });
        }
      });
    }
  }]);

  return Logo;
})(PIXI.Container);

module.exports = Logo;

},{"xmas/core/config":13,"xmas/ui/ProgressBar":23,"xmas/ui/Title":24,"xmas/utils/texts":26}],23:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var loop = require("fz/core/loop");
var stage = require("fz/core/stage");
var config = require("xmas/core/config");

var ProgressBar = (function (_PIXI$Container) {
  _inherits(ProgressBar, _PIXI$Container);

  function ProgressBar() {
    _classCallCheck(this, ProgressBar);

    _get(Object.getPrototypeOf(ProgressBar.prototype), "constructor", this).call(this);

    this._gTop = new PIXI.Graphics();
    this.addChild(this._gTop);

    this._gBot = new PIXI.Graphics();
    this._gBot.y = 290;
    this.addChild(this._gBot);

    this._percent = 0;
    this._percentTo = 0;

    this._xStartTop = -stage.width * .5;
    this._xStartBottom = stage.width * .5;

    this.alpha = 0;

    this._binds = {};
    this._binds.onUpdate = this._onUpdate.bind(this);
    this._binds.draw = this._draw.bind(this);
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
      TweenLite.to(this._gBot, .6, {
        delay: delay + 1,
        alpha: 0,
        ease: Quad.easeOut
      });
    }
  }]);

  return ProgressBar;
})(PIXI.Container);

module.exports = ProgressBar;

},{"fz/core/loop":1,"fz/core/stage":3,"xmas/core/config":13}],24:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("xmas/core/config");
var uTexts = require("xmas/utils/texts");

var Title = (function (_PIXI$Container) {
  _inherits(Title, _PIXI$Container);

  function Title() {
    _classCallCheck(this, Title);

    _get(Object.getPrototypeOf(Title.prototype), "constructor", this).call(this);

    this._cntTop = uTexts.create("CHRIST", { font: "60px " + config.fonts.bold, fill: config.colors.red }, 60);
    this.addChild(this._cntTop);

    this._cntBotLeft = uTexts.create("MAS", { font: "60px " + config.fonts.bold, fill: config.colors.red }, 50);
    this._cntBotLeft.y = 100;
    this._cntBotLeft.children[1].x += 4;
    this._cntBotLeft.children[2].x += 7;
    this.addChild(this._cntBotLeft);

    this._cntBotRight = uTexts.create("XP", { font: "60px " + config.fonts.bold, fill: config.colors.red }, 50);
    this._cntBotRight.x = 277;
    this._cntBotRight.y = 100;
    this._cntBotRight.children[0].x += 50;
    this._cntBotRight.children[1].x += 52;
    this.addChild(this._cntBotRight);

    this._hideLetters(this._cntTop);
    this._hideLetters(this._cntBotLeft);
    this._hideLetters(this._cntBotRight);
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

},{"xmas/core/config":13,"xmas/utils/texts":26}],25:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var pixi = require("fz/core/pixi");
var stage = require("fz/core/stage");

var Logo = require("xmas/ui/Logo");

var Ui = (function (_PIXI$Container) {
  _inherits(Ui, _PIXI$Container);

  function Ui() {
    _classCallCheck(this, Ui);

    _get(Object.getPrototypeOf(Ui.prototype), "constructor", this).call(this);

    pixi.stage.addChild(this);

    this._logo = new Logo();
    this.addChild(this._logo);

    this._onResize();
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
      this._logo.y = stage.height >> 1;
    }
  }, {
    key: "showLoading",
    value: function showLoading() {
      this._logo.show();
    }
  }, {
    key: "hideLoading",
    value: function hideLoading(xmas) {
      this._logo.hideLoading(xmas);
    }
  }]);

  return Ui;
})(PIXI.Container);

module.exports = Ui;

},{"fz/core/pixi":2,"fz/core/stage":3,"xmas/ui/Logo":22}],26:[function(require,module,exports){
"use strict";

var stage = require("fz/core/stage");

module.exports.create = function (text, style) {
  var letterSpacing = arguments.length <= 2 || arguments[2] === undefined ? 2 : arguments[2];

  var cnt = new PIXI.Container();

  var px = 0;

  var tf = null;
  var n = text.length;
  for (var i = 0; i < n; i++) {
    // tf = new PIXI.Text( text[ i ], style )
    tf = new PIXI.extras.BitmapText(text[i], style);
    tf.tint = style.fill;
    // tf.resolution = stage.resolution
    tf.x = px;
    tf.xBase = px;
    cnt.addChild(tf);

    px += tf.width + letterSpacing; //>> 0
  }

  return cnt;
};

},{"fz/core/stage":3}]},{},[10]);
