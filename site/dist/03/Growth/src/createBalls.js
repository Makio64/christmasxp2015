

    function createBalls( curves ){

      var ball = new THREE.Mesh( new THREE.IcosahedronGeometry(.3 , 2 ), new THREE.MeshBasicMaterial())

      //var ball = new THREE.Mesh( new THREE.IcosahedronGeometry(.3 , 1 ), new THREE.MeshBasicMaterial())

      var p = new THREE.Vector3( 0 , 1.6 , 0 );
      var up = new THREE.Vector3( 0 , 1 , 0 );

      var p1 = new THREE.Vector3();
      var p2 = new THREE.Vector3();

      var notToClose = 0;
      var above = true;
      for( var i = 0; i < curves.length - 2; i++ ){
        var c = curves[i][1];

        for( var j = 0; j < (c.length-1) * .7; j++ ){
          notToClose ++

          var r = Math.random();

          r *= (j / c.length);

          p1.copy( c[j]) ;

          above = true;
          if( p1.y < light.position.y ) above = false;

          p2.copy( c[j+1]);

          p1.sub( p2 );
          p1.normalize();

          var v = p1.dot( up );



          if( Math.abs(v) < .1  && r > .5  && notToClose > 5 && above == false ){

              var b = ball.clone();
              b.position.copy( c[j] )
              b.position.sub( p );
              notToClose = 0;

              b.audioParams = {

                baseOffset: Math.random() * .8,
                attack    : .140 * 4.,
                release   : .140 * 10.3,
                trans     : .3// + Math.random() * .5

              }

              b.hoverOver = function(){

                console.log('whas')
                console.log( this.audioParams )

                grain.playNote( this.audioParams );

              }
              treeObj.add( b );
              objectControls.add( b );

          }

        }

      }


    }
