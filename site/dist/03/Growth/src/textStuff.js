    function createTextMesh( size  ,  text ){
  
      var canvas  = document.createElement('canvas');


      var fullSize = 30000;
      var margin = 40;

      var ctx     = canvas.getContext( '2d' ); 


      ctx.font      = fullSize / 100 + "pt GeoSans";
      var textWidth = ctx.measureText( text ).width;

      canvas.width  = textWidth + margin;
      canvas.height = fullSize / 100 + margin;

     
      // Creates a texture
      var texture = new THREE.Texture(canvas);


      updateTextTexture( text , canvas , ctx , texture , textWidth )


      var mesh = new THREE.Mesh( 
        new THREE.PlaneBufferGeometry( 1 , 1 ), 
        new THREE.MeshBasicMaterial({ 
          map: texture,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false

        })
      );

      mesh.scale.y = canvas.height;
      mesh.scale.x = canvas.width;
      mesh.scale.multiplyScalar( .1  * (size / 100));

      mesh.texture = texture;
      mesh.canvas = canvas;
      mesh.ctx = ctx;
      mesh.textWidth = textWidth;

      return mesh;


    }

    function updateTextTexture( string , canvas , ctx , texture , textWidth ){

      var fullSize = 30000;
      var margin = 1000000;

      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(
          canvas.width / 2 - textWidth / 2 - margin / 2, 
          canvas.height / 2 - fullSize / 2  + margin / 2, 
          textWidth + margin, 
          fullSize + margin
      );

      // Makes sure our text is centered
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font      = fullSize / 150 + "pt Trebuchet MS";
      ctx.fillText( string , canvas.width / 2, canvas.height / 2);


      texture.needsUpdate = true;

    }
