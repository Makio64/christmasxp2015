var Link = function( geo , uniforms , shader , select , text , position , textPosition , color ){
  
  var mat = new THREE.ShaderMaterial({

    uniforms: {

      time:          uniforms.time,
      lightPosition1: uniforms.lightPosition1,
      lightPosition2: uniforms.lightPosition2,

      parameter1: { type:"f"  , value : .5 },
      parameter2: { type:"f"  , value : .5 },
      parameter3: { type:"f"  , value : .5 },
      parameter4: { type:"f"  , value : .5 },
      parameter5: { type:"f"  , value : .5 },
      parameter6: { type:"f"  , value : .5 },

      iModelMat:{ type:"m4" , value: new THREE.Matrix4() },
      color: { type:"v3" , value: color },
      lightColor1: uniforms.lightColor1,
      lightColor2: uniforms.lightColor2,

    },
    vertexShader: shaders.vs.holo,
    fragmentShader: shader ,
    transparent: true,
    shading: THREE.FlatShading,
    //side: THREE.DoubleSide
   // blending: THREE.AdditiveBlending

  }); 



  this.mesh = new THREE.Mesh( geo , mat );

  this.mesh.position.copy( position );
  //this.mesh.rotation.x = Math.random();
  //this.mesh.rotation.y = Math.random();
  //this.mesh.rotation.z = Math.random();
  scene.add( this.mesh ); 
  
  this.mesh.hoverOver  = this.hoverOver.bind( this );
  this.mesh.hoverOut   = this.hoverOut.bind( this );
  //this.mesh.mouseUp    = this.mouseUp.bind( this );
  this.mesh.select  = this.select.bind( this );


  objectControls.add( this.mesh );

  this.text = createTextMesh( .5 , text );
  scene.add( this.text );


  this.text.material.opacity = 0;


  this.textPos = textPosition;

  this.update();

  //this.linkTo = linkTo;

  this.wireframe = new THREE.Mesh( geo , new THREE.MeshBasicMaterial({wireframe:true, transparent:true}) );
  this.mesh.add( this.wireframe );
  this.wireframe.material.opacity = 0;

  this.select = select





}

Link.prototype.update = function(){

  this.mesh.updateMatrixWorld();
  this.mesh.material.uniforms.iModelMat.value.getInverse( this.mesh.matrixWorld );
  
  this.mesh.material.uniforms.parameter1.value = this.mesh.position.x;
  this.mesh.material.uniforms.parameter2.value = this.mesh.position.y;
  this.mesh.material.uniforms.parameter3.value = this.mesh.position.z;

  this.mesh.material.uniforms.parameter4.value = this.mesh.rotation.x;
  this.mesh.material.uniforms.parameter5.value = this.mesh.rotation.y;
  this.mesh.material.uniforms.parameter6.value = this.mesh.rotation.z;

  this.text.position.copy( this.mesh.position );
  this.text.position.add( this.textPos );

}

Link.prototype.updateColor = function( color ){

  this.mesh.material.uniforms.color.value.copy( color );

}

Link.prototype.hoverOver = function(){

  console.log( 'HELLOS')
  console.log( this );
  this.text.material.opacity = 1.;
  this.wireframe.material.opacity = 1;

}


Link.prototype.hoverOut = function(){

  this.text.material.opacity = 0.;
  this.wireframe.material.opacity = 0;

}

Link.prototype.select = function(){


  this.select();
  

}
