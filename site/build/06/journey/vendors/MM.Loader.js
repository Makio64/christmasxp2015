var MM = MM || {};

// browserify & webpack support

if ( typeof module === 'object' ) {

	module.exports = MM;

}

function getWorkerInstance(script) {
	var URL = window.URL || window.webkitURL;

	if (URL == undefined || window.Blob == undefined || window.Worker == undefined || script == undefined) {
		return null;
	}

	var blob = new Blob([script]);
	var oURL = URL.createObjectURL(blob);
	var worker = new Worker(oURL);
	URL.revokeObjectURL(oURL);
	return worker;
}

MM.Loader = (function() {

	function Loader() {
		this._maxConnections = 1;
		this._numItems = 0;
		this._numItemsLoaded = 0;
		this._paused = false;
		this._currentLoads = [];
		this._loadQueue = [];
		this._loadedItemsById = {};
		this._loadedItemsBySrc = {};
		this._loadStartWasDispatched = false;
		this.loaded = false;
		this.progress = 0;
		this.onProgress = null;
		this.onLoadStart = null;
		this.onFileLoad = null;
		this.onFileProgress = null;
		this.onComplete = null;
		this.onError = null;
		this.workerXHR = getWorkerInstance(document.getElementById("worker-xhr").textContent);
		self = this;
		this.workerXHR.onmessage = function(event) {
			data = event.data;
			switch (data.proxy) {
				case "onloadstart":
					break;
				case "onloadprogress":
					self._handleProgress(data.data);
					break;
				case "onfileprogress":
					break;
				case "oncomplete":
					self._handleFileComplete(data.data);
					break;
				case "onfilecomplete":
					break;
				case "onerror":
					self._handleFileError(data.data);
					break;
			}
		}
	}

	Loader.prototype._sendLoadStart = function() {
		if(this.onLoadStart) {
			this.onLoadStart({target: this});
		}
	};

	Loader.prototype._sendProgress = function(value) {
		var event;
		if (value instanceof Number) {
			this.progress = value;
			event = {loaded: this.progress, total: 1};
		} else {
			event = value;
			this.progress = value.loaded / value.total;
		}
		event.target = this;
		if (this.onProgress) {
			this.onProgress(event);
		}
	};

	Loader.prototype._sendFileProgress = function(event) {
		if(this.onFileProgress) {
			event.target = this;
			this.onFileProgress(event);
		}
	};

	Loader.prototype._sendComplete = function() {
		if(this.onComplete) {
			this.onComplete({target: this});
		}
	};

	Loader.prototype._sendFileComplete = function(event) {
		if(this.onFileLoad) {
			event.target = this;
			this.onFileLoad(event);
		}
	};

	Loader.prototype._sendError = function(event) {
		if(this.onError) {
			if (event === null) {
				event = {};
			}
			event.target = this;
			this.onError(event);
		}
	};

	Loader.prototype.setMaxConnections = function(value) {
		this._maxConnections = value;
		if (!this._paused) {
			this._loadNext();
		}
	};

	Loader.prototype.loadManifest = function(manifest) {
		var data;

		if (manifest instanceof Array) {
			if (manifest.length === 0) {
				this._sendError({text: "Manifest is empty."});
				return;
			}
			data = manifest;
		} else {
			if (manifest === null) {
				this._sendError({text: "Manifest is null."});
				return;
			}
			data = [manifest];
		}

		for (var i = 0; i < data.length; i++) {
			this._addItem(data[i]);
		}
		this._updateProgress();
		this._loadNext();
	};

	Loader.prototype.load = function() {
		this.setPaused(false);
	};

	Loader.prototype.getResult = function(value) {
		return this._loadedItemsById[value] || this._loadedItemsBySrc[value];
	};

	Loader.prototype.setPaused = function(value) {
		this._paused = value;
		if (!this._paused) {
			this._loadNext();
		}
	};

	Loader.prototype.close = function() {
		while (this._currentLoads.length) {
			this._currentLoads.pop().cancel();
		}
		this._currentLoads = [];
		this._scriptOrder = [];
		this._loadedScripts = [];
	};

	Loader.prototype._addItem = function(item) {
		var loadItem = this._createLoadItem(item);
		if (loadItem !== null) {
			this._loadQueue.push(loadItem);
			this._numItems++;
		}
	};

	Loader.prototype._loadNext = function() {
		var loadItem;
		if (this._paused) {
			return;
		}

		if (!this._loadStartWasDispatched) {
			this._sendLoadStart();
			this._loadStartWasDispatched = true;
		}

		if (this._numItems === this._numItemsLoaded) {
			this.loaded = true;
			this._sendComplete();
		}

		 while (this._loadQueue.length && this._currentLoads.length < this._maxConnections) {
			loadItem = this._loadQueue.shift();
			this._currentLoads.push(loadItem);
		}
	};

	Loader.prototype._handleFileError = function(event) {
		var loader = event.target;
		var resultData = this._createResultData(loader._item);
		this._numItemsLoaded++;
		this._updateProgress();
		this._sendError(resultData);
		this._removeLoadItem(loader);
		this._loadNext();
	};

	Loader.prototype._createResultData = function(item) {
		var resultData = {id: item.id, result: null, data: item.data, type: item.type, src: item.src};
		this._loadedItemsById[item.id] = resultData;
		this._loadedItemsBySrc[item.src] = resultData;
		return resultData;
	};

	Loader.prototype._handleFileComplete = function(event) {
		var loader = event.target;
		var item = loader._item;
		var resultData = this._createResultData(item);
		this._removeLoadItem(loader);

		resultData.result = this._createResult(item, loader._request.response );
		switch (item.type) {
			case "image":
				var _this = this;
				resultData.result.onload = function() {
					_this._handleFileTagComplete(item, resultData);
				};
				return;
				break;
			case "svg":
			case "sound":
				break;
			default:
				break;
		}

		this._handleFileTagComplete(item, resultData);
	};

	Loader.prototype._handleFileTagComplete = function(item, resultData) {
		this._numItemsLoaded++;
		if (item.completeHandler) {
			item.completeHandler(resultData);
		}
		this._updateProgress();
		this._sendFileComplete(resultData);
		this._loadNext();
	};

	Loader.prototype._removeLoadItem = function(loader) {
		var l = this._currentLoads.length;
		for (var i = 0; i < l; i++) {
			if (this._currentLoads[i] === loader) {
				this._currentLoads.splice(i, 1);
				return;
			}
		}
	};

	Loader.prototype._createResult = function(item, data) {
		var tag = null;
		var resultData;
		switch (item.type) {
			case "image":
				tag = this._createImage();
				break;
			case "sound":
				tag = item.tag || this._createAudio();
				break;
			case "css":
				tag = this._createLink();
				break;
			case "svg":
				tag = this._createSVG();
				 tag.appendChild(this._createXML(data, "image/svg+xml"));
				break;
			case "xml":
				resultData = this._createXML(data, "text/xml");
				break;
			case "json":
			case "text":
				resultData = data;
		}

		if (tag) {
			if (item.type === "css") {
				tag.href = item.src;
			} else if (item.type !== "svg") {
				tag.src = item.src;
			}
			return tag;
		} else {
			return resultData;
		}
	};

	Loader.prototype._createXML = function(data, type) {
		var resultData;
		var parser;

		if (window.DOMParser) {
			/*global DOMParser */
			parser = new DOMParser();
			resultData = parser.parseFromString(data, type);
		} else {
			 // Internet Explorer
			 parser = new ActiveXObject("Microsoft.XMLDOM");
			parser.async = false;
			parser.loadXML(data);
			resultData = parser;
		}

		return resultData;
	};

	Loader.prototype._handleProgress = function(event) {
		var loader = event.target;
		var resultData = this._createResultData(loader._item);
		resultData.progress = loader.progress;
		this._sendFileProgress(resultData);
		this._updateProgress();
	};

	Loader.prototype._updateProgress = function() {
		var loaded = this._numItemsLoaded / this._numItems;
		var remaining = this._numItems - this._numItemsLoaded;
		if (remaining > 0) {
			var chunk = 0;
			for (var i = 0, l = this._currentLoads.length; i < l; i++) {
				if(this._currentLoads[i].progress == undefined) {
					this._currentLoads[i].progress = 0;
				}
				chunk += this._currentLoads[i].progress;
			}

			loaded += (chunk / remaining) * (remaining / this._numItems);
		}
		this._sendProgress({loaded: loaded, total: 1});
	};

	Loader.prototype._createLoadItem = function(loadItem) {
		var item = {};

		switch (typeof(loadItem)) {
			case "string":
				item.src = loadItem;
				break;
			case "object":
				if (loadItem instanceof HTMLAudioElement) {
					item.tag = loadItem;
					item.src = item.tag.src;
					item.type = "sound";
				} else {
					item = loadItem;
				}
				break;
			default:
				break;
		}

		item.extension = this._getNameAfter(item.src, ".");
		if (!item.type) {
			item.type = this.getType(item.extension);
		}
		if (item.id === null || item.id === "") {
			item.id = item.src;
		}

		this.workerXHR.postMessage(item);
		return item;
	};

	Loader.prototype.getType = function(ext) {
		switch (ext) {
			case "jpeg":
			case "jpg":
			case "gif":
			case "png":
			case "webp":
			case "bmp":
				return "image";
			case "ogg":
			case "mp3":
			case "webm":
				return "sound";
			case "json":
				return "json";
			case "xml":
				return "xml";
			case "css":
				return "css";
			case 'svg':
				return "svg";
			default:
				return "text";
		}
	};

	Loader.prototype._getNameAfter = function(path, token) {
		var dotIndex = path.lastIndexOf(token);
		var lastPiece = path.substr(dotIndex + 1);
		var endIndex = lastPiece.lastIndexOf(/[\b|\?|#|\s]/);
		return (endIndex === -1) ? lastPiece : lastPiece.substr(0, endIndex);
	};

	Loader.prototype._createImage = function() {
		return document.createElement("img");
	};

	Loader.prototype._createSVG = function() {
		var tag = document.createElement("object");
		tag.type = "image/svg+xml";
		return tag;
	};

	Loader.prototype._createAudio = function() {
		var tag = document.createElement("audio");
		tag.autoplay = false;
		tag.type = "audio/ogg";
		return tag;
	};

	Loader.prototype._createScript = function() {
		var tag = document.createElement("script");
		tag.type = "text/javascript";
		return tag;
	};

	Loader.prototype._createLink = function() {
		var tag = document.createElement("link");
		tag.type = "text/css";
		tag.rel = "stylesheet";
		return tag;
	};

	return Loader;

})();
