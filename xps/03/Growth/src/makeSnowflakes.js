function makeSnowflakes( SIZE ){


        var simulationUniforms = {
        
          dT:uniforms.dT,
          time:uniforms.time,
          noiseSize: { type:"f" , value: .1 },
          t_audio: uniforms.t_audio

        }

        var renderUniforms = {

          t_pos:{ type:"t" , value: null },
          t_audio: uniforms.t_audio

        }


      simulation = new PhysicsRenderer( SIZE , shaders.ss.sim , renderer );


      var geo = createLookupGeometry( SIZE );

      var mat = new THREE.ShaderMaterial({
        uniforms: renderUniforms,
        vertexShader: shaders.vs.splat,
        fragmentShader: shaders.fs.splat,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false

      });

      simulation.setUniforms( simulationUniforms );

      var particles = new THREE.PointCloud( geo , mat );
      particles.frustumCulled = false;


      simulation.addBoundTexture( renderUniforms.t_pos , 'output' );


      size = 100;
 
      var data = new Float32Array( SIZE * SIZE  * 4 );

      for( var i =0; i < data.length; i++ ){

        //console.log('ss');
        if( i % 4 == 1 ){
         data[i] = (Math.random() ) * size * .5;
        
        }else{
          data[i] = (Math.random() - .5 ) * size;
        }

        if( i % 4 == 4 ){
          data[i] = 0;
        }


      }

      var texture = new THREE.DataTexture( 
        data,
        this.size,
        this.size,
        THREE.RGBAFormat,
        THREE.FloatType
      );

      texture.minFilter =  THREE.NearestFilter,
      texture.magFilter = THREE.NearestFilter,

      texture.needsUpdate = true;
     

      simulation.reset( texture );

      return{
        body: particles,
        soul: simulation
      }


  }



  function createLookupGeometry( size ){        
        
    var geo = new THREE.BufferGeometry();
    var positions = new Float32Array(  size * size * 3 );

    for ( var i = 0, j = 0, l = positions.length / 3; i < l; i ++, j += 3 ) {

      positions[ j     ] = ( i % size ) / size;
      positions[ j + 1 ] = Math.floor( i / size ) / size;
    
    }

    var posA = new THREE.BufferAttribute( positions , 3 );
    geo.addAttribute( 'position', posA );

    return geo;
    
  }

      