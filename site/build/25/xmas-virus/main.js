//'use strict'

console.log( '%cHappy Holidats everyone!', 'color: #ab0000' );
console.log( '%c@acidbeat %c&& %c@thespite %cfor %cChristmas Experiments 2015', 'color: #ff9000', 'color: #888', 'color: #ff9000', 'color: #888', 'color:#ab0000' );
console.log( '%chttp://www.christmasexperiments.com', 'color: #ff9000' );
console.log( '' )
console.log( '%cPress %ce %cfor interactive mode!', 'color: #888', 'color: #ab0000', 'color: #888')
console.log( '' )
WAGNER.vertexShadersPath = 'Wagner/vertex-shaders';
WAGNER.fragmentShadersPath = 'Wagner/fragment-shaders';
WAGNER.assetsPath = 'Wagner/assets/';

// blue magenta yellow, red 

var cameras = [
	{ // 1
		position: new THREE.Vector3( -5.1085910095442095, 0.8991819084385648, -16.406258047368837 ),
		target: new THREE.Vector3( -15.06246564256313, -4.557379786814194, -7.676944281480399 ),
		aperture: .02,
		distance: 1
	},
	{ // 2
		position: new THREE.Vector3( -15.167371266248754, -1.8611718650298137, -10.02967931717489 ),
		target: new THREE.Vector3( -3.573946021928795, 5.612636911932957, 3.725769636956985 ),
		aperture: .05,
		distance: .85
	},
	{ // 3
		position: new THREE.Vector3( 0.09221196535577691, -2.7759342860813163, -5.75362346055509 ),
		target: new THREE.Vector3( 3.975501070437179, 0.3932562091652414, 0.14128885897680965 ),
		aperture: .02,
		distance: 1
	},
	{ // 4
		position: new THREE.Vector3( -14.852420323291607, 8.370085695604972, 3.1587026734168577 ),
		target: new THREE.Vector3( -2.2283131701283376, -0.9525103222563635, 5.498442638410712 ),
		aperture: .02,
		distance: .8
	},
	{ // 5
		position: new THREE.Vector3( -13.500463943594722, -8.172478174265688, 0.863289836546083 ),
		target: new THREE.Vector3( -8.578037361130349, -4.060184219299862, -4.156749814396668 ),
		aperture: .02,
		distance: .9
	},
	{ // 6
		position: new THREE.Vector3( 1.491019403961463, 0.5315312475731542, 19.087147738650046 ),
		target: new THREE.Vector3( 8.864851313896068, -3.476338741741605, 7.484640006264783 ),
		aperture: .04,
		distance: .85
	},
	{ // 7
		position: new THREE.Vector3( -1.2548885556221723, 1.7119310892319355, -2.261982649969243 ),
		target: new THREE.Vector3( -2.5325661017862533, -4.02667566662882, 2.768884721911386 ),
		aperture: .2,
		distance: .99
	},
	{ // 8
		position: new THREE.Vector3( 0.21515024877894529, 3.509129039738008, -0.4450316791854705 ),
		target: new THREE.Vector3( -0.2657572469182987, -2.3087406037078475, 0.8852739373193121 ),
		aperture: .1,
		distance: .99
	},
	{ // 9
		position: new THREE.Vector3( 3.980457784533302, 2.4014426237671183, 6.060553134147385 ),
		target: new THREE.Vector3( 2.967811741081503, 0.34403429393915247, -0.9235450697183524 ),
		aperture: .2,
		distance: .95
	},
	{ // 10
		position: new THREE.Vector3( 4.522856990247529, -1.3381972058748401, -2.1159511492722327 ),
		target: new THREE.Vector3( 0.9806371240533418, -1.6665919171811383, -1.6731746936860763 ),
		aperture: .2,
		distance: .95
	},
	{ // 11
		position: new THREE.Vector3( 4.450706388299658, 2.722330271446955, -3.8877328097490507 ),
		target: new THREE.Vector3( -1.9735821212039102, -0.6674130053714113, -1.7372375488211051 ),
		aperture: .2,
		distance: .95
	},
	{ // 12
		position: new THREE.Vector3( 2.264974974192415, -5.520940025983964, 2.5929607512373556 ),
		target: new THREE.Vector3( 0, 0, 0 ),
		aperture: .2,
		distance: .95
	},
	{ // 13
		position: new THREE.Vector3( -1.3980131199482688, 3.4156016406278926, 11.433739725596356 ),
		target: new THREE.Vector3( 1.294330289391187, 0.676332538205743, 2.4096386130665954 ),
		aperture: .05,
		distance: .87
	},
	{ // 14
		position: new THREE.Vector3( -6.707446606927979, -6.0409830520780545, 6.307732656098224 ),
		target: new THREE.Vector3( -1.5902181358054397, -1.6868425676574708, -0.8366457321676409 ),
		aperture: .05,
		distance: .9
	},
	{ // 15
		position: new THREE.Vector3( -1.158299655239825, 10.78599146070582, 10.620884609652753 ),
		target: new THREE.Vector3( 3.551952120151164, 2.2761756710405887, 2.227966216693934 ),
		aperture: .05,
		distance: .85
	},
	{ // 16
		position: new THREE.Vector3( -12.024267787541055, 1.3729790588811832, 12.964160215306094 ),
		target: new THREE.Vector3( -7.546391586245068, 0.033365926830122336, -1.4800954302995946 ),
		aperture: .05,
		distance: .85
	},
	{ // 17	
		position: new THREE.Vector3( 3.2733439826912134, 1.0778167663370593, 16.49872804350816 ),
		target: new THREE.Vector3( 0, 0, 0 ),
		aperture: 0,
		distance: 1
	}
]

var nodeColorsPtr = {
	'blue': 0, 'magenta': 1, 'yellow': 2, 'red': 3, 'green': 4
}

var nodeColors = [ // dark bright
	
	0x002768, 0x0087ff,
	0x3681ff, 0x00ffff,
	
	0x750044, 0xff0039,
	0xc60054, 0xff1ead,

	0xcc4e00, 0xe97c10,
	0xff9000, 0xffff00,
	
	0x4e0000, 0xa80000,
	0xab0000, 0xff0000,

	0x004e35, 0x009968,
	0x02b27a, 0x00ffae

];

var colorData = new Uint8Array( 4 * 5 * 4 );
var previousTime, elapsedTime;

var p = 0;
nodeColors.forEach( function( v ) { 

	var c = new THREE.Color( v )
	colorData[ p     ] = c.r * 255
	colorData[ p + 1 ] = c.g * 255
	colorData[ p + 2 ] = c.b * 255
	colorData[ p + 3 ] = 0
	p += 4;

} );

var nodeColorTexture = new THREE.DataTexture( colorData, 4, 5, THREE.RGBAFormat );
nodeColorTexture.minFilter = THREE.NearestFilter;
nodeColorTexture.magFilter = THREE.NearestFilter;
nodeColorTexture.needsUpdate = true;

var spectrumData = new Uint8Array( 5 * 1 * 4 );

var spectrumTexture = new THREE.DataTexture( spectrumData, 5, 1, THREE.RGBAFormat );
spectrumTexture.minFilter = THREE.NearestFilter;
spectrumTexture.magFilter = THREE.NearestFilter;
spectrumTexture.needsUpdate = true;

var centerObjects = []

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var isMobile = getParameterByName( 'mobile' ) === 'true' || isMobile.phone;
var debugMode = getParameterByName( 'debug' ) === 'true';
var noPost = getParameterByName( 'nopost' ) === 'true';
var useDOF = getParameterByName( 'nodof' ) !== 'true';;

function addSpectrumVisualiser() {

	spectrumCanvas = document.createElement( 'canvas' );
	spectrumCanvas.width = 256;
	spectrumCanvas.height = 64;
	spectrumCanvas.setAttribute( 'id', 'spectrumCanvas' );
	spectrumCtx = spectrumCanvas.getContext( '2d' );

	document.body.appendChild( spectrumCanvas );

}

function getFreqRange( from, to ) {

	var v = 0;
	for( var j = from; j < to; j++ ) {
		v += frequencyData[ j ];
	}
	return v / ( to - from );

}

function drawSpectrum( step ) {

	spectrumCtx.clearRect( 0, 0, spectrumCanvas.width, spectrumCanvas.height );
	for( var j = 0; j < frequencyData.length; j+= step ) {
	var v = getFreqRange( j, j + step );// * Math.exp(.01*j);
		spectrumCtx.fillStyle = 'rgb(255,' + j + ',' + j + ')';
		spectrumCtx.beginPath();
		spectrumCtx.fillRect( j, spectrumCanvas.height, step, - v * spectrumCanvas.height / 256 );
		spectrumCtx.font = "normal 10px Arial";
		spectrumCtx.save();
		spectrumCtx.rotate( Math.PI / 2 );
		spectrumCtx.beginPath();
		spectrumCtx.fillText( j, 10, -j );
		spectrumCtx.restore();
	}

}

if( debugMode ) {

	var spectrumCanvas;
	var spectrumCtx;

	addSpectrumVisualiser();

}

var timeLabel = document.getElementById( 'time' );
var cameraLabel = document.getElementById( 'camera' );
var container = document.getElementById( 'container' );
var creditsLabel = document.getElementById( 'credits' );
creditsLabel.style.opacity = 0;
var intro = document.getElementById( 'intro' );
var loading = document.getElementById( 'loading' );
var ready = document.getElementById( 'ready' );
var start = document.getElementById( 'start' );

if( debugMode ) {
	timeLabel.style.display = 'block';
	cameraLabel.style.display = 'block';
}	

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .01, 100 );
camera.target = new THREE.Vector3();
camera.position.set( 0 ,0, -10 );//-1, 15, -10 );

var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
var pixelRatio = window.devicePixelRatio;
renderer.devicePixelRatio = pixelRatio;
renderer.setPixelRatio( pixelRatio );
document.body.appendChild( renderer.domElement );
renderer.setClearColor( 0 );

var composer = new WAGNER.Composer( renderer, { useRGBA: false } );
var bloomPass = new WAGNER.MultiPassBloomPass();
bloomPass.params.blurAmount = 1;
bloomPass.params.blendMode = 11;
var DOFPass = new WAGNER.DOFPass();
DOFPass.params.blurAmount = .3
DOFPass.params.aperture = .01
DOFPass.params.focalDistance = .9
var blendPass = new WAGNER.BlendPass();
blendPass.params.mode = 9
var vignettePass = new WAGNER.Vignette2Pass();
vignettePass.params.boost = 1.5;
vignettePass.params.reduction = 1;
var blurPass = new WAGNER.FullBoxBlurPass();
var glowTexture;
var depthTexture;

var fxaaPass = new WAGNER.FXAAPass();

var audio;

var controls;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

var shadowMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 0 });

var matCap;

var centerMaterial = new THREE.RawShaderMaterial( {
	uniforms: {
		matCapMap: { type: 't', value: matCap },
		colorsMap: { type: 't', value: null },
		objectColor: { type: 'f', value: 0 },
		spectrumTexture: { type: 't', value: spectrumTexture },
		mNear: { type: 'f', value: camera.near },
		mFar: { type: 'f', value: camera.far },
		brightness: { type: 'f', value: 0 },
		drawGlow: { type: 'f', value: 0 },
		drawDepth: { type: 'f', value: 0 }
	},
	vertexShader: document.getElementById( 'center-vs' ).textContent,
	fragmentShader: document.getElementById( 'center-fs' ).textContent,
	derivatives: true
} );

var boxMaterial = new THREE.RawShaderMaterial( {
	uniforms: {
		matCapMap: { type: 't', value: matCap },
		posTexture: { type: 't', value: null },
		rotTexture: { type: 't', value: null },
		orbitTexture: { type: 't', value: null },
		offsetTexture: { type: 't', value: null },
		colorTexture: { type: 't', value: null },
		spectrumTexture: { type: 't', value: spectrumTexture },
		colorsMap: { type: 't', value: nodeColorTexture },
		posDimensions: { type: 'v2', value: new THREE.Vector2( 0, 0 ) },
		time: { type: 'f', value: 0 },
		rotFactor: { type: 'f', value: 0 },
		factor: { type: 'f', value: 0 },
		total: { type: 'f', value: 0 },
		mNear: { type: 'f', value: camera.near },
		mFar: { type: 'f', value: camera.far },
		brightness: { type: 'f', value: 0 },
		drawGlow: { type: 'f', value: 0 },
		drawDepth: { type: 'f', value: 0 }
	},
	vertexShader: document.getElementById( 'object-vs' ).textContent,
	fragmentShader: document.getElementById( 'object-fs' ).textContent
} );

var boxGeometries;
var TAU = 2 * Math.PI;
var boxes = [];

var data = [];

function loadBoxes() {

	return new Promise( function( resolve, reject ) { 

		var boxes = [ 'cube01', 'cube02', 'cube03', 'cube04', 'cube05' ];
		var promises = [];
		var geometries = {};

		boxes.forEach( function( b ) { 

			var p = new Promise( function( resolve, reject ) {

				var loader = new THREE.OBJLoader();
				loader.load( 'assets/' + b + '.obj', function( res ) {
					var geometry = res.children[ 0 ].geometry;
					//geometry = new THREE.BoxGeometry( 1, 1, 1 );
					geometry.computeBoundingBox();
					var src = new THREE.BufferGeometry();
					src.fromGeometry( geometry );
					geometries[ b ] = {
						geometry: geometry,
						bufferGeometry: src
					}
					resolve();
				} );

			} );

			promises.push( p );

		} );

		Promise.all( promises ).then( function() {
			resolve( geometries )
		} );

	} );

}

function loadCenter() {

	var vectors = [
		new THREE.Vector3( 1, 0, 0 ),
		new THREE.Vector3( 0, 1, 0 ),
		new THREE.Vector3( 0, 0, 1 )
	];

	return new Promise( function( resolve, reject ) { 

		var boxes = [ 'frame', 'dots', 'cristal' ];
		var boxColors = [ 'magenta', 'blue', 'yellow' ]
		var promises = [];
		var geometries = {};

		boxes.forEach( function( b, id ) { 

			var p = new Promise( function( resolve, reject ) {

				var loader = new THREE.OBJLoader();
				loader.load( 'assets/' + b + '.obj', function( res ) {
					
					var geometry = res.children[ 0 ].geometry;
					geometry.computeBoundingBox();
					var src = new THREE.BufferGeometry();
					src.fromGeometry( geometry );

					var centers = new Float32Array( src.attributes.position.count * 3 );

					for ( var i = 0, l = src.attributes.position.count; i < l; i ++ ) {
						vectors[ i % 3 ].toArray( centers, i * 3 );
					}

					src.addAttribute( 'center', new THREE.BufferAttribute( centers, 3 ) );

					var mat = centerMaterial.clone();
					mat.uniforms.matCapMap.value = matCap;
					mat.uniforms.colorsMap.value = nodeColorTexture;
					mat.uniforms.objectColor.value = nodeColorsPtr[ boxColors[ id ] ];
					mat.uniforms.spectrumTexture.value = spectrumTexture;

					var mesh = new THREE.Mesh( src, mat );
					mesh.rotation.x = Math.PI / 4;
					scene.add( mesh );

					centerObjects.push( mesh );

					resolve();
				} );

			} );

			promises.push( p );

		} );

		Promise.all( promises ).then( function() {
			resolve( geometries )
		} );

	} );

}

var node     = [ 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0 ]
var sequence = [ 4, 3, 2, 1, 2, 4, 3, 4, 4, 4, 4, 4, 3, 4, 3, 4 ]
var outer    = [ 1, 0, 1, 0, 0, 1, 0, 1 ]
var size     = 1;

/*sequence = []
node = [];
for( var j = 0; j < 10; j++ ) {
	var n = 4 - ( ~~( Math.random() * ( 4 * ( j / 9 ) ) )  );
	sequence.push( n )
	node.push( n === 1 ? 1 : 0 )
}
*/

function initGeometries() {

	var v = new THREE.Vector3()

	var r = 1.3;
	var step = 2 * Math.PI / 6;
	var p = 0;
	for( var a = 0; a < 2 * Math.PI - step; a += step ) {
		v.set( r * Math.cos( a ), 0, r * Math.sin( a ) );
		var base = new THREE.Group();
		base.position.copy( v );
		var dir = v.clone().normalize();
		dir.add( v );
		base.lookAt( dir );
		generateArm( base, p === 0 || p === 3 );
		p++;
	}

	var p = 0;
	for( var a = 0; a < 2 * Math.PI - step; a += step ) {
		if( p !== 0 && p !== 3 ) {
			v.set( r * Math.cos( a ), r * Math.sin( a ), 0 );
			var base = new THREE.Group();
			base.position.copy( v );
			var dir = v.clone().normalize();
			dir.add( v );
			base.lookAt( dir );
			base.rotation.z += Math.PI / 2;
			generateArm( base, false );
		}
		p++;
	}

	var g = new THREE.BufferGeometry();
	var positionsLength = 0;
	var normalsLength = 0;
	var idsLength = 0;

	data.sort( function( a ,b ) { 
		return a.tier - b.tier 
	} );

	data.forEach( function( b ) {

		var bg = b.geometry.bufferGeometry;

		positionsLength += bg.attributes.position.array.length;
		normalsLength += bg.attributes.normal.array.length;

	} );

	idsLength = positionsLength / 3;
	var positions = new Float32Array( positionsLength );
	var normals = new Float32Array( normalsLength );

	var ids = new Float32Array( idsLength );

	var positionsPtr = 0;
	var normalsPtr = 0;

	var cubePositions = [];
	var cubeRotations = [];
	var ptr = 0;

	data.forEach( function( b ) {

		var bg = b.geometry.bufferGeometry.clone();

		var m = new THREE.Matrix4();
		m.makeTranslation( b.position.x, b.position.y, b.position.z );
		var r = new THREE.Matrix4();
		var a = new THREE.Euler( b.rotation.x, b.rotation.y, b.rotation.z, 'XYZ' );
		r.makeRotationFromEuler( a );
		m.multiply( r );
		//bg.applyMatrix( m )
		
		positions.set( bg.attributes.position.array, positionsPtr );
		normals.set( bg.attributes.normal.array, positionsPtr );

		var l = bg.attributes.position.array.length;
		for( var j = positionsPtr / 3; j < ( positionsPtr + l ) / 3; j++ ) {
			ids[ j ] = ptr;
		}

		cubePositions.push( b.position.clone() );
		cubeRotations.push( b.rotation.clone() );

		positionsPtr += bg.attributes.position.array.length;
		normalsPtr += bg.attributes.normal.array.length;
		ptr++;

	} );

	g.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	g.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

	g.addAttribute( 'id', new THREE.BufferAttribute( ids, 1 ) );
	g.attributes.id.needsUpdate = true;

	var vectors = [
		new THREE.Vector3( 1, 0, 0 ),
		new THREE.Vector3( 0, 1, 0 ),
		new THREE.Vector3( 0, 0, 1 )
	];

	var centers = new Float32Array( positionsLength );

	for ( var i = 0, l = positionsLength / 3; i < l; i ++ ) {
		vectors[ i % 3 ].toArray( centers, i * 3 );
	}

	g.addAttribute( 'center', new THREE.BufferAttribute( centers, 3 ) );

	var w = Maf.nextPowerOfTwo( Math.sqrt( data.length ) );
	var h = Maf.nextPowerOfTwo( data.length / w );

	var posData = new Float32Array( w * h * 4 );

	var p = 0;
	cubePositions.forEach( function( v ) { 

		posData[ p     ] = v.x
		posData[ p + 1 ] = v.y
		posData[ p + 2 ] = v.z
		posData[ p + 3 ] = 0
		p += 4;

	} );

	var posTexture = new THREE.DataTexture( posData, w, h, THREE.RGBAFormat, THREE.FloatType );
	posTexture.minFilter = THREE.NearestFilter;
	posTexture.magFilter = THREE.NearestFilter;
	posTexture.needsUpdate = true;

	boxMaterial.uniforms.posTexture.value = posTexture;
	boxMaterial.uniforms.posDimensions.value.set( w, h );
	boxMaterial.uniforms.total.value = data.length;

	var rotData = new Float32Array( w * h * 4 );

	var p = 0;
	cubeRotations.forEach( function( v ) { 

		rotData[ p     ] = v.x
		rotData[ p + 1 ] = v.y
		rotData[ p + 2 ] = v.z
		rotData[ p + 3 ] = 0
		p += 4;

	} );

	var rotTexture = new THREE.DataTexture( rotData, w, h, THREE.RGBAFormat, THREE.FloatType );
	rotTexture.minFilter = THREE.NearestFilter;
	rotTexture.magFilter = THREE.NearestFilter;
	rotTexture.needsUpdate = true;

	boxMaterial.uniforms.rotTexture.value = rotTexture;

	var orbitData = new Float32Array( w * h * 4 );

	var orbitPositions = [];

	var r = 16;
	var a = 0;
	cubePositions.forEach( function( v ) { 
		var v = new THREE.Vector3() 
		v.x = r * Math.cos( a );
		v.y = .5 - Math.random()
		v.z = r * Math.sin( a );
		orbitPositions.push( v );
		a += .5 * ( .05 + Math.random() * .05 );
		if( a > TAU ) {
			a -= TAU;
			r += 1;
		}
	} );

	orbitPositions.sort( function() { return Math.random() - .5 } );

	var p = 0;
	cubePositions.forEach( function( v, i ) { 

		var v = orbitPositions[ i ]
		orbitData[ p     ] = v.x
		orbitData[ p + 1 ] = v.y
		orbitData[ p + 2 ] = v.z
		orbitData[ p + 3 ] = 0
		p += 4;

	} );

	var orbitTexture = new THREE.DataTexture( orbitData, w, h, THREE.RGBAFormat, THREE.FloatType );
	orbitTexture.minFilter = THREE.NearestFilter;
	orbitTexture.magFilter = THREE.NearestFilter;
	orbitTexture.needsUpdate = true;

	boxMaterial.uniforms.orbitTexture.value = orbitTexture;

	var offsetData = new Float32Array( w * h * 4 );

	var p = 0;
	cubePositions.forEach( function( v, i ) { 

		var v = new THREE.Vector3( .5 - Math.random() , .5 - Math.random(), .5 - Math.random() );
		v.normalize();
		offsetData[ p     ] = v.x
		offsetData[ p + 1 ] = v.y
		offsetData[ p + 2 ] = v.z
		offsetData[ p + 3 ] = 0
		p += 4;

	} );

	var offsetTexture = new THREE.DataTexture( offsetData, w, h, THREE.RGBAFormat, THREE.FloatType );
	offsetTexture.minFilter = THREE.NearestFilter;
	offsetTexture.magFilter = THREE.NearestFilter;
	offsetTexture.needsUpdate = true;

	boxMaterial.uniforms.offsetTexture.value = offsetTexture;

	var colorData = new Float32Array( w * h * 4 );

	var p = 0;
	cubePositions.forEach( function( v, i ) { 

		var v = new THREE.Vector3( Math.random(), Math.random(), Math.random() );
		colorData[ p     ] = data[ i ].color
		colorData[ p + 1 ] = 0//v.y
		colorData[ p + 2 ] = 0//v.z
		colorData[ p + 3 ] = 0
		p += 4;

	} );

	var colorTexture = new THREE.DataTexture( colorData, w, h, THREE.RGBAFormat, THREE.FloatType );
	colorTexture.minFilter = THREE.NearestFilter;
	colorTexture.magFilter = THREE.NearestFilter;
	colorTexture.needsUpdate = true;

	boxMaterial.uniforms.colorTexture.value = colorTexture;

	var m = new THREE.Mesh( g, boxMaterial );
	m.frustumCulled = false;
	scene.add( m );

	var plane = new THREE.Mesh( new THREE.PlaneGeometry( 8, 8 ), new THREE.MeshBasicMaterial( { map: spectrumTexture, side: THREE.DoubleSide } ) );
	//scene.add( plane );

	/*var m2 = new THREE.MeshBasicMaterial( { color: 0xfffffff, wireframe: true, depthTest: false, opacity: .1, transparent: true, blending: THREE.AdditiveBlending })
	data.forEach( function( b ) {
		var m = new THREE.Mesh( b.geometry.geometry, m2 );
		m.position.copy( b.position )
		m.rotation.copy( b.rotation );
		m.castShadow = m.receiveShadow = true;
		scene.add( m );
	} );*/

}

function pickRandomColor() {

	var c = [ 'magenta', 'blue', 'green', 'yellow' ]
	var res = c[ ~~ ( Math.random() * c.length ) ];
	return nodeColorsPtr[ res ];

}

function generateArm( base, bothAxis ){

	base.updateMatrixWorld();

	/*sequence     = [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 4, 4, 3, 3, 2, 2 ]
	node         = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
	outer        = [];*/

	var rot = new THREE.Matrix4();
	var e = new THREE.Euler( base.rotation.x, base.rotation.y, base.rotation.z )
	rot.makeRotationFromEuler( e );

	var pos = 0;
	var tierPtr = 0;
	sequence.forEach( function( b, i ) {
		
		var boxGeometry = boxGeometries[ 'cube0' + b ].geometry;
		var w = boxGeometry.boundingBox.max.x - boxGeometry.boundingBox.min.x;

		pos += .5 * size * w;
		
		var p = new THREE.Vector3( 0, 0, pos );
		p.applyMatrix4( base.matrixWorld );
		var r = base.rotation.clone();
		if( node[ i ] === 0 ) r.z += Math.random() * 2 * Math.PI
		var color = nodeColorsPtr[ 'red' ];
		if( b == 2 ) color = nodeColorsPtr[ 'blue' ];
		if( b > 2 ) color = pickRandomColor()

		data.push( {
			geometry: boxGeometries[ 'cube0' + b ],
			position: p,
			rotation: r,
			tier: i,
			color: color
		} );

		if( node[ i ] > 0 ) {

			var branchSequence = [ 2, 4, 3, 4, 4, 4, 4, 4 ];
			if( node[ i ] === 2 ) branchSequence = [ 3, 5, 4, 5, 5, 5, 5, 5 ];

			/*var branchSequence = [];
			for( var j = 0; j < 8; j++ ) {
				var n = 5 - ( ~~( Math.random() * ( 4 * ( j / 7 ) ) )  );
				branchSequence.push( n )
				node.push( n === 1 ? 1 : 0 )
			}*/

			var branchBase = new THREE.Group();
			branchBase.position.copy( p );
			var dir = new THREE.Vector3( 1, 0, 1 );
			dir.applyMatrix4( rot );
			dir.add( p );
			branchBase.lookAt( dir );
			branchBase.rotation.z += Math.PI / 2;
			generateBranch( branchBase, branchSequence, i + 2 );

			var branchBase = new THREE.Group();
			branchBase.position.copy( p );
			var dir = new THREE.Vector3( -1, 0, 1 );
			dir.applyMatrix4( rot );
			dir.add( p );
			branchBase.lookAt( dir );
			branchBase.rotation.z += Math.PI / 2;
			generateBranch( branchBase, branchSequence, i + 2 );

			if( bothAxis ) {

				var branchBase = new THREE.Group();
				branchBase.position.copy( p );
				var dir = new THREE.Vector3( 0, 1, 1 );
				dir.applyMatrix4( rot );
				dir.add( p );
				branchBase.lookAt( dir );
				branchBase.rotation.z += Math.PI / 2;
				generateBranch( branchBase, branchSequence, i + 2 );

				var branchBase = new THREE.Group();
				branchBase.position.copy( p );
				var dir = new THREE.Vector3( 0, -1, 1 );
				dir.applyMatrix4( rot );
				dir.add( p );
				branchBase.lookAt( dir );
				branchBase.rotation.z += Math.PI / 2;
				generateBranch( branchBase, branchSequence, i + 2 );

			}
		}

		pos += .5 * size * w;
		tierPtr++;

	})

	outer.forEach( function( b, i ) {
		var boxGeometry = boxGeometries[ 'cube05' ].geometry;
		var w = boxGeometry.boundingBox.max.x - boxGeometry.boundingBox.min.x;
		pos += .5 * size * w;
		if( b === 1 ) {
			var p = new THREE.Vector3( 0, 0, pos );
			p.applyMatrix4( base.matrixWorld );
			var r = base.rotation.clone();
			r.z += Math.random() * 2 * Math.PI
			data.push( {
				geometry: boxGeometries[ 'cube05' ],
				position: p,
				rotation: r,
				tier: tierPtr + i,
				color: pickRandomColor()
			} );

		}
		pos += .5 * size * w;
	})
}

function generateBranch( base, sequence, tier ){

	base.updateMatrixWorld();

	
	var size = 1;

	var pos = .8;
	//if( n === 2 ) pos = .4;
	sequence.forEach( function( b, i ) {
		
		var boxGeometry = boxGeometries[ 'cube0' + b ].geometry;
		var w = boxGeometry.boundingBox.max.x - boxGeometry.boundingBox.min.x;

		pos += .5 * size * w;
		
		var p = new THREE.Vector3( 0, 0, pos );
		p.applyMatrix4( base.matrixWorld );
		var r = base.rotation.clone();
		r.z += Math.random() * 2 * Math.PI
		var color = nodeColorsPtr[ 'red' ];
		if( b == 2 ) color = nodeColorsPtr[ 'blue' ];
		if( b > 2 ) color = pickRandomColor();

		data.push( {
			geometry: boxGeometries[ 'cube0' + b ],
			position: p,
			rotation: r,
			tier: tier + i,
			color: color
		} );

		pos += .5 * size * w;

	})

}

var startTime;
var storyline;
var mode = 1;

window.addEventListener( 'keydown', function( e ) {

	switch( e.keyCode ) {
		case 69: mode = 1 - mode; break;
	}

} );

var AudioContext = AudioContext || webkitAudioContext;

var audioContext = new AudioContext();
var startAudioTime = performance.now();
var audioBuffer;
var audioSource;

var analyser = audioContext.createAnalyser();
analyser.fftSize = 512;
analyser.smoothingTimeConstant = .75;
var frequencyData = new Uint8Array( analyser.fftSize );
analyser.connect( audioContext.destination );

var bkg;

window.addEventListener( 'load', function() {

	var img = new Promise( function( resolve, reject ) {
		var imgLoader = new THREE.TextureLoader();
		imgLoader.load( 'assets/matcap.png', function( image ) {
			matCap = image;
			centerMaterial.uniforms.matCapMap.value = matCap;
			boxMaterial.uniforms.matCapMap.value = matCap;
			resolve();
		} );
	});

	var mat = new THREE.RawShaderMaterial( {
		uniforms:{
			mNear: { type: 'f', value: camera.near },
			mFar: { type: 'f', value: camera.far },
			drawDepth: { type: 'f', value: 0 }
		},
		vertexShader: document.getElementById( 'bkg-vs' ).textContent,
		fragmentShader: document.getElementById( 'bkg-fs' ).textContent,
		side: THREE.BackSide
	} );
	bkg = new THREE.Mesh( new THREE.IcosahedronGeometry( 50, 2 ), mat );
	scene.add( bkg );

	var geo = new Promise( function( resolve, reject ) { 

		loadBoxes().then( function( g ) {

			boxGeometries = g;

			loadCenter().then( function() {

				initGeometries();
				onWindowResize();
				resolve();
		
			} );

		});

	})

	var story = new Promise( function( resolve, reject ) {

		var oReq = new XMLHttpRequest();
		oReq.onload = function() {
			storyline = STORYLINE.parseStoryline( JSON.parse( this.responseText ) );
			resolve();
		};
		oReq.open( 'get', 'assets/storyboard.json', true);
		oReq.send();

	})

	var a = new Promise( function( resolve, reject ) {
		
		var trackName = 'assets/acidbeat - xmas infection';

		if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) { // gaaaaah
			trackName += '.ogg';
		} else {
			trackName += '.mp3';
		}
		
		if( isMobile ) {

			var request = new XMLHttpRequest();
			request.open( 'GET', trackName, true );
			request.responseType = 'arraybuffer';

			request.onload = function() {

				audioContext.decodeAudioData( request.response, function( buffer ) {
					
					audioBuffer = buffer;

					audioSource = audioContext.createBufferSource(); 
					audioSource.buffer = audioBuffer;

					audioSource.connect( analyser );

					resolve();

				}, function() {
					reject();
				} );

			};

			request.send();

		} else {

			audio = document.createElement( 'audio' );

			audio.controls = true;
			audio.className = 'player';
			audio.style.display = 'none';
			document.body.appendChild( audio );

			var timeout = null;
			window.addEventListener( 'mousemove', function() {
				if( timeout ) clearTimeout( timeout );
				audio.classList.add( 'visible' );
				timeout = setTimeout( function() {
					audio.classList.remove( 'visible' );
				}, 1000 );
			} );

			function onAudioReady() {

				audio.removeEventListener( 'canplay', onAudioReady );
				audio.pause();

				var audioSource = audioContext.createMediaElementSource( audio );
				audioSource.connect( analyser );

				resolve();

			}

			audio.addEventListener( 'canplay', onAudioReady );

			audio.src = trackName;

		}

	} );

	Promise.all( [ img, geo, a, story ] ).then( function() {

		loading.style.opacity = 0;
		ready.style.opacity = 1;		
		start.style.display = 'block';

		function playSound() {

			start.removeEventListener( 'click', playSound );
			start.style.display = 'none';

			controls = new THREE.OrbitControls( camera, renderer.domElement );

			startTime = performance.now();
			previousTime = startTime;
			render();
			render();

			setTimeout( function() {
				startTime = performance.now();
				previousTime = startTime;
				if( isMobile ) {
					audioSource.start( 0 );	
				} else {
					audio.play();
					audio.style.display = 'block';
				}
				ready.style.opacity = 0;		
				intro.style.opacity = 0;
				
				animate();
			}, 500 );

		}
		start.addEventListener( 'click', playSound );
	})
	
} );

function onWindowResize() {

	var width = 1280;
	var height = 720;

	var w = window.innerWidth;//width * ( window.innerWidth / width )
	var h = window.innerHeight;//height * ( window.innerWidth / width )

	renderer.setSize( w, h );

	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.left = '0px';
	renderer.domElement.style.top = ( ( window.innerHeight - ( renderer.domElement.height / renderer.devicePixelRatio ) ) / 2 ) + 'px';

	camera.aspect = w / h;
	camera.updateProjectionMatrix();

	composer.setSize( w, h );

	bloomPass.width = Maf.nextPowerOfTwo( w / 2 );
	bloomPass.height = Maf.nextPowerOfTwo( h / 2 )
	
	glowTexture = WAGNER.Pass.prototype.getOfflineTexture( composer.width, composer.height, false );
	depthTexture = WAGNER.Pass.prototype.getOfflineTexture( composer.width, composer.height, false );

}

window.addEventListener( 'resize', onWindowResize );

function animate() {

	requestAnimationFrame( animate );
	render();

}
var tmpVector = new THREE.Vector3();
var ZEROV3 = new THREE.Vector3( 0, 0, 0 );
var TAUV3 = new THREE.Vector3( TAU, TAU, TAU );

var maxFreq = [ 255 ,255 ,255, 255 ,255 ] ;
var minFreq = [0, 0, 0, 0, 0 ];
//var freqs = [ [ 0, 10 ], [ 10, 30 ], [ 30, 60 ], [ 60, 100 ], [ 100, 150 ]]
var freqs = [ [ 60, 100 ], [ 10, 30 ], [ 0, 10 ], [ 100, 150 ], [ 30, 60 ] ]

function render() {

	var speedMultiplier = 1;
	elapsedTime = .001 * ( performance.now() - previousTime );

	analyser.getByteFrequencyData( frequencyData );
	var p = 0;
	var pf = 0;
	for( var pf = 0; pf < 5; pf++ ){
		var f = getFreqRange( freqs[ pf ][ 0 ], freqs[ pf ][ 1 ] );
		if( f > maxFreq[ pf ] ) maxFreq[ pf ] = f;
		if( f < minFreq[ pf ] ) minFreq[ pf ] = f;
		spectrumData[ p ] = 255 * ( f - minFreq[ pf ] ) / ( maxFreq[ pf ] - minFreq[ pf ] );
		maxFreq[ pf ] -= .25;
		minFreq[ pf ] += .2;
		p += 4;
	}
	spectrumTexture.needsUpdate = true;

	if( debugMode ) {
		drawSpectrum( 10 );
	}

	var t = isMobile ? .001 * ( performance.now() - startTime ) : audio.currentTime;
	var l = 93;

	if( mode === 1 ) {
		var cam = storyline.get( 'camera', t );
		if( cam === 0 || cam === null ) {
			camera.position.set( storyline.get( 'cx', t ), storyline.get( 'cy', t ), storyline.get( 'cz', t ) );
			camera.target.set( storyline.get( 'tx', t ), storyline.get( 'ty', t ), storyline.get( 'tz', t ) );
			DOFPass.params.aperture = 0;
			DOFPass.params.focalDistance = 1
		} else {
			var selectedCam =cameras[ cam - 1 ];
			camera.position.copy( selectedCam.position );
			camera.target.copy( selectedCam.target );
			DOFPass.params.aperture = selectedCam.aperture;
			DOFPass.params.focalDistance = selectedCam.distance;
			var fd = storyline.get( 'focalDistance', t ) ;
			if( fd != 0 ) {
				DOFPass.params.focalDistance = fd;				
			}
		}
		camera.lookAt( camera.target );
		speedMultiplier = storyline.get( 'speed', t );
	} else {
		//controls.update();		
	}

	if( debugMode ) {
		time.textContent = t;
		cameraLabel.innerHTML = 'C x:' + camera.position.x + ' y:' + camera.position.y + ' z:' + camera.position.z + '<br/>T x:' + controls.target.x + ' y:' + controls.target.y + ' z:' + controls.target.z;
	}

	var et = 0;
	if( t > 23 ) et = ( ( t - 23 ) / l );

	boxMaterial.uniforms.time.value += .1 * elapsedTime * speedMultiplier;
	boxMaterial.uniforms.rotFactor.value += 10. * elapsedTime * speedMultiplier;
	boxMaterial.uniforms.factor.value = et;

	var blurFactor = storyline.get( 'blur', t );
	creditsLabel.style.opacity = blurFactor;

	scene.rotation.y -= .5 * elapsedTime * speedMultiplier;

	var v = getFreqRange( 25, 75 ) / 255;
	centerObjects.forEach( function( obj ) {
		obj.material.uniforms.brightness.value = v;
	})
	boxMaterial.uniforms.brightness.value = v;

	if( noPost ) {
		renderer.render( scene, camera );
	} else {
		composer.reset();

		if( useDOF ) {
			boxMaterial.uniforms.drawDepth.value = 1;
			bkg.material.uniforms.drawDepth.value = 1;
			centerObjects.forEach( function( obj ) {
				obj.material.uniforms.drawDepth.value = 1;
			})
			composer.render( scene, camera, null, depthTexture );
		}

		boxMaterial.uniforms.drawDepth.value = 0;
		bkg.material.uniforms.drawDepth.value = 0;
		centerObjects.forEach( function( obj ) {
			obj.material.uniforms.drawDepth.value = 0;
		})

		bkg.visible = false;

		boxMaterial.uniforms.drawGlow.value = 1;
		centerObjects.forEach( function( obj ) {
			obj.material.uniforms.drawGlow.value = 1;
		})

		composer.render( scene, camera, null, glowTexture );

		bkg.visible = true;
		
		boxMaterial.uniforms.drawGlow.value = 0;
		centerObjects.forEach( function( obj ) {
			obj.material.uniforms.drawGlow.value = 0;
		})
		
		composer.render( scene, camera );

		if( useDOF ) {
			DOFPass.params.tBias = depthTexture;
			composer.pass( DOFPass );
		}

		composer.pass( fxaaPass );

		bloomPass.params.useTexture = true;
		bloomPass.params.glowTexture = glowTexture;
		composer.pass( vignettePass );
		composer.pass( bloomPass );

		blurPass.params.amount = 4 * blurFactor;
		if( blurFactor > 0 ) composer.pass( blurPass );

		renderer.domElement.style.opacity = storyline.get( 'fade', t );

		composer.toScreen();
	}

	previousTime = performance.now();

}
