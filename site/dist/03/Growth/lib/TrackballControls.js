THREE.TrackballControls=function(e,t){function n(e){d.enabled!==!1&&(window.removeEventListener("keydown",n),m=E,E===u.NONE&&(e.keyCode!==d.keys[u.ROTATE]||d.noRotate?e.keyCode!==d.keys[u.ZOOM]||d.noZoom?e.keyCode!==d.keys[u.PAN]||d.noPan||(E=u.PAN):E=u.ZOOM:E=u.ROTATE))}function o(e){d.enabled!==!1&&(E=m,window.addEventListener("keydown",n,!1))}function a(e){d.enabled!==!1&&(e.preventDefault(),e.stopPropagation(),E===u.NONE&&(E=e.button),E!==u.ROTATE||d.noRotate?E!==u.ZOOM||d.noZoom?E!==u.PAN||d.noPan||(d.getMouseOnScreen(e.pageX,e.pageY,R),M.copy(R)):(d.getMouseOnScreen(e.pageX,e.pageY,f),w.copy(f)):(d.getMouseProjectionOnBall(e.pageX,e.pageY,O),v.copy(O)),document.addEventListener("mousemove",s,!1),document.addEventListener("mouseup",i,!1),d.dispatchEvent(N))}function s(e){d.enabled!==!1&&(e.preventDefault(),e.stopPropagation(),E!==u.ROTATE||d.noRotate?E!==u.ZOOM||d.noZoom?E!==u.PAN||d.noPan||d.getMouseOnScreen(e.pageX,e.pageY,M):d.getMouseOnScreen(e.pageX,e.pageY,w):d.getMouseProjectionOnBall(e.pageX,e.pageY,v))}function i(e){d.enabled!==!1&&(e.preventDefault(),e.stopPropagation(),E=u.NONE,document.removeEventListener("mousemove",s),document.removeEventListener("mouseup",i),d.dispatchEvent(H))}function c(e){if(d.enabled!==!1){e.preventDefault(),e.stopPropagation();var t=0;e.wheelDelta?t=e.wheelDelta/40:e.detail&&(t=-e.detail/3),f.y+=.01*t,d.dispatchEvent(N),d.dispatchEvent(H)}}function r(e){if(d.enabled!==!1){switch(e.touches.length){case 1:E=u.TOUCH_ROTATE,v.copy(d.getMouseProjectionOnBall(e.touches[0].pageX,e.touches[0].pageY,O));break;case 2:E=u.TOUCH_ZOOM;var t=e.touches[0].pageX-e.touches[1].pageX,n=e.touches[0].pageY-e.touches[1].pageY;T=b=Math.sqrt(t*t+n*n);break;case 3:E=u.TOUCH_PAN,M.copy(d.getMouseOnScreen(e.touches[0].pageX,e.touches[0].pageY,R));break;default:E=u.NONE}d.dispatchEvent(N)}}function p(e){if(d.enabled!==!1)switch(e.preventDefault(),e.stopPropagation(),e.touches.length){case 1:d.getMouseProjectionOnBall(e.touches[0].pageX,e.touches[0].pageY,v);break;case 2:var t=e.touches[0].pageX-e.touches[1].pageX,n=e.touches[0].pageY-e.touches[1].pageY;T=Math.sqrt(t*t+n*n);break;case 3:d.getMouseOnScreen(e.touches[0].pageX,e.touches[0].pageY,M);break;default:E=u.NONE}}function h(e){if(d.enabled!==!1){switch(e.touches.length){case 1:O.copy(d.getMouseProjectionOnBall(e.touches[0].pageX,e.touches[0].pageY,v));break;case 2:b=T=0;break;case 3:R.copy(d.getMouseOnScreen(e.touches[0].pageX,e.touches[0].pageY,M))}E=u.NONE,d.dispatchEvent(H)}}var d=this,u={NONE:-1,ROTATE:0,ZOOM:1,PAN:2,TOUCH_ROTATE:3,TOUCH_ZOOM:4,TOUCH_PAN:5};this.object=e,this.domElement=void 0!==t?t:document,this.enabled=!0,this.screen={left:0,top:0,width:0,height:0},this.rotateSpeed=1,this.zoomSpeed=1.2,this.panSpeed=.3,this.noRotate=!1,this.noZoom=!1,this.noPan=!1,this.noRoll=!1,this.staticMoving=!1,this.dynamicDampingFactor=.2,this.minDistance=0,this.maxDistance=1/0,this.keys=[65,83,68],this.target=new THREE.Vector3;var l=1e-6,g=new THREE.Vector3,E=u.NONE,m=u.NONE,y=new THREE.Vector3,O=new THREE.Vector3,v=new THREE.Vector3,f=new THREE.Vector2,w=new THREE.Vector2,b=0,T=0,R=new THREE.Vector2,M=new THREE.Vector2;this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.up0=this.object.up.clone();var j={type:"change"},N={type:"start"},H={type:"end"};this.handleResize=function(){if(this.domElement===document)this.screen.left=0,this.screen.top=0,this.screen.width=window.innerWidth,this.screen.height=window.innerHeight;else{var e=this.domElement.getBoundingClientRect(),t=this.domElement.ownerDocument.documentElement;this.screen.left=e.left+window.pageXOffset-t.clientLeft,this.screen.top=e.top+window.pageYOffset-t.clientTop,this.screen.width=e.width,this.screen.height=e.height}},this.handleEvent=function(e){"function"==typeof this[e.type]&&this[e.type](e)},this.getMouseOnScreen=function(e,t,n){return n.set((e-d.screen.left)/d.screen.width,(t-d.screen.top)/d.screen.height)},this.getMouseProjectionOnBall=function(){var e=new THREE.Vector3,t=new THREE.Vector3;return function(n,o,a){t.set((n-.5*d.screen.width-d.screen.left)/(.5*d.screen.width),(.5*d.screen.height+d.screen.top-o)/(.5*d.screen.height),0);var s=t.length();return d.noRoll?s<Math.SQRT1_2?t.z=Math.sqrt(1-s*s):t.z=.5/s:s>1?t.normalize():t.z=Math.sqrt(1-s*s),y.copy(d.object.position).sub(d.target),a.copy(d.object.up).setLength(t.y),a.add(e.copy(d.object.up).cross(y).setLength(t.x)),a.add(y.setLength(t.z)),a}}(),this.rotateCamera=function(){var e=new THREE.Vector3,t=new THREE.Quaternion;return function(){var n=Math.acos(O.dot(v)/O.length()/v.length());n&&(e.crossVectors(O,v).normalize(),n*=d.rotateSpeed,t.setFromAxisAngle(e,-n),y.applyQuaternion(t),d.object.up.applyQuaternion(t),v.applyQuaternion(t),d.staticMoving?O.copy(v):(t.setFromAxisAngle(e,n*(d.dynamicDampingFactor-1)),O.applyQuaternion(t)))}}(),this.zoomCamera=function(){if(E===u.TOUCH_ZOOM){var e=b/T;b=T,y.multiplyScalar(e)}else{var e=1+(w.y-f.y)*d.zoomSpeed;1!==e&&e>0&&(y.multiplyScalar(e),d.staticMoving?f.copy(w):f.y+=(w.y-f.y)*this.dynamicDampingFactor)}},this.panCamera=function(){var e=new THREE.Vector2,t=new THREE.Vector3,n=new THREE.Vector3;return function(){e.copy(M).sub(R),e.lengthSq()&&(e.multiplyScalar(y.length()*d.panSpeed),n.copy(y).cross(d.object.up).setLength(e.x),n.add(t.copy(d.object.up).setLength(e.y)),d.object.position.add(n),d.target.add(n),d.staticMoving?R.copy(M):R.add(e.subVectors(M,R).multiplyScalar(d.dynamicDampingFactor)))}}(),this.checkDistances=function(){d.noZoom&&d.noPan||(y.lengthSq()>d.maxDistance*d.maxDistance&&d.object.position.addVectors(d.target,y.setLength(d.maxDistance)),y.lengthSq()<d.minDistance*d.minDistance&&d.object.position.addVectors(d.target,y.setLength(d.minDistance)))},this.update=function(){y.subVectors(d.object.position,d.target),d.noRotate||d.rotateCamera(),d.noZoom||d.zoomCamera(),d.noPan||d.panCamera(),d.object.position.addVectors(d.target,y),d.checkDistances(),d.object.lookAt(d.target),g.distanceToSquared(d.object.position)>l&&(d.dispatchEvent(j),g.copy(d.object.position))},this.reset=function(){E=u.NONE,m=u.NONE,d.target.copy(d.target0),d.object.position.copy(d.position0),d.object.up.copy(d.up0),y.subVectors(d.object.position,d.target),d.object.lookAt(d.target),d.dispatchEvent(j),g.copy(d.object.position)},this.domElement.addEventListener("contextmenu",function(e){e.preventDefault()},!1),this.domElement.addEventListener("mousedown",a,!1),this.domElement.addEventListener("mousewheel",c,!1),this.domElement.addEventListener("DOMMouseScroll",c,!1),this.domElement.addEventListener("touchstart",r,!1),this.domElement.addEventListener("touchend",h,!1),this.domElement.addEventListener("touchmove",p,!1),window.addEventListener("keydown",n,!1),window.addEventListener("keyup",o,!1),this.handleResize(),this.update()},THREE.TrackballControls.prototype=Object.create(THREE.EventDispatcher.prototype);