


//// BALLS //// BALLS //// BALLS //// BALLS //// BALLS //// BALLS //// BALLS //// BALLS //// BALLS //// BALLS 
    
    function createBalls(){



      var balls = [];

      var p = new THREE.Vector3();

      for( var i = 0; i < 20; i++ ){


        var z = (Math.random() * .8 + .2) * .5;
        var x  = z * 4;
        var y = 4 + Math.random() * 1.;

        var ballMat = new THREE.ShaderMaterial({

          uniforms:{

            uPower        : uniforms.uPower,
            time          : uniforms.time,
            dT            : uniforms.dT,
            lightPosition : uniforms.lightPosition,
            t_audio       : uniforms.t_audio,
            iModelMat     : { type:"m4" , value: new THREE.Matrix4() },
            uDimensions    : { type:"v3" , value: new THREE.Vector3(x,y,z) },
            uID:{type:"f",value:i/20},
            uHovered:{type:"f",value:0},

          }, 

          vertexShader: shaders.vs.raytrace,
          fragmentShader: shaders.fs.spirit

        });




        var b = new THREE.Mesh( new THREE.BoxGeometry( x , y , z ) , ballMat );
        //var b = new THREE.Mesh( new THREE.BoxGeometry( .5 , 4.6 , 1.5 ) , ballMat );



      // var b = ball.clone();

        var angle = .4 * Math.random() * 2 * Math.PI - Math.PI * .9;
        var radius = Math.random() * 10  + 12;

        b.position.x = Math.sin( angle ) * radius;
        b.position.z = Math.cos( angle ) * radius;
        //b.position.x = (Math.random()-1.3 ) * 20.
        //b.position.z = (Math.random()-.5 ) * 20.
        b.position.y = 5  + Math.random() * 15;

        //b.scale.z = Math.random() * .8 + .2;
        //b.scale.x = b.scale.z * 4;

        b.id = i;

     

        b.audioParams = {

          baseOffset: Math.random() * .8,
          attack    : .140 * 2.,
          release   : .140 * 6.3,
          trans     : .6// + Math.random() * .5

        }

        b.select = function(){

          uniforms.uPower.value = 1.;
          dissipationFactor = .9;

          ap = {
            baseOffset: this.audioParams.baseOffset,
            attack: .140 * .5,
            release: .140 * 2.,
            trans: 1.2

          }

          grain.playNote( ap );

        }

        b.hoverOver = function(){

          grain.playNote( this.audioParams );
          this.material.uniforms.uHovered.value = 1.;

        }

        b.hoverOut = function(){

          this.material.uniforms.uHovered.value = 0.;

        }


        b.lookAt( light.position );
        treeObj.add( b );
        objectControls.add( b );

        balls.push( b );

      }

      return balls;


    }




//// SKY //// SKY //// SKY //// SKY //// SKY //// SKY //// SKY //// SKY //// SKY //// SKY 

    function extraMesh(){


      var mat = new THREE.ShaderMaterial({
        uniforms:{ t_audio: uniforms.t_audio , time : uniforms.time, uHovered:{type:"f",value:0},} ,
        vertexShader: shaders.vs.basic,
        fragmentShader: shaders.fs.sky,
        side: THREE.BackSide
      });

      var m = new THREE.Mesh( new THREE.IcosahedronGeometry( 30 , 3 ) , mat );
      
      m.position.y = -4.;
      m.position.x = -6;

      return m;

    }


//// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT //// LIGHT 



    function makeLight(treeParams ){



      var lightMat = new THREE.ShaderMaterial({
        uniforms:{
          uPower : uniforms.uPower,
          t_audio: uniforms.t_audio,
          time: uniforms.time,
          dT: uniforms.dT,
          lightPosition: uniforms.lightPosition,
          iModelMat:{ type:"m4" , value: new THREE.Matrix4() },
          cubeMap : {type:"t" , value:null},
          uHovered:{type:"f",value:0},
        },
        vertexShader: shaders.vs.raytrace,
        fragmentShader: shaders.fs.noglo,
        transparent: true,
        //opacity: 1.,

      })

      var light = new THREE.Mesh( new THREE.IcosahedronGeometry( treeParams.lightSize * .8 , 4 ), lightMat );
      light.position.copy( treeParams.lightPosition )


   
      light.select = function(){


        var audioParams =  {

          baseOffset: Math.random() * .83,
          attack    : .140 * 30.,
          release   : .140 * 80.3,
          trans     : .6// + Math.random() * .5

        }

        //uniforms.uPower.value = 1.;

        uniforms.uPower.value = -.95;
        dissipationFactor = .996;


        grain.playNote( audioParams );

      }


      light.hoverOver = function(){

        this.material.uniforms.uHovered.value = 1.;

         var audioParams =  {

          baseOffset: Math.random() * .83,
          attack    : .140 * 1.,
          release   : .140 * 4.3,
          trans     : .3// + Math.random() * .5

        }


        grain.playNote( audioParams );

      }

      light.hoverOut = function(){

        this.material.uniforms.uHovered.value = 0.;

      }

      objectControls.add(light );

      uniforms.lightPosition.value.copy( light.position );

      return light;

    }




//// GROUND //// GROUND //// GROUND //// GROUND //// GROUND //// GROUND //// GROUND //// GROUND //// GROUND //// GROUND 


    function makeGround(){


      var mat = new THREE.ShaderMaterial({
        uniforms : {

          uPower : uniforms.uPower,
          t_audio : uniforms.t_audio,
          dT : uniforms.dT,
          time : uniforms.time,
          lightPosition : uniforms.lightPosition,
          //max( dot( vNorm , lightDir), 0.);
          iModelMat:{ type:"m4" , value: new THREE.Matrix4() },
          uHovered:{type:"f",value:0},

      
        },
        vertexShader: shaders.vs.basic,
        fragmentShader: shaders.fs.floor,
       // side: THREE.BackSide
        shading: THREE.FlatShading
      });


      var ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100 , 100 , 300 , 300 ) , mat );
      ground.rotation.x = -Math.PI/2;
      ground.position.y = 0;

     /* ground.hoverOut = function(){

        this.material.uniforms.uHovered.value = 0.;

      }


      ground.hoverOver = function(){

        this.material.uniforms.uHovered.value = 1.;

      }


      ground.select = function(){
        uniforms.uPower.value = .1;
        dissipationFactor = .999


        var audioParams =  {

          baseOffset: .1 + Math.random() * .2,
          attack    : .140 * 30.,
          release   : .140 * 80.3,
          trans     : .15// + Math.random() * .5

        }

        grain.playNote( audioParams );
      }

      objectControls.add( ground );*/

      return ground;
    }

//// PEDESTAL //// PEDESTAL //// PEDESTAL //// PEDESTAL //// PEDESTAL //// PEDESTAL //// PEDESTAL //// PEDESTAL //// PEDESTAL //// PEDESTAL 


    function makePedestal(){


      var mat = new THREE.ShaderMaterial({
        uniforms : {

          uPower : uniforms.uPower,
          t_audio : uniforms.t_audio,
          dT : uniforms.dT,
          time : uniforms.time,
          lightPosition : uniforms.lightPosition,
          //max( dot( vNorm , lightDir), 0.);
          iModelMat:{ type:"m4" , value: new THREE.Matrix4() },
          uHovered:{type:"f",value:0},

      
        },
        vertexShader: shaders.vs.raytrace,
        fragmentShader: shaders.fs.pedestal,
       // side: THREE.BackSide
       shading: THREE.FlatShading

      });


      var pedestal = new THREE.Mesh( new THREE.CylinderGeometry( 10 , 14 , 1, 6 ) , mat );
      //pedestal.rotation.x = -Math.PI/2;
      pedestal.position.y = .5;
      pedestal.position.x = -2;

      pedestal.hoverOut = function(){

        this.material.uniforms.uHovered.value = 0.;

      }


      pedestal.hoverOver = function(){

        this.material.uniforms.uHovered.value = 1.;

        var audioParams =  {

          baseOffset: .1 + Math.random() * .7,
          attack    : .140 * 1.,
          release   : .140 * 4.3,
          trans     : .3// + Math.random() * .5

        }

        grain.playNote( audioParams );

      }


      pedestal.select = function(){

        uniforms.uPower.value = .1;
        dissipationFactor = .999


        var audioParams =  {

          baseOffset: .1 + Math.random() * .2,
          attack    : .140 * 30.,
          release   : .140 * 80.3,
          trans     : .15// + Math.random() * .5

        }

        grain.playNote( audioParams );
      }

      objectControls.add( pedestal );

      return pedestal;
    }







//// MONK //// MONK //// MONK //// MONK //// MONK //// MONK //// MONK //// MONK //// MONK //// MONK 


    function createMonk(){


      var geo = new THREE.BoxGeometry( 3. , 4.6 , 3. );
      var mat = new THREE.ShaderMaterial({
        uniforms : {

          uPower : uniforms.uPower,
          t_audio : uniforms.t_audio,
          dT : uniforms.dT,
          time : uniforms.time,
          lightPosition : uniforms.lightPosition,
          //max( dot( vNorm , lightDir), 0.);
          iModelMat:{ type:"m4" , value: new THREE.Matrix4() },
          uHovered:{type:"f",value:0},
      
        },
        vertexShader: shaders.vs.raytrace,
        fragmentShader: shaders.fs.monk,
        transparent: true

      })

      var mesh = new THREE.Mesh( geo , mat );
      
      mesh.position.x = -8;
      mesh.position.y = 3.3;

      mesh.hoverOver = function(){


        var audioParams =  {

          baseOffset: Math.random() * .2 + 0.6,
          attack    : .140 * 2.,
          release   : .140 * 10.3,
          trans     : 1.2// + Math.random() * .5

        }


        grain.playNote( audioParams );
        this.material.uniforms.uHovered.value = 1.;

      }

      mesh.hoverOut = function(){

        this.material.uniforms.uHovered.value = 0.;

      }

      mesh.select = function(){
        uniforms.uPower.value = 4.;
        dissipationFactor = .8;

        ap = {
          baseOffset: Math.random() * .2 + 0.7,
          attack: .140 * .1,
          release: .140 * 3.,
          trans: .3

        }

        grain.playNote( ap );

      }


      objectControls.add( mesh );


      return mesh;

    }



//// ABOUT
  function makeAbout(){


      var geo = new THREE.BoxGeometry( 1. , 4.6 , 1. );
      var mat = new THREE.MeshLambertMaterial();

      var mesh = new THREE.Mesh( geo , mat );
      
      mesh.position.x = 20;
      mesh.position.z = -20;
      mesh.position.y = 4.3;

      mesh.hoverOver = function(){


        var audioParams =  {

          baseOffset: Math.random() * .2 + 0.6,
          attack    : .140 * 2.,
          release   : .140 * 10.3,
          trans     : 1.2// + Math.random() * .5

        }


        grain.playNote( audioParams );
        //this.material.uniforms.uHovered.value = 1.;

      }

      mesh.hoverOut = function(){

        //this.material.uniforms.uHovered.value = 0.;

      }

      mesh.select = function(){
       // uniforms.uPower.value = 4.;
       // dissipationFactor = .8;

        ap = {
          baseOffset: Math.random() * .2 + 0.7,
          attack: .140 * .1,
          release: .140 * 3.,
          trans: .3

        }

        grain.playNote( ap );

        $("#info").fadeToggle();

      }


      objectControls.add( mesh );


      return mesh;

    }



