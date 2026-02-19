// ================== GAME VARIABLES ==================
let money=0, level=1, xp=0, rebirths=0, ascensions=0;
let clickPower=1, autoClick=0;
let clickCost=50, autoCost=100;
let tokens=0, tokenUpgrade=0, tokenCost=5;
let combo=0, lastClick=0, totalClicks=0, totalMoney=0, totalAuto=0;
let playerName = "You"; // changeable player name

// ================== SOUNDS ==================
const sounds={
  click:'https://freesound.org/data/previews/341/341695_3248244-lq.mp3',
  levelup:'https://freesound.org/data/previews/331/331912_3248244-lq.mp3',
  rebirth:'https://freesound.org/data/previews/331/331913_3248244-lq.mp3',
  ascend:'https://freesound.org/data/previews/331/331914_3248244-lq.mp3'
};
function playSound(name){let audio=new Audio(sounds[name]); audio.volume=0.3; audio.play();}

// ================== ACHIEVEMENTS ==================
let achievements=[
  {name:"First Click", condition:()=>totalClicks>=1, unlocked:false},
  {name:"Click Master", condition:()=>totalClicks>=100, unlocked:false},
  {name:"Rich!", condition:()=>totalMoney>=10000, unlocked:false},
  {name:"Rebirther", condition:()=>rebirths>=5, unlocked:false},
  {name:"Ascender", condition:()=>ascensions>=1, unlocked:false},
  {name:"Auto Clicker", condition:()=>autoClick>=5, unlocked:false},
  {name:"Upgrade Collector", condition:()=>clickPower>=10, unlocked:false},
  {name:"Money Hoarder", condition:()=>money>=1e6, unlocked:false},
];

// ================== FORMAT & MATH ==================
function format(n){
  if(n>=1e12)return(n/1e12).toFixed(1)+"T";
  if(n>=1e9)return(n/1e9).toFixed(1)+"B";
  if(n>=1e6)return(n/1e6).toFixed(1)+"M";
  if(n>=1e3)return(n/1e3).toFixed(1)+"K";
  return Math.floor(n);
}
function xpNeeded(){return Math.max(Math.floor(100*Math.pow(1.16,level-1)),1);}
function globalMulti(){return 1 + rebirths*0.1 + tokenUpgrade*0.05 + ascensions*0.25 + (clan.level?clan.level*0.01:0);}

// ================== FLOATING & TOAST ==================
function showFloating(text,x,y){
  let span=document.createElement("span");
  span.className="floating";
  span.style.left=x+"px";
  span.style.top=y+"px";
  span.innerText=text;
  document.body.appendChild(span);
  setTimeout(()=>span.remove(),1000);
}
function showToast(msg){let div=document.createElement("div"); div.className="toast"; div.innerText=msg; document.body.appendChild(div); setTimeout(()=>div.remove(),2000);}

// ================== ACHIEVEMENTS ==================
function checkAchievements(){
  achievements.forEach(a=>{
    if(!a.unlocked && a.condition()){
      a.unlocked=true; showToast("Achievement Unlocked: "+a.name);
    }
  });
}
function renderAchievements(){
  let list=document.getElementById("achList");
  if(!list) return;
  list.innerHTML="";
  achievements.forEach(a=>{
    let li=document.createElement("li");
    li.innerText = a.name + (a.unlocked?" ✅":"");
    list.appendChild(li);
  });
}

// ================== CLICK FUNCTION ==================
function clickMoney(){
  playSound('click');
  let now=Date.now();
  if(now-lastClick<1500){combo++;}else{combo=0;}
  lastClick=now;

  let crit=Math.random()<0.05+(rebirths*0.0025)?2:1;
  let gain=(clickPower+combo*0.1)*crit*globalMulti();
  money+=gain; totalMoney+=gain; xp+=gain*0.5; totalClicks++;

  let btn=document.getElementById("clickBtn");
  let rect=btn.getBoundingClientRect();
  showFloating("+"+Math.floor(gain),rect.left+rect.width/2,rect.top);

  if(xp>=xpNeeded()){ xp-=xpNeeded(); level++; playSound('levelup'); showToast("Level Up! "+level); }

  checkAchievements(); update();
}

// ================== SHOP ==================
function renderShop(){
  let container=document.getElementById("shopContent");
  container.innerHTML="";
  addShopItem(container,"Click Power","+1 base",clickCost,buyClick);
  addShopItem(container,"Auto Click","+1/sec",autoCost,buyAuto);
  if(rebirths>=1) addShopItem(container,"Power Boost","+5% per click",10*rebirths,buyTokenUpgrade,true);
}
function addShopItem(container,title,desc,cost,fn,isToken=false){
  let card=document.createElement("div"); card.className="card";
  card.innerHTML=`<h3>${title}</h3><p>${desc}</p><p>Cost: ${format(cost)}${isToken?" Tokens":""}</p>`;
  let btn=document.createElement("button"); btn.innerText="Buy"; btn.onclick=fn;
  card.appendChild(btn); container.appendChild(card);
}
function buyClick(){if(money>=clickCost){money-=clickCost; clickPower++; clickCost*=1.5; checkAchievements(); update();}}
function buyAuto(){if(money>=autoCost){money-=autoCost; autoClick++; totalAuto++; autoCost*=1.6; checkAchievements(); update();}}
function buyTokenUpgrade(){if(tokens>=tokenCost){tokens-=tokenCost; tokenUpgrade++; tokenCost=Math.floor(tokenCost*1.7); update();}}

// ================== REBIRTH & ASCEND ==================
function rebirth(){
  let req=10+(rebirths*2)+Math.floor(Math.pow(rebirths,1.15));
  if(level>=req){
    rebirths++; tokens++; level=1; xp=0; money=0; clickPower=1; autoClick=0; clickCost=50; autoCost=100; combo=0;
    playSound('rebirth'); showToast("Rebirth complete! Token +1");
    update(); checkAchievements();
  }
}
function ascend(){
  let req=50+ascensions*70;
  if(rebirths>=req){
    ascensions++; rebirths=0; tokens=0; tokenUpgrade=0; level=1; xp=0; money=0; clickPower=1; autoClick=0; clickCost=50; autoCost=100;
    playSound('ascend'); showToast("Ascension achieved!");
    update(); checkAchievements();
  }
}

// ================== PAGE SWITCHING ==================
function show(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ================== AUTO CLICK ==================
setInterval(()=>{
  if(autoClick>0){
    let gain=autoClick*globalMulti();
    money+=gain; totalMoney+=gain;
    let btn=document.getElementById("clickBtn");
    let rect=btn.getBoundingClientRect();
    showFloating("+"+Math.floor(gain),rect.left+Math.random()*50,rect.top);
    checkAchievements(); update();
  }
},1000);

// ================== PLAYER SAVE ==================
function saveGame(){
  localStorage.setItem("idleEmpire",JSON.stringify({money,level,xp,rebirths,ascensions,clickPower,autoClick,clickCost,autoCost,tokens,tokenUpgrade,tokenCost,totalClicks,totalMoney,totalAuto}));
}
setInterval(saveGame,3000);

// ================== LOAD SAVE ==================
window.onload=()=>{
  let save=JSON.parse(localStorage.getItem("idleEmpire"));
  if(save) Object.assign(window,save);
  loadClan();
  update(); renderShop(); renderAchievements();
};

// ================== CLAN SYSTEM ==================
let clan={name:"", members:[], level:0, totalMoney:0};
let bots=[
  {name:"BotA", money:0, level:1, rebirths:0, clickPower:1, clan:null},
  {name:"BotB", money:0, level:1, rebirths:0, clickPower:1, clan:null},
  {name:"BotC", money:0, level:1, rebirths:0, clickPower:1, clan:null},
];
let botClans = [];

function createClan(){
  let name = document.getElementById("clanInput").value.trim();
  if(!name) return showToast("Enter a name!");
  if(clan.name) return showToast("You are already in a clan!");
  clan.name=name; clan.members=[{name:playerName, money, level, rebirths, clickPower}]; clan.level=1; clan.totalMoney=money;
  showToast("Clan "+name+" created!");
  renderClan();
  saveClan();
}
function leaveClan(){
  if(!clan.name) return showToast("You are not in a clan!");
  clan.name=""; clan.members=[]; clan.level=0; clan.totalMoney=0;
  showToast("You left the clan!");
  renderClan();
  saveClan();
}
function saveClan(){localStorage.setItem("idleEmpireClan",JSON.stringify(clan));}
function loadClan(){
  let saved=JSON.parse(localStorage.getItem("idleEmpireClan"));
  if(saved) clan=saved;
}
function renderClan(){
  document.getElementById("clanName").innerText=clan.name||"None";
  document.getElementById("clanLevel").innerText=clan.level||0;
  document.getElementById("clanTotalMoney").innerText=Math.floor(clan.totalMoney||0);
  let list=document.getElementById("clanMembers"); list.innerHTML="";
  clan.members.forEach(m=>{let li=document.createElement("li"); li.innerText=m.name; list.appendChild(li);});
}

// ================== BOT LOGIC ==================
setInterval(()=>{
  bots.forEach(bot=>{
    // auto-click
    bot.money += bot.clickPower * 1.05;
    bot.level += 0.01; // slow leveling
    // auto rebirth
    if(bot.level>=10 + bot.rebirths*2){ bot.rebirths++; bot.level=1; bot.money=0; }
    // auto-create clan if none
    if(!bot.clan){
      let newClan={name:bot.name+"'s Clan", members:[bot], totalMoney:bot.money};
      bot.clan=newClan; botClans.push(newClan);
    } else {
      bot.clan.totalMoney = bot.clan.members.reduce((sum,m)=>sum+m.money,0);
    }
  });
  updateLeaderboards();
  update(); renderClan();
},1000);

// ================== LEADERBOARDS ==================
function updateLeaderboards(){
  // Player leaderboard
  let allPlayers = [{name:playerName, money, level, rebirths}].concat(bots.map(b=>({name:b.name, money:b.money, level:b.level, rebirths:b.rebirths})));
  allPlayers.sort((a,b)=>b.money-a.money);
  let list=document.getElementById("playerLeaderboard"); list.innerHTML="";
  allPlayers.forEach((p,i)=>{let li=document.createElement("li"); li.innerText=`${i+1}. ${p.name} - ${Math.floor(p.money)}`; list.appendChild(li);});
  // Show player rank
  let playerRank = allPlayers.findIndex(p=>p.name===playerName)+1;
  document.getElementById("playerRank").innerText=playerRank;

  // Clan leaderboard
  let allClans = [clan].concat(botClans);
  allClans.sort((a,b)=>b.totalMoney-a.totalMoney);
  let clanList=document.getElementById("clanLeaderboard"); clanList.innerHTML="";
  allClans.forEach(c=>{let li=document.createElement("li"); li.innerText=`${c.name} - ${Math.floor(c.totalMoney||0)}`; clanList.appendChild(li);});
}

// ================== RESET ==================
function resetGame(){
  if(confirm("Are you sure you want to reset everything?")){
    money=0; level=1; xp=0; rebirths=0; ascensions=0; clickPower=1; autoClick=0;
    clickCost=50; autoCost=100; tokens=0; tokenUpgrade=0; tokenCost=5;
    combo=0; totalClicks=0; totalMoney=0; totalAuto=0;
    achievements.forEach(a=>a.unlocked=false);
    clan={name:"", members:[], level:0, totalMoney:0};
    update(); renderShop(); renderAchievements(); renderClan(); updateLeaderboards();
    localStorage.removeItem("idleEmpire");
    localStorage.removeItem("idleEmpireClan");
    showToast("Game reset!");
  }
}

// ================== UPDATE FUNCTION ==================
function update(){
  document.getElementById("money").innerText=Math.floor(money);
  document.getElementById("level").innerText=level;
  document.getElementById("rebirths").innerText=rebirths;
  document.getElementById("ascensions").innerText=ascensions;
  document.getElementById("xp").innerText=Math.floor(xp);
  document.getElementById("xpReq").innerText=xpNeeded();
  document.getElementById("combo").innerText=combo;
  document.getElementById("rebirthReq").innerText=10+(rebirths*2)+Math.floor(Math.pow(rebirths,1.15));
  document.getElementById("ascendReq").innerText=50+ascensions*70;
  document.getElementById("tokens").innerText=tokens;

  // XP bar fill
  let xpBar = document.getElementById("xpFill");
  if(xpBar){ let pct=Math.min((xp/xpNeeded())*100,100); xpBar.style.width=pct+"%"; }

  renderShop(); renderAchievements(); renderClan(); updateLeaderboards();
}
