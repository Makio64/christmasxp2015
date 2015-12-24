(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = "uniform vec4 color;\nuniform vec4 colorInside;\nuniform float progress;\nuniform float alpha;\n\nvarying vec2 vUv;\n\nvoid main() {\n\n    // set pi\n    float pi = 3.141592653589793238462643383279;\n    // set transparent color\n    vec4 cBlack = vec4(0.0, 0.0, 0.0, 0.0);\n    // set base color\n    vec4 c = vec4(0.0);\n\n    //determine center position\n    vec2 position = vUv - vec2(0.5);\n    //determine the vector length of the center position\n    float len = length(position);\n    // calculate the angle of the texel to the center\n    float angle = atan(position.y, position.x);\n    // get the progress angle in radians\n    float progressRadians = ( ( 0.5 - (1.0 - progress) ) ) * ( pi * 2.0 );\n\n    if( len < 0.25 && len > 0.20 && angle < progressRadians ) {\n        c =  vec4( color.rgb, alpha );\n    } else {\n        if( len < 0.15 && colorInside.a > 0.0 ) {\n          \n            c = vec4( colorInside.rgb, alpha );\n\n        } else {\n            c = cBlack;\n        }\n    }\n\n    gl_FragColor = c;\n}";

},{}],2:[function(require,module,exports){
module.exports = "precision highp float;\nprecision highp sampler2D;\n\nuniform highp sampler2D textureMap;\n\nvarying float vColor;\n\nvoid main(){\n    vec4 color = texture2D(textureMap, gl_PointCoord);\n    if(vColor >= 1.0){\n        color.a *= 2.0 - vColor;\n    } else {\n        color.a *= vColor;\n    }\n\n    color.a *= 0.2;\n    gl_FragColor = vec4(1.0, 1.0, 1.0, color.a);\n}";

},{}],3:[function(require,module,exports){
module.exports = "precision highp float;\nprecision highp sampler2D;\n\nuniform highp sampler2D textureMap;\n\nvarying vec2 vUv;\n\nvoid main(){\n    vec4 color = texture2D(textureMap, vUv);\n    gl_FragColor = color;\n}";

},{}],4:[function(require,module,exports){
module.exports = "precision highp float;\n\nvarying vec3 vPos;\n\nvoid main(){\n    vec3 pos = vPos;\n    gl_FragColor = vec4(pos, 1.0);\n}\n";

},{}],5:[function(require,module,exports){
module.exports = "uniform sampler2D hatch1;\nuniform sampler2D hatch2;\nuniform sampler2D hatch3;\nuniform sampler2D hatch4;\nuniform sampler2D hatch5;\nuniform sampler2D hatch6;\nuniform sampler2D paper;\nuniform sampler2D baked;\nuniform vec2 resolution;\nuniform vec2 bkgResolution;\nuniform vec3 lightPosition;\n\nvec3 color = vec3( 1., 0., 1. );\nvec3 lightColor = vec3( 1. );\n\nvarying vec2 vUv;\nvarying vec2 vUv_baked;\nvarying vec3 vNormal;\nvarying float depth;\nvarying vec3 vPosition;\nvarying float nDotVP;\nvarying vec3 pos;\nvarying vec2 vN;\n\nuniform float ambientWeight;\nuniform float diffuseWeight;\nuniform float rimWeight;\nuniform float specularWeight;\nuniform float shininess;\nuniform int invertRim;\nuniform int solidRender;\nuniform float showOutline;\nuniform vec4 inkColor;\n\nuniform  float fogDensity;\nuniform float fogNear;\nuniform float fogFar;\nuniform vec3 fogColor;\nuniform float fogType;\n\nvec4 shade() {\n\n    float diffuse = nDotVP;\n    float specular = 0.;\n    float ambient = 1.;\n\n    vec3 n = normalize( vNormal );\n\n    vec3 r = -reflect(lightPosition, n);\n    r = normalize(r);\n    vec3 v = -vPosition.xyz;\n    v = normalize(v);\n    float nDotHV = max( 0., dot( r, v ) );\n\n    if( nDotVP != 0. ) specular = pow ( nDotHV, shininess );\n    float rim = max( 0., abs( dot( n, normalize( -vPosition.xyz ) ) ) );\n    if( invertRim == 1 ) rim = 1. - rim;\n\n    float shading = ambientWeight * ambient + diffuseWeight * diffuse + rimWeight * rim + specularWeight * specular;\n\n    if( solidRender == 1 ) return vec4( shading );\n\n    vec4 c;\n    float step = 1. / 6.;\n    if( shading <= step ){\n        c = mix( texture2D( hatch6, vN ), texture2D( hatch5, vN ), 6. * shading );\n    }\n    if( shading > step && shading <= 2. * step ){\n        c = mix( texture2D( hatch5, vN ), texture2D( hatch4, vN) , 6. * ( shading - step ) );\n    }\n    if( shading > 2. * step && shading <= 3. * step ){\n        c = mix( texture2D( hatch4, vN ), texture2D( hatch3, vN ), 6. * ( shading - 2. * step ) );\n    }\n    if( shading > 3. * step && shading <= 4. * step ){\n        c = mix( texture2D( hatch3, vN ), texture2D( hatch2, vN ), 6. * ( shading - 3. * step ) );\n    }\n    if( shading > 4. * step && shading <= 5. * step ){\n        c = mix( texture2D( hatch2, vN ), texture2D( hatch1, vN ), 6. * ( shading - 4. * step ) );\n    }\n    if( shading > 5. * step ){\n        c = mix( texture2D( hatch1, vN ), vec4( 1. ), 6. * ( shading - 5. * step ) );\n    }\n\n    vec4 src = mix( mix( inkColor, vec4( 1. ), c.r ), c, .5 );\n    //c = 1. - ( 1. - src ) * ( 1. - dst );\n    //c = vec4( min( src.r, dst.r ), min( src.g, dst.g ), min( src.b, dst.b ), 1. );\n\n    //c = vec4( gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y, 0., 1. );\n\n    return src;\n}\n\nvoid main() {\n\n    vec2 nUV = vec2( mod( gl_FragCoord.x, bkgResolution.x ) / bkgResolution.x, mod( gl_FragCoord.y, bkgResolution.y ) / bkgResolution.y );\n    vec4 dst = vec4( texture2D( paper, nUV ).rgb, 1. );\n    vec4 src;\n\n    //if( showOutline == 1 ) src = .5 * inkColor;\n    //else src = shade();\n    src = ( .5 * inkColor ) * vec4( showOutline ) + vec4( 1. - showOutline ) * shade();\n\n    vec4 c = src * dst;\n\n    c *= texture2D( baked, vUv_baked );\n\n    // FOG\n\n    float depth = gl_FragCoord.z / gl_FragCoord.w;\n    float fogFactor = 0.0;\n\n    if ( fogType == 1.0 ) {\n\n    \tfogFactor = smoothstep( fogNear, fogFar, depth );\n\n    } else {\n\n    \tconst float LOG2 = 1.442695;\n    \tfloat fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );\n    \tfogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );\n\n    }\n\n    vec4 fog_color = mix( c, vec4( fogColor, gl_FragColor.w ), fogFactor );\n\n\n    gl_FragColor = vec4( fog_color.rgb, 1. );\n}";

},{}],6:[function(require,module,exports){
module.exports = "precision highp float;\nprecision highp sampler2D;\n\nuniform sampler2D uPrevPositionsMap;\nuniform sampler2D uGeomPositionsMap;\nuniform float uTime;\n\nvarying vec2 vUv;\n\nconst int OCTAVES = 8;\n\nvec4 mod289(vec4 x) {\n    vec4 r = x - floor(x * (1.0 / 289.0)) * 289.0;\n    return r;\n}\n\nfloat mod289(float x) {\n    float r = x - floor(x * (1.0 / 289.0)) * 289.0;\n    return r;\n}\n\nvec4 permute(vec4 x) {\n    vec4 r = mod289(((x*34.0)+1.0)*x);\n    return r;\n}\n\nfloat permute(float x) {\n    float r = mod289(((x*34.0)+1.0)*x);\n    return r;\n}\n\nvec4 taylorInvSqrt(vec4 r) {\n    vec4 f = 1.79284291400159 - 0.85373472095314 * r;\n    return f;\n}\n\nfloat taylorInvSqrt(float r) {\n    float f = 1.79284291400159 - 0.85373472095314 * r;\n    return f;\n}\n\nvec4 grad4(float j, vec4 ip) {\n    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);\n    vec4 p,s;\n\n    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;\n    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);\n    s = vec4(lessThan(p, vec4(0.0)));\n    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;\n\n    return p;\n}\n\nvec4 simplexNoiseDerivatives (vec4 v) {\n    const vec4  C = vec4( 0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);\n\n    vec4 i  = floor(v + dot(v, vec4(0.309016994374947451)) );\n    vec4 x0 = v -   i + dot(i, C.xxxx);\n\n    vec4 i0;\n    vec3 isX = step( x0.yzw, x0.xxx );\n    vec3 isYZ = step( x0.zww, x0.yyz );\n    i0.x = isX.x + isX.y + isX.z;\n    i0.yzw = 1.0 - isX;\n    i0.y += isYZ.x + isYZ.y;\n    i0.zw += 1.0 - isYZ.xy;\n    i0.z += isYZ.z;\n    i0.w += 1.0 - isYZ.z;\n\n    vec4 i3 = clamp( i0, 0.0, 1.0 );\n    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );\n    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );\n\n    vec4 x1 = x0 - i1 + C.xxxx;\n    vec4 x2 = x0 - i2 + C.yyyy;\n    vec4 x3 = x0 - i3 + C.zzzz;\n    vec4 x4 = x0 + C.wwww;\n\n    i = mod289(i);\n    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);\n    vec4 j1 = permute( permute( permute( permute (\n                        i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))\n                      + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))\n                      + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))\n                      + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));\n\n\n    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;\n\n    vec4 p0 = grad4(j0,   ip);\n    vec4 p1 = grad4(j1.x, ip);\n    vec4 p2 = grad4(j1.y, ip);\n    vec4 p3 = grad4(j1.z, ip);\n    vec4 p4 = grad4(j1.w, ip);\n\n    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n    p0 *= norm.x;\n    p1 *= norm.y;\n    p2 *= norm.z;\n    p3 *= norm.w;\n    p4 *= taylorInvSqrt(dot(p4,p4));\n\n    vec3 values0 = vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)); //value of contributions from each corner at point\n    vec2 values1 = vec2(dot(p3, x3), dot(p4, x4));\n\n    vec3 m0 = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0); //(0.5 - x^2) where x is the distance\n    vec2 m1 = max(0.5 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);\n\n    vec3 temp0 = -6.0 * m0 * m0 * values0;\n    vec2 temp1 = -6.0 * m1 * m1 * values1;\n\n    vec3 mmm0 = m0 * m0 * m0;\n    vec2 mmm1 = m1 * m1 * m1;\n\n    float dx = temp0[0] * x0.x + temp0[1] * x1.x + temp0[2] * x2.x + temp1[0] * x3.x + temp1[1] * x4.x + mmm0[0] * p0.x + mmm0[1] * p1.x + mmm0[2] * p2.x + mmm1[0] * p3.x + mmm1[1] * p4.x;\n    float dy = temp0[0] * x0.y + temp0[1] * x1.y + temp0[2] * x2.y + temp1[0] * x3.y + temp1[1] * x4.y + mmm0[0] * p0.y + mmm0[1] * p1.y + mmm0[2] * p2.y + mmm1[0] * p3.y + mmm1[1] * p4.y;\n    float dz = temp0[0] * x0.z + temp0[1] * x1.z + temp0[2] * x2.z + temp1[0] * x3.z + temp1[1] * x4.z + mmm0[0] * p0.z + mmm0[1] * p1.z + mmm0[2] * p2.z + mmm1[0] * p3.z + mmm1[1] * p4.z;\n    float dw = temp0[0] * x0.w + temp0[1] * x1.w + temp0[2] * x2.w + temp1[0] * x3.w + temp1[1] * x4.w + mmm0[0] * p0.w + mmm0[1] * p1.w + mmm0[2] * p2.w + mmm1[0] * p3.w + mmm1[1] * p4.w;\n\n    return vec4(dx, dy, dz, dw) * 49.0;\n}\n\nvec3 getCurlVelocity( vec4 position ) {\n\n    float NOISE_TIME_SCALE = 0.1;\n    float NOISE_SCALE = 0.02;\n    float NOISE_POSITION_SCALE = 0.0025;\n\n    vec3 oldPosition = position.rgb;\n    vec3 noisePosition = oldPosition *  NOISE_POSITION_SCALE;\n\n    float noiseTime = NOISE_TIME_SCALE;\n\n    vec4 xNoisePotentialDerivatives = vec4(0.0);\n    vec4 yNoisePotentialDerivatives = vec4(0.0);\n    vec4 zNoisePotentialDerivatives = vec4(0.0);\n\n    float persistence = 0.54;\n\n    for (int i = 0; i < OCTAVES; ++i) {\n        float scale = (1.0 / 2.0) * pow(2.0, float(i));\n\n        float noiseScale = pow(persistence, float(i));\n\n        xNoisePotentialDerivatives += simplexNoiseDerivatives(vec4(noisePosition * pow(2.0, float(i)), noiseTime)) * noiseScale * scale;\n        yNoisePotentialDerivatives += simplexNoiseDerivatives(vec4((noisePosition + vec3(123.4, 129845.6, -1239.1)) * pow(2.0, float(i)), noiseTime)) * noiseScale * scale;\n        zNoisePotentialDerivatives += simplexNoiseDerivatives(vec4((noisePosition + vec3(-9519.0, 9051.0, -123.0)) * pow(2.0, float(i)), noiseTime)) * noiseScale * scale;\n    }\n\n    //compute curl\n    vec3 noiseVelocity = vec3(\n                              zNoisePotentialDerivatives[1] - yNoisePotentialDerivatives[2],\n                              xNoisePotentialDerivatives[2] - zNoisePotentialDerivatives[0],\n                              yNoisePotentialDerivatives[0] - xNoisePotentialDerivatives[1]\n                              ) * NOISE_SCALE;\n    return noiseVelocity;\n}\n\nvoid main () {\n\n    vec2 uv = vUv;\n\n    vec4 geomPositions = texture2D(uGeomPositionsMap, uv);\n    vec4 data = texture2D(uPrevPositionsMap, uv);\n\n    vec3 noiseVelocity = getCurlVelocity( data );\n\n    vec3 vel = noiseVelocity;\n    vec3 dir = vec3( uTime * 0.1, -0.10, 0.0 );\n    vec3 newPosition = ( data.rgb + vel + dir );\n\n    if( newPosition.y < -150.5 || newPosition.y > 150.0 || newPosition.x < -150.0 || newPosition.x > 150.0 || newPosition.z < -150.0 || newPosition.z > 150.0) newPosition = geomPositions.rgb;\n\n    gl_FragColor = vec4(newPosition, 1.0);\n}\n";

},{}],7:[function(require,module,exports){
module.exports = "precision highp float;\nprecision highp sampler2D;\n\nattribute vec2 aV2I;\n\nuniform highp sampler2D uPositionsT;\n\nvarying float vColor;\n\nvoid main()\t{\n\n    vec2 ind = aV2I;\n    vec4 pos = vec4(texture2D( uPositionsT, ind ).rgb, 1.0) ;\n    \n    vec4 mvPosition = modelViewMatrix * pos;\n    vColor = texture2D( uPositionsT, ind ).a;\n    float incrementSize = (1.0 - clamp(vColor, 0.0, 1.0)) * 5.0;\n\n    gl_PointSize = pow( min( 150.0, .1 * ( 150.0 / length( mvPosition.xyz ) ) ), 2.0 ) + 5.0;\n    gl_Position = projectionMatrix * modelViewMatrix * pos;\n}";

},{}],8:[function(require,module,exports){
module.exports = "precision highp float;\nprecision highp sampler2D;\n\nattribute vec2 aV2I;\n\nuniform float uGeomToDraw;\n\nvarying vec3 vPos;\n\nvoid main() {\n\n    vec4 gridPos = vec4(2.0 * aV2I - vec2(1.0), 0.0, 1.0);\n\n    if( uGeomToDraw == 0.0 ) vPos = gridPos.rgb;\n    if( uGeomToDraw == 1.0 ) vPos = position;\n\n    gl_PointSize = 1.0;\n    gl_Position = gridPos;\n}\n";

},{}],9:[function(require,module,exports){
module.exports = "varying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec2 vUv_baked;\nvarying float depth;\nvarying vec3 vPosition;\nvarying float nDotVP;\nvarying vec3 pos;\nvarying vec2 vN;\n\nuniform vec2 repeat;\nuniform vec3 lightPosition;\nuniform float showOutline;\nuniform mat4 fixedMatrix;\n\nvoid main() {\n\n    float w = 1.;\n    vec3 posInc = vec3( 0. );\n    if( showOutline == 1. ) posInc = w * normal;\n\n\n\n    vUv = repeat * uv;\n    vUv_baked = uv;\n\n    vec4 mvPosition = modelViewMatrix * vec4( position + posInc, 1.0 );\n    vPosition = mvPosition.xyz;\n    gl_Position = projectionMatrix * mvPosition;\n    pos = gl_Position.xyz;\n\n    vNormal = normalMatrix * normal;\n    depth = ( length( position.xyz ) / 90. );\n    depth = .5 + .5 * depth;\n\n    nDotVP = max( 0., dot( vNormal, normalize( vec3( lightPosition ) ) ) );\n\n    mat4 fixed_m = fixedMatrix;\n    mat3 m3 = mat3(1., 2.,  3., 4., 3., 4.,  3., 4., 0.);\n    vec3 e = normalize( vec3( fixed_m * vec4( position, 1.0 ) ) );\n    vec3 n = normalize( m3 * normal );\n    vec3 r = reflect( e, n );\n    float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );\n    vN = (r.xy / m + .5 ) * repeat;\n\n}";

},{}],10:[function(require,module,exports){
module.exports = "varying vec2 vUv;\n\nvoid main() {\n\n    vUv = uv;\n\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    gl_Position = projectionMatrix * mvPosition;\n}";

},{}],11:[function(require,module,exports){
module.exports = "varying vec2 vUv;\nvoid main() {\n    vUv = uv;\n    gl_Position = vec4( position, 1.0 );\n}";

},{}],12:[function(require,module,exports){
/**
 * Created by felixmorenomartinez on 11/01/15.
 */

'use strict';

var View = require('./view/View');
var Socket = require('./socket/Socket');

var Main = function () {

    this.socket = null;
    this.view = null;
};

Main.prototype.startApp = function () {

    this.socket = new Socket();
    this.view = new View(this.socket);
    this.init();

};

Main.prototype.init = function (e) {

    var el = window;
    el.addEventListener('resize', this.onResize.bind(this));
    this.view.init();

};

Main.prototype.onResize = function (e) {

    this.view.resize(window.innerWidth, window.innerHeight);

};

module.exports = Main;
},{"./socket/Socket":20,"./view/View":34}],13:[function(require,module,exports){
/**
 * Created by siroko on 12/13/15.
 */
var Main = require('./Main.js');

window.DEBUG_MODE  = false;
window.IS_DESKTOP  = false;
window.NO_HATCHING = false;

var ua = navigator.userAgent.toLowerCase();
window.isGenericAndroid = (ua.indexOf("android") > -1);
window.isAndroid = (ua.indexOf("nexus 5") > -1) || (ua.indexOf("nexus 4") > -1) || (ua.indexOf("gt-i9505") > -1) || (ua.indexOf("gt-i9300") > -1) || (ua.indexOf("gt-n7100") > -1) || (ua.indexOf("sm-n900t") > -1);
//window.isAndroid = true;
var getQueryParams = function ( qs ) {

    qs = qs.split("+").join(" ");

    var params  = {},
        tokens  = null,
        re      = /[?&]?([^=]+)=([^&]*)/g;

    while ( tokens = re.exec( qs ) ) {

        params[ decodeURIComponent( tokens[ 1 ] ) ] = decodeURIComponent( tokens[ 2 ] );
    }

    return params;
}

var params = getQueryParams( document.location.search );
window.IS_DESKTOP = typeof params.desktop !== 'undefined';
window.NO_HATCHING = typeof params.noHatching !== 'undefined';

window.app = new Main();
},{"./Main.js":12}],14:[function(require,module,exports){
'use strict';

// ------------------------------------------
// Audio.js
// ------------------------------------------
//
// Sound controller using Howler.js
// https://github.com/goldfire/howler.js/
//
// ------------------------------------------

var Audio = function ( opts ) {

    THREE.EventDispatcher.call( this );

    this.view           = opts.view;
    this.callback       = opts.callback || function () {};

    this.toggleAudioEl  = null;
    this.isPlaying      = false;
    this.loadedSounds   = 0;
    this.totalSounds    = 2;
    this.sounds         = {

        music   : {

            url     : 'assets/audio/music-xmas.mp3',
            loop    : true,
            volume  : 0.8,
            howl    : null,
            type    : 'MUSIC'
        },

        fx1    : {

            url     : 'assets/audio/fx1.mp3',
            loop    : false,
            howl    : null,
            type    : 'FX',
            volume  : 0.5
        },

        fx2    : {

            url     : 'assets/audio/fx2.mp3',
            loop    : false,
            howl    : null,
            type    : 'FX',
            volume  : 0.8
        }
    };

    this.init();
};

Audio.prototype = Object.create( THREE.EventDispatcher.prototype );


Audio.prototype.init = function () {

    this.toggleAudioEl  = document.querySelector( '#audio-toggle' );
    this.createSounds();
};

Audio.prototype.createSounds = function () {

    for ( var soundName in this.sounds ) {

        var sound = this.sounds[ soundName ];
        sound.howl = new Howl( {

            urls    : [ sound.url ],
            loop    : sound.loop,
            volume  : sound.volume || 1.0,
            onload  : ( sound.type === 'MUSIC' )? this.loadedMusic.bind( this ) : this.loadedSound.bind( this )

        } );
    }
};


// Preload
// ---------------------------------------------------

Audio.prototype.loadedSound = function () {

    this.loadedSounds++;
    if ( this.loadedSounds === this.totalSounds ) this.onLoadedSounds();
};

Audio.prototype.onLoadedSounds = function () {

    this.callback();
};

Audio.prototype.loadedMusic = function () {

    this.showEl();
    this.addEventListeners();
    this.playEl();

    this.dispatchEvent( { type: 'loaded' } );
};


// Fade in / out general volume
// ---------------------------------------------------

Audio.prototype.fadeInVolume = function () {

    this.fadeVolume( 1.0, 2.0 );
};

Audio.prototype.fadeOutVolume = function () {

    this.fadeVolumeTo( 0.0, 1.0 );
};

Audio.prototype.fadeVolumeTo = function ( volumeEnd, duration ) {

    var soundRange      = { volume : Howler.volume() },
        durationFade    = duration || 1.0;

    TweenMax.to( soundRange, durationFade, {

        volume      : volumeEnd,
        ease        : Power2.easeOut,
        onUpdate    : ( function () {

            Howler.volume( soundRange.volume );

        } ).bind( this )
    } );
};


// Specific sound API
// ---------------------------------------------------

Audio.prototype.playBackgroundMusic = function () {

    this.sounds.music.howl.fadeIn( this.sounds.music.volume, 2000 );
};

Audio.prototype.pauseBackgroundMusic = function () {

    this.sounds.music.howl.fadeOut( 0.0, 1000 );
};

Audio.prototype.playFx = function ( numFx ) {

    this.sounds[ 'fx' + numFx ].howl.play();
};


// Events
// ---------------------------------------------------

Audio.prototype.addEventListeners = function () {

    this.toggleAudioEl.addEventListener( 'click', this.onClickToggle.bind( this ), false );
};

Audio.prototype.onClickToggle = function ( event ) {

    event.preventDefault();

    if ( !this.isPlaying ) this.playEl();
    else this.pauseEl();
};


// Dom element
// ---------------------------------------------------

Audio.prototype.showEl = function () {

    this.toggleAudioEl.classList.add( 'visible' );
};

Audio.prototype.playEl = function () {

    this.isPlaying = true;
    this.playBackgroundMusic();
    this.toggleAudioEl.classList.add( 'playing' );
};

Audio.prototype.pauseEl = function () {

    this.isPlaying = false;
    this.pauseBackgroundMusic();
    this.toggleAudioEl.classList.remove( 'playing' );
};

module.exports = Audio;
},{}],15:[function(require,module,exports){
'use strict';

var PathType = require('./PathType');
var DirectionPoint = require('../ui/DirectionPoint');

// Path
// ------------------------------------------------------------
// A segment of 2+ points where the user moves at a
// constant speed.
// It contains a start and end point where we will create
// a couple of DirectPoints to use them as triggers to
// move through the path.
// ------------------------------------------------------------

var Path = function (view, points, type) {

    THREE.EventDispatcher.call(this);

    this.view = view;
    this.type = ( type ) ? type : PathType.PATH;
    this.mesh = null;

    this.points = points;
    this.startPoint = this.points[0];
    this.endPoint = this.points[this.points.length - 1];

    this.startDirectionPoint = null;
    this.endDirectionPoint = null;
    this.directionPoints = [];
    this.DIRECTION_POINT_OFFSET = 5;

    this.distances = [];
    this.totalDistance = 0;
    this.times = [];
    this.totalTime = 0;
    this.TIME_PER_UNIT = 0.1;

    this.timeline = null;
    this.direction = null;

    this.debug = false;
    this.msgNoVREl = document.getElementById('auto-camera');

    this.init();
};

Path.prototype = Object.create(THREE.EventDispatcher.prototype);


// Initialization
// ------------------------------------------------------------

Path.prototype.init = function () {

    this.totalDistance = this.getTotalDistance();
    this.totalTime = this.totalDistance * this.TIME_PER_UNIT;
    this.createTimeline();

    this.createDirectionPoints();
    this.createMesh();
};

Path.prototype.createMesh = function () {

    var geometry = new THREE.Geometry();

    for (var i = 0; i < this.points.length; i++) {

        var point = ( i === 0 ) ? this.startDirectionPoint.position :
            ( i === this.points.length - 1 ) ? this.endDirectionPoint.position :
                this.points[i];

        geometry.vertices.push(point);
    }

    var material = new THREE.LineBasicMaterial({color: Math.random() * 0xffffff, linewidth: 4});

    this.mesh = new THREE.Line(geometry, material);
    this.mesh.userData.noIntersection = true;

    if (this.debug) this.view.container.add(this.mesh);
};

Path.prototype.createDirectionPoints = function () {

    // the start & end points are offsetted DIRECTION_POINT_OFFSET units in the direction of the line

    var startToEnd = ( this.points[1].clone().sub(this.startPoint.clone()) ).normalize().multiplyScalar(this.DIRECTION_POINT_OFFSET),
        startDP = this.startPoint.clone().add(startToEnd),
        endToStart = ( this.points[this.points.length - 2].clone().sub(this.endPoint.clone()) ).normalize().multiplyScalar(this.DIRECTION_POINT_OFFSET),
        endDP = this.endPoint.clone().add(endToStart);

    this.startDirectionPoint = new DirectionPoint(this.view.container, startDP, this, startToEnd);
    this.endDirectionPoint = new DirectionPoint(this.view.container, endDP, this, endToStart);

    this.directionPoints.push(this.startDirectionPoint);
    this.directionPoints.push(this.endDirectionPoint);
};


// Add / remove from scene
// ------------------------------------------------------------

Path.prototype.addInScene = function () {

    if (this.debug) this.view.container.add(this.mesh);

    this.startDirectionPoint.addInScene();
    this.endDirectionPoint.addInScene();
};

Path.prototype.removeFromScene = function () {

    if (this.debug) this.view.container.remove(this.mesh);

    this.startDirectionPoint.removeFromScene();
    this.endDirectionPoint.removeFromScene();
};


// Enable / disable
// ------------------------------------------------------------

Path.prototype.enable = function (directionPoint) {


};

Path.prototype.disable = function (directionPoint) {

};


// Move in path
// ------------------------------------------------------------

Path.prototype.createTimeline = function () {

    var cameraPosition = this.view.camera.position.clone();

    this.timeline = new TimelineMax({paused: true});

    for (var i = 0; i < ( this.points.length - 1 ); i++) {

        var tween = TweenMax.fromTo(this.view.camera.position, this.times[i], {

            x: this.points[i].x,
            y: this.points[i].y,
            z: this.points[i].z
        }, {

            x: this.points[i + 1].x,
            y: this.points[i + 1].y,
            z: this.points[i + 1].z,
            ease: Linear.easeNone
        });

        this.timeline.add(tween);

        TweenMax.set(this.view.camera.position, {

            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z
        });
    }
};

Path.prototype.onStartMovement = function (point) {

    this.dispatchEvent({type: 'pathStart', path: this, directionPoint: point});
};

Path.prototype.onCompleteMovement = function () {

    if (!this.view.isVR) {

        TweenMax.to(this.view.controls.target, 0.5, {

            x: this.view.camera.position.x + this.direction.x * 0.5,
            y: this.view.camera.position.y + this.direction.y * 0.5,
            z: this.view.camera.position.z + this.direction.z * 0.5,
            ease: Linear.none,
            onComplete: ( function () {

                this.view.controls.enabled = true;
                this.msgNoVREl.classList.remove('active');

                this.dispatchEvent({type: 'pathEnd', path: this});

            } ).bind(this)
        });

    } else {

        setTimeout(( function () {

            this.dispatchEvent({type: 'pathEnd', path: this});

        } ).bind(this), 500);
    }
};

Path.prototype.moveInPathFrom = function (point) {

    this.onStartMovement(point);

    var startPercentage = ( point === this.startDirectionPoint ) ? 0 : 1,
        endPercentage = ( point === this.startDirectionPoint ) ? 1 : 0;

    if (!this.view.isVR) {

        this.view.controls.enabled = false;
        this.msgNoVREl.classList.add('active');

        TweenMax.to(this.view.controls.target, 1.0, {

            x: point.mesh.position.x,
            y: point.mesh.position.y,
            z: point.mesh.position.z,
            ease: Power2.easeInOut,
            onComplete: ( function () {

                this.movePath(startPercentage, endPercentage, this.onCompleteMovement.bind(this));

            } ).bind(this)
        });

    } else {

        setTimeout(( function () {

            this.movePath(startPercentage, endPercentage, this.onCompleteMovement.bind(this));

        } ).bind(this), 500);
    }

    setTimeout(( function () {
        this.view.audio.playFx(2);
    } ).bind(this), 1000);
};

Path.prototype.movePath = function (startPercentage, endPercentage, onComplete) {

    var previousPoint = ( this.view.isVR ) ? null : null,
        onUpdateNoVR = function () {

            if ( previousPoint !== null ) {

                this.direction = this.view.camera.position.clone().sub(previousPoint).normalize();
                var direction = this.direction.clone().multiplyScalar(5);

                this.view.controls.target.x += ( ( this.view.camera.position.x + direction.x ) - this.view.controls.target.x ) / 10;
                this.view.controls.target.y += ( ( this.view.camera.position.y + direction.y ) - this.view.controls.target.y ) / 10;
                this.view.controls.target.z += ( ( this.view.camera.position.z + direction.z ) - this.view.controls.target.z ) / 10;
            }

            previousPoint = this.view.camera.position.clone();
        },
        onUpdate = ( this.view.isVR ) ? function () {
        } : onUpdateNoVR;

    var startTime = ( startPercentage === 0 ) ? 0 : this.totalTime,
        endTime = ( startPercentage === 0 ) ? this.totalTime : 0;

    this.timeline.tweenFromTo(startTime, endTime, {

        ease: Linear.none,
        onUpdate: onUpdate.bind(this),
        onComplete: onComplete
        //,delay: 0.15
    });
};


// Distance check
// ------------------------------------------------------------

Path.prototype.isCloseToUser = function (userPosition, maxDistance) {

    if (this.isCloseToStart(userPosition, maxDistance)) {

        return {path: this, directionPoint: this.startDirectionPoint};

    } else if (this.isCloseToEnd(userPosition, maxDistance)) {

        return {path: this, directionPoint: this.endDirectionPoint};
    }

    return false;
};

Path.prototype.isCloseToStart = function (userPosition, maxDistance) {

    var distance = this.getDistanceFromTo(userPosition, this.startDirectionPoint.position);

    return ( distance < maxDistance );
};

Path.prototype.isCloseToEnd = function (userPosition, maxDistance) {

    var distance = this.getDistanceFromTo(userPosition, this.endDirectionPoint.position);

    return ( distance < maxDistance );
};

Path.prototype.getTotalDistance = function () {

    var distance = 0;

    for (var i = 0; i < ( this.points.length - 1 ); i++) {

        this.distances[i] = this.getDistanceFromTo(this.points[i], this.points[i + 1]);
        distance += this.distances[i];

        this.times[i] = this.distances[i] * this.TIME_PER_UNIT;
    }

    return distance;
};

Path.prototype.getDistanceFromTo = function (v1, v2) {

    var dx = v1.x - v2.x,
        dy = v1.y - v2.y,
        dz = v1.z - v2.z;

    return Math.sqrt(( dx * dx ) + ( dy * dy ) + ( dz * dz ));
};

module.exports = Path;
},{"../ui/DirectionPoint":22,"./PathType":16}],16:[function(require,module,exports){
'use strict';


// PathType
// ------------------------------------------------------------
// Types of path
// ------------------------------------------------------------

var PathType = {

    PATH: 'PATH',
    PATH_PORTAL: 'PATH_PORTAL'
};


module.exports = PathType;
},{}],17:[function(require,module,exports){
'use strict';

var PathType = require('./PathType');
var Path = require('./Path');
var PortalPath = require('./PortalPath');

// Paths
// ------------------------------------------------------------
// Collection of path elements
// ------------------------------------------------------------

var Paths = function (view, directionHelper, pathsData, pathsIndex) {

    this.view = view;
    this.directionHelper = directionHelper;
    this.currentPathsData = pathsData;
    this.currentPathsIndex = pathsIndex;
    this.totalPaths = [];
    this.totalPortalPaths = [];
    this.paths = [];
    this.portalPaths = [];
    this.activePaths = [];

    this.MAX_DISTANCE = 20;

    this._bindedMethods = {

        onPathStart: this._onPathStart.bind(this),
        onPathEnd: this._onPathEnd.bind(this)
    }

    this.init();
};


// Initialization
// ------------------------------------------------------------

Paths.prototype.init = function () {

    this.createPaths();

    // Get a random position from the paths and position the user there
    this.getRandomPosition();
};

Paths.prototype.createPaths = function () {

    var i;

    for (i = 0; i <= this.currentPathsIndex; i++) {

        if (this.totalPaths.length < ( i + 1 )) {

            this.totalPaths[i] = [];
            this.totalPortalPaths[i] = [];
        }
    }

    if (this.totalPaths[this.currentPathsIndex].length === 0) {

        for (i = 0; i < this.currentPathsData.length; i++) {

            var path = ( this.currentPathsData[i].type === PathType.PATH ) ?
                new Path(this.view, this.currentPathsData[i].points) :
                new PortalPath(this.view, this.currentPathsData[i].points);

            this.totalPaths[this.currentPathsIndex].push(path);
            if (this.currentPathsData[i].type === PathType.PATH_PORTAL) this.totalPortalPaths[this.currentPathsIndex].push(path);
        }

    }

    this.paths = this.totalPaths[this.currentPathsIndex];
    this.portalPaths = this.totalPortalPaths[this.currentPathsIndex];

    this.addPaths();
};

Paths.prototype.addPaths = function () {

    for (var i = 0; i < this.paths.length; i++) {

        var path = this.paths[i];
        path.addInScene();
    }
};

Paths.prototype.removePaths = function () {

    for (var i = 0; i < this.paths.length; i++) {

        var path = this.paths[i];
        path.removeFromScene();
    }
};


// Show / Hide paths
// ------------------------------------------------------------

Paths.prototype.showPaths = function () {

    this.activePaths = [];
    this.getActivePaths();
    this.enableActivePaths();
};

Paths.prototype.hidePaths = function () {

    this.disableActivePaths();
    this.activePaths = [];
};

Paths.prototype.getActivePaths = function () {

    // Based on the current position of the user, a path is active
    // when the distance to the user is less than MAX_DISTANCE

    var currentPosition = this.view.camera.position;

    for (var i = 0; i < this.paths.length; i++) {

        var activePath = this.paths[i].isCloseToUser(currentPosition, this.MAX_DISTANCE);
        if (activePath !== false) {

            this.activePaths.push(activePath);
        }
    }
};

Paths.prototype.enableActivePaths = function () {

    for (var i = 0; i < this.activePaths.length; i++) {

        this.directionHelper.addActivePoint(this.activePaths[i].directionPoint);
        this.activePaths[i].path.enable(this.activePaths[i].directionPoint);
        this.activePaths[i].path.addEventListener('pathStart', this._bindedMethods.onPathStart);
    }
};

Paths.prototype.disableActivePaths = function () {

    for (var i = 0; i < this.activePaths.length; i++) {

        this.directionHelper.removeActivePoint(this.activePaths[i].directionPoint);
        this.activePaths[i].path.disable(this.activePaths[i].directionPoint);
        this.activePaths[i].path.removeEventListener('pathStart', this._bindedMethods.onPathStart);
    }
};


// Events
// ------------------------------------------------------------

Paths.prototype._onPathStart = function (event) {

    event.path.addEventListener('pathEnd', this._bindedMethods.onPathEnd);
    this.hidePaths();
};

Paths.prototype._onPathEnd = function (event) {

    event.path.removeEventListener('pathEnd', this._bindedMethods.onPathEnd);
    this.showPaths();
};


// Update paths
// ------------------------------------------------------------

Paths.prototype.updatePaths = function (newPathsData, newPathsIndex) {

    this.hidePaths();
    this.removePaths();

    this.currentPathsData = newPathsData;
    this.currentPathsIndex = newPathsIndex;
    this.createPaths();
};


// Getters
// ------------------------------------------------------------

Paths.prototype.getRandomPosition = function () {

    // Choose a random point from the paths
    var randomPath = this.getRandomPath(),
        isStartPoint = ( Math.random() <= 0.5 ),
        position = ( isStartPoint ) ? randomPath.startPoint : randomPath.endPoint,
        positionNext = ( isStartPoint ) ? randomPath.points[1] : randomPath.points[randomPath.points.length - 2],
        target = position.clone();

    var direction = positionNext.clone().sub(position.clone()).normalize().multiplyScalar(0.1);
    target.x += direction.x;
    target.y = position.y;
    target.z = position.z;

    // Apply it to the camera
    this.view.updateUserPosition(position, target);

    // Now show the paths close to the user
    setTimeout( this.showPaths.bind(this), 1000 );
};

Paths.prototype.getRandomPath = function () {

    // Make sure that the random path is not a portal

    var randomIndex = THREE.Math.randInt(0, this.paths.length - 1);
    var randomPath = this.paths[randomIndex];

    while (randomPath.type !== PathType.PATH) {

        randomIndex = THREE.Math.randInt(0, this.paths.length - 1);
        randomPath = this.paths[randomIndex];
    }

    return randomPath;
};

Paths.prototype.getRandomPortalPath = function (portalPath) {

    // Get a random portal path that is different from portalPath ( parameter )

    var availablePortals = [];

    for (var i = 0; i < this.portalPaths.length; i++) {

        if (this.portalPaths[i] !== portalPath) availablePortals.push(this.portalPaths[i]);
    }

    var randomIndex = THREE.Math.randInt(0, availablePortals.length - 1);
    var randomPortalPath = availablePortals[randomIndex];

    return randomPortalPath;
};

module.exports = Paths;
},{"./Path":15,"./PathType":16,"./PortalPath":18}],18:[function(require,module,exports){
'use strict';

var PathType = require('./PathType');
var Path = require('./Path');
var DirectionPoint = require('../ui/DirectionPoint');

// PortalPath
// ------------------------------------------------------------
// A specialized kind of Path ( inherits )
// It moves you from one point in space to another.
// ------------------------------------------------------------

var PortalPath = function (view, points) {

    Path.call(this, view, points, PathType.PATH_PORTAL);

    this.type = PathType.PATH_PORTAL;
    this.TIME_PER_UNIT = 0.05;
    this.totalTime = this.totalDistance * this.TIME_PER_UNIT;
};

PortalPath.prototype = Object.create(Path.prototype);


// Overrided behaviour
// ------------------------------------------------------------

PortalPath.prototype.onStartMovement = function (point) {

    setTimeout(( function () {
        this.view.audio.playFx(1);
    } ).bind(this), 1000);

    this.dispatchEvent({type: 'pathStart', path: this, directionPoint: point});

    TweenMax.to(this.view.scene.fog, 1.5, {

        far: 0.1,
        ease: Power2.easeInOut
    });
};

PortalPath.prototype.onCompleteMovement = function () {

    // At the end of the movement, choose another portal
    // from a random plane and enter through it

    setTimeout(( function () {
        this.view.audio.playFx(1);
    } ).bind(this), 350);

    this.view.planesController.setRandomPlane();
    this.view.paths.updatePaths(this.view.planesController.getCurrentPaths(), this.view.planesController.getCurrentIndex());

    var newPath = this.view.paths.getRandomPortalPath(this);
    newPath.movePath(1, 0, ( function () {

        this.onCompleteMovementRegular(newPath);

    } ).bind(this));

    TweenMax.to(this.view.scene.fog, 2.0, {

        far: this.view.FOG_FAR,
        ease: Power2.easeInOut
    });
};

Path.prototype.onCompleteMovementRegular = function (newPath) {

    if (!this.view.isVR) {

        TweenMax.to(this.view.controls.target, 0.5, {

            x: this.view.camera.position.x + newPath.direction.x * 0.5,
            y: this.view.camera.position.y + newPath.direction.y * 0.5,
            z: this.view.camera.position.z + newPath.direction.z * 0.5,
            ease: Linear.none,
            onComplete: ( function () {

                this.view.controls.enabled = true;
                this.msgNoVREl.classList.remove('active');

                this.dispatchEvent({type: 'pathEnd', path: this});

            } ).bind(this)
        });

    } else {

        setTimeout(( function () {

            this.dispatchEvent({type: 'pathEnd', path: this});

        } ).bind(this), 500);
    }
};

module.exports = PortalPath;
},{"../ui/DirectionPoint":22,"./Path":15,"./PathType":16}],19:[function(require,module,exports){
'use strict';

var GardlandView = require('./../view/GarlandView');

// PortalRTT
// ------------------------------------------------------------
// Render to target portal.
// When we are in front of a portal, we will render the
// arrival destination in a circle.
// ------------------------------------------------------------

var PortalRTT = function (view) {

    this.view = view;

    this.rttCamera = null;
    this.renderTarget = null;
    this.geometry = null;
    this.material = null;
    this.geometryBG = null;
    this.materialBG = null;
    this.container = null;
    this.plane = null;
    this.planeBg = null;

    this.init();
};


// Initialization
// ------------------------------------------------------------

PortalRTT.prototype.init = function () {

    // Camera
    this.rttCamera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
    this.view.scene.add(this.rttCamera);

    // Container
    this.container = new THREE.Object3D();
    this.container.visible = false;
    this.view.scene.add(this.container);

    // Plane with a white solid background
    this.geometryBG = new THREE.CircleGeometry(2.5, 60);
    this.materialBG = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
    });
    this.planeBg = new THREE.Mesh(this.geometryBG, this.materialBG);
    this.planeBg.position.z = -0.01;
    this.container.add(this.planeBg);

    // Plane with the texture of the renderTarget
    this.geometry = new THREE.CircleGeometry(2.4, 60);
    this.renderTarget = new THREE.WebGLRenderTarget(512, 512, {format: THREE.RGBFormat});
    this.material = new THREE.MeshBasicMaterial({map: this.renderTarget, transparent: true, opacity: 0});
    this.plane = new THREE.Mesh(this.geometry, this.material);

    // Garland
    //GardlandView.init(this.view.scene, true);
    GardlandView.init(this.container, true);

    this.container.add(this.plane);
};

PortalRTT.prototype.randomizeCameraPosition = function () {

    // The bounding cube has an aprox size of 160

    this.rttCamera.position.x = THREE.Math.randInt(-80, 80);
    this.rttCamera.position.y = THREE.Math.randInt(-80, 80);
    this.rttCamera.position.z = THREE.Math.randInt(-80, 80);
};


// Update
// ------------------------------------------------------------

PortalRTT.prototype.update = function () {

    if (!this.container.visible) return;

    // The camera looks at the same direction that the real camera is looking at

    var cameraVector = new THREE.Vector3(0, 0, -1);
    cameraVector.applyQuaternion(this.view.camera.quaternion);

    var lookAtVector = this.rttCamera.position.clone().add(cameraVector);

   this.rttCamera.lookAt(lookAtVector);

    // Face the camera
    this.container.quaternion.copy(this.view.camera.quaternion);
};


// Render
// ------------------------------------------------------------

PortalRTT.prototype.render = function () {

    if (!this.container.visible) return;

    this.container.visible = false;
    if( !this.rendered ){
        this.view.renderer.render(this.view.scene, this.rttCamera, this.renderTarget, true);
        if( window.isAndroid ) this.rendered = true;
    }
    this.container.visible = true;
};


// Show / hide
// ------------------------------------------------------------

PortalRTT.prototype.show = function (position) {

    this.randomizeCameraPosition();

    this.container.position.copy(position);
    this.container.visible = true;
    TweenMax.to(this.material, 1.0, {

        opacity: 1,
        ease: Power2.easeInOut
    });
    TweenMax.to(this.materialBG, 1.0, {

        opacity: 1,
        ease: Power2.easeInOut
    });

    GardlandView.show();

    this.rendered = false;
};

PortalRTT.prototype.hide = function (position) {

    TweenMax.to(this.material, 0.5, {

        opacity: 0,
        ease: Power2.easeInOut,
        delay: 0.75,
        onComplete: ( function () {

            this.container.visible = false;

        } ).bind(this)
    });
    TweenMax.to(this.materialBG, 0.5, {

        opacity: 0,
        ease: Power2.easeInOut,
        delay: 0.75
    });

    GardlandView.hide();

};

module.exports = PortalRTT;
},{"./../view/GarlandView":28}],20:[function(require,module,exports){
/**
 * Created by felixmorenomartinez on 03/02/15.
 */

'use strict';

var Socket = function () {

    THREE.EventDispatcher.call(this);

    //this.init();

    this.uid = null;
    this.name = '#ffffff';
};

Socket.prototype = Object.create(THREE.EventDispatcher.prototype);

Socket.prototype.init = function () {

    //this.socket = io('http://nodejs-vrsocket.rhcloud.com:8000');
    this.socket = io('46.101.79.115:8080', { transports: [ 'websocket' ] });

    this.socket.on('onConnect', this.onConnect.bind(this));
    this.socket.on('addChar', this.onAddChar.bind(this));
    this.socket.on('removeChar', this.onRemoveChar.bind(this));
    this.socket.on('updateClientData', this.onReceiveUsersData.bind(this));

    this.socket.on('event', function (data) {
        console.log(data)
    });
    this.socket.on('disconnect', function () {
        console.log('disconnected')
    });
};

Socket.prototype.onAddChar = function (data) {

    //console.log( 'onAddChar ', data );

    this.dispatchEvent({type: 'addChar', userAdded: data.userAdded, users: data.users});
};

Socket.prototype.onRemoveChar = function (data) {

    //console.log( 'removeChar ', data );

    this.dispatchEvent({type: 'removeChar', id: data.id});
};

Socket.prototype.onReceiveUsersData = function (data) {

    //console.log( 'updateUserSData ', data );

    this.dispatchEvent({type: 'updateUsersData', data: data });
};

Socket.prototype.onConnect = function (id) {

    //console.log('onConnect');

    this.uid = id;
    this.socket.emit('onJoinRoom', {
        room: 'lobby',
        uid: this.uid,
        name: this.name,
        image: 'http://google.com'
    });
};

Socket.prototype.join = function (data) {

    //console.log('onJoinRoom');

    this.name = data.username;
    this.socket.emit('onJoinRoom', {
        room: 'lobby',
        uid: this.uid,
        name: this.name,
        image: 'http://google.com'
    });
};

Socket.prototype.refreshUserData = function (data) {

    //console.log('refreshUserData');

    //var d = JSON.stringify( data );
    this.socket.emit('updateUserData', data);
}

module.exports = Socket;
},{}],21:[function(require,module,exports){
"use strict"
var DirectionPoint = require('./DirectionPoint');

var DirectionHelper = function (scene) {

    this.scene = scene;
    this.directionPoints = [];
    this.directionPointsAll = [];

    this.init();
};


// Initialization
// ------------------------------------------------------------

DirectionHelper.prototype.init = function () {

    // Simple... is a helper!
};


// Activate / Deactivate
// ------------------------------------------------------------

DirectionHelper.prototype.activatePoints = function (directionPoints) {

    if (this.directionPoints.length > 0) {

        this.deactivatePoints();
    }

    // Add new set of points

    this.directionPoints = directionPoints;
    for (var i = 0; i < this.directionPoints.length; i++) {

        this.directionPoints[i].enable();
    }
};

DirectionHelper.prototype.deactivatePoints = function () {

    for (var i = 0; i < this.directionPoints.length; i++) {

        this.directionPoints[i].disable();
    }
    this.directionPoints = [];
};

DirectionHelper.prototype.addActivePoint = function (directionPoint) {

    directionPoint.enable();
    this.directionPoints.push(directionPoint);
    this.addPermanentPoint(directionPoint);
};

DirectionHelper.prototype.removeActivePoint = function (directionPoint) {

    directionPoint.disable();

    var index = -1;
    for (var i = 0; i < this.directionPoints.length; i++) {

        if (this.directionPoints[i] === directionPoint) {

            index = i;
            break;
        }
    }

    if (index > -1) this.directionPoints.splice(index, 1);
};

DirectionHelper.prototype.addPermanentPoint = function (directionPoint) {

    var isInArray = false;

    for (var i = 0; i < this.directionPointsAll.length; i++) {

        if (this.directionPointsAll[i] === directionPoint) {

            isInArray = true;
            break;
        }
    }

    if (!isInArray) {

        this.directionPointsAll.push(directionPoint);
    }
};


// Update
// ------------------------------------------------------------

DirectionHelper.prototype.update = function (camera, raycaster) {

    // Vector with the direction of the camera

    var vector = new THREE.Vector3(0, 0, -1);
    vector.applyQuaternion(camera.quaternion);

    // Calculate intersection of a ray from the direction of the camera

    raycaster.set(camera.position, vector.normalize());
    var intersects = raycaster.intersectObjects(this.scene.children, true);

    var i;

    for (i = 0; i < this.directionPoints.length; i++) {

        var directionPoint = this.directionPoints[i],
            directionMesh = directionPoint.mesh,
            isInFront = false;

        if (intersects.length > 0) {

            var isFirstIntersection = intersects[0].object === directionMesh,
                isFirstIntersectionAfterLine = ( intersects.length > 1 && intersects[0].object.userData.noIntersection && intersects[1].object === directionMesh );

            if (isFirstIntersection || isFirstIntersectionAfterLine) {

                isInFront = true;
            }
        }

        if (isInFront) directionPoint.activate();
        else directionPoint.deactivate();

        // directionPoint.update( camera );
    }

    for (i = 0; i < this.directionPointsAll.length; i++) {

        this.directionPointsAll[i].update(camera);
    }

};

module.exports = DirectionHelper;

},{"./DirectionPoint":22}],22:[function(require,module,exports){
'use strict';
var PathType = require('../path/PathType');

var vs_regular_projection = require('../../../glsl/vs-regular-projection.glsl');
var fs_arc = require('../../../glsl/fs-arc.glsl');

var DirectionPoint = function (scene, position, path, vectorPath) {

    THREE.EventDispatcher.call(this);

    this.scene = scene;
    this.position = position;
    this.path = path || null;
    this.vectorPath = vectorPath.multiplyScalar(0.5);

    this.mesh = null;
    this.texture = null;

    this.isEnabled = false;
    this.isActive = false;

    this.isPortalActive = false;

    this.progress = 0;
    this.progressInc = ( path.view.isVR ) ? 0.025 : 0.0075;
    this.progressDec = ( path.view.isVR ) ? 0.1 : 0.05;
    this.opacity = 0;

    this.init();
};

DirectionPoint.prototype = Object.create(THREE.EventDispatcher.prototype);


// Initialization
// ------------------------------------------------------------

DirectionPoint.prototype.init = function () {

    //this.createTexture();
    this.createMesh();
};

DirectionPoint.prototype.createTexture = function () {

    //this.texture = new DirectionTexture(128, 128, ( this.path.type === PathType.PATH_PORTAL ));
};

DirectionPoint.prototype.createMesh = function () {

    var insideAlpha = (this.path.type === PathType.PATH_PORTAL) ? 0.0 : 1.0;

    var geometry = new THREE.PlaneBufferGeometry(4, 4, 2, 2),
        material = new THREE.ShaderMaterial({

            transparent : true,

            uniforms: {
                'color'         : { type: "v4", value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
                'colorInside'   : { type: "v4", value: new THREE.Vector4(1.0, 1.0, 1.0, insideAlpha) },
                'progress'      : { type: "f", value: 0.5 },
                'alpha'         : { type: "f", value: 0.0 }
            },

            vertexShader                : vs_regular_projection,
            fragmentShader              : fs_arc
        });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);

    // this.scene.add( this.mesh );
};


// Add / remove from scene
// ------------------------------------------------------------

DirectionPoint.prototype.addInScene = function () {

    this.scene.add(this.mesh);
};

DirectionPoint.prototype.removeFromScene = function () {

    this.scene.remove(this.mesh);
};


// Enable / disable
// ------------------------------------------------------------

DirectionPoint.prototype.enable = function () {

    if (this.path.type === PathType.PATH_PORTAL) {

        setTimeout(( function () {

            if (this.path.view.portalRTT !== null) {

                this.isPortalActive = true;
                this.path.view.portalRTT.show(this.mesh.position.clone().add(this.vectorPath));
            }

        } ).bind(this), 500);
    }

    this.progress = 0;
    //this.texture.update(this.progress);
    this.mesh.material.uniforms['progress'].value = this.progress;

    TweenMax.to(this, 1.0, {

        opacity: 0.5,
        progress: 0,
        ease: Power2.easeInOut,
        onUpdate: ( function () {

            this.mesh.material.uniforms['alpha'].value = this.opacity;

        } ).bind(this),
        onComplete: ( function () {

            this.isEnabled = true;
            this.isActive = false;

        } ).bind(this)
    });
};

DirectionPoint.prototype.disable = function () {

    if (this.isPortalActive) {

        this.isPortalActive = false;
        this.path.view.portalRTT.hide();
    }


    this.isEnabled = false;
    this.isActive = false;

    TweenMax.to(this, 0.5, {

        opacity: 0,
        progress: 0,
        ease: Power2.easeInOut,
        onUpdate: ( function () {

            //this.texture.update(this.progress);
            this.mesh.material.uniforms['progress'].value = this.progress;
            this.mesh.material.uniforms['alpha'].value = this.opacity;

        } ).bind(this)
    });
};


// Activate / Deactivate
// ------------------------------------------------------------

DirectionPoint.prototype.activate = function () {

    if (!this.isActive) {

        this.isActive = true;
        this.opacity = 1;
    }
};

DirectionPoint.prototype.deactivate = function () {

    if (this.isActive) {

        this.isActive = false;
        this.opacity = 0.5;
    }
};


// Update
// ------------------------------------------------------------

DirectionPoint.prototype.update = function (camera) {

    // Make the mesh face the camera
    this.mesh.lookAt(camera.position);

    if (this.isEnabled) {

        // Update progress
        var newProgress = this.progress;

        if (this.isActive && this.progress < 1) {

            newProgress = Math.min(1, this.progress + this.progressInc);

        } else if (this.progress > 0) {

            newProgress = Math.max(0, this.progress - this.progressDec);
        }

        if (newProgress !== this.progress) {

            this.progress += ( newProgress - this.progress ) / 5;
            if (Math.abs(this.progress - newProgress) < 0.05) this.progress = newProgress;

            //this.texture.update(this.progress);

            this.mesh.material.uniforms['progress'].value = this.progress;

            if (this.progress === 1) {

                this.moveDirection();
            }
        }


        // Update opacity
        if (this.mesh.material.opacity !== this.opacity) {

            this.mesh.material.opacity += ( this.opacity - this.mesh.material.opacity ) / 10;
            if (Math.abs(this.mesh.material.uniforms['alpha'].value - this.opacity) < 0.05)  this.mesh.material.uniforms['alpha'].value = this.opacity;
        }
    }
};


// Move in direction
// ------------------------------------------------------------

DirectionPoint.prototype.moveDirection = function () {

    this.path.moveInPathFrom(this);
};

module.exports = DirectionPoint;
},{"../../../glsl/fs-arc.glsl":1,"../../../glsl/vs-regular-projection.glsl":10,"../path/PathType":16}],23:[function(require,module,exports){
/**
 * Created by siroko on 7/13/15.
 */

var BaseGLPass = function( params ) {

    THREE.EventDispatcher.call( this );

    this.renderer   = params.renderer;

    this.bufferGeometry = null;

    this.sceneRT = new THREE.Scene();
    this.sceneBuffer = new THREE.Scene();

    this.cameraOrto = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
};

BaseGLPass.prototype = Object.create( THREE.EventDispatcher.prototype );


BaseGLPass.prototype.pass = function( material, target ) {

    this.quad.material = material;
    this.renderer.render( this.sceneRT, this.cameraOrto, target );

};

BaseGLPass.prototype.passBuffer = function( material, target ) {

    this.bufferMesh.geometry.material = material;
    this.renderer.render( this.sceneBuffer, this.cameraOrto, target );

};

BaseGLPass.prototype.getRenderTarget = function( w, h, linear ) {

    var renderTarget = new THREE.WebGLRenderTarget( w, h, {
        wrapS           : THREE.RepeatWrapping,
        wrapT           : THREE.RepeatWrapping,
        minFilter       : linear ? THREE.LinearFilter : THREE.NearestFilter,
        magFilter       : linear ? THREE.LinearFilter : THREE.NearestFilter,
        format          : THREE.RGBFormat,
        type            : window.isAndroid ? THREE.FloatType : THREE.HalfFloatType,
        stencilBuffer   : false
    } );

    return renderTarget;
};

module.exports = BaseGLPass;
},{}],24:[function(require,module,exports){
/**
 * Created by felixmorenomartinez on 13/02/15.
 */


'use strict';

var DebugPanel = function (view) {

    var Settings = function (view) {

        this.ambient = 61;
        this.diffuse = 37;
        this.specular = 0;
        this.rim = 0;
        this.shininess = 49;
        this.invertRim = false;
        this.solidRender = false;
        this.inkColor = [0, 0, 0];
        this.toggleMaterials = function () {

            view.planesController.toggleMaterials();
        };
        this.loadMesh = function () {

            view.toggleEnvironment();
        }
    };

    this.settings = new Settings(view);
    this.gui = new dat.GUI();

    this.init();
};

DebugPanel.prototype.init = function () {

    this.gui.add(this.settings, 'ambient', 61, 100.0);
    this.gui.add(this.settings, 'diffuse', 37, 100.0);
    this.gui.add(this.settings, 'specular', 0.0, 100.0);
    this.gui.add(this.settings, 'rim', 0.0, 100.0);
    this.gui.add(this.settings, 'shininess', 49, 100);
    this.gui.add(this.settings, 'invertRim');
    this.gui.add(this.settings, 'solidRender');
    this.gui.addColor(this.settings, 'inkColor');
    this.gui.add(this.settings, 'toggleMaterials');
    this.gui.add(this.settings, 'loadMesh');

};

module.exports = DebugPanel;
},{}],25:[function(require,module,exports){
/**
 * Created by siroko on 7/8/15.
 */


var BaseGLPass = require('./BaseGLPass');

var vs_bufferParticles  = require('../../../glsl/vs-buffer-particles.glsl');
var fs_bufferParticles  = require('../../../glsl/fs-buffer-particles.glsl');
var vs_createPositions  = require('../../../glsl/vs-create-positions.glsl');
var fs_createPositions  = require('../../../glsl/fs-create-positions.glsl');
var vs_simpleQuad       = require('../../../glsl/vs-simple-quad.glsl');
var fs_updatePositions  = require('../../../glsl/fs-update-positions.glsl');
var fs_copy             = require('../../../glsl/fs-copy.glsl');


var Simulator = function( params ) {

    BaseGLPass.call( this, params );

    this.sizeW      = params.sizeW;
    this.sizeH      = params.sizeH;

    this.positionsGeom = params.positionsGeom;

    this.setup();
};

Simulator.prototype = Object.create( BaseGLPass.prototype );

Simulator.prototype.setup = function() {

    this.VI2dRT             = this.getRenderTarget( this.sizeW, this.sizeH );
    this.positionsRT        = this.getRenderTarget( this.sizeW, this.sizeH );
    this.prevPositionsRT    = this.getRenderTarget( this.sizeW, this.sizeH );
    this.geometryRT         = this.getRenderTarget( this.sizeW, this.sizeH );
    this.finalPositionsRT   = this.getRenderTarget( this.sizeW, this.sizeH );

    this.total              = this.sizeW * this.sizeH;

    this.index2D            = new THREE.BufferAttribute( new Float32Array( this.total * 2 ), 2 );
    this.positions          = new THREE.BufferAttribute( new Float32Array( this.total * 3 ), 3 );

    var div = 1 / this.sizeW;
    for (var i = 0; i < this.total; i++) {

        this.index2D.setXY( i, ( ( 2. * div * ( ( i % this.sizeW ) + 0.5 ) - 1 ) + 1 ) / 2,  ( ( 2. * div * ( Math.floor( i * div ) + 0.5 ) - 1 ) + 1 ) / 2 );
        this.positions.setXYZ( i, Math.random() * 300 - 150, Math.random() * 300 - 150, Math.random() * 300 - 150 );
    }

    this.bufferGeometry = new THREE.BufferGeometry();
    this.bufferGeometry.addAttribute( 'aV2I', this.index2D );
    this.bufferGeometry.addAttribute( 'position', this.positions );

    this.bufferMaterial = new THREE.ShaderMaterial( {

        attributes: {
            'position'              : { type: "v3", value: null },
            'aV2I'                  : { type: "v2", value: null }
        },
        uniforms: {
            'textureMap'            : { type: "t", value : THREE.ImageUtils.loadTexture( 'assets/img/particle.png' ) },
            'uPositionsT'           : { type: "t", value : this.finalPositionsRT }
        },

        vertexShader                : vs_bufferParticles,
        fragmentShader              : fs_bufferParticles,

        depthWrite                  : false,
        transparent                 : true
    } );

    this.bufferMesh = new THREE.PointCloud( this.bufferGeometry, this.bufferMaterial );

    this.drawPositionsMaterial = new THREE.ShaderMaterial( {

        attributes: {
            'position'              : { type: "v3", value: null },
            'aV2I'                  : { type: "v2", value: null }
        },

        uniforms: {
            'uGeomToDraw'           : { type: "f",  value: 1 }
        },
        vertexShader                : vs_createPositions,
        fragmentShader              : fs_createPositions
    } );

    this.bufferMesh2 = new THREE.PointCloud( this.bufferGeometry.clone(), this.drawPositionsMaterial );
    this.sceneBuffer.add( this.bufferMesh2 );

    this.updatePositionsMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            'uPrevPositionsMap'     : { type: "t", value: this.positionsRT },
            'uGeomPositionsMap'     : { type: "t", value: this.geometryRT },
            'uTime'                 : { type: "f", value: 0 }
        },

        vertexShader                : vs_simpleQuad,
        fragmentShader              : fs_updatePositions
    } );

    this.copyMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            textureMap              : { type: "t", value: this.finalPositionsRT }
        },

        vertexShader                : vs_simpleQuad,
        fragmentShader              : fs_copy
    } );

    var quad_geom = new THREE.PlaneBufferGeometry( 2, 2, 1, 1 );
    this.quad = new THREE.Mesh( quad_geom, this.updatePositionsMaterial );
    this.sceneRT.add(this.quad);

    this.passBuffer( this.drawPositionsMaterial, this.positionsRT );
    this.passBuffer( this.drawPositionsMaterial, this.geometryRT );
    this.drawPositionsMaterial.uniforms.uGeomToDraw.value = 1.0;
    this.passBuffer( this.drawPositionsMaterial, this.VI2dRT );

    this.pass( this.updatePositionsMaterial, this.finalPositionsRT );
    this.updatePositionsMaterial.uniforms.uPrevPositionsMap.value = this.prevPositionsRT;

    this.pass( this.copyMaterial, this.prevPositionsRT );
};

Simulator.prototype.update = function() {

    this.updatePositionsMaterial.uniforms.uTime.value = Math.sin(Date.now() * 0.001);

    this.pass( this.updatePositionsMaterial, this.finalPositionsRT );
    this.pass( this.copyMaterial, this.prevPositionsRT );
};

module.exports = Simulator;
},{"../../../glsl/fs-buffer-particles.glsl":2,"../../../glsl/fs-copy.glsl":3,"../../../glsl/fs-create-positions.glsl":4,"../../../glsl/fs-update-positions.glsl":6,"../../../glsl/vs-buffer-particles.glsl":7,"../../../glsl/vs-create-positions.glsl":8,"../../../glsl/vs-simple-quad.glsl":11,"./BaseGLPass":23}],26:[function(require,module,exports){
/**
 * Created by felixmorenomartinez on 26/02/15.
 */


'use strict';

var vs_hatching = require('../../../glsl/vs-hatching.glsl');
var fs_hatching = require('../../../glsl/fs-hatching.glsl');

var Character = function () {

    THREE.EventDispatcher.call(this);

    this.material = null;
    this.model1 = null;
    this.meshes = [];
    this.objURL1 = 'assets/geom/dodecahedron.obj';
    this.scale = 0.35;
    this.isCreated = false;
    this.useHatching = false;

    this.fogDensity = 10;
    this.fogNear = 30;
    this.fogFar = 300;
    this.fogColor = new THREE.Vector3(0, 0, 0);
    this.fogType = 1;

    this.init();
};

Character.prototype = Object.create(THREE.EventDispatcher.prototype);


Character.prototype.init = function () {

    this.createMaterial();
    this.loadObj();
};

Character.prototype.show = function () {


};

Character.prototype.hide = function () {

    for (var i = 0; i < this.meshes.length; i++) {

        this.meshes[i].visible = false;
    }
};

// setting the material
Character.prototype.createMaterial = function () {

    if (this.useHatching) {

        this.material1 = new THREE.ShaderMaterial({
            uniforms: {
                showOutline: {type: 'f', value: 0},
                ambientWeight: {type: 'f', value: 0},
                diffuseWeight: {type: 'f', value: 0},
                rimWeight: {type: 'f', value: 1},
                specularWeight: {type: 'f', value: 0},
                shininess: {type: 'f', value: 1000},
                invertRim: {type: 'i', value: 1},
                inkColor: {type: 'v4', value: new THREE.Vector3(0.3, 0.3, 0.3)},
                solidRender: {type: 'i', value: 0},
                resolution: {type: 'v2', value: new THREE.Vector2(0, 0)},
                bkgResolution: {type: 'v2', value: new THREE.Vector2(0, 0)},
                lightPosition: {type: 'v3', value: new THREE.Vector3(-100, 100, 0)},
                hatch1: {type: 't', value: THREE.ImageUtils.loadTexture('assets/patterns/hatch_0.jpg')},
                hatch2: {type: 't', value: THREE.ImageUtils.loadTexture('assets/patterns/hatch_1.jpg')},
                hatch3: {type: 't', value: THREE.ImageUtils.loadTexture('assets/patterns/hatch_2.jpg')},
                hatch4: {type: 't', value: THREE.ImageUtils.loadTexture('assets/patterns/hatch_3.jpg')},
                hatch5: {type: 't', value: THREE.ImageUtils.loadTexture('assets/patterns/hatch_4.jpg')},
                hatch6: {type: 't', value: THREE.ImageUtils.loadTexture('assets/patterns/hatch_5.jpg')},
                paper: {type: 't', value: THREE.ImageUtils.loadTexture('assets/patterns/placeholder.jpg')},
                baked: {type: 't', value: THREE.ImageUtils.loadTexture('assets/patterns/placeholder.jpg')},
                repeat: {type: 'v2', value: new THREE.Vector2(0, 0)},
                fogDensity: {type: 'f', value: this.fogDensity},
                fogNear: {type: 'f', value: this.fogNear},
                fogFar: {type: 'f', value: this.fogFar},
                fogColor: {type: 'v3', value: this.fogColor},
                fogType: {type: 'f', value: this.fogType}
            },
            vertexShader:vs_hatching,
            fragmentShader: fs_hatching,
            side: THREE.DoubleSide
        });

        this.material1.uniforms.paper.value.generateMipmaps = false;
        this.material1.uniforms.paper.value.magFilter = THREE.LinearFilter;
        this.material1.uniforms.paper.value.minFilter = THREE.LinearFilter;

        this.material1.uniforms.repeat.value.set(5, 5);
        this.material1.uniforms.hatch1.value.wrapS = this.material1.uniforms.hatch1.value.wrapT = THREE.RepeatWrapping;
        this.material1.uniforms.hatch2.value.wrapS = this.material1.uniforms.hatch2.value.wrapT = THREE.RepeatWrapping;
        this.material1.uniforms.hatch3.value.wrapS = this.material1.uniforms.hatch3.value.wrapT = THREE.RepeatWrapping;
        this.material1.uniforms.hatch4.value.wrapS = this.material1.uniforms.hatch4.value.wrapT = THREE.RepeatWrapping;
        this.material1.uniforms.hatch5.value.wrapS = this.material1.uniforms.hatch5.value.wrapT = THREE.RepeatWrapping;
        this.material1.uniforms.hatch6.value.wrapS = this.material1.uniforms.hatch6.value.wrapT = THREE.RepeatWrapping;

    } else {

        this.material1 = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
    }

}

Character.prototype.loadObj = function () {

    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
    };

    this.objLoader = new THREE.OBJLoader(manager);
    this.objLoader.load(this.objURL1, this.onLoadObj1.bind(this));
};

Character.prototype.onLoadObj1 = function (obj) {

    this.model1 = obj;

    this.model1.traverse(this.setMaterial1.bind(this));
    this.model1.scale.x = this.model1.scale.y = this.model1.scale.z = this.scale;

    this.dispatchEvent({type: 'loaded'});

};

Character.prototype.setMaterial1 = function (child) {

    if (child instanceof THREE.Mesh) {

        this.meshes.push(child);
        child.material = this.material1;
    }
};

module.exports = Character;

},{"../../../glsl/fs-hatching.glsl":5,"../../../glsl/vs-hatching.glsl":9}],27:[function(require,module,exports){
'use strict';

var EnviroView = function (scene) {

    THREE.EventDispatcher.call(this);

    this.scene = scene;
    this.material = null;
    this.model1 = null;
    this.model2 = null;
    this.model3 = null;
    this.model4 = null;
    this.model5 = null;
    this.model6 = null;
    this.meshes = [];
    this.objURL1 = 'assets/geom/obj01.obj';
    this.objURL2 = 'assets/geom/obj02.obj';
    this.objURL3 = 'assets/geom/obj03.obj';
    ////this.objURL5 = 'assets/geom/obj01.obj';
    //this.objURL6 = 'assets/geom/obj02.obj';
    ////this.objURL7 = 'assets/geom/obj03.obj';
    this.scale = 2;
    this.isCreated = false;
    this.useHatching = true;

    this.fogDensity = 10;
    this.fogNear = 30;
    this.fogFar = 300;
    this.fogColor = new THREE.Vector3(0, 0, 0);
    this.fogType = 1;

    this.init();
};

EnviroView.prototype = Object.create(THREE.EventDispatcher.prototype);


EnviroView.prototype.init = function () {


};

EnviroView.prototype.show = function () {

    if (!this.isCreated) {

        this.isCreated = true;
        this.createMaterial();
        this.loadObj();

    } else {

        for (var i = 0; i < this.meshes.length; i++) {

            this.meshes[i].visible = true;
        }
    }
};

EnviroView.prototype.hide = function () {

    for (var i = 0; i < this.meshes.length; i++) {

        this.meshes[i].visible = false;
    }
};

// setting the material
EnviroView.prototype.createMaterial = function () {

    this.material1 = new THREE.MeshBasicMaterial({
        map: window.isAndroid ? THREE.ImageUtils.loadTexture('assets/img/1024/obj1.jpg') : THREE.ImageUtils.loadTexture('assets/img/obj1.jpg'),
        color: 0xffffff,
        side: THREE.DoubleSide
    });
    this.material2 = new THREE.MeshBasicMaterial({
        map: window.isAndroid ? THREE.ImageUtils.loadTexture('assets/img/obj2.jpg') : THREE.ImageUtils.loadTexture('assets/img/obj2.jpg'),
        color: 0xffffff,
        side: THREE.DoubleSide
    });
    this.material3 = new THREE.MeshBasicMaterial({
        map: window.isAndroid ? THREE.ImageUtils.loadTexture('assets/img/1024/obj3.jpg') : THREE.ImageUtils.loadTexture('assets/img/obj3.jpg'),
        color: 0xffffff,
        side: THREE.DoubleSide
    });
}

EnviroView.prototype.loadObj = function () {

    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
    };

    this.objLoader = new THREE.OBJLoader(manager);
    this.objLoader.load(this.objURL1, this.onLoadObj1.bind(this));
};

EnviroView.prototype.createMirrorMesh = function (originalMesh, materialMethod) {

    var newMesh = originalMesh.clone();
        newMesh.position.x = 0;
        newMesh.position.y = 0;
        newMesh.position.z = 0;

    var newMeshContainer = new THREE.Object3D();
        newMeshContainer.add(newMesh);
        newMeshContainer.rotation.y = THREE.Math.degToRad(180);
        newMeshContainer.position.x = -100;
        newMeshContainer.position.y = -10.5;
        newMeshContainer.position.z = 40;

    return newMeshContainer;
};

EnviroView.prototype.onLoadObj1 = function (obj) {

    this.model1 = obj;

    this.model1.traverse(this.setMaterial1.bind(this));

    this.model1.scale.x = this.model1.scale.y = this.model1.scale.z = this.scale;
    this.model1.position.x = 15;
    this.model1.position.y = -10;

    //this.model1.children[0].geometry.mergeVertices();
    //this.model1.children[0].geometry.computeFaceNormals();
    //this.model1.children[0].geometry.computeVertexNormals();


    this.scene.add(this.model1);

    // Clone the mesh and add it flipped
    this.model4 = this.createMirrorMesh(this.model1, this.setMaterial1.bind(this));
    this.scene.add(this.model4);


    this.dispatchEvent({type: 'loaded'});

    this.objLoader.load(this.objURL2, this.onLoadObj2.bind(this));
};

EnviroView.prototype.setMaterial1 = function (child) {

    if (child instanceof THREE.Mesh) {

        this.meshes.push(child);
        child.material = ( this.useHatching ) ? this.material1 : this.material;
    }
};

EnviroView.prototype.onLoadObj2 = function (obj) {

    this.model2 = obj;

    this.model2.traverse(this.setMaterial2.bind(this));

    this.model2.scale.x = this.model2.scale.y = this.model2.scale.z = this.scale;
    this.model2.position.x = 15;
    this.model2.position.y = -10;

    //this.model2.children[0].geometry.mergeVertices();
    //this.model2.children[0].geometry.computeFaceNormals();
    //this.model2.children[0].geometry.computeVertexNormals();

    this.scene.add(this.model2);

    // Clone the mesh and add it flipped
    this.model5 = this.createMirrorMesh(this.model2, this.setMaterial2.bind(this));
    this.scene.add(this.model5);

    this.dispatchEvent({type: 'loaded'});

    this.objLoader.load(this.objURL3, this.onLoadObj3.bind(this));
};

EnviroView.prototype.setMaterial2 = function (child) {

    if (child instanceof THREE.Mesh) {

        this.meshes.push(child);
        child.material = ( this.useHatching ) ? this.material2 : this.material;
    }
};

EnviroView.prototype.onLoadObj3 = function (obj) {

    this.model3 = obj;

    this.model3.traverse(this.setMaterial3.bind(this));

    this.model3.scale.x = this.model3.scale.y = this.model3.scale.z = this.scale;
    this.model3.position.x = 15;
    this.model3.position.y = -10;

    //this.model3.children[0].geometry.mergeVertices();
    //this.model3.children[0].geometry.computeFaceNormals();
    //this.model3.children[0].geometry.computeVertexNormals();

    this.scene.add(this.model3);

    // Clone the mesh and add it flipped
    this.model6 = this.createMirrorMesh(this.model3, this.setMaterial3.bind(this));
    this.scene.add(this.model6);

    this.dispatchEvent({type: 'loaded'});

    //this.objLoader.load(this.objURL4, this.onLoadObj4.bind(this));
};

EnviroView.prototype.setMaterial3 = function (child) {

    if (child instanceof THREE.Mesh) {

        this.meshes.push(child);
        child.material = ( this.useHatching ) ? this.material3 : this.material;
    }
};






//EnviroView.prototype.onLoadObj4 = function (obj) {
//
//    this.model4 = obj;
//
//    this.model4.traverse(this.setMaterial4.bind(this));
//
//    this.model4.scale.x = this.model4.scale.y = this.model4.scale.z = this.scale;
//    this.model4.position.x = 15;
//    this.model4.position.y = -10;
//
//    //this.model4.children[0].geometry.mergeVertices();
//    //this.model4.children[0].geometry.computeVertexNormals();
//    this.scene.add(this.model4);
//
//    this.dispatchEvent({type: 'loaded'});
//
//    this.objLoader.load(this.objURL6, this.onLoadObj6.bind(this));
//};
//
//EnviroView.prototype.setMaterial4 = function (child) {
//
//    if (child instanceof THREE.Mesh) {
//
//        this.meshes.push(child);
//        child.material = ( this.useHatching ) ? this.material4 : this.material;
//    }
//};
//
//
//EnviroView.prototype.onLoadObj5 = function (obj) {
//
//    this.model5 = obj;
//
//    this.model5.traverse(this.setMaterial5.bind(this));
//
//    this.model5.scale.x = this.model5.scale.y = this.model5.scale.z = this.scale;
//    this.model5.position.x = 15;
//    this.model5.position.y = -10;
//
//    //this.model4.children[0].geometry.mergeVertices();
//    //this.model4.children[0].geometry.computeVertexNormals();
//    this.scene.add(this.model5);
//
//    this.dispatchEvent({type: 'loaded'});
//
//    this.objLoader.load(this.objURL6, this.onLoadObj6.bind(this));
//};
//
//EnviroView.prototype.setMaterial5 = function (child) {
//
//    if (child instanceof THREE.Mesh) {
//
//        this.meshes.push(child);
//        child.material = ( this.useHatching ) ? this.material5 : this.material;
//    }
//};
//
//
//EnviroView.prototype.onLoadObj6 = function (obj) {
//
//    this.model6 = obj;
//
//    this.model6.traverse(this.setMaterial6.bind(this));
//
//    this.model6.scale.x = this.model6.scale.y = this.model6.scale.z = this.scale;
//    this.model6.position.x = 15;
//    this.model6.position.y = -10;
//
//    //this.model4.children[0].geometry.mergeVertices();
//    //this.model4.children[0].geometry.computeVertexNormals();
//    this.scene.add(this.model6);
//
//    this.dispatchEvent({type: 'loaded'});
//
//    //this.objLoader.load(this.objURL7, this.onLoadObj2.bind(this));
//};
//
//EnviroView.prototype.setMaterial6 = function (child) {
//
//    if (child instanceof THREE.Mesh) {
//
//        this.meshes.push(child);
//        child.material = ( this.useHatching ) ? this.material6 : this.material;
//    }
//};
//
//EnviroView.prototype.onLoadObj7 = function (obj) {
//
//    this.model7 = obj;
//
//    this.model7.traverse(this.setMaterial7.bind(this));
//
//    this.model7.scale.x = this.model7.scale.y = this.model7.scale.z = this.scale;
//    this.model7.position.x = 15;
//    this.model7.position.y = -10;
//
//    //this.model4.children[0].geometry.mergeVertices();
//    //this.model4.children[0].geometry.computeVertexNormals();
//    this.scene.add(this.model7);
//
//    this.dispatchEvent({type: 'loaded'});
//};
//
//EnviroView.prototype.setMaterial7 = function (child) {
//
//    if (child instanceof THREE.Mesh) {
//
//        this.meshes.push(child);
//        child.material = ( this.useHatching ) ? this.material7 : this.material;
//    }
//};


module.exports = EnviroView;

},{}],28:[function(require,module,exports){
'use strict';

// GarlandView
// ------------------------------------------
// Generative Xmas swag
// ------------------------------------------

var GarlandView = ( function () {

    var scene;

    var swag			= null,
        lineMaterial	= null,
        colorz			= [

            [ 0 / 255, 30 / 255, 0 / 255 ],
            [ 16 / 255, 79 / 255, 16 / 255 ],
            [ 7 / 255, 109 / 255, 7 / 255 ],
            [ 1 / 255, 174 / 255, 0 / 255 ]
        ];

    var groups = [];

	function init ( container ) {

		scene = container;
		createDecoration();
	}


	// Create garland decoration
	// ------------------------------------------

	function createDecoration () {

        swag = new THREE.Object3D();
        swag.scale.set( 0.25, 0.25, 0.25 );
        scene.add( swag );

        createLineMaterial();

        var i;

        groups = [];
        for ( i = 0; i < 20; i++ ) {

            var group = createLineGroup();
            group.scale.set( 0.001, 0.001, 0.001 );

            groups.push( group );
            swag.add( group );
        }

        var rotation = 0;
        for ( i = 0; i < 20; i++ ) {

            var rad = THREE.Math.degToRad( rotation );

            groups[ i ].userData.rotation = rad;
            rotation += 18;

            groups[ i ].position.x = Math.cos( rad ) * 10.0;
            groups[ i ].position.y = Math.sin( rad ) * 10.0;
        }
    }

	function createLineMaterial () {

		lineMaterial = new THREE.MeshBasicMaterial( {

			vertexColors	: THREE.VertexColors,
			side			: THREE.DoubleSide,
			shading			: THREE.FlatShading
		} );
	}

	function createLineGeometry () {

		var lineGeometry = new THREE.PlaneBufferGeometry( 0.5, 3, 1, 3 );

		var positions	= lineGeometry.attributes.position.array,
			colors		= [],
			incsX		= [ 0.0, 0.0, 0.0, THREE.Math.randFloat( 0.1, 0.15 ) ],
			incsZ		= [ 0.0, 0.0, 0.0, 0.0 ],
			incsY		= [ 0.0, 0.0, 0.0, 0.0 ];

		incsZ[ 1 ] = THREE.Math.randFloat( 0.1, 0.8 );
		incsZ[ 2 ] = incsZ[ 1 ] + THREE.Math.randFloat( 0.1, 0.8 );
		incsZ[ 3 ] = incsZ[ 2 ] + THREE.Math.randFloat( 0.4, 0.8 );

		incsY[ 1 ] = THREE.Math.randFloat( 0.0, 1.0 );
		incsY[ 2 ] = incsY[ 1 ] + THREE.Math.randFloat( 0.0, 1.0 );
		incsY[ 3 ] = incsY[ 2 ] + THREE.Math.randFloat( 0.0, 1.0 );

		var height = 0;

		for ( var i = 0; i < positions.length; i+=3 ) {

			if ( i % 3 === 0 ) {

				var dirInc = ( positions[ i ] < 0 )? 1 : -1;

				if ( positions[ i + 1 ] === -1.5 ) {

					positions[ i + 1 ] += incsY[ 0 ];
					positions[ i + 2 ] += incsZ[ 0 ];

					colors.push( colorz[ 0 ][ 0 ], colorz[ 0 ][ 1 ], colorz[ 0 ][ 2 ], 1.0 );

				} else if ( positions[ i + 1 ] === -0.5 ) {

					positions[ i + 1 ] += incsY[ 1 ];
					positions[ i + 2 ] += incsZ[ 1 ];

					colors.push( colorz[ 1 ][ 0 ], colorz[ 1 ][ 1 ], colorz[ 1 ][ 2 ], 1.0 );

				} else if ( positions[ i + 1 ] === 0.5 ) {

					positions[ i + 1 ] += incsY[ 2 ];
					positions[ i + 2 ] += incsZ[ 2 ];

					colors.push( colorz[ 2 ][ 0 ], colorz[ 2 ][ 1 ], colorz[ 2 ][ 2 ], 1.0 );

				} else if ( positions[ i + 1 ] === 1.5 ) {

					positions[ i ] += dirInc * incsX[ 3 ];
					positions[ i + 1 ] += incsY[ 3 ];
					positions[ i + 2 ] += incsZ[ 3 ];

					height = positions[ i + 1 ];

					colors.push( colorz[ 3 ][ 0 ], colorz[ 3 ][ 1 ], colorz[ 3 ][ 2 ], 1.0 );
				}
			}
		}

		lineGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors ), 4 ) );

		lineGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, height / 2, 0 ) );
		return {

			geometry	: lineGeometry,
			height		: height
		};
	}

	function createLineGroup () {

		var group = new THREE.Object3D();

		for ( var i = 0; i < 10; i++ ) {

			var line = createLine();
			group.add( line );
		}

		return group;
	}

	function createLine () {

		var meshGeo		= createLineGeometry(),
			meshLine	= new THREE.Mesh( meshGeo.geometry, lineMaterial );

			meshLine.rotation.z = THREE.Math.degToRad( THREE.Math.randFloat( -35, 35 ) );
			meshLine.scale.set(

				1.0 + THREE.Math.randFloat( -0.2, 0 ),
				1.0 + THREE.Math.randFloat( -0.2, 0.2 ),
				1.0
			);

		return meshLine;
	}


    // Remove garland decoration
    // ------------------------------------------

    function removeDecoration () {

        scene.remove( swag );
    }


    // Hide / Show
    // ------------------------------------------

    function showDecoration () {

        for ( var i = 0; i < 20; i++ ) {

            var tweenData	= { value : 0.001 },
                group		= groups[ i ];

            ( function ( tweenData, group, i ) {

                TweenMax.to( tweenData, 0.5, {

                    value		: 1,
                    delay		: 0.1 * i,
                    ease		: Power2.easeInOut,
                    onUpdate	: function () {

                        group.scale.set( tweenData.value, tweenData.value, tweenData.value );
                        group.rotation.z = group.userData.rotation * 0.8 + ( tweenData.value * group.userData.rotation * 0.2 );
                    }
                } );

            } )( tweenData, group, i );
        }
    }

    function hideDecoration () {

        var tweenData	= { value : 1 };

        TweenMax.to( tweenData, 0.75, {

            value		: 0.001,
            ease		: Power2.easeInOut,
            onUpdate	: function () {

                for ( var i = 0; i < 20; i++ ) {

                    var group = groups[ i ];
                    group.scale.set( tweenData.value, tweenData.value, tweenData.value );
                }
            }
        } );
    }


	// API
	// ------------------------------------------

	return {

		init	: init,
		hide	: hideDecoration,
		show	: showDecoration,
        create	: createDecoration,
        remove	: removeDecoration
	}

} )();

module.exports = GarlandView;
},{}],29:[function(require,module,exports){
'use strict';

var LoaderView = require('./LoaderView');

var IntroView = function (parentView) {

    THREE.EventDispatcher.call(this);

    this.parentView = parentView;
    this.domElement = document.getElementById("intro");
    this.joinButton = document.querySelectorAll(".btn-join");
    //this.twitterName = document.getElementById("name");

    this.loader = null;

    this.init();
};

IntroView.prototype = Object.create(THREE.EventDispatcher.prototype);

IntroView.prototype.init = function () {

    this.onLoadedBind = this.onLoaded.bind(this);
    this.loader = new LoaderView(this.domElement);
    this.loader.addEventListener('loaded', this.onLoadedBind);

    this.onClickBind = this.onClickJoin.bind(this);

    for (var i=0; i<this.joinButton.length; i++) {

        this.joinButton[i].addEventListener('click', this.onClickBind);
    }

    this.domElement.classList.remove('hide');
};

IntroView.prototype.goFullscreen = function (e) {
    var
        el = document.documentElement
        , rfs =
            el.requestFullScreen
            || el.webkitRequestFullScreen
            || el.mozRequestFullScreen
        ;
    rfs.call(el);
};

IntroView.prototype.onClickJoin = function (e) {

    this.destroy();

    this.dispatchEvent({
        type: 'clickJoin', data: {
            username : e.currentTarget.dataset.color
            // username : this.twitterName.value
        }
    });

    this.goFullscreen(e);

};

IntroView.prototype.destroy = function () {

    this.loader.destroy();
    this.domElement.classList.add('hide');

    for (var i=0; i<this.joinButton.length; i++) {

        this.joinButton[i].removeEventListener('click', this.onClickBind);
    }
};

IntroView.prototype.preloadedElement = function () {

    this.loader.preloadedElement();
};

IntroView.prototype.onLoaded = function () {

    this.parentView.onLoaded();

    this.domElement.classList.remove('loading');
    this.loader.removeEventListener('loaded', this.onLoadedBind);
};

module.exports = IntroView;
},{"./LoaderView":30}],30:[function(require,module,exports){
'use strict';


var LoaderView = function (containerEl) {

    THREE.EventDispatcher.call(this);

    this.total = 5;
    this.loaded = 0;

    this.dpi = window.devicePixelRatio;
    this.size = 100 * this.dpi;

    this.containerEl = containerEl;
    this.canvas = document.getElementById('loader');
    this.ctx = this.canvas.getContext('2d');

    this.center = this.size * 0.5;
    this.radiusInner = this.center - ( 21 * this.dpi );
    this.radiusOuter = this.center - ( 12 * this.dpi );
    this.PI2 = Math.PI * 2;

    this.currentProgress = 0;
    this.targetProgress = 0;

    this.isActive = true;

    this.init();
};

LoaderView.prototype = Object.create(THREE.EventDispatcher.prototype);

LoaderView.prototype.init = function () {

    this.canvas.width = this.size;
    this.canvas.height = this.size;

    this.draw();
    requestAnimationFrame(this.update.bind(this));
};

LoaderView.prototype.destroy = function () {

    this.isActive = false;
};

LoaderView.prototype.preloadedElement = function () {

    this.loaded++;
    this.targetProgress = this.loaded / this.total;
};

LoaderView.prototype.update = function () {

    if (this.targetProgress !== this.currentProgress) {

        this.currentProgress += ( this.targetProgress - this.currentProgress ) / 25;
        if (Math.abs(this.currentProgress - this.targetProgress) < 0.01) this.currentProgress = this.targetProgress;

        this.draw();
        if (this.currentProgress === 1) {

            this.canvas.classList.add('hidden');
            this.dispatchEvent({type: 'loaded'});
        }
    }

    if (this.isActive) {

        requestAnimationFrame(this.update.bind(this));
    }
};

LoaderView.prototype.draw = function () {

    this.clear();

    // Inner circle
    this.ctx.beginPath();
    this.ctx.arc(this.center, this.center, this.radiusInner, 0, this.PI2, false);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();


    // Outer circle
    this.ctx.beginPath();
    this.ctx.arc(this.center, this.center, this.radiusOuter, 0, this.PI2 * this.currentProgress, false);
    this.ctx.lineWidth = 8 * this.dpi;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();
};

LoaderView.prototype.clear = function () {

    this.ctx.clearRect(0, 0, this.size, this.size);
};

module.exports = LoaderView;
},{}],31:[function(require,module,exports){
'use strict';

var PathType = require('../path/PathType');

// Plane View
// ------------------------------------------------------------
// Set of paths according to a side of the Relativity scene
// ------------------------------------------------------------

var PlaneView = function (controller, scene, rotation, paths) {

    this.controller = controller;
    this.scene = scene;
    this.paths = paths;
    this.rotation = rotation;

    this.init();
};


// Initialization
// ------------------------------------------------------------

PlaneView.prototype.init = function () {

};


// Paths
// ------------------------------------------------------------

PlaneView.prototype.getPaths = function () {

    return this.paths;
};

module.exports = PlaneView;
},{"../path/PathType":16}],32:[function(require,module,exports){
'use strict';

var PlaneView = require('./PlaneView');
var PathType = require('../path/PathType');
var SimpleStairsView = require('./SimpleStairsView');

// Planes Controller
// ------------------------------------------------------------
// Controller of the PlaneView collection.
// The idea is have all views as inner faces of a cube.
// Keep track of the current planeView and all that jazz.
// ------------------------------------------------------------

var PlanesController = function (scene) {

    this.scene = scene;

    this.container = null;
    this.material = null;
    this.materialPortal = null;
    this.materialPlane = null;

    this.planes = [];
    this.currentIndexPlane = -1;
    this.currentPlane = null;

    this.isMaterialDebug = false;
    this.isSimple = false;

    this.init();
};


// Initialization
// ------------------------------------------------------------

PlanesController.prototype.init = function () {

    this.createElements();
};

PlanesController.prototype.createElements = function () {

    this.container = new THREE.Object3D();
    this.scene.add(this.container);

    this.createMaterials();
    this.createPlanes();
};

PlanesController.prototype.createMaterials = function () {

    this.materialPortal = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.25});
    this.materialPlane = new THREE.MeshBasicMaterial({
        color: 0xcc0000,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
};

PlanesController.prototype.createPlanes = function () {

    if (this.isSimple) {

        this.planes.push(new SimpleStairsView(this, this.container, null, null, 0xffffff));
        this.planes.push(new SimpleStairsView(this, this.container, 'z', 90, 0x00ff00));
        this.planes.push(new SimpleStairsView(this, this.container, 'z', 180, 0x0000ff));
        this.planes.push(new SimpleStairsView(this, this.container, 'z', 270, 0xff00ff));

    } else {

        // Info coming from the editor

        var rotation = [

            {

                x: THREE.Math.degToRad(0),
                y: THREE.Math.degToRad(0),
                z: THREE.Math.degToRad(0)
            }, {

                x: THREE.Math.degToRad(-90),
                y: THREE.Math.degToRad(0),
                z: THREE.Math.degToRad(0)
            }, {

                x: THREE.Math.degToRad(0),
                y: THREE.Math.degToRad(0),
                z: THREE.Math.degToRad(-90)
            }
        ];

        var paths = [

            [ // Angle 0

                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(-40.145554111676596, -77.86530687146349, -18.142572350197113), new THREE.Vector3(29.173672626142178, -18.72883707468776, -17.92967521825286), new THREE.Vector3(29.682724085881578, 6.5091911402555915, -56.64283011246332)]
                },
                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(29.682724085881578, 6.5091911402555915, -56.64283011246332), new THREE.Vector3(40.54196801356946, 8.441052324467567, -57.330102972454576), new THREE.Vector3(40.24294047874117, 8.441052324467567, -35.33225564304873), new THREE.Vector3(39.7900042117252, 30.36218771305476, -2.0121707301641667), new THREE.Vector3(39.51388979488216, 30.36218771305476, 18.300081754040363)]
                },
                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(29.682724085881578, 6.5091911402555915, -56.64283011246332), new THREE.Vector3(-17.614884835602926, 32.563878572707058, -53.98160921020801), new THREE.Vector3(-72.76813689063263, -10.597231856632646, -56.01829412631548), new THREE.Vector3(-80.86513927382109, -10.597231856632646, -57.01829412631548)]
                },

                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(-40.145554111676596, -77.86530687146349, -18.142572350197113), new THREE.Vector3(-88.65797997222761, -77.86530687146349, -18.142572350197113)]
                },
                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(29.682724085881578, 6.5091911402555915, -56.64283011246332), new THREE.Vector3(34.21469057348185, 5, -74.41448570101069)]
                },
                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(-80.86513927382109, -10.597231856632646, -57.01829412631548), new THREE.Vector3(-117.31086207505354, -10.597231856632646, -57.01829412631548)]
                },
                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(39.51388979488216, 30.36218771305476, 18.300081754040363), new THREE.Vector3(39.51388979488216, 30.36218771305476, 33.99365360007793)]
                }

            ], [ // Angle 1

                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(15.43071614607134, 5, 48.27399526421076), new THREE.Vector3(42.40880163885059, 5, 46.593988050362185), new THREE.Vector3(53.00461152311037, 5, 36.820423959652494), new THREE.Vector3(52.44122653503668, 5, -3.181439604184754)]
                },
                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(52.44122653503668, 5, -3.181439604184754), new THREE.Vector3(53.9846495394637, 5, -57.63885955444237)]
                },
                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(52.44122653503668, 5, -3.181439604184754), new THREE.Vector3(41.75685153795107, 5, -5.316301737160454), new THREE.Vector3(42.798240418377326, -25.58396836017487, 22.378110883369583)]
                },
                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(53.9846495394637, 5, -57.63885955444237), new THREE.Vector3(4.2416246369054065, -37.63630507036658, -60.0830134444261)]
                },
                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(-33.5923087583947, -16.17371430001053, -82.79532072921954), new THREE.Vector3(17.5522074777325, -16.17371430001053, -82.78476668044753)]
                },

                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(53.9846495394637, 5, -57.63885955444237), new THREE.Vector3(53.4847128562336, 5, -75.04237841516664)]
                },
                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(4.2416246369054065, -37.63630507036658, -60.0830134444261), new THREE.Vector3(-24.413615270092528, -54.97445793219066, -71.87721395322374)]
                },
                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(-33.5923087583947, -16.17371430001053, -82.79532072921954), new THREE.Vector3(-68.99517410415503, -16.17371430001053, -84.20350768260303)]
                },
                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(17.5522074777325, -16.17371430001053, -82.78476668044753), new THREE.Vector3(41.446124398930095, -16.17371430001053, -82.41122177801529)]
                }


            ], [ // Angle 2

                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(67.27714018798753, 15.675689418423307, -67.10191287979987), new THREE.Vector3(68.01958684217736, -7.983030066272601, -34.44291268295005)]
                },
                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(68.01958684217736, -7.983030066272601, -34.44291268295005), new THREE.Vector3(57.425358048795616, -13.375139727883699, -26.436471863324204), new THREE.Vector3(57.425358048795616, -38.46084461171769, -3.352890838726818)]
                },
                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(68.01958684217736, -7.983030066272601, -34.44291268295005), new THREE.Vector3(72.03992255676324, -14.252569186835231, -11.410112235954887), new THREE.Vector3(72.03992255676324, -14.252569186835231, 20.57623611616867)]
                },
                {
                    type: PathType.PATH,
                    points: [new THREE.Vector3(-13.736455685686263, 22.431276320910396, -89.4950558699751), new THREE.Vector3(-50.95985129060556, 22.431276320910396, -89.49379682526708), new THREE.Vector3(-50.43902138674909, 22.431276320910396, -142.86106527520482)]
                },

                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(67.27714018798753, 15.675689418423307, -67.10191287979987), new THREE.Vector3(100.21464349882132, 21.111495763959713, -65.41856939347188)]
                },
                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(57.425358048795616, -38.46084461171769, -3.352890838726818), new THREE.Vector3(58.08331423398176, -44.6697280245949, 21.70381019307528)]
                },
                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(72.03992255676324, -14.252569186835231, 20.57623611616867), new THREE.Vector3(75.16985708828051, -14.393751459834155, 115.35374198948426)]
                },
                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(-13.736455685686263, 22.431276320910396, -89.4950558699751), new THREE.Vector3(8.363927007499047, 22.431276320910396, -88.41425635451996)]
                },
                {
                    type: PathType.PATH_PORTAL,
                    points: [new THREE.Vector3(-50.43902138674909, 22.431276320910396, -142.86106527520482), new THREE.Vector3(-50.86327572821005, 22.431276320910396, -166.62011338174904)]
                }

            ]
        ];

        this.planes.push(new PlaneView(this, this.container, rotation[0], paths[0]));
        this.planes.push(new PlaneView(this, this.container, rotation[1], paths[1]));
        this.planes.push(new PlaneView(this, this.container, rotation[2], paths[2]));
    }
};


// Setters
// ------------------------------------------------------------

PlanesController.prototype.setRandomPlane = function () {

    var indexPlane = Math.min(( this.planes.length - 1 ), THREE.Math.randInt(0, this.planes.length));

    while (indexPlane === this.currentIndexPlane) {
        indexPlane = Math.min(( this.planes.length - 1 ), THREE.Math.randInt(0, this.planes.length));
    }

    this.currentIndexPlane = indexPlane;
    this.currentPlane = this.planes[this.currentIndexPlane];

    // Rotate the container as needed ( reset rotation first )

    if (this.isSimple) {

        this.container.rotation.x = THREE.Math.degToRad(0);
        this.container.rotation.y = THREE.Math.degToRad(0);
        this.container.rotation.z = THREE.Math.degToRad(0);

        if (this.currentPlane.rotationAxis !== null) {

            this.container.rotation[this.currentPlane.rotationAxis] = -THREE.Math.degToRad(this.currentPlane.rotationDegrees);
        }

    } else {

        this.container.rotation.x = this.currentPlane.rotation.x;
        this.container.rotation.y = this.currentPlane.rotation.y;
        this.container.rotation.z = this.currentPlane.rotation.z;
    }
};


// Getters
// ------------------------------------------------------------

PlanesController.prototype.getCurrentPlane = function () {

    return this.currentPlane;
};

PlanesController.prototype.getCurrentIndex = function () {

    return this.currentIndexPlane;
};

PlanesController.prototype.getCurrentPaths = function () {

    return this.currentPlane.getPaths();
};

PlanesController.prototype.getRotation = function () {

    return this.container.rotation;
};


// Toggle materials ( debug )
// ------------------------------------------------------------

PlanesController.prototype.toggleMaterials = function () {

    if (this.isSimple) {

        this.isMaterialDebug = !this.isMaterialDebug;

        for (var i = 0; i < this.planes.length; i++) {

            this.planes[i].toggleMaterials(this.isMaterialDebug);
        }
    }
};


module.exports = PlanesController;
},{"../path/PathType":16,"./PlaneView":31,"./SimpleStairsView":33}],33:[function(require,module,exports){
'use strict';

var PathType = require('../path/PathType');

// Simple Stairs View
// ------------------------------------------------------------
// A temporary set of geometries to represent
// stairs and place the paths on top of them
// ------------------------------------------------------------

var SimpleStairsView = function (controller, scene, rotationAxis, rotationDegrees, color) {

    this.controller = controller;
    this.scene = scene;
    this.container = null;
    this.plane = null;
    this.material = controller.material;
    this.materialPortal = controller.materialPortal;
    this.materialPlane = controller.materialPlane;
    this.materialColor = color;

    this.SIZE = 50;

    this.STEP_SEGMENTS = 2;
    this.PLATFORM_SEGMENTS = 20;
    this.PORTAL_SEGMENTS = 2;
    this.PLANE_SEGMENTS = 2;

    this.paths = [];

    this.rotationAxis = rotationAxis || null;
    this.rotationDegrees = rotationDegrees || null;

    this.init();
};


// Initialization
// ------------------------------------------------------------

SimpleStairsView.prototype.init = function () {

    this.createElements();
};

SimpleStairsView.prototype.createElements = function () {

    this.container = new THREE.Object3D();
    this.scene.add(this.container);

    this.createPlane();
    this.createTemporaryScene();

    if (this.rotationAxis !== null) {

        this.container.rotation[this.rotationAxis] = THREE.Math.degToRad(this.rotationDegrees);
    }
};

SimpleStairsView.prototype.createPlane = function () {

    var geometry = new THREE.PlaneBufferGeometry(this.SIZE, this.SIZE, this.PLANE_SEGMENTS, this.PLANE_SEGMENTS);

    this.plane = new THREE.Mesh(geometry, this.materialPlane);
    this.plane.position.y = -25;
    this.plane.rotation.x = THREE.Math.degToRad(-90);

    // this.container.add( this.plane );
};

SimpleStairsView.prototype.createTemporaryScene = function () {

    this.createPlatform({width: 5, height: 1, depth: 20}, new THREE.Vector3(0, 0.5 - 25, 10 - 25));
    this.createStairSet(9, {
        width: 5,
        height: 1,
        depth: 1
    }, new THREE.Vector3(0, 1.5 - 25, 20 - 25), new THREE.Vector3(0, 1, 1));
    this.createPlatform({width: 5, height: 1, depth: 19}, new THREE.Vector3(0, 10.5 - 25, 38 - 25));

    this.paths.push({
        type: PathType.PATH,
        points: [new THREE.Vector3(0, 4.5 - 25, 0 - 25), new THREE.Vector3(0, 4.5 - 25, 15 - 25), new THREE.Vector3(0, 14.5 - 25, 25 - 25), new THREE.Vector3(0, 14.5 - 25, 45 - 25)]
    });

    this.createPortal({width: 5, height: 10, depth: 1}, new THREE.Vector3(0, 5.5 - 25, -5.5 - 25));
    this.createPortal({width: 5, height: 10, depth: 1}, new THREE.Vector3(0, 15.5 - 25, 50 - 25));
    this.paths.push({
        type: PathType.PATH_PORTAL,
        points: [new THREE.Vector3(0, 4.5 - 25, 0 - 25), new THREE.Vector3(0, 4.5 - 25, -10 - 25)]
    });
    this.paths.push({
        type: PathType.PATH_PORTAL,
        points: [new THREE.Vector3(0, 14.5 - 25, 45 - 25), new THREE.Vector3(0, 14.5 - 25, 55 - 25)]
    });

    this.createStairSet(9, {
        width: 1,
        height: 1,
        depth: 5
    }, new THREE.Vector3(2.5, 9.5 - 25, 45 - 25), new THREE.Vector3(1, -1, 0));
    this.createPlatform({width: 11.5, height: 1, depth: 5}, new THREE.Vector3(11.75 + 5, 0.5 - 25, 45 - 25));
    this.createPlatform({width: 5, height: 1, depth: 42.5}, new THREE.Vector3(20, 0.5 - 25, 21.25 - 25));
    this.createPlatform({width: 15, height: 1, depth: 5}, new THREE.Vector3(10, 0.5 - 25, 2.5 - 25));

    this.paths.push({
        type: PathType.PATH,
        points: [new THREE.Vector3(0, 14.5 - 25, 45 - 25), new THREE.Vector3(10, 4.5 - 25, 45 - 25), new THREE.Vector3(20, 4.5 - 25, 45 - 25)]
    });
    this.paths.push({
        type: PathType.PATH,
        points: [new THREE.Vector3(20, 4.5 - 25, 45 - 25), new THREE.Vector3(20, 4.5 - 25, 0 - 25)]
    });
    this.paths.push({
        type: PathType.PATH,
        points: [new THREE.Vector3(20, 4.5 - 25, 0 - 25), new THREE.Vector3(0, 4.5 - 25, 0 - 25)]
    });

    this.createStairSet(9, {
        width: 1,
        height: 1,
        depth: 5
    }, new THREE.Vector3(-2.5, 9.5 - 25, 45 - 25), new THREE.Vector3(-1, -1, 0));
    this.createPlatform({width: 11.5, height: 1, depth: 5}, new THREE.Vector3(-11.75 - 5, 0.5 - 25, 45 - 25));
    this.createPlatform({width: 5, height: 1, depth: 42.5}, new THREE.Vector3(-20, 0.5 - 25, 21.25 - 25));
    this.createPlatform({width: 15, height: 1, depth: 5}, new THREE.Vector3(-10, 0.5 - 25, 2.5 - 25));

    this.paths.push({
        type: PathType.PATH,
        points: [new THREE.Vector3(0, 14.5 - 25, 45 - 25), new THREE.Vector3(-10, 4.5 - 25, 45 - 25), new THREE.Vector3(-20, 4.5 - 25, 45 - 25)]
    });
    this.paths.push({
        type: PathType.PATH,
        points: [new THREE.Vector3(-20, 4.5 - 25, 45 - 25), new THREE.Vector3(-20, 4.5 - 25, 0 - 25)]
    });
    this.paths.push({
        type: PathType.PATH,
        points: [new THREE.Vector3(-20, 4.5 - 25, 0 - 25), new THREE.Vector3(0, 4.5 - 25, 0 - 25)]
    });
};


// Stair creation
// ------------------------------------------------------------

SimpleStairsView.prototype.createStairSet = function (numSteps, sizeStep, positionIni, positionInc) {

    var positionStep = positionIni.clone();

    for (var i = 0; i < numSteps; i++) {

        // create and add current step
        var step = this.createStep(sizeStep);
        step.position.copy(positionStep);
        step.userData.noIntersection = true;

        this.container.add(step);

        // Increment position for the next step
        positionStep.add(positionInc);
    }
};

SimpleStairsView.prototype.createStep = function (sizeStep) {

    var stepGeometry = new THREE.BoxGeometry(sizeStep.width, sizeStep.height, sizeStep.depth, this.STEP_SEGMENTS, this.STEP_SEGMENTS, this.STEP_SEGMENTS),
        stepMaterial = this.material,
        step = new THREE.Mesh(stepGeometry, stepMaterial);

    return step;
};

SimpleStairsView.prototype.createPlatform = function (sizePlatform, positionPlatform) {

    var platformGeometry = new THREE.BoxGeometry(sizePlatform.width, sizePlatform.height, sizePlatform.depth, this.PLATFORM_SEGMENTS, this.PLATFORM_SEGMENTS, this.PLATFORM_SEGMENTS),
        platformMaterial = this.material,
        platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.copy(positionPlatform);
    platform.userData.noIntersection = true;

    this.container.add(platform);
};

SimpleStairsView.prototype.createPortal = function (sizePortal, positionPortal) {

    var portalGeometry = new THREE.BoxGeometry(sizePortal.width, sizePortal.height, sizePortal.depth, this.PORTAL_SEGMENTS, this.PORTAL_SEGMENTS, this.PORTAL_SEGMENTS),
        portalMaterial = this.materialPortal,
        portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portal.position.copy(positionPortal);
    portal.userData.noIntersection = true;

    this.container.add(portal);
};


// Paths
// ------------------------------------------------------------

SimpleStairsView.prototype.getPaths = function () {

    return this.paths;
};


// Toggle materials ( debug )
// ------------------------------------------------------------

SimpleStairsView.prototype.toggleMaterials = function (isDebug) {

    if (isDebug) {

        // TODO: Temp for testing. Specific color per view
        this.material = this.controller.materialPlane.clone();
        this.material.color.setHex(this.materialColor);
        this.material.opacity = 0.7;

    } else {

        this.material = this.controller.material;
    }

    // Force update materials
    for (var i = 0; i < this.container.children.length; i++) {

        var mesh = this.container.children[i];

        if (mesh.material !== this.materialPortal) {

            mesh.material = this.material;
            mesh.material.needsUpdate = true;
        }
    }
};

module.exports = SimpleStairsView;
},{"../path/PathType":16}],34:[function(require,module,exports){
/**
 * Created by siroko on 16/01/15.
 */

'use strict';

var Paths = require('../path/Paths');
var DirectionHelper = require('../ui/DirectionHelper');
var PlanesController = require('./PlanesController');
var EnviroView = require('./EnviroView');
var IntroView = require('./IntroView');
var Character = require('./Character');
var DebugPanel = require('../utils/DebugPanel');
var Audio = require('../audio/Audio');
var PortalRTT = require('../path/PortalRTT');
var Simulator = require('../utils/Simulator');

var View = function (socket) {

    this.socket = socket;

    this.introView = null;
    this.scene = null;
    this.camera = null;
    this.target = null;
    this.renderer = null;
    this.container = null;
    this.raycaster = null;

    this.data = null;
    this.users = [];
    this.userContainers = [];
    this.counter = 0;

    this.directionHelper = null;
    this.paths = null;
    this.planesController = null;
    this.enviromentView = null;
    this.audio = null;
    this.portalRTT = null;
    this.sphere = null;

    this.isEnvironmentOn = true;

    this.isVR = false;
    this.isIOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

    this.logSocketInfo = false;

    this.clock = new THREE.Clock(true);

    this.joined = false;

    this.FOG_FAR = 320;//220;//180;

    if (DEBUG_MODE) this.debugPanel = new DebugPanel(this);

    this.character = null;

    this.textures = {

        '#ff0000' : THREE.ImageUtils.loadTexture('assets/img/dodecahedron_red.jpg'),
        '#00ff00' : THREE.ImageUtils.loadTexture('assets/img/dodecahedron_green.jpg'),
        '#ffffff' : THREE.ImageUtils.loadTexture('assets/img/dodecahedron_blue.jpg')
    };
};

View.prototype.init = function () {

    window.NO_HATCHING = true;
    this.addEvents();
    this.setup();

    this.createGeometry();
    this.createDirectionHelper();
    this.createStairsController();

    this.createEnviroment();
    this.createPortalRTT();
    this.createAudio();
    this.resize(window.innerWidth, window.innerHeight);
    this.animate();
};

View.prototype.joinRoom = function (e) {

    this.audio.playFx(2);

    if (!window.IS_DESKTOP) {

        this.planesController.setRandomPlane();
        this.createPaths();

        this.socket.join( { username: e.data.username } );
        this.joined = true;
    }
};

View.prototype.addEvents = function () {

    this.socket.addEventListener('updateUsersData', this.onRefreshUsers.bind(this));
    this.socket.addEventListener('addChar', this.onAddChar.bind(this));
    this.socket.addEventListener('removeChar', this.onRemoveChar.bind(this));

    this.bindOrientationControls = this.setOrientationControls.bind(this);
    window.addEventListener('deviceorientation', this.bindOrientationControls, true);
};

View.prototype.onRefreshUsers = function (data) {

    for (var prop in data.data.users) {

        var obj = data.data.users[prop];

        if (this.users[obj.id] !== undefined && obj.uid != this.socket.uid) {

            this.users[obj.id].cache_position.x = obj.x;
            this.users[obj.id].cache_position.y = obj.y;
            this.users[obj.id].cache_position.z = obj.z;
            this.users[obj.id].cache_rotation.x = obj.rotationX;
            this.users[obj.id].cache_rotation.y = obj.rotationY;
            this.users[obj.id].cache_rotation.z = obj.rotationZ;
            this.users[obj.id].cache_rotation_world.x = obj.rotationWorldX;
            this.users[obj.id].cache_rotation_world.y = obj.rotationWorldY;
            this.users[obj.id].cache_rotation_world.z = obj.rotationWorldZ;

            //console.log(obj.uid, this.users[obj.id].cache_rotation_world.x, this.users[obj.id].cache_rotation_world.y, this.users[obj.id].cache_rotation_world.z)
        }
    }
};

View.prototype.onRemoveChar = function (data) {

    if (this.logSocketInfo) console.log('Removing', data);

    this.userContainers[data.id].remove(this.users[data.id]);
    this.users[data.id] = null;
    delete this.users[data.id];

    this.scene.remove(this.userContainers[data.id]);
    this.userContainers[data.id] = null;
    delete this.userContainers[data.id];

};

View.prototype.onAddChar = function (data) {

    if (this.logSocketInfo) console.log('dispatched addChar', data);

    for (var prop in data.users) {
        if (data.users[prop].uid != this.socket.uid ) {

            if (this.users[data.users[prop].id] === undefined) {

                this.userContainers[data.users[prop].id] = new THREE.Object3D();

                // The mesh will be decided by the info that is stored in the userName
                //var color = new THREE.Color(data.users[prop].name);
                //var material = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, color: color, transparent: true });

                var texture = this.textures[data.users[prop].name];
                var material = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, color: 0xbbbbbb, transparent: true });
                //var material = [
                //
                //    new THREE.MeshBasicMaterial({ side: THREE.FrontSide, color: color }),
                //    new THREE.MeshBasicMaterial( { color: 0xcccccc, wireframe: true} )
                //] ;


                this.character.meshes[0].geometry.center();

                //this.users[data.users[prop].id] = new THREE.Mesh(this.character.meshes[0].geometry, this.character.material1);
                this.users[data.users[prop].id] = new THREE.Mesh(this.character.meshes[0].geometry, material);
                //this.users[data.users[prop].id] = THREE.SceneUtils.createMultiMaterialObject(this.character.meshes[0].geometry, material);

                this.users[data.users[prop].id].scale.x = this.character.scale;
                this.users[data.users[prop].id].scale.y = this.character.scale;
                this.users[data.users[prop].id].scale.z = this.character.scale;

                // Far away, to hide it at the beginning
                data.users[prop].x = 0;
                data.users[prop].y = 0;
                data.users[prop].z = 0;

                this.users[data.users[prop].id].material.opacity = 0;
                this.users[data.users[prop].id].userData.fading = false;
                this.users[data.users[prop].id].userData.initial = true;


                this.users[data.users[prop].id].position.x = data.users[prop].x;
                this.users[data.users[prop].id].position.y = data.users[prop].y;
                this.users[data.users[prop].id].position.z = data.users[prop].z;

                this.users[data.users[prop].id].rotation.x = data.users[prop].rotationX;
                this.users[data.users[prop].id].rotation.y = data.users[prop].rotationY;
                this.users[data.users[prop].id].rotation.z = data.users[prop].rotationZ;

                this.userContainers[data.users[prop].id].rotation.x = data.users[prop].rotationWorldX;
                this.userContainers[data.users[prop].id].rotation.y = data.users[prop].rotationWorldY;
                this.userContainers[data.users[prop].id].rotation.z = data.users[prop].rotationWorldZ;

                this.users[data.users[prop].id].cache_position = {
                    x: data.users[prop].x,
                    y: data.users[prop].y,
                    z: data.users[prop].z
                };
                this.users[data.users[prop].id].cache_rotation = {
                    x: data.users[prop].rotationX,
                    y: data.users[prop].rotationY,
                    z: data.users[prop].rotationZ
                };

                this.users[data.users[prop].id].cache_rotation_world = {
                    x: data.users[prop].rotationWorldX,
                    y: data.users[prop].rotationWorldY,
                    z: data.users[prop].rotationWorldZ
                }

                this.userContainers[data.users[prop].id].add(this.users[data.users[prop].id]);
                this.scene.add(this.userContainers[data.users[prop].id]);

                //this.planesController.container.add(this.userContainers[data.users[prop].id]);

            } else {

                // UPDATE COLOR
                //this.users[data.users[prop].id].material.color = new THREE.Color(data.users[prop].name);

                // UPDATE TEXTURE
                this.users[data.users[prop].id].material.map = this.textures[data.users[prop].name];
                this.users[data.users[prop].id].material.needsUpdate = true;
            }
        }
    }
};

View.prototype.setup = function () {

    var colorFog = ( window.NO_HATCHING ) ? 0xbbbbbb : 0x000000;

    this.introView = new IntroView(this);
    this.introView.addEventListener('clickJoin', this.joinRoom.bind(this));

    this.container = document.getElementById('container');

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;
    this.renderer.setClearColor(colorFog, 1);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 10000);

    this.target = new THREE.Vector3(0, 0, 0);

    this.scene = new THREE.Scene();

    this.scene.fog = new THREE.Fog(colorFog, 0, this.FOG_FAR);

    this.effect = new THREE.StereoEffect(this.renderer);

    if (!this.is_touch_device()) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.rotateUp(Math.PI);
        this.controls.target.set(
            this.camera.position.x + 0.1,
            this.camera.position.y,
            this.camera.position.z
        );
        this.controls.noZoom = true;
        this.controls.noPan = true;
    } else {
        this.isVR = true;
        if (this.isIOS) this.preventSleep();

        this.controls = new THREE.DeviceOrientationControls(this.camera, true);
        this.controls.connect();
        //this.controls.update();

        this.renderer.domElement.addEventListener('click', this.fullscreen.bind(this), false);
    }

    if (!this.joined) {

        this.camera.position.set(-38.73887977373559, -4.475810659844891, 41.242743759518184);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    this.raycaster = new THREE.Raycaster();

    if( !window.isAndroid ) {
        this.simulator = new Simulator({
            renderer: this.renderer,
            positionsGeom: null,
            sizeW: window.isGenericAndroid ? 64 : 128,
            sizeH: window.isGenericAndroid ? 64 : 128
        });
    }

    //this.onLoadImage();

};

View.prototype.onLoaded = function () {

    // We do the socket connection now
    this.socket.init();
}


// View.prototype.onLoadImage = function() {
//     THREE.ImageUtils.crossOrigin = '*';
//     this.avatarMaterial = new THREE.MeshBasicMaterial({
//         map: new THREE.ImageUtils.loadTexture( 'http://sirokos.com/proxy.php?url=' + encodeURI('https://twitter.com/sirokos/profile_image?size=original') ),
//         specular: 0xffffff,
//         shininess: 20,
//         shading: THREE.FlatShading
//     });

//     this.avatarMaterial.side = THREE.DoubleSide;

//     this.planeAvatar = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10, 10, 2, 2), this.avatarMaterial );
//     this.planeAvatar.position.y = -10;
//     this.planeAvatar.rotation.y = Math.PI;
//     this.scene.add( this.planeAvatar );
// };

View.prototype.is_touch_device = function () {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
};

View.prototype.setOrientationControls = function (e) {

    if (!e.alpha) {

        return;
    }

    //this.controls.disposed = true;

    //this.isVR = true;
    //if (this.isIOS) this.preventSleep();
    //
    //this.controls = new THREE.DeviceOrientationControls(this.camera, true);
    //this.controls.connect();
    ////this.controls.update();
    //
    //this.renderer.domElement.addEventListener('click', this.fullscreen.bind(this), false);

    window.removeEventListener('deviceorientation', this.bindOrientationControls, true);
};


View.prototype.updateUserPosition = function (position, target) {

    this.camera.position.copy(position);
    if (!this.isVR) {
        this.controls.target.copy(target);
        setTimeout(function(){
            this.controls.rotateUp(-THREE.Math.degToRad(50));
            this.controls.update();
        }.bind(this), 300);

    }
};


View.prototype.createGeometry = function () {

};

View.prototype.createDirectionHelper = function () {

    this.container = new THREE.Object3D();
    this.scene.add(this.container);

    this.directionHelper = new DirectionHelper(this.container);
};

View.prototype.createStairsController = function () {

    this.planesController = new PlanesController(this.scene);
};

View.prototype.createPaths = function () {

    this.paths = new Paths(this, this.directionHelper, this.planesController.getCurrentPaths(), this.planesController.getCurrentIndex());
};

View.prototype.createEnviroment = function () {

    this.enviromentView = new EnviroView(this.planesController.container);
    this.enviromentView.addEventListener('loaded', this.onPreloadElement.bind(this));

    if (this.isEnvironmentOn) {

        //this.sphere.visible = false;
        this.enviromentView.show();
    }

    this.character = new Character();
    this.character.addEventListener('loaded', this.onPreloadElement.bind(this));

    if( !window.isAndroid ) {
        this.scene.add(this.simulator.bufferMesh);
    }
};

View.prototype.toggleEnvironment = function () {

    this.isEnvironmentOn = !this.isEnvironmentOn;

    if (this.isEnvironmentOn) {

        this.sphere.visible = false;
        this.enviromentView.show();

    } else {

        this.sphere.visible = true;
        this.enviromentView.hide();
    }
};

View.prototype.createPortalRTT = function () {

    this.portalRTT = new PortalRTT(this);
};

View.prototype.createAudio = function () {

    this.audio = new Audio({

        view: this,
        callback: function () {

        }
    });

    this.audio.addEventListener('loaded', this.onPreloadElement.bind(this));
};

View.prototype.update = function (dt) {

    //this.simulator.bufferMesh.position.copy(this.camera.position);

    if (this.joined) {
        this.camera.updateProjectionMatrix();
        this.controls.update();

        this.directionHelper.update(this.camera, this.raycaster);
    }

    if (!window.NO_HATCHING) {

        this.character.material1.uniforms.fogFar.value = this.scene.fog.far;
        this.enviromentView.material1.uniforms.fogFar.value = this.scene.fog.far;
        this.enviromentView.material2.uniforms.fogFar.value = this.scene.fog.far;
        this.enviromentView.material3.uniforms.fogFar.value = this.scene.fog.far;
        this.enviromentView.material4.uniforms.fogFar.value = this.scene.fog.far;

        this.character.material1.uniforms.fogNear.value = this.scene.fog.near;
        this.enviromentView.material1.uniforms.fogNear.value = this.scene.fog.near;
        this.enviromentView.material2.uniforms.fogNear.value = this.scene.fog.near;
        this.enviromentView.material3.uniforms.fogNear.value = this.scene.fog.near;
        this.enviromentView.material4.uniforms.fogNear.value = this.scene.fog.near;
    }

    if (this.portalRTT !== null) this.portalRTT.update();
};

View.prototype.render = function (dt) {

    if (this.portalRTT !== null) this.portalRTT.render();

    if (this.isVR && this.joined) {
        if( !window.isAndroid ) {
            this.simulator.update();
        }
        this.renderer.setRenderTarget(null); // add this line
        this.effect.render(this.scene, this.camera);
    }else {
        if( !window.isAndroid ) {
            this.simulator.update();
        }
        this.renderer.setRenderTarget(null); // add this line
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
    }
};

View.prototype.animate = function () {

    window.requestAnimationFrame(this.animate.bind(this));

    this.update(this.clock.getDelta());
    this.render(this.clock.getDelta());

    for (var prop in this.users) {

        if (
            (this.users[prop].uid != this.socket.uid) &&
            (this.users[prop].userData.fading !== true)
        ) {

            // If the distance is big, don't ease it, just go ( portals )
            var incX = this.users[ prop ].cache_position.x - this.users[ prop ].position.x,
                incY = this.users[ prop ].cache_position.y - this.users[ prop ].position.y,
                incZ = this.users[ prop ].cache_position.z - this.users[ prop ].position.z;

            if ( (incX < 10 && incX > -10) && (incY < 10 && incY > -10) && (incZ < 15 && incZ > -15) ) {

                this.users[ prop ].position.x += incX / 5;
                this.users[ prop ].position.y += incY / 5;
                this.users[ prop ].position.z += incZ / 5;

            } else {

                // JUMP:
                // We fade it out, then move it and fade it in.

                this.users[prop].visible = true;
                this.users[prop].userData.initial = false;

                var user = this.users[ prop ],
                    planesCt = this.planesController,
                    container = this.userContainers[ prop ],
                    containerRotation = new THREE.Vector3(
                        this.users[ prop ].cache_rotation_world.x,
                        this.users[ prop ].cache_rotation_world.y,
                        this.users[ prop ].cache_rotation_world.z
                    );

                TweenMax.to( this.users[ prop ].material, 0.5, {

                    opacity    : 0.0,
                    onComplete : function () {

                        user.position.x = user.cache_position.x;
                        user.position.y = user.cache_position.y;
                        user.position.z = user.cache_position.z;

                        container.rotation.x = planesCt.getRotation().x - containerRotation.x;
                        container.rotation.y = planesCt.getRotation().y - containerRotation.y;
                        container.rotation.z = planesCt.getRotation().z - containerRotation.z;

                        TweenMax.to( user.material, 0.5, {

                            opacity    : 1.0,
                            onComplete : function () {

                                user.userData.fading = false;
                            }
                        } );
                    }
                } );

                this.users[ prop ].userData.fading = true;
            }

            this.users[ prop ].rotation.x = this.users[ prop ].cache_rotation.x;
            this.users[ prop ].rotation.y = this.users[ prop ].cache_rotation.y;
            this.users[ prop ].rotation.z = this.users[ prop ].cache_rotation.z;

            if ( this.users[ prop ].userData.fading !== true ) {
                // We need to counteract the rotation of this current user
                this.userContainers[ prop ].rotation.x = this.planesController.getRotation().x - this.users[ prop ].cache_rotation_world.x;
                this.userContainers[ prop ].rotation.y = this.planesController.getRotation().y - this.users[ prop ].cache_rotation_world.y;
                this.userContainers[ prop ].rotation.z = this.planesController.getRotation().z - this.users[ prop ].cache_rotation_world.z;


                // Check distance to the camera
                // If it's in the same plane and it's close, we change the opacity!
                if (
                    this.users[prop].userData.initial === false &&
                    this.users[ prop ].cache_rotation_world.x === this.planesController.getRotation().x &&
                    this.users[ prop ].cache_rotation_world.y === this.planesController.getRotation().y &&
                    this.users[ prop ].cache_rotation_world.z === this.planesController.getRotation().z
                ) {

                    var dx = this.camera.position.x - this.users[ prop ].position.x,
                        dy = this.camera.position.y - this.users[ prop ].position.y,
                        dz = this.camera.position.z - this.users[ prop ].position.z,
                        distance  = Math.sqrt(dx * dx + dy * dy + dz * dz),
                        opacity = Math.max(0, Math.min( 1, 0.5 * (distance - 10)));

                    this.users[ prop ].material.opacity = opacity;
                }
            }
        }
    }

    if (this.counter % 10 == 0 && this.joined) {

        this.socket.refreshUserData({

            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z,
            rotationX: this.camera.rotation.x,
            rotationY: this.camera.rotation.y,
            rotationZ: this.camera.rotation.z,
            rotationWorldX: this.planesController.getRotation().x,
            rotationWorldY: this.planesController.getRotation().y,
            rotationWorldZ: this.planesController.getRotation().z
        });
    }

    this.counter++;
};

View.prototype.resize = function (w, h) {

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.effect.setSize(w, h);
};

View.prototype.fullscreen = function () {

    if (this.container.requestFullscreen) {
        this.container.requestFullscreen();
    } else if (this.container.msRequestFullscreen) {
        this.container.msRequestFullscreen();
    } else if (this.container.mozRequestFullScreen) {
        this.container.mozRequestFullScreen();
    } else if (this.container.webkitRequestFullscreen) {
        this.container.webkitRequestFullscreen();
    }
}

View.prototype.preventSleep = function () {

    setInterval(function () {

        window.location.href = '/new/page';
        window.setTimeout(function () {
            window.stop();
        }, 0);

    }, 30000);
};

View.prototype.onPreloadElement = function () {

    this.introView.preloadedElement();
};

module.exports = View;
},{"../audio/Audio":14,"../path/Paths":17,"../path/PortalRTT":19,"../ui/DirectionHelper":21,"../utils/DebugPanel":24,"../utils/Simulator":25,"./Character":26,"./EnviroView":27,"./IntroView":29,"./PlanesController":32}]},{},[13])


//# sourceMappingURL=bundle.js.map
