'use strict';
// Six story films between adjacent Earth stops. Each line has its own painted scene (filmscenes.js);
// the Cantonese track is one file per film, with line start times written by tools/build-audio.py.
const earthFilms=[
 {theme:'rain',morph:9,name:['熱熱地球，變出大海','From glowing rock to oceans'],lines:[
 ['好耐好耐以前，太空入面有好多石頭同塵埃，繞住太陽轉。佢哋你撞我、我撞你，黐埋一齊，越嚟越大，慢慢變成一個圓碌碌嘅地球。','Long, long ago, rocks and dust circled the Sun. They bumped and stuck together, growing bigger and bigger, until they became our round Earth.','accretion',0],
 ['科學家覺得，地球出世冇幾耐，有一個好大嘅星體撞埋嚟。飛出去嘅碎石慢慢聚埋一齊，變成咗我哋晚晚見到嘅月亮。','Scientists think that soon after Earth formed, a big space body crashed into it. The pieces that flew off gathered together and became our Moon.','moon',0],
 ['啱啱出世嘅地球熱辣辣，好多地方都係發光嘅熔岩，好似一大鍋滾緊嘅湯。嗰陣冇海、冇樹，亦都冇任何動物。','Baby Earth was very hot. Much of it was glowing melted rock, like a giant pot of bubbling soup. There were no seas, no trees and no animals.','lava',1],
 ['嗰陣太空入面仲有好多石頭，成日撞落地球，砰！砰！地球表面好似俾人揼咗好多下。','Space was still full of rocks that often crashed into Earth — bang, bang! Its surface was hit again and again.','meteors',0],
 ['好多火山噴出熱氣。熱氣入面有好多水汽，佢哋升上天空。一團一團嘅水汽，慢慢變成厚厚嘅雲。','Volcanoes puffed out hot gases full of water vapour. The vapour rose into the sky and slowly made thick clouds.','volcano',0],
 ['過咗好長好長時間，地球慢慢凍返啲。最外面一層變硬，好似熱朱古力放涼之後，面頭結咗一層薄薄嘅皮。','Over a very long time, Earth cooled a little. Its outside became hard, like the skin that forms on hot chocolate as it cools.','crust',0],
 ['天空夠凍，雲入面嘅水汽就變成雨。落呀落，落呀落，落咗好耐好耐，比你見過最長嘅大雨仲長好多好多。','When the sky was cool enough, the water in the clouds fell as rain. It rained and rained, far longer than any storm you have ever seen.','rain',0],
 ['天空入面有好多雷暴，閃電一下一下咁照亮烏雲。轟隆隆！你怕唔怕行雷呀？','Storms rumbled and lightning flashed through the dark clouds. Boom! Are you scared of thunder?','lightning',0],
 ['雨水流去低嘅地方，聚埋一齊，變成一個又一個大海。科學家認為，有啲水可能仲係由太空嘅冰同石頭帶嚟㗎。','Rainwater ran into low places and gathered into great seas. Scientists think some water may also have arrived on icy rocks from space.','fill',0],
 ['睇吓，藍色越嚟越多！地球好似換咗件藍色新衫。由太空望落嚟，佢變成一粒藍色嘅星球。','Look, more and more blue! Earth put on a new blue coat. From space, it became a blue planet.','blue',1],
 ['由海邊望出去，太陽慢慢升起，海水反射住金色嘅光。不過嗰陣嘅空氣，仲未有我哋今日呼吸嘅氧氣。','From the shore, the Sun rose and the sea sparkled gold. But the air did not yet have the oxygen we breathe today.','sunrise',0],
 ['呢度係好耐以前嘅海洋世界。你可以用手扮海浪，輕輕搖吓搖。你估吓，大海入面，將會出現啲乜嘢呢？','This is an ocean world from long ago. Make waves with your hands and gently sway. What do you think will appear in the sea next?','waves',0]]},
 {theme:'life',morph:11,name:['大海裡，生命醒來','Tiny life in a great big ocean'],lines:[
 ['我哋潛落大海睇吓。上面有陽光照落水度，下面就越嚟越深，越嚟越暗。嗰陣嘅大海好靜，仲未有魚仔游嚟游去。','Let’s dive into the sea. Sunlight shines in from above, and it grows darker further down. The sea is quiet. There are no fish yet.','deep',0],
 ['你有冇試過飲到海水？海水係鹹嘅，因為雨水由石頭度帶咗好多礦物落海。','Have you ever tasted seawater? It is salty, because rain washed minerals from rocks into the sea.','saltysea',0],
 ['海底有啲地方好似溫泉咁，會噴出暖水同好多礦物。有啲科學家覺得，生命可能喺呢啲地方開始，但係大家仲研究緊。','Some places on the sea floor are like hot springs, puffing out warm water and minerals. Some scientists think life may have begun in places like this. They are still finding out.','vents',0],
 ['最早嘅生命好細好細，細過一粒沙，要用顯微鏡先睇到。畫面入面嘅小生命，係放大咗畀你睇㗎。','The first living things were tiny, smaller than a grain of sand. You would need a microscope to see them. These ones are shown much bigger.','microscope',0],
 ['睇吓，一個變兩個，兩個變四個！小小生命會一分為二，越嚟越多，慢慢住滿好多地方。','Look! One becomes two, and two become four. Tiny living things split in two and spread through the water.','divide',0],
 ['小生命多到黐埋一齊，好似一張薄薄嘅地氈，鋪喺水底嘅石頭上面。','Tiny life grew so thick that it made thin mats, like carpets on the rocks under the water.','mat',0],
 ['喺淺淺嘅海邊，好多小生命一層一層咁疊埋一齊，砌成好似石頭咁嘅小山丘。今日喺澳洲嘅海邊，仲可以見到類似嘅石頭。','In shallow water, tiny life built layer upon layer into rocky mounds. Mounds like these can still be seen on some Australian coasts today.','stromatolite',0],
 ['有啲小生命識得利用陽光，仲會放出氧氣泡泡。好長時間之後，呢啲氧氣幫地球準備好，等將來嘅動物可以呼吸。','Some tiny life used sunlight and gave off oxygen bubbles. Over a very long time, that oxygen helped prepare Earth for animals that would breathe it.','oxygen',0],
 ['氧氣慢慢多咗，同海入面嘅鐵混埋，變成紅紅哋嘅石頭，好似生鏽咁。今日仲搵到呢啲一條條紅色嘅石頭。','As oxygen slowly increased, it mixed with iron in the sea and made rusty red rock. We can still find these striped rocks today.','rust',0],
 ['嗰陣陸地上面仲係光禿禿，冇草、冇樹、冇恐龍，亦都冇人。差唔多所有生命，都住喺水入面。','The land was still bare. No grass, no trees, no dinosaurs and no people. Almost all life lived in water.','barren',0],
 ['嗰陣一日冇而家咁長。地球轉得快啲，日頭同夜晚都嚟得快啲。','Back then, a day was shorter than today. Earth spun faster, so days and nights came more quickly.','daylength',0],
 ['由小小生命開始，地球嘅故事越嚟越精彩。伸出你嘅尾指仔，想像吓一個細過指尖好多好多倍嘅生命啦！','From tiny beginnings, Earth’s story grew more and more amazing. Hold up your little finger and imagine life many times smaller than its tip!','tinyplanet',1]]},
 {theme:'land',morph:8,name:['超級慢的陸地拼圖','A very slow land puzzle'],lines:[
 ['時間繼續向前，一日一日，一年一年，經過咗好多好多億年。細細嘅生命慢慢變化，變出越嚟越多唔同嘅模樣。','Time kept moving, day after day, year after year, for billions of years. Tiny life slowly changed into many different shapes.','timeflow',0],
 ['大海入面開始有水母，有好多隻腳嘅三葉蟲，仲有第一批魚。佢哋游嚟游去，海洋變得好熱鬧。','The seas filled with jellyfish, many-legged trilobites and some of the first fish. The ocean became a busy place.','seacreatures',0],
 ['有啲動物開始有硬硬嘅殼同骨頭保護自己，好似著咗盔甲咁。','Some animals grew hard shells and bones to protect themselves, like wearing armour.','shells',0],
 ['之後，植物同動物開始走上陸地。先有矮矮嘅植物，後來有高高嘅樹，陸地慢慢變成綠色。','Later, plants and animals moved onto land. First small plants, then tall trees. The land slowly turned green.','plantsland',0],
 ['陸地上面仲有好大隻嘅蜻蜓同蟲蟲。有一種蜻蜓，一隻翼差唔多有你手臂咁長！','Giant dragonflies and bugs lived on land. One kind of dragonfly had wings nearly as long as your arm!','bugs',0],
 ['你知唔知？地球表面好似一塊一塊嘅拼圖，浮喺下面好熱、好慢咁郁嘅石頭上面。所以陸地會跟住慢慢移動。','Did you know? Earth’s surface is like puzzle pieces resting on hot rock that moves very slowly. So the land moves too.','plates',0],
 ['陸地移動得好慢好慢，一年大約同你手指甲生長差唔多咁長。所以我哋平時完全感覺唔到。','Land moves very slowly — in a year, about as far as your fingernails grow. That is why we cannot feel it.','nails',0],
 ['陸地郁嘅時候，有時會令地面震一震，叫做地震；亦會慢慢將地面推高，變成好高嘅山。','When land moves, the ground sometimes shakes — an earthquake. Moving land can also slowly push up tall mountains.','earthquake',0],
 ['經過好耐好耐，好多塊陸地慢慢靠埋一齊，好似砌拼圖咁，砌成一大片陸地，叫做盤古大陸。','After a very long time, many pieces of land came together like a puzzle, making one giant land called Pangaea.','pangaea',1],
 ['盤古大陸外面，圍住一個好大好大嘅海洋。有啲動物可以喺陸地上面行好遠好遠，唔使過海。','A huge ocean surrounded Pangaea. Some animals could walk very far across the land without crossing the sea.','bigocean',0],
 ['科學家喺好多唔同嘅大陸，都搵到同一種動物嘅化石。呢個就係陸地以前連埋一齊嘅證據之一。','Scientists have found fossils of the same animals on many different continents. That is one clue the land was once joined.','fossilclue',0],
 ['呢個係幫我哋想像嘅動畫，真正嘅變化慢好多好多。你望吓盤古大陸，覺得佢似乜嘢形狀呢？','This animation helps us imagine. The real change took much, much longer. Look at Pangaea — what shape does it remind you of?','pangaeaq',1]]},
 {theme:'dino',morph:0,name:['陸地分開，恐龍登場','Moving lands, dinosaur days'],lines:[
 ['大大塊嘅盤古大陸，開始出現一條一條裂縫。海水慢慢流入去，陸地就好似餅乾咁，一塊一塊咁分開。','Cracks began to appear in giant Pangaea. Seawater slowly flowed in, and the land split apart like a broken biscuit.','rift',1],
 ['分開咗嘅陸地，繼續慢慢移動，中間變成新嘅海洋。地球嘅拼圖，又變咗另一個樣。','The pieces kept moving slowly apart, and new oceans grew between them. Earth’s puzzle changed shape again.','drift',0],
 ['嗰陣地球比今日暖，南極同北極差唔多都冇冰。','Earth was warmer than today, with little or no ice at the North and South Poles.','warm',0],
 ['陸地上面有好多蕨類植物同高高嘅松樹。嗰陣大部分地方仲未有花㗎，森林係綠油油嘅。','The land was covered with ferns and tall cone-bearing trees. Most places had no flowers yet, so the forests were green.','fernforest',0],
 ['咚，咚，咚！有啲恐龍好大好大，好似長頸鹿咁有條好長嘅頸，食高高樹頂嘅葉。佢哋行一步，地下都好似郁一郁。','Thump, thump, thump! Some dinosaurs were enormous, with very long necks for reaching leaves at the treetops.','sauropod',0],
 ['有啲恐龍背脊有一塊塊嘅骨板，條尾仲有尖刺，用嚟保護自己。','Some dinosaurs had bony plates on their backs and spikes on their tails to protect themselves.','stegosaurus',0],
 ['亦有啲恐龍好細隻，同雞差唔多大，跑得好快。恐龍有大有細，有啲食植物，有啲食肉。','Some dinosaurs were small, about the size of a chicken, and ran very fast. Some ate plants, and some ate meat.','smalldino',0],
 ['恐龍BB係由蛋入面爬出嚟嘅。有啲恐龍爸爸媽媽，仲會照顧佢哋嘅竇。','Baby dinosaurs hatched from eggs, and some dinosaur parents looked after their nests.','eggs',0],
 ['有啲細隻嘅恐龍身上有羽毛。經過好長時間，佢哋嘅親戚慢慢變成今日嘅雀仔。','Some small dinosaurs had feathers. Over a very long time, their relatives became today’s birds.','feathers',0],
 ['天空上面有翼龍飛過。佢哋係恐龍嘅親戚，但係其實唔係恐龍。海入面，亦都有好大嘅海洋爬蟲類。','Pterosaurs flew overhead. They were relatives of dinosaurs, but not dinosaurs themselves. Big reptiles swam in the seas.','pterosaur',0],
 ['我哋點知有恐龍？因為科學家喺石頭入面，搵到恐龍嘅骨頭化石同腳印，一點一點咁拼返出嚟。','How do we know about dinosaurs? Scientists find fossil bones and footprints in rocks and piece the story together.','fossil',0],
 ['嚟，試吓用兩隻手指扮恐龍行路，咚、咚、咚！記住呀，嗰個世界仲未有人類㗎。','Now walk two fingers like dinosaur feet: thump, thump, thump! Remember, there were no people in that world yet.','fingerwalk',0]]},
 {theme:'ice',morph:5,name:['走進冰雪世界','Into an icy world'],lines:[
 ['好耐之後，有一粒好大嘅隕石撞落地球，天氣變得好唔同，好多恐龍都消失咗。不過，雀仔其實係恐龍嘅後代㗎！','Much later, a huge space rock hit Earth and the weather changed. Many dinosaurs disappeared — but birds come from dinosaurs!','asteroid',0],
 ['細細隻嘅哺乳類動物，喺地洞入面匿埋，捱過咗呢段困難嘅日子。','Small mammals hid in burrows and survived those hard times.','survivors',0],
 ['之後，哺乳類動物越嚟越多，有啲變得好大隻。哺乳類就係好似貓、狗、馬咁，有毛又飲奶大嘅動物。','Then mammals spread, and some grew very big. Mammals are furry animals that drink milk as babies — like cats, dogs and horses.','mammals',0],
 ['後來地球出現一大片一大片嘅草原，馬同好多動物喺度食草、跑步。','Later, wide grasslands spread, and horses and many other animals grazed and ran there.','grass',0],
 ['時間繼續向前。地球變得越嚟越凍，冬天好長，雪落咗之後唔溶，一年一年咁越積越厚。','Time moved on. Earth grew colder. Snow fell and did not melt, piling up thicker year after year.','cooling',0],
 ['我哋嚟到大約兩萬年前嘅冰期。好厚好厚嘅大冰原，好似一張巨大嘅冰被，冚住好多北方嘅陸地。','Now we reach an ice age about twenty thousand years ago. Huge ice sheets covered many northern lands like giant icy blankets.','icesheet',1],
 ['好多水變咗冰，所以海水低咗好多。有啲地方露出陸地，好似一條橋咁，連住兩邊。','With so much water frozen into ice, the sea was much lower. Some land appeared, like bridges connecting places.','landbridge',0],
 ['冰川好似一條好慢好慢嘅冰河，一路郁，一路刮走石頭，刮出一個個山谷同湖。','Glaciers are like very slow rivers of ice. As they moved, they scraped out valleys and lakes.','glacier',0],
 ['呢個時候有長毛象，佢哋有長長嘅毛同彎彎嘅象牙，唔怕凍。仲有長毛犀牛同好多其他動物。','Woolly mammoths lived then, with long shaggy hair and curved tusks. Woolly rhinos and many other animals lived too.','mammoth',0],
 ['人類都住喺呢個世界。佢哋用動物皮毛整衫著，圍住火堆取暖，仲會一齊合作搵食物。','People lived in this world too. They made warm clothes from animal skins, gathered around fires, and worked together to find food.','people',0],
 ['有啲人仲喺山洞入面畫畫，畫馬、畫牛、畫長毛象，話畀我哋知佢哋見到嘅世界。','Some people painted pictures in caves — horses, bison and mammoths — showing the world they saw.','cavepaint',0],
 ['如果你住喺凍冰冰嘅冰期，你會點樣令自己暖啲呢？抱住自己，搓搓手，試吓啦！','If you lived in the chilly ice age, how would you keep warm? Give yourself a hug and rub your hands together!','keepwarm',0]]},
 {theme:'home',morph:0,name:['冰雪慢退，回到我們的家','Back to our shared home'],lines:[
 ['之後，地球慢慢變暖。大冰原開始溶化，滴答、滴答，冰雪變成河流，流返去大海。','Then Earth slowly warmed. The great ice sheets began to melt — drip, drop — and meltwater flowed in rivers back to the sea.','melt',1],
 ['海水越升越高，有啲本來連住嘅陸地，又俾大海分開返。海岸線，慢慢變成今日咁樣。','The sea rose higher and higher, and some land bridges disappeared under water. Coastlines slowly became the shapes we know today.','searise',0],
 ['溶咗嘅冰變成好多河流同湖泊，水入面有魚仔，河邊有雀仔。','Melted ice filled many rivers and lakes, with fish in the water and birds along the banks.','rivers',0],
 ['天氣暖咗，森林同草原慢慢生長，花開滿地，好多動物喺度搵到新屋企。','As it grew warmer, forests and grasslands spread, flowers bloomed, and many animals found new homes.','greening',0],
 ['大約一萬年前，有啲人開始種植物同養動物。佢哋唔使成日搬屋，慢慢住埋一齊，變成村莊。','About ten thousand years ago, some people began growing plants and caring for animals. Many settled down and built villages.','farming',0],
 ['人類學識咗整陶器、用轆轆，仲發明咗文字，將故事寫低。','People learned to make pottery and use wheels, and invented writing to record their stories.','wheel',0],
 ['村莊慢慢變成城鎮，城鎮又變成大城市。晚上由太空望落嚟，可以見到城市閃下閃下嘅燈光。','Villages grew into towns, and towns into big cities. At night, from space, you can see city lights twinkling.','city',0],
 ['人類仲造咗火箭，飛上太空，由好遠嘅地方影返我哋嘅地球。','People built rockets, flew into space, and took photos of our Earth from far away.','space',0],
 ['時間嚟到今日！地球上面有高山、有沙漠、有森林、有冰雪，仲有連住一齊嘅大海。','Now we have reached today! Earth has mountains, deserts, forests, ice, and oceans that are all connected.','today',1],
 ['我哋同好多動物同植物，一齊住喺呢個地球。慳水、慳電、唔亂拋垃圾，都係愛惜地球嘅方法。','We share this planet with many animals and plants. Saving water and energy and not littering are ways to care for Earth.','care',0],
 ['你都可以幫手：種一棵植物，淋吓水，睇住佢慢慢大。','You can help too: plant something, water it, and watch it grow.','plant',0],
 ['呢個就係我哋嘅屋企，地球！轉一轉佢，搵一個你好想去嘅地方，同大人講吓點解你想去啦。','This is our home, Earth! Turn it, find a place you would love to visit, and tell a grown-up why.','home',1]]}
];
// Line start times and track length in seconds; rewritten by tools/build-audio.py from the real recordings.
const filmTimings=/*FILM_TIMINGS*/[{"starts":[0.5,18.99,35.17,50.38,63.68,78.29,93.3,108.08,120.08,135.41,149.34,163.93],"total":179.15},{"starts":[0.5,16.82,27.86,43.66,57.53,70.59,80.57,97.41,112.81,127.75,141.74,151.45],"total":165.8},{"starts":[0.5,16.06,29.6,38.39,51.16,62.64,78.21,91.01,103.14,115.92,128.88,141.35],"total":154.19},{"starts":[0.5,14.79,27.39,34.65,47.16,63.96,73.24,86.19,96.69,108.34,122.74,135.99],"total":148.57},{"starts":[0.5,16.05,25.31,39.6,49.39,62.39,75.97,88.52,99.46,112.61,124.61,136.2],"total":148.18},{"starts":[0.5,13.35,26.42,35.39,45.99,59.17,68.08,81.78,90.95,103.61,117.33,125.74],"total":139.19}]/*END_FILM_TIMINGS*/;
const filmAudioFiles=["audio/transition-0.m4a","audio/transition-1.m4a","audio/transition-2.m4a","audio/transition-3.m4a","audio/transition-4.m4a","audio/transition-5.m4a"];
const filmAudio=new Audio();filmAudio.preload='none';
const film={active:false,paused:false,elapsed:0,last:0,from:0,to:1,segment:-1,anchor:null,token:0,silent:false,raf:0,total:174,pendingSeek:null};
// A seek before the track's metadata arrives is ignored by browsers, so hold it until the track is ready.
filmAudio.addEventListener('loadedmetadata',()=>{if(film.pendingSeek!==null){try{filmAudio.currentTime=film.pendingSeek}catch(e){}film.pendingSeek=null}});
const filmDialog=document.createElement('dialog');filmDialog.id='earthFilm';filmDialog.setAttribute('aria-label','3 分鐘地球故事動畫');
filmDialog.innerHTML='<div class="film-shell"><header class="film-header"><div><span id="filmEyebrow"></span><h2 id="filmTitle"></h2></div><button id="filmSkip" class="quiet"></button></header><div class="film-theatre"><div class="film-aura"></div><div id="filmParticles" aria-hidden="true"></div><div id="filmWorld"></div><canvas id="filmScene" aria-hidden="true"></canvas><div class="film-orbit" aria-hidden="true"></div></div><div class="film-copy"><div id="filmChapters" aria-hidden="true"></div><p id="filmCaption" aria-live="polite"></p><small id="filmNote"></small><div class="film-controls"><button id="filmPrevLine" class="quiet"></button><button id="filmPause" class="listen"></button><span id="filmTime"></span><button id="filmNextLine" class="quiet"></button><button id="filmRestart" class="quiet"></button></div><div class="film-track"><div id="filmProgress"></div></div></div></div>';
document.body.append(filmDialog);
function filmMinutes(i){const T=filmTimings[Math.max(0,Math.min(filmTimings.length-1,i))];return Math.max(1,Math.round(T.total/60))}
function renderTransitionButton(){const button=$('replayTransition');button.hidden=mode!=='earth'||index===0;const m=filmMinutes(index-1);button.textContent=lang==='zh'?'重看約 '+m+' 分鐘過場 ↻':'Replay the '+m+'-minute story film ↻'}
function filmLineAt(t){const s=filmTimings[film.from].starts;let i=0;while(i<s.length-1&&t>=s[i+1]-.05)i++;return i}
function filmLineSpan(i){const T=filmTimings[film.from];return [T.starts[i],i+1<T.starts.length?T.starts[i+1]:T.total]}
function currentTransition(){
 if(!film.active)return null;const story=earthFilms[film.from],[a,b]=filmLineSpan(story.morph);
 const p=Math.max(0,Math.min(1,(film.elapsed-a)/Math.max(1,b-a)));
 return {from:earth[film.from].kind,blend:matchMedia('(prefers-reduced-motion: reduce)').matches?(film.elapsed>=a?1:0):p*p*(3-2*p)};
}
function filmEnglishLine(){if(lang!=='en'||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(earthFilms[film.from].lines[film.segment][1]);u.lang='en-AU';u.rate=.88;speechSynthesis.speak(u)}
function filmClock(s){s=Math.max(0,Math.floor(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function filmFrame(now){
 if(!film.active)return;
 film.raf=requestAnimationFrame(filmFrame);
 const delta=film.last?Math.min(.12,(now-film.last)/1000):0;film.last=now;
 if(!film.paused){film.elapsed=lang==='zh'&&!film.silent&&film.pendingSeek===null&&!filmAudio.paused&&filmAudio.currentTime>0?Math.min(film.total,filmAudio.currentTime):Math.min(film.total,film.elapsed+delta);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced){rotation=(earth[film.from].angle*Math.PI/180)+film.elapsed*.004;zoom=1+Math.sin(film.elapsed/film.total*Math.PI)*.065}dirty=true}
 const story=earthFilms[film.from],segment=filmLineAt(film.elapsed);
 if(segment!==film.segment){film.segment=segment;const line=story.lines[segment];$('filmCaption').textContent=choose(line);$('filmChapters').innerHTML=story.lines.map((_,i)=>'<span class="'+(i===segment?'active':i<segment?'done':'')+'"></span>').join('');filmDialog.classList.toggle('film-globe',!!line[3]);const sc=$('filmScene');if(sc.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)sc.animate([{opacity:0},{opacity:1}],{duration:700,easing:'ease-out'});filmEnglishLine()}
 const [a,b]=filmLineSpan(segment);
 if(typeof paintFilmScene==='function')paintFilmScene(story.lines[segment][2],film.elapsed,Math.max(0,Math.min(1,(film.elapsed-a)/Math.max(1,b-a))));
 $('filmProgress').style.width=film.elapsed/film.total*100+'%';$('filmTime').textContent=filmClock(film.elapsed)+' / '+filmClock(film.total);
 if(film.elapsed>=film.total)finishFilm();
}
function playFilmAudio(){const token=film.token;if(lang!=='zh')return;filmAudio.play().catch(error=>{if(film.active&&token===film.token&&!film.paused&&error.name!=='AbortError'){film.silent=true;$('filmNote').textContent=lang==='zh'?'聲音未能播放；仍可看動畫及字幕。':'Audio unavailable; animation and captions still work.'}})}
function filmSeek(t){film.elapsed=Math.max(0,Math.min(film.total-.1,t));film.last=0;film.segment=-1;if(filmAudio.readyState>=1){try{filmAudio.currentTime=film.elapsed}catch(e){}film.pendingSeek=null}else film.pendingSeek=film.elapsed;if(!film.paused)playFilmAudio();dirty=true}
function beginFilm(target){
 if(film.active||target<1||target>=earth.length)return;
 stopPlay();stopSpeech();if(typeof stopGameAudio==='function')stopGameAudio();
 film.active=true;film.paused=false;film.elapsed=0;film.last=0;film.from=target-1;film.to=target;film.segment=-1;film.silent=false;film.token++;film.total=filmTimings[film.from].total;film.pendingSeek=null;
 mode='earth';index=target;spinning=false;pitch=0;zoom=1;selectedGeo=null;rotation=earth[film.from].angle*Math.PI/180;render(false);
 const story=earthFilms[film.from],zh=lang==='zh';filmDialog.className='film-'+story.theme;
 $('filmTitle').textContent=choose(story.name);$('filmEyebrow').textContent=(zh?'地球小劇場 · ':'EARTH STORY FILM · ')+(film.from+1)+' / 6';$('filmSkip').textContent=zh?'略過，去下一站 →':'Skip to the next stop →';$('filmPause').textContent=zh?'Ⅱ 暫停':'Ⅱ Pause';$('filmPause').setAttribute('aria-pressed','false');$('filmRestart').textContent=zh?'↻ 重播':'↻ Replay';$('filmPrevLine').textContent=zh?'← 上一句':'← Back';$('filmNextLine').textContent=zh?'下一句 →':'Next →';$('filmNote').textContent=zh?'故事示意動畫 · 真正的地球變化歷時非常漫長':'ILLUSTRATIVE ANIMATION · REAL CHANGES TOOK MUCH LONGER';
 $('filmParticles').replaceChildren();
 const world=document.querySelector('.world');film.anchor=document.createComment('Earth cinema return point');world.parentNode.insertBefore(film.anchor,world);$('filmWorld').append(world);$('globe').tabIndex=-1;
 document.body.classList.add('film-open');filmDialog.showModal();filmAudio.src=filmAudioFiles[film.from];filmAudio.currentTime=0;playFilmAudio();dirty=true;film.raf=requestAnimationFrame(filmFrame);$('filmPause').focus({preventScroll:true});
}
function finishFilm(){
 if(!film.active)return;film.active=false;film.token++;cancelAnimationFrame(film.raf);filmAudio.pause();filmAudio.currentTime=0;if('speechSynthesis'in window)speechSynthesis.cancel();
 const world=document.querySelector('.world');film.anchor.parentNode.insertBefore(world,film.anchor);film.anchor.remove();film.anchor=null;$('globe').tabIndex=0;filmDialog.close();filmDialog.classList.remove('film-globe');document.body.classList.remove('film-open');setIndex(film.to);$('replayTransition').focus({preventScroll:true});
}
function pauseFilm(){if(!film.active)return;film.paused=!film.paused;filmDialog.classList.toggle('film-paused',film.paused);$('filmPause').setAttribute('aria-pressed',film.paused);$('filmPause').textContent=film.paused?(lang==='zh'?'▶ 繼續':'▶ Continue'):(lang==='zh'?'Ⅱ 暫停':'Ⅱ Pause');if(film.paused){filmAudio.pause();if('speechSynthesis'in window)speechSynthesis.cancel()}else{film.last=0;playFilmAudio();filmEnglishLine()}}
$('filmPause').onclick=pauseFilm;$('filmSkip').onclick=finishFilm;
$('filmPrevLine').onclick=()=>{const i=filmLineAt(film.elapsed),[a]=filmLineSpan(i);filmSeek(film.elapsed-a>2||i===0?a:filmLineSpan(i-1)[0])};
$('filmNextLine').onclick=()=>{const i=filmLineAt(film.elapsed);if(i+1>=earthFilms[film.from].lines.length)finishFilm();else filmSeek(filmLineSpan(i+1)[0])};
$('filmRestart').onclick=()=>{film.token++;filmSeek(0);if(film.paused)pauseFilm()};
filmDialog.addEventListener('cancel',e=>{e.preventDefault();finishFilm()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&film.active&&!film.paused)pauseFilm()});
['start','next'].forEach(id=>$(id).addEventListener('click',e=>{if(mode==='earth'&&index<earth.length-1){e.preventDefault();e.stopImmediatePropagation();beginFilm(index+1)}},{capture:true}));
$('replayTransition').onclick=()=>beginFilm(index);
renderTransitionButton();
