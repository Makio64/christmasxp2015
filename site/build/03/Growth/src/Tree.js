function Tree( params  ){


  this.params = params;
  var material = params.material

  var geo = this.createGeo( params );

  var mesh = new THREE.Mesh( geo , material );


  mesh.curves = this.curves;
  mesh.cleanCurves = this.cleanCurves;

  return mesh;

}


Tree.prototype.assignAttributes = function( positions , normals, uvs , curve , slices , sides , startingIndex ){



  var numOf = slices * sides;

  // Two parts,
  // creation of points,
  // creation of geometry

  var total = 0;

  var points = [];

  for( var i = 0; i < curve.length; i++ ){

    var slicePoints = [];

    var theta = (i / (4* slices) ) * 2 * Math.PI - (Math.PI /4) ;
    var thetaUp = ((i+.1) / (4* slices) ) * 2 * Math.PI- (Math.PI /4);

    var center = curve[i];
    var norm = center.normal;

    var upVector = new THREE.Vector3( 0 , 0 ,1);

    var upVectorProj = upVector.dot( norm );
    var upVectorPara = norm.clone().multiplyScalar( upVectorProj );
    var upVectorPerp = upVector.clone().sub( upVectorPara );

    var basisX = upVectorPerp.normalize();
    var basisY = norm.clone().cross( basisX );

    for( var j = 0; j < sides; j++ ){

      var theta = (j / sides ) * 2 * Math.PI;

      var x = Math.cos( theta );
      var y = Math.sin( theta );

      var r = center.radius;//*Math.sin(i)*(i/centerPoints.length);// Math.random() * 1 + 300;

      var point = center.clone();

      var xVec = basisX.clone().multiplyScalar( r * x );
      var yVec = basisY.clone().multiplyScalar( r * y );

      point.add( xVec );
      point.add( yVec );

      slicePoints.push( point );

    }
   
    points.push( slicePoints );

  }


  for( var  i = 0; i <( slices-1); i++ ){

    var slicePoints = points[i];
    var slicePointsUp = points[i+1];

    for( var j = 0; j < sides; j++ ){

      var sUp = j +1;
      if( sUp == sides ){

        sUp = 0;

      }

      var p = slicePoints[j];         // regular point
      var pR = slicePoints[ sUp ];   // up in side
      var pU = slicePointsUp[j];      // up in slice
      var pB = slicePointsUp[sUp];    // up in both


      var centerPoint = curve[i];
      var centerPointUp = curve[i+1];


      var n =  p.clone().sub( centerPoint ).normalize();
      var nR = pR.clone().sub( centerPoint ).normalize();
      var nU = pU.clone().sub( centerPointUp ).normalize();
      var nB = pB.clone().sub( centerPointUp ).normalize();
    

      var index   = startingIndex + ((i * sides) + j ) * 6 * 3 ;
      var uvIndex = startingIndex  * (2/3) + ((i * sides) + j ) * 6 * 2 ;
      
      positions[ index + 0  ] = p.x; 
      positions[ index + 1  ] = p.y; 
      positions[ index + 2  ] = p.z;
      
      positions[ index + 3  ] = pR.x; 
      positions[ index + 4  ] = pR.y; 
      positions[ index + 5  ] = pR.z;
      
      positions[ index + 6  ] = pB.x; 
      positions[ index + 7  ] = pB.y; 
      positions[ index + 8  ] = pB.z;

      positions[ index + 9  ] = pB.x; 
      positions[ index + 10 ] = pB.y; 
      positions[ index + 11 ] = pB.z;
     
      positions[ index + 12 ] = pU.x; 
      positions[ index + 13 ] = pU.y; 
      positions[ index + 14 ] = pU.z;
      
      positions[ index + 15 ] = p.x; 
      positions[ index + 16 ] = p.y; 
      positions[ index + 17 ] = p.z;

      normals[ index + 0  ] = n.x; 
      normals[ index + 1  ] = n.y; 
      normals[ index + 2  ] = n.z;
      
      normals[ index + 3  ] = nR.x; 
      normals[ index + 4  ] = nR.y; 
      normals[ index + 5  ] = nR.z;
      
      normals[ index + 6  ] = nB.x; 
      normals[ index + 7  ] = nB.y; 
      normals[ index + 8  ] = nB.z;

      normals[ index + 9  ] = nB.x; 
      normals[ index + 10 ] = nB.y; 
      normals[ index + 11 ] = nB.z;
     
      normals[ index + 12 ] = nU.x; 
      normals[ index + 13 ] = nU.y; 
      normals[ index + 14 ] = nU.z;
      
      normals[ index + 15 ] = n.x; 
      normals[ index + 16 ] = n.y; 
      normals[ index + 17 ] = n.z;

      var p = slicePoints[j];         // regular point
      var pR = slicePoints[ sUp ];   // up in side
      var pU = slicePointsUp[j];      // up in slice
      var pB = slicePointsUp[sUp];    // up in both


      uvs[ uvIndex + 0  ] = j / sides; 
      uvs[ uvIndex + 1  ] = i / slices; 

      uvs[ uvIndex + 2  ] = sUp / sides; 
      uvs[ uvIndex + 3  ] = i / slices; 

      uvs[ uvIndex + 4  ] = sUp / sides; 
      uvs[ uvIndex + 5  ] = (i+1) / slices; 

      uvs[ uvIndex + 6  ] = sUp / sides; 
      uvs[ uvIndex + 7  ] = (i+1) / slices; 

      uvs[ uvIndex + 8  ] = j / sides; 
      uvs[ uvIndex + 9  ] = (i+1) / slices; 

      uvs[ uvIndex + 10  ] = j / sides; 
      uvs[ uvIndex + 11  ] = i / slices; 

    

      //console.log( uvIndex + 17 );


      total += 18;
    }


  }

  //geometry.computeFaceNormals();
  //geometry.computeVertexNormals();



}



Tree.prototype.createCleanCurve = function( crudePoints , cleanCurveLength ){


  var cleanPoints = [];

  for( var i = 0.0000001; i < cleanCurveLength; i++ ){

    var base = ( i / cleanCurveLength ) * (crudePoints.length-1);

    var baseUp   = Math.ceil( base );
    var baseDown = Math.floor( base );

    var pDown = crudePoints[ baseDown ];
    var pUp   = crudePoints[ baseUp ];

    if( baseUp == baseDown ){

      console.log( 'NOOO' );

    }

    var amount = base - baseDown;

    //console.log( amount );

    var p0 = new THREE.Vector3(0,0,0);
    var p1 = new THREE.Vector3(0,0,0);
    var v0 = new THREE.Vector3(0,0,0);
    var v1 = new THREE.Vector3(0,0,0);

    var p2 = new THREE.Vector3(0,0,0);
    var p3 = new THREE.Vector3(0,0,0);

    if( baseDown == 0 ){

      if( !crudePoints[baseUp+1] ) console.log( crudePoints );
      p0 = crudePoints[ baseDown       ].clone();
      p1 = crudePoints[ baseUp     ].clone();
      p2 = crudePoints[ baseUp + 1 ].clone(); 

      v1 =  p2.clone();
      v1.sub( p0.clone() );
      v1.multiplyScalar( .5 );

    }else if( baseUp == crudePoints.length -1 ){
      
     
      p0 = crudePoints[ baseDown].clone();
      p1 = crudePoints[ baseUp ].clone();
      p2 = crudePoints[ baseDown - 1 ].clone();

      v0 = p1.clone().sub( p2 );
      v0.multiplyScalar( .5 );

    }else{

      p0 = crudePoints[ baseDown ].clone();
      p1 = crudePoints[ baseUp ].clone();

      p2 = crudePoints[ baseUp + 1 ].clone();
      p3 = crudePoints[ baseDown - 1 ].clone();

      v1 = p2.clone();
      v1.sub( p0 );
      v1.multiplyScalar( .5 );

      v0 = p1.clone();
      v0.sub( p3 );
      v0.multiplyScalar( .5 );


    }


    v0.multiplyScalar( 1/3 );
    v1.multiplyScalar( 1/3 );

    v0.multiplyScalar( 1 );
    v1.multiplyScalar( 1 );

    var c0 = p0.clone();
    var c1 = p0.clone().add( v0 );
    var c2 = p1.clone().sub( v1 );
    var c3 = p1.clone();

    var point   = this.cubicCurve( amount , c0 , c1 , c2 , c3 );
    var forNorm = this.cubicCurve( amount + .01 , c0 , c1 , c2 , c3 );



    point.normal = forNorm.sub( point ).normalize();

    point.radius = pDown.radius + (pUp.radius - pDown.radius ) * amount;

    cleanPoints.push( point );

  }


  return cleanPoints;

}



Tree.prototype.cubicCurve = function( t , c0 , c1 , c2 , c3 ){

  var s = 1 - t;

  var v0 = c0.clone().multiplyScalar( s * s * s );
  var v1 = c1.clone().multiplyScalar( 3 * s * s * t );
  var v2 = c2.clone().multiplyScalar( 3 * s * t * t );
  var v3 = c3.clone().multiplyScalar( t * t * t );

  var v = new THREE.Vector3();
  
  v.add( v0 );
  v.add( v1 );
  v.add( v2 );
  v.add( v3 );

  return v;


}



Tree.prototype.createGeo = function( params ){

  var p = _.defaults( params || {} , {

    radius:                 1,
    height:                   10,
    sides:                    10,
    numOf:                   19, 
    randomness:             1.,
    slices:                 100,

    startingChance:          2.,
    chanceReducer:           .9,
    randomnessReducer:       .9,
    sliceReducer:            .7,
    numOfReducer:            .7,
    progressionPower:        1.4,
    lengthReduction:         .5,
    maxIterations:           3,

    maxVerts:      100000
  });


  var curves = [];
  this.curves = curves;

  this.totalPoints = 0;

  this.totalClean = 0;
  this.totalVerts = 0;

  var start = new THREE.Vector3();

  var end   = new THREE.Vector3( 0 , p.height , 0 );
  
  this.createTreeCurve( 0 , p.radius, start , end , p  ); 
  var cleanCurves = [];


  var totalClean = 0;

  for( var i = 0; i < curves.length; i++){
 
    if( curves[i][1].length < 3 ){ console.log('NOPE' ); continue; }

    var pNum = Math.floor( p.slices * Math.pow( p.sliceReducer , curves[i][0] ));
    totalClean += (pNum-1);

    cleanCurves.push( [ pNum , this.createCleanCurve( curves[i][1] , pNum ) ] );

  }

  var totalVerts = totalClean * p.sides * 6 * 3;
  //var posA = 
 
  var geometry = new THREE.BufferGeometry();

  geometry.totalVerts = totalVerts;
 // console.log('totalVErts');
 // console.log( this.totalVerts );
 // console.log( totalVerts );

  var posA = new THREE.BufferAttribute( new Float32Array( totalVerts * 3 ), 3 );
  var norA = new THREE.BufferAttribute( new Float32Array( totalVerts * 3 ), 3 ); 
  var uvA = new THREE.BufferAttribute( new Float32Array( totalVerts * 2 ), 2 ); 
  
  geometry.addAttribute( 'position', norA );
  geometry.addAttribute( 'normal', posA );
  geometry.addAttribute( 'uv', uvA );

  var positions = geometry.getAttribute( 'position' ).array;
  var normals = geometry.getAttribute( 'normal' ).array;
  var uvs = geometry.getAttribute( 'uv' ).array;

  var startingIndex = 0;



  this.cleanCurves = cleanCurves;
  for( var i = 0; i < cleanCurves.length; i++ ){


    this.assignAttributes( positions , normals , uvs , cleanCurves[i][1] , cleanCurves[i][0] , p.sides , startingIndex );

    startingIndex += (cleanCurves[i][0]-1) * p.sides * 6 *3 ;
    

  }

  return geometry;


}


Tree.prototype.createTreeCurve = function( iteration , radius , start, end , params ){
  

  var p = params;
  var i = iteration;

 
  if( iteration == p.maxIterations ){
    //console.log('NOPE Iteration');
    return
  };


  var pNum = Math.floor( p.slices * Math.pow( p.sliceReducer , iteration ));
  var totalClean = this.totalClean + (pNum-1);
  var totalVerts = this.totalVerts + (pNum-1) * p.sides * 6;

  if( totalVerts > p.maxVerts ){
   // console.log('demasiado');
    return; 
  }

  var dif = end.clone().sub( start );

  var points = [];


  var pow = Math.pow;
  var fl  = Math.floor;

  var size = fl( p.numOf * pow( p.numOfReducer , i ) );
  var randomness = fl( p.randomness * pow( p.randomnessReducer , i ) );
  var chance = fl( p.startingChance * pow( p.chanceReducer , i ) );


  if( size < 3 ){

    console.log('numoftoosmall');
    return;
  }
  
  var pNum = Math.floor( p.slices * Math.pow( p.sliceReducer , iteration ));
  this.totalClean += (pNum-1);
  this.totalVerts += (pNum-1) * p.sides * 6;


  var NO_MORE_FOR_THE_LOVE_OF_GOD = false;


  if( this.totalVerts > p.maxVerts ){
    console.log( 'FOR THE LOVE OF GOD NO MORE' );
    NO_MORE_FOR_THE_LOVE_OF_GOD = true;
  }



 // console.log( chance );
 
  for( var i = 0; i < size; i++ ){

    var m = size -1 ;
    var x =( (m-i) / m );
   // x *= x * x ;
    
    var point = start.clone().add( dif.clone().multiplyScalar( 1-x ) );
    if( i != 0 ){

      var random = new THREE.Vector3();
      var r = randomness;
      random.x = (Math.random() -.5 ) * r * x;
      random.y = (Math.random() -.5 ) * r * x;
      random.z = (Math.random() -.5 ) * r * x;
      point.add( random );

    }



    var p1 = new THREE.Vector3();
    p1.copy( point );
    p1.sub( params.lightPosition );
    var l = p1.length();


    if( l < params.lightSize ){

      var p2 = new THREE.Vector3();

      p2.copy( params.lightPosition );
      p1.normalize();
      p1.multiplyScalar( params.lightSize * 1.1);
      p2.add( p1 );
      point.copy( p2 );

    }


    
    point.radius = (x) * radius;
    points.push( point );


  }

  this.curves.push( [ iteration , points ]);

  //console.log( totalPoints );
  this.totalPoints += points.length;


  for( var i = size-1; i >= 0; i-- ){

    if( NO_MORE_FOR_THE_LOVE_OF_GOD === false ){

    
      var rand = Math.random();
     
      var cMult =( i / size ) ;

      var finalChance = chance * Math.pow( cMult , p.progressionPower );
   
      var point = points[ i ];
      //console.log(chance);
      if( rand <  finalChance ){//finalChance ){

        var newStart = new THREE.Vector3();
        newStart.copy( point );

        var newDir = dif.clone();
        newDir.normalize();

        var lightDir = new THREE.Vector3();
        lightDir.copy( this.params.lightPosition );
        lightDir.sub( point );

       // lightDir.normalize();


        lightDir.multiplyScalar( .1 )


        if( i !== 0 ){

          newDir.copy( point );
          newDir.sub( points[ i-1] );
          newDir.normalize();

          newDir.add( lightDir );
          newDir.normalize();


          // Flattening out the tree
          newDir.y *= params.flattening
          newDir.normalize();

        }


        var newEnd = newStart.clone();

        var m = size -1 ;
        var x =( (m-i) / m );

      
        newDir.multiplyScalar( dif.length() * p.lengthReduction )
        newEnd.add( newDir );

        var p1 = new THREE.Vector3();
        p1.copy( newEnd );
        p1.sub( params.lightPosition );
        var l = p1.length();
 

        if( l < params.lightSize ){

          var p2 = new THREE.Vector3();

          p2.copy( params.lightPosition );
          p1.normalize();
          p1.multiplyScalar( params.lightSize  * 1.1 );
          p2.add( p1 );
          newEnd.copy( p2 );

        }


        //var cMult = 1 - ( i / size ) ;
        
        this.createTreeCurve( iteration + 1 , radius * x , newStart , newEnd , params ); 


      }

    }



  }


  //return points



}

