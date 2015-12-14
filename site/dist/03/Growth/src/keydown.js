
    function keydown( e ) {
      //console.log( e )
      if( e.keyCode == 82 )
        renderer.render( scene , camera );

      console.log( e.keyCode )

      if( e.keyCode == 49 ){ uniforms.parameter1.value  += .1 }
      if( e.keyCode == 81 ){ uniforms.parameter1.value  -= .1 }

      if( e.keyCode == 50 ){ uniforms.parameter2.value  += .1 }
      if( e.keyCode == 87 ){ uniforms.parameter2.value  -= .1 }

      if( e.keyCode == 51 ){ uniforms.parameter3.value  += .1 }
      if( e.keyCode == 69 ){ uniforms.parameter3.value  -= .1 }

      if( e.keyCode == 52 ){ uniforms.parameter4.value  += .1 }
      if( e.keyCode == 82 ){ uniforms.parameter4.value  -= .1 }

      if( e.keyCode == 53 ){ uniforms.parameter5.value  += .1 }
      if( e.keyCode == 84 ){ uniforms.parameter5.value  -= .1 }

      if( e.keyCode == 54 ){ uniforms.parameter6.value  += .1 }
      if( e.keyCode == 89 ){ uniforms.parameter6.value  -= .1 }

      if( e.keyCode == 32 ){ toggleMovement(); }

    }

    function toggleMovement(){

      moving = !moving;

    }

