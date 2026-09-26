'use strict';
// Reward scene in the globe's own area: an anime-style painted valley (images/rainbow-valley.jpg,
// generated for this site) split into sky, valley and grass layers that move at different speeds,
// with a glowing rainbow drawn by CSS. Rain first, then the sky clears and the bow appears:
// red outside, violet inside, a fainter reversed secondary bow, and its feet fade behind the hills.
const RB_IMG='images/rainbow-valley.jpg';
const RB={el:null,orbit:null,on:false,raf:0,t0:0,drag:null,ry:0,rx:0,vy:0};
function rainbowBuild(){
 const world=document.querySelector('.world');if(!world)return null;
 const el=document.createElement('div');el.id='rainbowStage';el.className='rb-stage';el.setAttribute('role','img');
 el.style.setProperty('--img',`url("${RB_IMG}")`);
 el.innerHTML='<div class="rb-layer rb-sky"></div>'
  +'<div class="rb-scene"><div class="rb-orbit"><div class="rb-bow rb-secondary"></div><div class="rb-bow rb-inner"></div><div class="rb-bow rb-glow"></div><div class="rb-bow rb-front"></div><div class="rb-bow rb-shine"></div></div></div>'
  +'<div class="rb-layer rb-valley"></div><div class="rb-mist"><i></i><i></i><i></i></div><div class="rb-layer rb-grass"></div>'
  +'<div class="rb-storm"></div><div class="rb-sunlight"></div>'
  +'<div class="rb-rain">'+Array.from({length:44},(_,i)=>`<i class="${i%4?'':'keep'}" style="left:${(i*37+11)%104-2}%;--d:${((i*.173)%1.4).toFixed(2)}s;--l:${40+i%6*16}px;--o:${(.35+(i%5)*.12).toFixed(2)}"></i>`).join('')+'</div>';
 world.append(el);RB.el=el;RB.orbit=el.querySelector('.rb-orbit');
 el.addEventListener('pointerdown',e=>{try{el.setPointerCapture(e.pointerId)}catch(err){}RB.drag={x:e.clientX,y:e.clientY,ry:RB.ry,rx:RB.rx,last:e.clientX}});
 el.addEventListener('pointermove',e=>{if(!RB.drag)return;RB.vy=(e.clientX-RB.drag.last)*.15;RB.drag.last=e.clientX;RB.ry=Math.max(-24,Math.min(24,RB.drag.ry+(e.clientX-RB.drag.x)*.12));RB.rx=Math.max(-6,Math.min(12,RB.drag.rx-(e.clientY-RB.drag.y)*.06))});
 const end=()=>{RB.drag=null};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 window.addEventListener('resize',rainbowSize);
 return el;
}
function rainbowSize(){if(!RB.el)return;const w=RB.el.clientWidth,h=RB.el.clientHeight;RB.el.style.setProperty('--d',Math.round(Math.min(w*.96,h*.78))+'px');RB.el.style.setProperty('--h',h+'px')}
function rainbowFrame(now){
 if(!RB.on){RB.raf=0;return}
 const t=(now-RB.t0)/1000,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!RB.drag){RB.ry+=RB.vy;RB.vy*=.9;RB.ry=Math.max(-24,Math.min(24,RB.ry));if(!reduced){RB.ry+=(Math.sin(t*.35)*8-RB.ry)*.01;RB.rx+=(3+Math.sin(t*.27)*2-RB.rx)*.02}}
 RB.orbit.style.transform=`rotateX(${RB.rx.toFixed(2)}deg) rotateY(${RB.ry.toFixed(2)}deg)`;
 RB.el.style.setProperty('--px',(-RB.ry*.9).toFixed(1));
 RB.raf=requestAnimationFrame(rainbowFrame);
}
function rainbowStage(on){
 if(on&&!RB.el&&!rainbowBuild())return;
 if(RB.el)RB.el.setAttribute('aria-label',lang==='zh'?'雨停咗，綠色山谷上面出咗一條彩虹：紅色喺外面，紫色喺入面，外面仲有一條淡啲嘅副虹；可以用手指拖動睇吓':'After the rain, a rainbow over a green valley: red outside, violet inside, with a fainter second bow. Drag to look around.');
 if(on===RB.on)return;RB.on=on;
 document.querySelector('.world').classList.toggle('rainbow-on',on);
 cancelAnimationFrame(RB.raf);RB.raf=0;RB.drag=null;
 if(on){RB.el.classList.remove('play');void RB.el.offsetWidth;rainbowSize();RB.ry=-10;RB.rx=4;RB.vy=0;RB.el.classList.add('play');RB.t0=performance.now();RB.raf=requestAnimationFrame(rainbowFrame)}
}
