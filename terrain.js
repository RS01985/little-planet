'use strict';
// Load only a small geographic window from the NASA image pyramid.
// Images stay on this site's origin; there are no map accounts or tracking.
const terrainBase='terrain/';
const terrain={texture:null,bounds:null,grid:0,key:'',timer:0,request:0,loading:false,failed:false,available:false,cache:new Map(),requests:0};
function terrainWindow(){
 const half=Math.asin(Math.min(.99,Math.SQRT2/(.784*zoom)))*1.12;
 const north=Math.min(Math.PI/2,pitch+half),south=Math.max(-Math.PI/2,pitch-half);
 const lonHalf=Math.abs(pitch)+half>=Math.PI/2?Math.PI:Math.asin(Math.min(1,Math.sin(half)/Math.cos(pitch)));
 const u=rotation/(Math.PI*2)+.5,u0=u-lonHalf/(Math.PI*2),u1=u+lonHalf/(Math.PI*2);
 const v0=.5-north/Math.PI,v1=.5-south/Math.PI,max=Math.min(4096,gl.getParameter(gl.MAX_TEXTURE_SIZE));
 for(const grid of [64,32,16,8]){
  const w=grid*1350,h=w/2,x0=Math.floor(u0*w),x1=Math.ceil(u1*w),y0=Math.max(0,Math.floor(v0*h)),y1=Math.min(h,Math.ceil(v1*h));
  if(x1-x0<=max&&y1-y0<=max)return {grid,w,h,x0,x1,y0,y1};
 }
 return null;
}
function terrainImage(grid,x,y){
 const key=grid+'/'+x+'/'+y;
 if(terrain.cache.has(key)){const img=terrain.cache.get(key);terrain.cache.delete(key);terrain.cache.set(key,img);return Promise.resolve(img)}
 terrain.requests++;
 return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{terrain.cache.set(key,img);while(terrain.cache.size>8)terrain.cache.delete(terrain.cache.keys().next().value);resolve(img)};img.onerror=()=>reject(Error('Terrain tile unavailable'));img.src=terrainBase+key+'.jpg'});
}
async function loadTerrain(window,id){
 const {grid,w,h,x0,x1,y0,y1}=window;
 const canvas=document.createElement('canvas');canvas.width=x1-x0;canvas.height=y1-y0;
 const ctx=canvas.getContext('2d',{alpha:false});const jobs=[];
 for(let y=Math.floor(y0/1350);y<Math.ceil(y1/1350);y++)for(let x=Math.floor(x0/1350);x<Math.ceil(x1/1350);x++)jobs.push({x,y});
 let cursor=0;
 const worker=async()=>{while(cursor<jobs.length){if(id!==terrain.request)return;const {x,y}=jobs[cursor++];const img=await terrainImage(grid,((x%grid)+grid)%grid,y);if(id!==terrain.request)return;ctx.drawImage(img,x*1350-x0,y*1350-y0)}};
 try{
  await Promise.all(Array.from({length:Math.min(3,jobs.length)},worker));
  if(id!==terrain.request||!gl)return;
  if(!terrain.texture)terrain.texture=gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,terrain.texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);gl.activeTexture(gl.TEXTURE0);
  terrain.bounds=[((x0/w)%1+1)%1,y0/h,(x1-x0)/w,(y1-y0)/h];terrain.grid=grid;terrain.failed=false;
 }catch(e){if(id===terrain.request)terrain.failed=true}
 finally{if(id===terrain.request){terrain.loading=false;dirty=true}canvas.width=canvas.height=1}
}
function updateTerrain(){
 if(!gl)return;
 // The self-contained file deliberately keeps its embedded base map offline.
 const enabled=!!terrainBase&&location.protocol!=='file:'&&textureReady&&zoom>=3&&data()[index].kind>=5;
 const key=enabled?[Math.round(rotation*1500),Math.round(pitch*1500),Math.round(zoom*100),mode,index].join(':'):'off';
 if(key!==terrain.key){
  terrain.key=key;clearTimeout(terrain.timer);terrain.request++;terrain.loading=false;terrain.failed=false;terrain.available=false;
  if(enabled){const window=terrainWindow();if(window){terrain.available=true;terrain.loading=true;const id=terrain.request;terrain.timer=setTimeout(()=>loadTerrain(window,id),180)}}
 }
 const show=enabled&&terrain.available&&terrain.texture&&terrain.bounds;
 gl.uniform1f(uniforms.hasDetail,show?1:0);gl.uniform1i(uniforms.detailMap,1);
 if(show){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,terrain.texture);gl.activeTexture(gl.TEXTURE0);gl.uniform4fv(uniforms.detailBounds,terrain.bounds)}
 if(zoom>=3&&data()[index].kind>=5){
  const zh=lang==='zh';let caption='';
  if(!terrainBase||location.protocol==='file:')caption=zh?' · 基本影像':' · BASE IMAGE';
  else if(terrain.loading)caption=zh?' · 載入細節…':' · LOADING DETAIL…';
  else if(terrain.failed)caption=zh?' · 細節未載入':' · DETAIL UNAVAILABLE';
  else if(show)caption=zh?' · 高清地形':' · HD TERRAIN';
  $('zoomLevel').textContent+=caption;
 }
}
