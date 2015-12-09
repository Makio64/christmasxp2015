uniform sampler2D t_pos;
uniform sampler2D t_audio;

varying vec3 vPos;
varying float vDist; 
varying vec4 vAudio;
varying float lookup;

void main(){


  vec4 pos = texture2D( t_pos , position.xy );
  vDist = pos.w;

  vec3 dif = cameraPosition - (modelMatrix * vec4( pos.xyz , 1.)).xyz;
  lookup = position.x;

  vec4 aCol = texture2D( t_audio , vec2( position.x ));
  vAudio = aCol;

  float size = ((length(aCol) * length( aCol )) ) * 100. / ( length( dif ) );
  gl_PointSize = min( 20. , size  );

  vPos = ( modelMatrix * vec4( pos.xyz , 1. ) ).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz , 1. );


}
