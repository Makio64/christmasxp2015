THREE.StereoEffect=function(e){var t=this;this.eyeSeparation=3,this.focalLength=15,Object.defineProperties(this,{separation:{get:function(){return t.eyeSeparation},set:function(e){console.warn("THREE.StereoEffect: .separation is now .eyeSeparation."),t.eyeSeparation=e}},targetDistance:{get:function(){return t.focalLength},set:function(e){console.warn("THREE.StereoEffect: .targetDistance is now .focalLength."),t.focalLength=e}}});var a,n,o,r,i,s,c,p,E,f,h,u,l=new THREE.Vector3,S=new THREE.Quaternion,T=new THREE.Vector3,d=new THREE.PerspectiveCamera,g=new THREE.PerspectiveCamera;e.autoClear=!1,this.setSize=function(t,o){a=t/2,n=o,e.setSize(t,o)},this.render=function(t,R){t.updateMatrixWorld(),null===R.parent&&R.updateMatrixWorld(),R.matrixWorld.decompose(l,S,T),o=THREE.Math.radToDeg(2*Math.atan(Math.tan(.5*THREE.Math.degToRad(R.fov))/R.zoom)),p=R.near/this.focalLength,f=Math.tan(.5*THREE.Math.degToRad(o))*this.focalLength,E=.5*f*R.aspect,s=f*p,c=-s,h=(E+this.eyeSeparation/2)/(2*E),u=1-h,r=2*E*p*u,i=2*E*p*h,d.projectionMatrix.makeFrustum(-r,i,c,s,R.near,R.far),d.position.copy(l),d.quaternion.copy(S),d.translateX(-this.eyeSeparation/2),g.projectionMatrix.makeFrustum(-i,r,c,s,R.near,R.far),g.position.copy(l),g.quaternion.copy(S),g.translateX(this.eyeSeparation/2),e.enableScissorTest(!0),e.setScissor(0,0,a,n),e.setViewport(0,0,a,n),e.render(t,d),e.setScissor(a,0,a,n),e.setViewport(a,0,a,n),e.render(t,g),e.enableScissorTest(!1)}};