// --------------------------------------
// 
//    _  _ _/ .  _  _/ /_ _  _  _        
//   /_|/_ / /|//_  / / //_ /_// /_/     
//   http://activetheory.net     _/      
// 
// --------------------------------------
//   12/7/15 8:14p
// --------------------------------------

//*** Create a global object
window.Global = {};

//*** Shortcut to open a link
window.getURL = function(url, target) {
    if (!target) target = '_blank';
    window.open(url, target);
}

//*** Nullify any hanging console.log calls
if(typeof(console) === 'undefined') {
    window.console = {};
    console.log = console.error = console.info = console.debug = console.warn = console.trace = function() {};
}

//*** requestAnimationFrame Shim
if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
    
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
            window.setTimeout( callback, 1000 / 60 );
        };
    
    } )();
}

window.performance = (function() {
    if (window.performance && window.performance.now) return window.performance;
    else return Date;
})();

//*** Date.now shim
Date.now = Date.now || function() { return +new Date; };

//*** Create a class
window.Class = function(_class, _type) {
    var _this = this || window;
    var _string = _class.toString();
    var _name = _string.match(/function ([^\(]+)/)[1];
    var _static = null;

    if (typeof _type === 'function') {
        _static = _type;
        _type = null;
    }

    _type = (_type || '').toLowerCase();
    
    _class.prototype.__call = function() {
        if (this.events) this.events.scope(this);
    }

    if (!_type) {
        _this[_name] = _class;
        if (_static) {
            _static();
        }
    } else {
        if (_type == 'static') {
            _this[_name] = new _class();
        } else if (_type == 'singleton') {
            _this[_name] = (function() {
                var __this = {};
                var _instance;

                __this.instance = function() {
                    if (!_instance) _instance = new _class();
                    return _instance;
                }

                return __this;
            })();
        }
    }

    if (this !== window) {
        if (!this.__namespace) this.__namespace = this.constructor.toString().match(/function ([^\(]+)/)[1];
        this[_name]._namespace = this.__namespace;
    }
}

window.Inherit = function(child, parent, param) {
    if (typeof param === 'undefined') param = child;
    var p = new parent(param, true);
    
    var save = {};
    for (var method in p) {    
        child[method] = p[method];
        save[method] = p[method];
    }
    
    if (child.__call) child.__call();

    Render.nextFrame(function() {
        for (method in p) {
            if ((child[method] && save[method]) && child[method] !== save[method]) {
                child['_'+method] = save[method];
            }
        }
        
        p = save = null;
        child = parent = param = null;
    });
}

//*** Implement
window.Implement = function(cl, intr) {
    Render.nextFrame(function() {
        var intrface = new intr();
        for (var property in intrface) {
            if (typeof cl[property] === 'undefined') {
                throw 'Interface Error: Missing Property: '+property+' ::: '+intr;
            } else {
                var type = typeof intrface[property];
                if (typeof cl[property] != type) throw 'Interface Error: Property '+property+' is Incorrect Type ::: '+intr;
            }
        }
    });
}

//*** Namespace for plugins/libs
window.Namespace = function(name) {
    if (typeof name === 'string') window[name] = {Class: window.Class};
    else name.Class = window.Class;
}

window.Interface = function(display) {
    var name = display.toString().match(/function ([^\(]+)/)[1];
    Hydra.INTERFACES[name] = display;
}

window.THREAD = false;

Class(function HydraObject(_selector, _type, _exists, _useFragment) {

	this._children = new LinkedList();
	this.__useFragment = _useFragment;
	this._initSelector(_selector, _type, _exists);

}, function() {
	var prototype = HydraObject.prototype;

	prototype._initSelector = function(_selector, _type, _exists) {
		if (_selector && typeof _selector !== 'string') {
			this.div = _selector;
		} else {
			var first = _selector ? _selector.charAt(0) : null;
			var name = _selector ? _selector.slice(1) : null;

			if (first != '.' && first != '#') {
				name = _selector;
				first = '.';
			}

			if (!_exists) {
				this._type = _type || 'div';
				if (this._type == 'svg') {
					this.div = document.createElementNS('http://www.w3.org/2000/svg', this._type);
					this.div.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
				} else {
					this.div = document.createElement(this._type);
					if (first) {
						if (first == '#') this.div.id = name;
						else this.div.className = name;
					}
				}
			} else {
				if (first != '#') throw 'Hydra Selectors Require #ID';
				this.div = document.getElementById(name);
			}
		}

		this.div.hydraObject = this;
	}

	//*** Event Handlers

	//*** Public methods
	prototype.addChild = prototype.add = function(child) {
		var div = this.div;
		if (this.__useFragment) {
			if (!this._fragment) {
				this._fragment = document.createDocumentFragment();

				var _this = this;
				defer(function() {
					if (!_this._fragment || !_this.div) return _this._fragment = null;
					_this.div.appendChild(_this._fragment);
					_this._fragment = null;
				})
			}
			div = this._fragment;
		}

		if (child.element && child.element instanceof HydraObject) {

			div.appendChild(child.element.div);
			this._children.push(child.element);
			child.element._parent = this;
			child.element.div.parentNode = this.div;

		} else if (child.div) {

			div.appendChild(child.div);
			this._children.push(child);
			child._parent = this;
			child.div.parentNode = this.div;

		} else if (child.nodeName) {

			div.appendChild(child);
			child.parentNode = this.div;

		}

		return this;
	}

	prototype.clone = function() {
		return $(this.div.cloneNode(true));
	}

	prototype.create = function(name, type) {
		var $obj = $(name, type);
		this.addChild($obj);

		if (this.__root) {
			this.__root.__append[name] = $obj;
			$obj.__root = this.__root;
		}

		return $obj;
	}

	prototype.empty = function() {
		var child = this._children.start();
		while (child) {
			if (child && child.remove) child.remove();
			child = this._children.next();
		}

		this.div.innerHTML = '';
		return this;
	}

	prototype.parent = function() {
		return this._parent;
	}

	prototype.children = function() {
		return this.div.children ? this.div.children : this.div.childNodes;
	}

	prototype.append = function(callback, params) {
		if (!this.__root) {
			this.__root = this;
			this.__append = {};
		}

		return callback.apply(this, params);
	}

	prototype.removeChild = function(object, keep) {
		try { object.div.parentNode.removeChild(object.div); } catch(e) { };
		if (!keep) this._children.remove(object);
	}

	prototype.remove = prototype.destroy = function() {
		this.removed = true;

		var parent = this._parent;
		if (!!(parent && !parent.removed && parent.removeChild)) parent.removeChild(this, true);

		var child = this._children.start();
		while (child) {
			if (child && child.remove) child.remove();
			child = this._children.next();
		}
		this._children.destroy();

		this.div.hydraObject = null;
		Utils.nullObject(this);
	}
});

Class(function Hydra() {
	var _this = this;
	var _inter, _pool;
	var _readyCallbacks = [];
	
	this.READY = false;
	
	this.HASH = window.location.hash.slice(1);
    this.LOCAL = location.hostname.indexOf('local') > -1 || location.hostname.split('.')[0] == '10' || location.hostname.split('.')[0] == '192';
	
	(function() {
		initLoad();
	})();
	
	function initLoad() {
		if (!document || !window) return setTimeout(initLoad, 1);
		if (window._NODE_) {
            _this.addEvent = 'addEventListener';
            _this.removeEvent = 'removeEventListener';
            return setTimeout(loaded, 1);
        }
		
		if (window.addEventListener) {
			_this.addEvent = 'addEventListener';
			_this.removeEvent = 'removeEventListener';
			window.addEventListener('load', loaded, false);
		} else {
			_this.addEvent = 'attachEvent';
			_this.removeEvent = 'detachEvent';
			window.attachEvent('onload', loaded);
		}
	}
	
	function loaded() {
		if (window.removeEventListener) window.removeEventListener('load', loaded, false);
		for (var i = 0; i < _readyCallbacks.length; i++) {
			_readyCallbacks[i]();
		}
		_readyCallbacks = null;
		_this.READY = true;

        if (window.Main) Hydra.Main = new window.Main();
	}
	
	this.development = function(flag) {
        if (!flag) {
            clearInterval(_inter);
        } else {
            _inter = setInterval(function() {
                for (var prop in window) {
                    if (prop.strpos('webkit')) continue;
                    var obj = window[prop];
                    if (typeof obj !== 'function' && prop.length > 2) {
                        if (prop.strpos('_ga') || prop.strpos('_typeface_js')) continue;
                        var char1 = prop.charAt(0);
                        var char2 = prop.charAt(1);
                        if (char1 == '_' || char1 == '$') {
                            if (char2 !== char2.toUpperCase()) {
                                console.log(window[prop]);
                                throw 'Hydra Warning:: '+prop+' leaking into global scope';
                            }
                        }
                    }
                }
            }, 1000);
        }
    }

    this.getArguments = function(value) {
        var saved = this.arguments;
        var args = [];
        for (var i = 1; i < saved.length; i++) {
            if (saved[i] !== null) args.push(saved[i]);
        }
        return args;
    }
	
	this.ready = function(callback) {
		if (this.READY) return callback();
		_readyCallbacks.push(callback);
	}
	
	this.$ = function(selector, type, exists) {
        return new HydraObject(selector, type, exists);
	}

    this.__triggerReady = function() {
        loaded();
    }

    this.INTERFACES = {};
	this.HTML = {};
	this.JSON = {};
	this.$.fn = HydraObject.prototype;
	window.$ = this.$;
    window.ready = this.ready;
}, 'Static');

Hydra.ready(function() {
    //*** Set global shortcut to window, document, and body.
    window.__window = $(window);
    window.__document = $(document);
    window.__body = $(document.getElementsByTagName('body')[0]);
    window.Stage = __body.create('#Stage');
    
    Stage.size('100%');
    Stage.__useFragment = true;
    Stage.width = document.body.clientWidth || document.documentElement.offsetWidth || window.innerWidth;
    Stage.height = document.body.clientHeight || document.documentElement.offsetHeight || window.innerHeight;

    (function() {
        var _time = Date.now();
        var _last;
        
        setTimeout(function() {
            var list = ['hidden', 'msHidden', 'webkitHidden'];
            var hidden, eventName;
            
            (function() {
                for (var key in list) {
                    if (document[list[key]] !== 'undefined') {
                        hidden = list[key];
                        switch (hidden) {
                            case 'hidden': eventName = 'visibilitychange'; break;
                            case 'msHidden': eventName = 'msvisibilitychange'; break;
                            case 'webkitHidden': eventName = 'webkitvisibilitychange'; break;
                        }
                        return;
                    }
                }
            })();

            if (typeof document[hidden] === 'undefined') {
                if (Device.browser.ie) {
                    document.onfocus = onfocus;
                    document.onblur = onblur
                } else {
                    window.onfocus = onfocus;
                    window.onblur = onblur;
                }
            } else {
                document.addEventListener(eventName, function() {
                    var time = Date.now();
                    if (time - _time > 10) {
                        if (document[hidden] === false) onfocus();
                        else onblur(); 
                    }
                    _time = time;
                });
            }
        }, 250);
        
        function onfocus() {
            if (_last != 'focus') HydraEvents._fireEvent(HydraEvents.BROWSER_FOCUS, {type: 'focus'});
            _last = 'focus';
        }
        
        function onblur() {
            if (_last != 'blur') HydraEvents._fireEvent(HydraEvents.BROWSER_FOCUS, {type: 'blur'});
            _last = 'blur';
        }
    })();
    
    window.onresize = function() {
        if (!Device.mobile) {
            Stage.width = document.body.clientWidth || document.documentElement.offsetWidth || window.innerWidth;
            Stage.height = document.body.clientHeight || document.documentElement.offsetHeight || window.innerHeight;
            HydraEvents._fireEvent(HydraEvents.RESIZE);
        }
    };
});

(function() {
    $.fn.text = function(text) {
        if (typeof text !== 'undefined') {
            this.div.textContent = text;
            return this;
        } else {
            return this.div.textContent;
        }
    }
    
    $.fn.html = function(text, force) {
		if (text && !text.strpos('<') && !force) return this.text(text);

        if (typeof text !== 'undefined') {
            this.div.innerHTML = text;
            return this;
        } else {
            return this.div.innerHTML;
        }
    }
    
    $.fn.hide = function() {
        this.div.style.display = 'none';
        return this;
    }
    
    $.fn.show = function() {
        this.div.style.display = '';
        return this;
    }
	$.fn.visible = function() {
		this.div.style.visibility = 'visible';
		return this;
	}
	
	$.fn.invisible = function() {
		this.div.style.visibility = 'hidden';
		return this;
	}
		
	$.fn.setZ = function(z) {
		this.div.style.zIndex = z;
		return this;
	}
	
	$.fn.clearAlpha = function() {
        this.div.style.opacity = '';
		return this;
	}
	
	$.fn.size = function(w, h, noScale) {
		if (typeof w === 'string') {
		    if (typeof h === 'undefined') h = '100%';
		    else if (typeof h !== 'string') h = h+'px';
		    this.div.style.width = w;
		    this.div.style.height = h;
	    } else {
	    	this.div.style.width = w+'px';
	    	this.div.style.height = h+'px';
	    	if (!noScale) this.div.style.backgroundSize = w+'px '+h+'px';
		}
		
		this.width = w;
		this.height = h;
		
		return this;
	}

	$.fn.mouseEnabled = function(bool) {
		this.div.style.pointerEvents = bool ? 'auto' : 'none';
		return this;
	}
	
	$.fn.fontStyle = function(family, size, color, style) {
		var font = {};
		if (family) font.fontFamily = family;
		if (size) font.fontSize = size;
		if (color) font.color = color;
		if (style) font.fontStyle = style;
		this.css(font);
		return this;
	}
	
	$.fn.bg = function(src, x, y, repeat) {
        if (!src) return this;

		if (Hydra.CDN) {
			if (!src.strpos('http') && src.strpos('.')) src = Hydra.CDN + src + Config.SALT;
		}

        if (!src.strpos('.')) this.div.style.backgroundColor = src;
        else this.div.style.backgroundImage = 'url('+src+')';
        
        if (typeof x !== 'undefined') {
            x = typeof x == 'number' ? x+'px' : x;
            y = typeof y == 'number' ? y+'px' : y;
            this.div.style.backgroundPosition = x+' '+y;
        }
        
        if (repeat) {
            this.div.style.backgroundSize = '';
            this.div.style.backgroundRepeat = repeat;
        }

        if (x == 'cover' || x == 'contain') {
            this.div.style.backgroundSize = x;
            this.div.style.backgroundPosition = typeof y != 'undefined' ? y +' ' +repeat : 'center';
        }

        return this;
    }

	$.fn.center = function(x, y, noPos) {
	    var css = {};
	    if (typeof x === 'undefined') {
	        css.left = '50%';
	        css.top = '50%';
	        css.marginLeft = -this.width/2;
	        css.marginTop = -this.height/2;
	    } else {
	        if (x) {
	            css.left = '50%';
	            css.marginLeft = -this.width/2;
	        }
	        if (y) {
	            css.top = '50%';
	            css.marginTop = -this.height/2;
	        }
	    }

		if (noPos) {
			delete css.left;
			delete css.top;
		}

	    this.css(css);
	    return this;
	}
	
	$.fn.mask = function(arg, x, y, w, h) {
	    this.div.style[CSS.prefix('Mask')] = (arg.strpos('.') ? 'url('+arg+')' :  arg) + ' no-repeat';
	    return this;
	}
	
	$.fn.blendMode = function(mode, bg) {
	    if (bg) {
	        this.div.style['background-blend-mode'] = mode;
	    } else {
	        this.div.style['mix-blend-mode'] = mode;
	    }
	    
	    return this;
	}
    
    $.fn.css = function(obj, value) {
        if (typeof value == 'boolean') {
            skip = value;
            value = null;
        }
        
    	if (typeof obj !== 'object') {
    		if (!value) {
				var style = this.div.style[obj];
				if (typeof style !== 'number') {
				    if (style.strpos('px')) style = Number(style.slice(0, -2));
				    if (obj == 'opacity') style = typeof this.div.style.opacity === 'number' ? this.div.style.opacity : 1;
				}
				if (!style) style = 0;
				return style;
			} else {
				this.div.style[obj] = value;
				return this;
			}
		}
		
		TweenManager.clearCSSTween(this);

		for (var type in obj) {
			var val = obj[type];
			if (!(typeof val === 'string' || typeof val === 'number')) continue;
			if (typeof val !== 'string' && type != 'opacity' && type != 'zIndex') val += 'px';
            this.div.style[type] = val;
		}
		
		return this;
    }

	$.fn.transform = function(props) {
		if (this.multiTween && this._cssTweens.length > 1 && this.__transformTime && Render.TIME - this.__transformTime < 15) return;
		this.__transformTime = Render.TIME;
		TweenManager.clearCSSTween(this);

		if (Device.tween.css2d) {
			if (!props) {
				props = this;
			} else {
				for (var key in props) {
					if (typeof props[key] === 'number') this[key] = props[key];
				}
			}

			var transformString;
			if (!this._matrix) {
				transformString = TweenManager.parseTransform(props);
			} else {
				if (this._matrix.type == 'matrix2') {
					this._matrix.setTRS(this.x, this.y, this.rotation, this.scaleX || this.scale, this.scaleY || this.scale);
				} else {
					this._matrix.setTRS(this.x, this.y, this.z, this.rotationX, this.rotationY, this.rotationZ, this.scaleX || this.scale, this.scaleY || this.scale, this.scaleZ || this.scale);
				}

				transformString = this._matrix.getCSS();
			}

			if (this.__transformCache != transformString) {
				this.div.style[Device.styles.vendorTransform] = transformString;
				this.__transformCache = transformString;
			}
		}

		return this;
	}

	$.fn.useMatrix3D = function() {
		this._matrix = new Matrix4();//@useMatrix3D:Matrix4@//weak
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.rotationX = 0;
		this.rotationY = 0;
		this.rotationZ = 0;
		this.scale = 1;
		return this;
	}

	$.fn.useMatrix2D = function() {
		this._matrix = new Matrix2();//@useMatrix2D:Matrix2@//weak
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
		this.scale = 1;
		return this;
	}

	$.fn.willChange = function(props) {
		if (typeof props === 'boolean') {
			if (props === true) this._willChangeLock = true;
			else this._willChangeLock = false;
		} else {
			if (this._willChangeLock) return;
		}

		var string = typeof props === 'string';
		if ((!this._willChange || string) && typeof props !== 'null') {
			this._willChange = true;
			this.div.style['will-change'] = string ? props : Device.transformProperty+', opacity';
		} else {
			this._willChange = false;
			this.div.style['will-change'] = '';
		}
	}

	$.fn.backfaceVisibility = function(visible) {
		if (visible) this.div.style[CSS.prefix('BackfaceVisibility')] = 'visible';
		else this.div.style[CSS.prefix('BackfaceVisibility')] = 'hidden';
	}

	$.fn.enable3D = function(perspective, x, y) {
		this.div.style[CSS.prefix('TransformStyle')] = 'preserve-3d';
		if (perspective) this.div.style[CSS.prefix('Perspective')] = perspective + 'px';
		if (typeof x !== 'undefined') {
			x = typeof x === 'number' ? x + 'px' : x;
			y = typeof y === 'number' ? y + 'px' : y;
			this.div.style[CSS.prefix('PerspectiveOrigin')] = x+' '+y;
		}
		return this;
	}

	$.fn.disable3D = function() {
		this.div.style[CSS.prefix('TransformStyle')] = '';
		this.div.style[CSS.prefix('Perspective')] = '';
		return this;
	}

	$.fn.transformPoint = function(x, y, z) {
		var origin = '';
		if (typeof x !== 'undefined') origin += (typeof x === 'number' ? x+'px ' : x+' ');
		if (typeof y !== 'undefined') origin += (typeof y === 'number' ? y+'px ' : y+' ');
		if (typeof z !== 'undefined') origin += (typeof z === 'number' ? z+'px' : z);
		this.div.style[CSS.prefix('TransformOrigin')] = origin;
		return this;
	}

	$.fn.tween = function(props, time, ease, delay, callback, manual) {
		if (typeof delay === 'boolean') {
			manual = delay;
			delay = 0;
			callback = null;
		} else if (typeof delay === 'function') {
			callback = delay;
			delay = 0;
		}
		if (typeof callback === 'boolean') {
			manual = callback;
			callback = null;
		}
		if (!delay) delay = 0;

		//console.log(props);

		return TweenManager._detectTween(this, props, time, ease, delay, callback, manual);
	}

	$.fn.clearTransform = function() {
		if (typeof this.x === 'number') this.x = 0;
		if (typeof this.y === 'number') this.y = 0;
		if (typeof this.z === 'number') this.z = 0;
		if (typeof this.scale === 'number') this.scale = 1;
		if (typeof this.scaleX === 'number')this.scaleX = 1;
		if (typeof this.scaleY === 'number') this.scaleY = 1;
		if (typeof this.rotation === 'number') this.rotation = 0;
		if (typeof this.rotationX === 'number') this.rotationX = 0;
		if (typeof this.rotationY === 'number') this.rotationY = 0;
		if (typeof this.rotationZ === 'number') this.rotationZ = 0;
		if (typeof this.skewX === 'number') this.skewX = 0;
		if (typeof this.skewY === 'number') this.skewY = 0;
		this.div.style[Device.styles.vendorTransform] = '';
		return this;
	}

	$.fn.stopTween = function() {
		if (this._cssTween) this._cssTween.stop();
		if (this._mathTween) this._mathTween.stop();
		return this;
	}

	$.fn.keypress = function(callback) {
		this.div.onkeypress = function(e) {
			e = e || window.event;
			e.code = e.keyCode ? e.keyCode : e.charCode;
			if (callback) callback(e);
		}
	}

	$.fn.keydown = function(callback) {
		this.div.onkeydown = function(e) {
			e = e || window.event;
			e.code = e.keyCode;
			if (callback) callback(e);
		}
	}

	$.fn.keyup = function(callback) {
		this.div.onkeyup = function(e) {
			e = e || window.event;
			e.code = e.keyCode;
			if (callback) callback(e);
		}
	}

	$.fn.attr = function(attr, value) {
		if (attr && value) {
			if (value == '') this.div.removeAttribute(attr);
			else this.div.setAttribute(attr, value);
		} else if (attr) {
			return this.div.getAttribute(attr);
		}
		return this;
	}

	$.fn.val = function(value) {
		if (typeof value === 'undefined') {
			return this.div.value;
		} else {
			this.div.value = value;
		}

		return this;
	}

	$.fn.change = function(callback) {
		var _this = this;
		if (this._type == 'select') {
			this.div.onchange = function() {
				callback({object: _this, value: _this.div.value || ''});
			}
		}
	}

	$.fn.svgSymbol = function(id, width, height) {
		var config = SVG.getSymbolConfig(id);
		var svgHTML = '<svg viewBox="0 0 '+config.width+' '+config.height+'" width="'+width+'" height="'+height+'">'+
			'<use xlink:href="#'+config.id+'" x="0" y="0" />'+
			'</svg>';
		this.html(svgHTML, true);
	}

})();

(function() {
    var windowsPointer = !!window.MSGesture;

    var translateEvent = function(evt) {
        if (Hydra.addEvent == 'attachEvent') {
            switch (evt) {
                case 'click': return 'onclick'; break;
                case 'mouseover': return 'onmouseover'; break;
                case 'mouseout': return 'onmouseleave'; break;
                case 'mousedown': return 'onmousedown'; break;
                case 'mouseup': return 'onmouseup'; break;
                case 'mousemove': return 'onmousemove'; break;
            }
        }
        if (windowsPointer) {
            switch (evt) {
                case 'touchstart': return 'pointerdown'; break;
                case 'touchmove': return 'MSGestureChange'; break;
                case 'touchend': return 'pointerup'; break;
            }
        }
        return evt;
    }

    $.fn.click = function(callback) {
        var _this = this;
        function click(e) {
            if (!_this.div) return false;
            if (Mouse._preventClicks) return false;
            e.object = _this.div.className == 'hit' ? _this.parent() : _this;
            e.action = 'click';

            if (!e.pageX) {
                e.pageX = e.clientX;
                e.pageY = e.clientY;
            }

            if (callback) callback(e);

            if (Mouse.autoPreventClicks) Mouse.preventClicks();
        }

        this.div[Hydra.addEvent](translateEvent('click'), click, true);
        this.div.style.cursor = 'pointer';

        return this;
    }

    $.fn.hover = function(callback) {
        var _this = this;
        var _over = false;
        var _time;

        function hover(e) {
            if (!_this.div) return false;
            var time = Date.now();
            var original = e.toElement || e.relatedTarget;

            if (_time && (time - _time) < 5) {
                _time = time;
                return false;
            }

            _time = time;

            e.object = _this.div.className == 'hit' ? _this.parent() : _this;

            switch (e.type) {
                case 'mouseout': e.action = 'out'; break;
                case 'mouseleave': e.action = 'out'; break;
                default: e.action = 'over'; break;
            }

            if (_over) {
                if (Mouse._preventClicks) return false;
                if (e.action == 'over') return false;
                if (e.action == 'out') {
                    if (isAChild(_this.div, original)) return false;
                }
                _over = false;
            } else {
                if (e.action == 'out') return false;
                _over = true;
            }

            if (!e.pageX) {
                e.pageX = e.clientX;
                e.pageY = e.clientY;
            }

            if (callback) callback(e);
        }

        function isAChild(div, object) {
            var len = div.children.length-1;
            for (var i = len; i > -1; i--) {
                if (object == div.children[i]) return true;
            }

            for (i = len; i > -1; i--) {
                if (isAChild(div.children[i], object)) return true;
            }
        }

        this.div[Hydra.addEvent](translateEvent('mouseover'), hover, true);
        this.div[Hydra.addEvent](translateEvent('mouseout'), hover, true);

        return this;
    }

    $.fn.press = function(callback) {
        var _this = this;

        function press(e) {
            if (!_this.div) return false;
            e.object = _this.div.className == 'hit' ? _this.parent() : _this;

            switch (e.type) {
                case 'mousedown': e.action = 'down'; break;
                default: e.action = 'up'; break;
            }
            if (!e.pageX) {
                e.pageX = e.clientX;
                e.pageY = e.clientY;
            }
            if (callback) callback(e);
        }

        this.div[Hydra.addEvent](translateEvent('mousedown'), press, true);
        this.div[Hydra.addEvent](translateEvent('mouseup'), press, true);

        return this;
    }

    $.fn.bind = function(evt, callback) {
        if (!this._events) this._events = {};

        if (windowsPointer && this == __window) {
            return Stage.bind(evt, callback);
        }

        if (evt == 'touchstart') {
            if (!Device.mobile) evt = 'mousedown';
        } else if (evt == 'touchmove') {
            if (!Device.mobile) evt = 'mousemove';

            if (windowsPointer && !this.div.msGesture) {
                this.div.msGesture = new MSGesture();
                this.div.msGesture.target = this.div;
            }

        } else if (evt == 'touchend') {
            if (!Device.mobile) evt = 'mouseup';
        }

        this._events['bind_'+evt] = this._events['bind_'+evt] || [];
        var _events = this._events['bind_'+evt];
        var e = {};
        var target = this.div;
        e.callback = callback;
        e.target = this.div;
        _events.push(e);

        function touchEvent(e) {
            if (windowsPointer && target.msGesture && evt == 'touchstart') {
                target.msGesture.addPointer(e.pointerId);
            }

            var touch = Utils.touchEvent(e);
            if (windowsPointer) {
                var windowsEvt = e;
                e = {};
                e.x = Number(windowsEvt.pageX || windowsEvt.clientX);
                e.y = Number(windowsEvt.pageY || windowsEvt.clientY);
                e.target = windowsEvt.target;
                e.currentTarget = windowsEvt.currentTarget;
                e.path = [];
                var node = e.target;
                while (node) {
                    e.path.push(node);
                    node = node.parentElement || null;
                }
                e.windowsPointer = true;
            } else {
                e.x = touch.x;
                e.y = touch.y;
            }

            for (var i = 0; i < _events.length; i++) {
                var ev = _events[i];
                if (ev.target == e.currentTarget) {
                    ev.callback(e);
                }
            }
        }

        if (!this._events['fn_'+evt]) {
            this._events['fn_'+evt] = touchEvent;
            this.div[Hydra.addEvent](translateEvent(evt), touchEvent, true);
        }
        return this;
    }

    $.fn.unbind = function(evt, callback) {
        if (!this._events) this._events = {};

        if (windowsPointer && this == __window) {
            return Stage.unbind(evt, callback);
        }

        if (evt == 'touchstart') {
            if (!Device.mobile) evt = 'mousedown';
        } else if (evt == 'touchmove') {
            if (!Device.mobile) evt = 'mousemove';
        } else if (evt == 'touchend') {
            if (!Device.mobile) evt = 'mouseup';
        }

        var _events = this._events['bind_'+evt];
        if (!_events) return this;

        for (var i = 0; i < _events.length; i++) {
            var ev = _events[i];
            if (ev.callback == callback) _events.splice(i, 1);
        }

        if (this._events['fn_'+evt] && !_events.length) {
            this.div[Hydra.removeEvent](translateEvent(evt), this._events['fn_'+evt], true);
            this._events['fn_'+evt] = null;
        }

        return this;
    }

    $.fn.interact = function(overCallback, clickCallback) {
        if (!this.hit) {
            this.hit = $('.hit');
            this.hit.css({width: '100%', height: '100%', zIndex: 99999, top: 0, left: 0, position: 'absolute', background: 'rgba(255, 255, 255, 0)'});
            this.addChild(this.hit);
        }

        if (!Device.mobile) this.hit.hover(overCallback).click(clickCallback);
        else this.hit.touchClick(overCallback, clickCallback);
    }

    $.fn.touchSwipe = function(callback, distance) {
        if (!window.addEventListener) return this;

        var _this = this;
        var _distance = distance || 75;
        var _startX, _startY;
        var _moving = false;
        var _move = {};

        if (Device.mobile) {
            this.div.addEventListener(translateEvent('touchstart'), touchStart);
            this.div.addEventListener(translateEvent('touchend'), touchEnd);
            this.div.addEventListener(translateEvent('touchcancel'), touchEnd);
        }

        function touchStart(e) {
            var touch = Utils.touchEvent(e);
            if (!_this.div) return false;
            if (e.touches.length == 1) {
                _startX = touch.x;
                _startY = touch.y;
                _moving = true;
                _this.div.addEventListener(translateEvent('touchmove'), touchMove);
            }
        }

        function touchMove(e) {
            if (!_this.div) return false;
            if (_moving) {
                var touch = Utils.touchEvent(e);
                var dx = _startX - touch.x;
                var dy = _startY - touch.y;

                _move.direction = null;
                _move.moving = null;
                _move.x = null;
                _move.y = null;
                _move.evt = e;

                if (Math.abs(dx) >= _distance) {
                    touchEnd();
                    if (dx > 0) {
                        _move.direction = 'left';
                    } else {
                        _move.direction = 'right';
                    }
                } else if (Math.abs(dy) >= _distance) {
                    touchEnd();
                    if (dy > 0) {
                        _move.direction = 'up';
                    } else {
                        _move.direction = 'down';
                    }
                } else {
                    _move.moving = true;
                    _move.x = dx;
                    _move.y = dy;
                }

                if (callback) callback(_move, e);
            }
        }

        function touchEnd(e) {
            if (!_this.div) return false;
            _startX = _startY = _moving = false;
            _this.div.removeEventListener(translateEvent('touchmove'), touchMove);
        }

        return this;
    }

    $.fn.touchClick = function(hover, click) {
        if (!window.addEventListener) return this;
        var _this = this;
        var _time, _move;
        var _start = {};
        var _touch = {};

        if (Device.mobile) {
            this.div.addEventListener(translateEvent('touchmove'), touchMove, false);
            this.div.addEventListener(translateEvent('touchstart'), touchStart, false);
            this.div.addEventListener(translateEvent('touchend'), touchEnd, false);
        }

        function touchMove(e) {
            if (!_this.div) return false;
            _touch = Utils.touchEvent(e);
            if (Utils.findDistance(_start, _touch) > 5) {
                _move = true;
            } else {
                _move = false;
            }
        }

        function setTouch(e) {
            var touch = Utils.touchEvent(e);
            e.touchX = touch.x;
            e.touchY = touch.y;

            _start.x = e.touchX;
            _start.y = e.touchY;
        }

        function touchStart(e) {
            if (!_this.div) return false;
            _time = Date.now();
            e.action = 'over';
            e.object = _this.div.className == 'hit' ? _this.parent() : _this;
            setTouch(e);
            if (hover && !_move) hover(e);
        }

        function touchEnd(e) {
            if (!_this.div) return false;
            var time = Date.now();
            var clicked = false;

            e.object = _this.div.className == 'hit' ? _this.parent() : _this;
            setTouch(e);

            if (_time && time - _time < 750) {
                if (Mouse._preventClicks) return false;
                if (click && !_move) {
                    clicked = true;
                    e.action = 'click';
                    if (click && !_move) click(e);

                    if (Mouse.autoPreventClicks) Mouse.preventClicks();
                }
            }

            if (hover) {
                e.action = 'out';
                if (!Mouse._preventFire) hover(e);
            }

            _move = false;
        }

        return this;
    }
})();

Class(function MVC() {
    Inherit(this, Events);
    var _setters = {};
    var _active = {};
    var _timers = [];
    
    this.classes = {};
    
    function defineSetter(_this, prop) {
        _setters[prop] = {};
        Object.defineProperty(_this, prop, {
            set: function(v) {
                if (_setters[prop] && _setters[prop].s) _setters[prop].s.call(_this, v);
                v = null;
            },
            
            get: function() {
                if (_setters[prop] && _setters[prop].g) return _setters[prop].g.apply(_this);
            }
        });
    }
    
    this.set = function(prop, callback) {
        if (!_setters[prop]) defineSetter(this, prop);
        _setters[prop].s = callback;
    }
    
    this.get = function(prop, callback) {
        if (!_setters[prop]) defineSetter(this, prop);
        _setters[prop].g = callback;
    }
    
    this.delayedCall = function(callback, time, params) {
        var _this = this;

        var timer = Timer.create(function() {
            if (_this.destroy) callback(params);
            _this = callback = null;
        }, time || 0);

        _timers.push(timer);
        if (_timers.length > 20) _timers.shift();

        return timer;
    }
    
    this.initClass = function(clss, a, b, c, d, e, f, g) {
        var name = Utils.timestamp();
        if (window.Hydra) Hydra.arguments = arguments;
        var child = new clss(a, b, c, d, e, f, g);
        if (window.Hydra) Hydra.arguments = null;
        child.parent = this;

        if (child.destroy) {
            this.classes[name] = child;
            this.classes[name].__id = name;
        }

        var lastArg = arguments[arguments.length-1];

        if (Array.isArray(lastArg) && lastArg.length == 1 && lastArg[0] instanceof HydraObject) lastArg[0].addChild(child);
        else if (this.element && lastArg !== null) this.element.addChild(child);

        return child;
    }
    
    this.destroy = function() {
        for (var i in this.classes) {
            var clss = this.classes[i];
            if (clss && clss.destroy) clss.destroy();
        }

        this.clearTimers && this.clearTimers();
        
        this.classes = null;
        if (this.events) this.events = this.events.destroy();
        if (this.element && this.element.remove) this.element = this.container = this.element.remove();
        if (this.parent && this.parent.__destroyChild) this.parent.__destroyChild(this.__id);
        
        return Utils.nullObject(this);
    }

    this.clearTimers = function() {
        for (i = 0; i < _timers.length; i++) clearTimeout(_timers[i]);
        _timers.length = 0;
    }

    this.active = function(name, value) {
        if (typeof value !== 'undefined') {
            _active[name] = value;
        } else {
            return _active[name];
        }
    }

    this.__destroyChild = function(name) {
        delete this.classes[name];
    }
});

Class(function Model(name) {
    Inherit(this, MVC);
    
    var _storage = {};
    
    this.push = function(name, val) {
        _storage[name] = val;
    }
    
    this.pull = function(name) {
        return _storage[name];
    }

    this.initWithData = function(data) {
        this.STATIC_DATA = data;

        for (var key in this) {
            var model = this[key];
            var init = false;

            for (var i in data) {
                if (i.toLowerCase().replace(/-/g, "") == key.toLowerCase()) {
					init = true;
                    if (model.init) model.init(data[i]);
                }
            }

            if (!init && model.init) model.init();
        }
    }

    this.loadData = function(url, callback) {
        var _this = this;
        XHR.get(url+'?'+Utils.timestamp(), function(d) {
            _this.initWithData(d);
            callback(d);
        });
    }

    this.Class = function(model) {
        var name = model.toString().match(/function ([^\(]+)/)[1];
        this[name] = new model();
    }
});

Class(function View(_child) {
	Inherit(this, MVC);
	var _resize;
	var name = _child.constructor.toString().match(/function ([^\(]+)/)[1];

	this.element = $('.'+name);
	this.element.__useFragment = true;

	this.css = function(obj) {
		this.element.css(obj);
		return this;
	}

	this.transform = function(obj) {
		this.element.transform(obj || this);
		return this;
	}

	this.tween = function(props, time, ease, delay, callback, manual) {
		return this.element.tween(props, time, ease, delay, callback, manual);
	}

	var inter = Hydra.INTERFACES[name] || Hydra.INTERFACES[name + 'UI'];
	if (inter) {
		this.ui = {};

		var params = Hydra.getArguments();
		params.push(_child);
		_resize = this.element.append(inter, params);
		var append = this.element.__append;

		for (var key in append) this.ui[key] = append[key];

		if (_resize) {
			this.resize = function() {
				_resize.apply(this.ui, arguments);
			}
		}
	}

	this.__call = function() {
		this.events.scope(this);
	}

});

Class(function Controller(name) {
	Inherit(this, MVC);
	
	name = name.constructor.toString().match(/function ([^\(]+)/)[1];
		
    this.element = this.container = $('#'+name);
    this.element.__useFragment = true;

    this.css = function(obj) {
        this.container.css(obj);
    }
});

Class(function Component() {
    Inherit(this, MVC);

    this.__call = function() {
        this.events.scope(this);
        delete this.__call;
    }
});

Class(function Utils() {
	var _this = this;
			
	if (typeof Float32Array == 'undefined') Float32Array = Array;
	
	//*** Private functions
	function rand(min, max) {
	    return lerp(Math.random(), min, max);
	}
	
	function lerp(ratio, start, end) {
	    return start + (end - start) * ratio;
	}
	
	//*** Public functions
	this.doRandom = function(min, max) {
		return Math.round(rand(min - 0.5, max + 0.5));
	}
	
	this.headsTails = function(heads, tails) {
		return !_this.doRandom(0, 1) ? heads : tails;
	}
	
	this.toDegrees = function(rad) {
		return rad * (180/Math.PI);
	}

	this.toRadians = function(deg) {
		return deg * (Math.PI/180);
	}

	this.findDistance = function(p1, p2) {
		var dx = p2.x - p1.x;
		var dy = p2.y - p1.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
	
	this.timestamp = function() {
		var num = Date.now() + _this.doRandom(0, 99999);
		return num.toString();
	}
	
	this.hitTestObject = function(obj1, obj2) {
		var x1 = obj1.x, y1 = obj1.y, w = obj1.width, h = obj1.height;
		var xp1 = obj2.x, yp1 = obj2.y, wp = obj2.width, hp = obj2.height;
		var x2 = x1+w, y2 = y1+h, xp2 = xp1+wp, yp2 = yp1+hp;
		if(xp1 >= x1 && xp1 <= x2) {
			if(yp1>=y1 && yp1<=y2) {
				return true;
			}
			else if(y1>=yp1 && y1<=yp2) {
				return true;
			}
		}
		else if(x1>=xp1 && x1<=xp2) {
			if(yp1>=y1 && yp1<=y2) {
				return true;
			}
			else if(y1>=yp1 && y1<=yp2) {
				return true;
			}
		}
		return false;
	}
	
	this.randomColor = function() {
        var color = '#'+Math.floor(Math.random()*16777215).toString(16);
        if (color.length < 7) color = this.randomColor();
        return color;
    }
	
	this.touchEvent = function(e) {
        var touchEvent = {};
        touchEvent.x = 0;
        touchEvent.y = 0;

		if (e.windowsPointer) return e;
        
        if (!e) return touchEvent;
        if (Device.mobile && (e.touches || e.changedTouches)) {
            if (e.changedTouches.length) {
                touchEvent.x = e.changedTouches[0].pageX;
                touchEvent.y = e.changedTouches[0].pageY - Mobile.scrollTop;
            } else {
                touchEvent.x = e.touches[0].pageX;
                touchEvent.y = e.touches[0].pageY - Mobile.scrollTop;
            }            
        } else {
           touchEvent.x = e.pageX;
           touchEvent.y = e.pageY;
        }
                
        return touchEvent;
    }
    
    this.clamp = function(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }
    
    this.constrain = function(num, min, max) {
        return Math.min(Math.max(num, Math.min(min, max)), Math.max(min, max));
    }
	
	this.nullObject = function(object) {
        if (object.destroy || object.div) {
            for (var key in object) {
                if (typeof object[key] !== 'undefined') object[key] = null;
            }
        }
        return null;
    }
	
	this.convertRange = this.range = function(oldValue, oldMin, oldMax, newMin, newMax, clamped) {
        var oldRange = (oldMax - oldMin);  
        var newRange = (newMax - newMin);
		var newValue = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
		if (clamped) return _this.clamp(newValue, newMin, newMax);
        return newValue;
    }
	
	String.prototype.strpos = function(str) {
		if (Array.isArray(str)) {
			for (var i = 0; i < str.length; i++) {
				if (this.indexOf(str[i]) > -1) return true;
			}

			return false;
		} else {
			return this.indexOf(str) != -1;
		}
    }
    
    String.prototype.clip = function(num, end) {
        return this.length > num ? this.slice(0, num) + end : this;
    }
    
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

	Array.prototype.findAndRemove = function(reference) {
		var index = this.indexOf(reference);
		if (index > -1) return this.splice(index, 1);
	}
}, 'Static');

Class(function CSS() {
    var _this = this;
    var _obj, _style, _needsUpdate;
 
    //*** Constructor
    Hydra.ready(function() {
        _style = '';
        _obj = document.createElement('style');
        _obj.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(_obj);   
    });
    
    function objToCSS(key) {
        var match = key.match(/[A-Z]/);
        var camelIndex = match ? match.index : null;
        if (camelIndex) {
            var start = key.slice(0, camelIndex);
            var end = key.slice(camelIndex);
            key = start+'-'+end.toLowerCase();
        }
        return key;
    }
    
    function cssToObj(key) {
        var match = key.match(/\-/);
        var camelIndex = match ? match.index : null;
        if (camelIndex) {
            var start = key.slice(0, camelIndex);
            var end = key.slice(camelIndex).slice(1);
            var letter = end.charAt(0);
            end = end.slice(1);
            end = letter.toUpperCase() + end;
            key = start + end;
        }
        return key;
    }
    
    function setHTML() {
        _obj.innerHTML = _style;
        _needsUpdate = false;
    }
    
    this._read = function() {
        return _style;
    }
    
    this._write = function(css) {
        _style = css;
        if (!_needsUpdate) {
            _needsUpdate = true;
            Render.nextFrame(setHTML);
        }
    }
    
    this._toCSS = objToCSS;
    
    this.style = function(selector, obj) {
        var s = selector + ' {';
        for (var key in obj) {
            var prop = objToCSS(key);
            var val = obj[key];
            if (typeof val !== 'string' && key != 'opacity') val += 'px';
            s += prop+':'+val+'!important;';
        }
        s += '}';
        _obj.innerHTML += s;
    }
    
    this.get = function(selector, prop) {
        var values = new Object();
        var string = _obj.innerHTML.split(selector+' {');
        for (var i = 0; i < string.length; i++) {
            var str = string[i];
            if (!str.length) continue;
            var split = str.split('!important;');
            for (var j in split) {
                if (split[j].strpos(':')) {
                    var fsplit = split[j].split(':');
                    if (fsplit[1].slice(-2) == 'px') {
                        fsplit[1] = Number(fsplit[1].slice(0, -2));
                    }
                    values[cssToObj(fsplit[0])] = fsplit[1];
                }
            }  
        }
        
        if (!prop) return values;
        else return values[prop];
    }
    
	this.textSize = function($obj) {
	    var $clone = $obj.clone();
	    $clone.css({position: 'relative', cssFloat: 'left', styleFloat: 'left', marginTop: -99999, width: '', height: ''});
	    __body.addChild($clone);

	    var width = $clone.div.offsetWidth;
	    var height = $clone.div.offsetHeight;

	    $clone.remove();
	    return {width: width, height: height};
	}
	
	this.prefix = function(style) {
        return Device.styles.vendor == '' ? style.charAt(0).toLowerCase() + style.slice(1) : Device.styles.vendor + style;
    }
}, 'Static');

Class(function Device() {
    var _this = this;
    var _tagDiv;

    this.agent = navigator.userAgent.toLowerCase();

    this.detect = function(array) {
        if (typeof array === 'string') array = [array];
        for (var i = 0; i<array.length; i++) {
            if (this.agent.strpos(array[i])) return true;
        }
        return false;
    }

    var prefix = (function() {
        var pre = '';

        if (!window._NODE_) {
            var styles = window.getComputedStyle(document.documentElement, '');
            pre = (Array.prototype.slice
                .call(styles)
                .join('')
                .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
            )[1];
            var dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
        } else {
            pre = 'webkit';
        }

        var IE = _this.detect('trident');

        return {
            unprefixed: IE && !_this.detect('msie 9'),
            dom: dom,
            lowercase: pre,
            css: '-' + pre + '-',
            js: (IE ? pre[0] : pre[0].toUpperCase()) + pre.substr(1)
        };
    })()

    function checkForTag(prop) {
        var div = _tagDiv || document.createElement('div'),
            vendors = 'Khtml ms O Moz Webkit'.split(' '),
            len = vendors.length;

        _tagDiv = div;

        if ( prop in div.style ) return true;
        prop = prop.replace(/^[a-z]/, function(val) {
            return val.toUpperCase();
        });

        while(len--) {
            if ( vendors[len] + prop in div.style ) {
                return true;
            }
        }
        return false;
    }

    //*** Mobile
    this.mobile = !window._NODE_ && (!!(('ontouchstart' in window) || ('onpointerdown' in window)) && this.detect(['ios', 'iphone', 'ipad', 'windows', 'android', 'blackberry'])) ? {} : false;
    if (this.mobile && this.detect('windows') && !this.detect('touch')) this.mobile = false;
    if (this.mobile) {
        this.mobile.tablet = screen.width > 1000 || screen.height > 900;
        this.mobile.phone = !this.mobile.tablet;
    }

    //*** Browser
    this.browser = {};
    this.browser.ie = (function() {
        if (_this.detect('msie')) return true;
        if (_this.detect('trident') && _this.detect('rv:')) return true;
        if (_this.detect('windows') && _this.detect('edge')) return true;
    })();
    this.browser.chrome = !this.browser.ie && this.detect('chrome');
    this.browser.safari = !this.browser.chrome && !this.browser.ie && this.detect('safari');
    this.browser.firefox = this.detect('firefox');
    this.browser.version = (function() {
        try {
            if (_this.browser.chrome) return Number(_this.agent.split('chrome/')[1].split('.')[0]);
            if (_this.browser.firefox) return Number(_this.agent.split('firefox/')[1].split('.')[0]);
            if (_this.browser.safari) return Number(_this.agent.split('version/')[1].split('.')[0].charAt(0));
            if (_this.browser.ie) {
                if (_this.detect('msie')) return Number(_this.agent.split('msie ')[1].split('.')[0]);
                if (_this.detect('rv:')) return Number(_this.agent.split('rv:')[1].split('.')[0]);
                return Number(_this.agent.split('edge/')[1].split('.')[0]);
            }
        } catch(e) {
            return -1;
        }
    })();

    //*** Transforms
    this.vendor = prefix.css;
    this.transformProperty = (function() {
        switch (prefix.lowercase) {
            case 'moz': return '-moz-transform'; break;
            case 'webkit': return '-webkit-transform'; break;
            case 'o': return '-o-transform'; break;
            case 'ms': return '-ms-transform'; break;
            default: return 'transform'; break;
        }
    })();

    //*** System
    this.system = {};
    this.system.retina = window.devicePixelRatio > 1;
    this.system.webworker = typeof window.Worker !== 'undefined';
    this.system.offline = typeof window.applicationCache !== 'undefined';
    if (!window._NODE_) {
        this.system.geolocation = typeof navigator.geolocation !== 'undefined';
        this.system.pushstate = typeof window.history.pushState !== 'undefined';
    }
    this.system.webcam = !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia || navigator.msGetUserMedia);
    this.system.language = window.navigator.userLanguage || window.navigator.language;
    this.system.webaudio = typeof window.AudioContext !== 'undefined';
    try {
        this.system.localStorage = typeof window.localStorage !== 'undefined';
    } catch (e) {
        this.system.localStorage = false;
    }
    this.system.fullscreen = typeof document[prefix.lowercase+'CancelFullScreen'] !== 'undefined';
    this.system.os = (function() {
        if (_this.detect('mac os')) return 'mac';
        else if (_this.detect('windows nt 6.3')) return 'windows8.1';
        else if (_this.detect('windows nt 6.2')) return 'windows8';
        else if (_this.detect('windows nt 6.1')) return 'windows7';
        else if (_this.detect('windows nt 6.0')) return 'windowsvista';
        else if (_this.detect('windows nt 5.1')) return 'windowsxp';
        else if (_this.detect('windows')) return 'windows';
        else if (_this.detect('linux')) return 'linux';
        return 'undetected';
    })();

    this.pixelRatio = window.devicePixelRatio;

    //*** Media
    this.media = {};
    this.media.audio = (function() {
        if (!!document.createElement('audio').canPlayType) {
            return _this.detect(['firefox', 'opera']) ? 'ogg' : 'mp3';
        } else {
            return false;
        }
    })();
    this.media.video = (function() {
        var vid = document.createElement('video');
        if (!!vid.canPlayType) {
            if (Device.mobile) return 'mp4';
            if (_this.browser.chrome) return 'webm';
            if (_this.browser.firefox || _this.browser.opera) {
                if (vid.canPlayType('video/webm; codecs="vorbis,vp8"')) return 'webm';
                return 'ogv';
            }
            return 'mp4';
        } else {
            return false;
        }
    })();

    //*** Graphics
    this.graphics = {};
    this.graphics.webgl = (function() {
        try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { };
    })();
    this.graphics.canvas = (function() {
        var canvas = document.createElement('canvas');
        return canvas.getContext ? true : false;
    })();

    //*** Style properties
    this.styles = {};
    this.styles.filter = checkForTag('filter');
    this.styles.blendMode = checkForTag('mix-blend-mode');
    this.styles.vendor = prefix.unprefixed ? '' : prefix.js;
    this.styles.vendorTransition = this.styles.vendor.length ? this.styles.vendor+'Transition' : 'transition';
    this.styles.vendorTransform = this.styles.vendor.length ? this.styles.vendor+'Transform' : 'transform';

    //*** CSS3 Tweens
    this.tween = {};
    this.tween.transition = checkForTag('transition');
    this.tween.css2d = checkForTag('transform');
    this.tween.css3d = checkForTag('perspective');
    //this.tween.webAnimation = !!window.AnimationEvent;
    this.tween.complete = (function() {
        if (prefix.unprefixed) return 'transitionend';
        return prefix.lowercase + 'TransitionEnd';
    })();

    //*** Custom test
    this.test = function(name, test) {
        this[name] = test();
    }

    //*** Fullscreen
    function checkFullscreen() {
        if (!_this.getFullscreen()) {
            HydraEvents._fireEvent(HydraEvents.FULLSCREEN, {fullscreen: false});
            Render.stop(checkFullscreen);
        }
    }

    this.openFullscreen = function(obj) {
        obj = obj || __body;
        if (obj && _this.system.fullscreen) {
            if (obj == __body) obj.css({top: 0});
            obj.div[prefix.lowercase+'RequestFullScreen']();
            HydraEvents._fireEvent(HydraEvents.FULLSCREEN, {fullscreen: true});

            Render.start(checkFullscreen, 10);
        }
    }

    this.closeFullscreen = function() {
        if (_this.system.fullscreen) document[prefix.lowercase+'CancelFullScreen']();
        Render.stop(checkFullscreen);
    }

    this.getFullscreen = function() {
        if (_this.browser.firefox) return document.mozFullScreen;
        return document[prefix.lowercase+'IsFullScreen'];
    }

}, 'Static');

Class(function DynamicObject(_properties) {
    var prototype = DynamicObject.prototype;

    if (_properties) {
        for (var key in _properties) {
            this[key] = _properties[key];
        }
    }

    //*** Public methods
    if (typeof prototype.tween !== 'undefined') return;
    prototype.tween = function(properties, time, ease, delay, update, complete) {
        if (typeof delay !== 'number') {
            complete = update;
            update = delay;
            delay = 0;
        }
        this.stopTween();
        if (typeof complete !== 'function') complete = null;
        if (typeof update !== 'function') update = null;
        this._tween = TweenManager.tween(this, properties, time, ease, delay, complete, update);
        return this._tween;
    }

    prototype.stopTween = function() {
        var _tween = this._tween;
        if (_tween && _tween.stop) _tween.stop();
    }

    prototype.pause = function() {
        var _tween = this._tween;
        if (_tween && _tween.pause) _tween.pause();
    }

    prototype.resume = function() {
        var _tween = this._tween;
        if (_tween && _tween.resume) _tween.resume();
    }

    prototype.copy = function(pool) {
        var c = pool && pool.get ? pool.get() : new DynamicObject();
        for (var key in this) {
            if (typeof this[key] === 'number') c[key] = this[key];
        }
        return c;
    }

    prototype.copyFrom = function(obj) {
        for (var key in obj) {
            if (typeof obj[key] == 'number') this[key] = obj[key];
        }
    }

    prototype.copyTo = function(obj) {
        for (var key in obj) {
            if (typeof this[key] == 'number') obj[key] = this[key];
        }
    }

    prototype.clear = function() {
        for (var key in this) {
            if (typeof this[key] !== 'function') delete this[key];
        }
        return this;
    }
});

Class(function ObjectPool(_type, _number) {
    Inherit(this, Component);
    var _this = this;
    var _pool = [];

    //*** Constructor
    (function() {
        if (_type) {
            _number = _number || 10;
            _type = _type || Object;
            for (var i = 0; i < _number; i++) {
                _pool.push(new _type());
            }
        }
    })();

    //*** Event handlers

    //*** Public Methods
    this.get = function() {
        return _pool.shift();
    }
    
    this.empty = function() {
        _pool.length = 0;
    }
    
    this.put = function(obj) {
        if (obj) _pool.push(obj);
    }
    
    this.insert = function(array) {
        if (typeof array.push === 'undefined') array = [array];
        for (var i = 0; i < array.length; i++) {
            _pool.push(array[i]);
        }
    }
    
    this.destroy = function() {                
        for (var i = 0; i < _pool.length; i++) {
            if (_pool[i].destroy) _pool[i].destroy();
        }
        
        _pool = null;
        return this._destroy();
    }
}); 

Class(function LinkedList() {
    var prototype = LinkedList.prototype;

    this.length = 0;
    this.first = null;
    this.last = null;
    this.current = null;
    this.prev = null;

    if (typeof prototype.push !== 'undefined') return;
    prototype.push = function(obj) {
        if (!this.first) {
            this.first = obj;
            this.last = obj;
            obj.__prev = obj;
            obj.__next = obj;
        } else {
            obj.__next = this.first;
            obj.__prev = this.last;
            this.last.__next = obj;
            this.last = obj;
        }

        this.length++;
    }

    prototype.remove = function(obj) {
        if (!obj || !obj.__next) return;

        if (this.length <= 1) {
            this.empty();
        } else {
            if (obj == this.first) {
                this.first = obj.__next;
                this.last.__next = this.first;
                this.first.__prev = this.last;
            } else if (obj == this.last) {
                this.last = obj.__prev;
                this.last.__next = this.first;
                this.first.__prev = this.last;
            } else {
                obj.__prev.__next = obj.__next;
                obj.__next.__prev = obj.__prev;
            }

            this.length--;
        }

        obj.__prev = null;
        obj.__next = null;
    }

    prototype.empty = function() {
        this.first = null;
        this.last = null;
        this.current = null;
        this.prev = null;
        this.length = 0;
    }

    prototype.start = function() {
        this.current = this.first;
        this.prev = this.current;
        return this.current;
    }

    prototype.next = function() {
        if (!this.current) return;
        this.current = this.current.__next;
        if (this.length == 1 || this.prev.__next == this.first) return;
        this.prev = this.current;
        return this.current;
    }

    prototype.destroy = function() {
        Utils.nullObject(this);
        return null;
    }

});

Class(function Pact() {
    var _this = this;
    Namespace(this);

    //*** Constructor
    (function() {
        
    })();

    //*** Event handlers

    //*** Public Methods
    this.create = function() {
        return new _this.Broadcaster(arguments);
    }
    
    this.batch = function() {
        return new _this.Batch();
    }
    
}, 'Static'); 

Pact.Class(function Broadcaster(_arguments) {
    var _this = this;
    var _success, _error;
    var _fired;
    var _callbacks = [];
        
    this._fire = this.fire = function() {
        if (_fired) return;
        _fired = true;
        
        var args = arguments;
        var fired = false;
        Render.nextFrame(function() {
            if (_error || _success) {
                var arg0 = args[0];
                var arg1 = args[1];
                
                if (arg0 instanceof Error) {
                    if (_error) _error.apply(_this, [arg0]);
                    fired = true;
                } else if (arg1 instanceof Error) {
                    if (_error) _error.apply(_this, [arg1]);
                    fired = true;
                } else {
                    if (!arg0 && arg1 && _success) {
                        _success.apply(_this, [arg1]);
                        fired = true;
                    }
                    if (!arg1 && arg0 && _success) {
                        _success.apply(_this, [arg0]);
                        fired = true;
                    }
                }
            }
            
            if (!fired && _callbacks.length) {
                var callback = _callbacks.shift();
                callback.apply(_this, args);
                if (_callbacks.length) _fired = false;
            }
        });
    }
    
    this.exec = function() {
        exec(arguments);
        return this;
    }
    
    this.then = function(callback) {
        _callbacks.push(callback);
        return this;
    }
    
    this.error = function(error) {
        _error = error;
        return this;
    }
    
    this.success = function(success) {
        _success = success;
        return this;
    }
        
    function exec(argz) {
        var args = [];
        var fn = argz[0];
        for (var i = 1; i < argz.length; i++) args.push(argz[i]);
        args.push(_this._fire);
        fn.apply(fn, args);
    }
    
    if (_arguments.length) exec(_arguments);
});

Pact.Class(function Batch() {
    Inherit(this, Events);
    var _this = this;
    var _count = 0;
    
    var _complete = [];
    var _success = [];
    var _error = [];
    
    var _emitters = [];
    
    this.push = function(emitter) {
        emitter.then(thenHandler).error(errorHandler).success(successHandler);
        _emitters.push(emitter);
    }

    this.timeout = function() {
        _this.events.fire(HydraEvents.COMPLETE, {complete: _complete, success: _success, error: _error});
    }
    
    function successHandler() {
        this.data = arguments;
        _success.push(this);
        checkComplete();
        _this.events.fire(HydraEvents.UPDATE);
    }
    
    function errorHandler() {
        this.data = arguments;
        _error.push(this);
        checkComplete();
        _this.events.fire(HydraEvents.UPDATE);
    }
    
    function thenHandler() {
        this.data = arguments;
        _complete.push(this);
        checkComplete();
        _this.events.fire(HydraEvents.UPDATE);
    }
    
    function checkComplete() {
        _count++;
        if (_count == _emitters.length) {
            _this.events.fire(HydraEvents.COMPLETE, {complete: _complete, success: _success, error: _error});
        }
    }
});


Class(function Mouse() {
    var _this = this;
    var _capturing;

    this.x = 0;
    this.y = 0;
    this.autoPreventClicks = false;

    function moved(e) {
        _this.ready = true;
        if (e.windowsPointer) {
            _this.x = e.x;
            _this.y = e.y;
        } else {
            var convert = Utils.touchEvent(e);
            _this.x = convert.x;
            _this.y = convert.y;
        }
    }

    this.capture = function(x, y) {
        if (_capturing) return false;
        _capturing = true;
        _this.x = x || 0;
        _this.y = y || 0;
        if (!Device.mobile) {
            __window.bind('mousemove', moved);
        } else {
            __window.bind('touchmove', moved);
            __window.bind('touchstart', moved);
        }
    }

    this.stop = function() {
        if (!_capturing) return false;
        _capturing = false;
        _this.x = 0;
        _this.y = 0;
        if (!Device.mobile) {
            __window.unbind('mousemove', moved);
        } else {
            __window.unbind('touchmove', moved);
            __window.unbind('touchstart', moved);
        }
    }

    this.preventClicks = function() {
        _this._preventClicks = true;
        _this.delayedCall(function() {
            _this._preventClicks = false;
        }, 500);
    }

    this.preventFireAfterClick = function() {
        _this._preventFire = true;
    }
}, 'Static');

Class(function Render() {
    var _this = this;
    var _timer, _last, _timerName;

    var _render = [];

    var _time = Date.now();
    var _list0 = new LinkedList();
    var _list1 = new LinkedList();
    var _list = _list0;
    var _timeSinceRender = 0;

    this.TIME = Date.now();
    this.TARGET_FPS = 60;
        
    (function() {
        //*** Kick off the chain
        if (!THREAD) {
            requestAnimationFrame(render);
            Hydra.ready(addListeners);
        }
    })();

    function render() {
        var t = Date.now();
        var timeSinceLoad = t - _time;
        var diff = 0;
        var fps = 60;
        
        if (_last) {
            diff = t - _last;
            fps = 1000 / diff;
        }
        
        _last = t;
        _this.FPS = fps;
        _this.TIME = t;
        _this.DELTA = diff;
        
        for (var i = _render.length-1; i > -1; i--) {
            var callback = _render[i];
            if (callback.fps) {
                _timeSinceRender += diff > 200 ? 0 : diff;
                if (_timeSinceRender < (1000 / callback.fps)) continue;
                _timeSinceRender -= (1000 / callback.fps);
            }
            callback(t, timeSinceLoad, diff, fps, callback.frameCount++);
        }
        
        if (_list.length) fireCallbacks();
        
        requestAnimationFrame(render);
    }
    
    function fireCallbacks() {
        var list = _list;
        _list = _list == _list0 ? _list1 : _list0;
    	var callback = list.start();
    	while (callback) {
            var last = callback;
            callback();
    		callback = list.next();
            last.__prev = last.__next = last = null;
    	}
    	
    	list.empty();
    }

    function addListeners() {
        HydraEvents._addEvent(HydraEvents.BROWSER_FOCUS, focus, _this);
    }

    function focus(e) {
        if (e.type == 'focus') {
           _last = Date.now();
        }
    }
    
    this.startRender = this.start = function(callback, fps) {
        var allowed = true;
        var count = _render.length-1;
        if (this.TARGET_FPS < 60) fps = this.TARGET_FPS;
        if (typeof fps == 'number') callback.fps = fps;
        callback.frameCount = 0;
        if (_render.indexOf(callback) == -1) _render.push(callback);
    }
    
    this.stopRender = this.stop = function(callback) {
        var i = _render.indexOf(callback);
        if (i > -1) _render.splice(i, 1);
    }

    this.startTimer = function(name) {
        _timerName = name || 'Timer';
        if (console.time && !window._NODE_) console.time(_timerName);
        else _timer = Date.now();
    }
    
    this.stopTimer = function() {
        if (console.time && !window._NODE_) console.timeEnd(_timerName);
        else console.log('Render '+_timerName+': '+(Date.now() - _timer));
    }
    
    this.nextFrame = function(callback) {
		_list.push(callback);
    }
    
    this.setupTween = function(callback) {
        _this.nextFrame(function() {
            _this.nextFrame(callback);
        });
    }

    window.defer = this.nextFrame;
}, 'Static');

Class(function HydraEvents() {
    var _events = [];
    var _e = {};
    
    this.BROWSER_FOCUS = 'hydra_focus';
    this.HASH_UPDATE = 'hydra_hash_update';
    this.COMPLETE = 'hydra_complete';
    this.PROGRESS = 'hydra_progress';
    this.UPDATE = 'hydra_update';
    this.LOADED = 'hydra_loaded';
    this.END = 'hydra_end';
    this.FAIL = 'hydra_fail';
    this.SELECT = 'hydra_select';
    this.ERROR = 'hydra_error';
    this.READY = 'hydra_ready';
    this.RESIZE = 'hydra_resize';
    this.CLICK = 'hydra_click';
    this.HOVER = 'hydra_hover';
    this.MESSAGE = 'hydra_message';
    this.ORIENTATION = 'orientation';
    this.BACKGROUND = 'background';
    this.BACK = 'hydra_back';
    this.PREVIOUS = 'hydra_previous';
    this.NEXT = 'hydra_next';
    this.RELOAD = 'hydra_reload';
    this.FULLSCREEN = 'hydra_fullscreen';
    
    this._checkDefinition = function(evt) {
        if (typeof evt == 'undefined') {
            throw 'Undefined event';
        }
    }
        
    this._addEvent = function(e, callback, object) {
        if (this._checkDefinition) this._checkDefinition(e);
        var add = new Object();
        add.evt = e;
        add.object = object;
        add.callback = callback;
        _events.push(add);      
    }
    
    this._removeEvent = function(eventString, callback) {
        if (this._checkDefinition) this._checkDefinition(eventString);
        defer(function() {
            for (var i = _events.length - 1; i > -1; i--) {
                if (_events[i].evt == eventString && _events[i].callback == callback) {
                    _events[i] = null;
                    _events.splice(i, 1);
                }
            }
        });
    }
    
    this._destroyEvents = function(object) {
        for (var i = _events.length-1; i > -1; i--) {
            if (_events[i].object == object) {
                _events[i] = null;
                _events.splice(i, 1);
            }
        }
    }
    
    this._fireEvent = function(eventString, obj) {
        if (this._checkDefinition) this._checkDefinition(eventString);
        var fire = true;
        obj = obj || _e;
        obj.cancel = function() {
            fire = false;
        };

        for (var i = 0; i < _events.length; i++) {
            if (_events[i].evt == eventString) {
                if (fire) _events[i].callback(obj);
                else return false;
            }
        }
    }
    
    this._consoleEvents = function() {
        console.log(_events);
    }
    
    this.createLocalEmitter = function(child) {
        var events = new HydraEvents();
        child.on = events._addEvent;
        child.off = events._removeEvent;
        child.fire = events._fireEvent;
    }
}, 'Static');

Class(function Events(_this) {
    this.events = {};
    var _events = {};
    var _e = {};
    
    this.events.subscribe = function(evt, callback) {
        HydraEvents._addEvent(evt, !!callback._fire ? callback._fire : callback, _this);
        return callback;
    }
    
    this.events.unsubscribe = function(evt, callback) {
        HydraEvents._removeEvent(evt, !!callback._fire ? callback._fire : callback);
    }
    
    this.events.fire = function(evt, obj, skip) {
        obj = obj || _e;
        HydraEvents._checkDefinition(evt);
        if (_events[evt]) {
            obj.target = obj.target || _this;
            _events[evt](obj);
            obj.target = null;
        } else {
            if (!skip) HydraEvents._fireEvent(evt, obj);
        }
    }
    
    this.events.add = function(evt, callback) {
        HydraEvents._checkDefinition(evt);
        _events[evt] = !!callback._fire ? callback._fire : callback;
        return callback;
    }
    
    this.events.remove = function(evt) {
        HydraEvents._checkDefinition(evt);
        if (_events[evt]) delete _events[evt];
    }
    
    this.events.bubble = function(object, evt) {
        HydraEvents._checkDefinition(evt);
        var _this = this;
        object.events.add(evt, function(e) {
           _this.fire(evt, e);
        });
    }
    
    this.events.scope = function(ref) {
        _this = ref;
    }
    
    this.events.destroy = function() {
        HydraEvents._destroyEvents(_this);
        _events = null;
        _this = null;
        return null;
    }
});

Class(function Mobile() {
    Inherit(this, Component);
    var _this = this;
    var _lastTime;
    var _cancelScroll = true;
    var _scrollTarget = {};
    var _hideNav, _iMax, _iFull, _iLock, _iLast, _orientationPrevent, _type;

    this.sleepTime = 10000;
    this.scrollTop = 0;
    this.autoResizeReload = true;

    if (Device.mobile) {
        for (var b in Device.browser) {
            Device.browser[b] = false;
        }

        setInterval(checkTime, 250);
        this.phone = Device.mobile.phone;
        this.tablet = Device.mobile.tablet;

        this.orientation = Math.abs(window.orientation) == 90 ? 'landscape' : 'portrait';

        this.os = (function() {
            if (Device.detect('windows', 'iemobile')) return 'Windows';
            if (Device.detect(['ipad', 'iphone'])) return 'iOS';
            if (Device.detect(['android', 'kindle'])) return 'Android';
            if (Device.detect('blackberry')) return 'Blackberry';
            return 'Unknown';
        })();

        this.version = (function() {
            try {
                if (_this.os == 'iOS') {
                    var num = Device.agent.split('os ')[1].split('_');
                    var main = num[0];
                    var sub = num[1].split(' ')[0];
                    return Number(main + '.' + sub);
                }
                if (_this.os == 'Android') {
                    var version = Device.agent.split('android ')[1].split(';')[0];
                    if (version.length > 3) version = version.slice(0, -2);
                    return Number(version);
                }
                if (_this.os == 'Windows') {
                    if (Device.agent.strpos('rv:11')) return 11;
                    return Number(Device.agent.split('windows phone ')[1].split(';')[0]);
                }
            } catch(e) { }
            return -1;
        })();

        this.browser = (function() {
            if (_this.os == 'iOS') {
                if (Device.detect('crios')) return 'Chrome';
                if (Device.detect('safari')) return 'Safari';
                return 'Unknown';
            }
            if (_this.os == 'Android') {
                if (Device.detect('chrome')) return 'Chrome';
                if (Device.detect('firefox')) return 'Firefox';
                return 'Browser';
            }
            if (_this.os == 'Windows') return 'IE';
            return 'Unknown';
        })();

        Hydra.ready(function() {
            //window.addEventListener('orientationchange', orientationChange);
            window.onresize = resizeHandler;
            if (_this.browser == 'Safari' && (!_this.NativeCore || !_this.NativeCore.active)) {
                document.body.scrollTop = 0;
                __body.css({height: '101%'});
            }

            Stage.width = document.body.clientWidth;
            Stage.height = document.body.clientHeight;

            _this.orientation = Stage.width > Stage.height ? 'landscape' : 'portrait';

            if (!(_this.NativeCore && _this.NativeCore.active)) {
                window.addEventListener('touchstart', touchStart);
            } else {
                Stage.css({overflow: 'hidden'});
            }

            determineType();

            _type = _this.phone ? 'phone' : 'tablet';

            if (_this.os == 'Android') _this.delayedCall(resizeHandler, 50);
        });

        function determineType() {
            Device.mobile.tablet = (function() {
                if (Stage.width > Stage.height) return document.body.clientWidth > 900;
                else return document.body.clientHeight > 900;
            })();

            Device.mobile.phone = !Device.mobile.tablet;

            _this.phone = Device.mobile.phone;
            _this.tablet = Device.mobile.tablet;
        }

        function resizeHandler() {
            clearTimeout(_this.fireResize);
            if (!_this.allowScroll) document.body.scrollTop = 0;
            _this.fireResize = _this.delayedCall(function() {
                Stage.width = document.body.clientWidth;
                Stage.height = document.body.clientHeight;

                determineType();

                var type = _this.phone ? 'phone' : 'tablet';
                if (_this.os == 'iOS' && type != _type && _this.autoResizeReload) window.location.reload();

                _this.orientation = Stage.width > Stage.height ? 'landscape' : 'portrait';
                _this.events.fire(HydraEvents.RESIZE);
            }, 100);
        }

        function orientationChange() {
            _this.delayedCall(function() {
                Stage.width = document.body.clientWidth;
                Stage.height = document.body.clientHeight;
                HydraEvents._fireEvent(HydraEvents.ORIENTATION, {orientation: _this.orientation});
            }, 100);

            if (_this.tablet && _this.browser == 'Chrome' && _iMax) _iMax = document.body.clientHeight;

            if (_this.phone && _iMax) {
                _iMax = Stage.height;
                if (_this.orientation == 'portrait' && _this.browser == 'Safari') {
                    _iFull = false;
                    document.body.scrollTop = 0;
                    checkHeight(true);

                    _orientationPrevent = true;
                    _this.delayedCall(function() {
                        _orientationPrevent = false;
                    }, 100);
                }
            }
        }

        function touchStart(e) {
            var touch = Utils.touchEvent(e);
            var target = e.target;
            var inputElement = target.nodeName == 'INPUT' || target.nodeName == 'TEXTAREA' || target.nodeName == 'SELECT' || target.nodeName == 'A';

            if (_this.allowScroll || inputElement) return;

            if (_iMax) {
                if (!_iFull) return;
                if (_this.browser == 'Chrome' && touch.y < 50) {
                    e.stopPropagation();
                    return;
                }
            }

            if (_cancelScroll) return e.preventDefault();

            var prevent = true;
            target = e.target;
            while (target.parentNode) {
                if (target._scrollParent) {
                    prevent = false;
                    _scrollTarget.target = target;
                    _scrollTarget.y = touch.y;
                }
                target = target.parentNode;
            }

            if (prevent) e.preventDefault();
        }
    }

    function checkTime() {
        var time = Date.now();
        if (_lastTime) {
            if (time - _lastTime > _this.sleepTime) {
                _this.events.fire(HydraEvents.BACKGROUND);
            }
        }
        _lastTime = time;
    }

    function initIOSFullscreen() {
        _hideNav = true;
        _cancelScroll = false;
        _iMax = Stage.height;
        __body.css({height: Stage.height * 3});
        Stage.css({position: 'fixed'});
        __window.bind('scroll', scrollHandler);

        setInterval(checkHeight, 1000);
    }

    function scrollHandler(e) {
        if (_orientationPrevent) return;
        Stage.width = document.body.clientWidth;
        Stage.height = document.body.clientHeight;

        _this.scrollTop = document.body.scrollTop;
        if (Stage.height != _iLast) _this.events.fire(HydraEvents.RESIZE);
        _iLast = Stage.height;

        if (_this.scrollTop > 20) {
            if (!_iFull) _this.events.fire(HydraEvents.FULLSCREEN, {fullscreen: true});
            _iFull = true;

            clearTimeout(_this.changeHeight);
            _this.changeHeight = _this.delayedCall(function() {
                _iMax = Stage.height;
            }, 100);
        }

        checkHeight();
    }

    function checkHeight(force) {
        if ((document.body.clientHeight < _iMax && _iFull) || force) {
            Stage.height = document.body.clientHeight;
            _iFull = false;
            _iMax = Stage.height;
            document.body.scrollTop = 0;
            resizeHandler();
            _this.events.fire(HydraEvents.FULLSCREEN, {fullscreen: false});
        }
    }


    //*** Public Methods
    this.Class = window.Class;

    this.fullscreen = function() {
        if (_this.NativeCore && _this.NativeCore.active) return;

        if (_this.os == 'Android') {
            __window.bind('touchstart', function() {
                Device.openFullscreen();
            });
            return true;
        } else if (_this.os == 'iOS' && _this.version >= 7) {
            if (_this.browser == 'Chrome' || _this.browser == 'Safari') {
                initIOSFullscreen();
                return true;
            }
        }

        return false;
    }

    this.overflowScroll = function($object, dir) {
        if (!Device.mobile) return false;
        var x = !!dir.x;
        var y = !!dir.y;

        var overflow = {'-webkit-overflow-scrolling': 'touch'};
        if ((!x && !y) || (x && y)) overflow.overflow = 'scroll';
        if (!x && y) {
            overflow.overflowY = 'scroll';
            overflow.overflowX = 'hidden';
        }
        if (x && !y) {
            overflow.overflowX = 'scroll';
            overflow.overflowY = 'hidden';
        }
        $object.css(overflow);

        $object.div._scrollParent = true;
        _cancelScroll = false;

        $object.div._preventEvent = function(e) {
            e.stopPropagation();
        }

        $object.div.addEventListener('touchmove', $object.div._preventEvent);
    }

    this.removeOverflowScroll = function($object) {
        $object.css({overflow: 'hidden', overflowX: '', overflowY: '', '-webkit-overflow-scrolling': ''});
        $object.div.removeEventListener('touchmove', $object.div._preventEvent);
    }

    this.setOrientation = function(type) {
        if (_this.System && _this.NativeCore.active) {
            _this.System.orientation = _this.System[type.toUpperCase()];
            return;
        }

        if (window.screen) {
            if (window.screen.lockOrientation) {
                if (type == 'landscape') window.screen.lockOrientation('landscape-primary', 'landscape-secondary');
                else window.screen.lockOrientation('portrait-primary', 'portrait-secondary');
            }

            if (window.screen.orientation) {
                if (type == 'landscape') window.screen.orientation.lock('landscape-primary', 'landscape-secondary');
                else window.screen.orientation.lock('portrait-primary', 'portrait-secondary');
            }
        }
    }

    this.isNative = function() {
        return _this.NativeCore && _this.NativeCore.active;
    }
}, 'Static');

Class(function Modules() {
    var _this = this;

    var _modules = {};

    //*** Constructor
    (function () {
        defer(exec);
    })();

    function exec() {
        for (var m in _modules) {
            for (var key in _modules[m]) {
                var module = _modules[m][key];
                if (module._ready) continue;

                module._ready = true;
                if (module.exec) module.exec();
            }
        }
    }

    function requireModule(root, path) {
        var module = _modules[root][path];
        if (!module._ready) {
            module._ready = true;
            if (module.exec) module.exec();
        }

        return module;
    }

    //*** Event handlers

    //*** Public methods
    this.push = function(module) {

    }

    this.Module = function(module) {
        var m = new module();

        var name = module.toString().slice(0, 100).match(/function ([^\(]+)/);

        if (name) {
            m._ready = true;
            name = name[1];
            _modules[name] = {index: m};
        } else {
            if (!_modules[m.module]) _modules[m.module] = {};
            _modules[m.module][m.path] = m;
        }
    }

    this.require = function(path) {
        var root;
        if (!path.strpos('/')) {
            root = path;
            path = 'index';
        } else {
            root = path.split('/')[0];
            path = path.replace(root+'/', '');
        }

        return requireModule(root, path).exports;
    }

    window.Module = this.Module;

    if (!window._NODE_) {
        window.requireNative = window.require;
        window.require = this.require;
    }
}, 'Static');

Class(function Timer() {
    var _this = this;
    var _clearTimeout;

    var _callbacks = [];

    //*** Constructor
    (function () {
        Render.start(loop);
    })();

    function loop(t, tsl, delta) {
        for (var i = 0; i < _callbacks.length; i++) {
            var c = _callbacks[i];
            c.current += delta;
            if (c.current >= c.time) {
                c();
                _callbacks.findAndRemove(c);
            }
        }
    }

    function find(ref) {
        for (var i = _callbacks.length-1; i > -1; i--) {
            var c = _callbacks[i];
            if (c.ref == ref) return c;
        }
    }

    //*** Event handlers

    //*** Public methods
    _clearTimeout = window.clearTimeout;
    window.clearTimeout = function(ref) {
        var c = find(ref);
        if (c) {
            _callbacks.findAndRemove(c);
        } else {
            _clearTimeout(ref);
        }
    }

    this.create = function(callback, time) {
        callback.time = time;
        callback.current = 0;
        callback.ref = Utils.timestamp();
        _callbacks.push(callback);
        return callback.ref;
    }
}, 'static');

Class(function Color(_value) {
    Inherit(this, Component);
    var _this = this;
    var _hsl, _array;
    
    this.r = 1;
    this.g = 1;
    this.b = 1;

    //*** Constructor
    (function() {
        set(_value);
    })();

    function set(value) {
        if (value instanceof Color) {
            copy(value);
        } else if (typeof value === 'number') {
            setHex(value);
        } else if (Array.isArray(value)) {
            setRGB(value);
        } else {
            setHex(Number("0x" + value.slice(1)));
        }
    }
    
    function copy(color) {
        _this.r = color.r;
        _this.g = color.g;
        _this.b = color.b;
    }
    
    function setHex(hex) {
        hex = Math.floor(hex);

        _this.r = (hex >> 16 & 255) / 255;
        _this.g = (hex >> 8 & 255) / 255;
        _this.b = (hex & 255) / 255;
    }

    function setRGB(values) {
        _this.r = values[0];
        _this.g = values[1];
        _this.b = values[2];
    }
    
    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
        return p;
    }
    
    //*** Event handlers

    //*** Public Methods
    this.set = function(value) {
        set(value);
        return this;
    }
    
    this.setRGB = function(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
        return this;
    }
    
    this.setHSL = function(h, s, l) {
        if (s === 0) {
            this.r = this.g = this.b = l;
        } else {
            var p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
            var q = (2 * l) - p;

            this.r = hue2rgb(q, p, h + 1 / 3);
            this.g = hue2rgb(q, p, h);
            this.b = hue2rgb(q, p, h - 1 / 3);
        }

        return this;
    }

    this.offsetHSL = function(h, s, l) {
        var hsl = this.getHSL();
        hsl.h += h;
        hsl.s += s;
        hsl.l += l;

        this.setHSL(hsl.h, hsl.s, hsl.l);
        return this;
    }
    
    this.getStyle = function() {
        return 'rgb(' + ( ( this.r * 255 ) | 0 ) + ',' + ( ( this.g * 255 ) | 0 ) + ',' + ( ( this.b * 255 ) | 0 ) + ')';
    }
    
    this.getHex = function() {
        return ( this.r * 255 ) << 16 ^ ( this.g * 255 ) << 8 ^ ( this.b * 255 ) << 0;
    }
    
    this.getHexString = function() {
        return '#' + ( '000000' + this.getHex().toString( 16 ) ).slice( - 6 );
    }

    this.getHSL = function() {
        _hsl = _hsl || { h: 0, s: 0, l: 0 };
        var hsl = _hsl;

        var r = this.r, g = this.g, b = this.b;

        var max = Math.max( r, g, b );
        var min = Math.min( r, g, b );

        var hue, saturation;
        var lightness = ( min + max ) / 2.0;

        if ( min === max ) {

            hue = 0;
            saturation = 0;

        } else {

            var delta = max - min;

            saturation = lightness <= 0.5 ? delta / ( max + min ) : delta / ( 2 - max - min );

            switch ( max ) {

                case r: hue = ( g - b ) / delta + ( g < b ? 6 : 0 ); break;
                case g: hue = ( b - r ) / delta + 2; break;
                case b: hue = ( r - g ) / delta + 4; break;

            }

            hue /= 6;

        }

        hsl.h = hue;
        hsl.s = saturation;
        hsl.l = lightness;

        return hsl;
    }
    
    this.add = function(color) {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b;
    }
    
    this.mix = function(color, percent) {
        this.r = this.r * (1 - percent) + (color.r * percent);
        this.g = this.g * (1 - percent) + (color.g * percent);
        this.b = this.b * (1 - percent) + (color.b * percent);
    }
    
    this.addScalar = function(s) {
        this.r += s;
        this.g += s;
        this.b += s;
    }
    
    this.multiply = function(color) {
        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;
    }
    
    this.multiplyScalar = function(s) {
        this.r *= s;
        this.g *= s;
        this.b *= s;
    }
    
    this.clone = function() {
        return new Color([this.r, this.g, this.b]);
    }

    this.toArray = function() {
        if (!_array) _array = [];
        _array[0] = this.r;
        _array[1] = this.g;
        _array[2] = this.b;

        return _array;
    }
}); 

Class(function Noise() {

    var module = this;

    function Grad(x, y, z) {
        this.x = x; this.y = y; this.z = z;
    }

    Grad.prototype.dot2 = function(x, y) {
        return this.x*x + this.y*y;
    };

    Grad.prototype.dot3 = function(x, y, z) {
        return this.x*x + this.y*y + this.z*z;
    };

    var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
        new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
        new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];

    var p = [151,160,137,91,90,15,
        131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
        190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
        88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
        77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
        102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
        135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
        5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
        223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
        129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
        251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
        49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
        138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    // To remove the need for index wrapping, double the permutation table length
    var perm = new Array(512);
    var gradP = new Array(512);

    // This isn't a very good seeding function, but it works ok. It supports 2^16
    // different seed values. Write something better if you need more seeds.
    module.seed = function(seed) {
        if(seed > 0 && seed < 1) {
            // Scale the seed out
            seed *= 65536;
        }

        seed = Math.floor(seed);
        if(seed < 256) {
            seed |= seed << 8;
        }

        for(var i = 0; i < 256; i++) {
            var v;
            if (i & 1) {
                v = p[i] ^ (seed & 255);
            } else {
                v = p[i] ^ ((seed>>8) & 255);
            }

            perm[i] = perm[i + 256] = v;
            gradP[i] = gradP[i + 256] = grad3[v % 12];
        }
    };

    module.seed(0);

    /*
     for(var i=0; i<256; i++) {
     perm[i] = perm[i + 256] = p[i];
     gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
     }*/

    // Skewing and unskewing factors for 2, 3, and 4 dimensions
    var F2 = 0.5*(Math.sqrt(3)-1);
    var G2 = (3-Math.sqrt(3))/6;

    var F3 = 1/3;
    var G3 = 1/6;

    // 2D simplex noise
    module.simplex2 = function(xin, yin) {
        var n0, n1, n2; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        var s = (xin+yin)*F2; // Hairy factor for 2D
        var i = Math.floor(xin+s);
        var j = Math.floor(yin+s);
        var t = (i+j)*G2;
        var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
        var y0 = yin-j+t;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
            i1=1; j1=0;
        } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
            i1=0; j1=1;
        }
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1 + 2 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        i &= 255;
        j &= 255;
        var gi0 = gradP[i+perm[j]];
        var gi1 = gradP[i+i1+perm[j+j1]];
        var gi2 = gradP[i+1+perm[j+1]];
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0*x0-y0*y0;
        if(t0<0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1*x1-y1*y1;
        if(t1<0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot2(x1, y1);
        }
        var t2 = 0.5 - x2*x2-y2*y2;
        if(t2<0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot2(x2, y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70 * (n0 + n1 + n2);
    };

    // 3D simplex noise
    module.simplex3 = function(xin, yin, zin) {
        var n0, n1, n2, n3; // Noise contributions from the four corners

        // Skew the input space to determine which simplex cell we're in
        var s = (xin+yin+zin)*F3; // Hairy factor for 2D
        var i = Math.floor(xin+s);
        var j = Math.floor(yin+s);
        var k = Math.floor(zin+s);

        var t = (i+j+k)*G3;
        var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
        var y0 = yin-j+t;
        var z0 = zin-k+t;

        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if(x0 >= y0) {
            if(y0 >= z0)      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
            else if(x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
            else              { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
        } else {
            if(y0 < z0)      { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
            else if(x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
            else             { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        var x1 = x0 - i1 + G3; // Offsets for second corner
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;

        var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
        var y2 = y0 - j2 + 2 * G3;
        var z2 = z0 - k2 + 2 * G3;

        var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
        var y3 = y0 - 1 + 3 * G3;
        var z3 = z0 - 1 + 3 * G3;

        // Work out the hashed gradient indices of the four simplex corners
        i &= 255;
        j &= 255;
        k &= 255;
        var gi0 = gradP[i+   perm[j+   perm[k   ]]];
        var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
        var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
        var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];

        // Calculate the contribution from the four corners
        var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
        if(t0<0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
        if(t1<0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
        }
        var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
        if(t2<0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
        }
        var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
        if(t3<0) {
            n3 = 0;
        } else {
            t3 *= t3;
            n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 32 * (n0 + n1 + n2 + n3);

    };

    // ##### Perlin noise stuff

    function fade(t) {
        return t*t*t*(t*(t*6-15)+10);
    }

    function lerp(a, b, t) {
        return (1-t)*a + t*b;
    }

    module.perlin = function(x) {
        return module.perlin2(x, 0);
    }

    // 2D Perlin Noise
    module.perlin2 = function(x, y) {
        // Find unit grid cell containing point
        var X = Math.floor(x), Y = Math.floor(y);
        // Get relative xy coordinates of point within that cell
        x = x - X; y = y - Y;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255; Y = Y & 255;

        // Calculate noise contributions from each of the four corners
        var n00 = gradP[X+perm[Y]].dot2(x, y);
        var n01 = gradP[X+perm[Y+1]].dot2(x, y-1);
        var n10 = gradP[X+1+perm[Y]].dot2(x-1, y);
        var n11 = gradP[X+1+perm[Y+1]].dot2(x-1, y-1);

        // Compute the fade curve value for x
        var u = fade(x);

        // Interpolate the four results
        return lerp(
            lerp(n00, n10, u),
            lerp(n01, n11, u),
            fade(y));
    };

    // 3D Perlin Noise
    module.perlin3 = function(x, y, z) {
        // Find unit grid cell containing point
        var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
        // Get relative xyz coordinates of point within that cell
        x = x - X; y = y - Y; z = z - Z;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255; Y = Y & 255; Z = Z & 255;

        // Calculate noise contributions from each of the eight corners
        var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
        var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
        var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
        var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
        var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
        var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
        var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
        var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);

        // Compute the fade curve value for x, y, z
        var u = fade(x);
        var v = fade(y);
        var w = fade(z);

        // Interpolate
        return lerp(
            lerp(
                lerp(n000, n100, u),
                lerp(n001, n101, u), w),
            lerp(
                lerp(n010, n110, u),
                lerp(n011, n111, u), w),
            v);
    };

}, 'Static');

Class(function Matrix2() {
    var _this = this;
    var prototype = Matrix2.prototype;
    
    var a11, a12, a13, a21, a22, a23, a31, a32, a33;
    var b11, b12, b13, b21, b22, b23, b31, b32, b33;
    
    this.type = 'matrix2';
    this.data = new Float32Array(9);

    //*** Constructor
    (function() {
        identity();
    })();
    
    function identity(d) {
        d = d || _this.data;
        d[0] = 1,d[1] = 0,d[2] = 0;
        d[3] = 0,d[4] = 1,d[5] = 0;
        d[6] = 0,d[7] = 0,d[8] = 1;
    }
    
    function noE(n) {
        n = Math.abs(n) < 0.000001 ? 0 : n;
        return n;
    }

    //*** Event handlers

    //*** Public Methods
    if (typeof prototype.identity !== 'undefined') return;
    prototype.identity = function(d) {
        identity(d);
        return this;
    }
    
    prototype.transformVector = function(v) {
        var d = this.data;
        var x = v.x;
        var y = v.y;
        v.x = d[0] * x + d[1] * y + d[2];
        v.y = d[3] * x + d[4] * y + d[5];
        return v;
    }
    
    prototype.setTranslation = function(tx, ty, m) {
        var d = m || this.data;
        d[0] = 1,d[1] = 0,d[2] = tx;
        d[3] = 0,d[4] = 1,d[5] = ty;
        d[6] = 0,d[7] = 0,d[8] = 1;
        return this;
    }
    
    prototype.getTranslation = function(v) {
        var d = this.data;
        v = v || new Vector2();
        v.x = d[2];
        v.y = d[5];
        return v;
    }
    
    prototype.setScale = function(sx, sy, m) {
        var d = m || this.data;
        d[0] = sx,d[1] = 0,d[2] = 0;
        d[3] = 0,d[4] = sy,d[5] = 0;
        d[6] = 0,d[7] = 0,d[8] = 1;
        return this;
    }
    
    prototype.setShear = function(sx, sy, m) {
        var d = m || this.data;
        d[0] = 1,d[1] = sx,d[2] = 0;
        d[3] = sy,d[4] = 1,d[5] = 0;
        d[6] = 0,d[7] = 0,d[8] = 1;
        return this;
    }
    
    prototype.setRotation = function(a, m) {
        var d = m || this.data;
        var r0 = Math.cos(a);
        var r1 = Math.sin(a);
        d[0] = r0,d[1] = -r1,d[2] = 0;
        d[3] = r1,d[4] = r0,d[5] = 0;
        d[6] = 0,d[7] = 0,d[8] = 1;
        return this;
    }
    
    prototype.setTRS = function(tx, ty, a, sx, sy) {
        var d = this.data;
        var r0 = Math.cos(a);
        var r1 = Math.sin(a);
        d[0] = r0 * sx,d[1] = -r1 * sy,d[2] = tx;
        d[3] = r1 * sx,d[4] = r0 * sy,d[5] = ty;
        d[6] = 0,d[7] = 0,d[8] = 1;
        return this;
    }
    
    prototype.translate = function(tx, ty) {
        this.identity(Matrix2.__TEMP__);
        this.setTranslation(tx, ty, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__);
    }
    
    prototype.rotate = function(a) {
        this.identity(Matrix2.__TEMP__);
        this.setTranslation(a, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__);
    }
    
    prototype.scale = function(sx, sy) {
        this.identity(Matrix2.__TEMP__);
        this.setScale(sx, sy, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__);
    }
    
    prototype.shear = function(sx, sy) {
        this.identity(Matrix2.__TEMP__);
        this.setRotation(sx, sy, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__);
    }
    
    prototype.multiply = function(m) {
        var a = this.data;
        var b = m.data || m;
        
        a11 = a[0],a12 = a[1],a13 = a[2];
        a21 = a[3],a22 = a[4],a23 = a[5];
        a31 = a[6],a32 = a[7],a33 = a[8];

        b11 = b[0],b12 = b[1],b13 = b[2];
        b21 = b[3],b22 = b[4],b23 = b[5];
        b31 = b[6],b32 = b[7],b33 = b[8];

        a[0] = a11 * b11 + a12 * b21 + a13 * b31;
        a[1] = a11 * b12 + a12 * b22 + a13 * b32;
        a[2] = a11 * b13 + a12 * b23 + a13 * b33;

        a[3] = a21 * b11 + a22 * b21 + a23 * b31;
        a[4] = a21 * b12 + a22 * b22 + a23 * b32;
        a[5] = a21 * b13 + a22 * b23 + a23 * b33;
        
        return this;
    }
    
    prototype.inverse = function(m) {
        m = m || this;
        var a = m.data;
        var b = this.data;
        
        a11 = a[0],a12 = a[1],a13 = a[2];
        a21 = a[3],a22 = a[4],a23 = a[5];
        a31 = a[6],a32 = a[7],a33 = a[8];
        
        var det = m.determinant();
        
        if (Math.abs(det) < 0.0000001) {
            //console.warn("Attempt to inverse a singular Matrix2. ", m.data);
            //console.trace();
            //return m;
        }
        
        var invdet = 1 / det;
        
        b[0] = (a22 * a33 - a32 * a23) * invdet;
        b[1] = (a13 * a32 - a12 * a33) * invdet;
        b[2] = (a12 * a23 - a13 * a22) * invdet;
        b[3] = (a23 * a31 - a21 * a33) * invdet;
        b[4] = (a11 * a33 - a13 * a31) * invdet;
        b[5] = (a21 * a13 - a11 * a23) * invdet;
        b[6] = (a21 * a32 - a31 * a22) * invdet;
        b[7] = (a31 * a12 - a11 * a32) * invdet;
        b[8] = (a11 * a22 - a21 * a12) * invdet;
        
        return m;
    }
    
    prototype.determinant = function() {
        var a = this.data;
        
        a11 = a[0],a12 = a[1],a13 = a[2];
        a21 = a[3],a22 = a[4],a23 = a[5];
        a31 = a[6],a32 = a[7],a33 = a[8];
        
        return a11 * (a22 * a33 - a32 * a23) -
               a12 * (a21 * a33 - a23 * a31) +
               a13 * (a21 * a32 * a22 * a31); 
    }
    
    prototype.copyTo = function(m) {
        var a = this.data;
        var b = m.data || m;
        
        b[0] = a[0],b[1] = a[1],b[2] = a[2];
        b[3] = a[3],b[4] = a[4],b[5] = a[5];
        b[6] = a[6],b[7] = a[7],b[8] = a[8];

        return m;
    }
    
    prototype.copyFrom = function(m) {
        var a = this.data;
        var b = m.data || m;
        
        b[0] = a[0],b[1] = a[1],b[2] = a[2];
        b[3] = a[3],b[4] = a[4],b[5] = a[5];
        b[6] = a[6],b[7] = a[7],b[8] = a[8];

        return this;
    }
    
    prototype.getCSS = function(force2D) {
        var d = this.data;
        if (Device.tween.css3d && !force2D) {
            return 'matrix3d('+noE(d[0])+', '+noE(d[3])+', 0, 0, '+noE(d[1])+', '+noE(d[4])+', 0, 0, 0, 0, 1, 0, '+noE(d[2])+', '+noE(d[5])+', 0, 1)';
        } else {
            return 'matrix('+noE(d[0])+', '+noE(d[3])+', '+noE(d[1])+', '+noE(d[4])+', '+noE(d[2])+', '+noE(d[5])+')';
        }
    }
}, function() {

    Matrix2.__TEMP__ = new Matrix2().data;

});



Class(function Matrix4() {
    var _this = this;
    var prototype = Matrix4.prototype;

    this.type = 'matrix4';
    this.data = new Float32Array(16);

    //*** Constructor
    (function() {
        identity();
    })();

    function identity(m) {
        var d = m || _this.data;
        d[0] = 1,d[4] = 0,d[8] = 0,d[12] = 0;
        d[1] = 0,d[5] = 1,d[9] = 0,d[13] = 0;
        d[2] = 0,d[6] = 0,d[10] = 1,d[14] = 0;
        d[3] = 0,d[7] = 0,d[11] = 0,d[15] = 1;
    }

    function noE(n) {
        return Math.abs(n) < 0.000001 ? 0 : n;
    }

    //*** Public Methods
    if (typeof prototype.identity !== 'undefined') return;
    prototype.identity = function() {
        identity();
        return this;
    }

    prototype.transformVector = function(v, pv) {
        var d = this.data;
        var x = v.x, y = v.y, z = v.z, w = v.w;
        pv = pv || v;

        pv.x = d[0] * x + d[4] * y + d[8] * z + d[12] * w;
        pv.y = d[1] * x + d[5] * y + d[9] * z + d[13] * w;
        pv.z = d[2] * x + d[6] * y + d[10] * z + d[14] * w;

        return pv;
    }

    prototype.multiply = function(m, d) {
        var a = this.data;
        var b = m.data || m;

        var a00, a01, a02, a03, a04, a05, a06, a07, a08, a09, a10, a11, a12, a13, a14, a15;
        var b00, b01, b02, b03, b04, b05, b06, b07, b08, b09, b10, b11, b12, b13, b14, b15;

        a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        a04 = a[4], a05 = a[5], a06 = a[6], a07 = a[7];
        a08 = a[8], a09 = a[9], a10 = a[10], a11 = a[11];
        a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];

        b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
        b04 = b[4], b05 = b[5], b06 = b[6], b07 = b[7];
        b08 = b[8], b09 = b[9], b10 = b[10], b11 = b[11];
        b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

        a[0] = a00 * b00 + a04 * b01 + a08 * b02 + a12 * b03;
        a[1] = a01 * b00 + a05 * b01 + a09 * b02 + a13 * b03;
        a[2] = a02 * b00 + a06 * b01 + a10 * b02 + a14 * b03;
        a[3] = a03 * b00 + a07 * b01 + a11 * b02 + a15 * b03;

        a[4] = a00 * b04 + a04 * b05 + a08 * b06 + a12 * b07;
        a[5] = a01 * b04 + a05 * b05 + a09 * b06 + a13 * b07;
        a[6] = a02 * b04 + a06 * b05 + a10 * b06 + a14 * b07;
        a[7] = a03 * b04 + a07 * b05 + a11 * b06 + a15 * b07;

        a[8] = a00 * b08 + a04 * b09 + a08 * b10 + a12 * b11;
        a[9] = a01 * b08 + a05 * b09 + a09 * b10 + a13 * b11;
        a[10] = a02 * b08 + a06 * b09 + a10 * b10 + a14 * b11;
        a[11] = a03 * b08 + a07 * b09 + a11 * b10 + a15 * b11;

        a[12] = a00 * b12 + a04 * b13 + a08 * b14 + a12 * b15;
        a[13] = a01 * b12 + a05 * b13 + a09 * b14 + a13 * b15;
        a[14] = a02 * b12 + a06 * b13 + a10 * b14 + a14 * b15;
        a[15] = a03 * b12 + a07 * b13 + a11 * b14 + a15 * b15;

        return this;
    }

    prototype.setTRS = function(tx, ty, tz, rx, ry, rz, sx, sy, sz, m) {
        m = m || this;
        var d = m.data;
        identity(m);

        var six = Math.sin(rx);
        var cox = Math.cos(rx);
        var siy = Math.sin(ry);
        var coy = Math.cos(ry);
        var siz = Math.sin(rz);
        var coz = Math.cos(rz);

        d[0] = (coy * coz + siy * six * siz) * sx;
        d[1] = (-coy * siz + siy * six * coz) * sx;
        d[2] = siy * cox * sx;

        d[4] = siz * cox * sy;
        d[5] = coz * cox * sy;
        d[6] = -six * sy;

        d[8] = (-siy * coz + coy * six * siz) * sz;
        d[9] = (siz * siy + coy * six * coz) * sz;
        d[10] = coy * cox * sz;

        d[12] = tx;
        d[13] = ty;
        d[14] = tz;

        return m;
    }

    prototype.setScale = function(sx, sy, sz, m) {
        m = m || this;
        var d = m.data || m;
        identity(m);
        d[0] = sx,d[5] = sy,d[10] = sz;
        return m;
    }

    prototype.setTranslation = function(tx, ty, tz, m) {
        m = m || this;
        var d = m.data || m;
        identity(m);
        d[12] = tx,d[13] = ty,d[14] = tz;
        return m;
    }

    prototype.setRotation = function(rx, ry, rz, m) {
        m = m || this;
        var d = m.data || m;
        identity(m);

        var sx = Math.sin(rx);
        var cx = Math.cos(rx);
        var sy = Math.sin(ry);
        var cy = Math.cos(ry);
        var sz = Math.sin(rz);
        var cz = Math.cos(rz);

        d[0] = cy * cz + sy * sx * sz;
        d[1] = -cy * sz + sy * sx * cz;
        d[2] = sy * cx;

        d[4] = sz * cx;
        d[5] = cz * cx;
        d[6] = -sx;

        d[8] = -sy * cz + cy * sx * sz;
        d[9] = sz * sy + cy * sx * cz;
        d[10] = cy * cx;

        return m;
    }

    prototype.setLookAt = function(eye, center, up, m) {
        m = m || this;
        var d = m.data || m;
        var f = D3.m4v31;//weak
        var s = D3.m4v32;//weak
        var u = D3.m4v33;//weak

        f.subVectors(center, eye).normalize();
        s.cross(f, up).normalize();
        u.cross(s, f);

        d[0] = s.x;
        d[1] = u.x;
        d[2] = -f.x;
        d[3] = 0;

        d[4] = s.y;
        d[5] = u.y;
        d[6] = -f.y;
        d[7] = 0;

        d[8] = s.z;
        d[9] = u.z;
        d[10] = -f.z;
        d[11] = 0;

        d[12] = 0;
        d[13] = 0;
        d[14] = 0;
        d[15] = 1;

        this.translate(-eye.x, -eye.y, -eye.z);

        return this;
    }

    prototype.setPerspective = function(fovy, aspect, near, far, m) {
        var e, rd, s, ct;

        if (near === far || aspect === 0) {
            throw 'null frustum';
        }
        if (near <= 0) {
            throw 'near <= 0';
        }
        if (far <= 0) {
            throw 'far <= 0';
        }

        fovy = Math.PI * fovy / 180 / 2;
        s = Math.sin(fovy);
        if (s === 0) {
            throw 'null frustum';
        }

        rd = 1 / (far - near);
        ct = Math.cos(fovy) / s;

        e = m ? (m.data || m) : this.data;

        e[0]  = ct / aspect;
        e[1]  = 0;
        e[2]  = 0;
        e[3]  = 0;

        e[4]  = 0;
        e[5]  = ct;
        e[6]  = 0;
        e[7]  = 0;

        e[8]  = 0;
        e[9]  = 0;
        e[10] = -(far + near) * rd;
        e[11] = -1;

        e[12] = 0;
        e[13] = 0;
        e[14] = -2 * near * far * rd;
        e[15] = 0;
    }

    prototype.perspective = function(fov, aspect, near, far) {
        this.setPerspective(fov, aspect, near, far, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__);
    }

    prototype.lookAt = function(eye, center, up) {
        this.setLookAt(eye, center, up, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__);
    }

    prototype.translate = function(tx, ty, tz) {
        this.setTranslation(tx, ty, tz, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__);
    }

    prototype.rotate = function(rx, ry, rz) {
        this.setRotation(rx, ry, rz, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__);
    }

    prototype.scale = function(sx, sy, sz) {
        this.setScale(sx, sy, sz, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__);
    }

    prototype.copyTo = function(m) {
        var a = this.data;
        var b = m.data || m;
        for (var i = 0; i < 16; i++) b[i] = a[i];
    }

    prototype.copyFrom = function(m) {
        var a = this.data;
        var b = m.data || m;
        for (var i = 0; i < 16; i++) a[i] = b[i];
        return this;
    }

    prototype.copyRotationTo = function(m) {
        var a = this.data;
        var b = m.data || m;

        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];

        b[3] = a[4];
        b[4] = a[5];
        b[5] = a[6];

        b[6] = a[8];
        b[7] = a[9];
        b[8] = a[10];

        return m;
    }

    prototype.copyPosition = function(m) {
        var to = this.data;
        var from = m.data || m;

        to[12] = from[12];
        to[13] = from[13];
        to[14] = from[14];

        return this;
    }

    prototype.getCSS = function() {
        var d = this.data;
        return 'matrix3d(' +
            noE(d[0]) + ',' +
            noE(d[1]) + ',' +
            noE(d[2]) + ',' +
            noE(d[3]) + ',' +

            noE(d[4]) + ',' +
            noE(d[5]) + ',' +
            noE(d[6]) + ',' +
            noE(d[7]) + ',' +

            noE(d[8]) + ',' +
            noE(d[9]) + ',' +
            noE(d[10]) + ',' +
            noE(d[11]) + ',' +

            noE(d[12]) + ',' +
            noE(d[13]) + ',' +
            noE(d[14]) + ',' +
            noE(d[15]) +
            ')';
    }

    prototype.extractPosition = function(v) {
        v = v || new Vector3();
        var d = this.data;
        v.set(d[12], d[13], d[14]);
        return v;
    }

    prototype.determinant = function() {
        var d = this.data;

        return d[0] * (d[5] * d[10] - d[9] * d[6]) +
            d[4] * (d[9] * d[2] - d[1] * d[10]) +
            d[8] * (d[1] * d[6] - d[5] * d[2]);
    }

    prototype.inverse = function(m) {
        var d = this.data;
        var a = (m) ? m.data || m : this.data;
        var det = this.determinant();

        if (Math.abs(det) < 0.0001) {
            console.warn("Attempt to inverse a singular Matrix4. ", this.data);
            console.trace();
            return m;
        }

        var d0 = d[0], d4 = d[4], d8 = d[8],   d12 = d[12],
            d1 = d[1], d5 = d[5], d9 = d[9],   d13 = d[13],
            d2 = d[2], d6 = d[6], d10 = d[10], d14 = d[14];

        det = 1 / det;

        a[0] = (d5 * d10 - d9 * d6) * det;
        a[1] = (d8 * d6 - d4 * d10) * det;
        a[2] = (d4 * d9 - d8 * d5) * det;

        a[4] = (d9 * d2 - d1 * d10) * det;
        a[5] = (d0 * d10 - d8 * d2) * det;
        a[6] = (d8 * d1 - d0 * d9) * det;

        a[8] = (d1 * d6 - d5 * d2) * det;
        a[9] = (d4 * d2 - d0 * d6) * det;
        a[10] = (d0 * d5 - d4 * d1) * det;

        a[12] = - (d12 * a[0] + d13 * a[4] + d14 * a[8]);
        a[13] = - (d12 * a[1] + d13 * a[5] + d14 * a[9]);
        a[14] = - (d12 * a[2] + d13 * a[6] + d14 * a[10]);

        return m;

    }

    prototype.transpose = function(m) {
        var d = this.data;
        var a = m ? m.data || m : this.data;

        var d0 = d[0], d4 = d[4], d8 = d[8],
            d1 = d[1], d5 = d[5], d9 = d[9],
            d2 = d[2], d6 = d[6], d10 = d[10];

        a[0] = d0;
        a[1] = d4;
        a[2] = d8;

        a[4] = d1;
        a[5] = d5;
        a[6] = d9;

        a[8] = d2;
        a[9] = d6;
        a[10] = d10;
    }
}, function() {

    Matrix4.__TEMP__ = new Matrix4().data;

});


Class(function Vector2(_x, _y) {
    var _this = this;
    var prototype = Vector2.prototype;
    
    this.x = typeof _x  == 'number' ? _x : 0;
    this.y = typeof _y  == 'number' ? _y : 0;
    
    this.type = 'vector2';

    //*** Public Methods
    if (typeof prototype.set !== 'undefined') return;
    prototype.set = function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    
    prototype.clear = function() {
        this.x = 0;
        this.y = 0;
        return this;
    }
    
    prototype.copyTo = function(v) {
        v.x = this.x;
        v.y = this.y;
        return this;
    }
    
    prototype.copyFrom = prototype.copy = function(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }
    
    prototype.addVectors = function(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
    }

    prototype.subVectors = function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
    }

    prototype.multiplyVectors = function(a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        return this;
    }
    
    prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;

        return this;
    }
    
    prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;

        //return this;
    }
    
    prototype.multiply = function(v) {
        this.x *= v;
        this.y *= v;

        return this;
    }
    
    prototype.divide = function(v) {
        this.x /= v;
        this.y /= v;

        return this;
    }
    
    prototype.lengthSq = function() {
        return (this.x * this.x + this.y * this.y) || 0.00001;
    }
    
    prototype.length = function() {
        return Math.sqrt(this.lengthSq());
    }

    prototype.setLength = function(length) {
        this.normalize().multiply(length);
        return this;
    }
    
    prototype.normalize = function() {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
    }
    
    prototype.perpendicular = function(a, b) {
        var tx = this.x;
        var ty = this.y;
        this.x = -ty;
        this.y = tx;
        return this;
    }
    
    prototype.lerp = function(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this;
    }

    prototype.interp = function(v, alpha, ease) {
        var a = 0;
        var f = TweenManager.Interpolation.convertEase(ease);
        var calc = Vector2.__TEMP__;
        calc.subVectors(this, v);
        var dist = Utils.clamp(Utils.range(calc.lengthSq(), 0, (5000 * 5000), 1, 0), 0, 1) * (alpha / 10);

        if (typeof f === 'function') a = f(dist);
        else a = TweenManager.Interpolation.solve(f, dist);

        this.x += (v.x - this.x) * a;
        this.y += (v.y - this.y) * a;
    }
    
    prototype.setAngleRadius = function(a, r) {
        this.x = Math.cos(a) * r;
        this.y = Math.sin(a) * r;
        return this;
    }
    
    prototype.addAngleRadius = function(a, r) {
        this.x += Math.cos(a) * r;
        this.y += Math.sin(a) * r;
        return this;
    }
    
    prototype.clone = function() {
        return new Vector2(this.x, this.y);
    }
    
    prototype.dot = function(a, b) {
        b = b || this;
        return (a.x * b.x + a.y * b.y);
    }
    
    prototype.distanceTo = function(v, noSq) {
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        if (!noSq) return Math.sqrt(dx * dx + dy * dy);
        return dx * dx + dy * dy;
    }
    
    prototype.solveAngle = function(a, b) {
        if (!b) b = this;
        return Math.atan2(a.y - b.y, a.x - b.x);
    }
    
    prototype.equals = function(v) {
        return this.x == v.x && this.y == v.y;
    }

    prototype.console = function() {
        console.log(this.x, this.y);
    }
}, function() {
    Vector2.__TEMP__ = new Vector2();
});

Class(function Vector3(_x, _y, _z, _w) {
    var _this = this;
    var prototype = Vector3.prototype;
    
    this.x = typeof _x === 'number' ? _x : 0;
    this.y = typeof _y === 'number' ? _y : 0;
    this.z = typeof _z === 'number' ? _z : 0;
    this.w = typeof _w === 'number' ? _w : 1;
    
    this.type = 'vector3';

    //*** Public Methods
    if (typeof prototype.set !== 'undefined') return;
    prototype.set = function(x, y, z, w) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = w || 1;
        return this;
    }
    
    prototype.clear = function() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
        return this;
    }
    
    prototype.copyTo = function(p) {
        p.x = this.x;
        p.y = this.y;
        p.z = this.z;
        p.w = this.w;
        return p;
    }
    
    prototype.copyFrom = prototype.copy = function(p) {
        this.x = p.x || 0;
        this.y = p.y || 0;
        this.z = p.z || 0;
        this.w = p.w || 1;
        return this;
    }
    
    prototype.lengthSq = function() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    
    prototype.length = function() {
        return Math.sqrt(this.lengthSq());
    }
    
    prototype.normalize = function() {
        var m  = 1 / this.length();
        this.set(this.x * m, this.y * m, this.z * m);
        return this;
    }

    prototype.setLength = function(length) {
        this.normalize().multiply(length);
        return this;
    }
    
    prototype.addVectors = function(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
    }
    
    prototype.subVectors = function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }
    
    prototype.multiplyVectors = function(a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;
        return this;
    }
    
    prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;

        return this;
    }
    
    prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;

        return this;
    }
    
    prototype.multiply = function(v) {
        this.x *= v;
        this.y *= v;
        this.z *= v;

        return this;
    }
    
    prototype.divide = function(v) {
        this.x /= v;
        this.y /= v;
        this.z /= v;

        return this;
    }
    
    prototype.limit = function(max) {
        if (this.length() > max) {
            this.normalize();
            this.multiply(max);
        }
    }
    
    prototype.heading2D = function() {
        var angle = Math.atan2(-this.y, this.x);
        return -angle;
    }
    
    prototype.lerp = function(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;
        return this;
    }

    prototype.deltaLerp = function(v, alpha, delta) {
        delta = delta || 1;
        for (var i = 0; i < delta; i++) {
            var f = alpha;
            this.x += ((v.x - this.x) * alpha);
            this.y += ((v.y - this.y) * alpha);
            this.z += ((v.z - this.z) * alpha);
        }
        return this;
    }

    prototype.interp = function(v, alpha, ease, dist) {
        if (!Vector3.__TEMP__) Vector3.__TEMP__ = new Vector3();

        dist = dist || 5000;

        var a = 0;
        var f = TweenManager.Interpolation.convertEase(ease);
        var calc = Vector3.__TEMP__;
        calc.subVectors(this, v);
        var dist = Utils.clamp(Utils.range(calc.lengthSq(), 0, (dist * dist), 1, 0), 0, 1) * (alpha / 10);

        if (typeof f === 'function') a = f(dist);
        else a = TweenManager.Interpolation.solve(f, dist);

        this.x += (v.x - this.x) * a;
        this.y += (v.y - this.y) * a;
        this.z += (v.z - this.z) * a;
    }
    
    prototype.setAngleRadius = function(a, r) {
        this.x = Math.cos(a) * r;
        this.y = Math.sin(a) * r;
        this.z = Math.sin(a) * r;
        return this;
    }
    
    prototype.addAngleRadius = function(a, r) {
        this.x += Math.cos(a) * r;
        this.y += Math.sin(a) * r;
        this.z += Math.sin(a) * r;
        return this;
    }
    
    prototype.dot = function(a, b) {
        b = b || this;
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
    
    prototype.clone = function() {
        return new Vector3(this.x, this.y, this.z);
    }
    
    prototype.cross = function(a, b) {
        if (!b) b = this;
        var x = a.y * b.z - a.z * b.y;
        var y = a.z * b.x - a.x * b.z;
        var z = a.x * b.y - a.y * b.x;
        this.set(x, y, z, this.w);
        return this;
    }
    
    prototype.distanceTo = function(v, noSq) {
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        var dz = this.z - v.z;
        if (!noSq) return Math.sqrt(dx * dx + dy * dy + dz * dz);
        return dx * dx + dy * dy + dz * dz;
    }
    
    prototype.solveAngle = function(a, b) {
        if (!b) b = this;
        return Math.acos(a.dot(b) / (a.length() * b.length()));
    }
    
    prototype.equals = function(v) {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    }

    prototype.console = function() {
        console.log(this.x, this.y, this.z);
    }
}, function() {
    Vector3.__TEMP__ = new Vector3();
});

Mobile.Class(function Accelerometer() {
    var _this = this;
    
    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.toRadians = Mobile.os == 'iOS' ? Math.PI / 180 : 1;

    //*** Event Handlers
    function updateAccel(e) {
        switch (window.orientation) {
            case 0:
                _this.x = -e.accelerationIncludingGravity.x;
                _this.y = e.accelerationIncludingGravity.y;
                _this.z = e.accelerationIncludingGravity.z;

                if (e.rotationRate) {
                    _this.alpha = e.rotationRate.beta * _this.toRadians;
                    _this.beta = -e.rotationRate.alpha * _this.toRadians;
                    _this.gamma = e.rotationRate.gamma * _this.toRadians;
                }
            break;
            
            case 180:
                _this.x = e.accelerationIncludingGravity.x;
                _this.y = -e.accelerationIncludingGravity.y;
                _this.z = e.accelerationIncludingGravity.z;

                if (e.rotationRate) {
                    _this.alpha = -e.rotationRate.beta * _this.toRadians;
                    _this.beta = e.rotationRate.alpha * _this.toRadians;
                    _this.gamma = e.rotationRate.gamma * _this.toRadians;
                }
            break;
            
            case 90:
                _this.x = e.accelerationIncludingGravity.y;
                _this.y = e.accelerationIncludingGravity.x;
                _this.z = e.accelerationIncludingGravity.z;

                if (e.rotationRate) {
                    _this.alpha = e.rotationRate.alpha * _this.toRadians;
                    _this.beta = e.rotationRate.beta * _this.toRadians;
                    _this.gamma = e.rotationRate.gamma * _this.toRadians;
                }
            break;
            
            case -90:
                _this.x = -e.accelerationIncludingGravity.y;
                _this.y = -e.accelerationIncludingGravity.x;
                _this.z = e.accelerationIncludingGravity.z;

                if (e.rotationRate) {
                    _this.alpha = -e.rotationRate.alpha * _this.toRadians;
                    _this.beta = -e.rotationRate.beta * _this.toRadians;
                    _this.gamma = e.rotationRate.gamma * _this.toRadians;
                }
            break;
        }
    }

    //*** Public methods
    this.capture = function() {
        window.ondevicemotion = updateAccel;
    }
    
    this.stop = function() {
        window.ondevicemotion = null;
        _this.x = _this.y = _this.z = 0;
    }
}, 'Static');

Class(function Interaction() {
    Namespace(this);
}, 'static');

Interaction.Class(function Input(_object) {
    Inherit(this, Component);
    var _this = this;
    var _hold = new Vector2();
    var _diff = new Vector2();
    var _lastMove = new Vector2();
    var _delta = Render.TIME;
    var _lastTime = Render.TIME;

    this.velocity = new Vector2();

    //*** Constructor
    (function () {
        if (_object instanceof HydraObject) addListeners();
    })();

    function addListeners() {
        _object.bind('touchstart', touchStart);
    }

    //*** Event handlers
    function touchStart(e) {
        _this.velocity.clear();
        _hold.copyFrom(e);
        __window.bind('touchmove', touchMove);
        __window.bind('touchend', touchEnd);
        __window.bind('touchcancel', touchEnd);
        __window.bind('contextmenu', touchEnd);

        if (_this.onStart) {
            defer(function() {
                if (_this.onStart) _this.onStart(e);
            });
        }
    }

    function touchMove(e) {
        _diff.subVectors(e, _hold);

        _delta = (Render.TIME - _lastTime) ||  0.01;
        if (_delta >= 16) {
            _this.velocity.subVectors(e, _lastMove);
            _this.velocity.divide(_delta);
            _lastTime = Render.TIME;

            _lastMove.copyFrom(e);
        }

        if (_this.onUpdate) {
            defer(function() {
                if (_this.onUpdate) _this.onUpdate(_diff, e);
            });
        }
    }

    function touchEnd(e) {
        __window.unbind('touchmove', touchMove);
        __window.unbind('touchend', touchEnd);
        __window.unbind('touchcancel', touchEnd);
        __window.unbind('contextmenu', touchEnd);

        if (_this.onEnd) {
            defer(function() {
                if (_this.onEnd) _this.onEnd(e);
            });
        }
    }

    //*** Public methods
    this.attach = function(object) {
        if (_object instanceof HydraObject) _object.unbind('touchstart', touchStart);
        _object = object;
        addListeners();
    }

    this.touchStart = function(e) {
        touchStart({x: Mouse.x, y: Mouse.y});
    }

    this.end = function() {
        touchEnd();
    }

    this.destroy = function() {
        _object.unbind('touchstart', touchStart);
        __window.unbind('touchmove', touchMove);
        __window.unbind('touchend', touchEnd);
        __window.unbind('touchcancel', touchEnd);
        return this._destroy();
    }
});









Class(function ParticlePhysics(_integrator) {
    Inherit(this, Component);
    var _this = this;

    _integrator = _integrator || new EulerIntegrator();

    var _timestep = 1 / 60;
    var _time = 0;
    var _step = 0;
    var _clock = null;
    var _buffer = 0;
    var _toDelete = [];

    this.friction = 1;
    this.maxSteps = 1;
    this.emitters = new LinkedList();
    this.initializers = new LinkedList();
    this.behaviors = new LinkedList();
    this.particles = new LinkedList();
    this.springs = new LinkedList();

    function init(p) {
        var i = _this.initializers.start();
        while (i) {
            i(p);
            i = _this.initializers.next();
        }
    }

    function updateSprings(dt) {
        var s = _this.springs.start();
        while (s) {
            s.update(dt);
            s = _this.springs.next();
        }
    }

    function deleteParticles() {
        for (var i = _toDelete.length-1; i > -1; i--) {
            var particle = _toDelete[i];
            _this.particles.remove(particle);
            particle.system = null;
        }

        _toDelete.length = 0;
    }

    function updateParticles(dt) {
        var index = 0;
        var p = _this.particles.start();
        while (p) {
            if (!p.disabled) {
                var b = _this.behaviors.start();
                while (b) {
                    b.applyBehavior(p, dt, index);
                    b = _this.behaviors.next();
                }

                if (p.behaviors.length) p.update(dt, index);
            }

            index++;
            p = _this.particles.next();
        }
    }

    function integrate(dt) {
        updateParticles(dt);
        if (_this.springs.length) updateSprings(dt);
        if (!_this.skipIntegration) _integrator.integrate(_this.particles, dt, _this.friction);
    }

    //*** Event handlers

    //*** Public Methods
    this.addEmitter = function(emitter) {
        if (!(emitter instanceof Emitter)) throw 'Emitter must be Emitter';
        this.emitters.push(emitter);
        emitter.parent = emitter.system = this;
    }

    this.removeEmitter = function(emitter) {
        if (!(emitter instanceof Emitter)) throw 'Emitter must be Emitter';
        this.emitters.remove(emitter);
        emitter.parent = emitter.system = null;
    }

    this.addInitializer = function(init) {
        if (typeof init !== 'function') throw 'Initializer must be a function';
        this.initializers.push(init);
    }

    this.removeInitializer = function(init) {
        this.initializers.remove(init);
    }

    this.addBehavior = function(b) {
        this.behaviors.push(b);
        b.system = this;
    }
    
    this.removeBehavior = function(b) {
        this.behaviors.remove(b);
    }
    
    this.addParticle = function(p) {
        if (!_integrator.type) {
            if (typeof p.pos.z === 'number') _integrator.type = '3D';
            else _integrator.type = '2D';
        }

        p.system = this;
        this.particles.push(p);
        if (this.initializers.length) init(p);
    }
    
    this.removeParticle = function(p) {
        p.system = null;

        _toDelete.push(p);
    }
    
    this.addSpring = function(s) {
        s.system = this;
        this.springs.push(s);
    }
    
    this.removeSpring = function(s) {
        s.system = null;
        this.springs.remove(s);
    }
    
    this.update = function(force) {
        if (!_clock) _clock = THREAD ? Date.now() : Render.TIME;

        var time = THREAD ? Date.now() : Render.TIME;
        var delta = time - _clock;

        if (!force && delta <= 0) return;

        delta *= 0.001;
        _clock = time;
        _buffer += delta;

        if (!force) {
            var i = 0;
            while (_buffer >= _timestep && i++ < _this.maxSteps) {
                integrate(_timestep);
                _buffer -= _timestep;
                _time += _timestep;
            }
        } else {
            integrate(0.016);
        }

        _step = Date.now() - time;
        if (_toDelete.length) deleteParticles();
    }
});

Class(function Particle(_pos, _mass, _radius) {
    var _this = this;
    var _vel, _acc, _old;

    var prototype = Particle.prototype;

    this.mass = _mass || 1;
    this.massInv = 1.0 / this.mass;

    this.radius = _radius || 1;
    this.radiusSq = this.radius * this.radius;

    this.behaviors = new LinkedList();
    this.fixed = false;

    //*** Constructor
    (function () {
        initVectors();
    })();

    function initVectors() {
        var Vector = typeof _pos.z === 'number' ? Vector3 : Vector2;
        _pos = _pos || new Vector();
        _vel = new Vector();
        _acc = new Vector();

        _old = {};
        _old.pos = new Vector();
        _old.acc = new Vector();
        _old.vel = new Vector();

        _old.pos.copyFrom(_pos);

        _this.pos = _this.position = _pos;
        _this.vel = _this.velocity = _vel;
        _this.acc = _this.acceleration = _acc;
        _this.old = _old;
    }

    //*** Event handlers

    //*** Public methods
    this.moveTo = function(pos) {
        _pos.copyFrom(pos);
        _old.pos.copyFrom(_pos);
        _acc.clear();
        _vel.clear();
    }

    if (typeof prototype.setMass !== 'undefined') return;
    prototype.setMass = function(mass) {
        this.mass = mass || 1;
        this.massInv = 1.0 / this.mass;
    }

    prototype.setRadius = function(radius) {
        this.radius = radius;
        this.radiusSq = radius * radius;
    }

    prototype.update = function(dt) {
        if (!this.behaviors.length) return;

        var b = this.behaviors.start();
        while (b) {
            b.applyBehavior(this, dt);
            b = this.behaviors.next();
        }
    }

    prototype.applyForce = function(force) {
        this.acc.add(force);
    }

    prototype.addBehavior = function(behavior) {
        if (!behavior || typeof behavior.applyBehavior === 'undefined') throw 'Behavior must have applyBehavior method';
        this.behaviors.push(behavior);
    }

    prototype.removeBehavior = function(behavior) {
        if (!behavior || typeof behavior.applyBehavior === 'undefined') throw 'Behavior must have applyBehavior method';
        this.behaviors.remove(behavior);
    }

    prototype.destroy = function() {
        if (this.system) this.system.removeParticle(this);
    }
});





Class(function EulerIntegrator() {
    Inherit(this, Component);
    var _this = this;
    var _vel, _accel;

    this.useDeltaTime = false;

    //*** Constructor
    (function () {

    })();

    function createVectors() {
        var Vector = _this.type == '3D' ? Vector3 : Vector2;
        _vel = new Vector();
        _accel = new Vector();
    }

    //*** Event handlers

    //*** Public methods
    this.integrate = function(particles, dt, drag) {
        if (!_vel) createVectors();

        var dtSq = dt * dt;

        var p = particles.start();
        while (p) {
            if (!p.fixed && !p.disabled) {

                p.old.pos.copyFrom(p.pos);
                p.acc.multiply(p.massInv);
                _vel.copyFrom(p.vel);
                _accel.copyFrom(p.acc);

                if (this.useDeltaTime) {
                    p.pos.add(_vel.multiply(dt)).add(_accel.multiply(0.5 * dtSq));
                    p.vel.add(p.acc.multiply(dt));
                } else {
                    p.pos.add(_vel).add(_accel.multiply(0.5));
                    p.vel.add(p.acc);
                }

                if (drag) p.vel.multiply(drag);

                p.acc.clear();
            }

            if (p.saveTo) p.pos.copyTo(p.saveTo);

            p = particles.next();
        }
    }
});









Class(function Force(_force) {
    Inherit(this, Component);
    var _this = this;

    this.force = _force;

    if (!_force) throw 'Force requires parameter Vector';

    //*** Event handlers

    //*** Public methods
    this.applyBehavior = function(p, dt) {
        p.acc.add(_force);
    }
});



Class(function Emitter(_position, _startNumber) {
    Inherit(this, Component);
    var _this = this;
    var _pool;
    var _total = 0;
    var Vector = _position.type == 'vector3' ? Vector3 : Vector2;

    this.initializers = [];
    this.position = _position;
    this.autoEmit = 1;
    
    (function() {
        initObjectPool();
        if (_startNumber != 0) addParticles(_startNumber || 100);
    })();
    
    function initObjectPool() {
        _pool = _this.initClass(ObjectPool);
    }
    
    function addParticles(total) {
        _total += total;
        var particles = [];
        for (var i = 0; i < total; i++) {
            particles.push(new Particle());
        }
        
        _pool.insert(particles);
    }
    
    //*** Public Methods
    this.addInitializer = function(callback) {
        if (typeof callback !== 'function') throw 'Initializer must be a function';
        this.initializers.push(callback);
    }
    
    this.removeInitializer = function(callback) {
        var index = this.initializers.indexOf(callback);
        if (index > -1) this.initializers.splice(index, 1);
    }
    
    this.emit = function(num) {
        if (!this.parent) throw 'Emitter needs to be added to a System';
        num = num || this.autoEmit;
        for (var i = 0; i < num; i++) {
            var p = _pool.get();
            if (!p) return;

            p.moveTo(this.position);
            p.emitter = this;

            if (!p.system) this.parent.addParticle(p);
            
            for (var j = 0; j < this.initializers.length; j++) {
                this.initializers[j](p);
            }
        }
    }
    
    this.remove = function(particle) {
        _pool.put(particle);
        _this.parent.removeParticle(particle);
    }
    
    this.addToPool = function(particle) {
        _pool.put(particle);
    }
}); 















Class(function SplitTextfield() {

	var _style = {display: 'block', position: 'relative', padding: 0, margin: 0, cssFloat: 'left', styleFloat: 'left', width: 'auto', height: 'auto'};

	function splitLetter($obj) {
		var _array = [];
		var text = $obj.div.innerHTML;
		var split = text.split('');
		$obj.div.innerHTML = '';
		
		for (var i = 0; i < split.length; i++) {
			if (split[i] == ' ') split[i] = '&nbsp;'
			var letter = $('t', 'span');
			letter.html(split[i], true).css(_style);
			_array.push(letter);
			$obj.addChild(letter);
		}
		
		return _array;
	}
	
	function splitWord($obj) {
		var _array = [];
		var text = $obj.div.innerHTML;
		var split = text.split(' ');
		$obj.empty();
		for (var i = 0; i < split.length; i++) {
			var word = $('t', 'span');
			var empty = $('t', 'span');
			word.html(split[i]).css(_style);
			empty.html('&nbsp', true).css(_style);
			_array.push(word);
			_array.push(empty);
			$obj.addChild(word);
			$obj.addChild(empty);
		}
		return _array;
	}

	this.split = function($obj, by) {
		if (by == 'word') return splitWord($obj);
		else return splitLetter($obj);
	}
}, 'Static');



Class(function CSSAnimation() {
    Inherit(this, Component);
    var _this = this;
    var _name = 'a'+Utils.timestamp();
    var _frames, _timer, _started;
    
    var _duration = 1000;
    var _ease = 'linear';
    var _delay = 0;
    var _loop = false;
    var _count = 1;
    var _steps = null;

    var _applyTo = [];

    //*** Constructor
    (function() {
    })();
    
    function complete() {
        _this.playing = false;
        if (_this.events) _this.events.fire(HydraEvents.COMPLETE, null, true);
    }
    
    function updateCSS() {
        var css = CSS._read();
        var id = '/*'+_name+'*/';
        var keyframe = '@'+Device.vendor+'keyframes '+_name+' {\n';
        var string = id + keyframe;
        
        if (css.strpos(_name)) {
            var split = css.split(id);
            css = css.replace(id+split[1]+id, '');
        }
        
        var steps = _frames.length - 1;
        var perc = Math.round(100 / steps);
        var total = 0;
        for (var i = 0; i < _frames.length; i++) {
            var frame = _frames[i];
            if (i == _frames.length-1) total = 100;
            
            string += (frame.percent || total)+'% {\n';
            
            var hasTransform = false;
            var transforms = {};
            var styles = {};
            for (var key in frame) {
                if (TweenManager.checkTransform(key)) {
                    transforms[key] = frame[key];
                    hasTransform = true;
                } else {
                    styles[key] = frame[key];
                }
            }
            
            if (hasTransform) {
                string += Device.vendor+'transform: '+TweenManager.parseTransform(transforms)+';';
            }
            
            for (key in styles) {
                var val = styles[key];
                if (typeof val !== 'string' && key != 'opacity' && key != 'zIndex') val += 'px';
                string += CSS._toCSS(key)+': '+val+';';
            }
            
            string += '\n}\n';
            
            total += perc;
        }
        
        string += '}' + id;
        
        css += string;
        CSS._write(css);
    }
    
    function destroy() {
        var css = CSS._read();
        var id = '/*'+_name+'*/';
        if (css.strpos(_name)) {
            var split = css.split(id);
            css = css.replace(id+split[1]+id, '');
        }
        CSS._write(css);
    }

    function applyTo(callback) {
        for (var i = _applyTo.length-1; i > -1; i--) callback(_applyTo[i]);
    }

    //*** Event handlers
    
    //*** Getters and setters
    this.set('frames', function(frames) {
        _frames = frames; 
        updateCSS();
    });
    
    this.set('steps', function(steps) {
        _steps = steps;
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix('AnimationTimingFunction')] = 'steps('+steps+')';
            });
        }
    });
        
    this.set('duration', function(duration) {
        _duration = Math.round(duration);
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix('AnimationDuration')] = _this.duration+'ms';
            });
        }
    });
    
    this.get('duration', function() {
        return _duration;
    });
    
    this.set('ease', function(ease) {
        _ease = ease;
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix('AnimationTimingFunction')] = TweenManager.getEase(_ease);
            });
        }
    });
    
    this.get('ease', function() {
        return _ease;
    });
    
    this.set('loop', function(loop) {
        _loop = loop;
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix('AnimationIterationCount')] = _loop ? 'infinite' : _count;
            });
        }
    });
    
    this.get('loop', function() {
        return _loop;
    });
    
    this.set('count', function(count) {
        _count = count;
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix('AnimationIterationCount')] = _loop ? 'infinite' : _count;
            });
        }
    });
    
    this.get('count', function() {
        return _count;
    });

    this.set('delay', function(delay) {
        _delay = delay;
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix('AnimationDelay')] = _delay +'ms';
            });
        }
    });

    this.get('delay', function() {
        return _delay;
    });

    //*** Public Methods
    this.play = function() {
        applyTo(function($obj) {
            $obj.div.style[CSS.prefix('AnimationName')] = _name;
            $obj.div.style[CSS.prefix('AnimationDuration')] = _this.duration+'ms';
            $obj.div.style[CSS.prefix('AnimationTimingFunction')] = _steps ? 'steps('+_steps+')' : TweenManager.getEase(_ease);
            $obj.div.style[CSS.prefix('AnimationIterationCount')] = _loop ? 'infinite' : _count;
            $obj.div.style[CSS.prefix('AnimationPlayState')] = 'running';
            $obj.div.style[CSS.prefix('AnimationDelay')] = _delay + 'ms';
        });

        _this.playing = true;
        clearTimeout(_timer);
        if (!_this.loop) {
            _started = Date.now();
            _timer = _this.delayedCall(complete, _count * _duration);
        }
    }
    
    this.pause = function() {
        _this.playing = false;
        clearTimeout(_timer);
        applyTo(function($obj) {
            $obj.div.style[CSS.prefix('AnimationPlayState')] = 'paused';
        });
    }
    
    this.stop = function() {
        _this.playing = false;
        clearTimeout(_timer);
        applyTo(function($obj) {
            $obj.div.style[CSS.prefix('AnimationName')] = '';
        });
    }

    this.applyTo = function($obj) {
        _applyTo.push($obj);

        if (_this.playing) {
            $obj.div.style[CSS.prefix('AnimationName')] = _name;
            $obj.div.style[CSS.prefix('AnimationDuration')] = _this.duration+'ms';
            $obj.div.style[CSS.prefix('AnimationTimingFunction')] = _steps ? 'steps('+_steps+')' : TweenManager.getEase(_ease);
            $obj.div.style[CSS.prefix('AnimationIterationCount')] = _loop ? 'infinite' : _count;
            $obj.div.style[CSS.prefix('AnimationPlayState')] = 'running';
        }
    }

    this.remove = function($obj) {
        $obj.div.style[CSS.prefix('AnimationName')] = '';
        var i = _applyTo.indexOf($obj);
        if (i > -1) _applyTo.splice(i, 1);
    }
    
    this.destroy = function() {
        this.stop();
        _frames = null;
        destroy();
        return this._destroy();
    }
});



Class(function Canvas(_width, _height, _retina) {
    Inherit(this, Component);
    var _this = this;
    var _interactive, _over, _down, _local, _imgData;
    
    this.children = [];
    this.offset = {x: 0, y: 0};
    this.retina = _retina;
    
    (function() {
        if (_retina instanceof HydraObject) {
            initAsBackground(_retina);
        } else {
            initAsElement();
        }
        
        _this.width = _width;
        _this.height = _height;
        
        _this.context._matrix = new Matrix2();
        
        resize(_width, _height, _retina);
    })();
    
    function initAsBackground() {
        var id = 'c' + Utils.timestamp();
        _this.context = document.getCSSCanvasContext('2d', id, _width, _height);
        _this.background = '-'+Device.styles.vendor.toLowerCase()+'-canvas('+id+')';
        _retina.css({backgroundImage: _this.background});
        _retina = null;
    }
    
    function initAsElement() {
        _this.div = document.createElement('canvas');
        _this.context = _this.div.getContext('2d');
        _this.object = $(_this.div);        
    }
    
    function resize(w, h, retina) {
        var ratio = retina && Device.system.retina ? 2 : 1;

        if (_this.div) {
            _this.div.width = w * ratio;
            _this.div.height = h * ratio;
        }
        
        _this.width = w;
        _this.height = h;
        _this.scale = ratio;
        if (_this.object) _this.object.size(_this.width, _this.height);
        
        if (Device.system.retina && retina) {
            _this.context.scale(ratio, ratio);
            _this.div.style.width = w+'px';
            _this.div.style.height = h+'px';
        }
    }
    
    function findHit(e) {
        e = Utils.touchEvent(e);
        e.x -= _this.offset.x;
        e.y -= _this.offset.y;
        e.width = 1;
        e.height = 1;
        
        for (var i = _this.children.length-1; i > -1; i--) {
            var hit = _this.children[i].hit(e);
            if (hit) return hit;
        }
                
        return false;
    }
    
    function touchStart(e) {
        var hit = findHit(e);
        
        if (!hit) return _this.interacting = false;
        
        _this.interacting = true;
        _down = hit;
        if (Device.mobile) {
            hit.events.fire(HydraEvents.HOVER, {action: 'over'}, true);
            hit.__time = Date.now();
        }
    }
    
    function touchMove(e) {
        var hit = findHit(e);
        
        if (hit) _this.interacting = true;
        else _this.interacting = false;
        
        if (!Device.mobile) {
            if (hit && _over) {
                if (hit != _over) {
                    _over.events.fire(HydraEvents.HOVER, {action: 'out'}, true);
                    hit.events.fire(HydraEvents.HOVER, {action: 'over'}, true);
                    _over = hit;
                }
            } else if (hit && !_over) {
                _over = hit;
                hit.events.fire(HydraEvents.HOVER, {action: 'over'}, true);
            } else if (!hit && _over) {
                if (_over) _over.events.fire(HydraEvents.HOVER, {action: 'out'}, true);
                _over = null;
            }
        }        
    }
    
    function touchEnd(e) {
        var hit = findHit(e);
        
        if (hit) _this.interacting = true;
        else _this.interacting = false;
        
        if (!_down && !hit) return;
        
        if (!Device.mobile) {
            if (hit && hit == _down) hit.events.fire(HydraEvents.CLICK, {action: 'click'}, true);
        } else {
            if (_down) _down.events.fire(HydraEvents.HOVER, {action: 'out'}, true);
            if (hit == _down) {
                if (Date.now() - _down.__time < 750) hit.events.fire(HydraEvents.CLICK, {action: 'click'}, true);
            }
        }
        
        _down = null;
    }
    
    this.set('interactive', function(val) {
        if (!_interactive && val) {
            Stage.bind('touchstart', touchStart);  
            Stage.bind('touchmove', touchMove);    
            Stage.bind('touchend', touchEnd);    
        } else if (_interactive && !val) {
            Stage.unbind('touchstart', touchStart);  
            Stage.unbind('touchmove', touchMove);    
            Stage.unbind('touchend', touchEnd);  
        }
        
        _interactive = val
    });
    
    this.get('interactive', function() {
        return _interactive;
    });
    
    this.toDataURL = function(type, quality) {
        return _this.div.toDataURL(type, quality);
    }
    
    this.sort = function() {
        _objects.sort(function(a, b) {
            return a.z - b.z;
        });
    }
    
    this.render = function(noClear) {
        if (!(typeof noClear === 'boolean' && noClear)) _this.clear();
        
        var len = _this.children.length;
        for (var i = 0; i < len; i++) {
            _this.children[i].render();
        }
    }
    
    this.clear = function() {
        _this.context.clearRect(0, 0, _this.div.width, _this.div.height);
    }
    
    this.add = function(display) {
        display.setCanvas(this);
        display._parent = this;
        this.children.push(display);
        display._z = this.children.length;
    }
    
    this.remove = function(display) {
        display._canvas = null;
        display._parent = null;
        var i = this.children.indexOf(display);
        if (i > -1) this.children.splice(i, 1);
    }
    
    this.destroy = function() {
        if (_interactive) {
            Stage.unbind('touchstart', touchStart);
            Stage.unbind('touchmove', touchMove);
            Stage.unbind('touchend', touchEnd);
        }

        this.stopRender();

        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].destroy) this.children[i].destroy();
        }
        return this._destroy();
    }
    
    this.startRender = function() {
        Render.startRender(_this.render);
    }
    
    this.stopRender = function() {
        Render.stopRender(_this.render);
    }

    this.getImageData = function(x, y, w, h) {
        this.imageData = this.context.getImageData(x || 0, y || 0,  w || this.width, h || this.height);
        return this.imageData;
    }
    
    this.getPixel = function(x, y, dirty) {
        if (!this.imageData || dirty) _this.getImageData(0, 0, _this.width, _this.height);
        if (!_imgData) _imgData = {};
        var index = (x + y * _this.width) * 4;
        var pixels = this.imageData.data;

        _imgData.r = pixels[index];
        _imgData.g = pixels[index + 1];
        _imgData.b = pixels[index + 2];
        _imgData.a = pixels[index + 3];

        return _imgData;
    }
    
    this.texture = function(src) {
        var img = new Image();
        img.src = src;
        return img;
    }

    this.localizeMouse = function() {
        _local = _local || {};
        _local.x = Mouse.x - _this.offset.x;
        _local.y = Mouse.y - _this.offset.y;
        return _local;
    }
    
    this.size = resize;
});



































Class(function TweenManager() {
    Namespace(this);
    var _this = this;
    var _tweens = [];

    //*** Constructor
    (function() {
        if (window.Hydra) {
            Hydra.ready(initPools);
            Render.startRender(updateTweens);
        }
    })();
    
    function initPools() {
        _this._dynamicPool = new ObjectPool(DynamicObject, 100);
        _this._arrayPool = new ObjectPool(Array, 100);

        _this._dynamicPool.debug = true;
    }
    
    function updateTweens(time) {
        for (var i = 0; i < _tweens.length; i++) {
            _tweens[i].update(time);
        }
    }

    function stringToValues(str) {
        var values = str.split('(')[1].slice(0, -1).split(',');
        for (var i = 0; i < values.length; i++) values[i] = parseFloat(values[i]);
        return values;
    }

    function findEase(name) {
        var eases = _this.CSSEases;
        for (var i = eases.length-1; i > -1; i--) {
            //console.log(eases[i].name, name)
            if (eases[i].name == name) {
                return eases[i];
            }
        }
        return false;
    }

    //*** Event Handlers

    //*** Public methods
    this._addMathTween = function(tween) {
        _tweens.push(tween);
    }
    
    this._removeMathTween = function(tween) {
        _tweens.findAndRemove(tween);
    }

    this._detectTween = function(object, props, time, ease, delay, callback) {
        if (ease === 'spring') {
            return new SpringTween(object, props, time, ease, delay, callback);
        }

        if (!_this.useCSSTrans(props, ease, object)) {
            return new FrameTween(object, props, time, ease, delay, callback);
        } else {
            if (Device.tween.webAnimation) {
                return new CSSWebAnimation(object, props, time, ease, delay, callback);
            } else { // CSSConfig MathTween
                return new CSSTransition(object, props, time, ease, delay, callback);
            }
        }
    }
    
    this.tween = function(obj, props, time, ease, delay, complete, update, manual) {
        if (typeof delay !== 'number') {
            update = complete;
            complete = delay;
            delay = 0;
        }

        if (ease === 'spring') {
            return new SpringTween(obj, props, time, ease, delay, update, complete);
        } else {
            return new MathTween(obj, props, time, ease, delay, update, complete, manual);
        }
    }

    this.iterate = function(array, props, time, ease, offset, delay, callback) {
        if (typeof delay !== 'number') {
            callback = delay;
            delay = 0;
        }

        props = new DynamicObject(props);
        if (!array.length) throw 'TweenManager.iterate :: array is empty';

        var len = array.length;
        for (var i = 0; i < len; i++) {
            var obj = array[i];
            var complete = i == len-1 ? callback : null;
            obj.tween(props.copy(), time, ease, delay + (offset * i), complete);
        }
    }

	this.clearTween = function(obj) {
		if (obj._mathTween && obj._mathTween.stop) obj._mathTween.stop();

        if (obj._mathTweens) {
            var tweens = obj._mathTweens;
            for (var i = 0; i < tweens.length; i++) {
                var tw = tweens[i];
                if (tw && tw.stop) tw.stop();
            }

            obj._mathTweens = null;
        }
	}
	
	this.clearCSSTween = function(obj) {
	    if (obj && !obj._cssTween && obj.div._transition) {
	        obj.div.style[Device.styles.vendorTransition] = '';
	        obj.div._transition = false;
            obj._cssTween = null;
	    }
	}
    
   	this.checkTransform = function(key) {
        var index = _this.Transforms.indexOf(key);
   		return index > -1;
   	}
   	
   	this.addCustomEase = function(ease) {
   	    var add = true;
   	    if (typeof ease !== 'object' || !ease.name || !ease.curve) throw 'TweenManager :: addCustomEase requires {name, curve}';
   	    for (var i = _this.CSSEases.length-1; i > -1; i--) {
   	        if (ease.name == _this.CSSEases[i].name) {
   	            add = false;
   	        }
   	    }
   	    
   	    if (add) {
            if (ease.curve.charAt(0).toLowerCase() == 'm') ease.path = new EasingPath(ease.curve);
            else ease.values = stringToValues(ease.curve);
   	        _this.CSSEases.push(ease);
   	    }

        return ease;
   	}

	this.getEase = function(name, values) {
        if (Array.isArray(name)) {
            var c1 = findEase(name[0]);
            var c2 = findEase(name[1]);
            if (!c1 || !c2) throw 'Multi-ease tween missing values '+JSON.stringify(name);
            if (!c1.values) c1.values = stringToValues(c1.curve);
            if (!c2.values) c2.values = stringToValues(c2.curve);
            if (values) return [c1.values[0], c1.values[1], c2.values[2], c2.values[3]];
            return 'cubic-bezier(' + c1.values[0] + ',' + c1.values[1] + ',' + c2.values[2] + ',' + c2.values[3] +')';
        } else {
            var ease = findEase(name);
            if (!ease) return false;

            if (values) {
                return ease.path ? ease.path.solve : ease.values;
            } else {
                return ease.curve;
            }
        }
	}

    this.inspectEase = function(name) {
        return findEase(name);
    }
	
	this.getAllTransforms = function(object) {
	    var obj = {};
	    for (var i = _this.Transforms.length-1; i > -1; i--) {
	        var tf = _this.Transforms[i];
	        var val = object[tf];
	        if (val !== 0 && typeof val === 'number') {
	            obj[tf] = val;
	        }
	    }
	    return obj;
	}

	this.parseTransform = function(props) {
        var transforms = '';
        var translate = '';

        if (props.perspective > 0) transforms += 'perspective('+props.perspective+'px)';
        
        if (typeof props.x !== 'undefined' || typeof props.y !== 'undefined' || typeof props.z !== 'undefined') {
            var x = (props.x || 0);
            var y = (props.y || 0);
            var z = (props.z || 0);
            translate += x + 'px, ';
            translate += y + 'px';
            if (Device.tween.css3d) {
                translate += ', ' + z + 'px';
                transforms += 'translate3d('+translate+')';
            } else {
                transforms += 'translate('+translate+')';
            }
        }

        if (typeof props.scale !== 'undefined') {
            transforms += 'scale('+props.scale+')';
        } else {
            if (typeof props.scaleX !== 'undefined') transforms += 'scaleX('+props.scaleX+')';
            if (typeof props.scaleY !== 'undefined') transforms += 'scaleY('+props.scaleY+')';
        }
        
        if (typeof props.rotation !== 'undefined') transforms += 'rotate('+props.rotation+'deg)';
        if (typeof props.rotationX !== 'undefined') transforms += 'rotateX('+props.rotationX+'deg)';
        if (typeof props.rotationY !== 'undefined') transforms += 'rotateY('+props.rotationY+'deg)';
        if (typeof props.rotationZ !== 'undefined') transforms += 'rotateZ('+props.rotationZ+'deg)';
        if (typeof props.skewX !== 'undefined') transforms += 'skewX('+props.skewX+'deg)';
        if (typeof props.skewY !== 'undefined') transforms += 'skewY('+props.skewY+'deg)';
        
        return transforms;
	}

    this.interpolate = function(num, alpha, ease) {
        var fn = _this.Interpolation.convertEase(ease);
        return num * (typeof fn == 'function' ? fn(alpha) : _this.Interpolation.solve(fn, alpha));
    }

    this.interpolateValues = function(start, end, alpha, ease) {
        var fn = _this.Interpolation.convertEase(ease);
        return start + (end - start) * (typeof fn == 'function' ? fn(alpha) : _this.Interpolation.solve(fn, alpha));
    }
}, 'Static');

(function() {
	TweenManager.Transforms = [
		'scale',
		'scaleX',
		'scaleY',
		'x',
		'y',
		'z',
		'rotation',
		'rotationX',
		'rotationY',
		'rotationZ',
		'skewX',
		'skewY',
		'perspective',
	];
	
	TweenManager.CSSEases = [
	    {name: 'easeOutCubic', curve: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'},
	    {name: 'easeOutQuad', curve: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)'},
        {name: 'easeOutQuart', curve: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)'},
        {name: 'easeOutQuint', curve: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)'},
        {name: 'easeOutSine', curve: 'cubic-bezier(0.390, 0.575, 0.565, 1.000)'},
        {name: 'easeOutExpo', curve: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)'},
        {name: 'easeOutCirc', curve: 'cubic-bezier(0.075, 0.820, 0.165, 1.000)'},
        {name: 'easeOutBack', curve: 'cubic-bezier(0.175, 0.885, 0.320, 1.275)'},
        
        {name: 'easeInCubic', curve: 'cubic-bezier(0.550, 0.055, 0.675, 0.190)'},
		{name: 'easeInQuad', curve: 'cubic-bezier(0.550, 0.085, 0.680, 0.530)'},
		{name: 'easeInQuart', curve: 'cubic-bezier(0.895, 0.030, 0.685, 0.220)'},
		{name: 'easeInQuint', curve: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)'},
		{name: 'easeInSine', curve: 'cubic-bezier(0.470, 0.000, 0.745, 0.715)'},
		{name: 'easeInCirc', curve: 'cubic-bezier(0.600, 0.040, 0.980, 0.335)'},
		{name: 'easeInBack', curve: 'cubic-bezier(0.600, -0.280, 0.735, 0.045)'},
		
		{name: 'easeInOutCubic', curve: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)'},
		{name: 'easeInOutQuad', curve: 'cubic-bezier(0.455, 0.030, 0.515, 0.955)'},
		{name: 'easeInOutQuart', curve: 'cubic-bezier(0.770, 0.000, 0.175, 1.000)'},
		{name: 'easeInOutQuint', curve: 'cubic-bezier(0.860, 0.000, 0.070, 1.000)'},
		{name: 'easeInOutSine', curve: 'cubic-bezier(0.445, 0.050, 0.550, 0.950)'},
		{name: 'easeInOutExpo', curve: 'cubic-bezier(1.000, 0.000, 0.000, 1.000)'},
		{name: 'easeInOutCirc', curve: 'cubic-bezier(0.785, 0.135, 0.150, 0.860)'},
		{name: 'easeInOutBack', curve: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'},

		{name: 'easeInOut', curve: 'cubic-bezier(.42,0,.58,1)'},
		{name: 'linear', curve: 'linear'}
	];

	TweenManager.useCSSTrans = function(props, ease, object) {
		if (props.math) return false;
		if (typeof ease === 'string' && (ease.strpos('Elastic') || ease.strpos('Bounce'))) return false;
		if (object.multiTween || TweenManager.inspectEase(ease).path) return false;
		if (!Device.tween.transition) return false;
		return true;
	}
})();

Class(function CSSTransition(_object, _props, _time, _ease, _delay, _callback) {
    var _this = this;
    var _transformProps, _transitionProps, _stack, _totalStacks;
    var _startTransform, _startProps;

    this.playing = true;

    //*** Constructor
    (function () {
        if (typeof _time !== 'number') throw 'CSSTween Requires object, props, time, ease';
        initProperties();
        if (typeof _ease == 'object' && !Array.isArray(_ease)) initStack();
        else initCSSTween();
    })();

    function killed() {
        return !_this || _this.kill || !_object || !_object.div;
    }

    function initProperties() {
        var transform = TweenManager.getAllTransforms(_object);
        var properties = [];

        for (var key in _props) {
            if (TweenManager.checkTransform(key)) {
                transform.use = true;
                transform[key] = _props[key];
                delete _props[key];
            } else {
                if (typeof _props[key] === 'number' || key.strpos('-')) properties.push(key);
            }
        }

        if (transform.use) properties.push(Device.transformProperty);
        delete transform.use;
        _transformProps = transform;
        _transitionProps = properties;
    }

    function initStack() {
        initStart();

        var prevTime = 0;

        var interpolate = function(start, end, alpha, ease, prev, ke) {
            var last = prev[key];
            if (last) start += last;

            return TweenManager.interpolateValues(start, end, alpha, ease);
        };

        _stack = [];
        _totalStacks = 0;

        for (var p in _ease) {
            var perc = p.strpos('%') ? Number(p.replace('%', '')) / 100 : ((Number(p)+1) / _ease.length);
            if (isNaN(perc)) continue;

            var ease = _ease[p];
            _totalStacks++;

            var transform = {};
            var props = {};
            var last = _stack[_stack.length-1];
            var pr = last ? last.props : {};
            var zeroOut = !last;

            for (var key in _transformProps) {
                if (!_startTransform[key]) _startTransform[key] = key.strpos('scale') ? 1 : 0;
                transform[key] = interpolate(_startTransform[key], _transformProps[key], perc, ease, pr, key);
                if (zeroOut) pr[key] = _startTransform[key];
            }

            for (key in _props) {
                props[key] = interpolate(_startProps[key], _props[key], perc, ease, pr, key);
                if (zeroOut) pr[key] = _startProps[key];
            }

            var time = (perc * _time) - prevTime;
            prevTime += time;

            _stack.push({percent: perc, ease: ease, transform: transform, props: props, delay: _totalStacks == 1 ? _delay : 0, time: time});
        }

        initCSSTween(_stack.shift());
    }

    function initStart() {
        _startTransform = TweenManager.getAllTransforms(_object);
        var transform = TweenManager.parseTransform(_startTransform);
        if (!transform.length) {
            for (var i = TweenManager.Transforms.length-1; i > -1; i--) {
                var key = TweenManager.Transforms[i];
                _startTransform[key] = key == 'scale' ? 1 : 0;
            }
        }

        _startProps = {};
        for (key in _props) {
            _startProps[key] = _object.css(key);
        }
    }

    function initCSSTween(values) {
        if (killed()) return;
        if (_object._cssTween) _object._cssTween.kill = true;
        _object._cssTween = _this;
        _object.div._transition = true;

        var strings = (function() {
            if (!values) {
                return buildStrings(_time, _ease, _delay);
            } else {
                return buildStrings(values.time, values.ease, values.delay);
            }
        })();

        _object.willChange(strings.props);

        var time = values ? values.time : _time;
        var delay = values ? values.delay : _delay;
        var props = values ? values.props : _props;
        var transformProps = values ? values.transform : _transformProps;

        Render.setupTween(function() {
            if (killed()) return;
            _object.div.style[Device.styles.vendorTransition] = strings.transition;
            _this.playing = true;

            if (Device.browser.safari) {
                Render.setupTween(function() {
                    if (killed()) return;
                    _object.css(props);
                    _object.transform(transformProps);
                });
            } else {
                _object.css(props);
                _object.transform(transformProps);
            }

            if (_callback || _stack) {
                Timer.create(function() {
                    if (killed()) return;
                    if (!_stack) {
                        clearCSSTween();
                        if (_callback) _callback();
                    } else {
                        executeNextInStack()
                    }
                }, time + delay);
            } else {
                _object.div.addEventListener(Device.tween.complete, tweenComplete, false);
            }
        });
    }

    function executeNextInStack() {
        if (killed()) return;

        var values = _stack.shift();
        if (!values) {
            clearCSSTween();
            if (_callback) _callback;
        } else {
            var strings = buildStrings(values.time, values.ease, values.delay);
            _object.div.style[Device.styles.vendorTransition] = strings.transition;
            _object.css(values.props);
            _object.transform(values.transform);
            Timer.create(executeNextInStack, values.time);
        }
    }

    function buildStrings(time, ease, delay) {
        var props = '';
        var str = '';
        var len = _transitionProps.length;
        for (var i = 0; i < len; i++) {
            var transitionProp = _transitionProps[i];
            props += (props.length ? ', ' : '') + transitionProp;
            str += (str.length ? ', ' : '') + transitionProp + ' ' + time+'ms ' + TweenManager.getEase(ease) + ' ' + delay+'ms';
        }

        return {props: props, transition: str};
    }

    function clearCSSTween() {
        if (_object && _object.div) _object.div.removeEventListener(Device.tween.complete, tweenComplete, false);
        if (killed()) return;
        _this.playing = false;
        _object._cssTween = null;
        _object.willChange(null);
        _object = _props = null;
        _this = null;
        Utils.nullObject(this);
    }

    //*** Event handlers
    function tweenComplete() {
        if (!_callback && _this.playing) clearCSSTween();
    }

    //*** Public methods
    this.stop = function() {
        if (_object && _object.div) _object.div.removeEventListener(Device.tween.complete, tweenComplete, false);
        if (!this.playing) return;
        this.kill = true;
        this.playing = false;
        _object.div.style[Device.styles.vendorTransition] = '';
        _object.div._transition = false;
        _object.willChange(null);
        _object._cssTween = null;
        _this = null;
        Utils.nullObject(this);
    }
});

Class(function FrameTween(_object, _props, _time, _ease, _delay, _callback, _manual) {
    var _this = this;
    var _endValues, _transformEnd, _transformStart, _startValues;
    var _isTransform, _isCSS, _transformProps;
    var _cssTween, _transformTween;

    this.playing = true;

    //*** Constructor
    (function () {
        if (typeof _ease === 'object') _ease = 'easeOutCubic';
        if (_object && _props) {
            if (typeof _time !== 'number') throw 'FrameTween Requires object, props, time, ease';
            initValues();
            startTween();
        }
    })();

    function killed() {
        return _this.kill || !_object || !_object.div;
    }

    function initValues() {
        if (_props.math) delete _props.math;
        if (Device.tween.transition && _object.div._transition) {
            _object.div.style[Device.styles.vendorTransition] = '';
            _object.div._transition = false;
        }

        _endValues = new DynamicObject();
        _transformEnd = new DynamicObject();
        _transformStart = new DynamicObject();
        _startValues = new DynamicObject();

        if (!_object.multiTween) {
            if (typeof _props.x === 'undefined') _props.x = _object.x;
            if (typeof _props.y === 'undefined') _props.y = _object.y;
            if (typeof _props.z === 'undefined') _props.z = _object.z;
        }

        for (var key in _props) {
            if (TweenManager.checkTransform(key)) {
                _isTransform = true;
                _transformStart[key] = _object[key] || (key == 'scale' ? 1 : 0);
                _transformEnd[key] = _props[key];
            } else {
                _isCSS = true;
                var v = _props[key];
                if (typeof v === 'string') {
                    _object.div.style[key] = v;
                } else if (typeof v === 'number') {
                    _startValues[key] = Number(_object.css(key));
                    _endValues[key] = v;
                }
            }
        }
    }

    function startTween() {
        if (_object._cssTween && !_manual && !_object.multiTween) _object._cssTween.kill = true;

        if (_object.multiTween) {
            if (!_object._cssTweens) _object._cssTweens = [];
            _object._cssTweens.push(_this);
        }

        _object._cssTween = _this;
        _this.playing = true;
        _props = _startValues.copy();
        _transformProps = _transformStart.copy();

        if (_isCSS) _cssTween = TweenManager.tween(_props, _endValues, _time, _ease, _delay, tweenComplete, update, _manual);
        if (_isTransform) _transformTween = TweenManager.tween(_transformProps, _transformEnd, _time, _ease, _delay, (!_isCSS ? tweenComplete : null), (!_isCSS ? update : null), _manual);
    }

    function clear() {
        if (_object._cssTweens) {
            _object._cssTweens.findAndRemove(_this);
        }

        _this.playing = false;
        _object._cssTween = null;
        _object = _props = null;
    }

    //*** Event handlers
    function update() {
        if (killed()) return;
        if (_isCSS) _object.css(_props);
        if (_isTransform) {
            if (_object.multiTween) {
                for (var key in _transformProps) {
                    if (typeof _transformProps[key] === 'number') _object[key] = _transformProps[key];
                }
                _object.transform();
            } else {
                _object.transform(_transformProps);
            }
        }
    }

    function tweenComplete() {
        if (_this.playing) {
            clear();
            if (_callback) _callback();
        }
    }

    //*** Public methods
    this.stop = function() {
        if (!this.playing) return;
        if (_cssTween && _cssTween.stop) _cssTween.stop();
        if (_transformTween && _transformTween.stop) _transformTween.stop();
        clear();
    }

    this.interpolate = function(elapsed) {
        if (_cssTween) _cssTween.interpolate(elapsed);
        if (_transformTween) _transformTween.interpolate(elapsed);
        update();
    }

    this.setEase = function(ease) {
        if (_cssTween) _cssTween.setEase(ease);
        if (_transformTween) _transformTween.setEase(ease);
    }
});

Class(function CSSWebAnimation(_object, _props, _time, _ease, _delay, _callback) {
    var _this = this;
    var _transform, _start, _end, _tween;
    var _properties, _killed, _transformValues, _startTransform;

    //*** Constructor
    (function () {
        if (_object._cssTween) _object._cssTween.stop();
        initProperties();
        initTransform();
        initStart();
        initEnd();
        Render.setupTween(initAnimation);
    })();

    function initProperties() {
        var properties = [];

        var transform = false;
        for (var key in _props) {
            if (TweenManager.checkTransform(key)) {
                transform = true;
            } else {
                if (typeof _props[key] === 'number' || key.strpos('-')) properties.push(key);
            }
        }

        if (transform) properties.push(Device.transformProperty);

        _object.willChange(properties);

        if (_object._cssTween) _object._cssTween.kill = true;
        _object._cssTween = _this;
        _object.div._transition = true;
    }

    function initTransform() {
        var transform = TweenManager.getAllTransforms(_object);

        for (var key in _props) {
            if (TweenManager.checkTransform(key)) {
                transform[key] = _props[key];
                delete _props[key];
            }
        }

        _transformValues = transform;
        _transform = TweenManager.parseTransform(transform);
    }

    function initStart() {
        _startTransform = TweenManager.getAllTransforms(_object);

        var transform = TweenManager.parseTransform(_startTransform);
        if (!transform.length) {
            transform = 'translate3d(0, 0, 0)';
            for (var i = TweenManager.Transforms.length-1; i > -1; i--) {
                var key = TweenManager.Transforms[i];
                _startTransform[key] = key == 'scale' ? 1 : 0;
            }
        }

        _start = {};

        if (_transform) {
            _start['transform'] = transform;
        }

        for (var key in _props) {
            _start[key] = _object.css(key);
        }
    }

    function initEnd() {
        _end = {};
        if (_transform) {
            _end['transform'] = _transform;
        }

        for (var key in _props) {
            _end[key] = _props[key];
        }
    }

    function initAnimation() {
        _this.playing = true;
        _tween = _object.div.animate([_start, _end], {duration: _time, delay: _delay, easing: TweenManager.getEase(_ease), fill: 'forwards'});
        _tween.addEventListener('finish', tweenComplete);
    }

    function killed() {
        return !_this || _this.kill || !_object || !_object.div;
    }

    function clear() {
        _this.playing = false;
        _object = _props = null;
        _this = null;
        _tween = null;
        Utils.nullObject(this);
    }

    function applyValues() {
        _object.css(_props);
        _object.transform(_transformValues);
    }

    function interpolate(start, end, alpha) {
        return TweenManager.interpolate(start + (end - start), alpha, _ease);
    }

    function stopValues() {
        if (!_tween) return;
        var elapsed = _tween.currentTime / _time;

        var transform = {};
        var css = {};

        for (var key in _transformValues) {
            transform[key] = interpolate(_startTransform[key], _transformValues[key], elapsed);
        }

        for (key in _props) {
            css[key] = TweenManager.interpolate(_start[key], _props[key], elapsed);
        }

        _object.css(css);
        _object.transform(transform);
    }

    //*** Event handlers
    function tweenComplete() {
        if (killed()) return;
        applyValues();
        _object.willChange(null);
        if (_callback) Render.nextFrame(_callback);
        clear();
    }

    //*** Public methods
    this.stop = function() {
        if (!_this || !_this.playing) return;
        stopValues();
        _this.kill = true;
        _this.playing = false;
        _object.willChange(null);
        _tween.pause();
        clear();
    }
});

TweenManager.Class(function Interpolation() {
    
    function calculateBezier(aT, aA1, aA2) {
        return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
    }
    
    function getTForX(aX, mX1, mX2) {
        var aGuessT = aX;
        for (var i = 0; i < 4; i++) {
            var currentSlope = getSlope(aGuessT, mX1, mX2);
            if (currentSlope == 0.0) return aGuessT;
            var currentX = calculateBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }
    
    function getSlope(aT, aA1, aA2) {
        return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    }
    
    function A(aA1, aA2) { 
        return 1.0 - 3.0 * aA2 + 3.0 * aA1; 
    }
    
    function B(aA1, aA2) { 
        return 3.0 * aA2 - 6.0 * aA1; 
    }
    
    function C(aA1) { 
        return 3.0 * aA1; 
    }
    
    this.convertEase = function(ease) {
        var fn = (function() {
            switch (ease) {
                case 'easeInQuad': return TweenManager.Interpolation.Quad.In; break;
                case 'easeInCubic': return TweenManager.Interpolation.Cubic.In; break;
                case 'easeInQuart': return TweenManager.Interpolation.Quart.In; break;
                case 'easeInQuint': return TweenManager.Interpolation.Quint.In; break;
                case 'easeInSine': return TweenManager.Interpolation.Sine.In; break;
                case 'easeInExpo': return TweenManager.Interpolation.Expo.In; break;
                case 'easeInCirc': return TweenManager.Interpolation.Circ.In; break;
                case 'easeInElastic': return TweenManager.Interpolation.Elastic.In; break;
                case 'easeInBack': return TweenManager.Interpolation.Back.In; break;
                case 'easeInBounce': return TweenManager.Interpolation.Bounce.In; break;
                
                case 'easeOutQuad': return TweenManager.Interpolation.Quad.Out; break;
                case 'easeOutCubic': return TweenManager.Interpolation.Cubic.Out; break;
                case 'easeOutQuart': return TweenManager.Interpolation.Quart.Out; break;
                case 'easeOutQuint': return TweenManager.Interpolation.Quint.Out; break;
                case 'easeOutSine': return TweenManager.Interpolation.Sine.Out; break;
                case 'easeOutExpo': return TweenManager.Interpolation.Expo.Out; break;
                case 'easeOutCirc': return TweenManager.Interpolation.Circ.Out; break;
                case 'easeOutElastic': return TweenManager.Interpolation.Elastic.Out; break;
                case 'easeOutBack': return TweenManager.Interpolation.Back.Out; break;
                case 'easeOutBounce': return TweenManager.Interpolation.Bounce.Out; break;
                
                case 'easeInOutQuad': return TweenManager.Interpolation.Quad.InOut; break;
                case 'easeInOutCubic': return TweenManager.Interpolation.Cubic.InOut; break;
                case 'easeInOutQuart': return TweenManager.Interpolation.Quart.InOut; break;
                case 'easeInOutQuint': return TweenManager.Interpolation.Quint.InOut; break;
                case 'easeInOutSine': return TweenManager.Interpolation.Sine.InOut; break;
                case 'easeInOutExpo': return TweenManager.Interpolation.Expo.InOut; break;
                case 'easeInOutCirc': return TweenManager.Interpolation.Circ.InOut; break;
                case 'easeInOutElastic': return TweenManager.Interpolation.Elastic.InOut; break;
                case 'easeInOutBack': return TweenManager.Interpolation.Back.InOut; break;
                case 'easeInOutBounce': return TweenManager.Interpolation.Bounce.InOut; break;
                            
                case 'linear': return TweenManager.Interpolation.Linear.None; break;
            }
        })();
        
        if (!fn) {
            var curve = TweenManager.getEase(ease, true);
            if (curve) fn = curve;
            else fn = TweenManager.Interpolation.Cubic.Out;
        }
        
        return fn;
    }
    
    this.solve = function(values, elapsed) {
        if (values[0] == values[1] && values[2] == values[3]) return elapsed;
        return calculateBezier(getTForX(elapsed, values[0], values[2]), values[1], values[3]);
    }

    this.Linear = {
        None: function(k) {
            return k;
        }
    }
    this.Quad = {
        In: function(k) {
            return k*k;
        },
        Out: function(k) {
            return k * (2 - k);
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return 0.5 * k * k;
            return - 0.5 * (--k * (k - 2) - 1);
        }
    }
    this.Cubic = {
        In: function(k) {
            return k * k * k;
        },
        Out: function(k) {
            return --k * k * k + 1;
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k;
            return 0.5 * ((k -= 2) * k * k + 2 );
        }
    }
    this.Quart = {
        In: function(k) {
            return k * k * k * k;
        },
        Out: function(k) {
            return 1 - --k * k * k * k;
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k * k;
            return - 0.5 * ((k -= 2) * k * k * k - 2);
        }
    }
    this.Quint = {
        In: function(k) {
            return k * k * k * k * k;
        },
        Out: function(k) {
            return --k * k * k * k * k + 1;
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
            return 0.5 * ((k -= 2) * k * k * k * k + 2);
        }
    }
    this.Sine = {
        In: function(k) {
            return 1 - Math.cos(k * Math.PI / 2);
        },
        Out: function(k) {
            return Math.sin(k * Math.PI / 2);
        },
        InOut: function(k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        }
    }
    this.Expo = {
        In: function(k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        Out: function(k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        },
        InOut: function(k) {
            if (k === 0) return 0;
            if (k === 1) return 1;
            if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
            return 0.5 * (-Math.pow(2, - 10 * (k - 1)) + 2);
        }
    }
    this.Circ = {
        In: function(k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        Out: function(k) {
            return Math.sqrt(1 - --k * k);
        },
        InOut: function(k) {
            if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
            return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
        }
    }
    this.Elastic = {
        In: function(k) {
            var s, a = 0.1, p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
            else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
        },
        Out: function(k) {
            var s, a = 0.1, p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
            else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
        },
        InOut: function(k) {
            var s, a = 0.1, p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
            else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
            return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
        }
    }
    this.Back = {
        In: function(k) {
            var s = 1.70158;
            return k * k * ( ( s + 1 ) * k - s );
        },
        Out: function(k) {
            var s = 1.70158;
            return --k * k * ( ( s + 1 ) * k + s ) + 1;
        },
        InOut: function(k) {
            var s = 1.70158 * 1.525;
            if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
            return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
        }
    }
    this.Bounce = {
        In: function(k) {
            return 1 - this.Bounce.Out( 1 - k );
        },
        Out: function(k) {
            if ( k < ( 1 / 2.75 ) ) {
                return 7.5625 * k * k;
            } else if ( k < ( 2 / 2.75 ) ) {
                return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
            } else if ( k < ( 2.5 / 2.75 ) ) {
                return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
            } else {
                return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
            }
        },
        InOut: function(k) {
            if ( k < 0.5 ) return this.Bounce.In( k * 2 ) * 0.5;
            return this.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;
        }
    }
}, 'Static');

Class(function EasingPath(_curve) {
    Inherit(this, Component);
    var _this = this;
    var _path, _boundsStartIndex, _pathLength, _pool;

    var _precompute = 1450;
    var _step = 1 / _precompute;
    var _rect = 100;
    var _approximateMax = 5;
    var _eps = 0.001;
    var _boundsPrevProgress = -1;
    var _prevBounds = {};
    var _newPoint = {};
    var _samples = [];
    var _using = [];

    //*** Constructor
    (function () {
        initPool();
        initPath();
        preSample();
    })();

    function initPool() {
        _pool = _this.initClass(ObjectPool, Object, 100);
    }

    function initPath() {
        _path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        _path.setAttributeNS(null, 'd', normalizePath(_curve));
        _pathLength = _path.getTotalLength();
    }

    function preSample() {
        var i, j, length, point, progress, ref;
        for (i = j = 0, ref = _precompute; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            progress = i * _step;
            length = _pathLength * progress;
            point = _path.getPointAtLength(length);

            _samples.push({point: point, length: length, progress: progress});
        }
    }

    function normalizePath(path) {
        var svgRegex = /[M|L|H|V|C|S|Q|T|A]/gim;
        var points = path.split(svgRegex);
        points.shift();

        var commands = path.match(svgRegex);
        var startIndex = 0;

        points[startIndex] = normalizeSegment(points[startIndex], 0);

        var endIndex = points.length-1;
        points[endIndex] = normalizeSegment(points[endIndex], _rect);

        return joinNormalizedPath(commands, points);
    }

    function normalizeSegment(segment, value) {
        value = value || 0;
        segment = segment.trim();

        var nRgx = /(-|\+)?((\d+(\.(\d|\e(-|\+)?)+)?)|(\.?(\d|\e|(\-|\+))+))/gim;
        var pairs = getSegmentPairs(segment.match(nRgx));
        var lastPoint = pairs[pairs.length-1];
        var x = lastPoint[0];
        var parsedX = Number(x);
        if (parsedX !== value) {
            segment = '';
            lastPoint[0] = value;
            for (var i = 0; i < pairs.length; i++) {
                var point = pairs[i];
                var space = i === 0 ? '' : ' ';
                segment += '' + space + point[0] + ',' + point[1];
            }
        }

        return segment;
    }

    function joinNormalizedPath(commands, points) {
        var normalizedPath = '';
        for (var i = 0; i < commands.length; i++) {
            var command = commands[i];
            var space = i === 0 ? '' : ' ';
            normalizedPath += '' + space + command + (points[i].trim());
        }

        return normalizedPath;
    }

    function getSegmentPairs(array) {
        if (array.length % 2 !== 0) throw 'EasingPath :: Failed to parse path -- segment pairs are not even.';

        var newArray = [];
        for (var i = 0; i < array.length; i += 2) {
            var value = array[i];
            var pair = [array[i], array[i+1]];
            newArray.push(pair);
        }

        return newArray;
    }

    function findBounds(array, p) {
        if (p == _boundsPrevProgress) return _prevBounds;

        if (!_boundsStartIndex) _boundsStartIndex = 0;

        var len = array.length;
        var loopEnd, direction, start;
        if (_boundsPrevProgress > p) {
            loopEnd = 0;
            direction = 'reverse';
        } else {
            loopEnd = len;
            direction = 'forward';
        }

        if (direction == 'forward') {
            start = array[0];
            end = array[array.length - 1];
        } else {
            start = array[array.length - 1];
            end = array[0];
        }

        var i, j, ref, ref1, buffer;
        for (i = j = ref = _boundsStartIndex, ref1 = loopEnd; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
            var value = array[i];
            var pointX = value.point.x / _rect;
            var pointP = p;

            if (direction == 'reverse') {
                buffer = pointX;
                pointX = pointP;
                pointP = buffer;
            }

            if (pointX < pointP) {
                start = value;
                _boundsStartIndex = i;
            } else {
                end = value;
                break;
            }
        }

        _boundsPrevProgress = p;
        _prevBounds.start = start;
        _prevBounds.end = end;

        return _prevBounds;
    }

    function checkIfBoundsCloseEnough(p, bounds) {
        var point;
        var y = checkIfPointCloseEnough(p, bounds.start.point);
        if (y) return y;
        return checkIfPointCloseEnough(p, bounds.end.point);
    }

    function findApproximate(p, start, end, approximateMax) {
        approximateMax = approximateMax || _approximateMax;

        var approximation = approximate(start, end, p);
        var point = _path.getPointAtLength(approximation);
        var x = point.x / _rect;

        if (closeEnough(p, x)) {
            return resolveY(point);
        } else {
            if (approximateMax-- < 1) {
                return resolveY(point);
            }

            var newPoint = _pool.get();
            newPoint.point = point;
            newPoint.length = approximation;
            _using.push(newPoint);
            if (p < x) return findApproximate(p, start, newPoint, approximateMax)
            else return findApproximate(p, newPoint, end, approximateMax);
        }
    }

    function approximate(start, end, p) {
        var deltaP = end.point.x - start.point.x;
        var percentP = (p - (start.point.x / _rect)) / (deltaP / _rect);
        return start.length + percentP * (end.length - start.length);
    }

    function checkIfPointCloseEnough(p, point) {
        if (closeEnough(p, point.x / _rect)) return resolveY(point);
    }

    function closeEnough(n1, n2) {
        return Math.abs(n1 - n2) < _eps;
    }

    function resolveY(point) {
        return 1 - (point.y / _rect);
    }

    function cleanUpObjects() {
        for (var i = _using.length-1; i > -1; i--) {
            _pool.put(_using[i]);
        }

        _using.length = 0;
    }

    //*** Public methods
    this.solve = function(p) {
        p = Utils.clamp(p, 0, 1);
        var bounds = findBounds(_samples, p);
        var res = checkIfBoundsCloseEnough(p, bounds);
        var output = res;
        if (!output) output = findApproximate(p, bounds.start, bounds.end);

        cleanUpObjects();

        return output;
    }
});

Class(function MathTween(_object, _props, _time, _ease, _delay, _update, _callback, _manual) {
    var _this = this;

    var _startTime, _startValues, _endValues, _currentValues;
    var _easeFunction, _paused, _newEase, _stack, _current;

    var _elapsed = 0;

    //*** Constructor
    (function() {
        if (_object && _props) {
            if (typeof _time !== 'number') throw 'MathTween Requires object, props, time, ease';
            start();
            if (typeof _ease == 'object' && !Array.isArray(_ease)) initStack();
        }
    })();
    
    function start() {
        if (!_object.multiTween && _object._mathTween && !_manual) TweenManager.clearTween(_object);
        if (!_manual) TweenManager._addMathTween(_this);

        _object._mathTween = _this;
        if (_object.multiTween) {
            if (!_object._mathTweens) _object._mathTweens = [];
            _object._mathTweens.push(_this);
        }

        if (typeof _ease == 'string') {
            _ease = TweenManager.Interpolation.convertEase(_ease);
            _easeFunction = typeof _ease === 'function';
        } else if (Array.isArray(_ease)) {
            _easeFunction = false;
            _ease = TweenManager.getEase(_ease, true);
        }
        
        _startTime = Date.now();
        _startTime += _delay;
        _endValues = _props;
        _startValues = {};

        _this.startValues = _startValues;

        for (var prop in _endValues) {
            if (typeof _object[prop] === 'number') _startValues[prop] = _object[prop];
        }
    }

    function initStack() {
        var prevTime = 0;

        var interpolate = function(start, end, alpha, ease, prev, key) {
            var last = prev[key];
            if (last) start += last;

            return TweenManager.interpolateValues(start, end, alpha, ease);
        };

        _stack = [];

        for (var p in _ease) {
            var perc = p.strpos('%') ? Number(p.replace('%', '')) / 100 : ((Number(p)+1) / _ease.length);
            if (isNaN(perc)) continue;

            var ease = _ease[p];

            var last = _stack[_stack.length-1];
            var props = {};
            var pr = last ? last.end : {};
            var zeroOut = !last;

            for (var key in _startValues) {
                props[key] = interpolate(_startValues[key], _endValues[key], perc, ease, pr, key);
                if (zeroOut) pr[key] = _startValues[key];
            }

            var time = (perc * _time) - prevTime;
            prevTime += time;

            _stack.push({percent: perc, ease: ease, start: pr, end: props, time: time});
        }

        _currentValues = _stack.shift();
    }
    
    function clear() {
        if (!_object && !_props) return false;
        _object._mathTween = null;
        TweenManager._removeMathTween(_this);
        Utils.nullObject(_this);

        if (_object._mathTweens) {
            _object._mathTweens.findAndRemove(_this);
        }
    }

    function updateSingle(time) {
        _elapsed = (time - _startTime) / _time;
        _elapsed = _elapsed > 1 ? 1 : _elapsed;

        var delta = _easeFunction ? _ease(_elapsed) : TweenManager.Interpolation.solve(_ease, _elapsed);

        for (var prop in _startValues) {
            if (typeof _startValues[prop] === 'number') {
                var start = _startValues[prop];
                var end = _endValues[prop];
                _object[prop] = start + (end - start) * delta;
            }
        }

        if (_update) _update(delta);
        if (_elapsed == 1) {
            if (_callback) _callback();
            clear();
        }
    }

    function updateStack(time) {
        var v = _currentValues;
        if (!v.elapsed) {
            v.elapsed = 0;
            v.timer = 0;
        }

        v.timer += Render.DELTA;
        v.elapsed = v.timer / v.time;

        if (v.elapsed < 1) {
            for (var prop in v.start) {
                _object[prop] = TweenManager.interpolateValues(v.start[prop], v.end[prop], v.elapsed, v.ease);
            }

            if (_update) _update(v.elapsed);
        } else {
            _currentValues = _stack.shift();
            if (!_currentValues) {
                if (_callback) _callback();
                clear();
            }
        }

    }

    //*** Event Handlers

    //*** Public methods
    this.update = function(time) {
        if (_paused || time < _startTime) return;

        if (_stack) updateStack(time);
        else updateSingle(time);
    }
    
    this.pause = function() {
        _paused = true;
    }
    
    this.resume = function() {
        _paused = false;
        _startTime = Date.now() - (_elapsed * _time);
    }
    
    this.stop = function() {
        _this.stopped = true;
        clear();
        return null;
    }

    this.setEase = function(ease) {
        if (_newEase != ease) {
            _newEase = ease;
            _ease = TweenManager.Interpolation.convertEase(ease);
            _easeFunction = typeof _ease === 'function';
        }
    }

    this.interpolate = function(elapsed) {
        var delta = _easeFunction ? _ease(elapsed) : TweenManager.Interpolation.solve(_ease, elapsed);

        for (var prop in _startValues) {
            if (typeof _startValues[prop] === 'number' && typeof _endValues[prop] === 'number') {
                var start = _startValues[prop];
                var end = _endValues[prop];
                _object[prop] = start + (end - start) * delta;
            }
        }
    }
});

Class(function SpringTween(_object, _props, _friction, _ease, _delay, _update, _callback) {
    var _this = this;
    var _startTime, _velocityValues, _endValues, _startValues;
    var _damping, _friction, _count, _paused;

    //*** Constructor
    (function() {
        if (_object && _props) {
            if (typeof _friction !== 'number') throw 'SpringTween Requires object, props, time, ease';
            start();
        }
    })();
    
    function start() {
        TweenManager.clearTween(_object);
        _object._mathTween = _this;
        TweenManager._addMathTween(_this);
                
        _startTime = Date.now();
        _startTime += _delay;
        _endValues = {};
        _startValues = {};
        _velocityValues = {};

        if (_props.x || _props.y || _props.z) {
            if (typeof _props.x === 'undefined') _props.x = _object.x;
            if (typeof _props.y === 'undefined') _props.y = _object.y;
            if (typeof _props.z === 'undefined') _props.z = _object.z;
        }
        
        _count = 0;
        _damping = _props.damping || 0.5;
        delete _props.damping;
                
        for (var prop in _props) {
            if (typeof _props[prop] === 'number') {
                _velocityValues[prop] = 0;
                _endValues[prop] = _props[prop];
            }
        }
        
        for (prop in _props) {
            if (typeof _object[prop] === 'number') {
                _startValues[prop] = _object[prop] || 0;
                _props[prop] = _startValues[prop];
            }
        }
    }
    
    function clear(stop) {
        if (_object) {
            _object._mathTween = null;

            if (!stop) {
                for (var prop in _endValues) {
                    if (typeof _endValues[prop] === 'number') _object[prop] = _endValues[prop];
                }

                if (_object.transform) _object.transform();
            }
        }
        
        TweenManager._removeMathTween(_this);
    }

    //*** Event handlers

    //*** Public Methods
    this.update = function(time) {
        if (time < _startTime || _paused) return;
        
        var vel;
        for (var prop in _startValues) {
            if (typeof _startValues[prop] === 'number') {
                var start = _startValues[prop];
                var end = _endValues[prop];
                var val = _props[prop];
                
                var d = end - val;
                var a = d * _damping;
                _velocityValues[prop] += a;
                _velocityValues[prop] *= _friction;
                _props[prop] += _velocityValues[prop];
                _object[prop] = _props[prop];   
                
                vel = _velocityValues[prop];             
            }
        }
        
        if (Math.abs(vel) < 0.1) {
            _count++;
            if (_count > 30) {
                if (_callback) _callback.apply(_object);
                clear();
            }
        }
        
        if (_update) _update(time);
        if (_object.transform) _object.transform();
    }

    this.pause = function() {
        _paused = true;
    }
    
    this.stop = function() {
        clear(true);
        return null;
    }
});

Class(function TweenTimeline() {
    Inherit(this, Component);
    var _this = this;
    var _tween;

    var _total = 0;
    var _tweens = [];

    this.elapsed = 0;

    //*** Constructor
    (function () {

    })();

    function calculate() {
        _tweens.sort(function(a, b) {
            var ta = a.time + a.delay;
            var tb = b.time + b.delay;
            return tb - ta;
        });

        var first = _tweens[0];
        _total = first.time + first.delay;
    }

    function loop() {
        var time = _this.elapsed * _total;
        for (var i = _tweens.length-1; i > -1; i--) {
            var t = _tweens[i];
            var relativeTime = time - t.delay;
            var elapsed = Utils.clamp(relativeTime / t.time, 0, 1);

            t.interpolate(elapsed);
        }
    }

    //*** Event handlers

    //*** Public methods
    this.add = function(object, props, time, ease, delay) {
        var tween;
        if (object instanceof HydraObject) tween = new FrameTween(object, props, time, ease, delay, null, true);
        else tween = new MathTween(object, props, time, ease, delay, null, null, true);
        _tweens.push(tween);

        tween.time = time;
        tween.delay = delay || 0;

        calculate();

        return tween;
    }

    this.tween = function(to, time, ease, delay, callback) {
        this.stopTween();
        _tween = TweenManager.tween(_this, {elapsed: to}, time, ease, delay, callback);
    }

    this.stopTween = function() {
        if (_tween && _tween.stop) _tween.stop();
    }

    this.startRender = function() {
        Render.startRender(loop);
    }

    this.stopRender = function() {
        Render.stopRender(loop);
    }

    this.update = function() {
        loop();
    }

    this.destroy = function() {
        Render.stopRender(loop);
        for (var i = 0; i < _tweens.length; i++) _tweens[i].stop();
        return this._destroy();
    }
});

Class(function Shaders() {
    var _this = this;

    //*** Constructor
    (function () {

    })();

    function parseCompiled(shaders) {
        var split = shaders.split('{@}');
        split.shift();

        for (var i = 0; i < split.length; i += 2) {
            var name = split[i];
            var text = split[i+1];
            _this[name] = text;
        }
    }

    function parseRequirements() {
        for (var key in _this) {
            var obj = _this[key];
            if (typeof obj === 'string') {
                _this[key] = require(obj);
            }
        }
    }

    function require(shader) {
        if (!shader.strpos('require')) return shader;

        shader = shader.replace(/# require/g, '#require');
        while (shader.strpos('#require')) {
            var split = shader.split('#require(');
            var name = split[1].split(')')[0];
            name = name.replace(/ /g, '');

            if (!_this[name]) throw 'Shader required '+name+', but not found in compiled shaders.\n'+shader;

            shader = shader.replace('#require('+name+')', _this[name]);
        }

        return shader;
    }

    //*** Event handlers

    //*** Public methods
    this.parse = function(code, file) {
        if (!code.strpos('{@}')) {
            file = file.split('/');
            file = file[file.length-1];

            _this[file] = code;
        } else {
            parseCompiled(code);
            parseRequirements();
        }
    }

    this.getShader = function(string) {
        if (_this.FALLBACKS) {
            if (_this.FALLBACKS[string]) {
                string = _this.FALLBACKS[string];
            }
        }

        return _this[string];
    }
}, 'static');

Class(function RenderPerformance() {
    Inherit(this, Component);
    var _this = this;

    var _time;
    var _times = [];
    var _fps = [];

    this.enabled = true;
    this.pastFrames = 60;

    //*** Public methods
    this.time = function() {
        if (!this.enabled) return;

        if (!_time) {
            _time = performance.now();
        } else {
            var t = performance.now() - _time;
            _time = null;

            _times.unshift(t);
            if (_times.length > this.pastFrames) _times.pop();

            _fps.unshift(Render.FPS);
            if (_fps.length > this.pastFrames) _fps.pop();

            this.average = 0;
            var len = _times.length;
            for (var i = 0; i < len; i++) {
                this.average += _times[i];
            }

            this.average /= len;

            this.averageFPS = 0;
            len = _fps.length;
            for (i = 0; i < len; i++) {
                this.averageFPS += _fps[i];
            }

            this.averageFPS /= len;
        }
    }

    this.clear = function() {
        _times.length = 0;
    }

    this.dump = function() {
        console.log(_times);
    }

    this.get('times', function() {
        return _times;
    });

    this.get('median', function() {
        _times.sort(function(a, b) {
            return a - b;
        });

        return _times[~~(_times.length/2)];
    });
});







Class(function SVG() {
	var _symbols = [];

	(function() {
		// SVG innerHTML SHIM
		(function(g){var b=["SVGSVGElement","SVGGElement"],d=document.createElement("dummy");if(!b[0]in g)return!1;if(Object.defineProperty){var e={get:function(){d.innerHTML="";Array.prototype.slice.call(this.childNodes).forEach(function(a){d.appendChild(a.cloneNode(!0))});return d.innerHTML},set:function(a){var b=this,e=Array.prototype.slice.call(b.childNodes),f=function(a,c){if(1!==c.nodeType)return!1;var b=document.createElementNS("http://www.w3.org/2000/svg",c.nodeName.toLowerCase());Array.prototype.slice.call(c.attributes).forEach(function(a){b.setAttribute(a.name,
			a.value)});"TEXT"===c.nodeName&&(b.textContent=c.innerHTML);a.appendChild(b);c.childNodes.length&&Array.prototype.slice.call(c.childNodes).forEach(function(a){f(b,a)})},a=a.replace(/<(\w+)([^<]+?)\/>/,"<$1$2></$1>");e.forEach(function(a){a.parentNode.removeChild(a)});d.innerHTML=a;Array.prototype.slice.call(d.childNodes).forEach(function(a){f(b,a)})},enumerable:!0,configurable:!0};try{b.forEach(function(a){Object.defineProperty(window[a].prototype,"innerHTML",e)})}catch(h){}}else Object.prototype.__defineGetter__&&
		b.forEach(function(a){window[a].prototype.__defineSetter__("innerHTML",e.set);window[a].prototype.__defineGetter__("innerHTML",e.get)})})(window);
	}());

	function checkID(id) {
		for (var i = 0; i < _symbols.length; i++) {
			if (_symbols[i].id == id) return true;
		}
	}

	function getConfig(id) {
		for (var i = 0; i < _symbols.length; i++) {
			if (_symbols[i].id == id) return _symbols[i];
		}
	}

	this.defineSymbol = function(id, width, height, innerHTML) {
		if (checkID(id)) throw 'SVG symbol '+id+' is already defined';

		//var svg = $(id+'def', 'svg', false, true);
		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute('style', 'display: none;');
		svg.setAttribute('width', width);
		svg.setAttribute('height', height);
		//svg.div.setAttributeNS("http://www.w3.org/2000/xmlns/", 'viewBox', '0 0 '+width+' '+height);
		svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		svg.innerHTML = '<symbol id="'+id+'">'+innerHTML+'</symbol>';
		document.body.insertBefore(svg, document.body.firstChild);

		_symbols.push({id: id, width: width, height: height});
	}

	this.getSymbolConfig = function(id) {
		var config = getConfig(id);
		if (typeof config == 'undefined') throw 'SVG symbol ' + id + ' is not defined';

		return config;
	}

}, 'Static');

Class(function AssetLoader(_assets, _complete, _images) {
    Inherit(this, Component);
    var _this = this;
    var _total = 0;
    var _loaded = 0;
    var _added = 0;
    var _triggered = 0;
    var _lastTriggered = 0;
    var _queue, _qLoad;
    var _output, _loadedFiles;
    
    //*** Constructor
    (function() {
        if (typeof _complete !== 'function') {
            _images = _complete;
            _complete = null;
        }

        _queue = []
        _loadedFiles = [];
        prepareAssets();
        _this.delayedCall(startLoading, 10);
    })();

    function prepareAssets() {
        for (var i = 0; i < _assets.length; i++) {
            if (typeof _assets[i] !== 'undefined') {
                _total++;
                _queue.push(_assets[i]);
            }
        }
    }

    function startLoading() {
        _qLoad = Math.round(_total * .5);
        for (var i = 0; i < _qLoad; i++) {
            loadAsset(_queue[i]);
        }
    }

    function missingFiles() {
        if (!_queue) return;
        var missing = [];

        for (var i = 0; i < _queue.length; i++) {
            var loaded = false;
            for (var j = 0; j < _loadedFiles.length; j++) {
                if (_loadedFiles[j] == _queue[i]) loaded = true;
            }
            if (!loaded) missing.push(_queue[i]);
        }

        if (missing.length) {
            console.log('AssetLoader Files Failed To Load:');
            console.log(missing);
        }
    }

    function loadAsset(asset) {
        if (!asset) return;
        var name = asset.split('/');
        name = name[name.length-1];
        var split = name.split('.');
        var ext = split[split.length-1].split('?')[0];

        switch (ext) {
            case 'html':
                XHR.get(asset, function(contents) {
                    Hydra.HTML[split[0]] = contents;
                    assetLoaded(asset);
                }, 'text');
            break;

            case 'js':
            case 'php':
            case undefined:
                XHR.get(asset, function(script) {
                    script = script.replace('use strict', '');
                    eval.call(window, script);
                    assetLoaded(asset);
                }, 'text');
            break;

            case 'csv':
            case 'json':
                XHR.get(asset, function(contents) {
                    Hydra.JSON[split[0]] = contents;
                    assetLoaded(asset);
                }, ext == 'csv' ? 'text' : null);
            break;

            case 'fs':
            case 'vs':
                XHR.get(asset, function(contents) {
                    Shaders.parse(contents, asset);//weak
                    assetLoaded(asset);
                }, 'text');
            break;

            default:
                var image = new Image();
				image.crossOrigin = '';
                image.src = asset;
                image.onload = function() {
                    assetLoaded(asset);
                    if (_images) _images[asset] = image;
                }
            break;
        }
    }

    function checkQ() {
        if (_loaded == _qLoad && _loaded < _total) {
            var start = _qLoad;
            _qLoad *= 2;
            for (var i = start; i < _qLoad; i++) {
                if (_queue[i]) loadAsset(_queue[i]);
            }
        }
    }

    function assetLoaded(asset) {
        if (_queue) {
            _loaded++;
            _this.events.fire(HydraEvents.PROGRESS, {percent: _loaded/_total});
            _loadedFiles.push(asset);
            clearTimeout(_output);

            checkQ();
            if (_loaded == _total) {
                _this.complete = true;
                Render.nextFrame(function() {
                    if (_this.events) _this.events.fire(HydraEvents.COMPLETE, null, true);
                    if (_complete) _complete();
                });
            } else {
                _output = _this.delayedCall(missingFiles, 5000);
            }
        }
    }

    this.add = function(num) {
        _total += num;
        _added += num;
    }

    this.trigger = function(num) {
        num = num || 1;
        for (var i = 0; i < num; i++) assetLoaded('trigger');
    }
    
    this.triggerPercent = function(percent, num) {
        num = num || _added;
        var trigger = Math.ceil(num * percent);
        if (trigger > _lastTriggered) this.trigger(trigger - _lastTriggered);
        _lastTriggered = trigger;
    }

    this.destroy = function() {
        _assets = null;
        _loaded = null;
        _queue = null;
        _qLoad = null;
        return this._destroy();
    }
}, function() {

    AssetLoader.loadAllAssets = function(callback, cdn) {
        cdn = cdn || '';

        var list = [];
        for (var i = 0; i < ASSETS.length; i++) {
            list.push(cdn + ASSETS[i]);
        }

        var assets = new AssetLoader(list, function() {
           if (callback) callback();
            assets = assets.destroy();
        });
    }

    AssetLoader.loadAssets = function(list, callback) {
        var assets = new AssetLoader(list, function() {
            if (callback) callback();
            assets = assets.destroy();
        });
    }

});


Class(function FontLoader(_fonts, _callback) {
    Inherit(this, Component);
    var _this = this;
    var $element;

    //*** Constructor
    (function () {
        initFonts();
        finish();
    })();

    function initFonts() {
        if (!Array.isArray(_fonts)) _fonts = [_fonts];
        $element = Stage.create('FontLoader');
        for (var i = 0; i < _fonts.length; i++) {
            var $f = $element.create('font');
            $f.fontStyle(_fonts[i], 12, '#000').text('LOAD').css({top: -999});
        }
    }

    function finish() {
        _this.delayedCall(function() {
            $element.remove();
            if (_callback) _callback();
            else _this.events.fire(HydraEvents.COMPLETE);
        }, 500);
    }

    //*** Event handlers

    //*** Public methods

}, function() {

    FontLoader.loadFonts = function(fonts, callback) {
        var loader = new FontLoader(fonts, function() {
            if (callback) callback();
            loader = null;
        });
    }

});







Class(function XHR() {
    var _this = this;
    var _serial;

    var _android = window.location.href.strpos('file://');

    this.headers = {};

    function serialize(key, data) {
        if (typeof data === 'object') {
            for (var i in data) {
                var newKey = key+'['+i+']';
                if (typeof data[i] === 'object') serialize(newKey, data[i]);
                else _serial.push(newKey+'='+data[i]);
            }
        } else {
            _serial.push(key+'='+data);
        }
    }

    //*** Public methods
    this.get = function(url, data, callback, type) {
        if (typeof data === 'function') {
            type = callback;
            callback = data;
            data = null;
        } else if (typeof data === 'object') {
            var string = '?';
            for (var key in data) {
                string += key+'='+data[key]+'&';
            }
            string = string.slice(0, -1);
            url += string;
        }
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        for (var key in _this.headers) {
            xhr.setRequestHeader(key, _this.headers);
        }

        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (_android || xhr.status == 200)) {
                if (typeof callback === 'function') {
                    var data = xhr.responseText;
                    if (type == 'text') {
                        callback(data);
                    } else {
                        try {
                            callback(JSON.parse(data));
                        } catch (e) {
                            console.error('XHR Parse: '+url+' : '+e.message);
                        }
                    }
                }
                xhr = null;
            }
        }
    }
    
    this.post = function(url, data, callback, type, header) {
        if (typeof data === 'function') {
            header = type;
            type = callback;
            callback = data;
            data = null;
        } else if (typeof data === 'object') {
            if (callback == 'json' || type == 'json' || header == 'json') {
                data = JSON.stringify(data);
            } else {
                _serial = new Array();
                for (var key in data) serialize(key, data[key]);
                data = _serial.join('&');
                data = data.replace(/\[/g, '%5B');
                data = data.replace(/\]/g, '%5D');
                _serial = null;
            }
        }
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        
        switch (header) {
            case 'upload': header = 'application/upload'; break;
            default: header = 'application/x-www-form-urlencoded'; break;
        }
        xhr.setRequestHeader('Content-type', header);

        for (var key in _this.headers) {
            xhr.setRequestHeader(key, _this.headers);
        }

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (_android || xhr.status == 200)) {
                if (typeof callback === 'function') {
                    var data = xhr.responseText;
                    if (type == 'text') {
                        callback(data);
                    } else {
                        try {
                            callback(JSON.parse(data));
                        } catch (e) {
                            console.error('XHR Parse: '+url+' : '+e.message);
                        }
                    }
                }
                xhr = null;
            }
        }
        xhr.send(data);
    }
}, 'Static');





Class(function Thread(_class) {
    Inherit(this, Component);
    var _this = this;
    var _worker, _callbacks, _path, _mvc;
    
    //*** Constructor
    (function() {
        init();
        importClasses();
        addListeners();
    })();
    
    function init() {
        _path = Thread.PATH;
        _callbacks = {};
        _worker = new Worker(_path + 'assets/js/hydra/hydra-thread.js');
    }

    function importClasses() {
        importClass(Utils);
        importClass(MVC);
        importClass(Component);
        importClass(Events);
        importClass(_class, true);
    }

    function importClass(_class, scoped) {
        if (!_class) return;
        var code, namespace;

        if (!scoped) {
            if (typeof _class !== 'function') {
                namespace = _class.constructor._namespace ? _class.constructor._namespace +'.' : '';
                code = namespace + 'Class(' + _class.constructor.toString() + ', "static");';
            } else {
                namespace = _class._namespace ? _class._namespace+'.' : '';
                code = namespace + 'Class(' + _class.toString() + ');';
            }
        } else {
            code = _class.toString().replace('{', '!!!');
            code = code.split('!!!')[1];

            var splitChar = window._MINIFIED_ ? '=' : ' ';

            while (code.strpos('this')) {
                var split = code.slice(code.indexOf('this.'));
                var name = split.split('this.')[1].split(splitChar)[0];
                code = code.replace('this', 'self');
                createMethod(name);
            }

            code = code.slice(0, -1);
        }

        _worker.postMessage({code: code});
    }

    function createMethod(name) {
        _this[name] = function(message, callback) {
            _this.send(name, message, callback);
        };
    }
    
    //*** Event Handlers
    function addListeners() {
        _worker.addEventListener('message', workerMessage);
    }
    
    function workerMessage(e) {
        if (e.data.console) {

            console.log(e.data.message);

        } else if (e.data.id) {

            var callback = _callbacks[e.data.id];
            if (callback) callback(e.data.message);
            delete _callbacks[e.data.id];

        } else if (e.data.emit) {

            var callback = _callbacks[e.data.evt];
            if (callback) callback(e.data.msg);

        } else {

            var callback = _callbacks['transfer'];
            if (callback) callback(e.data);

        }

    }

    //*** Public methods
    this.on = function(evt, callback) {
        _callbacks[evt] = callback;
    }
    
    this.off = function(evt) {
        delete _callbacks[evt];
    }

    this.loadFunctions = function() {
        for (var i = 0; i < arguments.length; i++) this.loadFunction(arguments[i]);
    }
    
    this.loadFunction = function(code) {
        code = code.toString();
        code = code.replace('(', '!!!');
        var split = code.split('!!!');
        var name = split[0].split(' ')[1];
        code = 'self.'+name+' = function('+split[1];
        _worker.postMessage({code: code});

        createMethod(name);
    }
    
    this.importScript = function(path) {
        _worker.postMessage({path: path, importScript: true});
    }

    this.importClass = function() {
        for (var i = 0; i < arguments.length; i++) {
            var code = arguments[i];
            importClass(code);
        }
    }

    this.send = function(name, message, callback) {
        if (typeof name === 'string') {
            var fn = name;
            message = message || {};
            message.fn = name;    
        } else {
            callback = message;
            message = name;
        }
        
        var id = Utils.timestamp();
        if (callback) _callbacks[id] = callback;

        if (message.transfer) {
            message.msg.id = id;
            message.msg.fn = message.fn;
            message.msg.transfer = true;
            _worker.postMessage(message.msg, message.buffer);
        } else {
            _worker.postMessage({message: message, id: id});
        }
    }
    
    this.destroy = function() {
        if (_worker.terminate) _worker.terminate();
        return this._destroy();
    }
}, function() {
    Thread.PATH = '';
});

Class(function Dev() {
    var _this = this;
    var _post, _alert;
    
    //*** Constructor
    (function() {
        if (Hydra.LOCAL) Hydra.development(true);
    })();
    
    function catchErrors() {
        window.onerror = function(message, file, line) {
            var string = message+' ::: '+file+' : '+line;
            if (_alert) alert(string);
            if (_post) XHR.post(_post+'/api/data/debug', getDebugInfo(string), 'json');
        };
    }

    function getDebugInfo(string) {
        var obj = {};
        obj.err = string;
        obj.ua = Device.agent;
        obj.browser = {width: Stage.width, height: Stage.height};
        return obj;
    }
    
    //*** Event handlers

    //*** Public Methods
    this.alertErrors = function(url) {
        _alert = true;
        if (typeof url === 'string') url = [url];
        for (var i = 0; i < url.length; i++) {
            if (location.href.strpos(url[i]) || location.hash.strpos(url[i])) return catchErrors();
        }
    }

    this.postErrors = function(url, post) {
        _post = post;
        if (typeof url === 'string') url = [url];
        for (var i = 0; i < url.length; i++) {
            if (location.href.strpos(url[i])) return catchErrors();
        }
    }
    
    this.expose = function(name, val, force) {
        if (Hydra.LOCAL || force) window[name] = val;
    }
}, 'Static');



window.ASSETS = ["assets/geometry/hut.json","assets/geometry/tree.json","assets/images/dome/sky-negx.jpg","assets/images/dome/sky-negy.jpg","assets/images/dome/sky-negz.jpg","assets/images/dome/sky-posx.jpg","assets/images/dome/sky-posy.jpg","assets/images/dome/sky-posz.jpg","assets/images/flakes/particle.png","assets/images/ice/depth.jpg","assets/images/ice/normal.jpg","assets/images/rock/normal.jpg","assets/images/snow/diffuse.jpg","assets/images/snow/noise.jpg","assets/images/snow/normal.jpg","assets/images/snow/reflect.jpg","assets/images/snow/stamp.png","assets/images/soil/diffuse0.jpg","assets/images/soil/diffuse1.jpg","assets/images/soil/noise0.jpg","assets/images/soil/normal.jpg","assets/images/stars/center.jpg","assets/images/stars/flare.jpg","assets/images/stars/map.jpg","assets/images/storm/cloud.png","assets/images/textures/hut.jpg","assets/images/textures/leaf.png","assets/images/ui/bg.jpg","assets/images/ui/cardboard.png","assets/images/ui/loader-bg.png","assets/images/ui/loader.png","assets/images/ui/logo.png","assets/images/ui/sound.png","assets/images/ui/stars.png","assets/images/ui/vr.png","assets/js/lib/three.min.js","assets/shaders/compiled.vs"]

Class(function Config() {
    var _this = this;

    this.CDN = (function() {
        if (window.location.href.strpos('neve.activetheory')) return 'http://at-neve.s3-us-west-1.amazonaws.com/';
        return '';
    })();

    this.SALT = '?07011989';

    Hydra.ready(function() {
        Hydra.CDN = _this.CDN;
        Utils3D.PATH = _this.CDN;
        AssetUtil.PATH = _this.CDN;
        if (window.location.href.strpos('neve.activetheory')) Thread.PATH = 'http://neve.activetheory.net/cdn/';
    });

}, 'static');

Class(function NeveEvents() {
    var _this = this;

    this.READY = 'ready';

}, 'static');

Class(function AssetUtil() {
	var _this = this;
	var _assets = {};
	var _exclude = ['!!!'];

	this.PATH = '';

	function canInclude(asset) {
		for (var i = 0; i < _exclude.length; i++) {
			var excl = _exclude[i];
			if (asset.strpos(excl)) return false;
		}

		return true;
	}
	
	this.loadAssets = function(list) {
		var assets = this.get(list);
		var output = [];
		
		for (var i = assets.length-1; i > -1; i--) {
			var asset = assets[i];
			if (!_assets[asset]) {
				output.push(_this.PATH + asset);
				_assets[asset] = 1;
			}
		}

		return output;
	}
	
	this.get = function(list) {
		if (!Array.isArray(list)) list = [list];
		
		var assets = [];
		for (var i = ASSETS.length-1; i > -1; i--) {
			var asset = ASSETS[i];
			
			for (var j = list.length-1; j > -1; j--) {
				var match = list[j];
				if (asset.strpos(match)) {
					if (canInclude(asset)) assets.push(asset + Config.SALT);
				}
			}
		}
		
		return assets;
	}

	this.exclude = function(list) {
		if (!Array.isArray(list)) list = [list];
		for (var i = 0; i < list.length; i++) _exclude.push(list[i]);
	}

	this.loadAllAssets = function(list) {
		var assets = _this.loadAssets(list || '/');
		var loader = new AssetLoader(assets);
	}
}, 'Static');

Class(function Hardware() {
    var _this = this;

    this.CARDBOARD = window.location.search.strpos('cardboard');
    this.OCULUS = window.location.search.strpos('webvr');

    this.VR = this.CARDBOARD || this.OCULUS;
    this.NO_INTERACTION = false;

    this.NO_FX = (function() {
        if (Device.system.os == 'mac' && Device.pixelRatio == 2 && document.documentElement.clientWidth  == 1280 && document.documentElement.clientHeight == 800) return true;
        return false;
    })();

}, 'static');

Class(function BasicPass() {
    Inherit(this, NukePass);
    var _this = this;

    this.fragmentShader = [
        'varying vec2 vUv;',
        'uniform sampler2D tDiffuse;',
        'void main() {',
        'gl_FragColor = texture2D(tDiffuse, vUv);',
        '}'
    ];

    this.init(this.fragmentShader);

});

Class(function Nuke(_stage, _params) {
    Inherit(this, Component);
    var _this = this;

    if (!_params.renderer) console.error('Nuke :: Must define renderer');

    _this.stage = _stage;
    _this.renderer = _params.renderer;
    _this.camera = _params.camera;
    _this.scene = _params.scene;
    _this.rtt = _params.rtt; // optional, if available, renders finally to this and not canvas
    _this.enabled = _params.enabled || true;
    _this.passes = _params.passes || [];
    var _dpr = _params.dpr || 1;

    var _rttPing, _rttPong, _nukeScene, _nukeMesh, _rttCamera;
    var _parameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false};

    //*** Constructor
    (function () {
        initNuke();
        addListeners();
    })();

    function initNuke() {
        var width = _this.stage.width * _dpr;
        var height = _this.stage.height * _dpr;
        _rttPing = new THREE.WebGLRenderTarget(width, height, _parameters);
        _rttPong = new THREE.WebGLRenderTarget(width, height, _parameters);
        _rttCamera = new THREE.OrthographicCamera( _this.stage.width / - 2, _this.stage.width / 2, _this.stage.height / 2, _this.stage.height / - 2, 1, 1000 );

        _nukeScene = new THREE.Scene();
        var geoPass = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
        _nukeMesh = new THREE.Mesh(geoPass, new THREE.MeshBasicMaterial());
        _nukeScene.add(_nukeMesh);
    }

    function finalRender(scene, camera) {
        if (_this.rtt) {
            _this.renderer.render(scene, camera || _this.camera, _this.rtt, true);
        } else {
            _this.renderer.render(scene, camera || _this.camera);
        }
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        var width = _this.stage.width * _dpr;
        var height = _this.stage.height * _dpr;
        if (_rttPing) _rttPing.dispose();
        if (_rttPong) _rttPong.dispose();
        _rttPing = new THREE.WebGLRenderTarget(width, height, _parameters);
        _rttPong = new THREE.WebGLRenderTarget(width, height, _parameters);
        
        _rttCamera.left = _this.stage.width / - 2;
        _rttCamera.right = _this.stage.width / 2;
        _rttCamera.top = _this.stage.height / 2;
        _rttCamera.bottom = _this.stage.height / - 2;
        _rttCamera.updateProjectionMatrix();
    }

    //*** Public methods
    _this.add = function(pass, index) {
        if (typeof index == 'number') {
            _this.passes.splice(index, 0, pass);
            return;
        }
        _this.passes.push(pass);
    };

    _this.remove = function(pass) {
        if (typeof pass == 'number') {
            _this.passes.splice(pass);
        } else {
            _this.passes.findAndRemove(pass);
        }
    };

    _this.renderToTexture = function(clear, rtt) {
        _this.renderer.render(_this.scene, _this.camera, rtt || _rttPing, typeof clear == 'boolean' ? clear : true);
    }

    _this.render = function() {
        if (!_this.enabled || !_this.passes.length) {
            finalRender(_this.scene);
            return;
        }

        if (!_this.multiRender) {
            _this.renderer.render(_this.scene, _this.camera, _rttPing, true);
        }

        var pingPong = true;
        for (var i = 0; i < _this.passes.length - 1; i++) {
            _nukeMesh.material = _this.passes[i].pass;

            _nukeMesh.material.uniforms.tDiffuse.value = pingPong ? _rttPing : _rttPong;
            _this.renderer.render(_nukeScene, _rttCamera, pingPong ? _rttPong : _rttPing);

            pingPong = !pingPong;
        }

        _nukeMesh.material = _this.passes[_this.passes.length - 1].pass;
        _nukeMesh.material.uniforms.tDiffuse.value = pingPong ? _rttPing : _rttPong;
        finalRender(_nukeScene, _rttCamera);
    };

    _this.set('dpr', function(v) {
        _dpr = v || Device.pixelRatio;
        resizeHandler();
    });

    this.get('dpr', function() {
        return _dpr;
    });
});

Class(function NukePass(_fs, _vs) {
    Inherit(this, Component);
    var _this = this;

    //*** Public methods
    this.init = function(fs) {
        _this = this;

        var name = fs || this.constructor.toString().match(/function ([^\(]+)/)[1];
        var fragmentShader = Array.isArray(fs) ? fs.join('') : null;

        _this.uniforms = _this.uniforms || {};
        _this.uniforms.tDiffuse = {type: 't', value: null};

        _this.pass = new THREE.ShaderMaterial({
            uniforms: _this.uniforms,
            vertexShader: typeof _vs === 'string' ? Shaders[name + '.vs'] : 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }',
            fragmentShader: fragmentShader || Shaders[name + '.fs']
        });

        _this.uniforms = _this.pass.uniforms;
    };

    this.set = function(key, value) {
        this.uniforms[key].value = value;
    };

    this.tween = function(key, value, time, ease, delay, callback, update) {
        TweenManager.tween(_this.uniforms[key], {value: value}, time, ease, delay, callback, update);
    };

    if (typeof _fs === 'string') this.init(_fs);
});

Class(function Raycaster(_camera) {
    Inherit(this, Component);
    var _this = this;

    var _mouse = new THREE.Vector3();
    var _raycaster = new THREE.Raycaster();
    var _debug = null;

    //*** Constructor
    (function () {

    })();

    function intersect(objects) {
        var hit;
        if (Array.isArray(objects)) {
            hit = _raycaster.intersectObjects(objects);
        } else {
            hit = _raycaster.intersectObject(objects);
        }

        if (_debug) updateDebug();

        return hit;
    }

    function updateDebug() {
        var vertices = _debug.geometry.vertices;

        vertices[0].copy(_raycaster.ray.origin.clone());
        vertices[1].copy(_raycaster.ray.origin.clone().add(_raycaster.ray.direction.clone().multiplyScalar(10000)));

        vertices[0].x += 1;

        _debug.geometry.verticesNeedUpdate = true;
    }

    //*** Event handlers

    //*** Public methods
    this.set('camera', function(camera) {
        _camera = camera;
    });

    this.debug = function(scene) {
        var geom = new THREE.Geometry();
        geom.vertices.push(new THREE.Vector3(-100, 0, 0));
        geom.vertices.push(new THREE.Vector3(100, 0, 0));

        var mat = new THREE.LineBasicMaterial({color: 0xff0000});
        _debug = new THREE.Line(geom, mat);
        scene.add(_debug);
    }

    this.checkHit = function(objects, mouse) {
        mouse = mouse || Mouse;

        var rect = _this.rect || Stage;
        _mouse.x = (mouse.x / rect.width) * 2 - 1;
        _mouse.y = -(mouse.y / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, _camera);

        return intersect(objects);
    }

    this.checkFromValues = function(objects, origin, direction) {
        _raycaster.set(origin, direction, 0, Number.POSITIVE_INFINITY);

        return intersect(objects);
    }
});

Class(function ScreenProjection(_camera) {
    Inherit(this, Component);
    var _this = this;

    var _v3 = new THREE.Vector3();
    var _value = new THREE.Vector3();

    //*** Constructor
    (function () {

    })();

    //*** Event handlers

    //*** Public methods
    this.set('camera', function(v) {
        _camera = v;
    });

    this.unproject = function(mouse) {
        var rect = _this.rect || Stage;
        _v3.set((mouse.x / rect.width) * 2 - 1, -(mouse.y / rect.height) * 2 + 1, 0.5);
        _v3.unproject(_camera);

        var pos = _camera.position;
        _v3.sub(pos).normalize();
        var dist = -pos.z / _v3.z;
        _value.copy(pos).add(_v3.multiplyScalar(dist));

        return _value;
    }

    this.project = function(pos, screen) {
        screen = screen || Stage;

        if (pos instanceof THREE.Object3D) {
            pos.updateMatrixWorld();
            _v3.set(0, 0, 0).setFromMatrixPosition(pos.matrixWorld);
        } else {
            _v3.copy(pos);
        }

        _v3.project(_camera);
        _v3.x = (_v3.x + 1) / 2 * screen.width;
        _v3.y = -(_v3.y - 1) / 2 * screen.height;

        return _v3;
    }
});

Class(function RandomEulerRotation(_container) {
    var _this = this;

    var _euler = ['x', 'y', 'z'];
    var _rot;

    this.speed = 1;

    //*** Constructor
    (function () {
        initRotation();
    })();

    function initRotation() {
        _rot = {};
        _rot.x = Utils.doRandom(0, 2);
        _rot.y = Utils.doRandom(0, 2);
        _rot.z = Utils.doRandom(0, 2);
        _rot.vx = Utils.doRandom(-5, 5) * 0.0025;
        _rot.vy = Utils.doRandom(-5, 5) * 0.0025;
        _rot.vz = Utils.doRandom(-5, 5) * 0.0025;
    }

    //*** Event handlers

    //*** Public methods
    this.update = function() {
        var time = Render.TIME;
        for (var i = 0; i < 3; i++) {
            var v = _euler[i];
            switch (_rot[v]) {
                case 0: _container.rotation[v] += Math.cos(Math.sin(time * .25)) * _rot['v' + v] * _this.speed; break;
                case 1: _container.rotation[v] += Math.cos(Math.sin(time * .25)) * _rot['v' + v] * _this.speed; break;
                case 2: _container.rotation[v] += Math.cos(Math.cos(time * .25)) * _rot['v' + v] * _this.speed; break;
            }
        }
    }
});

Class(function Shader(_vertexShader, _fragmentShader, _name, _material) {
    Inherit(this, Component);
    var _this = this;

    //*** Constructor
    (function () {
        if (Hydra.LOCAL && _name) expose();

        if (_material) {
            _this.uniforms = _material.uniforms;
            _this.attributes = _material.attributes;
        }
    })();

    function expose() {
        Dev.expose(_name, _this);
    }

    //*** Event handlers

    //*** Public methods
    this.get('material', function() {
        if (!_material) {
            var params = {};
            params.vertexShader = Shaders.getShader(_vertexShader+'.vs');
            params.fragmentShader = Shaders.getShader(_fragmentShader+'.fs');

            if (_this.attributes) params.attributes = _this.attributes;
            if (_this.uniforms) params.uniforms = _this.uniforms;

            _material = new THREE.ShaderMaterial(params);
            _material.shader = _this;
        }

        return _material;
    });

    this.set = function(key, value) {
        if (typeof value !== 'undefined') _this.uniforms[key].value = value;
        return _this.uniforms[key].value;
    }

    this.getValues = function() {
        var out = {};
        for (var key in _this.uniforms) {
            out[key] = _this.uniforms[key].value;
        }

        return out;
    }

    this.copyUniformsTo = function(obj) {
        for (var key in _this.uniforms) {
            obj.uniforms[key] = _this.uniforms[key];
        }
    }

    this.tween = function(key, value, time, ease, delay, callback, update) {
        TweenManager.tween(_this.uniforms[key], {value: value}, time, ease, delay, callback, update);
    }

    this.clone = function(name) {
        return new Shader(_vertexShader, _fragmentShader, name || _name, _this.material.clone());
    }
});

Class(function Utils3D() {
    var _this = this;
    var _objectLoader, _geomLoader, _bufferGeomLoader;

    var _textures = {};

    this.PATH = '';

    //*** Public methods
    this.decompose = function(local, world) {
        local.matrixWorld.decompose(world.position, world.quaternion, world.scale);
    }

    this.createDebug = function(size, color) {
        var geom = new THREE.IcosahedronGeometry(size || 40, 1);
        var mat = color ? new THREE.MeshBasicMaterial({color: color}) : new THREE.MeshNormalMaterial();
        return new THREE.Mesh(geom, mat);
    }

    this.createRT = function(width, height) {
        var params = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false};
        return new THREE.WebGLRenderTarget(width, height, params);
    }

    this.getTexture = function(path, nonLinear) {
        if (!_textures[path]) {
            var img = new Image();
            img.crossOrigin = '';
            img.src = _this.PATH + path + Config.SALT;

            var texture = new THREE.Texture(img);
            
            img.onload = function() {
                texture.needsUpdate = true;
                if (texture.onload) {
                    texture.onload();
                    texture.onload = null;
                }
            };

            _textures[path] = texture;
            if (!nonLinear) texture.minFilter = THREE.LinearFilter;
        }

        return _textures[path];
    }

    this.setInfinity = function(v) {
        var inf = Number.POSITIVE_INFINITY;
        v.set(inf, inf, inf);
        return v;
    }

    this.freezeMatrix = function(mesh) {
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
    }

    this.getCubemap = function(src) {
        var path = 'cube_' + (Array.isArray(src) ? src[0] : src);
        if (!_textures[path]) {
            var images = [];
            for (var i = 0; i < 6; i++) {
                var img = new Image();
                img.crossOrigin = '';
                img.src = _this.PATH + (Array.isArray(src) ? src[i] : src) + Config.SALT;
                images.push(img);
                img.onload = function() {
                    _textures[path].needsUpdate = true;
                }
            }

            _textures[path] = new THREE.Texture();
            _textures[path].image = images;
            _textures[path].minFilter = THREE.LinearFilter;
        }

        return _textures[path];
    }

    this.loadObject = function(name) {
        if (!_objectLoader) _objectLoader = new THREE.ObjectLoader();
        return _objectLoader.parse(Hydra.JSON[name]);
    }

    this.loadGeometry = function(name) {
        if (!_geomLoader) _geomLoader = new THREE.JSONLoader();
        if (!_bufferGeomLoader) _bufferGeomLoader = new THREE.BufferGeometryLoader();

        var json = Hydra.JSON[name];
        if (json.type == 'BufferGeometry') {
            return _bufferGeomLoader.parse(json);
        } else {
            return _geomLoader.parse(json.data).geometry;
        }
    }

    this.disposeAllTextures = function() {
        for (var key in _textures) {
            _textures[key].dispose();
        }
    }

    this.disableWarnings = function() {
        window.console.warn = function(str, msg) {
            //if (str.strpos('getProgramInfo')) console.log(msg);
        };

        window.console.error = function() { };
    }


}, 'static');

Class(function NeveUtil() {
    Inherit(this, Component);
    var _this = this;

    //*** Public methods
    this.getRepeatTexture = function(src) {
        var tex = Utils3D.getTexture(src);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }
}, 'static');

Class(function PinchMechanism() {
    Inherit(this, Component);
    var _this = this;
    var _event = {percent: 0};

    var _p0 = new Vector2();
    var _p1 = new Vector2();
    var _calc = new Vector2();
    var _dist = 0;
    var _start = 0;
    var _percent = 0;
    var _last = 0;
    var _touching = false;

    this.max = 150;

    function setTouches(e) {
        var p0 = e.touches[0];
        var p1 = e.touches[1];
        if (p0) _p0.set(p0.pageX, p0.pageY);
        if (p1) _p1.set(p1.pageX, p1.pageY);
    }

    //*** Event handlers
    function addListeners() {
        Stage.bind('touchstart', touchStart);
        Stage.bind('touchend', touchEnd);
        Stage.bind('touchcancel', touchEnd);
    }

    function removeListeners() {
        Stage.unbind('touchstart', touchStart);
        Stage.unbind('touchend', touchEnd);
        Stage.unbind('touchcancel', touchEnd);
        Stage.unbind('touchmove', touchMove);
    }

    function touchStart(e) {
        if (e.touches.length == 2 && !_touching) {
            _touching = true;
            _start = _percent;
            setTouches(e);
            Stage.bind('touchmove', touchMove);
            _dist = _calc.subVectors(_p0, _p1).length();
        }
    }

    function touchMove(e) {
        setTouches(e);
        var dist = _calc.subVectors(_p0, _p1).length();
        var absDist = dist - _dist;
        var perc = Utils.range(absDist, 0, _this.max, 0, 1);
        _percent = Utils.clamp(_start + perc, 0, 1);

        _event.delta = dist > _last ? 1 : -1;
        _event.percent = _percent;
        _this.events.fire(PinchMechanism.UPDATE, _event, true);

        _last = dist;
    }

    function touchEnd(e) {
        if (!_touching) return;
        _touching = false;
        _start = _percent;
        Stage.unbind('touchmove', touchMove);
        _this.events.fire(PinchMechanism.END, null, true);
    }

    //*** Public methods
    this.set('percent', function(value) {
        _percent = value;
    });

    this.start = function() {
        addListeners();
    }

    this.stop = function() {
        removeListeners();
    }

    this.snapTo = function(to, time) {
        var d = new DynamicObject({v: _percent});
        d.tween({v: to}, time, 'linear', function() {
            _event.delta = 0;
            _event.percent = d.v;
            _start = d.v;
            _this.events.fire(HydraEvents.UPDATE, _event, true);
        });
    }
}, function() {
    PinchMechanism.END = 'pinch_end';
    PinchMechanism.UPDATE = 'pinch_update';
});

Class(function ScrollUtil() {
    Inherit(this, Component);
    var _this = this;
    var _divide;
    var _callbacks = [];
    var _touch = {y: 0, save: 0};
    var _wheel = false;
    var _delta = {};

    //*** Constructor
    (function() {
        initDivide();
        Hydra.ready(addListeners);
    })();

    function initDivide() {
        if (Device.browser.ie) return _divide = 2;
        if (Device.system.os == 'mac') {
            if ((Device.browser.chrome) || Device.browser.safari) _divide = 40;
            else _divide = 1;
        } else {
            if (Device.browser.chrome) _divide = 15;
            else _divide = 0.5;
        }
    }

    //*** Event Handlers
    function addListeners() {
        if (!Device.mobile) {
            __window.bind('DOMMouseScroll', scroll);
            __window.bind('mousewheel', scroll);
            //if (!Device.browser.firefox) __window.keydown(keyPress);
        } else {
            __window.bind('touchstart', touchStart);
            __window.bind('touchend', touchEnd);
            __window.bind('touchcancel', touchEnd);
        }
    }

    function touchStart(e) {
        _touch.y = e.y;
        _touch.time = Date.now();
        __window.bind('touchmove', touchMove);
    }

    function touchMove(e) {
        var diff = e.y - _touch.y;
        _touch.y = e.y;
        _touch.velocity = diff / (_touch.time - Date.now());
        _touch.time = Date.now();
        callback(-diff);
    }

    function touchEnd(e) {
        __window.unbind('touchmove', touchMove);
        callback(_touch.velocity * 100, _touch);
    }

    function keyPress(e) {
        //if (_this.disableKeyScroll) return;
        var value = 750;
        if (e.code == 40) scroll({ deltaY: value, deltaX: 0, key: true });
        if (e.code == 39) scroll({ deltaY: 0, deltaX: value, key: true });
        if (e.code == 38) scroll({ deltaY: -value, deltaX: 0, key: true });
        if (e.code == 37) scroll({ deltaY: 0, deltaX: -value, key: true });
    }

    function scroll(e) {
        if (e.preventDefault) e.preventDefault();
        var value = e.wheelDelta || -e.detail;
        if (typeof e.deltaX !== 'undefined' || e.key) {
            _delta.x = - e.deltaX * 0.4;
            _delta.y = e.deltaY * 0.4;
        } else {
            _delta.x = 0;
            var delta = Math.ceil(-value / _divide);
            if (e.preventDefault) e.preventDefault();
            if (delta <= 0) delta -= 1;

            delta = Utils.clamp(delta, -60, 60);
            _delta.y = delta * 3.5;
        }

        callback(_delta);
    }

    function callback(delta) {
        for (var i = 0; i < _callbacks.length; i++) _callbacks[i](delta);
    }

    //*** Public methods
    this.reset = function() {
        this.value = 0;
    }

    this.link = function(callback) {
        _callbacks.push(callback);
    }

    this.unlink = function(callback) {
        var index = _callbacks.indexOf(callback);
        if (index > -1) _callbacks.splice(index, 1);
    }

}, 'Static');


Class(function TiltShift() {
    Inherit(this, NukePass);
    var _this = this;

    this.uniforms = {
        blur: {type: 'f', value: 100},
        gradientBlur: {type: 'f', value: 600},
        start: {type: 'v2', value: new THREE.Vector2(0, Stage.height/2)},
        end: {type: 'v2', value: new THREE.Vector2(600, Stage.height/2)},
        delta: {type: 'v2', value: new THREE.Vector2(30, 30)},
        texSize: {type: 'v2', value: new THREE.Vector2(Stage.width, Stage.height)}
    };

    this.init();

});

Class(function TiltShiftShader() {
    Inherit(this, Component);
    var _this = this;
    var _x, _y, _manual;

    //*** Constructor
    (function () {
        initPasses();
        addListeners();
    })();

    function initPasses() {
        _x = _this.initClass(TiltShiftX);
        _y = _this.initClass(TiltShiftY);
        _this.x = _x;
        _this.y = _y;
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        _x.set('texSize', new THREE.Vector2(Stage.width, Stage.height));
        _y.set('texSize', new THREE.Vector2(Stage.width, Stage.height));

        if (!_manual) {
            var start = new Vector2(0, Stage.height/2);
            var end = new Vector2(600, Stage.height/2);

            _x.set('start', start);
            _y.set('start', start);

            _x.set('end', end);
            _y.set('end', end);

            _x.update();
            _y.update();
        }
    }

    //*** Public methods
    this.set('blur', function(v) {
        _x.set('blur', v);
        _y.set('blur', v);
    });

    this.set('gradientBlur', function(v) {
        _x.set('gradientBlur', v);
        _y.set('gradientBlur', v);
    });

    this.set('start', function(v) {
        _manual = true;

        _x.set('start', v);
        _y.set('start', v);

        _x.update();
        _y.update();
    });

    this.set('end', function(v) {
        _manual = true;

        _x.set('end', v);
        _y.set('end', v);

        _x.update();
        _y.update();
    });

});

Class(function TiltShiftX() {
    Inherit(this, TiltShift);
    var _this = this;

    //*** Constructor
    (function () {
        updateDelta();
    })();

    function updateDelta() {
        var dx = _this.uniforms.end.value.x - _this.uniforms.start.value.x;
        var dy = _this.uniforms.end.value.y - _this.uniforms.start.value.y;
        var d = Math.sqrt(dx * dx + dy * dy);

        _this.uniforms.delta.value.x = dx / d;
        _this.uniforms.delta.value.y = dy / d;
    }

    //*** Event handlers

    //*** Public methods
    this.update = updateDelta;
});

Class(function TiltShiftY() {
    Inherit(this, TiltShift);
    var _this = this;

    //*** Constructor
    (function () {
        updateDelta();
    })();

    function updateDelta() {
        var dx = _this.uniforms.end.value.x - _this.uniforms.start.value.x;
        var dy = _this.uniforms.end.value.y - _this.uniforms.start.value.y;
        var d = Math.sqrt(dx * dx + dy * dy);

        _this.uniforms.delta.value.x = -dy / d;
        _this.uniforms.delta.value.y = dx / d;
    }

    //*** Event handlers

    //*** Public methods
    this.update = updateDelta;
});

Class(function WiggleBehavior(_position) {
    Inherit(this, Component);
    var _this = this;
    var _angle = Utils.toRadians(Utils.doRandom(0, 360));

    var _wobble = new Vector3();
    var _origin = new Vector3();

    this.target = _wobble;
    this.scale = 0.1;
    this.alpha = 0.025;
    this.speed = 1;
    this.zMove = 2;
    this.enabled = true;

    //*** Constructor
    (function () {
        if (_position) _origin.copyFrom(_position);
    })();

    //*** Event handlers

    //*** Public methods
    this.update = function() {
        if (!_this.enabled || _this.disabled) return;
        var t = window.Render ? Render.TIME : Date.now();

        _wobble.x = Math.cos(_angle + t * (.00075 * _this.speed)) * (_angle + Math.sin(t * (.00095 * _this.speed)) * 200);
        _wobble.y = Math.sin(Math.asin(Math.cos(_angle + t * (.00085 * _this.speed)))) * (Math.sin(_angle + t * (.00075 * _this.speed)) * 150);
        _wobble.x *= Math.sin(_angle + t * (.00075 * _this.speed)) * 2;
        _wobble.y *= Math.cos(_angle + t * (.00065 * _this.speed)) * 1.75;
        _wobble.x *= Math.cos(_angle + t * (.00075 * _this.speed)) * 1.1;
        _wobble.y *= Math.sin(_angle + t * (.00025 * _this.speed)) * 1.15;
        _wobble.z = Math.sin(_angle + _wobble.x * 0.0025) * (100 * _this.zMove);
        _wobble.multiply(_this.scale);

        _wobble.add(_origin);

        if (_position) _position.lerp(_wobble, _this.alpha);
    }

    this.copyOrigin = function() {
        _origin.copyFrom(_position);
    }
});

Class(function Sound() {
    Inherit(this, Model);
    var _this = this;
    var _track, _snow, _flakes, _mute;

    var _touch = new Vector2();

    var _d = new DynamicObject({v: 0});

    //*** Constructor
    (function () {
        Hydra.ready(initSounds);
        addListeners();
    })();

    function initSounds() {
        _track = document.createElement('audio');
        _track.src = Config.CDN + 'assets/sound/track.' + Device.media.audio + Config.SALT;

        //_track = new Howl({urls: [Config.CDN + 'assets/sound/track.mp3' + Config.SALT, Config.CDN + 'assets/sound/track.ogg' + Config.SALT], buffer: true, loop: true});
        _snow = new Howl({urls: [Config.CDN + 'assets/sound/snow.mp3' + Config.SALT, Config.CDN + 'assets/sound/snow.ogg' + Config.SALT], loop: true, volume: 0});

        if (Mobile.os == 'Android') {
            Stage.bind('touchstart', androidPlay);
        } else if (Mobile.os == 'iOS') {
            Stage.bind('touchstart', iStart);
            Stage.bind('touchend', play);
        }
    }

    function fadeTo(vol) {
        _d.tween({v: vol}, 300, 'linear', function() {
            _snow.volume(_d.v);
        });
    }

    function iStart(e) {
        _touch.copyFrom(e);
    }

    function play(e) {
        if (_touch.subVectors(e, _touch).length() < 10) {
            _snow.play();
            _track.play();
            Stage.unbind('touchend', play);
            Stage.unbind('touchstart', iStart);
        }
    }

    function androidPlay() {
        _snow.play();
        _track.play();
        Stage.unbind('touchstart', androidPlay);
    }

    function mute() {
        Howler.mute();
        _track.volume = 0;
    }

    function unmute() {
        Howler.unmute();
        _track.volume = 1;
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(HydraEvents.BROWSER_FOCUS, focus);
    }

    function focus(e) {
        if (e.type == 'blur') {
            mute();
        } else {
            if (!_mute) unmute();
        }
    }

    //*** Public methods
    this.start = function() {
        if (!Device.mobile) {
            _snow.play();
            _track.play();
        }
    }

    this.startSnow = function() {
        if (_snow.active) return;
        _snow.active = true;
        fadeTo(0.6);
    }

    this.stopSnow = function() {
        if (!_snow.active) return;
        _snow.active = false;
        fadeTo(0);
    }

    this.toggleMute = function() {
        if (_mute) {
            _mute = false;
            unmute();
        } else {
            _mute = true;
            mute();
        }
    }
}, 'static');

!function(){var e={},o=null,n=!0,t=!1;try{"undefined"!=typeof AudioContext?o=new AudioContext:"undefined"!=typeof webkitAudioContext?o=new webkitAudioContext:n=!1}catch(r){n=!1}if(!n)if("undefined"!=typeof Audio)try{new Audio}catch(r){t=!0}else t=!0;if(n){var a="undefined"==typeof o.createGain?o.createGainNode():o.createGain();a.gain.value=1,a.connect(o.destination)}var i=function(e){this._volume=1,this._muted=!1,this.usingWebAudio=n,this.ctx=o,this.noAudio=t,this._howls=[],this._codecs=e,this.iOSAutoEnable=!0};i.prototype={volume:function(e){var o=this;if(e=parseFloat(e),e>=0&&1>=e){o._volume=e,n&&(a.gain.value=e);for(var t in o._howls)if(o._howls.hasOwnProperty(t)&&o._howls[t]._webAudio===!1)for(var r=0;r<o._howls[t]._audioNode.length;r++)o._howls[t]._audioNode[r].volume=o._howls[t]._volume*o._volume;return o}return n?a.gain.value:o._volume},mute:function(){return this._setMuted(!0),this},unmute:function(){return this._setMuted(!1),this},_setMuted:function(e){var o=this;o._muted=e,n&&(a.gain.value=e?0:o._volume);for(var t in o._howls)if(o._howls.hasOwnProperty(t)&&o._howls[t]._webAudio===!1)for(var r=0;r<o._howls[t]._audioNode.length;r++)o._howls[t]._audioNode[r].muted=e},codecs:function(e){return this._codecs[e]},_enableiOSAudio:function(){var e=this;if(!o||!e._iOSEnabled&&/iPhone|iPad|iPod/i.test(navigator.userAgent)){e._iOSEnabled=!1;var n=function(){var t=o.createBuffer(1,1,22050),r=o.createBufferSource();r.buffer=t,r.connect(o.destination),"undefined"==typeof r.start?r.noteOn(0):r.start(0),setTimeout(function(){(r.playbackState===r.PLAYING_STATE||r.playbackState===r.FINISHED_STATE)&&(e._iOSEnabled=!0,e.iOSAutoEnable=!1,window.removeEventListener("touchend",n,!1))},0)};return window.addEventListener("touchend",n,!1),e}}};var u=null,d={};t||(u=new Audio,d={mp3:!!u.canPlayType("audio/mpeg;").replace(/^no$/,""),opus:!!u.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),ogg:!!u.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),wav:!!u.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),aac:!!u.canPlayType("audio/aac;").replace(/^no$/,""),m4a:!!(u.canPlayType("audio/x-m4a;")||u.canPlayType("audio/m4a;")||u.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(u.canPlayType("audio/x-mp4;")||u.canPlayType("audio/mp4;")||u.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!u.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")});var l=new i(d),f=function(e){var t=this;t._autoplay=e.autoplay||!1,t._buffer=e.buffer||!1,t._duration=e.duration||0,t._format=e.format||null,t._loop=e.loop||!1,t._loaded=!1,t._sprite=e.sprite||{},t._src=e.src||"",t._pos3d=e.pos3d||[0,0,-.5],t._volume=void 0!==e.volume?e.volume:1,t._urls=e.urls||[],t._rate=e.rate||1,t._model=e.model||null,t._onload=[e.onload||function(){}],t._onloaderror=[e.onloaderror||function(){}],t._onend=[e.onend||function(){}],t._onpause=[e.onpause||function(){}],t._onplay=[e.onplay||function(){}],t._onendTimer=[],t._webAudio=n&&!t._buffer,t._audioNode=[],t._webAudio&&t._setupAudioNode(),"undefined"!=typeof o&&o&&l.iOSAutoEnable&&l._enableiOSAudio(),l._howls.push(t),t.load()};if(f.prototype={load:function(){var e=this,o=null;if(t)return void e.on("loaderror");for(var n=0;n<e._urls.length;n++){var r,a;if(e._format)r=e._format;else{if(a=e._urls[n],r=/^data:audio\/([^;,]+);/i.exec(a),r||(r=/\.([^.]+)$/.exec(a.split("?",1)[0])),!r)return void e.on("loaderror");r=r[1].toLowerCase()}if(d[r]){o=e._urls[n];break}}if(!o)return void e.on("loaderror");if(e._src=o,e._webAudio)_(e,o);else{var u=new Audio;u.addEventListener("error",function(){u.error&&4===u.error.code&&(i.noAudio=!0),e.on("loaderror",{type:u.error?u.error.code:0})},!1),e._audioNode.push(u),u.src=o,u._pos=0,u.preload="auto",u.volume=l._muted?0:e._volume*l.volume();var f=function(){e._duration=Math.ceil(10*u.duration)/10,0===Object.getOwnPropertyNames(e._sprite).length&&(e._sprite={_default:[0,1e3*e._duration]}),e._loaded||(e._loaded=!0,e.on("load")),e._autoplay&&e.play(),u.removeEventListener("canplaythrough",f,!1)};u.addEventListener("canplaythrough",f,!1),u.load()}return e},urls:function(e){var o=this;return e?(o.stop(),o._urls="string"==typeof e?[e]:e,o._loaded=!1,o.load(),o):o._urls},play:function(e,n){var t=this;return"function"==typeof e&&(n=e),e&&"function"!=typeof e||(e="_default"),t._loaded?t._sprite[e]?(t._inactiveNode(function(r){r._sprite=e;var a=r._pos>0?r._pos:t._sprite[e][0]/1e3,i=0;t._webAudio?(i=t._sprite[e][1]/1e3-r._pos,r._pos>0&&(a=t._sprite[e][0]/1e3+a)):i=t._sprite[e][1]/1e3-(a-t._sprite[e][0]/1e3);var u,d=!(!t._loop&&!t._sprite[e][2]),f="string"==typeof n?n:Math.round(Date.now()*Math.random())+"";if(function(){var o={id:f,sprite:e,loop:d};u=setTimeout(function(){!t._webAudio&&d&&t.stop(o.id).play(e,o.id),t._webAudio&&!d&&(t._nodeById(o.id).paused=!0,t._nodeById(o.id)._pos=0,t._clearEndTimer(o.id)),t._webAudio||d||t.stop(o.id),t.on("end",f)},1e3*i),t._onendTimer.push({timer:u,id:o.id})}(),t._webAudio){var _=t._sprite[e][0]/1e3,s=t._sprite[e][1]/1e3;r.id=f,r.paused=!1,p(t,[d,_,s],f),t._playStart=o.currentTime,r.gain.value=t._volume,"undefined"==typeof r.bufferSource.start?d?r.bufferSource.noteGrainOn(0,a,86400):r.bufferSource.noteGrainOn(0,a,i):d?r.bufferSource.start(0,a,86400):r.bufferSource.start(0,a,i)}else{if(4!==r.readyState&&(r.readyState||!navigator.isCocoonJS))return t._clearEndTimer(f),function(){var o=t,a=e,i=n,u=r,d=function(){o.play(a,i),u.removeEventListener("canplaythrough",d,!1)};u.addEventListener("canplaythrough",d,!1)}(),t;r.readyState=4,r.id=f,r.currentTime=a,r.muted=l._muted||r.muted,r.volume=t._volume*l.volume(),setTimeout(function(){r.play()},0)}return t.on("play"),"function"==typeof n&&n(f),t}),t):("function"==typeof n&&n(),t):(t.on("load",function(){t.play(e,n)}),t)},pause:function(e){var o=this;if(!o._loaded)return o.on("play",function(){o.pause(e)}),o;o._clearEndTimer(e);var n=e?o._nodeById(e):o._activeNode();if(n)if(n._pos=o.pos(null,e),o._webAudio){if(!n.bufferSource||n.paused)return o;n.paused=!0,"undefined"==typeof n.bufferSource.stop?n.bufferSource.noteOff(0):n.bufferSource.stop(0)}else n.pause();return o.on("pause"),o},stop:function(e){var o=this;if(!o._loaded)return o.on("play",function(){o.stop(e)}),o;o._clearEndTimer(e);var n=e?o._nodeById(e):o._activeNode();if(n)if(n._pos=0,o._webAudio){if(!n.bufferSource||n.paused)return o;n.paused=!0,"undefined"==typeof n.bufferSource.stop?n.bufferSource.noteOff(0):n.bufferSource.stop(0)}else isNaN(n.duration)||(n.pause(),n.currentTime=0);return o},mute:function(e){var o=this;if(!o._loaded)return o.on("play",function(){o.mute(e)}),o;var n=e?o._nodeById(e):o._activeNode();return n&&(o._webAudio?n.gain.value=0:n.muted=!0),o},unmute:function(e){var o=this;if(!o._loaded)return o.on("play",function(){o.unmute(e)}),o;var n=e?o._nodeById(e):o._activeNode();return n&&(o._webAudio?n.gain.value=o._volume:n.muted=!1),o},volume:function(e,o){var n=this;if(e=parseFloat(e),e>=0&&1>=e){if(n._volume=e,!n._loaded)return n.on("play",function(){n.volume(e,o)}),n;var t=o?n._nodeById(o):n._activeNode();return t&&(n._webAudio?t.gain.value=e:t.volume=e*l.volume()),n}return n._volume},loop:function(e){var o=this;return"boolean"==typeof e?(o._loop=e,o):o._loop},sprite:function(e){var o=this;return"object"==typeof e?(o._sprite=e,o):o._sprite},pos:function(e,n){var t=this;if(!t._loaded)return t.on("load",function(){t.pos(e)}),"number"==typeof e?t:t._pos||0;e=parseFloat(e);var r=n?t._nodeById(n):t._activeNode();if(r)return e>=0?(t.pause(n),r._pos=e,t.play(r._sprite,n),t):t._webAudio?r._pos+(o.currentTime-t._playStart):r.currentTime;if(e>=0)return t;for(var a=0;a<t._audioNode.length;a++)if(t._audioNode[a].paused&&4===t._audioNode[a].readyState)return t._webAudio?t._audioNode[a]._pos:t._audioNode[a].currentTime},pos3d:function(e,o,n,t){var r=this;if(o="undefined"!=typeof o&&o?o:0,n="undefined"!=typeof n&&n?n:-.5,!r._loaded)return r.on("play",function(){r.pos3d(e,o,n,t)}),r;if(!(e>=0||0>e))return r._pos3d;if(r._webAudio){var a=t?r._nodeById(t):r._activeNode();a&&(r._pos3d=[e,o,n],a.panner.setPosition(e,o,n),a.panner.panningModel=r._model||"HRTF")}return r},fade:function(e,o,n,t,r){var a=this,i=Math.abs(e-o),u=e>o?"down":"up",d=i/.01,l=n/d;if(!a._loaded)return a.on("load",function(){a.fade(e,o,n,t,r)}),a;a.volume(e,r);for(var f=1;d>=f;f++)!function(){var e=a._volume+("up"===u?.01:-.01)*f,n=Math.round(1e3*e)/1e3,i=o;setTimeout(function(){a.volume(n,r),n===i&&t&&t()},l*f)}()},fadeIn:function(e,o,n){return this.volume(0).play().fade(0,e,o,n)},fadeOut:function(e,o,n,t){var r=this;return r.fade(r._volume,e,o,function(){n&&n(),r.pause(t),r.on("end")},t)},_nodeById:function(e){for(var o=this,n=o._audioNode[0],t=0;t<o._audioNode.length;t++)if(o._audioNode[t].id===e){n=o._audioNode[t];break}return n},_activeNode:function(){for(var e=this,o=null,n=0;n<e._audioNode.length;n++)if(!e._audioNode[n].paused){o=e._audioNode[n];break}return e._drainPool(),o},_inactiveNode:function(e){for(var o=this,n=null,t=0;t<o._audioNode.length;t++)if(o._audioNode[t].paused&&4===o._audioNode[t].readyState){e(o._audioNode[t]),n=!0;break}if(o._drainPool(),!n){var r;if(o._webAudio)r=o._setupAudioNode(),e(r);else{o.load(),r=o._audioNode[o._audioNode.length-1];var a=navigator.isCocoonJS?"canplaythrough":"loadedmetadata",i=function(){r.removeEventListener(a,i,!1),e(r)};r.addEventListener(a,i,!1)}}},_drainPool:function(){var e,o=this,n=0;for(e=0;e<o._audioNode.length;e++)o._audioNode[e].paused&&n++;for(e=o._audioNode.length-1;e>=0&&!(5>=n);e--)o._audioNode[e].paused&&(o._webAudio&&o._audioNode[e].disconnect(0),n--,o._audioNode.splice(e,1))},_clearEndTimer:function(e){for(var o=this,n=0,t=0;t<o._onendTimer.length;t++)if(o._onendTimer[t].id===e){n=t;break}var r=o._onendTimer[n];r&&(clearTimeout(r.timer),o._onendTimer.splice(n,1))},_setupAudioNode:function(){var e=this,n=e._audioNode,t=e._audioNode.length;return n[t]="undefined"==typeof o.createGain?o.createGainNode():o.createGain(),n[t].gain.value=e._volume,n[t].paused=!0,n[t]._pos=0,n[t].readyState=4,n[t].connect(a),n[t].panner=o.createPanner(),n[t].panner.panningModel=e._model||"equalpower",n[t].panner.setPosition(e._pos3d[0],e._pos3d[1],e._pos3d[2]),n[t].panner.connect(n[t]),n[t]},on:function(e,o){var n=this,t=n["_on"+e];if("function"==typeof o)t.push(o);else for(var r=0;r<t.length;r++)o?t[r].call(n,o):t[r].call(n);return n},off:function(e,o){var n=this,t=n["_on"+e],r=o?o.toString():null;if(r){for(var a=0;a<t.length;a++)if(r===t[a].toString()){t.splice(a,1);break}}else n["_on"+e]=[];return n},unload:function(){for(var o=this,n=o._audioNode,t=0;t<o._audioNode.length;t++)n[t].paused||(o.stop(n[t].id),o.on("end",n[t].id)),o._webAudio?n[t].disconnect(0):n[t].src="";for(t=0;t<o._onendTimer.length;t++)clearTimeout(o._onendTimer[t].timer);var r=l._howls.indexOf(o);null!==r&&r>=0&&l._howls.splice(r,1),delete e[o._src],o=null}},n)var _=function(o,n){if(n in e)return o._duration=e[n].duration,void c(o);if(/^data:[^;]+;base64,/.test(n)){for(var t=atob(n.split(",")[1]),r=new Uint8Array(t.length),a=0;a<t.length;++a)r[a]=t.charCodeAt(a);s(r.buffer,o,n)}else{var i=new XMLHttpRequest;i.open("GET",n,!0),i.responseType="arraybuffer",i.onload=function(){s(i.response,o,n)},i.onerror=function(){o._webAudio&&(o._buffer=!0,o._webAudio=!1,o._audioNode=[],delete o._gainNode,delete e[n],o.load())};try{i.send()}catch(u){i.onerror()}}},s=function(n,t,r){o.decodeAudioData(n,function(o){o&&(e[r]=o,c(t,o))},function(e){t.on("loaderror")})},c=function(e,o){e._duration=o?o.duration:e._duration,0===Object.getOwnPropertyNames(e._sprite).length&&(e._sprite={_default:[0,1e3*e._duration]}),e._loaded||(e._loaded=!0,e.on("load")),e._autoplay&&e.play()},p=function(n,t,r){var a=n._nodeById(r);a.bufferSource=o.createBufferSource(),a.bufferSource.buffer=e[n._src],a.bufferSource.connect(a.panner),a.bufferSource.loop=t[0],t[0]&&(a.bufferSource.loopStart=t[1],a.bufferSource.loopEnd=t[1]+t[2]),a.bufferSource.playbackRate.value=n._rate};"function"==typeof define&&define.amd&&define(function(){return{Howler:l,Howl:f}}),"undefined"!=typeof exports&&(exports.Howler=l,exports.Howl=f),"undefined"!=typeof window&&(window.Howler=l,window.Howl=f)}();

Class(function Camera() {
    Inherit(this, Component);
    var _this = this;
    var _orbit, _root, _wrap1, _wrap2, _rotation, _wiggle, _pinch;
    var _cardboard;

    var _vrMover = new THREE.Object3D();
    var _center = new THREE.Vector3();

    var _camera = new THREE.PerspectiveCamera(40, Stage.width / Stage.height, 10, 100000);

    this.worldCamera = new THREE.PerspectiveCamera(40, Stage.width / Stage.height, 10, 100000);

    this.zDistance = 15000;
    this.zOrigin = this.zDistance;
    this.zMove = 0;
    this.vrRadius = 0;
    this.multiTween = true;

    //*** Constructor
    (function () {
        Mouse.x = Stage.width/2;
        Mouse.y = Stage.height/2;

        Mouse.capture();

        if (Hardware.CARDBOARD) initCardboard();
        else if (Hardware.OCULUS) initOculus();
        else initBehaviors();

        addListeners();
        Render.start(loop);

        if (Hardware.VR) _this.delayedCall(zoomAround, 30000);
    })();

    function initBehaviors() {
        _root = new THREE.Object3D();
        _wrap1 = new THREE.Object3D();
        _wrap2 = new THREE.Object3D();
        _root.add(_wrap1);
        _wrap1.add(_wrap2);
        _wrap2.add(_camera);
        _root.matrixAutoUpdate = false;

        _camera.position.z = _this.zDistance;

        _rotation = _this.initClass(CameraRotation, _root, _wrap1);
        _orbit = _this.initClass(CameraOrbit, _camera, _wrap2);

        _orbit.enabled = false;

        _this.orbit = _orbit;
        _this.rotation = _rotation;
    }

    function initCardboard() {
        _cardboard = {};
        _cardboard.wrapper = new THREE.Object3D();
        _cardboard.controls = new THREE.DeviceOrientationControls(_cardboard.wrapper);
        _cardboard.wrapper.add(_camera);

        _vrMover.position.y = 100;
        _vrMover.add(_cardboard.wrapper);

        _camera.fov = _this.worldCamera.fov = 80;
        _camera.updateProjectionMatrix();
        _this.worldCamera.updateProjectionMatrix();
    }

    function initOculus() {
        _vrMover.position.y = 100;
        _vrMover.add(_camera);

        _camera.fov = _this.worldCamera.fov = 90;
        _camera.updateProjectionMatrix();
        _this.worldCamera.updateProjectionMatrix();
    }

    function loop(t) {
        _rotation && _rotation.update();
        _orbit && _orbit.update();
        _root && _root.updateMatrixWorld();

        if (Hardware.VR) {
            Mouse.x = Stage.width/2;
            Mouse.y = Stage.height/2;

            _vrMover.position.x = Math.cos(t * 0.000075) * 2500 * _this.vrRadius;
            _vrMover.position.z = Math.sin(t * 0.000075) * 2500 * _this.vrRadius;
            _vrMover.updateMatrixWorld();
        }

        if (_cardboard) {
            _cardboard.wrapper.updateMatrixWorld();
            _cardboard.controls.update();
        }

        Utils3D.decompose(_camera, _this.worldCamera);
    }

    function initPinch() {
        _pinch = _this.initClass(PinchMechanism);
        _pinch.start();
        _pinch.percent = 5000 / 7000;
        _this.zoom = _pinch.percent;
        _pinch.events.add(PinchMechanism.UPDATE, pinchUpdate);
    }

    function zoomAround() {
        TweenManager.tween(_this, {vrRadius: 1}, 10000, 'easeInOutCubic');
        TweenManager.tween(_vrMover.position, {y: 1000}, 10000, 'easeInOutQuad');

        _this.delayedCall(function() {
            TweenManager.tween(_this, {vrRadius: 0}, 10000, 'easeInOutCubic');
            TweenManager.tween(_vrMover.position, {y: 100}, 10000, 'easeInOutQuad');

            _this.delayedCall(zoomAround, 20000);
        }, 60000);
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler);

        if (!Hardware.VR) {
            if (!Device.mobile) ScrollUtil.link(scroll);
            else initPinch();
        }
    }

    function pinchUpdate(e) {
        _this.zoom = e.percent;
        _this.zDistance = Utils.range(e.percent, 1, 0, 2500, 7000);
    }

    function scroll(delta) {
        if (!_orbit.enabled) return;
        var z = _this.zDistance;
        z += delta.y * 2;
        z = Utils.clamp(z, 2500, 7000);
        _this.zDistance = z;
        _this.zoom = Utils.range(z, 2500, 7000, 0, 1);
    }

    function resizeHandler() {
        var cameras = [_camera, _this.worldCamera];
        cameras.forEach(function(c) {
            c.aspect = Stage.width / Stage.height;
            c.updateProjectionMatrix();
        });
    }

    //*** Public methods
    this.animateIn = function() {
        if (Hardware.VR) return;

        _this.available = true;

        _rotation.animateIn();
        TweenManager.tween(_this, {zDistance: 5000}, 5000, 'easeInOutCubic', function() {
            _orbit.enabled = true;
        });
    }
}, 'singleton');

Class(function Earth() {
    Inherit(this, Component);
    var _this = this;
    var _snow, _ice, _soil, _rock, _clouds;
    var _chunk, _storm, _elements, _flakes;

    this.object3D = new THREE.Object3D();

    //*** Constructor
    (function () {
        initViews();
        Render.start(loop);
    })();

    function initViews() {
        _chunk = new THREE.Object3D();
        _this.object3D.add(_chunk);

        _chunk.position.y = -500;
        _chunk.wiggle = _this.initClass(WiggleBehavior, _chunk.position);
        _chunk.wiggle.scale = 1;
        _chunk.wiggle.speed = 0.5;

        _snow = _this.initClass(EarthSnow);
        _chunk.add(_snow.mesh);

        _ice = _this.initClass(EarthIce);
        _chunk.add(_ice.mesh);

        _soil = _this.initClass(EarthSoil);
        _chunk.add(_soil.mesh);

        _rock = _this.initClass(EarthRock);
        _chunk.add(_rock.mesh);

        _clouds = _this.initClass(EarthClouds);
        _this.object3D.add(_clouds.mesh);

        _clouds.wiggle = _this.initClass(WiggleBehavior, _clouds.position);
        _clouds.wiggle.scale = 1;
        _clouds.wiggle.speed = 0.5;

        _flakes = _this.initClass(EarthFlakes);
        _this.object3D.add(_flakes.mesh);

        _elements = _this.initClass(EarthElements);
        _chunk.add(_elements.object3D);
    }

    function loop(t) {
        //_chunk.wiggle.update();
        _clouds.wiggle.update();

        if (!Hardware.VR) _chunk.position.y = -500 + Math.sin(t * 0.00075) * 100;
    }

    //*** Event handlers

    //*** Public methods

});

Class(function Intro() {
    Inherit(this, Controller);
    var _this = this;
    var $container, $wrapper;
    var _bg, _logo, _spinner, _copy, _year, _at;
    var _loader;

    //*** Constructor
    (function () {
        initContainer();
        FontLoader.loadFonts(['Mont', 'Playfair']);
        AssetLoader.loadAssets(AssetUtil.loadAssets('/ui/'), initViews);
    })();

    function initContainer() {
        $container = _this.container;
        $container.size('100%').setZ(3);
        Stage.add($container);

        $wrapper = $container.create('wrapper');
        $wrapper.size(550, Stage.height).center(1, 0).setZ(2);
    }

    function initViews() {
        _bg = _this.initClass(IntroBG);
        _logo = _this.initClass(IntroLogo, [$wrapper]);
        _spinner = _this.initClass(IntroSpinner, [$wrapper]);
        _copy = _this.initClass(IntroCopy, [$wrapper]);
        _year = _this.initClass(IntroYear, [$wrapper]);
        _at = _this.initClass(IntroAT, [$wrapper]);

        _this.delayedCall(initLoader, Device.mobile ? 1200 : 0);
        addListeners();
        resizeHandler();

        defer(animateIn);
    }

    function initLoader() {
        AssetUtil.exclude('share');
        var time = Render.TIME;
        _loader = _this.initClass(AssetLoader, AssetUtil.loadAssets(''));
        _loader.events.add(HydraEvents.COMPLETE, function() {
            Scene.instance();
            _this.events.subscribe(NeveEvents.READY, function() {
                var delta = Render.TIME - time;
                var delay = Math.max(3000 - delta, 0);
                _this.delayedCall(function() {
                    _this.delayedCall(animateOut, 1000);
                    Camera.instance().animateIn();
                    Sound.start();
                }, delay);
            });
        });
    }

    function animateIn() {
        _bg.animateIn();
        _this.delayedCall(_logo.animateIn, 500);
        _this.delayedCall(_spinner.animateIn, 1500);
        _this.delayedCall(_copy.animateIn, 1200);
        _this.delayedCall(_year.animateIn, 500);
        _this.delayedCall(_at.animateIn, 500);
    }

    function animateOut() {
        _year.animateOut();
        _at.animateOut();
        _spinner.animateOut();
        _this.delayedCall(_logo.animateOut, 300);
        _this.delayedCall(_copy.animateOut, 300);
        _this.delayedCall(_bg.animateOut, 800);

        _this.delayedCall(function() {
            $wrapper.hide();
        }, 1200);

        _this.delayedCall(function() {
            _this.events.fire(HydraEvents.COMPLETE);
        }, 3000);
    }

    Dev.expose('out', animateOut);

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        if (!Mobile.phone) {
            $wrapper.size(600, Stage.height).center(1,0);
            _logo.css({top: Stage.height / 2 - 50})
            _spinner.css({top: Stage.height / 2 + 200})
            _copy.css({top: Stage.height / 2 - 160, right: 0});
        } else if (Stage.width > 600 && Stage.width > Stage.height) {
            $wrapper.size(600, Stage.height).center(1,0);
            _logo.css({left: 0, top: Stage.height / 2 - 50})
            _spinner.css({top: Stage.height / 2 + 100, left: 0});
            _copy.css({top: 60, right: 0, left: ''});
            _at.css({left: ''});
            _logo.untuck();
        } else {
            $wrapper.size(Stage.width, Stage.height).center(1,0);
            _logo.tuck();
            _logo.css({left: Stage.width/2 - 230/2, top: 100});
            _copy.css({top: Stage.height/2 - 30, right: '', left: Stage.width/2 - 295/2});
            _at.css({left: 10});
            _spinner.css({top: Stage.height - 80, left: Stage.width/2 - 20});
        }

        _year.css({top: 25});
        _at.css({top: 25});
    }

    //*** Public methods

});

Class(function Playground() {
    Inherit(this, Controller);
    var _this = this;
    var $container;
    var _scene, _renderer, _camera, _view, _controls;

    //*** Constructor
    (function () {
        Global.PLAYGROUND = true;
        initContainer();
        initThree();
        initView();
        addListeners();
        Render.start(loop);
    })();

    function initContainer() {
        $container = _this.container;
        $container.size('100%');
        Stage.add($container);
    }

    function initThree() {
        _scene = new THREE.Scene();
        _camera = new THREE.PerspectiveCamera(40, Stage.width / Stage.height, 10, 90000);
        _renderer = new THREE.WebGLRenderer({antialias: false});
        _renderer.setPixelRatio(2);
        _renderer.setSize(Stage.width, Stage.height);

        _this.scene = _scene;
        Global.PLAYGROUND_SCENE = _scene;

        _renderer.setClearColor(0x1b1b1b);

        _camera.position.z = 2000;
        _controls = new THREE.TrackballControls(_camera);

        $container.add(_renderer.domElement);
    }

    function initView() {
        var hash = Hydra.HASH.split('/')[1].split('?')[0];
        var view = hash;
        if (!hash) throw 'No view for Playground found on Hash';
        if (!window[view]) throw 'No Playground class '+view+' found.';

        _view = _this.initClass(window[view], _camera);
        _scene.add(_view.object3D);
    }

    function loop() {
        _controls.update();
        _renderer.render(_scene, _camera);
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        _renderer.setSize(Stage.width, Stage.height);

        if (!_camera.custom) {
            _camera.aspect = Stage.width / Stage.height;
            _camera.updateProjectionMatrix();
        }
    }

    //*** Public methods
    this.setScene = function(scene, camera) {
        _scene = scene;
        _camera = camera;
    }

    this.setCamera = function(camera) {
        _camera = camera;
        _camera.custom = true;
    }

    this.removeRenderer = function() {
        $container.remove();
        Render.stop(loop);
    }
}, 'singleton');

Class(function Scene() {
    Inherit(this, Controller);
    var _this = this;
    var $container;
    var _scene, _camera, _renderer;
    var _sky, _earth, _tilt, _nuke;
    var _cardboard, _oculus, _logo, _buttons;

    var _drop = false;

    var _timer = new RenderPerformance();

    //*** Constructor
    (function () {
        if (Mobile.os == 'Android' && !navigator.standalone) Mobile.fullscreen();
        initContainer();
        initThree();
        initNuke();
        initElements();
        initUI();
        addListeners();
        Render.start(loop);
        _timer.enabled = false;
        _this.delayedCall(startTimer, 500);
    })();

    function initContainer() {
        $container = _this.container;
        $container.size('100%');
        Stage.add($container);

        $container.hide();
    }

    function initThree() {
        _scene = new THREE.Scene();
        _renderer = new THREE.WebGLRenderer({antialias: false});
        _renderer.setPixelRatio(1);
        _renderer.setSize(Stage.width, Stage.height);

        _renderer.setClearColor(0x111111);
        _this.renderer = _renderer;
        _this.scene = _scene;

        if (Hydra.HASH.strpos('debugCam')) {
            _camera = new THREE.PerspectiveCamera(40, Stage.width / Stage.height, 10, 90000);
            _camera.position.z = 2000;
            _camera.controls = new THREE.TrackballControls(_camera);
        } else {
            _camera = Camera.instance().worldCamera;
        }

        $container.add(_renderer.domElement);
    }

    function initNuke() {
        _nuke = _this.initClass(Nuke, Stage, {renderer: _renderer, camera: _camera, scene: _scene});

        var rgb = _this.initClass(NukePass, 'RGB');
        _nuke.add(rgb);

        _tilt = _this.initClass(TiltShiftPass, _nuke);

        if (Hardware.VR || Hardware.NO_FX) _nuke.enabled = false;

        if (Hardware.CARDBOARD) {
            _cardboard = new THREE.StereoEffect(_renderer);
            _cardboard.eyeSeparation = 1;
            _cardboard.setSize(Stage.width, Stage.height);
        }

        if (Hardware.OCULUS) {
            _oculus = {};
            _oculus.controls = new THREE.VRControls(_camera);
            _oculus.effect = new THREE.VREffect(_renderer);
            _oculus.effect.setSize(Stage.width, Stage.height);

            Stage.bind('click', function() {
                _oculus.effect.setFullScreen(true);
            });
        }
    }

    function startTimer() {
        _timer.enabled = true;
        _this.delayedCall(function() {
            _timer.enabled = false;

            if (Mobile.os == 'iOS') {
                if (_timer.median >= 4) _nuke.enabled = false;
                if (_timer.median > 14) Hardware.NO_INTERACTION = true;
            } else if (Device.mobile) {
                _nuke.enabled = false;
            } else {
                if (Hardware.NO_FX) _nuke.enabled = false;
                if (Stage.width > 1600) _nuke.enabled = false;
                if (_timer.median > 3) _nuke.enabled = false;
            }

            _drop = 1;
            _this.events.fire(NeveEvents.READY);
            $container.show();

            _this.delayedCall(_logo.animateIn, 3500);
            _this.delayedCall(_buttons.animateIn, 3500);
        }, 500);
    }

    function initElements() {
        _sky = _this.initClass(Sky);
        _scene.add(_sky.object3D);

        _earth = _this.initClass(Earth);
        _scene.add(_earth.object3D);
    }

    function initUI() {
        _logo = _this.initClass(IntroAT);
        _logo.css({left: 25, top: 20});
        if (Hardware.VR) _logo.element.hide();

        _buttons = _this.initClass(MainButtons);
    }

    function loop(t, dt, delta) {
        if (!Device.mobile && Render.FPS < 20 && _drop && _nuke.enabled && delta < 400) {
            _drop++;
            if (_drop > 3) _nuke.enabled = false;
        }

        _timer.time();
        if (_camera.controls) _camera.controls.update();

        if (_cardboard) {
            _cardboard.render(_scene, _camera);
        } else if (_oculus) {
            _oculus.controls.update();
            _oculus.effect.render(_scene, _camera);
        } else {
            _nuke.render();
        }

        _timer.time();
    }

    function visibility(object, type) {
        if (object.material && !object.material.forceVisible) object.visible = type;

        for (var i = 0; i < object.children.length; i++) {
            var child = object.children[i];
            if (child.children) visibility(child, type);
            if (child.material && !child.material.forceVisible) child.visible = type;
        }
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        _renderer.setSize(Stage.width, Stage.height);

        if (_cardboard) _cardboard.setSize(Stage.width, Stage.height);
        if (_oculus) _oculus.effect.setSize(Stage.width, Stage.height);
    }

    //*** Public methods
    this.visibility = function(type) {
        visibility(_scene, type);
    }

}, 'singleton');

Class(function WorldLight() {
    Inherit(this, Component);
    var _this = this;
    var _mobileWiggle;

    var _pos = new Vector3();
    var _target = new Vector3();
    var _offset = new Vector3();
    var _offsetLast = new Vector3();
    var _offsetX = new Vector3();
    var _offsetLerp = new Vector3();
    var _camera = Camera.instance().worldCamera;

    this.position = new THREE.Vector3();
    this.addZ = 0;

    //*** Constructor
    (function () {
        Render.start(loop);
    })();

    function calcOffset() {
        var range = 2000;

        _offsetX.copyFrom(_camera.position);
        _offsetX.normalize();

        var width = Stage.width * 0.4;
        var height = Stage.height * 0.2;
        _offset.x = _offsetX.z * Utils.range(Mouse.x, width, Stage.width - width, -range, range, true);

        _offset.z = -_offsetX.x * Utils.range(Mouse.x, width, Stage.width - width, -range, range, true);
        _offset.y = -Utils.range(Mouse.y, height, Stage.height - height, -range, range, true);

        _offsetLast.sub(_offset);
        _offsetLerp.lerp(_offset, Utils.range(_offsetLast.lengthSq(), 0, 1000, 0.3, 0.1, true));
        _offsetLast.copyFrom(_offset);
    }

    function calcMobileOffset() {
        if (!_mobileWiggle) {
            _mobileWiggle = _this.initClass(WiggleBehavior, _offsetLerp);
            _mobileWiggle.scale = 10;
        }
        _mobileWiggle.update();
    }

    function loop() {
        _target.copyFrom(_camera.position);
        _target.y -= 1050;

        if (Device.mobile) {
            calcMobileOffset();
        } else {
            calcOffset();
        }

        _target.add(_offsetLerp);

        _pos.lerp(_target, 0.3);
        _this.position.copy(_pos).multiplyScalar(10);
        _this.position.y += _this.addZ;
    }

    //*** Event handlers

    //*** Public methods

}, 'singleton');

Class(function Sky() {
    Inherit(this, Component);
    var _this = this;
    var _aurora, _dome, _stars;

    this.object3D = new THREE.Object3D();

    //*** Constructor
    (function () {
        initViews();
    })();

    function initViews() {
        _aurora = _this.initClass(SkyAurora);
        _this.object3D.add(_aurora.mesh);

        _dome = _this.initClass(SkyDome);
        _this.object3D.add(_dome.mesh);

        _stars = _this.initClass(SkyStars);
        _this.object3D.add(_stars.mesh);
    }

    //*** Event handlers

    //*** Public methods

});

Class(function MainButtons() {
    Inherit(this, View);
    var _this = this;
    var $this;

    //*** Constructor
    (function () {
        initHTML();
        initButtons();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(400, 55).css({opacity: 0});

        if (!Device.mobile) $this.css({right: 25, bottom: 15});
        else $this.css({right: 15, top: 10});
    }

    function initButtons() {
        var config = [];
        if (Mobile.phone) {
            if (!Hardware.CARDBOARD) config.push({type: 'cardboard'});
        }

        if (!Device.mobile) {
            config.push({type: 'sound', canDisable: true});

            if (!!navigator.getVRDevices && !Hardware.OCULUS) config.push({type: 'vr'});
        }

        if (Device.mobile && navigator.standalone) return;

        create(config);
    }

    function create(config) {
        if (!config.length) return $this.hide();

        config.forEach(function(d, i) {
            var button = _this.initClass(UIButton, d.type, d.canDisable);
            button.events.add(HydraEvents.CLICK, click);
            button.css({right: 60 * i});
        });

        $this.size(60 * config.length, 55);
    }

    //*** Event handlers
    function click(e) {
        switch (e.type) {
            case 'sound': Sound.toggleMute(); break;
            case 'cardboard': getURL(window.location.href + '?cardboard', '_self'); break;
            case 'vr': getURL(window.location.href + '?webvr', '_self'); break;
        }
    }

    //*** Public methods
    this.animateIn = function() {
        $this.tween({opacity: 0.8}, 1000, 'easeInOutSine');
    }
});

Class(function UIButton(_type, _canDisable) {
    Inherit(this, View);
    var _this = this;
    var $this, $icon;

    this.disabled = false;
    this.type = _type;

    //*** Constructor
    (function () {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(57, 57);

        $icon = $this.create('icon');
        $icon.size(57, 57).bg('assets/images/ui/' + _type + '.png');

        $this.interact(hover, click);
    }

    //*** Event handlers
    function hover(e) {
        if (e.action == 'over') {
            $this.tween({opacity: 0.8, scale: 0.95}, 300, 'easeOutCubic');
        } else {
            $this.tween({opacity: 1, scale: 1}, 300, 'easeOutCubic');
        }
    }

    function click() {
        _this.events.fire(HydraEvents.CLICK, {type: _type}, true);
        if (_canDisable) {
            if (!_this.disabled) {
                $icon.tween({opacity: 0.2}, 500, 'easeOutSine');
                _this.disabled = true;
            } else {
                _this.disabled = false;
                $icon.tween({opacity: 1}, 500, 'easeOutSine');
            }
        }
    }

    //*** Public methods

});

Class(function CameraOrbit(_container, _wrap) {
    Inherit(this, Component);
    var _this = this;

    var _lookAt = new THREE.Vector3();
    var _pos = new Vector3();
    var _target = new Vector3(0, 0, 5000);
    var _wrapTarget = new Vector3();
    var _accel = Mobile.Accelerometer;
    var _enabled = true;

    var MOVEX = 1000;
    var MOVEY = 1000;
    var _max = 100;

    //*** Constructor
    (function () {
        _accel.capture();
        addListeners();

        defer(function() {
            _target.z = Camera.instance().zDistance;
        });
    })();

    function addAccel() {
        if (!_accel.alpha) return;
        if (!_target.gyro) _target.gyro = new Vector3();

        _target.gyro.x = Utils.range(_accel.alpha, -10, 10, -MOVEX *.5 * _max, MOVEX *.5 * _max);
        _target.gyro.y = Utils.range(_accel.beta, -10, 10, -MOVEY *.5 * _max, MOVEY *.5 * _max);
        _target.gyro.z = Camera.instance().zDistance;

        _target.lerp(_target.gyro, 0.02);
        _target.y += 50;
    }

    //*** Event handlers
    function addListeners() {
        if (!Device.mobile) Stage.bind('touchmove', touchMove);
    }

    function touchMove(e) {
        //if (!_enabled) return;
        _target.x = Utils.range(Mouse.x, 0, Stage.width, -MOVEX, MOVEX);
        _target.y = Utils.range(Mouse.y, 0, Stage.height, -MOVEY, MOVEY) + 2000;
    }

    //*** Public methods
    this.update = function() {
        if (Device.mobile) addAccel();

        _target.z = Camera.instance().zDistance;
        //if (!_enabled) _pos.z = _target.z;

        _pos.interp(_target, 0.02, 'easeOutQuart', 20000);
        _pos.lerp(_target, 0.07);

        _container.position.copy(_pos);
        _container.lookAt(_lookAt);

        var zMove = Camera.instance().zMove;
        _wrap.position.z = zMove;
        //_wrap.rotation.z = Utils.range(zMove, 0, 800, 0, Utils.toRadians(1));
    }

    this.set('enabled', function(v) {
        _enabled = v;
    });

    this.get('enabled', function() {
        return _enabled;
    });

});

Class(function CameraRotation(_root, _wrap) {
    Inherit(this, Component);
    var _this = this;
    var _input, _camera, _prevent, _move, _moving, _tween;

    var _hold = new Vector3();
    var _target = new Vector3();
    var _rotation = new Vector3();
    var _velocity = new Vector3();
    var _moveTarget = 0;
    var _moveAlpha = 0.07;
    var _enabled = true;

    var SCREEN_ROTATION = 180;
    var X_LIMIT = (function() {
        if (Mobile.tablet) return 0.2;
        if (Mobile.phone) return 0.25;
        return 0.15;
    })();

    //*** Constructor
    (function () {
        Mouse.x = Stage.width/2;
        Mouse.y = Stage.height/2;
        defer(initInput);
    })();

    function initInput() {
        _input = _this.initClass(Interaction.Input, __window);
        _input.onStart = touchStart;
        _input.onUpdate = touchMove;
        _input.onEnd = touchEnd;
    }

    function loop() {
        if (!_enabled) return;
        if (!_camera) _camera = Camera.instance();

        _target.lerp(_velocity, 0.07);
        _rotation.lerp(_target, 0.7);

        _root.matrixWorld.makeRotationY(Utils.toRadians(_rotation.y));
        _wrap.rotation.x = Utils.toRadians(_rotation.x);

        _camera.zMove += (_moveTarget - _camera.zMove) * _moveAlpha;
    }

    //*** Event handlers
    function touchStart(e) {
        if (Device.mobile && (Global.TOUCHING_SNOW || (e.touches && e.touches.length > 1))) return;
        _moving = true;
        _velocity.y = _target.y;
        _hold.y = _target.y;
        _hold.x = _target.x;
        _moveAlpha = 0.07;
    }

    function touchMove(e, evt) {
        if (evt.touches && evt.touches.length > 1) return _moving = false;
        if (!_moving || (Device.mobile && Global.TOUCHING_SNOW)) return;

        Global.DRAGGING = true;

        _target.y = _hold.y + (-e.x / Stage.width) * SCREEN_ROTATION;
        _target.x = _hold.x + (-e.y / Stage.height) * (SCREEN_ROTATION * X_LIMIT);
        _velocity.y = _target.y;
        _velocity.x = _target.x;
        _move = e;

        _moveTarget = Utils.range(Math.abs(_input.velocity.x), 0, 7, 0, Camera.instance().zOrigin * 0.75) * 0.1;

        if (Camera.instance().available && _tween && _tween.stop) _tween = _tween.stop();
    }

    function touchEnd(e) {
        if (!_moving || Global.TOUCHING_SNOW) return;
        var move = ((-_input.velocity.x * 200) / Stage.width) * SCREEN_ROTATION;
        if (_move && _move.length() > 8) _velocity.y = _target.y + move;
        _velocity.x = 0;
        _moveTarget = 0;
        _moveAlpha = 0.02;
        _moving = false;

        Global.DRAGGING = false;

        if (_move) _move.clear();
    }


    //*** Public methods
    this.animateIn = function() {
        _velocity.y = 100;
        _tween = TweenManager.tween(_velocity, {y: 0}, 5000, 'easeInOutSine');
    }

    this.update = function() {
        loop();
    }

    this.set('enabled', function(v) {
        _enabled = v;
    });

    this.get('enabled', function() {
        return _enabled;
    });
});

Class(function EarthClouds() {
    Inherit(this, Component);
    var _this = this;
    var _system, _geom;
    var _position, _shader;

    var COUNT = Device.mobile ? 50 : 150;

    //*** Constructor
    (function () {
        initParticles();
        initGeometry();
        initMesh();
        Render.start(loop);
    })();

    function initParticles() {
        _system = _this.initClass(ParticlePhysics);
        _system.skipIntegration = true;
        _system.addBehavior(new EarthCloudsBehavior());
    }

    function initGeometry() {
        _geom = new THREE.BufferGeometry();

        var position = new Float32Array(COUNT * 3);
        var scale = new Float32Array(COUNT);
        var rotation = new Float32Array(COUNT);
        var opacity = new Float32Array(COUNT);
        for (var i = 0; i < COUNT; i++) {
            var x = Utils.doRandom(-1200, 1200);
            var y = Utils.doRandom(-200, 200);
            var z = Utils.doRandom(-1000, 1000);

            var p = new Particle(new Vector3(x, y, z));
            p.active = !Utils.doRandom(0, 1);
            p.origin = new Vector3().copy(p.pos);
            _system.addParticle(p);

            position[i * 3 + 0] = x;
            position[i * 3 + 1] = y;
            position[i * 3 + 2] = z;

            rotation[i] = Utils.toRadians(Utils.doRandom(0, 360));
            scale[i] = Utils.doRandom(80, 160) / 100;
            opacity[i] = Utils.doRandom(30, 100) / 100;
        }

        _position = new THREE.BufferAttribute(position, 3);
        _geom.addAttribute('position', _position);
        _geom.addAttribute('scale', new THREE.BufferAttribute(scale, 1));
        _geom.addAttribute('rotation', new THREE.BufferAttribute(rotation, 1));
        _geom.addAttribute('opacity', new THREE.BufferAttribute(opacity, 1));
    }

    function initMesh() {
        var shader = new Shader('Clouds', 'Clouds');
        shader.uniforms = {
            size: {type: 'f', value: 700},
            diffuse: {type: 'c', value: new THREE.Color(0x617a97)},
            tCloud: {type: 't', value: Utils3D.getTexture('assets/images/storm/cloud.png')},
            tColor: {type: 't', value: null},
            alpha: {type: 'f', value: 0.7}
        };

        shader.material.transparent = true;
        shader.material.depthWrite = false;
        shader.material.depthTest = false;
        shader.material.blending = THREE.AdditiveBlending;

        defer(function() {
            shader.uniforms.tColor.value = EarthSnow.COLOR_MAP;
        });

        _this.mesh = new THREE.Points(_geom, shader.material);
        _this.mesh.position.y = 1000;

        _shader = shader;
    }

    function loop() {
        _system.update();

        if (Hardware.VR) {
            _shader.set('alpha', 0.7 * Utils.range(Camera.instance().vrRadius, 0, 1, 1, 0.7));
            if (Hardware.CARDBOARD) _shader.set('size', 700 * Utils.range(Camera.instance().vrRadius, 0, 1, 1, 0.5));
        }

        if (Device.mobile) {
            var alpha = 0.7 * Utils.range(Camera.instance().zoom || 0, 1, 0.6, 0.5, 1, true);
            _shader.uniforms.alpha.value += (alpha - _shader.uniforms.alpha.value) * 0.07;
        }

        var index = 0;
        var p = _system.particles.start();
        while (p) {
            _position.setXYZ(index, p.pos.x, p.pos.y, p.pos.z);
            index++;
            p = _system.particles.next();
        }

        _position.needsUpdate = true;
    }

    //*** Event handlers

    //*** Public methods

});

Class(function EarthCloudsBehavior() {
    Inherit(this, Component);
    var _this = this;

    var _calc = new Vector3();
    var DIST_SQ = Math.pow(600, 2);

    function init(p) {
        p.speed = 3 * (Utils.doRandom(80, 120) / 100);
    }

    //*** Public methods
    this.applyBehavior = function(p) {
        if (!p.speed) init(p);
        p.pos.z += p.speed;

        if (p.active && Global.INTERACTION) {
            _calc.subVectors(p.pos, Global.INTERACTION);
            var heading = _calc.heading2D();
            p.pos.tx = p.origin.x - Math.cos(heading) * 300;
            p.pos.ty = p.origin.y - Math.sin(heading) * 300;

            p.pos.y += (p.pos.ty - p.pos.y) * 0.018;
            p.pos.x += (p.pos.tx - p.pos.x) * 0.018;
        }

        if (p.pos.z > 1400) p.pos.z -= 2400;
    }
});

Class(function EarthElements() {
    Inherit(this, Component);
    var _this = this;
    var _hut, _tree;

    this.object3D = new THREE.Object3D();

    //*** Constructor
    (function () {
        initViews();
    })();

    function initViews() {
        _hut = _this.initClass(ElementsHut);
        _this.object3D.add(_hut.mesh);

        _tree = _this.initClass(ElementsTree);
        _this.object3D.add(_tree.mesh);
    }

    //*** Event handlers

    //*** Public methods

});

Class(function ElementsHut() {
    Inherit(this, Component);
    var _this = this;
    var _mesh;

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        var geom = Utils3D.loadGeometry('hut');

        var shader = new Shader('Hut', 'Hut');
        shader.uniforms = {
            tDiffuse: {type: 't', value: Utils3D.getTexture('assets/images/textures/hut.jpg')},
            tColor: {type: 't', value: null},
            diffuse: {type: 'c', value: new THREE.Color(0x355376)},
        }

        _mesh = new THREE.Mesh(geom, shader.material);

        geom.applyMatrix(new THREE.Matrix4().makeScale(120, 120, 120));
        geom.applyMatrix(new THREE.Matrix4().makeRotationX(Utils.toRadians(-90)));

        _mesh.position.y = 300;
        _mesh.position.x = -600;
        _mesh.position.x = -600;

        Dev.expose('pos', _mesh.position);

        _mesh.rotation.y = Utils.toRadians(20);

        _this.mesh = _mesh;

        defer(function() {
            shader.uniforms.tColor.value = EarthSnow.COLOR_MAP;
        });
    }

    //*** Event handlers

    //*** Public methods

});

Class(function ElementsTree() {
    Inherit(this, Component);
    var _this = this;

    this.mesh = new THREE.Object3D();

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        var tree = Utils3D.loadGeometry('tree');
        var geom = new THREE.BufferGeometry();

        var shader = new Shader('Hut', 'Hut');
        shader.uniforms = {
            tDiffuse: {type: 't', value: Utils3D.getTexture('assets/images/textures/leaf.png')},
            tColor: {type: 't', value: null},
            diffuse: {type: 'c', value: new THREE.Color(0x355376)},
        }

        shader.material.transparent = true;
        shader.material.side = THREE.DoubleSide;

        //_this.mesh = new THREE.Mesh(tree, shader.material);
        //_this.mesh.scale.set(2, 1.4, 1.7);
        //
        //_this.mesh.position.y = 50;
        //_this.mesh.position.x = -600;
        //_this.mesh.position.z = -600;

        var mesh = new THREE.Mesh(tree, shader.material);
        mesh.position.y = 50;
        mesh.position.x = -600;
        mesh.position.z = -500;
        mesh.scale.set(2, 1.4, 1.7);
        _this.mesh.add(mesh);

        if (!Device.mobile) {
            mesh = new THREE.Mesh(tree, shader.material);
            mesh.position.y = 30;
            mesh.position.x = -300;
            mesh.position.z = -700;
            mesh.scale.set(1.4, 1.4, 1.4);
            _this.mesh.add(mesh);
        }

        defer(function() {
            shader.uniforms.tColor.value = EarthSnow.COLOR_MAP;
        });
    }

    //*** Event handlers

    //*** Public methods

});

Class(function EarthFlakes() {
    Inherit(this, Component);
    var _this = this;
    var _geom, _mesh, _thread, _recycle;
    var _interaction, _shader, _baseSize;

    var COUNT = (function() {
        if (Mobile.os == 'Android') return 100;
        if (Device.mobile) return 500;
        return 1000;
    })();

    //*** Constructor
    (function () {
        initGeometry();
        initMesh();
        initThread();
        initInteraction();
        if (Hardware.VR) Render.start(loop);
    })();

    function initGeometry() {
        _geom = new THREE.BufferGeometry();

        var position = new Float32Array(COUNT * 3);
        var scale = new Float32Array(COUNT);
        var alpha = new Float32Array(COUNT);
        for (var i = 0; i < COUNT; i++) {
            position[i * 3 + 0] = Utils.doRandom(-1000, 1000);
            position[i * 3 + 1] = Utils.doRandom(-1000, 1000);
            position[i * 3 + 2] = Utils.doRandom(-1000, 1000);

            scale[i] = Utils.doRandom(50, 150) / 100;
            alpha[i] = 1;
        }

        _geom.addAttribute('position', new THREE.BufferAttribute(position, 3));
        _geom.addAttribute('scale', new THREE.BufferAttribute(scale, 1));
        _geom.addAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
    }

    function initMesh() {
        var shader = new Shader('Flakes', 'Flakes');
        var size = Mobile.phone ? 10 : 15;
        if (Hardware.VR) size *= 0.2;

        _baseSize = size;

        shader.uniforms = {
            size: {type: 'f', value: size},
            tMap: {type: 't', value: Utils3D.getTexture('assets/images/flakes/particle.png')},
            tColor: {type: 't', value: null}
        };

        shader.material.transparent = true;
        shader.material.depthWrite = false;
        shader.material.blending = THREE.AdditiveBlending;

        defer(function() {
            shader.uniforms.tColor.value = EarthSnow.COLOR_MAP;
        });

        _this.mesh = new THREE.Points(_geom, shader.material);

        _shader = shader;
    }

    function initThread() {
        _thread = _this.initClass(Thread, SnowFlakeThread);
        _thread.importClass(
            Vector3, EulerIntegrator, ParticlePhysics, LinkedList, Particle, ParticleConverter, ObjectPool, Vector2,
            Force, SnowFlakeBehavior, FlakeRepulsor
        );

        _thread.init({count: COUNT});
        _thread.on('transfer', incomingData);
    }

    function initInteraction() {
        _interaction = _this.initClass(EarthFlakesInteraction, _thread, _this.mesh);
    }

    function recycle(buffer, key) {
        if (!_recycle) _recycle = {transfer: true, msg: {buffers: []}};
        _recycle.msg.name = key;
        _recycle.msg.array = buffer;
        _recycle.msg.buffers.length = 0;
        _recycle.msg.buffers.push(buffer.buffer);
        _thread.recycleBuffer(_recycle);
    }

    function loop() {
        _shader.set('size', _baseSize * Utils.range(Camera.instance().vrRadius, 0, 1, 1, 1.8));
    }

    //*** Event handlers
    function incomingData(e) {
        for (var key in e) {
            var buffer = e[key];
            if (!(buffer instanceof Float32Array)) continue;

            _geom.attributes[key].array = buffer;
            _geom.attributes[key].needsUpdate = true;

            recycle(buffer, key);
        }
    }

    //*** Public methods

});

Class(function EarthFlakesInteraction(_thread, _mesh) {
    Inherit(this, Component);
    var _this = this;
    var _ray;
    var _meshes = [];
    var _evt = {};

    //*** Constructor
    (function () {
        initMeshes();
        initRaycaster();
        if (!Hardware.VR) Render.start(loop);
    })();

    function initMeshes() {
        var geom = new THREE.PlaneGeometry(3000, 3000);
        var mat = new THREE.MeshNormalMaterial({wireframe: true, visible: false, side: THREE.DoubleSide});

        var mesh = new THREE.Mesh(geom, mat);
        //mesh.rotation.x = Utils.toRadians(-90);
        _mesh.add(mesh);
        _meshes.push(mesh);
    }

    function initRaycaster() {
        _ray = new Raycaster(Camera.instance().worldCamera);
    }

    function loop() {
        _meshes[0].quaternion.copy(Camera.instance().worldCamera.quaternion);

        var hit = _ray.checkHit(_meshes)[0];
        if (!hit) return;

        _evt.x = hit.point.x;
        _evt.y = hit.point.y;
        _evt.z = hit.point.z;

        Global.INTERACTION = _evt;

        _thread.sendPoint(_evt);
    }

    //*** Event handlers

    //*** Public methods
});

Class(function FlakeRepulsor(_target, _radius, _strength) {
    Inherit(this, Component);
    var _this = this;
    var _delta;

    _strength = _strength || 100;
    _radius = _radius || 1000;

    var _radiusSq = _radius * _radius;
    var _lenSq = 0;

    this.target = _target;

    //*** Constructor
    (function () {
        initVector();
    })();

    function initVector() {
        var Vector = typeof _target.z !== 'undefined' ? Vector3 : Vector2;
        _delta = new Vector();
    }

    //*** Event handlers

    //*** Public methods
    this.get('strength', function() {
        return _strength;
    });

    this.set('strength', function(force) {
        _strength = force;
    });''

    this.get('radius', function() {
        return _radius;
    });

    this.set('radius', function(radius) {
        _radius = radius;
        _radiusSq = radius * radius;
    });

    this.applyBehavior = function(p, dt) {
        if (p.fixed) return;
        _delta.copyFrom(_target).sub(p.pos);

        var distSq = _delta.lengthSq();
        if (distSq < _radiusSq && distSq > 0.000001) {
            _delta.normalize().multiply(1.0 - distSq / _radiusSq);
            p.pos.add(_delta.multiply(_strength * 100));
            p.vel.add(_delta.multiply(-_strength * 0.1));
            p.moved = true;
        }
    }
});

Class(function ParticleConverter(_particles) {
    Inherit(this, Component);
    var _this = this;

    var _attributes = [];
    var _output = {};

    function initPool() {
        for (var i = 0; i < attributes.length; i++)
            _pool = _this.initClass(ObjectPool);
        for (var i = 0; i < 3; i++) {
            var array = new Float32Array(_particles.length * 3);
            _pool.put(array);
        }
    }

    function createPool(attr) {
        attr.pool = new ObjectPool();
        for (var i = 0; i < 3; i++) {
            attr.pool.put(new Float32Array(_particles.length * attr.size));
        }
    }

    function findAttribute(name) {
        for (var i = 0; i < _attributes.length; i++) {
            var attr = _attributes[i];
            if (attr.name == name) return attr;
        }
    }

    //*** Event handlers

    //*** Public methods
    this.addAttribute = function(name, size, params) {
        _attributes.push({name: name, size: size, params: params});
    }

    this.exec = function() {
        for (var i = 0; i < _attributes.length; i++) {
            var attr = _attributes[i];
            if (!attr.pool) createPool(attr);

            var array = attr.pool.get() || new Float32Array(_particles.length * attr.size);

            var p = _particles.start();
            var index = 0;
            while (p) {

                for (var j = 0; j < attr.size; j++) {
                    array[index * attr.size + j] = p[attr.params[j]] || p.pos[attr.params[j]];
                }

                index++;

                p = _particles.next();
            }

            _output[attr.name] = array;

        }

        return _output;
    }

    this.recycle = function(e) {
        findAttribute(e.name).pool.put(e.array);
    }
});

Class(function SnowFlakeBehavior() {
    Inherit(this, Component);
    var _this = this;

    //*** Constructor
    (function () {

    })();

    function reset(p, full) {
        p.s = true;
        p.vel.x = Utils.doRandom(-100, 100) / 100;
        p.vel.y = Utils.doRandom(0, 100) / 100;
        p.vel.z = Utils.doRandom(-100, 100) / 100;

        p.alpha = 1;
        p.decay = Utils.doRandom(14, 22) / 10000;//0.0018;

        if (full) {
            p.pos.x = Utils.doRandom(-800, 800);
            p.pos.y = 900;
            p.pos.z = Utils.doRandom(-800, 800);
        }
    }

    //*** Event handlers

    //*** Public methods
    this.applyBehavior = function(p) {
        if (!p.s) reset(p);

        p.vel.x += Math.sin(Global.TIME * 0.0025) * 0.014;
        p.vel.z += Math.cos(Global.TIME * 0.0055) * 0.01;

        p.alpha -= p.decay;

        if (p.pos.y < -600 || (p.moved && p.alpha <= 0)) {
            reset(p, true);
        }

        p.pos.y -= 3;
    }
});

Class(function SnowFlakeThread() {
    Inherit(this, Component);
    var _this = this;
    var _physics, _converter, _wind, _repulsor;

    var _data = {};
    var _buffers = [];

    //*** Constructor
    (function () {

    })();

    function initPhysics(num) {
        _physics = _this.initClass(ParticlePhysics);

        _physics.addBehavior(new SnowFlakeBehavior());

        _repulsor = new FlakeRepulsor(new Vector3(-9999, 0, 0), 700, -0.4);
        _physics.addBehavior(_repulsor);

        for (var i = 0; i < num; i++) {
            var p = new Particle(new Vector3(), Utils.doRandom(50, 100) / 100);
            p.pos.x = Utils.doRandom(-800, 800);
            p.pos.y = Utils.doRandom(-800, 800);
            p.pos.z = Utils.doRandom(-800, 800);
            p.alpha = 0.5;
            _physics.addParticle(p);
        }
    }

    function initConverter() {
        _converter = _this.initClass(ParticleConverter, _physics.particles);
        _converter.addAttribute('position', 3, ['x', 'y', 'z']);
        _converter.addAttribute('alpha', 1, ['alpha']);
        _this.recycleBuffer = _converter.recycle;
    }

    function update() {
        Global.TIME = Date.now();
        _physics.update();

        var outgoing = _converter.exec();
        _buffers.length = 0;
        for (var key in outgoing) {
            _data[key] = outgoing[key];
            _buffers.push(_data[key].buffer);
        }
        emit('transfer', _data, _buffers);
    }

    //*** Event handlers

    //*** Public methods
    this.init = function(e) {
        initPhysics(e.count);
        initConverter();
        setInterval(update, 1000 / 60);
    }

    this.sendPoint = function(e) {
        _repulsor.target.copyFrom(e);
    }
});

Class(function EarthIce() {
    Inherit(this, Component);
    var _this = this;

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        var geom = new THREE.BoxGeometry(2000, 150, 2000);

        var shader = new Shader('Ice', 'Ice');
        shader.uniforms = {
            tCube: {type: 't', value: Utils3D.getCubemap('assets/images/snow/reflect.jpg')},
            tNormal: {type: 't', value: Utils3D.getTexture('assets/images/ice/normal.jpg')},
            tDepth: {type: 't', value: Utils3D.getTexture('assets/images/ice/depth.jpg')},
            tColor: {type: 't', value: null},
            diffuse: {type: 'c', value: new THREE.Color(0x123459)},
            specular: {type: 'c', value: new THREE.Color(0xffffff)},
        };

        shader.material.anisotropy = 7;

        var basic = new THREE.MeshBasicMaterial();
        basic.visible = false;
        var materials = [shader.material, shader.material, basic, basic, shader.material, shader.material];

        _this.mesh = new THREE.Mesh(geom, new THREE.MeshFaceMaterial(materials));
        _this.mesh.position.y = -75;

        defer(function() {
            shader.uniforms.tColor.value = EarthSnow.COLOR_MAP;
        });
    }

    //*** Event handlers

    //*** Public methods

});

Class(function EarthRock() {
    Inherit(this, Component);
    var _this = this;

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        var geom = new THREE.BoxGeometry(2000, 600, 2000, 10, 10, 10);

        var shader = new Shader('Rock', 'Rock');
        shader.uniforms = {
            tDiffuse0: {type: 't', value: Utils3D.getTexture('assets/images/soil/diffuse0.jpg')},
            tDiffuse1: {type: 't', value: Utils3D.getTexture('assets/images/soil/diffuse1.jpg')},
            tNoise: {type: 't', value: Utils3D.getTexture('assets/images/soil/noise0.jpg')},
            tNormal: {type: 't', value: Utils3D.getTexture('assets/images/rock/normal.jpg')},
            tColor: {type: 't', value: null},
            diffuse: {type: 'c', value: new THREE.Color(0x6786a9)},
            specular: {type: 'c', value: new THREE.Color(0xbbcee3)},
            worldLight: {type: 'v3', value: WorldLight.instance().position}
        };

        shader.material.anisotropy = 7;

        var basic = new THREE.MeshBasicMaterial();
        basic.visible = false;
        var materials = [shader.material, shader.material, basic, basic, shader.material, shader.material];

        _this.mesh = new THREE.Mesh(geom, new THREE.MeshFaceMaterial(materials));
        _this.mesh.position.y = -700;

        defer(function() {
            shader.uniforms.tColor.value = EarthSnow.COLOR_MAP;
        });
    }

    //*** Event handlers

    //*** Public methods

});

Class(function EarthSnow() {
    Inherit(this, Component);
    var _this = this;
    var _geom, _shader, _renderer, _interaction;

    var _seed = 0;

    //*** Constructor
    (function () {
        Noise.seed(Utils.doRandom(0, 10000) / 10000);
        initMesh();
        initHelpers();
        Render.start(loop);
    })();

    function initMesh() {
        _geom = new THREE.PlaneGeometry(2000, 2000, 30, 30);
        _geom.applyMatrix(new THREE.Matrix4().makeRotationX(Utils.toRadians(-90)));

        var normal = NeveUtil.getRepeatTexture('assets/images/snow/normal.jpg');
        var noise = NeveUtil.getRepeatTexture('assets/images/snow/noise.jpg');
        var diffuse = NeveUtil.getRepeatTexture('assets/images/snow/diffuse.jpg');

        var shader = Device.mobile ? 'SnowSimple' : 'Snow';
        if (Hardware.CARDBOARD) shader = 'SnowCardboard';
        if (Hardware.OCULUS) shader = 'SnowOculus';

        _shader = new Shader(shader, shader);
        _shader.uniforms = {
            tNormal: {type: 't', value: normal},
            tNoise: {type: 't', value: noise},
            tDiffuse: {type: 't', value: diffuse},
            tCube: {type: 't', value: Utils3D.getCubemap('assets/images/snow/reflect.jpg')},
            tDeform: {type: 't', value: null},
            tColor: {type: 't', value: null},
            uvOffset: {type: 'v2', value: new Vector2()},
            emissive: {type: 'c', value: new THREE.Color(0x556e84)}
        };

        _this.mesh = new THREE.Mesh(_geom, _shader.material);
    }

    function initHelpers() {
        _renderer = _this.initClass(EarthSnowSkyRenderer);
        _interaction = _this.initClass(EarthSnowInteraction, _this.mesh);
        _this.mesh.add(_interaction.mesh);

        _shader.uniforms.tDeform.value = _interaction.texture;
    }

    function loop() {
        _renderer.render();
        _seed += 3;

        if (!Hardware.VR || _seed < 6) {
            for (var i = 0; i < _geom.vertices.length; i++) {
                var v = _geom.vertices[i];
                if (!v.o) v.o = new THREE.Vector3().copy(v);

                v.y = Utils.range(Noise.simplex3(v.o.x * 0.0012, v.o.y * 0.0012, (v.o.z - _seed) * 0.0012), -1, 1, 0, 1) * 300;

                if (Math.abs(v.o.x) == 1000 || Math.abs(v.o.z) == 1000) v.y = v.o.y;
            }

            _shader.uniforms.uvOffset.value.y += 0.002;

            _geom.verticesNeedUpdate = true;
            _geom.normalsNeedUpdate = true;

            _geom.computeFaceNormals();
            _geom.computeVertexNormals();
        }

        _shader.uniforms.tColor.value = _renderer.baseTexture;
        EarthSnow.COLOR_MAP = _renderer.baseTexture;

        _interaction.update();
    }

    //*** Event handlers

    //*** Public methods

});

Class(function EarthSnowInteraction(_fullMesh) {
    Inherit(this, Component);
    var _this = this;
    var _ray, _mesh, _canvas, _context, _stamp, _ping, _pong, _useMesh;

    //*** Constructor
    (function () {
        initCanvas();
        initMesh();
        initRaycaster();
        if (Device.mobile) Stage.bind('touchend', touchEnd);
    })();

    function initCanvas() {
        var s = Device.mobile ? 64 : 512;
        _canvas = _this.initClass(Canvas, 64, 64);
        _context = _canvas.context;

        _ping = _this.initClass(Canvas, _canvas.width, _canvas.height);
        _pong = _this.initClass(Canvas, _canvas.width, _canvas.height);

        _context.fillRect(0, 0, _canvas.width, _canvas.height);
        _ping.context.fillRect(0, 0, _canvas.width, _canvas.height);
        _pong.context.fillRect(0, 0, _canvas.width, _canvas.height);

        //Stage.add(_canvas);
        //_canvas.object.setZ(999);

        _stamp = new Image();
        _stamp.crossOrigin = '';
        _stamp.src = Config.CDN + 'assets/images/snow/stamp.png' + Config.SALT;
        _stamp.s = 22;//Device.mobile ? 50 : 250;
        _stamp.hs = _stamp.s / 2;

        _this.texture = new THREE.Texture(_canvas.div);
        _this.texture.minFilter = _this.texture.magFilter = THREE.LinearFilter;
    }

    function initMesh() {
        _mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshNormalMaterial());
        _this.mesh = _mesh;
        _mesh.material.visible = false;
        _mesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Utils.toRadians(-90)));

        _useMesh = Device.mobile ? _mesh : _fullMesh;
    }

    function initRaycaster() {
        _ray = _this.initClass(Raycaster, Camera.instance().worldCamera);
    }

    //*** Event handlers
    function touchEnd(e) {
        Mouse.x = 999999;
    }

    //*** Public methods
    this.update = function() {
        if (Hardware.VR || Hardware.NO_INTERACTION) return;
        if (Device.mobile && Global.DRAGGING) return;

        if (!Device.mobile) {
            _ping.context.globalAlpha = 0.05;
            _ping.context.fillRect(0, 0, _canvas.width, _canvas.height);
            _ping.context.globalAlpha = 1;
        }

        var hit = _ray.checkHit(_useMesh)[0];
        if (hit) {
            var x = hit.uv.x * _canvas.width;
            var y = (1 - hit.uv.y) * _canvas.height;

            _ping.context.drawImage(_stamp, x - _stamp.hs, y - _stamp.hs, _stamp.s, _stamp.s);

            _this.texture.needsUpdate = true;
            Sound.startSnow();

            if (Device.mobile) {
                Global.TOUCHING_SNOW = true;

                _ping.context.globalAlpha = 0.05;
                _ping.context.fillRect(0, 0, _canvas.width, _canvas.height);
                _ping.context.globalAlpha = 1;

                _context.drawImage(_ping.context.canvas, 0, 0);

                _pong.context.fillRect(0, 0, _canvas.width, _canvas.height);
                _pong.context.drawImage(_ping.context.canvas, 0, 0.2);
                _ping.context.drawImage(_pong.context.canvas, 0, 0);
            }

        } else {
            if (Global.TOUCHING_SNOW) _this.texture.needsUpdate = true;
            Global.TOUCHING_SNOW = false;
            Sound.stopSnow();
        }

        if (!Device.mobile) {
            _context.drawImage(_ping.context.canvas, 0, 0);

            _pong.context.fillRect(0, 0, _canvas.width, _canvas.height);
            _pong.context.drawImage(_ping.context.canvas, 0, 0.2);
            _ping.context.drawImage(_pong.context.canvas, 0, 0);

            _this.texture.needsUpdate = true;
        }
    }
});

Class(function EarthSnowSkyRenderer() {
    Inherit(this, Component);
    var _this = this;
    var _renderer, _camera, _rt;

    //*** Constructor
    (function () {
        initRT();
        initCamera();
    })();

    function initRT() {
        var size = Device.mobile ? 512 : 1024;
        _rt = Utils3D.createRT(size, size);
        _this.baseTexture = _rt;
    }

    function initCamera() {
        _camera = new THREE.PerspectiveCamera(60, 1, 10, 100000);
        _camera.rotation.x = Utils.toRadians(-45);
    }

    //*** Event handlers

    //*** Public methods
    this.render = function() {
        if (!_renderer) _renderer = Scene.instance().renderer;

        SkyAurora.bright();
        Scene.instance().visibility(false);
        _renderer.render(Scene.instance().scene, _camera, _rt, true);
        Scene.instance().visibility(true);
        SkyAurora.dim();
    }
});

Class(function EarthSoil() {
    Inherit(this, Component);
    var _this = this;

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        var geom = new THREE.BoxGeometry(2000, 400, 2000, 10, 10, 10);

        var shader = new Shader('Soil', 'Soil');
        shader.uniforms = {
            tDiffuse0: {type: 't', value: Utils3D.getTexture('assets/images/soil/diffuse0.jpg')},
            tDiffuse1: {type: 't', value: Utils3D.getTexture('assets/images/soil/diffuse1.jpg')},
            tNoise: {type: 't', value: Utils3D.getTexture('assets/images/soil/noise0.jpg')},
            tNormal: {type: 't', value: Utils3D.getTexture('assets/images/soil/normal.jpg')},
            diffuse: {type: 'c', value: new THREE.Color(0x647487)},
            tColor: {type: 't', value: Utils3D.getTexture('assets/images/rock/normal.jpg')},
            worldLight: {type: 'v3', value: WorldLight.instance().position},
            variation: {type: 'f', value: 250}
        };

        shader.material.anisotropy = 7;

        var basic = new THREE.MeshBasicMaterial();
        basic.visible = false;
        var materials = [shader.material, shader.material, basic, basic, shader.material, shader.material];

        _this.mesh = new THREE.Mesh(geom, new THREE.MeshFaceMaterial(materials));
        _this.mesh.position.y = -300;

        defer(function() {
            shader.uniforms.tColor.value = EarthSnow.COLOR_MAP;
        });
    }

    //*** Event handlers

    //*** Public methods

});

Class(function IntroAT() {
    Inherit(this, View);
    var _this = this;
    var $this, $text;
    var _letters;

    //*** Constructor
    (function () {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(65, 10).invisible();

        $this.transform({rotation: -90, x: 3, y: 65}).transformPoint(0, 5);

        $text = $this.create('text');
        $text.fontStyle('Playfair', 10, '#fff').text('Active Theory');

        _letters = SplitTextfield.split($text, 'letter');

        $this.interact(null, function() {
            getURL('http://activetheory.net', '_blank');
        });
    }

    //*** Event handlers

    //*** Public methods
    this.animateIn = function() {
        $this.visible();
        _letters.forEach(function($l, i) {
            $l.css({opacity: 0});

            var delay = TweenManager.interpolate(500, i / _letters.length, 'linear');
            $l.tween({opacity: 1}, 2000, 'easeOutSine', delay);
        });
    }

    this.animateOut = function() {
        _letters.forEach(function($l, i) {
            var delay = TweenManager.interpolate(500, i / _letters.length, 'linear');
            $l.tween({opacity: 0}, 500, 'easeOutSine', delay);
        });
    }
});

Class(function IntroBG() {
    Inherit(this, View);
    var _this = this;
    var $this, $stars;

    //*** Constructor
    (function () {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size('100%').bg('assets/images/ui/bg.jpg').css({opacity: 0});

        $stars = $this.create('stars');
        $stars.size('100%').bg('assets/images/ui/stars.png');
    }

    //*** Event handlers

    //*** Public methods
    this.animateIn = function() {
        $this.tween({opacity: 1}, 500, 'easeOutSine');
    }

    this.animateOut = function() {
        $this.tween({opacity: 0}, 1000, 'easeInOutSine');
    }
});

Class(function IntroCopy() {
    Inherit(this, View);
    var _this = this;
    var $this;

    var _words = [];

    var _config = [
        {text: 'warmest winter', y: 0, x: 0},
        {text: 'wishes from', y: 35, x: 109},
        {text: 'Active Theory.', y: 70, x: 42},
    ];

    //*** Constructor
    (function () {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(295, 120);

        _config.forEach(function(d) {
            var $line = $this.create('line');
            $line.fontStyle('Playfair', 33, '#fff').text(d.text).css({left: d.x, top: d.y});
            _words = _words.concat(SplitTextfield.split($line, 'word'));
        });

        _words.forEach(function($w) {
            $w.transform({perspective: 2000, y: 50, z: -40, rotationX: 40}).css({opacity: 0});
        });
    }

    //*** Event handlers

    //*** Public methods
    this.animateIn = function() {
        $this.css({opacity: 0}).tween({opacity: 1}, 2000, 'easeOutSine');
        _words.forEach(function($w, i) {
            var delay = TweenManager.interpolate(500, i / _words.length, 'linear');
            $w.tween({opacity: 1, y: 0, z: 0, rotationX: 0}, 1000, 'easeOutCubic', delay);
        });

        $this.interact(null, function() {
            getURL('http://activetheory.net', '_blank');
        });
    }

    this.animateOut = function() {
        $this.tween({opacity: 0}, 700, 'easeOutSine');
        _words.forEach(function($w, i) {
            var delay = TweenManager.interpolate(200, i / _words.length, 'linear');
            $w.tween({opacity: 0, y: -25, z: -40, rotationX: -40}, 500, 'easeInOutCubic', delay);
        });
    }
});

Class(function IntroLogo() {
    Inherit(this, View);
    var _this = this;
    var $this, $logo, $text;

    var _words;

    //*** Constructor
    (function () {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(660, 255).invisible();

        $logo = $this.create('logo');
        $logo.size(561/2, 152/2).bg('assets/images/ui/logo.png');

        $text = $this.create('text');
        $text.size('100%', 100).css({top: 86, left: 149}).fontStyle('Mont', 10, '#707060').text(getInstruction());

        _words = SplitTextfield.split($text, 'word');
        _words.forEach(function($w) {
            $w.css({opacity: 0}).transform({y: 12, perspective: 2000, rotationX: 20});
        });
    }

    function getInstruction() {
        if (Hardware.CARDBOARD) return 'Place device in Google cardboard.';
        if (Hardware.OCULUS) return 'Click anywhere to launch HMD mode.';
        if (!Device.mobile) return 'Click and drag to rotate, scroll to zoom.';
        else return 'Touch and drag to rotate, pinch to zoom.';
    }

    //*** Event handlers

    //*** Public methods
    this.animateIn = function() {
        $this.visible().css({opacity: 0});
        $this.tween({opacity: 1}, 2000, 'easeOutSine');
        $logo.css({opacity: 0}).transform({x: -20, perspective: 2000, z: -100, rotationY: 0}).tween({opacity: 1, x: 0, z: 0, rotationY: 0}, 2000, 'easeOutCubic');

        _words.forEach(function($w, i) {
            var delay = TweenManager.interpolate(400, i / _words.length, 'linear');
            $w.tween({opacity: 1, y: 1, rotationX: 0}, 1000, 'easeOutCubic', delay + 1000);
        });
    }

    this.animateOut = function() {
        $logo.tween({opacity: 0}, 500, 'easeOutCubic');
        _words.forEach(function($w, i) {
            var delay = TweenManager.interpolate(200, i / _words.length, 'linear');
            $w.tween({opacity: 0}, 500, 'easeOutCubic', delay);
        });
    }

    this.tuck = function() {
        $text.css({left: 50, top: 65});
        $logo.size($logo.width * 0.8, $logo.height * 0.8);
    }

    this.untuck = function() {
        $logo.size(561/2, 152/2);
        $text.css({top: 86, left: 149});
    }
});

Class(function IntroSpinner() {
    Inherit(this, View);
    var _this = this;
    var $this, $bg, $spinner;

    //*** Constructor
    (function () {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(40, 40).invisible();

        $bg = $this.create('bg');
        $bg.size(40, 40).bg('assets/images/ui/loader-bg.png');

        $spinner = $this.create('spinner');
        $spinner.size(40, 40).bg('assets/images/ui/loader.png');

        var animation = _this.initClass(CSSAnimation);
        animation.duration = 1500;
        animation.loop = true;
        animation.ease = 'linear';
        animation.frames = [
            {rotation: 0},
            {rotation: 360}
        ];

        animation.applyTo($spinner);
        animation.play();
    }

    //*** Event handlers

    //*** Public methods
    this.animateIn = function() {
        $this.visible().transform({perspective: 2000, z: -1000}).css({opacity: 0});
        $this.tween({z: 0, opacity: 1}, 1000, 'easeOutCubic');
    }

    this.animateOut = function() {
        $this.tween({z: -1000, opacity: 0}, 500, 'easeOutCubic');
    }
});

Class(function IntroYear() {
    Inherit(this, View);
    var _this = this;
    var $this, $text;

    var _letters;

    //*** Constructor
    (function () {
        initHTML();
    })();

    function initHTML() {
        $this = _this.element;
        $this.size(23, 20).center(1, 0).invisible();

        $text = $this.create('text');
        $text.fontStyle('Mont', 10, '#909079').text('2015');

        _letters = SplitTextfield.split($text, 'letter');
    }

    //*** Event handlers

    //*** Public methods
    this.animateIn = function() {
        $this.visible();
        _letters.forEach(function($l, i) {
            $l.transform({perspective: 2000, y: 5, rotationX: 20}).css({opacity: 0});

            var delay = TweenManager.interpolate(200, i / _letters.length, 'easeOutQuad');
            $l.tween({y: 0, rotationX: 0, opacity: 1}, 500, 'easeOutCubic', delay);
        });
    }

    this.animateOut = function() {
        _letters.forEach(function($l, i) {
            var delay = TweenManager.interpolate(200, i / _letters.length, 'easeOutQuad');
            $l.tween({opacity: 0}, 500, 'easeOutCubic', delay);
        });
    }
});

Class(function PlaygroundSky() {
    Inherit(this, Component);
    var _this = this;

    this.object3D = new THREE.Object3D();

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        var geom = new THREE.SphereGeometry(50000);

        var shader = new Shader('Aurora', 'Aurora');
        shader.uniforms = {
            time: {type: 'f', value: 0},
            hue: {type: 'f', value: 0.5},
            base: {type: 'c', value: new THREE.Color(0x050d15)}
        }
        shader.material.side = THREE.BackSide;

        Render.start(function(t, dt) {
            shader.uniforms.hue.value += 0.0002;
            if (shader.uniforms.hue.value > 1) shader.uniforms.hue.value -= 1;
            shader.set('time', dt * 0.00015);
        });

        var mesh = new THREE.Mesh(geom, shader.material);
        _this.object3D.add(mesh);
    }

    //*** Event handlers

    //*** Public methods

});

Class(function PlaygroundTerrain() {
    Inherit(this, Component);
    var _this = this;

    this.object3D = new THREE.Object3D();

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {

    }

    //*** Event handlers

    //*** Public methods

});

Class(function PlaygroundTree() {
    Inherit(this, Component);
    var _this = this;

    this.object3D = new THREE.Object3D();

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        var geom = Utils3D.loadGeometry('hut');
        var mat = new THREE.MeshBasicMaterial({map: Utils3D.getTexture('assets/images/textures/hut.jpg')});
        var mesh = new THREE.Mesh(geom, mat);

        geom.applyMatrix(new THREE.Matrix4().makeScale(200, 200, 200));
        geom.applyMatrix(new THREE.Matrix4().makeRotationX(Utils.toRadians(-90)));

        _this.object3D.add(mesh);
    }

    //*** Event handlers

    //*** Public methods

});

Class(function TiltShiftPass(_nuke) {
    Inherit(this, Component);
    var _this = this;
    var _shader;

    //*** Constructor
    (function () {
        initPass();
        Render.start(loop);
    })();

    function initPass() {
        _shader = _this.initClass(TiltShiftShader);
        _nuke.add(_shader.x);
        _nuke.add(_shader.y);

        _shader.blur = 25;
        _shader.gradientBlur = 550;
    }

    function loop() {
        _shader.gradientBlur = Utils.range(Camera.instance().zDistance, 2500, 7000, 550, 700);
        _shader.blur = Utils.range(Camera.instance().zDistance, 2500, 7000, 25, 18);
    }

    //*** Event handlers

    //*** Public methods

});

Class(function SkyAurora() {
    Inherit(this, Component);
    var _this = this;
    var _shader;

    //*** Constructor
    (function () {
        initMesh();
        Render.start(loop);
    })();

    function initMesh() {
        var geom = new THREE.SphereGeometry(20000);

        _shader = new Shader('Aurora', 'Aurora');
        _shader.uniforms = {
            time: {type: 'f', value: 0},
            hue: {type: 'f', value: 0.5},
            brightness: {type: 'f', value: 1},
            base: {type: 'c', value: new THREE.Color(0x050d15)}
        }
        _shader.material.side = THREE.BackSide;
        _shader.material.forceVisible = true;

        SkyAurora.MATERIAL = _shader.material;

        _this.mesh = new THREE.Mesh(geom, _shader.material);
        _this.mesh.frustumCulled = false;
    }

    function loop(t, dt) {
        _shader.uniforms.hue.value += 0.0002;
        if (_shader.uniforms.hue.value > 1) _shader.uniforms.hue.value -= 1;
        _shader.set('time', dt * 0.00015);
    }

    //*** Event handlers

    //*** Public methods
    SkyAurora.bright = function() {
        _shader.set('brightness', 3);
    }

    SkyAurora.dim = function() {
        _shader.set('brightness', 1);
    }
});

Class(function SkyDome() {
    Inherit(this, Component);
    var _this = this;
    var _shader, _box;

    //*** Constructor
    (function () {
        initSkybox();
        initMesh();
    })();

    function initSkybox() {
        var images = [];
        var dirs = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz'];
        for (var i = 0; i < dirs.length; i++) {
            images.push('assets/images/dome/sky-' + dirs[i] + '.jpg');
        }

        _box = Utils3D.getCubemap(images);
    }

    function initMesh() {
        var geom = new THREE.SphereGeometry(8000, 30, 30);
        //var mat = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});

        _shader = new Shader('Dome', 'Dome');
        _shader.uniforms = {
            tCube: {type: 't', value: _box},
            tColor: {type: 't', value: null},
            alpha: {type: 'f', value: Hardware.OCULUS ? 0.2 : 0.1}
        };
        _shader.material.transparent = true;
        _shader.material.side = THREE.BackSide;
        _shader.material.blending = THREE.AdditiveBlending;

        _this.mesh = new THREE.Mesh(geom, _shader.material);

        defer(function() {
            _shader.uniforms.tColor.value = EarthSnow.COLOR_MAP;
        });
    }

    //*** Event handlers

    //*** Public methods

});

Class(function SkyStars() {
    Inherit(this, Component);
    var _this = this;
    var _geom;

    var COUNT = Device.mobile ? 100 : 350;

    //*** Constructor
    (function () {
        initGeometry();
        initMesh();
        if (Hardware.VR) Render.start(loop);
    })();

    function initGeometry() {
        _geom = new THREE.BufferGeometry();

        var vector = new Vector3();
        var matrix = new Matrix4();

        var position = new Float32Array(COUNT * 3);
        var scale = new Float32Array(COUNT);
        for (var i = 0; i < COUNT; i++) {
            vector.set(1, 0, 0);
            matrix.identity().setRotation(0, Math.random() * Math.PI*2, Math.random() * Math.PI*2);
            matrix.transformVector(vector);
            vector.multiply(Utils.doRandom(2500, 7500));

            position[i * 3 + 0] = vector.x;
            position[i * 3 + 1] = vector.y;
            position[i * 3 + 2] = vector.z;

            scale[i] = Utils.doRandom(50, 150) / 100;
        }

        _geom.addAttribute('position', new THREE.BufferAttribute(position, 3));
        _geom.addAttribute('scale', new THREE.BufferAttribute(scale, 1));
    }

    function initMesh() {
        var shader = new Shader('Stars', 'Stars');
        shader.uniforms = {
            size: {type: 'f', value: 70},
            tFlare: {type: 't', value: Utils3D.getTexture('assets/images/stars/flare.jpg')},
            tCenter: {type: 't', value: Utils3D.getTexture('assets/images/stars/center.jpg')},
            tMap: {type: 't', value: Utils3D.getTexture('assets/images/stars/map.jpg')},
            resolution: {type: 'v2', value: new Vector2(3000, 3000)}
        };

        shader.material.transparent = true;
        shader.material.depthWrite = false;
        shader.material.blending = THREE.AdditiveBlending;

        _this.mesh = new THREE.Points(_geom, shader.material);
    }

    //*** Event handlers
    function loop() {
        _this.mesh.rotation.y += 0.0005;
    }

    //*** Public methods

});

Class(function Main() {
    var _intro;

    //*** Constructor
    (function() {
        __body.bg('#000');
        if (Hydra.HASH.strpos('playground')) initPlayground();
        else start();
    })();

    function initPlayground() {
        AssetLoader.loadAllAssets(function() {
            Playground.instance();
        });
    }

    function start() {
        Utils3D.disableWarnings();

        _intro = new Intro();
        _intro.events.add(HydraEvents.COMPLETE, function() {
            _intro = _intro.destroy();
        });
    }

    //*** Event Handlers

    //*** Public methods
});

window._MINIFIED_ = true;