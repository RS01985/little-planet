'use strict';
// Flat close-up viewer: Sentinel-2 10 m tiles for one small area, over the NASA 500 m tile as context.
// Tiles load on demand from this site's origin; the offline single file disables it.
const closeupBase='closeup/melbourne/';
const closeupPoint=[-37.8136,144.9631];
// NASA grid-64 tile 57/22 covers 140.625..146.25 E, 33.75..39.375 S.
const closeupNasa={src:'terrain/64/57/22.jpg',west:140.625,east:146.25,north:-33.75,south:-39.375};
const closeupMarks=[
 {name:['市中心','City centre'],point:[-37.8136,144.9631]},
 {name:['墨爾本板球場','MCG'],point:[-37.8200,144.9834]},
 {name:['亞伯特公園湖','Albert Park Lake'],point:[-37.8467,144.9701]},
 {name:['西門大橋','West Gate Bridge'],point:[-37.8292,144.8990]},
 {name:['菲臘港灣','Port Phillip Bay'],point:[-37.8530,144.9400]}
];
const cu={manifest:null,cx:0,cy:0,mpp:16,show:'new',marks:true,cache:new Map(),failed:new Set(),nasa:null,nasaFailed:false,pointers:new Map(),drag:null,pinch:null,raf:0,loaded:0,bytes:0};
const cuM={lat:111000,lon:88000};
function cuSetup(m){const lat=((m.bounds.north+m.bounds.south)/2)*Math.PI/180;cuM.lat=111132.92-559.82*Math.cos(2*lat)+1.175*Math.cos(4*lat);cuM.lon=111412.84*Math.cos(lat)-93.5*Math.cos(3*lat)}
// Local metres east/south of the close-up's north-west corner.
function cuXY(lat,lon){const b=cu.manifest.bounds;return[(lon-b.west)*cuM.lon,(b.north-lat)*cuM.lat]}
function cuText(zh,en){return lang==='zh'?zh:en}
function cuStatus(){
 const s=$('closeupStatus');if(!cu.manifest){s.textContent=cuText('載入近看資料…','Loading close-up…');return}
 const res=cu.show==='new'?cuText('新：每像素 10 米','New: 10 m per pixel'):cuText('舊：每像素 500 米','Old: 500 m per pixel');
 let note='';
 if(cu.show==='new'&&cu.failed.size)note=cuText(' · 部分 10 米影像未能載入，暫用舊影像','. Some 10 m tiles failed, showing old imagery');
 else if(cu.nasaFailed)note=cuText(' · 舊影像未能載入','. Old imagery unavailable');
 s.textContent=res+note;
}
function cuLevel(){const dpr=Math.min(devicePixelRatio||1,2),max=cu.manifest.levels.length-1;let z=0;while(z<max&&10*2**(z+1)<=cu.mpp/dpr*1.2)z++;return z}
function cuTile(z,x,y){
 const key=z+'/'+x+'_'+y;
 if(cu.cache.has(key)){const img=cu.cache.get(key);cu.cache.delete(key);cu.cache.set(key,img);return img.complete&&img.naturalWidth?img:null}
 if(cu.failed.has(key))return null;
 const img=new Image();img.decoding='async';
 img.onload=()=>{cu.loaded++;cuDraw()};img.onerror=()=>{cu.cache.delete(key);cu.failed.add(key);cuStatus();cuDraw()};
 img.src=closeupBase+key+'.jpg';cu.cache.set(key,img);
 while(cu.cache.size>24)cu.cache.delete(cu.cache.keys().next().value);
 return null;
}
function cuDraw(){if(!cu.raf)cu.raf=requestAnimationFrame(cuRender)}
function cuRender(){
 cu.raf=0;const can=$('closeupCanvas');if(!$('closeup').open||!cu.manifest)return;
 const dpr=Math.min(devicePixelRatio||1,2),w=can.clientWidth,h=can.clientHeight;
 if(can.width!==Math.round(w*dpr)||can.height!==Math.round(h*dpr)){can.width=Math.round(w*dpr);can.height=Math.round(h*dpr)}
 const ctx=can.getContext('2d',{alpha:false});ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#0b2130';ctx.fillRect(0,0,w,h);
 const toScreen=(mx,my)=>[w/2+(mx-cu.cx)/cu.mpp,h/2+(my-cu.cy)/cu.mpp];
 // Old NASA context, smoothed exactly as a browser enlarges it.
 if(cu.nasa&&cu.nasa.complete&&cu.nasa.naturalWidth){
  const n=closeupNasa,[x0,y0]=toScreen(...cuXY(n.north,n.west)),[x1,y1]=toScreen(...cuXY(n.south,n.east));
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(cu.nasa,x0,y0,x1-x0,y1-y0);
 }
 if(cu.show==='new'){
  const m=cu.manifest,b=m.bounds,target=cuLevel(),full=m.levels[0];
  const [rx0,ry0]=toScreen(0,0),[rx1,ry1]=toScreen(...cuXY(b.south,b.east));
  // Draw coarse levels first so something useful shows while finer tiles arrive.
  for(let z=m.levels.length-1;z>=target;z--){
   const L=m.levels[z],sx=(rx1-rx0)/L.width,sy=(ry1-ry0)/L.height,t=m.tileSize;
   const c0=Math.max(0,Math.floor((0-rx0)/sx/t)),c1=Math.min(L.cols-1,Math.floor((w-rx0)/sx/t));
   const r0=Math.max(0,Math.floor((0-ry0)/sy/t)),r1=Math.min(L.rows-1,Math.floor((h-ry0)/sy/t));
   for(let y=r0;y<=r1;y++)for(let x=c0;x<=c1;x++){
    const img=z===target?cuTile(z,x,y):(cu.cache.get(z+'/'+x+'_'+y)||null);
    if(img&&img.complete&&img.naturalWidth){ctx.imageSmoothingEnabled=sx<1||z>0;ctx.drawImage(img,rx0+x*t*sx,ry0+y*t*sy,img.naturalWidth*sx+.5,img.naturalHeight*sy+.5)}
   }
  }
  // Keep coarse levels warm so zooming out never flashes blank.
  const top=m.levels.length-1;cuTile(top,0,0);
  ctx.strokeStyle='#b9ecc9cc';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(rx0,ry0,rx1-rx0,ry1-ry0);ctx.setLineDash([]);
 }
 if(cu.marks){
  ctx.font='700 13px ui-rounded,"PingFang TC",sans-serif';ctx.textBaseline='middle';
  for(const mk of closeupMarks){const [x,y]=toScreen(...cuXY(...mk.point));if(x<-60||y<-20||x>w+60||y>h+20)continue;
   const label=choose(mk.name),tw=ctx.measureText(label).width;
   ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#07121b';ctx.lineWidth=2;ctx.stroke();
   ctx.fillStyle='#07121bd9';ctx.fillRect(x+10,y-12,tw+14,24);ctx.fillStyle='#fff7df';ctx.fillText(label,x+17,y)}
 }
 // Scale bar: pick 100 m, 500 m, 1 km, 2 km, 5 km or 10 km to fit about 120 px.
 const choices=[100,200,500,1000,2000,5000,10000,20000,50000];let bar=choices[0];for(const c of choices)if(c/cu.mpp<=140)bar=c;
 const px=bar/cu.mpp,label=bar>=1000?bar/1000+cuText(' 公里',' km'):bar+cuText(' 米',' m');
 ctx.fillStyle='#07121bcc';ctx.fillRect(12,h-44,px+20,32);ctx.fillStyle='#fff';ctx.fillRect(22,h-22,px,4);ctx.fillRect(22,h-28,2,10);ctx.fillRect(20+px,h-28,2,10);
 ctx.font='700 12px ui-rounded,sans-serif';ctx.fillText(label,24,h-34);
 $('closeupZoomText').textContent=cuText('畫面每點約 ','About ')+(cu.mpp>=10?Math.round(cu.mpp):cu.mpp.toFixed(1))+cuText(' 米',' m per point');
}
function cuClamp(){const b=cu.manifest.bounds,[ex,ey]=cuXY(b.south,b.east),pad=30000;cu.mpp=Math.max(4,Math.min(200,cu.mpp));cu.cx=Math.max(-pad,Math.min(ex+pad,cu.cx));cu.cy=Math.max(-pad,Math.min(ey+pad,cu.cy))}
function cuZoomAt(f,sx,sy){const can=$('closeupCanvas'),w=can.clientWidth,h=can.clientHeight;const mx=cu.cx+(sx-w/2)*cu.mpp,my=cu.cy+(sy-h/2)*cu.mpp;const before=cu.mpp;cu.mpp/=f;cuClamp();const k=cu.mpp/before;cu.cx=mx-(mx-cu.cx)*k;cu.cy=my-(my-cu.cy)*k;cuClamp();cuDraw()}
function cuFit(){const can=$('closeupCanvas'),b=cu.manifest.bounds,[ex,ey]=cuXY(b.south,b.east);cu.cx=ex/2;cu.cy=ey/2;cu.mpp=Math.max(ex/Math.max(200,can.clientWidth-24),ey/Math.max(200,can.clientHeight-24));cuClamp();cuDraw()}
function cuLabels(){
 $('closeupTitle').textContent=cuText('近看墨爾本','Close-up: Melbourne');
 $('closeupNew').textContent=cuText('新 10 米','New 10 m');$('closeupOld').textContent=cuText('舊 500 米','Old 500 m');
 $('closeupMarks').textContent=cuText('地標','Labels');$('closeupFit').setAttribute('aria-label',cuText('看全個範圍','Show whole area'));
 $('closeupIn').setAttribute('aria-label',cuText('放大','Zoom in'));$('closeupOut').setAttribute('aria-label',cuText('縮小','Zoom out'));$('closeupClose').setAttribute('aria-label',cuText('關閉','Close'));
 const m=cu.manifest;$('closeupCredit').textContent=m?cuText(`Sentinel-2 衛星相，${m.date} 拍攝；${m.credit}。舊圖：NASA Blue Marble 2004。不是即時影像。`,`Sentinel-2 image taken ${m.date}. ${m.credit}. Old image: NASA Blue Marble 2004. Not live.`):'';
 $('closeupNew').setAttribute('aria-pressed',cu.show==='new');$('closeupOld').setAttribute('aria-pressed',cu.show==='old');$('closeupMarks').setAttribute('aria-pressed',cu.marks);
 cuStatus();
}
async function openCloseup(){
 stopPlay();stopSpeech();spinning=false;const d=$('closeup');cu.show='new';cu.failed.clear();cu.nasaFailed=false;
 d.showModal();cuLabels();
 if(!cu.nasa){cu.nasa=new Image();cu.nasa.onload=cuDraw;cu.nasa.onerror=()=>{cu.nasaFailed=true;cuStatus();cuDraw()};cu.nasa.src=closeupNasa.src}
 if(!cu.manifest){try{const r=await fetch(closeupBase+'manifest.json');if(!r.ok)throw Error(r.status);cu.manifest=await r.json();cuSetup(cu.manifest)}catch(e){$('closeupStatus').textContent=cuText('近看資料未能載入，請稍後再試。','The close-up could not load. Please try again later.');return}}
 cuLabels();cuFit();$('closeupIn').focus({preventScroll:true});
}
function closeCloseup(){$('closeup').close();dirty=true}
function updateCloseupEntry(){
 const btn=$('closeupEntry');if(!btn)return;
 const film=document.body.classList.contains('film-open');
 const ok=!!closeupBase&&location.protocol!=='file:'&&!film&&!(typeof gameActive!=='undefined'&&gameActive)&&data()[index].kind>=5&&zoom>=2.4;
 if(!ok){btn.hidden=true;return}
 const size=$('routes').clientWidth,p=project(closeupPoint,size);
 if(p.z<.3||p.x<0||p.y<0||p.x>size||p.y>size){btn.hidden=true;return}
 btn.hidden=false;btn.style.left=(p.x/size*100)+'%';btn.style.top=(p.y/size*100)+'%';
 btn.textContent=cuText('🔍 近看墨爾本','🔍 Melbourne close-up');
}
(function initCloseup(){
 const can=$('closeupCanvas');if(!can)return;
 $('closeupEntry').onclick=openCloseup;$('closeupClose').onclick=closeCloseup;
 $('closeup').addEventListener('close',()=>{cu.pointers.clear();cu.drag=cu.pinch=null;dirty=true});
 $('closeupIn').onclick=()=>cuZoomAt(1.6,can.clientWidth/2,can.clientHeight/2);
 $('closeupOut').onclick=()=>cuZoomAt(1/1.6,can.clientWidth/2,can.clientHeight/2);
 $('closeupFit').onclick=cuFit;
 $('closeupNew').onclick=()=>{cu.show='new';cuLabels();cuDraw()};$('closeupOld').onclick=()=>{cu.show='old';cuLabels();cuDraw()};
 $('closeupMarks').onclick=()=>{cu.marks=!cu.marks;cuLabels();cuDraw()};
 const pos=e=>{const r=can.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
 const spread=()=>{const [a,b]=[...cu.pointers.values()];return{d:Math.hypot(a[0]-b[0],a[1]-b[1]),x:(a[0]+b[0])/2,y:(a[1]+b[1])/2}};
 can.addEventListener('pointerdown',e=>{if(!cu.manifest)return;try{can.setPointerCapture(e.pointerId)}catch(err){}cu.pointers.set(e.pointerId,pos(e));if(cu.pointers.size===1){const [x,y]=pos(e);cu.drag={x,y,cx:cu.cx,cy:cu.cy}}else if(cu.pointers.size===2){const s=spread();cu.pinch={d:s.d,x:s.x,y:s.y,mpp:cu.mpp,cx:cu.cx,cy:cu.cy};cu.drag=null}});
 can.addEventListener('pointermove',e=>{if(!cu.pointers.has(e.pointerId))return;cu.pointers.set(e.pointerId,pos(e));
  if(cu.pinch&&cu.pointers.size===2){const s=spread(),w=can.clientWidth,h=can.clientHeight,p=cu.pinch;
   const mx=p.cx+(p.x-w/2)*p.mpp,my=p.cy+(p.y-h/2)*p.mpp;cu.mpp=p.mpp*p.d/Math.max(1,s.d);cuClamp();cu.cx=mx-(s.x-w/2)*cu.mpp;cu.cy=my-(s.y-h/2)*cu.mpp;cuClamp();cuDraw()}
  else if(cu.drag){const [x,y]=pos(e);cu.cx=cu.drag.cx-(x-cu.drag.x)*cu.mpp;cu.cy=cu.drag.cy-(y-cu.drag.y)*cu.mpp;cuClamp();cuDraw()}});
 const end=e=>{cu.pointers.delete(e.pointerId);if(cu.pointers.size<2)cu.pinch=null;if(cu.pointers.size===1){const [x,y]=[...cu.pointers.values()][0];cu.drag={x,y,cx:cu.cx,cy:cu.cy}}else if(!cu.pointers.size)cu.drag=null};
 can.addEventListener('pointerup',end);can.addEventListener('pointercancel',end);
 can.addEventListener('wheel',e=>{e.preventDefault();if(!cu.manifest)return;const [x,y]=pos(e);cuZoomAt(Math.exp(-e.deltaY*.002),x,y)},{passive:false});
 can.addEventListener('keydown',e=>{if(!cu.manifest)return;const step=60*cu.mpp;const k={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];
  if(k){e.preventDefault();cu.cx+=k[0];cu.cy+=k[1];cuClamp();cuDraw()}else if(e.key==='+'||e.key==='='){e.preventDefault();$('closeupIn').click()}else if(e.key==='-'){e.preventDefault();$('closeupOut').click()}});
 window.addEventListener('resize',()=>{if($('closeup').open)cuDraw()});
})();
