var MMC_CENTER=new THREE.Vector3;THREE.MouseMoveControls=function(t,o){this.object=t,this.domElement=void 0!==o?o:document,this.enabled=!0,this.z=10,this.x=0,this.y=0,this.speed=1000.8,this.zoomSpeed=1e-5,this.maxX=1,this.maxY=1,this.mouse={x:0,y:0},this.center=new THREE.Vector3,this.update=function(){this.object.position.z>0?(this.object.position.x+=(this.mouse.x-this.object.position.x+this.x)*this.speed,this.object.position.y-=(this.mouse.y-this.object.position.y+this.y)*this.speed):(this.object.position.x-=(this.mouse.x-this.object.position.x+this.x)*this.speed/Math.abs(this.x),this.object.position.y-=(this.mouse.y-this.object.position.y+this.y)*this.speed/Math.abs(this.y)),this.object.position.x*=.95,this.object.position.y*=.95,this.mouseDown?this.object.position.z-=this.object.position.z*this.zoomSpeed:this.object.position.z+=(this.z-this.object.position.z)*this.zoomSpeed,this.object.lookAt(this.center)},this.onMouseMove=function(t){var o=t.clientX,i=t.clientY,s=window.innerWidth,e=window.innerHeight;this.mouse.x=o-s/2,this.mouse.y=i-e/2},this.onMouseDown=function(t){this.mouseDown=!0},this.onMouseUp=function(t){this.mouseDown=!1},this.domElement.addEventListener("contextmenu",function(t){t.preventDefault()},!1),this.domElement.addEventListener("mousemove",this.onMouseMove.bind(this),!1)},THREE.MouseMoveControls.prototype=Object.create(THREE.EventDispatcher.prototype);