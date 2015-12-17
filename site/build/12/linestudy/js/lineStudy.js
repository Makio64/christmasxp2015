/**
 * KEEF Global Abatement
 */
var KEEF = KEEF || {};

KEEF.namespace = function(aNamespace) {
	var parts = aNamespace.split('.'),
		parent = KEEF,
		i;
	if (parts[0] === "KEEF") {
		parts = parts.slice(1);
	}

	for (i = 0; i < parts.length; i += 1) {
		if (typeof parent[parts[i]] === "undefined") {
			parent[parts[i]] = {};
		}
		parent = parent[parts[i]];
	}

	return parent;
};


KEEF.names = new Array();

KEEF.createID = function(name) {
	KEEF.names.push(name + '_' + KEEF.names.length);
	return KEEF.names.length - 1;
}


KEEF.DEBUG = false;
KEEF.winWidth, KEEF.winHeight;

var canvasContainer, canvasDiv, canvas, context;

KEEF.width = window.innerWidth;
KEEF.height = window.innerHeight;
KEEF.center = {
	x: KEEF.width / 2,
	y: KEEF.height / 2
};

KEEF.color = {
	white: '#e5dbdb',
	red: 'red',
	red1: '#ae5c4e',
	red2: '#FF3333',
	red3: '#9933FF',
	red4: '#FF6666',
	red5: '#FFCCCC',
	blue: '#9ccccc',
	black: '#000000',
	black1: '#282828',
	black2: '#3A3A3A',
	black3: '#565656',
	black4: '#727272',
	black5: '#999999'

}

KEEF.frameNum = 0;
KEEF.totalFrames = 0;
KEEF.totalLoaded = 0;
KEEF.loaded = false;
KEEF.totalCached = 0;
KEEF.totalToCache = 0;
KEEF.tings = new Array();
KEEF.lines = new Array();
KEEF.shadows = new Array();
KEEF._i = 0;

//visible canvas
canvasDiv = document.getElementById('container');
canvas = document.createElement('canvas');
canvas.width = KEEF.width;
canvas.height = KEEF.height;

canvasDiv.appendChild(canvas);

KEEF.borderCircle;
KEEF.border, KEEF.mask;

paper.install(window);
paper.setup(canvas);


if (KEEF.DEBUG) {

	//----------------------------------------------------------------------------------------------------------------
	//stats
	KEEF.stats = new Stats();
	KEEF.stats.setMode(0); // 0: fps, 1: ms

	KEEF.stats.domElement.style.position = 'absolute';
	KEEF.stats.domElement.style.left = '0px';
	KEEF.stats.domElement.style.top = '0px';

	document.body.appendChild(KEEF.stats.domElement);

	//----------------------------------------------------------------------------------------------------------------
	//GUI
	KEEF.gui = new dat.GUI();
	KEEF.guiFolder = KEEF.gui.addFolder("Main");
}

KEEF.load = function() {	

	//name, path, aniLength	
	KEEF.tings.push(new KEEF.Ting('bound', null, 1));

	KEEF.tings.push(new KEEF.Ting('rightLeaf', 'img/rightLeaf/', 24));
	KEEF.tings.push(new KEEF.Ting('leftLeaves', 'img/leftLeaves/', 12));
	KEEF.tings.push(new KEEF.Ting('candle', 'img/candle/', 5));
	KEEF.tings.push(new KEEF.Ting('lightA', 'img/candle/', 12));
	KEEF.tings.push(new KEEF.Ting('lightB', 'img/candle/', 12));

	KEEF.tings.push(new KEEF.Ting('window', 'img/', 1));

	KEEF.tings.push(new KEEF.Ting('gingerman', 'img/', 1));
	KEEF.tings.push(new KEEF.Ting('glassA', 'img/', 1));
	KEEF.tings.push(new KEEF.Ting('jugA', 'img/', 1));
	KEEF.tings.push(new KEEF.Ting('jugB', 'img/', 1));
	KEEF.tings.push(new KEEF.Ting('mugA', 'img/', 1));
	KEEF.tings.push(new KEEF.Ting('mugB', 'img/', 1));
	KEEF.tings.push(new KEEF.Ting('bottlesA', 'img/', 1));

	KEEF.tings.push(new KEEF.Ting('roof', 'img/', 1));
	KEEF.tings.push(new KEEF.Ting('table', 'img/', 1));
	KEEF.tings.push(new KEEF.Ting('fernA', 'img/', 1));

	KEEF.tings.push(new KEEF.Ting('starA', 'img/', 1));
	KEEF.tings.push(new KEEF.Ting('starB', 'img/', 1));

	//KEEF.tings.push(new KEEF.Ting('leftHand', 'img/hand/', 42));

	for (var i = 0; i < KEEF.tings.length; i++) {
		KEEF.tings[i].load();
	};



	//mouse controls
	KEEF.paperTool = new paper.Tool();
	KEEF.mouseDown = new paper.Point(0, 0);
	KEEF.mouse = new paper.Point(0, 0);

	KEEF.paperTool.onMouseMove = function(event) {
		KEEF.mouse = event.point;
	};

	KEEF.loadLoop();
}


//checks if everything is loaded
KEEF.allLoaded = function() {

	KEEF.loaded = true;

	for (var i = 0; i < KEEF.tings.length; i++) {
		if (!KEEF.tings[i].isLoaded()) {
			KEEF.loaded = false;
			//console.log(KEEF.tings[i].name, 'not loaded');
		}
	};

	return KEEF.loaded;
}

//recursive loop. breaks once allLoaded() == true
KEEF.loadLoop = function() {

	setTimeout(function() {

		if (KEEF.allLoaded()) {

			//gets rid of the pre-unified rectangles
			for (var i = 0; i < paper.project.layers[0].children.length; i++) {

				//console.log('this', paper.project.layers[0].children[i].data.name);

				if (paper.project.layers[0].children[i].data.name == 'bin') {
					//console.log('removed', paper.project.layers[0].children[i].data.name);
					paper.project.layers[0].children[i].remove();
					i = 0;
				}
			};

			//console.log(paper.project.layers[0].children.length, 'paths loaded of', KEEF.totalFrames);

			// //
			KEEF.lines.push({
				name: 'level4',
				lines: new KEEF.LineTexture()
			});

			KEEF.getLinesByName('level4').lines.init(new paper.Point(0, 0), {
				color: KEEF.color.black4,
				angle: KEEF.degree2radian(0),
				numLines: Math.floor(screen.height / 12),
				increment: 12,
				lineLength: KEEF.width,
				depth: 0.02
			});

			// //
			KEEF.lines.push({
				name: 'level3',
				lines: new KEEF.LineTexture()
			});

			KEEF.getLinesByName('level3').lines.init(new paper.Point(0, 0), {
				color: KEEF.color.black3,
				angle: KEEF.degree2radian(0),
				numLines: Math.floor(screen.height / 11),
				increment: 11,
				lineLength: KEEF.width,
				depth: 0.04
			});

			KEEF.shadows.push({
				name: 'bottleShadow',
				shadow: new KEEF.WhiteTexture()
			});

			KEEF.getShadowsByName('bottleShadow').shadow.init(new paper.Point(0, 0), {
				depth: 0.04
			});

			//bottles
			KEEF.lines.push({
				name: 'level2',
				lines: new KEEF.LineTexture()
			});

			KEEF.getLinesByName('level2').lines.init(new paper.Point(0, 0), {
				color: KEEF.color.black2,
				angle: KEEF.degree2radian(0),
				numLines: Math.floor(screen.height / 6),
				increment: 6,
				lineLength: KEEF.width,
				depth: 0.06
			});

			// //
			KEEF.shadows.push({
				name: 'windowShadow',
				shadow: new KEEF.WhiteTexture()
			});

			KEEF.getShadowsByName('windowShadow').shadow.init(new paper.Point(0, 0), {
				depth: 0.07
			});

			// //
			KEEF.shadows.push({
				name: 'leafShadows',
				shadow: new KEEF.WhiteTexture()
			});

			KEEF.getShadowsByName('leafShadows').shadow.init(new paper.Point(0, 0), {
				depth: 0.1
			});

			//lightB
			KEEF.lines.push({
				name: 'level1.7',
				lines: new KEEF.LineTexture()
			});

			KEEF.getLinesByName('level1.7').lines.init(new paper.Point(200, -300), {
				color: KEEF.color.black5,
				angle: KEEF.degree2radian(45),
				numLines: Math.floor(screen.height / 20) * 1.5,
				increment: 40,
				lineLength: KEEF.width,
				depth: 0.15
			});

			//lightA
			KEEF.lines.push({
				name: 'level1.5',
				lines: new KEEF.LineTexture()
			});

			KEEF.getLinesByName('level1.5').lines.init(new paper.Point(200, 300), {
				color: KEEF.color.black5,
				angle: KEEF.degree2radian(-45),
				numLines: Math.floor(screen.height / 20) * 1.5,
				increment: 20,
				lineLength: KEEF.width,
				depth: 0.15
			});

			//candle
			KEEF.lines.push({
				name: 'level1.2',
				lines: new KEEF.LineTexture()
			});

			KEEF.getLinesByName('level1.2').lines.init(new paper.Point(200, 300), {
				color: KEEF.color.black,
				angle: KEEF.degree2radian(0),
				numLines: Math.floor(screen.height / 9),
				increment: 9,
				lineLength: KEEF.width,
				depth: 0.15
			});

			// //
			KEEF.shadows.push({
				name: 'candleShadows',
				shadow: new KEEF.WhiteTexture()
			});

			KEEF.getShadowsByName('candleShadows').shadow.init(new paper.Point(0, 0), {
				depth: 0.15
			});


			//window
			KEEF.lines.push({
				name: 'level1',
				lines: new KEEF.LineTexture()
			});

			KEEF.getLinesByName('level1').lines.init(new paper.Point(0, 0), {
				color: KEEF.color.black1,
				angle: KEEF.degree2radian(0),
				numLines: Math.floor(screen.height / 8),
				increment: 8,
				lineLength: KEEF.width,
				depth: 0.15
			});

			//leaves
			KEEF.lines.push({
				name: 'level0',
				lines: new KEEF.LineTexture()
			});

			KEEF.getLinesByName('level0').lines.init(new paper.Point(0, 0), {
				color: KEEF.color.black,
				angle: KEEF.degree2radian(0),
				numLines: Math.floor(screen.height / 6),
				increment: 6,
				lineLength: KEEF.width,
				depth: 0.2
			});

			KEEF.totalToCache = KEEF.lines.length + KEEF.shadows.length;

			KEEF.cacheLoop();
		} else {
			KEEF.loadLoop();
		}

	}, 100);
}

KEEF.cacheThis = 0;


//yes there is a better way to do this but I need to update the user when sthe cahce is updated
KEEF.cacheLoop = function() {

	switch (KEEF.cacheThis) {
		case 0:

			KEEF.getLinesByName('level4').lines.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('starA'), KEEF.getTingByName('starB')
			]);

			KEEF.cacheThis++;
			setTimeout(function() {
				KEEF.cacheLoop();
			}, 100);
			break;
		case 1:

			KEEF.getLinesByName('level3').lines.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('table'), KEEF.getTingByName('fernA')
			]);

			KEEF.cacheThis++;
			setTimeout(function() {
				KEEF.cacheLoop();
			}, 100);
			break;
		case 2:

			KEEF.getShadowsByName('bottleShadow').shadow.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('gingerman'), KEEF.getTingByName('jugA'), KEEF.getTingByName('jugB'),
				KEEF.getTingByName('bottlesA'), KEEF.getTingByName('mugA'), KEEF.getTingByName('mugB'),
				KEEF.getTingByName('glassA')
			]);


			KEEF.getLinesByName('level2').lines.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('gingerman'), KEEF.getTingByName('jugA'), KEEF.getTingByName('jugB'),
				KEEF.getTingByName('bottlesA'), KEEF.getTingByName('mugA'), KEEF.getTingByName('mugB'),
				KEEF.getTingByName('glassA'),
			]);

			KEEF.cacheThis++;
			setTimeout(function() {
				KEEF.cacheLoop();
			}, 100);
			break;
		case 3:
			KEEF.getShadowsByName('windowShadow').shadow.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('window')
			]);

			KEEF.cacheThis++;
			setTimeout(function() {
				KEEF.cacheLoop();
			}, 100);
			break;
		case 4:
			KEEF.getShadowsByName('leafShadows').shadow.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('rightLeaf'), KEEF.getTingByName('leftLeaves')
			]);

			KEEF.getLinesByName('level1.7').lines.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('lightB')
			]);

			KEEF.cacheThis++;
			setTimeout(function() {
				KEEF.cacheLoop();
			}, 100);
			break;
		case 5:



			KEEF.getLinesByName('level1.5').lines.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('lightA')
			]);

			KEEF.getShadowsByName('candleShadows').shadow.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('candle')
			]);

			KEEF.getLinesByName('level1.2').lines.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('candle')
			]);



			KEEF.getLinesByName('level1').lines.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('window')
			]);

			KEEF.cacheThis++;
			setTimeout(function() {
				KEEF.cacheLoop();
			}, 100);
			break;
		case 6:
			KEEF.getLinesByName('level0').lines.addClipTings([KEEF.getTingByName('bound'),
				KEEF.getTingByName('rightLeaf'), KEEF.getTingByName('leftLeaves'), KEEF.getTingByName('roof')
			]);

			//gets rid of the original svgs as they have been combined into new objects
			for (var i = 0; i < paper.project.layers[0].children.length; i++) {

				var limit = 10;
				var obj = paper.project.layers[0].children[i];

				while (limit > 0 && obj.className != 'Path') {
					obj = obj.children[0];
				}

				if (obj.data.name == 'original svgs') {
					paper.project.layers[0].children[i].remove();
					i = 0;
				}
			};

			KEEF.start();
			break;
	}
}


KEEF.start = function() {
	console.log('start');



	document.getElementById('backgroundNoise').play();

	KEEF.snow = new KEEF.SnowTexture();
	KEEF.snow.init();

	KEEF.paperTool.onMouseMove = function(event) {
		KEEF.mouse = event.point;
	};

	//KEEF.count is a hacky way of mainting framerate
	KEEF.count = 0;

	//positions the svgs correctly
	for (var i = 0; i < KEEF.lines.length; i++) {
		KEEF.lines[i].lines.setClipPosition(new paper.Point(KEEF.width / 2, KEEF.height / 2));
	};


	var elem = document.getElementById("loadingText");
	elem.parentNode.removeChild(elem);

	paper.view.onFrame = function(event) {

		if (KEEF.DEBUG) KEEF.stats.begin();

		KEEF.winWidth = window.innerWidth;

		KEEF.count++;
		if (KEEF.count % 4 == 0) { //limits it to 15fps

			KEEF.width = window.innerWidth;
			KEEF.height = window.innerHeight;
			KEEF.center = {
				x: KEEF.width / 2,
				y: KEEF.height / 2
			};

			canvas.width = KEEF.width;
			canvas.height = KEEF.height;

			KEEF.update();
		}

		if (KEEF.DEBUG) KEEF.stats.end();

	}
}

KEEF.update = function() {

	for (KEEF._i = 0; KEEF._i < KEEF.lines.length; KEEF._i++) {
		KEEF.lines[KEEF._i].lines.update();
	}

	for (KEEF._i = 0; KEEF._i < KEEF.shadows.length; KEEF._i++) {
		KEEF.shadows[KEEF._i].shadow.update();
	}

	KEEF.snow.update();

}

KEEF.getTing = function(id) {
	for (KEEF._i = 0; KEEF._i < KEEF.tings.length; KEEF._i++) {
		if (KEEF.tings[KEEF._i].id == id) {
			return KEEF.tings[KEEF._i];
		}
	};
}

KEEF.getTingByName = function(name) {
	for (KEEF._i = 0; KEEF._i < KEEF.tings.length; KEEF._i++) {
		if (KEEF.tings[KEEF._i].name == name) {
			return KEEF.tings[KEEF._i];
		}
	};
}

KEEF.getLinesByName = function(name) {
	for (KEEF._i = 0; KEEF._i < KEEF.lines.length; KEEF._i++) {
		if (KEEF.lines[KEEF._i].name == name) {
			return KEEF.lines[KEEF._i];
		}
	};
}

KEEF.getShadowsByName = function(name) {
	for (KEEF._i = 0; KEEF._i < KEEF.shadows.length; KEEF._i++) {
		if (KEEF.shadows[KEEF._i].name == name) {
			return KEEF.shadows[KEEF._i];
		}
	};
}

KEEF.distance = function(a, b) {
	var dx = a.x - b.x,
		dy = a.y - b.y;

	return Math.sqrt(dx * dx + dy * dy);
}

KEEF.degree2radian = function(d) {

	return d * (Math.PI / 180);
}

KEEF.radian2degree = function(r) {

	return r * (180 / Math.PI);
}

//----------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------
(function() {

	if (KEEF.Ting === undefined) {

		KEEF.Ting = function(name, path, aniLength) {


			this.id = KEEF.createID("ting");
			this.name = name;
			this.filePath = path;

			this.frameNum = 0;
			this.numFrames = aniLength;
			this.frames = new Array();
			this.group;
			this.lines;

			this.loaded = false;
			this.numLoaded = 0;

			KEEF.totalFrames = KEEF.totalFrames + aniLength;

		};

		var p = KEEF.Ting.prototype;

		//call only after loaded

		p.init = function() {


		}

		p.update = function(time) {
			if (this.name !== 'bound') {
				this.frameNum++;

				if (this.frameNum >= this.numFrames) {

					this.frameNum = 0;
				}
			}
		}

		p.reset = function() {
			this.frameNum = 0;
		}

		p.getCurFrame = function() {
			//console.log(this.name, this.id, this.frameNum, this.frames.length, this.frames[this.frameNum]);
			return this.frames[this.frameNum];
		}

		//this starts the loading loop
		p.load = function() {
			if (this.name !== 'bound') {
				this.loadingLoop(this.filePath + this.name, 0, this.id);
			} else {
				var myTing = KEEF.getTing(this.id);
				var tl = new paper.Path.Rectangle(new paper.Point(0, 0), new paper.Point(10, 10));
				var br = new paper.Path.Rectangle(new paper.Point(KEEF.width - 10, KEEF.height - 10), new paper.Point(KEEF.width, KEEF.height));


				var path = tl.unite(br);
				myTing.frames.push(path);

				myTing.numLoaded++;

				tl.data.name = 'bin';
				br.data.name = 'bin';
				path.data.name = 'bin';

				tl.data.name2 = 'tl';
				br.data.name2 = 'br';
				path.data.name2 = 'bound';
			}
		}

		p.loadingLoop = function(fileName, index, id) {
			//console.log("loadingLoop");
			paper.project.importSVG(fileName + '_' + index + '.svg', {
				expandShapes: true,
				onLoad: function(e) {

					var myTing = KEEF.getTing(id);
					myTing.numLoaded++;
					KEEF.totalLoaded++;

					var limit = 10;
					var obj = e;

					while (limit > 0 && obj.className != 'Path') {
						//console.log('diggin', obj.className);
						obj = obj.children[0];
					}

					if (limit <= 1) {
						throw (this.id, this.name, index, id, 'too many groups/compund paths in svg');
					}

					obj.data.name = 'bin';
					myTing.frames.push(obj);

					//myTing.frames[myTing.frames.length - 1].setPosition(new paper.Point(120, 120));

					var elem = document.getElementById('loadingText');
					elem.innerHTML = 'loaded ' + KEEF.totalLoaded + ' of ' + Math.round(KEEF.totalFrames - 1);

					if (index < myTing.numFrames - 1) {
						myTing.loadingLoop(fileName, index + 1, id);
					}


				}
			});
		}

		p.isLoaded = function() {
			if (this.numLoaded < this.numFrames) {
				this.loaded = false;
			} else {
				this.loaded = true;
			}
			return this.loaded;
		}

		p.setToBin = function() {
			for (var i = 0; i < this.frames.length; i++) {
				this.frames[i].data.name = "original svgs";
				//console.log(this.frames[i]);
			};
		}
	}

}());

//----------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------
(function() {

	if (KEEF.LineTexture === undefined) {

		KEEF.LineTexture = function(name, path, aniLength) {

			this.id = KEEF.createID("lineTexture");
			this.name = name;

			this.still = false;

			if (aniLength == 1) {
				this.still = true;
			}

			this.clip = true;
			this.depth = 0;

			this.myLines = [];
			this.numLines = 40;
			this.lineAngle = 0;
			this.lineColor = 'blue';
			this.increment = 10;
			this.lineLength = 250;

			this.tings;

			this.clipPathesCache = new Array();
			this.clippingPath;
			this.clipPosition = new paper.Point(0, 0);
			this.cacheFrameNum = 0;
			this.cached = false;

			this.group;
			this.groupChildren = new Array();

			this._i;
		};

		var p = KEEF.LineTexture.prototype;

		p.init = function(p1, options) {


			var p2 = new paper.Point(p1.x + this.lineLength, p1.y);

			if (options !== undefined) {
				if (options.numLines !== undefined) {
					this.numLines = options.numLines;
				}
				if (options.lineLength !== undefined) {
					this.lineLength = options.lineLength;
				}
				if (options.increment !== undefined) {
					this.increment = options.increment;
				}
				if (options.angle !== undefined) {
					this.lineAngle = options.angle;

					p2.x = p1.x + this.lineLength;
					p2.y = p1.y + Math.tan(this.lineAngle) * this.lineLength;

				}
				if (options.color !== undefined) {
					this.lineColor = options.color;
				}
				if (options.shift) {
					p1.y = p1.y - Math.tan(this.lineAngle) * this.lineLength;
					p2.y = p2.y - Math.tan(this.lineAngle) * this.lineLength;
				}
				if (options.depth) {
					this.depth = options.depth;
				}
			}

			for (this._i = 0; this._i < this.numLines; this._i++) {
				this.myLines.push(new paper.Path.Line(new paper.Point(p1.x, p1.y + this.increment * this._i), new paper.Point(p2.x, p2.y + this.increment * this._i)));
				this.myLines[this.myLines.length - 1].strokeColor = this.lineColor;
				this.myLines[this.myLines.length - 1].data.name = 'line';
			};
		}

		//!! make sure we don't update the same ting across multipel textures
		p.update = function(time) {

			if (!this.still) {
				//will throw an error if you don't add tings to this before
				this.clipPathesCache[this.cacheFrameNum].position = this.clipPosition;

				this.groupChildren[0] = this.clipPathesCache[this.cacheFrameNum];
				this.group.children = this.groupChildren;

				this.group.clipped = this.clip;

				this.cacheFrameNum++;
				if (this.cacheFrameNum > this.clipPathesCache.length - 1) {
					this.cacheFrameNum = 0;
				}
			}

			//mouse the scene with the mouse
			this.clipPosition.x = KEEF.width / 2 + this.depth * (KEEF.width / 2 - KEEF.mouse.x) + 960 / 3;
			this.clipPosition.y = KEEF.height / 2 + (this.depth * .7) * (KEEF.height / 2 - KEEF.mouse.y);
		}

		p.addClipTings = function(tings) {
			this.tings = tings;

			this.cache();

			this.groupChildren.push(this.clipPathesCache[0]);

			for (this._i = 0; this._i < this.myLines.length; this._i++) {
				this.groupChildren.push(this.myLines[this._i]);
			};

			this.group = new paper.Group({
				children: this.groupChildren
			});

			this.group.clipped = this.clip;
		}

		p.setClipPosition = function(p) {
			this.clipPosition.set(p.x, p.y);
		}

		//caches all the paths by making a series of compund paths equal to the longest frame range		
		p.cache = function() {
			for (var i = 1; i < this.tings.length; i++) {
				this.tings[i].reset();
			};

			var limit = 100;
			var allZero = false;
			while (limit > 0 && allZero == false) {
				allZero = true;
				this.clippingPath = this.tings[0].getCurFrame();

				for (this._i = 1; this._i < this.tings.length; this._i++) {
					this.clippingPath = this.clippingPath.unite(this.tings[this._i].getCurFrame());
					this.tings[this._i].update();
				};

				this.clipPathesCache.push(this.clippingPath);

				for (this._i = 0; this._i < this.tings.length; this._i++) {
					if (this.tings.frameNum != 0) {
						allZero = false;
					};
				};

				limit--;
			}

			for (this._i = 1; this._i < this.tings.length; this._i++) {
				this.clippingPath = this.clippingPath.unite(this.tings[this._i].getCurFrame());
			};

			for (this._i = 1; this._i < this.tings.length; this._i++) {
				this.tings[this._i].setToBin();
			};

			this.cached = true;
			KEEF.totalCached++;
			console.log('cached');
			var elem = document.getElementById('loadingText');
			elem.innerHTML = 'processed ' + KEEF.totalCached + ' of ' + KEEF.totalToCache;
		}
	}

}());

//----------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------
(function() {

	if (KEEF.WhiteTexture === undefined) {

		KEEF.WhiteTexture = function(name, path, aniLength) {

			this.id = KEEF.createID("whiteTexture");
			this.name = name;

			this.still = true;
			this.clip = true;
			this.depth = 0;

			this.tings;

			this.clipPathesCache = new Array();;
			this.clippingPath;
			this.clipPosition = new paper.Point(0, 0);
			this.cacheFrameNum = 0;

			this.groupChildren, this.group;
		};

		var p = KEEF.WhiteTexture.prototype;

		p.init = function(p1, options) {

			if (options !== undefined) {

				if (options.depth) {
					this.depth = options.depth;
				}
			}
		}

		//!! make sure we don't update the same ting across multipel textures
		p.update = function(time) {

			this.clipPathesCache[this.cacheFrameNum].position = this.clipPosition;

			if (!this.still) {
				//will throw an error if you don't add tings to this


				//this.clipPathesCache[this.cacheFrameNum].strokeColor = 'black'
				this.groupChildren[0] = this.clipPathesCache[this.cacheFrameNum];
				this.group.children = this.groupChildren;

				this.group.clipped = this.clip;

				this.cacheFrameNum++;
				if (this.cacheFrameNum > this.clipPathesCache.length - 1) {
					this.cacheFrameNum = 0;
				}
			}

			//mouse the scene with the mouse
			this.clipPosition.x = KEEF.width / 2 + this.depth * (KEEF.width / 2 - KEEF.mouse.x) + 960 / 3;
			this.clipPosition.y = KEEF.height / 2 + (this.depth * .7) * (KEEF.height / 2 - KEEF.mouse.y);
		}

		p.addClipTings = function(tings) {
			this.tings = tings;

			this.cache();

			this.groupChildren = new Array();

			this.groupChildren.push(this.clipPathesCache[0]);
			this.groupChildren.push(new paper.Path.Rectangle(new paper.Point(0, 0), new paper.Point(KEEF.width, KEEF.height)));


			this.group = new paper.Group({
				children: this.groupChildren
			});

			this.group.clipped = this.clip;

			this.group.fillColor = KEEF.color.white;
		}

		p.setClipPosition = function(p) {
			this.clipPosition.set(p.x, p.y);
		}

		//caches all the paths by making a series of compund paths equal to the longest frame range
		//could cut down on this by dividing between static and animated objects
		p.cache = function() {
			for (var i = 1; i < this.tings.length; i++) {
				this.tings[i].reset();
			};

			var limit = 100;
			var allZero = false;
			while (limit > 0 && allZero == false) {
				allZero = true;
				this.clippingPath = this.tings[0].getCurFrame();

				for (var i = 1; i < this.tings.length; i++) {
					this.clippingPath = this.clippingPath.unite(this.tings[i].getCurFrame());
					this.tings[i].update();
				};

				this.clipPathesCache.push(this.clippingPath);

				for (var i = 0; i < this.tings.length; i++) {
					if (this.tings.frameNum != 0) {
						allZero = false;
					};
				};

				limit--;
			}

			for (var i = 1; i < this.tings.length; i++) {
				this.clippingPath = this.clippingPath.unite(this.tings[i].getCurFrame());
			};

			this.cached = true;
			KEEF.totalCached++;
			console.log('cached');
			var elem = document.getElementById('loadingText');
			elem.innerHTML = 'processed ' + KEEF.totalCached + ' of ' + KEEF.totalToCache;
		}
	}

}());

//----------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------
(function() {

	if (KEEF.SnowTexture === undefined) {

		KEEF.SnowTexture = function() {

			this.id = KEEF.createID("snowTexture");
			this.name = 'snow';

			this.still = false;
			this.clip = true;
			this.depth = 0;

			this.myLines = [];
			this.numLines = 80;
			this.lineColor = KEEF.color.black;
			this.increment = KEEF.width / this.numLines;
			this.lineLength = KEEF.height;

			this.flakes;

			this.clipPathesCache = new Array();
			this.clippingPath;
			this.clipPosition = new paper.Point(0, 0);
			this.cacheFrameNum = 0;

			this.snowflakes, this.flakes;

			this.paperFlakes = new Array();
			this.numFlakes = 20;


			this.compoundPath;
		};

		var p = KEEF.SnowTexture.prototype;

		p.init = function() {

			for (var i = 0; i < this.numLines; i++) {
				this.myLines.push(new paper.Path.Line(new paper.Point(this.increment * i, 0), new paper.Point(this.increment * i, KEEF.height)));
				this.myLines[this.myLines.length - 1].strokeColor = this.lineColor;
			};

			for (var i = 0; i < this.numFlakes; i++) {
				this.paperFlakes.push(new paper.Path.Circle(new paper.Point(Math.random() * canvas.width, Math.random() * canvas.height), Math.random() * 15 + 5));
				this.paperFlakes[this.paperFlakes.length - 1].data.speedX = Math.random() * 40 + 5;
				this.paperFlakes[this.paperFlakes.length - 1].data.speedY = Math.random() * 40 + 10;
			};


			this.compoundPath = new CompoundPath({
				children: this.paperFlakes
			});

			this.startSnow();
		}

		//!! make sure we don't update the same ting across multipel textures
		p.update = function() {
			for (var i = 0; i < this.numFlakes; i++) {
				this.compoundPath.children[i].position.x = this.compoundPath.children[i].position.x + this.compoundPath.children[i].data.speedX;
				this.compoundPath.children[i].position.y = this.compoundPath.children[i].position.y + this.compoundPath.children[i].data.speedY;

				if (this.compoundPath.children[i].position.x > canvas.width + 100) {
					this.compoundPath.children[i].position.x = -100;
				}

				if (this.compoundPath.children[i].position.y > canvas.height + 100) {
					this.compoundPath.children[i].position.y = -100;
				}
			};
		}

		p.startSnow = function() {

			this.flakes = new Array();

			this.flakes.push(this.compoundPath);

			for (var i = 0; i < this.myLines.length; i++) {
				this.flakes.push(this.myLines[i]);
			};

			this.snowflakes = new paper.Group({
				children: this.flakes
			});

			this.snowflakes.clipped = this.clip;

		}

		p.setClipPosition = function(p) {
			this.clipPosition.set(p.x, p.y);
		}
	}

}());