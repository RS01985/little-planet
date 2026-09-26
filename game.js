'use strict';
// Picture matching keeps the first geography game playable before a child can read.
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
 {target:'ocean',choices:['africa','ocean','australia'],camera:[-5,75],question:['搵搵藍色大海！','Find the blue ocean!'],hint:['點一下 🌊，搵到大海。','Tap 🌊 to find the ocean.'],fact:['搵到喇！藍色嘅地方係大海。','You found it! The blue areas are oceans.']},
 {target:'australia',choices:['australia','mountains','ocean'],camera:[-5,115],question:['袋鼠嘅家喺邊？','Where is the kangaroo’s home?'],hint:['搵吓 🦘 圖案，一齊去澳洲。','Look for 🦘. Let’s visit Australia.'],fact:['係澳洲呀！袋鼠住喺呢片陸地。','Australia! Kangaroos live on this land.']},
 {target:'ice',choices:['southsea','australia','ice'],camera:[-72,70],question:['去冰雪世界探企鵝！','Visit the penguins on the ice!'],hint:['搵吓 🐧，去南極洲睇冰雪。','Find 🐧 to visit icy Antarctica.'],fact:['南極洲有好多冰雪，亦有企鵝！','Antarctica has lots of ice — and penguins!']},
 {target:'africa',choices:['desert','africa','atlantic'],camera:[10,5],question:['一齊搵非洲！','Let’s find Africa!'],hint:['搵吓 🦁 圖案，點一下非洲。','Look for 🦁 and tap Africa.'],fact:['搵到非洲喇！獅子係住喺非洲嘅動物之一。','You found Africa! Lions are one of the animals that live here.']},
 {target:'forest',choices:['forest','atlantic','desert'],camera:[2,-32],question:['搵一片綠色雨林！','Find a green rainforest!'],hint:['搵吓 🌳，去亞馬遜雨林。','Look for 🌳 to visit the Amazon rainforest.'],fact:['亞馬遜雨林喺南美洲，有好多樹。','The Amazon rainforest is in South America, with lots of trees.']},
 {target:'desert',choices:['mountains','ocean','desert'],camera:[20,52],question:['去大沙漠探險！','Explore a great big desert!'],hint:['搵吓 🏜️，去撒哈拉沙漠。','Look for 🏜️ to visit the Sahara desert.'],fact:['撒哈拉沙漠喺非洲北部。唔係成個非洲都係沙漠㗎！','The Sahara is in northern Africa. Africa is much more than desert!']}
];
const gameAudioFiles=["audio/game-0.m4a","audio/game-1.m4a","audio/game-2.m4a","audio/game-3.m4a","audio/game-4.m4a","audio/game-5.m4a","audio/game-correct.m4a","audio/game-retry.m4a","audio/game-finish.m4a"];
const gameAudio=new Audio();gameAudio.preload='none';
let gameActive=false,gameStep=0,gameSolved=false,gameFinished=false,gameAudioId=0;
function stopGameAudio(){gameAudioId++;gameAudio.pause();gameAudio.currentTime=0;if('speechSynthesis'in window)speechSynthesis.cancel()}
function speakGame(which=gameStep){
 stopSpeech();stopGameAudio();const playId=gameAudioId;
 if(lang==='zh'){gameAudio.src=gameAudioFiles[which];gameAudio.play().catch(()=>{if(playId===gameAudioId)notify('請再按一次「聽任務」，並檢查音量。')})}
 else if('speechSynthesis'in window){const q=gameQuests[gameStep];const text=which===8?'Six stars! You are a little Earth explorer!':which===7?'Try the matching picture. You can do it!':which===6?'You found it! One more star.':choose(q.question)+' '+choose(q.hint);const u=new SpeechSynthesisUtterance(text);u.lang='en-AU';u.rate=.85;speechSynthesis.speak(u)}
}
gameAudio.onerror=()=>notify(lang==='zh'?'聲音未能載入，仍可睇圖案繼續玩。':'Audio could not load. You can still play using pictures.');
function centreGame(){const q=gameQuests[gameStep];rotation=q.camera[1]*Math.PI/180;pitch=q.camera[0]*Math.PI/180;zoom=1;spinning=false;selectedGeo=null;dirty=true;$('rotate').textContent='▷';$('rotate').setAttribute('aria-pressed','false');$('rotate').setAttribute('aria-label',lang==='zh'?'讓地球旋轉':'Rotate the globe')}
function rainbowReward(){return `<div class="rainbow-scene" role="img" aria-label="${lang==='zh'?'六粒星星變成閃亮立體彩虹':'Six stars become a shining three-dimensional rainbow'}"><div class="rainbow-orbit"><div class="rainbow-depth"></div><div class="rainbow-arc"></div><div class="rainbow-cloud cloud-left"></div><div class="rainbow-cloud cloud-right"></div>${Array.from({length:6},(_,i)=>`<span class="rainbow-star star-${i}" style="--delay:${i*.23}s" aria-hidden="true">✦</span>`).join('')}</div><div class="rainbow-floor"></div></div>`}
function renderGame(){
 const zh=lang==='zh';$('gameModeLabel').textContent=zh?'地球小遊戲':'Play & discover';$('gameMode').classList.toggle('active',gameActive);$('gameMode').setAttribute('aria-pressed',gameActive);
 $('gamePanel').classList.toggle('game-complete',gameFinished);$('gamePanel').hidden=!gameActive;document.querySelector('.story').hidden=gameActive;document.querySelector('.timeline-panel').hidden=gameActive;document.body.classList.toggle('playing-game',gameActive);
 if(!gameActive){$('gamePins').replaceChildren();return}
 ['earthMode','humanMode'].forEach(id=>{$(id).classList.remove('active');$(id).setAttribute('aria-pressed','false')});
 const q=gameQuests[gameStep],stars=gameFinished?6:gameStep+(gameSolved?1:0);
 $('gamePanel').innerHTML=`<div class="game-kicker">✦ ${zh?'小小地球探險家':'LITTLE EARTH EXPLORER'}</div><div class="game-stars" aria-label="${stars} / 6 ${zh?'顆星':'stars'}">${Array.from({length:6},(_,i)=>`<span class="${i<stars?'earned':''}" aria-hidden="true">★</span>`).join('')}</div><div class="game-mission">${zh?'任務':'MISSION'} ${gameStep+1} / 6 · ${zh?'慢慢玩，唔使急':'TAKE YOUR TIME'}</div>${gameFinished?rainbowReward():`<div class="game-hero" aria-hidden="true">${gamePlaces[q.target].icon}</div>`}<h1>${gameFinished?(zh?'你係地球<br><em>小小探險家！</em>':'Our little<br><em>Earth explorer!</em>'):choose(q.question)}</h1><p class="game-hint">${gameFinished?(zh?'六粒星星，六個新發現。拍拍手！':'Six stars. Six discoveries. Give yourself a clap!'):choose(q.hint)}</p><div class="game-actions"><button id="gameListen" class="listen">♫ ${zh?'聽任務 · 廣東話':'Hear the mission'}</button>${!gameFinished?`<button id="gameCentre" class="quiet">↺ ${zh?'搵返圖案':'Find the pictures'}</button>`:''}</div><div id="gameFeedback" role="status" aria-live="polite">${gameSolved&&!gameFinished?choose(q.fact):''}</div>${!gameFinished?`<div class="game-answers" aria-label="${zh?'亦可以喺呢度揀答案':'You can also choose an answer here'}">${q.choices.map(k=>`<button data-answer="${k}" ${gameSolved?'disabled':''}><span aria-hidden="true">${gamePlaces[k].icon}</span>${choose(gamePlaces[k].name)}</button>`).join('')}</div>`:''}<button id="gameNext" class="primary" ${gameSolved||gameFinished?'':'hidden'}>${gameFinished?(zh?'再玩一次 ↻':'Play again ↻'):gameStep===5?(zh?'睇我嘅星星 ✦':'See my stars ✦'):(zh?'下一個任務 →':'Next mission →')}</button><p class="game-tip">${zh?'轉轉地球，點圖案；亦可以點上面嘅答案。':'Turn the globe and tap a picture, or use the answer buttons.'}</p>`;
 $('gameListen').onclick=()=>speakGame(gameFinished?8:gameStep);if($('gameCentre'))$('gameCentre').onclick=centreGame;
 $('gameNext').onclick=()=>{stopGameAudio();if(gameFinished){gameStep=0;gameSolved=false;gameFinished=false}else if(gameStep===5){gameFinished=true}else{gameStep++;gameSolved=false}centreGame();renderGame();speakGame(gameFinished?8:gameStep);(gameFinished?$('gameNext'):$('gameListen')).focus({preventScroll:true})};
 $('gamePins').innerHTML=gameFinished?'':q.choices.map(k=>`<button class="game-pin" data-answer="${k}" aria-label="${choose(gamePlaces[k].name)}" ${gameSolved?'disabled':''}><span aria-hidden="true">${gamePlaces[k].icon}</span><small>${choose(gamePlaces[k].name)}</small></button>`).join('');
 drawGamePins();
}
function drawGamePins(){if(!gameActive)return;const size=$('globe').clientWidth;document.querySelectorAll('.game-pin').forEach(b=>{const p=project(gamePlaces[b.dataset.answer].point,size);b.hidden=!gl||!textureReady||p.z<.18||p.x<28||p.x>size-28||p.y<35||p.y>size-35;b.style.left=p.x+'px';b.style.top=p.y+'px'})}
function answerGame(e){const b=e.target.closest('[data-answer]');if(!b||!gameActive||gameSolved||gameFinished)return;const q=gameQuests[gameStep];if(b.dataset.answer===q.target){gameSolved=true;renderGame();speakGame(6);$('gameNext').focus({preventScroll:true})}else{$('gameFeedback').textContent=lang==='zh'?'差少少，再搵吓 '+gamePlaces[q.target].icon+'！':'Try looking for '+gamePlaces[q.target].icon+'!';b.classList.add('tried');speakGame(7)}}
 $('gamePanel').addEventListener('click',answerGame);$('gamePins').addEventListener('click',answerGame);
function leaveGame(){if(!gameActive)return;stopGameAudio();gameActive=false;render(false)}
['earthMode','humanMode'].forEach(id=>$(id).addEventListener('click',leaveGame,{capture:true}));
$('gameMode').onclick=()=>{if(gameActive)return;stopPlay();stopSpeech();gameActive=true;gameStep=0;gameSolved=false;gameFinished=false;mode='earth';index=6;centreGame();render(false);speakGame();$('gameListen').focus({preventScroll:true})};
$('language').addEventListener('click',()=>{stopGameAudio();renderGame()},{capture:true});
$('reset').addEventListener('click',()=>{if(gameActive)centreGame()});
['parents','sources'].forEach(id=>$(id).addEventListener('click',stopGameAudio));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopGameAudio()});
renderGame();
