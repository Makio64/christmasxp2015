self.addEventListener('message', receiveMessage);

_this = window = self;
self.THREAD = true;

var Global = {};

function receiveMessage(e) {
    if (e.data.code) {
        self.eval(e.data.code);
        return;
    }
    
    if (e.data.importScript) {
        importScripts(e.data.path);
        return;
    }

    if (e.data.fn) {
        self[e.data.fn](e.data, e.data.id);
        return;
    }
    
    if (e.data.message.fn) {
        self[e.data.message.fn](e.data.message, e.data.id);
        return;
    }
}

function post(data, id) {
    if (!(data && id)) {
        id = data;
        data = null;
    }

    var message = {post: true, id: id, message: data};
    self.postMessage(message);
}

function emit(evt, msg, buffer) {
    if (buffer) {
        self.postMessage(msg, buffer);
    } else {
        var data = {emit: true, evt: evt, msg: msg};
        self.postMessage(data);
    }
}

console = {
    log: function(message) {
        self.postMessage({console: true, message: message});
    }
}

Class = function(_class, _type) {
    var _this = this || self;
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
        if (_static) _static();
    } else {
        if (_type == 'static') {
            _this[_name] = new _class();
        }
    }
}

Inherit = function(child, parent, param) {
    if (typeof param === 'undefined') param = child;
    var p = new parent(param, true);

    var save = {};
    for (var method in p) {
        child[method] = p[method];
        save[method] = p[method];
    }

    if (child.__call) child.__call();

    for (method in p) {
        if ((child[method] && save[method]) && child[method] !== save[method]) {
            child['_'+method] = save[method];
        }
    }

    p = save = null;
    child = parent = param = null;
}

Namespace = function(name) {
    if (typeof name === 'string') this[name] = {Class: this.Class};
    else name.Class = this.Class;
}

Interface = function(display) {
    var name = display.toString().match(/function ([^\(]+)/)[1];
    Hydra.INTERFACES[name] = display;
}

defer = function(callback) {
    return setTimeout(callback, 1);
}