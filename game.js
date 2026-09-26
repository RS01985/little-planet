'use strict';
// Ten picture-led missions with five kinds of on-screen play: find, spin, drag, pick, tap and turn.
// Everything works without reading; each mission has a bundled Cantonese prompt.
const gamePlaces={
 ocean:{icon:'🌊',name:['大海','Ocean'],point:[-18,78]},
 africa:{icon:'🦁',name:['非洲','Africa'],point:[3,22]},
 australia:{icon:'🦘',name:['澳洲','Australia'],point:[-25,134]},
 ice:{icon:'🐧',name:['南極洲','Antarctica'],point:[-80,10]},
 forest:{icon:'🌳',name:['亞馬遜雨林','Amazon rainforest'],point:[-5,-63]},
 desert:{icon:'🏜️',name:['撒哈拉沙漠','Sahara desert'],point:[24,15]},
 atlantic:{icon:'🌊',name:['大西洋','Atlantic Ocean'],point:[0,-32]},
 southsea:{icon:'🌊',name:['南大洋','Southern Ocean'],point:[-55,65]},
 mountains:{icon:'🏔️',name:['喜馬拉雅山脈','Himalayas'],point:[29,87]}
};
const gameQuests=[
 {type:'find',target:'ocean',choices:['africa','ocean','australia'],camera:[-5,75],icon:'🌊',question:['搵搵藍色大海！','Find the blue ocean!'],hint:['點一下 🌊，搵到大海。','Tap 🌊 to find the ocean.'],fact:['搵到喇！藍色嘅地方係大海。','You found it! The blue areas are oceans.']},
 {type:'spin',target:'australia',camera:[-10,40],icon:'🦘',question:['轉吓地球，將澳洲轉入中間個圈！','Turn the globe until Australia is inside the circle!'],hint:['用手指拖住地球，搵 🦘。','Drag the globe with your finger and look for 🦘.'],fact:['轉到喇！澳洲喺地球南邊，袋鼠住喺度。','You did it! Australia is in the south, where kangaroos live.']},
 {type:'tap',icon:'🦘',anim:'jump',count:3,question:['幫袋鼠跳三下！','Help the kangaroo hop three times!'],hint:['撳袋鼠三次，睇吓佢跳幾高。','Tap the kangaroo three times and watch it hop.'],fact:['好勁！袋鼠用強壯嘅後腳跳。','Great hopping! Kangaroos jump with strong back legs.']},
 {type:'find',target:'ice',choices:['southsea','australia','ice'],camera:[-72,70],icon:'🐧',question:['去冰雪世界探企鵝！','Visit the penguins on the ice!'],hint:['搵吓 🐧，去南極洲睇冰雪。','Find 🐧 to visit icy Antarctica.'],fact:['南極洲有好多冰雪，亦有企鵝！','Antarctica has lots of ice — and penguins!']},
 {type:'tap',icon:'🐧',anim:'waddle',count:5,question:['幫企鵝行五步！','Help the penguin take five steps!'],hint:['撳企鵝五次，佢會搖搖擺擺咁行過冰面。','Tap the penguin five times to waddle across the ice.'],fact:['企鵝行路搖搖擺擺，但係游水好快㗎！','Penguins waddle on land but swim very fast!']},
 {type:'drag',target:'africa',choices:['australia','africa','forest'],camera:[0,40],icon:'🦁',token:'🦁',question:['將獅子拖返佢嘅屋企！','Drag the lion to its home!'],hint:['按住 🦁，拖去非洲個圖案。','Hold 🦁 and drag it to Africa.'],fact:['大部分獅子住喺非洲嘅草原。','Most lions live on the grasslands of Africa.']},
 {type:'pick',icon:'🌳',answer:0,options:[['🌳',['好多樹','Lots of trees']],['🧊',['好多冰','Lots of ice']],['🏜️',['好多沙','Lots of sand']]],question:['雨林入面最多係乜嘢？','What is there most of in a rainforest?'],hint:['諗吓綠色嘅雨林。','Think of the green rainforest.'],fact:['啱呀！雨林有好多好多樹，仲成日落雨。','Yes! Rainforests have lots of trees and lots of rain.']},
 {type:'spin',target:'mountains',camera:[10,20],icon:'🏔️',question:['轉去世界最高嘅山！','Turn the globe to the highest mountains!'],hint:['搵 🏔️，將佢轉入中間個圈。','Find 🏔️ and turn it into the circle.'],fact:['喜馬拉雅山脈有世界最高嘅山，叫珠穆朗瑪峰。','The Himalayas have the world’s highest mountain, Mount Everest.']},
 {type:'pick',icon:'🐫',answer:2,options:[['🐧',['企鵝','Penguin']],['🐬',['海豚','Dolphin']],['🐫',['駱駝','Camel']]],question:['邊隻動物最啱住喺沙漠？','Which animal is best at living in the desert?'],hint:['沙漠好熱，好少水。','Deserts are hot with very little water.'],fact:['係駱駝！駱駝可以好耐唔使飲水。','The camel! Camels can go a long time without drinking.']},
 {type:'turn',icon:'🌍',camera:[10,20],question:['用手指轉地球，轉足一個圈！','Turn the globe all the way around once!'],hint:['用手指向左或者向右拖地球，睇吓個圈填滿未。','Drag the globe left or right until the ring is full.'],fact:['地球每日都自轉一圈，所以有日頭同夜晚。','Earth turns once every day, giving us day and night.']}
];
const GAME_TOTAL=gameQuests.length;
// Literal paths so the offline build can embed each file.
const gameAudioFiles=["audio/game-0.m4a", "audio/game-1.m4a", "audio/game-2.m4a", "audio/game-3.m4a", "audio/game-4.m4a", "audio/game-5.m4a", "audio/game-6.m4a", "audio/game-7.m4a", "audio/game-8.m4a", "audio/game-9.m4a", "audio/game-correct.m4a", "audio/game-retry.m4a", "audio/game-finish.m4a"];
if(gameAudioFiles.length!==GAME_TOTAL+3)console.warn('Game audio list does not match the missions');
const GAME_CORRECT=GAME_TOTAL,GAME_RETRY=GAME_TOTAL+1,GAME_FINISH=GAME_TOTAL+2;
const gameAudio=new Audio();gameAudio.preload='none';
let gameActive=false,gameStep=0,gameSolved=false,gameFinished=false,gameAudioId=0,gameDrag=null,gameTaps=0,gameTurn={last:null,sum:0};
function stopGameAudio(){gameAudioId++;gameAudio.pause();gameAudio.currentTime=0;if('speechSynthesis'in window)speechSynthesis.cancel()}
function speakGame(which=gameStep){
 stopSpeech();stopGameAudio();const playId=gameAudioId;
 if(lang==='zh'){gameAudio.src=gameAudioFiles[which];gameAudio.play().catch(()=>{if(playId===gameAudioId)notify('請再按一次「聽任務」，並檢查音量。')})}
 else if('speechSynthesis'in window){const q=gameQuests[gameStep];const text=which===GAME_FINISH?'Ten stars! You are a little Earth explorer!':which===GAME_RETRY?'Nearly! Try again. You can do it!':which===GAME_CORRECT?'Well done! One more star.':choose(q.question)+' '+choose(q.hint);const u=new SpeechSynthesisUtterance(text);u.lang='en-AU';u.rate=.82;speechSynthesis.speak(u)}
}
gameAudio.onerror=()=>notify(lang==='zh'?'聲音未能載入，仍可睇圖案繼續玩。':'Audio could not load. You can still play using pictures.');
function centreGame(){const q=gameQuests[gameStep],c=q.camera||[10,20];gameTaps=0;gameTurn={last:null,sum:0};rotation=c[1]*Math.PI/180;pitch=c[0]*Math.PI/180;zoom=1;spinning=false;selectedGeo=null;dirty=true;$('rotate').textContent='▷';$('rotate').setAttribute('aria-pressed','false');$('rotate').setAttribute('aria-label',lang==='zh'?'讓地球旋轉':'Rotate the globe')}
function solveGame(){if(gameSolved)return;gameSolved=true;renderGame();speakGame(GAME_CORRECT);$('gameNext').focus({preventScroll:true})}
function missionLabel(q){const zh=lang==='zh';return {find:zh?'搵一搵':'FIND',spin:zh?'轉一轉':'SPIN',drag:zh?'拖一拖':'DRAG',pick:zh?'揀一揀':'PICK',tap:zh?'撳一撳':'TAP',turn:zh?'轉一圈':'TURN'}[q.type]}
function gameBody(q){
 const zh=lang==='zh';
 if(q.type==='pick')return `<div class="game-answers game-pick">${q.options.map((o,i)=>`<button data-pick="${i}" ${gameSolved?'disabled':''}><span aria-hidden="true">${o[0]}</span>${choose(o[1])}</button>`).join('')}</div>`;
 if(q.type==='tap'){const n=gameSolved?q.count:gameTaps;return `<div class="game-tap" data-anim="${q.anim}"><div class="game-tap-track"><button id="gameTapper" class="game-tapper" style="--step:${n/q.count}" ${gameSolved?'disabled':''} aria-label="${zh?'撳一下':'Tap'}">${q.icon}</button></div><div class="game-tap-dots" aria-label="${n} / ${q.count}">${Array.from({length:q.count},(_,i)=>`<span class="${i<n?'on':''}"></span>`).join('')}</div></div>`}
 if(q.type==='turn'){const k=gameSolved?1:Math.min(1,gameTurn.sum/(Math.PI*2));return `<div class="game-turn"><div class="game-turn-ring" style="--p:${Math.round(k*100)}%"><span id="gameTurnText">${Math.round(k*100)}%</span></div><button id="gameHelp" class="quiet" ${gameSolved?'hidden':''}>🤝 ${zh?'幫我轉':'Help me turn'}</button></div>`}
 if(q.type==='spin')return `<button id="gameHelp" class="quiet" ${gameSolved?'hidden':''}>🤝 ${zh?'幫我轉':'Help me turn'}</button>`;
 if(q.type==='drag')return `<div class="game-token-row"><button id="gameToken" class="game-token" ${gameSolved?'hidden':''} aria-label="${zh?'拖動獅子':'Drag the lion'}">${q.token}</button><span>${zh?'按住，拖去地球上面個圖案':'Hold and drag onto the globe'}</span></div><div class="game-answers" aria-label="${zh?'亦可以喺呢度揀答案':'You can also choose here'}">${q.choices.map(k=>`<button data-answer="${k}" ${gameSolved?'disabled':''}><span aria-hidden="true">${gamePlaces[k].icon}</span>${choose(gamePlaces[k].name)}</button>`).join('')}</div>`;
 return `<div class="game-answers" aria-label="${zh?'亦可以喺呢度揀答案':'You can also choose an answer here'}">${q.choices.map(k=>`<button data-answer="${k}" ${gameSolved?'disabled':''}><span aria-hidden="true">${gamePlaces[k].icon}</span>${choose(gamePlaces[k].name)}</button>`).join('')}</div>`;
}
function renderGame(){
 const zh=lang==='zh';$('gameModeLabel').textContent=zh?'地球小遊戲':'Play & discover';$('gameMode').classList.toggle('active',gameActive);$('gameMode').setAttribute('aria-pressed',gameActive);
 $('gamePanel').classList.toggle('game-complete',gameFinished);$('gamePanel').hidden=!gameActive;document.querySelector('.story').hidden=gameActive;document.querySelector('.timeline-panel').hidden=gameActive;document.body.classList.toggle('playing-game',gameActive);
 const q=gameQuests[gameStep];document.querySelector('.world').classList.toggle('game-spin',gameActive&&!gameFinished&&!gameSolved&&q.type==='spin');
 if(!gameActive){$('gamePins').replaceChildren();return}
 ['earthMode','humanMode'].forEach(id=>{$(id).classList.remove('active');$(id).setAttribute('aria-pressed','false')});
 const stars=gameFinished?GAME_TOTAL:gameStep+(gameSolved?1:0);
 $('gamePanel').innerHTML=`<div class="game-kicker">✦ ${zh?'小小地球探險家':'LITTLE EARTH EXPLORER'}</div><div class="game-stars" aria-label="${stars} / ${GAME_TOTAL} ${zh?'顆星':'stars'}">${Array.from({length:GAME_TOTAL},(_,i)=>`<span class="${i<stars?'earned':''}" aria-hidden="true">★</span>`).join('')}</div><div class="game-mission">${zh?'任務':'MISSION'} ${gameStep+1} / ${GAME_TOTAL} · ${gameFinished?'':missionLabel(q)+' · '}${zh?'慢慢玩，唔使急':'TAKE YOUR TIME'}</div>${gameFinished?rainbowReward():`<div class="game-hero" aria-hidden="true">${q.icon}</div>`}<h1>${gameFinished?(zh?'你係地球<br><em>小小探險家！</em>':'Our little<br><em>Earth explorer!</em>'):choose(q.question)}</h1><p class="game-hint">${gameFinished?(zh?'十粒星星，十個新發現。拍拍手！':'Ten stars. Ten discoveries. Give yourself a clap!'):choose(q.hint)}</p><div class="game-actions"><button id="gameListen" class="listen">♫ ${zh?'聽任務 · 廣東話':'Hear the mission'}</button>${!gameFinished&&['find','spin','drag'].includes(q.type)?`<button id="gameCentre" class="quiet">↺ ${zh?'由頭轉過':'Start the turn again'}</button>`:''}</div><div id="gameFeedback" role="status" aria-live="polite">${gameSolved&&!gameFinished?choose(q.fact):''}</div>${gameFinished?'':gameBody(q)}<button id="gameNext" class="primary" ${gameSolved||gameFinished?'':'hidden'}>${gameFinished?(zh?'再玩一次 ↻':'Play again ↻'):gameStep===GAME_TOTAL-1?(zh?'睇我嘅星星 ✦':'See my stars ✦'):(zh?'下一個任務 →':'Next mission →')}</button><p class="game-tip">${gameFinished?'':q.type==='spin'?(zh?'用手指轉地球，將圖案轉入中間個圈。':'Turn the globe so the picture is inside the circle.'):q.type==='tap'?(zh?'喺畫面上撳，唔使離開座位。':'Tap right here on the screen.'):q.type==='turn'?(zh?'用手指拖地球，轉足一個圈。':'Drag the globe all the way around.'):(zh?'轉轉地球，點圖案；亦可以點上面嘅答案。':'Turn the globe and tap a picture, or use the answer buttons.')}</p>`;
 $('gameListen').onclick=()=>speakGame(gameFinished?GAME_FINISH:gameStep);if($('gameCentre'))$('gameCentre').onclick=centreGame;
 $('gameNext').onclick=()=>{stopGameAudio();if(gameFinished){gameStep=0;gameSolved=false;gameFinished=false}else if(gameStep===GAME_TOTAL-1){gameFinished=true}else{gameStep++;gameSolved=false}centreGame();renderGame();speakGame(gameFinished?GAME_FINISH:gameStep);(gameFinished?$('gameNext'):$('gameListen')).focus({preventScroll:true})};
 if(q.type==='turn'&&$('gameHelp'))$('gameHelp').onclick=()=>{const r0=rotation,t0=performance.now();const step=now=>{const k=Math.min(1,(now-t0)/2600),e=k*k*(3-2*k);rotation=r0+Math.PI*2.02*e;dirty=true;if(k<1&&gameActive&&!gameSolved)requestAnimationFrame(step)};requestAnimationFrame(step)};
 else if($('gameHelp'))$('gameHelp').onclick=()=>{const t=gamePlaces[q.target].point;const from={r:rotation,p:pitch},to={r:t[1]*Math.PI/180,p:t[0]*Math.PI/180};let d=to.r-from.r;d=Math.atan2(Math.sin(d),Math.cos(d));const t0=performance.now();const step=now=>{const k=Math.min(1,(now-t0)/1400),e=k*k*(3-2*k);rotation=from.r+d*e;pitch=from.p+(to.p-from.p)*e;dirty=true;if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)};
 if(q.type==='tap'&&!gameSolved&&!gameFinished)$('gameTapper').onclick=()=>{gameTaps++;const b=$('gameTapper');b.style.setProperty('--step',gameTaps/q.count);b.classList.remove('hop');void b.offsetWidth;b.classList.add('hop');document.querySelectorAll('.game-tap-dots span').forEach((d,i)=>d.classList.toggle('on',i<gameTaps));if(gameTaps>=q.count)setTimeout(solveGame,650)};
 if($('gameToken'))initTokenDrag($('gameToken'),q);
 const pins=gameFinished||!['find','drag'].includes(q.type)?[]:q.choices;
 $('gamePins').innerHTML=pins.map(k=>`<button class="game-pin" data-answer="${k}" aria-label="${choose(gamePlaces[k].name)}" ${gameSolved?'disabled':''}><span aria-hidden="true">${gamePlaces[k].icon}</span><small>${choose(gamePlaces[k].name)}</small></button>`).join('')+(q.type==='spin'&&!gameFinished?`<button class="game-pin game-spin-pin" data-spin="${q.target}" tabindex="-1" aria-hidden="true"><span>${gamePlaces[q.target].icon}</span></button>`:'');
 drawGamePins();if(typeof rainbowStage==='function')rainbowStage(gameActive&&gameFinished);
}
function drawGamePins(){
 if(!gameActive)return;const size=$('globe').clientWidth;
 document.querySelectorAll('.game-pin').forEach(b=>{const key=b.dataset.answer||b.dataset.spin,p=project(gamePlaces[key].point,size);b.hidden=!gl||!textureReady||p.z<.18||p.x<28||p.x>size-28||p.y<35||p.y>size-35;b.style.left=p.x+'px';b.style.top=p.y+'px'});
 const q=gameQuests[gameStep];
 if(q&&q.type==='turn'&&!gameSolved&&!gameFinished){if(gameTurn.last!==null){let d=rotation-gameTurn.last;d=Math.atan2(Math.sin(d),Math.cos(d));gameTurn.sum+=Math.abs(d)}gameTurn.last=rotation;const k=Math.min(1,gameTurn.sum/(Math.PI*2)),ring=document.querySelector('.game-turn-ring');if(ring){ring.style.setProperty('--p',Math.round(k*100)+'%');$('gameTurnText').textContent=Math.round(k*100)+'%'}if(k>=1)solveGame()}
 if(q&&q.type==='spin'&&!gameSolved&&!gameFinished){const p=project(gamePlaces[q.target].point,size);const d=Math.hypot(p.x-size/2,p.y-size/2);if(p.z>.75&&d<size*.13&&!drag&&!pinch)solveGame()}
}
function initTokenDrag(token,q){
 token.addEventListener('pointerdown',e=>{if(gameSolved)return;e.preventDefault();try{token.setPointerCapture(e.pointerId)}catch(err){}const r=token.getBoundingClientRect();gameDrag={id:e.pointerId,dx:e.clientX-r.left-r.width/2,dy:e.clientY-r.top-r.height/2};token.classList.add('dragging');token.style.position='fixed';token.style.zIndex=50;moveToken(e)});
 token.addEventListener('pointermove',e=>{if(gameDrag&&gameDrag.id===e.pointerId)moveToken(e)});
 const drop=e=>{if(!gameDrag||gameDrag.id!==e.pointerId)return;gameDrag=null;token.classList.remove('dragging');token.style.visibility='hidden';const under=document.elementFromPoint(e.clientX,e.clientY);token.style.visibility='';const pin=under&&under.closest('.game-pin');let hit=pin?pin.dataset.answer:null;
  if(!hit){const size=$('globe').clientWidth,box=$('globe').getBoundingClientRect(),p=project(gamePlaces[q.target].point,size);if(p.z>.18&&Math.hypot(e.clientX-box.left-p.x,e.clientY-box.top-p.y)<56)hit=q.target}
  token.style.position='';token.style.left='';token.style.top='';token.style.zIndex='';
  if(hit===q.target)solveGame();else{$('gameFeedback').textContent=lang==='zh'?'差少少，拖去 '+gamePlaces[q.target].icon+' 再試吓！':'Nearly! Try dragging onto '+gamePlaces[q.target].icon+'.';speakGame(GAME_RETRY)}};
 token.addEventListener('pointerup',drop);token.addEventListener('pointercancel',e=>{gameDrag=null;token.classList.remove('dragging');token.style.position='';token.style.zIndex=''});
 function moveToken(e){token.style.left=(e.clientX-token.offsetWidth/2)+'px';token.style.top=(e.clientY-token.offsetHeight/2)+'px'}
}
function answerGame(e){
 if(!gameActive||gameSolved||gameFinished)return;const q=gameQuests[gameStep];
 const pick=e.target.closest('[data-pick]');if(pick&&q.type==='pick'){if(+pick.dataset.pick===q.answer)solveGame();else{pick.classList.add('tried');$('gameFeedback').textContent=lang==='zh'?'差少少，再諗吓！':'Nearly! Have another think.';speakGame(GAME_RETRY)}return}
 const b=e.target.closest('[data-answer]');if(!b||!['find','drag'].includes(q.type))return;
 if(b.dataset.answer===q.target)solveGame();else{$('gameFeedback').textContent=lang==='zh'?'差少少，再搵吓 '+gamePlaces[q.target].icon+'！':'Try looking for '+gamePlaces[q.target].icon+'!';b.classList.add('tried');speakGame(GAME_RETRY)}
}
$('gamePanel').addEventListener('click',answerGame);$('gamePins').addEventListener('click',answerGame);
function rainbowReward(){const zh=lang==='zh';return `<p class="rainbow-note">🌈 ${zh?'睇吓右邊：雨停咗，出咗真實嘅雙彩虹！太陽喺你背後照住雨點，紅色喺外面，紫色喺入面；外面仲有一條淡啲、顏色倒轉嘅副虹。用手指拖吓個畫面，行吓睇吓。':'Look: the rain has stopped and a real double rainbow appears! With the Sun behind you, red is on the outside and violet inside, with a fainter reversed bow beyond. Drag the picture to walk around.'}</p>`}
function leaveGame(){if(!gameActive)return;stopGameAudio();if(typeof rainbowStage==='function')rainbowStage(false);gameActive=false;document.querySelector('.world').classList.remove('game-spin');render(false)}
['earthMode','humanMode'].forEach(id=>$(id).addEventListener('click',leaveGame,{capture:true}));
$('gameMode').onclick=()=>{if(gameActive)return;stopPlay();stopSpeech();gameActive=true;gameStep=0;gameSolved=false;gameFinished=false;mode='earth';index=6;centreGame();render(false);speakGame();$('gameListen').focus({preventScroll:true})};
$('language').addEventListener('click',()=>{stopGameAudio();renderGame()},{capture:true});
$('reset').addEventListener('click',()=>{if(gameActive)centreGame()});
['parents','sources'].forEach(id=>$(id).addEventListener('click',stopGameAudio));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopGameAudio()});
renderGame();
