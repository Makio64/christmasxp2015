float calcDisplacement( vec3 pos ){

  float displacement  = .2   * abs( snoise( pos * .7    ) );
        displacement += .1   * abs( snoise( pos * 3.  ) );
        displacement += .05  * abs( snoise( pos * 10. ) );

  //displacement = clamp( displacement , 0. , .3 );
  displacement *= 10.;

  return displacement;

}

vec3 calcNewPos( vec3 pos , vec3 norm , float dAmount ){

  float d = calcDisplacement( pos );
  return pos + norm * d * dAmount;

}

vec3 calcTangNorm( vec3 pos , vec3 normal , vec3 tangent , vec3 binormal , float dAmount ){

  float delta = .01;


  vec3 upT = pos + tangent * delta;
  vec3 doT = pos - tangent * delta;
  vec3 upB = pos + binormal * delta;
  vec3 doB = pos - binormal * delta;

  vec3 pUpT = calcNewPos( upT , normal , dAmount );
  vec3 pDoT = calcNewPos( doT , normal , dAmount );
  vec3 pUpB = calcNewPos( upB , normal , dAmount );
  vec3 pDoB = calcNewPos( doB , normal , dAmount );

  vec3 v1 = pUpT - pDoT;
  vec3 v2 = pUpB - pDoB;

  return normalize( cross( v1 , v2 ));


}
