function createTextMesh(e,t){var a=document.createElement("canvas"),n=3e4,i=40,l=a.getContext("2d");l.font=n/100+"pt GeoSans";var r=l.measureText(t).width;a.width=r+i,a.height=n/100+i;var d=new THREE.Texture(a);updateTextTexture(t,a,l,d,r);var h=new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1),new THREE.MeshBasicMaterial({map:d,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}));return h.scale.y=a.height,h.scale.x=a.width,h.scale.multiplyScalar(.1*(e/100)),h.texture=d,h.canvas=a,h.ctx=l,h.textWidth=r,h}function updateTextTexture(e,t,a,n,i){var l=3e4,r=1e6;a.fillStyle="rgba(0,0,0,1)",a.fillRect(t.width/2-i/2-r/2,t.height/2-l/2+r/2,i+r,l+r),a.textAlign="center",a.textBaseline="middle",a.fillStyle="#ffffff",a.font=l/150+"pt Trebuchet MS",a.fillText(e,t.width/2,t.height/2),n.needsUpdate=!0}