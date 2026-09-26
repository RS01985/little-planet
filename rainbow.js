'use strict';
// Reward scene in the globe's own area: a glowing 3D rainbow in the style of the original, with
// real-world touches — rain first, then the bow appears; red outside and violet inside; a brighter
// sky inside the bow; a fainter secondary bow with reversed colours. Drag to turn it in 3D.
const RB={el:null,orbit:null,on:false,raf:0,t0:0,drag:null,ry:0,rx:0,vy:0};
function rainbowBuild(){
 const world=document.querySelector('.world');if(!world)return null;
 const el=document.createElement('div');el.id='rainbowStage';el.className='rb-stage';el.setAttribute('role','img');
 const cloud=(cls,style)=>`<div class="rb-cloud ${cls}" style="${style}"><i></i><i></i><i></i></div>`;
 el.innerHTML='<div class="rb-sky"></div><div class="rb-storm"></div><div class="rb-rays"></div>'
  +'<div class="rb-far">'+cloud('far','left:6%;top:12%;--s:1.1')+cloud('far','left:58%;top:6%;--s:1.4')+cloud('far','left:34%;top:20%;--s:.8')+'</div>'
  +'<div class="rb-rain">'+Array.from({length:46},(_,i)=>`<i style="left:${(i*37+11)%100}%;--d:${((i*.137)%1.2).toFixed(2)}s;--l:${14+i%5*5}px"></i>`).join('')+'</div>'
  +'<div class="rb-scene"><div class="rb-orbit">'
  +'<div class="rb-bow rb-secondary"></div><div class="rb-bow rb-band"></div><div class="rb-bow rb-inner"></div>'
  +Array.from({length:7},(_,i)=>`<div class="rb-bow rb-slice" style="--i:${i+1}"></div>`).join('')
  +'<div class="rb-bow rb-front"></div><div class="rb-bow rb-shine"></div>'
  +cloud('foot','left:calc(50% - var(--d)*.5 - 34px);--s:1.25')+cloud('foot','left:calc(50% + var(--d)*.5 - 92px);--s:1.35')
  +'</div></div><div class="rb-hill back"></div><div class="rb-hill front"></div>';
 world.append(el);RB.el=el;RB.orbit=el.querySelector('.rb-orbit');
 el.addEventListener('pointerdown',e=>{try{el.setPointerCapture(e.pointerId)}catch(err){}RB.drag={x:e.clientX,y:e.clientY,ry:RB.ry,rx:RB.rx,last:e.clientX}});
 el.addEventListener('pointermove',e=>{if(!RB.drag)return;RB.vy=(e.clientX-RB.drag.last)*.25;RB.drag.last=e.clientX;RB.ry=Math.max(-45,Math.min(45,RB.drag.ry+(e.clientX-RB.drag.x)*.22));RB.rx=Math.max(-12,Math.min(18,RB.drag.rx-(e.clientY-RB.drag.y)*.12))});
 const end=()=>{RB.drag=null};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 window.addEventListener('resize',rainbowSize);
 return el;
}
function rainbowSize(){if(!RB.el)return;const w=RB.el.clientWidth,h=RB.el.clientHeight;RB.el.style.setProperty('--d',Math.round(Math.min(w*.8,h*1.05))+'px');RB.el.style.setProperty('--h',h+'px')}
function rainbowFrame(now){
 if(!RB.on){RB.raf=0;return}
 const t=(now-RB.t0)/1000,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!RB.drag){RB.ry+=RB.vy;RB.vy*=.9;RB.ry=Math.max(-45,Math.min(45,RB.ry));if(!reduced){RB.ry+=(Math.sin(t*.45)*14-RB.ry)*.012;RB.rx+=(6+Math.sin(t*.3)*4-RB.rx)*.02}}
 RB.orbit.style.transform=`rotateX(${RB.rx.toFixed(2)}deg) rotateY(${RB.ry.toFixed(2)}deg)`;
 RB.el.style.setProperty('--px',(-RB.ry*.35).toFixed(1)+'px');
 RB.raf=requestAnimationFrame(rainbowFrame);
}
function rainbowStage(on){
 if(on&&!RB.el&&!rainbowBuild())return;
 if(RB.el)RB.el.setAttribute('aria-label',lang==='zh'?'雨停咗，天空出咗一條立體彩虹，紅色喺外面，紫色喺入面，外面仲有一條淡啲嘅副虹；可以用手指拖動轉吓佢':'After the rain, a 3D rainbow: red outside, violet inside, with a fainter second bow. Drag to turn it.');
 if(on===RB.on)return;RB.on=on;
 document.querySelector('.world').classList.toggle('rainbow-on',on);
 cancelAnimationFrame(RB.raf);RB.raf=0;RB.drag=null;
 if(on){RB.el.classList.remove('play');void RB.el.offsetWidth;rainbowSize();RB.ry=-18;RB.rx=8;RB.vy=0;RB.el.classList.add('play');RB.t0=performance.now();RB.raf=requestAnimationFrame(rainbowFrame)}
}
