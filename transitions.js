'use strict';
const earthFilms=[
 {theme:'rain',name:['熱熱地球，變出大海','From glowing rock to oceans'],lines:[
 ['睇吓，地球仲係熱辣辣！過咗好長好長時間，表面先慢慢冷卻。','Earth began very hot. Over a very long time, its surface slowly cooled.'],
 ['水聚埋一齊，形成大海。藍色越嚟越多，地球好似換咗件新衫！','Water gathered into oceans. Our changing planet began to wear a beautiful blue coat.'],
 ['呢度係好耐以前嘅海洋世界。搵搵藍色，再想像海水輕輕搖吓搖。','Here is an ancient ocean world. Find the blue, and imagine the water gently moving.']]},
 {theme:'life',name:['大海裡，生命醒來','Tiny life in a great big ocean'],lines:[
 ['大海咁大，入面有啲乜呢？有啲生命細到我哋用眼都睇唔到。','What lived in those great oceans? Some living things were too tiny for our eyes to see.'],
 ['佢哋比一粒沙仲細！呢度放大咗畀你睇，唔係真係有咁大粒㗎。','Smaller than a grain of sand! Our floating shapes are enlarged illustrations, not life-size creatures.'],
 ['嗰陣未有恐龍，亦未有人。由小小生命開始，地球仲有好多故事。','There were no dinosaurs and no people yet. Earth still had so many stories ahead.']]},
 {theme:'land',name:['超級慢的陸地拼圖','A very slow land puzzle'],lines:[
 ['時間繼續向前，經過好多好多年。地球上嘅陸地，原來會慢慢移動。','Time moved on through many, many years. The pieces of Earth’s land moved very slowly.'],
 ['好似砌拼圖咁，好多陸地連埋一齊，成為一大片盤古大陸。','Like pieces in a puzzle, many lands joined together into a huge continent called Pangaea.'],
 ['呢個係幫我哋想像嘅動畫，真正嘅變化慢好多。你覺得陸地似乜嘢？','This animation helps us imagine the change. It really took far longer. What shape can you see?']]},
 {theme:'dino',name:['陸地分開，恐龍登場','Moving lands, dinosaur days'],lines:[
 ['大大塊陸地開始慢慢分開，海水喺中間。地球嘅拼圖又變咗樣！','The great land slowly split apart, with water between the pieces. Earth’s puzzle was changing again.'],
 ['森林裡面，有恐龍走過。有啲高高大大，有啲就細細隻。','Dinosaurs walked through forests. Some were very big, and some were little.'],
 ['聽住故事，試吓用手指扮恐龍行路。嗰個世界，仲未有人類㗎！','Try walking two fingers like dinosaur feet. People had not appeared in that world yet.']]},
 {theme:'ice',name:['走進冰雪世界','Into an icy world'],lines:[
 ['再向前去好遠好遠嘅未來。好多種生命來過又離開，地球繼續變。','Now travel much further forward in time. Many kinds of life came and went as Earth changed.'],
 ['我哋來到寒冷嘅冰期，大冰原蓋住好多北方陸地，好似厚厚張被。','We reach a cold ice age. Huge sheets of ice covered many northern lands like thick blankets.'],
 ['嗰陣有人類，亦有長毛象。如果住喺呢度，你會點樣保暖呢？','People and woolly mammoths lived then. How would you keep warm in this chilly world?']]},
 {theme:'home',name:['冰雪慢退，回到我們的家','Back to our shared home'],lines:[
 ['之後，氣候變暖，好多大冰原慢慢退去。陸地同海洋，又有新模樣。','Later, the climate warmed and many great ice sheets retreated. Land and sea changed again.'],
 ['時間嚟到今日。有山、有沙漠、有森林，仲有連住一齊嘅大海。','Now we reach today. Mountains, deserts, forests, and connected oceans share one planet.'],
 ['呢個就係我哋嘅地球！轉一轉，搵一個你想去嘅地方，一齊愛惜佢。','This is our Earth! Turn it, find a place you would love to visit, and help care for our home.']]}
];
const filmAudioFiles=["audio/transition-0.m4a","audio/transition-1.m4a","audio/transition-2.m4a","audio/transition-3.m4a","audio/transition-4.m4a","audio/transition-5.m4a"];
const filmAudio=new Audio();filmAudio.preload='none';
const film={active:false,paused:false,elapsed:0,last:0,from:0,to:1,segment:-1,anchor:null,token:0,silent:false,raf:0};
const filmDialog=document.createElement('dialog');filmDialog.id='earthFilm';filmDialog.setAttribute('aria-label','30 秒地球故事動畫');
filmDialog.innerHTML='<div class="film-shell"><header class="film-header"><div><span id="filmEyebrow"></span><h2 id="filmTitle"></h2></div><button id="filmSkip" class="quiet"></button></header><div class="film-theatre"><div class="film-aura"></div><div id="filmParticles" aria-hidden="true"></div><div id="filmWorld"></div><div class="film-orbit" aria-hidden="true"></div></div><div class="film-copy"><div id="filmChapters" aria-hidden="true"></div><p id="filmCaption" aria-live="polite"></p><small id="filmNote"></small><div class="film-controls"><button id="filmPause" class="listen"></button><span id="filmTime"></span><button id="filmRestart" class="quiet"></button></div><div class="film-track"><div id="filmProgress"></div></div></div></div>';
document.body.append(filmDialog);
function renderTransitionButton(){const button=$('replayTransition');button.hidden=mode!=='earth'||index===0;button.textContent=lang==='zh'?'重看 30 秒過場 ↻':'Replay the 30-second transition ↻'}
function currentTransition(){if(!film.active)return null;const p=Math.max(0,Math.min(1,(film.elapsed-4)/20));return {from:earth[film.from].kind,blend:matchMedia('(prefers-reduced-motion: reduce)').matches?1:p*p*(3-2*p)}}
function filmEnglishLine(){if(lang!=='en'||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(earthFilms[film.from].lines[film.segment][1]);u.lang='en-AU';u.rate=1;speechSynthesis.speak(u)}
function filmFrame(now){
 if(!film.active)return;
 film.raf=requestAnimationFrame(filmFrame);
 const delta=film.last?Math.min(.12,(now-film.last)/1000):0;film.last=now;
 if(!film.paused){film.elapsed=lang==='zh'&&!film.silent&&!filmAudio.paused&&filmAudio.currentTime>0?Math.min(30,filmAudio.currentTime):Math.min(30,film.elapsed+delta);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced){rotation=(earth[film.from].angle*Math.PI/180)+film.elapsed*.012;zoom=1+Math.sin(film.elapsed/30*Math.PI)*.065}dirty=true}
 const segment=Math.min(2,Math.floor(film.elapsed/10));
 if(segment!==film.segment){film.segment=segment;$('filmCaption').textContent=choose(earthFilms[film.from].lines[segment]);$('filmChapters').innerHTML=[0,1,2].map(i=>'<span class="'+(i===segment?'active':'')+'"></span>').join('');filmEnglishLine()}
 $('filmProgress').style.width=film.elapsed/30*100+'%';$('filmTime').textContent=Math.floor(film.elapsed)+' / 30 '+(lang==='zh'?'秒':'s');
 if(film.elapsed>=30)finishFilm();
}
function playFilmAudio(){const token=film.token;if(lang!=='zh')return;filmAudio.play().catch(error=>{if(film.active&&token===film.token&&!film.paused&&error.name!=='AbortError'){film.silent=true;$('filmNote').textContent=lang==='zh'?'聲音未能播放；仍可看動畫及字幕。':'Audio unavailable; animation and captions still work.'}})}
function beginFilm(target){
 if(film.active||target<1||target>=earth.length)return;
 stopPlay();stopSpeech();if(typeof stopGameAudio==='function')stopGameAudio();
 film.active=true;film.paused=false;film.elapsed=0;film.last=0;film.from=target-1;film.to=target;film.segment=-1;film.silent=false;film.token++;
 mode='earth';index=target;spinning=false;pitch=0;zoom=1;selectedGeo=null;rotation=earth[film.from].angle*Math.PI/180;render(false);
 const story=earthFilms[film.from],zh=lang==='zh';filmDialog.className='film-'+story.theme;
 $('filmTitle').textContent=choose(story.name);$('filmEyebrow').textContent=(zh?'地球小劇場 · ':'EARTH MINI CINEMA · ')+(film.from+1)+' / 6';$('filmSkip').textContent=zh?'略過，去下一站 →':'Skip to the next stop →';$('filmPause').textContent=zh?'Ⅱ 暫停':'Ⅱ Pause';$('filmPause').setAttribute('aria-pressed','false');$('filmRestart').textContent=zh?'↻ 重播':'↻ Replay';$('filmNote').textContent=zh?'故事示意動畫 · 真正的地球變化歷時非常漫長':'ILLUSTRATIVE ANIMATION · REAL CHANGES TOOK MUCH LONGER';
 $('filmParticles').innerHTML=Array.from({length:14},(_,i)=>'<i class="film-particle" style="--i:'+i+';--x:'+((i*71+13)%100)+'%;--y:'+((i*37+9)%90)+'%;--s:'+(18+i%5*7)+'px;--delay:'+(-i*.67)+'s"></i>').join('');
 const world=document.querySelector('.world');film.anchor=document.createComment('Earth cinema return point');world.parentNode.insertBefore(film.anchor,world);$('filmWorld').append(world);$('globe').tabIndex=-1;
 document.body.classList.add('film-open');filmDialog.showModal();filmAudio.src=filmAudioFiles[film.from];filmAudio.currentTime=0;playFilmAudio();dirty=true;film.raf=requestAnimationFrame(filmFrame);$('filmPause').focus({preventScroll:true});
}
function finishFilm(){
 if(!film.active)return;film.active=false;film.token++;cancelAnimationFrame(film.raf);filmAudio.pause();filmAudio.currentTime=0;if('speechSynthesis'in window)speechSynthesis.cancel();
 const world=document.querySelector('.world');film.anchor.parentNode.insertBefore(world,film.anchor);film.anchor.remove();film.anchor=null;$('globe').tabIndex=0;filmDialog.close();document.body.classList.remove('film-open');setIndex(film.to);$('replayTransition').focus({preventScroll:true});
}
function pauseFilm(){if(!film.active)return;film.paused=!film.paused;filmDialog.classList.toggle('film-paused',film.paused);$('filmPause').setAttribute('aria-pressed',film.paused);$('filmPause').textContent=film.paused?(lang==='zh'?'▶ 繼續':'▶ Continue'):(lang==='zh'?'Ⅱ 暫停':'Ⅱ Pause');if(film.paused){filmAudio.pause();if('speechSynthesis'in window)speechSynthesis.cancel()}else{film.last=0;playFilmAudio();filmEnglishLine()}}
$('filmPause').onclick=pauseFilm;$('filmSkip').onclick=finishFilm;
$('filmRestart').onclick=()=>{film.token++;film.elapsed=0;film.last=0;film.segment=-1;filmAudio.currentTime=0;if(film.paused)pauseFilm();else playFilmAudio();dirty=true};
filmDialog.addEventListener('cancel',e=>{e.preventDefault();finishFilm()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&film.active&&!film.paused)pauseFilm()});
['start','next'].forEach(id=>$(id).addEventListener('click',e=>{if(mode==='earth'&&index<earth.length-1){e.preventDefault();e.stopImmediatePropagation();beginFilm(index+1)}},{capture:true}));
$('replayTransition').onclick=()=>beginFilm(index);
renderTransitionButton();
