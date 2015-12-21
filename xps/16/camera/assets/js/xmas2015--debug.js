// --------------------------------------
// 
//    _  _ _/ .  _  _/ /_ _  _  _        
//   /_|/_ / /|//_  / / //_ /_// /_/     
//   http://activetheory.net     _/      
// 
// --------------------------------------
//   12/18/15 11:22a
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
			if (!src.strpos('http') && src.strpos('.')) src = Hydra.CDN + src;
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
            if (!callback) continue;
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



	window.ASSETS = ["assets\/images\/arrow.png","assets\/images\/congratulations.png","assets\/images\/desktop\/depth.jpg","assets\/images\/desktop\/scene.jpg","assets\/images\/mobile\/depth.jpg","assets\/images\/mobile\/scene.jpg","assets\/images\/objective-1.png","assets\/images\/objective-2.png","assets\/images\/objective-3.png","assets\/images\/objective-4.png","assets\/images\/objective-5.png","assets\/images\/placeholder\/placeholder.png","assets\/js\/lib\/howler.js","assets\/js\/lib\/three.js","assets\/shaders\/compiled.vs"];


Class(function CustomEvents() {

    this.LOAD_PROGRESS = 'load_progress';
    this.LOADED = 'load_complete';
    this.LIBS_LOADED = 'libs_load_complete';
    this.TUTORIAL_DRAG = 'tutorial_drag';
    this.SHOW_GOALS = 'show_objectives';
    this.FOCUS = 'adjust_focus';
    this.SHOOT = 'photo_shoot';
    this.FINISH = 'finish_game';
    this.REPLAY = 'replay_game';


}, 'static');

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
    var _objectLoader, _geomLoader;

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

    this.getTexture = function(path, nonLinear) {
        if (!_textures[path]) {
            THREE.ImageUtils.crossOrigin = "anonymous";
            _textures[path] = THREE.ImageUtils.loadTexture(_this.PATH + path);
            if (!nonLinear) _textures[path].minFilter = THREE.LinearFilter;
        }

        return _textures[path];
    }

    this.visibility = function(object, type) {
        if (object.visible == type) return;
        object.visible = type;
        if (object.material) object.material.visible = type;

        for (var i = 0; i < object.children.length; i++) {
            var child = object.children[i];
            if (child.children) _this.visibility(child, type);
            if (child.material) child.material.visible = type;
        }
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
                img.src = _this.PATH + Array.isArray(src) ? src[i] : src;
                images.push(img);
                img.onload = function() {
                    _textures[src].needsUpdate = true;
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
        return _geomLoader.parse(Hydra.JSON[name].data).geometry;
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

Class(function NukePass(_fs) {
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
            vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }',
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
    var _dpr = _params.dpr || Device.pixelRatio;

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
});

Interaction.Class(function ScrollUtil() {
    var _this = this;

    //*** Constructor
    (function () {
        addHandlers();
    })();

    //*** Event handlers

    function addHandlers() {
        ('mousewheel DOMMouseScroll wheel MozMousePixelScroll'.split(' ')).forEach(function(e) {
            window.addEventListener(e, onScroll, false);
        });
    }

    function onScroll(e) {
        e = e.originalEvent || e;
        var delta = 0;

        if (e.wheelDelta) {
            delta = e.wheelDelta;
        } else if (e.deltaY) {
            delta = e.deltaY * -40;
        } else if ((e.detail) || e.detail === 0) {
            delta = e.detail * -40;
        }

        if (typeof _this.onScroll == 'function') _this.onScroll(delta);
    }

    //*** Public methods

});

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
					if (canInclude(asset)) assets.push(asset);
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

Class(function Sound() {
    Inherit(this, Model);
    var _this = this;

    var _sounds = [
        'wind',
        'focus',
        'shoot',
        'success_1',
        'success_2',
        'success_final',
    ];

    //*** Constructor
    (function() {
        initNoop();
        _this.events.subscribe(CustomEvents.LIBS_LOADED, init);
    })();

    function initNoop() {
        _sounds.forEach(function(sound) {
            _this[sound] = {_rate: 1, play: function(){}};
        });
    }

    function init() {
        addListeners();

        loadSounds(_sounds, function() {
            //console.log('Sounds Ready');

            _this['wind'].loop(true);
            _this['wind'].volume(0.8);
            _this['wind'].play();

            _this['focus'].loop(true);
            _this['focus'].volume(0.2);
            _this['focus'].play();
        });
    }

    function loadSounds(assets, callback) {
        if (typeof assets === 'string') assets = [assets];
        var count = 0;
        var tally = function() {
            count++;
            if (count == assets.length && typeof callback == 'function') callback();
        };
        for (var i = 0; i < assets.length; i++) {
            var sound = assets[i];
            var path = 'assets/audio/' + sound;
            _this[sound] = new Howl({urls: [path + '.mp3'/*, path + '.ogg' + Config.TIMESTAMP*/], onload: tally});
        }
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(HydraEvents.BROWSER_FOCUS, focusHandler);
    }

    function focusHandler(e) {
        if (e.type == 'blur') {
            _this.forced = Howler.volume();
            _this.mute();
        } else if (_this.forced) {
            _this.unmute();
        }
    }

    //*** Public Methods
    this.mute = function() {
        if (!Howler) return;
        Howler.mute();
    };

    this.unmute = function() {
        if (!Howler) return;
        Howler.unmute();
    };

}, 'Static');

Class(function Tutorial() {
    Inherit(this, Controller);
    var _this = this;
    var $container, _look, _focus, _shoot, _find;

    (function () {
        initContainer();
        initView();
        addHandlers();
    })();

    function initContainer() {
        $container = _this.container;
        $container.css({position: 'static'});
    }

    function initView() {
        _look = _this.initClass(TutorialLookView);
        _focus = _this.initClass(TutorialFocusView);
        _shoot = _this.initClass(TutorialShootView);
        _find = _this.initClass(TutorialFindView);

        if (Device.mobile) {
            _this.delayedCall(_focus.start, 2000);
        } else {
            _this.delayedCall(_look.start, 2000);
        }
    }

    //*** Event handlers
    function addHandlers() {
        _look.events.add(HydraEvents.COMPLETE, _focus.start);
        _focus.events.add(HydraEvents.COMPLETE, _shoot.start);
        _shoot.events.add(HydraEvents.COMPLETE, _find.start);
        _find.events.add(HydraEvents.COMPLETE, complete);
    }

    function complete() {
        _this.events.fire(HydraEvents.COMPLETE);
    }

    //*** Public methods

});

Class(function WorldInteraction() {
    Inherit(this, Component);
    var _this = this;
    var _deviceControls, _mouseInput, _scrollInput;

    var _velocity = new Vector2();
    var _diffLast = new Vector2();

    var _focus = 0.75;
    var _focusHold = 0.75;

    var _center = new Vector2();

    var _objectives = [
        { //Snowman
            focus: 0.5954999999999983,
            rotation: { x: 0.026594568324555635, y: 2.127325774598736, z: 0}
        },
        { //Bike
            focus: 0.7954999999999964,
            rotation: { x: -0.01851442880946888, y: 0.21977332837368646, z: 0}
        },
        { //Sled
            focus: 0.2880000000000002,
            rotation: { x: -0.07916014185742591, y: 1.3528459228549172, z: 0}
        },
        { //Boat
            focus: 0.6855,
            rotation: { x: -0.05743249354560697, y: 3.7203322789233635, z: 0}
        },
        { //Flamingo
            focus: 0.5789999999999983,
            rotation: { x: -0.014524216083779046, y: 5.599523184113893, z: 0}
        },
    ];

    var _numHit = 0;

    //*** Constructor
    (function () {
        addHandlers();
        Render.start(loop);
    })();

    function loop() {
        if (_deviceControls) _deviceControls.update();

        //if (!_deviceControls) mouseFollow();
    }

    //*** Event handlers
    function addHandlers() {
        if (Device.mobile) _deviceControls = new THREE.DeviceOrientationControls(Camera.instance().camera);

        _mouseInput = _this.initClass(Interaction.Input, Stage);
        _mouseInput.onStart = onStart;
        _mouseInput.onUpdate = onUpdate;
        _mouseInput.onEnd = onEnd;

        //SCROLL
        _scrollInput = _this.initClass(Interaction.ScrollUtil);
        _scrollInput.onScroll = onScroll;

        //SPACE SHOOT
        __window.bind('keypress', down);

        //ACTIVATE SHOOTING
        _this.events.subscribe(CustomEvents.SHOW_GOALS, activateShoot);

        //RESET
        _this.events.subscribe(CustomEvents.REPLAY, reset);
    }

    function onStart(e) {
        _velocity.set(0, 0);
        _diffLast.set(0, 0);
        //console.log(e.y / Stage.height);

        _center.set(Stage.width * 0.5, Stage.height * 0.5);
        _center.sub(e);
        if (_center.length() < Stage.width * (Device.mobile ? 0.15 : 0.05)) shoot();

        if (e.x / Stage.width < 0.3) return _this.focusLock = false;
        if (e.x / Stage.width > 0.7) return _this.focusLock = false;
        if (e.y / Stage.height < (Mobile.os == 'iOS' ? 0.7 : 0.85)) return _this.focusLock = false;

        _focus = (e.x - 0.3 * Stage.width) / (0.4 * Stage.width);
        _focus = Utils.clamp(_focus, 0, 1);
        _this.events.fire(CustomEvents.FOCUS, {focus: _focus});
        _focusHold = _focus;
        _this.focusLock = true;
    }

    function onUpdate(diff) {
        if (_this.focusLock) {
            _focus = _focusHold + diff.x / (0.4 * Stage.width);
            _focus = Utils.clamp(_focus, 0, 1);
            _this.events.fire(CustomEvents.FOCUS, {focus: _focus});
            return;
        }

        _this.events.fire(CustomEvents.TUTORIAL_DRAG);

        _velocity.copyFrom(diff);
        _velocity.sub(_diffLast);

        Camera.instance().updateVelocity(_velocity, true);

        _diffLast.copyFrom(diff);
    }

    function onEnd() {
        _velocity.set(0, 0);
        _diffLast.set(0, 0);

        Camera.instance().updateVelocity(_velocity, false);

        _this.focusLock = false;
    }

    function onScroll(delta) {
        if (_this.focusLock) return;
        _focus += delta * 0.0005;
        _focus = Utils.clamp(_focus, 0, 1);
        _this.events.fire(CustomEvents.FOCUS, {focus: _focus});
    }

    function shoot() {
        if (_this.finished) return;
        //console.log(
        //    'focus:', _focus + ',\n',
        //    'rotation: {',
        //    'x: ' + Camera.instance().camera.rotation.x + ',',
        //    'y: ' + Camera.instance().camera.rotation.y + ',',
        //    'z: ' + Camera.instance().camera.rotation.z + '}'
        //);


        Sound['shoot']._rate = Math.random() * 0.1 + 0.95;
        Sound['shoot'].play();

        if (!_this.canShoot) {

            // Fire even if not hit to trigger flash
            _this.events.fire(CustomEvents.SHOOT);
            return;
        }

        var hit = -1;

        _objectives.every(function(obj, i) {
            if (diffRotation(obj.rotation) > 0.1) return true;
            if (diffFocus(obj.focus) > 0.2) return true;
            hit = i;
        });

        if (hit > -1) {
            if (!_objectives[hit].hit) {
                _numHit ++;

                if (_numHit == _objectives.length) {
                    Sound['success_final'].volume(0.3);
                    Sound['success_final'].play();
                } else if (_numHit < 3) {
                    Sound['success_1'].volume(0.3);
                    Sound['success_1']._rate = Math.random() * 0.15 + 0.7 + _numHit * 0.1;
                    Sound['success_1'].play();
                } else {
                    Sound['success_2'].volume(0.3);
                    Sound['success_2']._rate = Math.random() * 0.15 + 0.7 + (_numHit - 2) * 0.1;
                    Sound['success_2'].play();
                }
            }
            _objectives[hit].hit = true;
        }

        if (_numHit == _objectives.length) {
            _this.finished = true;
            _this.events.fire(CustomEvents.FINISH);
        }

        _this.events.fire(CustomEvents.SHOOT, {index: hit + 1});
    }

    function diffRotation(rot) {
        var camRot = Camera.instance().camera.rotation;
        camRot.y += camRot.y > Math.PI * 2 ? -Math.PI * 2 :
            camRot.y < 0 ? Math.PI * 2 : 0;
        var maxDiff = Math.max(Math.abs(camRot.x - rot.x), Math.abs(camRot.y - rot.y));

        //maxDiff = Math.max(maxDiff, Math.abs(camRot.z - rot.z));

        return maxDiff;
    }

    function diffFocus(focus) {
        return Math.abs(_focus - focus);
    }

    function down(e) {
        if (e.keyCode == 32) shoot();
    }

    function activateShoot() {
        _this.delayedCall(function() {
            _this.canShoot = true;
        }, 2000)
    }

    function reset() {
        _this.delayedCall(function() {
            _numHit = 0;
            _this.finished = false;
            _objectives.forEach(function(obj) {
                obj.hit = false;
            });
        }, 1000);
    }

    //*** Public methods

}, 'singleton');

Class(function Camera() {
    Inherit(this, Component);
    var _this = this;
    var _rotation;

    var _velocity = new Vector2();
    var _targetVelocity = new Vector2();

    var _tiltLimit = {max: 0.8, min: -0.8};
    var _shift = new Vector2();
    var _shiftDiff = new Vector2();
    var _lastShift = new Vector2();

    var _shiftAmount = 0.001;

    var _bobAmount = 0.1;
    var _bobSpeed = 1;

    //*** Constructor
    (function () {
        initCamera();
        addHandlers();
        Mouse.capture();
        Render.start(loop);
    })();

    function initCamera() {
        _this.camera = new THREE.PerspectiveCamera(40, Stage.width / Stage.height, 1, 1000);
        _rotation = _this.camera.rotation;
        _rotation.order = 'YXZ';
    }

    function loop(t, dt) {
        _velocity.lerp(_targetVelocity, _this.dragging ? 0.7 : 0.1);
        _rotation.y += _velocity.x * 0.001;
        _rotation.x += _velocity.y * 0.001;

        if (_rotation.x > _tiltLimit.max) _rotation.x += (_tiltLimit.max - _rotation.x) * 0.2;
        if (_rotation.x < _tiltLimit.min) _rotation.x += (_tiltLimit.min - _rotation.x) * 0.2;

        // Reduce velocity for when touching but not draggin
        if (_this.dragging) _targetVelocity.multiply(0.5);

        if (Device.mobile) return;
        _shift.set(
            Utils.range(Mouse.x, 0, Stage.width, _shiftAmount, -_shiftAmount),
            Utils.range(Mouse.y, 0, Stage.height, _shiftAmount, -_shiftAmount)
        );

        // Mouse shift movement
        _shiftDiff.copyFrom(_shift);
        _shiftDiff.sub(_lastShift);
        _lastShift.lerp(_shift, 0.08);
        _rotation.y += _shiftDiff.x;
        _rotation.x += _shiftDiff.y;

        // Automatic slight movement
        _rotation.y += _bobAmount * 0.001 * Math.sin(dt * _bobSpeed * 0.001);
        _rotation.x += _bobAmount * 0.001 * Math.sin(dt * _bobSpeed * 0.001 * 0.7);
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.subscribe(HydraEvents.RESIZE, resize);
    }

    function resize() {
        _this.camera.aspect = Stage.width / Stage.height;
        _this.camera.updateProjectionMatrix();
    }

    //*** Public methods
    this.updateVelocity = function(velocity, dragging) {
        _this.dragging = dragging;
        _targetVelocity.copyFrom(velocity);
    };


}, 'singleton');

Class(function Container() {
    Inherit(this, Controller);
    var _this = this;
    var $container, _tutorial, _loader;

    (function () {
        initContainer();
        initScene();
        loadAssets();
        addHandlers();
    })();

    function initContainer() {
        $container = _this.container;
        $container.size('100%');
        Stage.add($container);
    }

    function initScene() {
        $container.add(Renderer.instance().container);
    }

    function loadAssets() {
        AssetUtil.exclude(['lib', 'shaders']);
        AssetUtil.exclude(Device.mobile ? ['desktop'] : ['mobile']);
        var paths = AssetUtil.loadAssets(['assets']);
        _loader = _this.initClass(AssetLoader, paths);
        _loader.events.add(HydraEvents.PROGRESS, progress);
        _loader.events.add(HydraEvents.COMPLETE, loaded);
    }

    function progress(e) {
        _this.events.fire(CustomEvents.LOAD_PROGRESS, {percent: e.percent});
    }

    function loaded() {
        _this.events.fire(CustomEvents.LIBS_LOADED);
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.subscribe(CustomEvents.LOADED, initViews);
    }

    function initViews() {
        _tutorial = _this.initClass(Tutorial);
        _tutorial.events.add(HydraEvents.COMPLETE, removeTutorial);

        _this.initClass(FinishView);
    }
    function removeTutorial() {
        _tutorial = _tutorial.destroy();
    }

    //*** Public methods

}, 'singleton');

Class(function Renderer() {
    Inherit(this, Controller);
    var _this = this;
    var $container;
    var _renderer, _nuke, _noiseBlur;

    //*** Constructor
    (function () {
        initContainer();
        initRenderer();
        initNuke();
        initPasses();
        addListeners();
        Render.start(loop);
    })();

    function initContainer() {
        $container = _this.container;
        $container.size('100%').mouseEnabled(false);
    }

    function initRenderer() {
        _renderer = new THREE.WebGLRenderer({antialias: false});
        _renderer.setPixelRatio(Math.min(2, Device.pixelRatio));
        _renderer.setSize(Stage.width, Stage.height);
        $container.add(_renderer.domElement);
    }

    function initNuke() {
        var params = {renderer: _renderer, camera: Camera.instance().camera, scene: Scene.instance().scene};
        _nuke = _this.initClass(Nuke, Stage, params);
    }

    function initPasses() {
        _noiseBlur = _this.initClass(UILayer, _nuke);
    }

    function loop() {
        _nuke.render();
        //_renderer.render(Scene.instance().scene, Camera.instance().camera);
    }

    //*** Event handlers
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        _renderer.setSize(Stage.width, Stage.height);
    }

    //*** Public methods

}, 'singleton');

Class(function Scene() {
    Inherit(this, Component);
    var _this = this;
    var _sphere;

    this.scene = new THREE.Scene();

    //*** Constructor
    (function () {
        initElements();
    })();

    function initElements() {
        _sphere = _this.initClass(SphereView);
        _this.scene.add(_sphere.object3D);
    }

    //*** Event handlers

    //*** Public methods

}, 'singleton');

Class(function FinishView() {
    Inherit(this, View);
    var _this = this;
    var $this, $credit, $congrats, $thanks, $replay;

    //*** Constructor
    (function () {
        initHTML();
        style();
        addHandlers();
        resize();
    })();

    function initHTML() {
        $this = _this.element;
        $credit = $this.create('Credit');
        $congrats = $this.create('Congratulations');
        $thanks = $this.create('Thanks');
        $replay = $this.create('Replay');
    }

    function style() {
        $this.hide();
        $this.css({position: 'static', color: '#fff', textAlign: 'center', lineHeight: 0});
        $credit.html('Made by @gordonnl');
        $thanks.html('Thanks for playing');
        $replay.html('Replay');

        $credit.css({top: '12.5%', left: 0, right: 0, lineHeight: '1em', fontSize: '0.8em', width: '50%', margin: 'auto', marginTop: '-0.5em'});
        $thanks.css({top: '50%', left: 0, right: 0, marginTop: '2em', fontSize: '0.8em'});
        $replay.css({bottom: '12.5%', left: 0, right: 0, lineHeight: '1em', width: '50%', margin: 'auto', marginTop: '-0.5em'});

        $congrats.bg('assets/images/congratulations.png');
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.subscribe(HydraEvents.RESIZE, resize);
        _this.events.subscribe(CustomEvents.FINISH, show);
        $credit.interact(hover, twitter);
        $replay.interact(hover, replay);
    }

    function resize() {
        $this.css({fontSize: Utils.range(Stage.width, 300, 1200, 20, 40)});

        var s = Utils.range(Stage.width, 300, 1200, 0.4, 1);
        $congrats.size(s * 633, s * 148).center();
    }

    function show() {
        $this.show().css({opacity: 0}).tween({opacity: 1}, 2000, 'easeInOutCubic');
    }

    function hide() {
        $this.tween({opacity: 0}, 500, 'easeOutCubic', function() {
            $this.hide();
        });
    }

    function hover(e) {

    }

    function replay() {
        hide();
        _this.events.fire(CustomEvents.REPLAY);
    }

    function twitter() {
        getURL('https://twitter.com/gordonnl', '_blank');
    }

    //*** Public methods

});

Class(function UILayer(_nuke) {
    Inherit(this, NukePass);
    var _this = this;

    var _focusTarget = 0.5;
    var _focus = 0.5;

    var _load = 0;
    var _loadTarget = 0;

    this.uniforms = {
        tObjective1: {type: 't', value: Utils3D.getTexture('assets/images/placeholder/placeholder.png', true)},
        tObjective2: {type: 't', value: Utils3D.getTexture('assets/images/placeholder/placeholder.png', true)},
        tObjective3: {type: 't', value: Utils3D.getTexture('assets/images/placeholder/placeholder.png', true)},
        tObjective4: {type: 't', value: Utils3D.getTexture('assets/images/placeholder/placeholder.png', true)},
        tObjective5: {type: 't', value: Utils3D.getTexture('assets/images/placeholder/placeholder.png', true)},
        fComplete1: {type: 'f', value: -1},
        fComplete2: {type: 'f', value: -1},
        fComplete3: {type: 'f', value: -1},
        fComplete4: {type: 'f', value: -1},
        fComplete5: {type: 'f', value: -1},
        fLoader1: {type: 'f', value: 0},
        fLoader2: {type: 'f', value: 0},
        fLoader3: {type: 'f', value: 0},
        fLoader4: {type: 'f', value: 0},
        fRetina: {type: 'f', value: Math.min(2, Device.pixelRatio)},
        fTransition: {type: 'f', value: 0.19},
        fColor: {type: 'f', value: 0},
        fFocus: {type: 'f', value: _focus},
        fFlash: {type: 'f', value: 0},
        fDarken: {type: 'f', value: 0},
        uResolution: {type: 'v2', value: new Vector2(_nuke.renderer.domElement.width, _nuke.renderer.domElement.height)},
    };

    //*** Constructor
    (function () {
        _this.init();
        _nuke.add(_this);
        addHandlers();
        Render.start(loop);
        Render.start(loadLoop);
    })();

    function loop() {
        _focus += (_focusTarget - _focus) * 0.2;
        _this.set('fFocus', _focus);

        if (Sound['focus'].volume) Sound['focus'].volume(Math.max(0, Sound['focus'].volume() - 0.05));
        if (Sound['focus']._rate) Sound['focus']._rate = Math.max(0.7, Sound['focus']._rate - 0.05);
    }

    function loadLoop() {
        if (_load == 1) defer(function() {
            loaded();
            Render.stop(loadLoop);
        });
        _load += (_loadTarget - _load) * 0.05;

        if (_load > 0.999) _load = 1;

        if (_load > 0.5 && !_this.uiVisible) {
            _this.uiVisible = true;
            _this.tween('fLoader3', 1, 2000, 'easeInOutCubic', 1000);
            WorldInteraction.instance();
        }

        _this.set('fLoader1', Utils.range(_load, 0, 0.5, 0, 1, true));
        _this.set('fLoader2', Utils.range(_load, 0.5, 1, 0, 1, true));
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.subscribe(HydraEvents.RESIZE, resize);
        _this.events.subscribe(CustomEvents.FOCUS, adjustFocus);
        _this.events.subscribe(CustomEvents.LOAD_PROGRESS, progress);
        _this.events.subscribe(CustomEvents.SHOOT, shoot);
        _this.events.subscribe(CustomEvents.FINISH, finish);
        _this.events.subscribe(CustomEvents.REPLAY, reset);
        _this.events.subscribe(CustomEvents.SHOW_GOALS, showObjectives);
    }

    function resize() {
        defer(function() {
            _this.uniforms.uResolution.value.set(_nuke.renderer.domElement.width, _nuke.renderer.domElement.height);
        });
    }

    function adjustFocus(e) {
        if (Sound['focus'].volume) Sound['focus'].volume(0.2);
        if (Sound['focus']._rate) Sound['focus']._rate = 2;
        _focusTarget = e.focus;
    }

    function progress(e) {
        _loadTarget = e.percent;
    }

    function loaded() {
        _this.events.fire(CustomEvents.LOADED);
        _this.tween('fTransition', 1, 4000, 'easeInOutCubic', 0);
        _this.tween('fColor', 1, 2000, 'easeInOutCubic', 3000);

        _this.set('tObjective1', Utils3D.getTexture('assets/images/objective-1.png', true));
        _this.set('tObjective2', Utils3D.getTexture('assets/images/objective-2.png', true));
        _this.set('tObjective3', Utils3D.getTexture('assets/images/objective-3.png', true));
        _this.set('tObjective4', Utils3D.getTexture('assets/images/objective-4.png', true));
        _this.set('tObjective5', Utils3D.getTexture('assets/images/objective-5.png', true));
    }

    function showObjectives() {
        _this.tween('fLoader4', 1, 1000, 'easeOutCubic');
        for (var i = 0; i < 5; i++) {
            _this.tween('fComplete' + (i + 1), 0, 500, 'easeOutCubic', 30 * i * i);
        }
    }

    function shoot(e) {
        _this.set('fFlash', 0.8);
        _this.tween('fFlash', 0, 2000, 'easeOutQuint', 10);

        if (e.index > 0) _this.tween('fComplete' + e.index, 1, 500, 'easeInOutBack');
    }

    function finish() {
        _this.tween('fDarken', 0.95, 1000, 'easeInOutCubic');
    }

    function reset() {
        _this.tween('fDarken', 0, 1000, 'easeInOutCubic');
        for (var i = 0; i < 5; i++) {
            _this.tween('fComplete' + (i + 1), 0, 500, 'easeOutCubic', 100 * i);
        }
    }

    //*** Public methods

});

Class(function SphereShader() {
    Inherit(this, Component);
    var _this = this;
    var _shader;

    var _focusTarget = 0.75;
    var _focus = 0.75;

    //*** Constructor
    (function () {
        initShader();
        Render.start(loop);
        addHandlers();
    })();

    function initShader() {
        _shader = new Shader('Sphere', 'NoiseBlur');
        _shader.uniforms = {
            map: {type: 't', value: null},
            depth: {type: 't', value: null},
            time: {type: 'f', value: 0},
            focus: {type: 'f', value: _focus},
            fStrength: {type: 'f', value: Device.mobile ? 2 : 1},
        };

        _shader.material.side = THREE.BackSide;

        _shader.set('map', Utils3D.getTexture('assets/images/placeholder/placeholder.png', true));
        _shader.set('depth', Utils3D.getTexture('assets/images/placeholder/placeholder.png', true));
    }

    function loop(t, dt) {
        _shader.set('time', dt * 0.001);

        _focus += (_focusTarget - _focus) * 0.2;
        _shader.set('focus', _focus);
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.subscribe(CustomEvents.FOCUS, adjustFocus);
        _this.events.subscribe(CustomEvents.LOADED, updateImages);
    }

    function adjustFocus(e) {
        _focusTarget = e.focus;
    }

    function updateImages() {
        _shader.set('map', Utils3D.getTexture('assets/images/' + (Device.mobile ? 'mobile/' : 'desktop/') + 'scene.jpg', true));
        _shader.set('depth', Utils3D.getTexture('assets/images/' + (Device.mobile ? 'mobile/' : 'desktop/') + 'depth.jpg', true));
    }

    //*** Public methods
    this.get('material', function() {
        return _shader.material;
    });

});

Class(function SphereView() {
    Inherit(this, Component);
    var _this = this;
    var _sphere, _shader;

    this.object3D = new THREE.Object3D();

    //*** Constructor
    (function () {
        initSphere();
        //Render.start(loop);
    })();

    function initSphere() {
        var geometry = new THREE.SphereBufferGeometry(10, 100, 100);
        var _shader = _this.initClass(SphereShader);
        _sphere = new THREE.Mesh(geometry, _shader.material);
        _this.object3D.add(_sphere);
    }

    function loop(t, dt) {
        _sphere.rotation.y += 0.005;
        _sphere.rotation.x = Math.sin(dt * 0.001) * 0.3;
    }

    //*** Event handlers

    //*** Public methods

});

Class(function TutorialFindView() {
    Inherit(this, View);
    var _this = this;
    var $this, $text, $first, $second, $arrow;

    //*** Constructor
    (function () {
        initHTML();
        style();
        addHandlers();
        resize();
    })();

    function initHTML() {
        $this = _this.element;
        $text = $this.create('Text');
        $first = $text.create('First');
        $second = $text.create('Second');
        $arrow = $this.create('Arrow');
    }

    function style() {
        $this.css({position: 'static', opacity: 0});
        $text.css({color: '#fff', lineHeight: 0, textAlign: 'center'});

        $first.html('Find all of these items');
        $second.html('Make sure they\'re in focus!');

        $first.css({whiteSpace: 'nowrap'});
        $second.css({whiteSpace: 'nowrap', top: '1em'});

        $arrow.size(50, 100).css({bottom: '50%', left: '11%'});
        $arrow.bg('assets/images/arrow.png');
        $arrow.transform({rotation: 10});
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.subscribe(HydraEvents.RESIZE, resize);
    }

    function resize() {
        $this.css({fontSize: Utils.range(Stage.width, 300, 1200, 20, 40)});
        $text.css({top: '12.5%', left: Stage.width / Stage.height > 1.5 ? '12%' : '5%'});
    }

    function hide() {
        $this.tween({opacity: 0}, 500, 'easeOutCubic', function() {
            _this.events.fire(HydraEvents.COMPLETE);
        });
    }

    //*** Public methods
    this.start = function() {
        _this.events.fire(CustomEvents.SHOW_GOALS);
        $this.tween({opacity: 1}, 1000, 'easeOutCubic', 500, function() {
            _this.delayedCall(hide, 4000);
        });
    };

});

Class(function TutorialFocusView() {
    Inherit(this, View);
    var _this = this;
    var $this;

    //*** Constructor
    (function () {
        initHTML();
        style();
        addHandlers();
        resize();
    })();

    function initHTML() {
        $this = _this.element;
    }

    function style() {
        $this.html(Device.mobile ? 'Drag here to adjust the focus' : 'Scroll to adjust the focus');
        $this.css({color: '#fff', lineHeight: 0, bottom: '16%', left: 0, right: 0, textAlign: 'center', opacity: 0});
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.subscribe(HydraEvents.RESIZE, resize);
    }

    function resize() {
        $this.css({fontSize: Utils.range(Stage.width, 300, 1200, 20, 40)});
    }

    function hide() {
        _this.events.unsubscribe(CustomEvents.FOCUS, hide);
        $this.tween({opacity: 0}, 500, 'easeOutCubic', function() {
            _this.events.fire(HydraEvents.COMPLETE);
        });
    }

    //*** Public methods
    this.start = function() {
        $this.tween({opacity: 1}, 1000, 'easeOutCubic');
        _this.events.subscribe(CustomEvents.FOCUS, hide);
    };

});

Class(function TutorialLookView() {
    Inherit(this, View);
    var _this = this;
    var $this;

    //*** Constructor
    (function () {
        initHTML();
        style();
        addHandlers();
        resize();
    })();

    function initHTML() {
        $this = _this.element;
    }

    function style() {
        $this.html('Click and drag to look around');
        $this.css({color: '#fff', lineHeight: 0, top: '12.5%', left: 0, right: 0, textAlign: 'center', opacity: 0});
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.subscribe(HydraEvents.RESIZE, resize);
    }

    function resize() {
        $this.css({fontSize: Utils.range(Stage.width, 300, 1200, 20, 40)});
    }

    function hide() {
        _this.events.unsubscribe(CustomEvents.TUTORIAL_DRAG, hide);
        $this.tween({opacity: 0}, 500, 'easeOutCubic', function() {
            _this.events.fire(HydraEvents.COMPLETE);
        });
    }

    //*** Public methods
    this.start = function() {
        $this.tween({opacity: 1}, 1000, 'easeOutCubic');
        _this.events.subscribe(CustomEvents.TUTORIAL_DRAG, hide);
    };

});

Class(function TutorialShootView() {
    Inherit(this, View);
    var _this = this;
    var $this, $text, $sub, $arrow;

    //*** Constructor
    (function () {
        initHTML();
        style();
        addHandlers();
        resize();
    })();

    function initHTML() {
        $this = _this.element;
        $text = $this.create('Text');
        $arrow = $this.create('Arrow');
    }

    function style() {
        $this.css({position: 'static', color: '#fff', lineHeight: 0, textAlign: 'center', opacity: 0});
        $text.html(Device.mobile ? 'Tap here to capture' : 'Click here to capture');
        $text.css({top: Device.mobile ? '37%' : '33%', left: 0, right: 0});

        $arrow.size(50, 100).css({left: '58%', top: '50%', marginTop: -79});
        $arrow.bg('assets/images/arrow.png');
        $arrow.transform({rotation: 40});

        if (Device.mobile) return;
        $sub = $text.create('Sub');
        $sub.html('(or press space)');
        $sub.css({top: '1em', fontSize: '0.8em', left: 0, right: 0});
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.subscribe(HydraEvents.RESIZE, resize);
    }

    function resize() {
        $this.css({fontSize: Utils.range(Stage.width, 300, 1200, 20, 40)});
    }

    function hide() {
        _this.events.unsubscribe(CustomEvents.SHOOT, hide);
        $this.tween({opacity: 0}, 500, 'easeOutCubic', function() {
            _this.events.fire(HydraEvents.COMPLETE);
        });
    }

    //*** Public methods
    this.start = function() {
        $this.tween({opacity: 1}, 1000, 'easeOutCubic');
        _this.events.subscribe(CustomEvents.SHOOT, hide);
    };

});

Class(function Main() {
    Inherit(this, Component);
    var _this = this;
    var _loader;

    //*** Constructor
    (function() {
        preload();
    })();

    function preload() {
        var paths = AssetUtil.loadAssets(['lib', 'shaders', 'placeholder']);
        _loader = _this.initClass(AssetLoader, paths);
        _loader.events.add(HydraEvents.COMPLETE, init);
    }

    function init() {
        Container.instance();

        if (Mobile.os == 'Android') Mobile.fullscreen();
    }

    // TODO
    /*
    * Redo focus sound func
    * hosting
    * ogg audio files
    * check on ios
    * check on non-retina
    *
    * */

    //*** Event Handlers

    //*** Public methods
});

window._MINIFIED_ = true;