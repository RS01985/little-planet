'use strict';
// Close-up places: Sentinel-2 10 m tiles for a few small areas, shown inside the globe's own area
// over the NASA 500 m tiles as context. Tiles load on demand from this site's origin; the offline
// single file disables it. Landmark positions were checked against the 10 m images.
const closeupBase='closeup/';
const closeupPlaces=[
 {key:'hongkong',icon:'🏙️',point:[22.29,114.17],marks:[[['維多利亞港','Victoria Harbour'],[22.2890,114.1700]],[['太平山頂','Victoria Peak'],[22.2711,114.1500]],[['尖沙咀','Tsim Sha Tsui'],[22.2966,114.1722]],[['啟德','Kai Tak'],[22.3066,114.2142]]]},
 {key:'sydney',icon:'🌉',point:[-33.856,151.215],marks:[[['悉尼歌劇院','Sydney Opera House'],[-33.8568,151.2153]],[['海港大橋','Harbour Bridge'],[-33.8523,151.2108]],[['邦迪海灘','Bondi Beach'],[-33.8910,151.2743]]]},
 {key:'melbourne',icon:'🏟️',point:[-37.8136,144.9631],marks:[[['市中心','City centre'],[-37.8136,144.9631]],[['墨爾本板球場','MCG'],[-37.8200,144.9834]],[['亞伯特公園湖','Albert Park Lake'],[-37.8467,144.9701]],[['西門大橋','West Gate Bridge'],[-37.8292,144.8990]],[['菲臘港灣','Port Phillip Bay'],[-37.8530,144.9400]]]},
 {key:'tokyo',icon:'🗼',point:[35.66,139.76],marks:[[['皇居','Imperial Palace'],[35.6852,139.7528]],[['東京鐵塔','Tokyo Tower'],[35.6586,139.7454]],[['台場','Odaiba'],[35.6300,139.7780]],[['東京灣','Tokyo Bay'],[35.6150,139.8300]]]},
 {key:'giza',icon:'🔺',point:[29.979,31.134],marks:[[['大金字塔','Great Pyramid'],[29.9792,31.1342]],[['獅身人面像','Great Sphinx'],[29.9753,31.1376]],[['沙漠','Desert'],[29.9600,31.0800]]]},
 {key:'grandcanyon',icon:'🏜️',point:[36.07,-112.11],marks:[[['大峽谷村','Grand Canyon Village'],[36.0544,-112.1401]],[['科羅拉多河','Colorado River'],[36.1000,-112.0930]]]},
 {key:'everest',icon:'🏔️',point:[27.988,86.925],marks:[[['珠穆朗瑪峰','Mount Everest'],[27.9881,86.9250]],[['洛子峰','Lhotse'],[27.9617,86.9333]],[['絨布冰川','Rongbuk Glacier'],[28.0400,86.9250]],[['昆布冰川','Khumbu Glacier'],[27.9950,86.8580]]]},
 {key:'amazon',icon:'🌳',point:[-3.137,-59.896],marks:[[['黑河','Rio Negro'],[-3.1450,-59.9400]],[['蘇里摩希斯河','Solimões River'],[-3.1850,-59.9050]],[['兩河交匯','Meeting of Waters'],[-3.1370,-59.8960]],[['亞馬遜河','Amazon River'],[-3.0950,-59.8500]]]}
];
const cu={place:null,manifest:null,manifests:new Map(),cx:0,cy:0,mpp:16,show:'new',marks:true,cache:new Map(),failed:new Set(),nasa:[],nasaFailed:false,pointers:new Map(),drag:null,pinch:null,raf:0};
const cuM={lat:111000,lon:88000};
function cuSetup(m){const lat=((m.bounds.north+m.bounds.south)/2)*Math.PI/180;cuM.lat=111132.92-559.82*Math.cos(2*lat)+1.175*Math.cos(4*lat);cuM.lon=111412.84*Math.cos(lat)-93.5*Math.cos(3*lat)}
// Local metres east/south of the close-up's north-west corner.
function cuXY(lat,lon){const b=cu.manifest.bounds;return[(lon-b.west)*cuM.lon,(b.north-lat)*cuM.lat]}
function cuText(zh,en){return lang==='zh'?zh:en}
function cuName(p){const m=cu.manifests.get(p.key);return m?choose(m.name):p.key}
// NASA 500 m tiles (grid 64, 5.625° each) around the place, for context and as the fallback image.
function cuNasaTiles(b){const s=5.625,pad=.35,list=[];for(let x=Math.floor((b.west-pad+180)/s);x<=Math.floor((b.east+pad+180)/s);x++)for(let y=Math.floor((90-b.north-pad)/s);y<=Math.floor((90-b.south+pad)/s);y++){const img=new Image();img.onload=cuDraw;img.onerror=()=>{cu.nasaFailed=true;cuStatus();cuDraw()};img.src='terrain/64/'+((x%64)+64)%64+'/'+y+'.jpg';list.push({img,west:x*s-180,east:x*s-180+s,north:90-y*s,south:90-y*s-s})}return list}
function cuStatus(){
 const s=$('closeupStatus');if(!cu.manifest){s.textContent=$('closeupPicker').hidden?cuText('載入近看資料…','Loading close-up…'):'';return}
 const res=cu.show==='new'?cuText('新：每像素 10 米','New: 10 m per pixel'):cuText('舊：每像素 500 米','Old: 500 m per pixel');
 let note='';
 if(cu.show==='new'&&cu.failed.size)note=cuText(' · 部分 10 米影像未能載入，暫用舊影像','. Some 10 m tiles failed, showing old imagery');
 else if(cu.nasaFailed)note=cuText(' · 舊影像未能載入','. Old imagery unavailable');
 s.textContent=res+note;
}
function cuLevel(){const dpr=Math.min(devicePixelRatio||1,2),max=cu.manifest.levels.length-1;let z=0;while(z<max&&10*2**(z+1)<=cu.mpp/dpr*1.2)z++;return z}
function cuTile(z,x,y){
 const key=cu.place.key+'/'+z+'/'+x+'_'+y;
 if(cu.cache.has(key)){const img=cu.cache.get(key);cu.cache.delete(key);cu.cache.set(key,img);return img.complete&&img.naturalWidth?img:null}
 if(cu.failed.has(key))return null;
 const img=new Image();img.decoding='async';
 img.onload=cuDraw;img.onerror=()=>{cu.cache.delete(key);cu.failed.add(key);cuStatus();cuDraw()};
 img.src=closeupBase+key+'.jpg';cu.cache.set(key,img);
 while(cu.cache.size>24)cu.cache.delete(cu.cache.keys().next().value);
 return null;
}
function cuDraw(){if(!cu.raf)cu.raf=requestAnimationFrame(cuRender)}
function cuRender(){
 cu.raf=0;const can=$('closeupCanvas');if($('closeup').hidden||!cu.manifest)return;
 const dpr=Math.min(devicePixelRatio||1,2),w=can.clientWidth,h=can.clientHeight;if(!w||!h)return;
 if(can.width!==Math.round(w*dpr)||can.height!==Math.round(h*dpr)){can.width=Math.round(w*dpr);can.height=Math.round(h*dpr)}
 const ctx=can.getContext('2d',{alpha:false});ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#0b2130';ctx.fillRect(0,0,w,h);
 const toScreen=(mx,my)=>[w/2+(mx-cu.cx)/cu.mpp,h/2+(my-cu.cy)/cu.mpp];
 // Old NASA context, smoothed exactly as a browser enlarges it.
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 for(const n of cu.nasa)if(n.img.complete&&n.img.naturalWidth){const [x0,y0]=toScreen(...cuXY(n.north,n.west)),[x1,y1]=toScreen(...cuXY(n.south,n.east));ctx.drawImage(n.img,x0,y0,x1-x0,y1-y0)}
 if(cu.show==='new'){
  const m=cu.manifest,b=m.bounds,target=cuLevel();
  const [rx0,ry0]=toScreen(0,0),[rx1,ry1]=toScreen(...cuXY(b.south,b.east));
  // Draw coarse levels first so something useful shows while finer tiles arrive.
  for(let z=m.levels.length-1;z>=target;z--){
   const L=m.levels[z],sx=(rx1-rx0)/L.width,sy=(ry1-ry0)/L.height,t=m.tileSize;
   const c0=Math.max(0,Math.floor((0-rx0)/sx/t)),c1=Math.min(L.cols-1,Math.floor((w-rx0)/sx/t));
   const r0=Math.max(0,Math.floor((0-ry0)/sy/t)),r1=Math.min(L.rows-1,Math.floor((h-ry0)/sy/t));
   for(let y=r0;y<=r1;y++)for(let x=c0;x<=c1;x++){
    const img=z===target?cuTile(z,x,y):(cu.cache.get(cu.place.key+'/'+z+'/'+x+'_'+y)||null);
    if(img&&img.complete&&img.naturalWidth){ctx.imageSmoothingEnabled=sx<1||z>0;ctx.drawImage(img,rx0+x*t*sx,ry0+y*t*sy,img.naturalWidth*sx+.5,img.naturalHeight*sy+.5)}
   }
  }
  cuTile(m.levels.length-1,0,0);
  ctx.strokeStyle='#b9ecc9cc';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(rx0,ry0,rx1-rx0,ry1-ry0);ctx.setLineDash([]);
 }
 if(cu.marks){
  ctx.font='700 13px ui-rounded,"PingFang TC",sans-serif';ctx.textBaseline='middle';
  for(const [name,pt] of cu.place.marks){const [x,y]=toScreen(...cuXY(...pt));if(x<-60||y<-20||x>w+60||y>h+20)continue;
   const label=choose(name),tw=ctx.measureText(label).width;
   ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#07121b';ctx.lineWidth=2;ctx.stroke();
   ctx.fillStyle='#07121bd9';ctx.fillRect(x+10,y-12,tw+14,24);ctx.fillStyle='#fff7df';ctx.fillText(label,x+17,y)}
 }
 // Scale bar: 100 m to 50 km, fitted to about 120 px.
 const choices=[100,200,500,1000,2000,5000,10000,20000,50000];let bar=choices[0];for(const c of choices)if(c/cu.mpp<=140)bar=c;
 const px=bar/cu.mpp,label=bar>=1000?bar/1000+cuText(' 公里',' km'):bar+cuText(' 米',' m');
 ctx.fillStyle='#07121bcc';ctx.fillRect(12,h-44,px+20,32);ctx.fillStyle='#fff';ctx.fillRect(22,h-22,px,4);ctx.fillRect(22,h-28,2,10);ctx.fillRect(20+px,h-28,2,10);
 ctx.font='700 12px ui-rounded,sans-serif';ctx.fillText(label,24,h-34);
 $('closeupZoomText').textContent=cuText('畫面每點約 ','About ')+(cu.mpp>=10?Math.round(cu.mpp):cu.mpp.toFixed(1))+cuText(' 米',' m per point');
}
function cuClamp(){const b=cu.manifest.bounds,[ex,ey]=cuXY(b.south,b.east),pad=30000;cu.mpp=Math.max(4,Math.min(200,cu.mpp));cu.cx=Math.max(-pad,Math.min(ex+pad,cu.cx));cu.cy=Math.max(-pad,Math.min(ey+pad,cu.cy))}
function cuZoomAt(f,sx,sy){if(!cu.manifest)return;const can=$('closeupCanvas'),w=can.clientWidth,h=can.clientHeight;const mx=cu.cx+(sx-w/2)*cu.mpp,my=cu.cy+(sy-h/2)*cu.mpp;const before=cu.mpp;cu.mpp/=f;cuClamp();const k=cu.mpp/before;cu.cx=mx-(mx-cu.cx)*k;cu.cy=my-(my-cu.cy)*k;cuClamp();cuDraw()}
function cuFit(){const can=$('closeupCanvas'),b=cu.manifest.bounds,[ex,ey]=cuXY(b.south,b.east);cu.cx=ex/2;cu.cy=ey/2;cu.mpp=Math.max(ex/Math.max(200,can.clientWidth-24),ey/Math.max(200,can.clientHeight-24));cuClamp();cuDraw()}
function cuLabels(){
 const picking=!$('closeupPicker').hidden;
 $('closeupTitle').textContent=picking||!cu.place?cuText('揀一個地方近看','Pick a place to explore'):cuName(cu.place);
 $('closeupNew').textContent=cuText('新 10 米','New 10 m');$('closeupOld').textContent=cuText('舊 500 米','Old 500 m');
 $('closeupMarks').textContent=cuText('地標','Labels');$('closeupPlaces').textContent=cuText('換地方','Places');
 $('closeupFit').setAttribute('aria-label',cuText('看全個範圍','Show whole area'));$('closeupIn').setAttribute('aria-label',cuText('放大','Zoom in'));$('closeupOut').setAttribute('aria-label',cuText('縮小','Zoom out'));$('closeupClose').setAttribute('aria-label',cuText('返回地球','Back to the globe'));
 const m=cu.manifest;$('closeupCredit').textContent=m&&!picking?cuText(`Sentinel-2 衛星相，${m.date} 拍攝；${m.credit}。舊圖：NASA Blue Marble 2004。不是即時影像。`,`Sentinel-2 image taken ${m.date}. ${m.credit}. Old image: NASA Blue Marble 2004. Not live.`):'';
 $('closeupNew').setAttribute('aria-pressed',cu.show==='new');$('closeupOld').setAttribute('aria-pressed',cu.show==='old');$('closeupMarks').setAttribute('aria-pressed',cu.marks);
 $('closeupPicker').innerHTML=closeupPlaces.map(p=>`<button data-place="${p.key}"><span aria-hidden="true">${p.icon}</span>${cuName(p)}</button>`).join('');
 cuStatus();
}
async function cuManifest(key){if(cu.manifests.has(key))return cu.manifests.get(key);const r=await fetch(closeupBase+key+'/manifest.json');if(!r.ok)throw Error(r.status);const m=await r.json();cu.manifests.set(key,m);return m}
async function cuLoadNames(){await Promise.all(closeupPlaces.map(p=>cuManifest(p.key).catch(()=>null)));if(!$('closeup').hidden)cuLabels();updateCloseupEntry()}
function cuShowPanel(){stopPlay();stopSpeech();spinning=false;$('closeup').hidden=false;document.querySelector('.world').classList.add('closeup-on');updateCloseupEntry()}
function openCloseupPicker(){cuShowPanel();$('closeupPicker').hidden=false;$('closeup').classList.add('picking');cuLabels();cuLoadNames();const first=$('closeupPicker').querySelector('button');if(first)first.focus({preventScroll:true})}
async function openCloseup(key){
 const place=closeupPlaces.find(p=>p.key===key);if(!place)return;
 cuShowPanel();$('closeupPicker').hidden=true;$('closeup').classList.remove('picking');
 cu.place=place;cu.manifest=null;cu.show='new';cu.failed.clear();cu.nasaFailed=false;cuLabels();
 try{const m=await cuManifest(key);if(cu.place!==place)return;cu.manifest=m;cuSetup(m)}catch(e){$('closeupStatus').textContent=cuText('近看資料未能載入，請稍後再試。','The close-up could not load. Please try again later.');return}
 cu.nasa=cuNasaTiles(cu.manifest.bounds);cuLabels();cuFit();$('closeupIn').focus({preventScroll:true});
}
function closeCloseup(){$('closeup').hidden=true;document.querySelector('.world').classList.remove('closeup-on');cu.pointers.clear();cu.drag=cu.pinch=null;dirty=true}
function updateCloseupEntry(){
 const box=$('closeupPins'),list=$('closeupList');if(!box)return;
 const film=document.body.classList.contains('film-open'),game=typeof gameActive!=='undefined'&&gameActive;
 const modern=!!closeupBase&&location.protocol!=='file:'&&!film&&!game&&data()[index].kind>=5;
 if(list){list.hidden=!modern;list.setAttribute('aria-label',cuText('揀地方近看','Explore places close up'));list.title=list.getAttribute('aria-label')}
 if(!modern||zoom<1.6||!$('closeup').hidden){if(box.childElementCount)box.replaceChildren();return}
 if(box.childElementCount!==closeupPlaces.length)box.innerHTML=closeupPlaces.map(p=>`<button class="closeup-pin" data-place="${p.key}"><span aria-hidden="true">${p.icon}</span><small></small></button>`).join('');
 const size=$('routes').clientWidth,placed=[];box.classList.toggle('compact',zoom<3);
 box.querySelectorAll('.closeup-pin').forEach(btn=>{const p=closeupPlaces.find(q=>q.key===btn.dataset.place),pt=project(p.point,size);
  const show=pt.z>.3&&pt.x>0&&pt.y>30&&pt.x<size&&pt.y<size;btn.hidden=!show;if(!show)return;
  // Keep nearby pins apart so small fingers can hit each one.
  let y=pt.y;for(let k=0;k<4;k++){const hit=placed.find(q=>Math.abs(q.x-pt.x)<52&&Math.abs(q.y-y)<46);if(!hit)break;y=hit.y-48}placed.push({x:pt.x,y});
  btn.style.left=(pt.x/size*100)+'%';btn.style.top=(y/size*100)+'%';btn.classList.toggle('nudged',y!==pt.y);const name=cuName(p);btn.querySelector('small').textContent=name;btn.setAttribute('aria-label',cuText('近看','Close-up: ')+name)});
}
(function initCloseup(){
 const can=$('closeupCanvas');if(!can)return;
 if(!closeupBase||location.protocol==='file:'){$('closeupList').hidden=true;return}
 cuLoadNames();
 $('closeupPins').addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(b)openCloseup(b.dataset.place)});
 $('closeupPicker').addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(b)openCloseup(b.dataset.place)});
 $('closeupList').onclick=openCloseupPicker;$('closeupPlaces').onclick=openCloseupPicker;$('closeupClose').onclick=closeCloseup;
 $('closeup').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeCloseup();$('globe').focus({preventScroll:true})}});
 $('closeupIn').onclick=()=>cuZoomAt(1.6,can.clientWidth/2,can.clientHeight/2);
 $('closeupOut').onclick=()=>cuZoomAt(1/1.6,can.clientWidth/2,can.clientHeight/2);
 $('closeupFit').onclick=()=>{if(cu.manifest)cuFit()};
 $('closeupNew').onclick=()=>{cu.show='new';cuLabels();cuDraw()};$('closeupOld').onclick=()=>{cu.show='old';cuLabels();cuDraw()};
 $('closeupMarks').onclick=()=>{cu.marks=!cu.marks;cuLabels();cuDraw()};
 $('language').addEventListener('click',()=>setTimeout(()=>{if(!$('closeup').hidden){cuLabels();cuDraw()}},0));
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
 window.addEventListener('resize',()=>{if(!$('closeup').hidden)cuDraw()});
})();
