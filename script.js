// === SETTINGS ===
const MAX_CLAN_MEMBERS = 25;

// === PLAYER VARIABLES ===
let energy=0, level=1, xp=0, xpNeeded=100;
let rebirths=0, prestige=0, multiplier=1, drones=0;
let clan=null, pendingRequests=[];
let totalClicks=0, totalEnergy=0;

// === BOT VARIABLES ===
const BOT_COUNT = 1000000000;
let botData = [];
let botClans = []; // keep track of active bot clans
const BOT_PERSONALITIES=[
  {type:"Grindy", clickRate:1, upgradeRate:0.8, rebirthFocus:0.7, joinClan:0.5},
  {type:"Casual", clickRate:0.4, upgradeRate:0.3, rebirthFocus:0.4, joinClan:0.1},
  {type:"Lazy", clickRate:0.05, upgradeRate:0.05, rebirthFocus:0.1, joinClan:0.01}
];

// Initialize top 100 bots
for(let i=0;i<100;i++){
  let p=BOT_PERSONALITIES[Math.floor(Math.random()*BOT_PERSONALITIES.length)];
  botData.push({
    id:i+1, name:"Bot"+(i+1), energy:Math.random()*50,
    level:1, xp:0, xpNeeded:100,
    drones:Math.floor(Math.random()*2), click:1,
    rebirths:0, prestige:0, clan:null, personality:p, upgrades:[]
  });
}

// === UPGRADES ===
let upgrades=[
  {name:"Reactor Drone",baseCost:50,milestone:1,effect:(p)=>{p.drones++;}},
  {name:"Power Boost",baseCost:100,milestone:5,effect:(p)=>{p.multiplier=(p.multiplier||1)+0.5;}},
  {name:"Energy Multiplier",baseCost:200,milestone:10,effect:(p)=>{p.multiplier*=1.1;}},
  {name:"Auto Clicker",baseCost:500,milestone:20,effect:(p)=>{setInterval(()=>clickCore(),1000);}}
];

// === UTILITY FUNCTIONS ===
function getClanMemberCount(clanName){
  let playerCount = (clan===clanName?1:0);
  return botData.filter(b=>b.clan===clanName).length + playerCount;
}

function updateUI(){
  document.getElementById("energy").innerText=Math.floor(energy);
  document.getElementById("level").innerText=level;
  document.getElementById("xp").innerText=Math.floor(xp);
  document.getElementById("xpNeeded").innerText=xpNeeded;
  document.getElementById("rebirths").innerText=rebirths;
  document.getElementById("prestige").innerText=prestige;
  document.getElementById("multiplier").innerText=multiplier.toFixed(2);

  // SHOP
  let shop=document.getElementById("shop"); shop.innerHTML="";
  upgrades.forEach((u,i)=>{
    if(level>=u.milestone){
      let cost=Math.floor(u.baseCost*Math.pow(1.5,(u.level||0)));
      let btn=document.createElement("button");
      btn.innerText=`${u.name} (Level ${u.level||0}) - Cost: ${cost}`;
      btn.onclick=()=>{if(energy>=cost){energy-=cost; u.level=(u.level||0)+1; u.effect(window); updateUI();}};
      shop.appendChild(btn);
    }
  });

  // CLAN
  let clanNameInput=document.getElementById("clanInput");
  document.getElementById("clanName").innerText=clan||"None";
  let reqDiv=document.getElementById("pendingRequests"); reqDiv.innerHTML="";
  pendingRequests.slice(0,50).forEach((b,i)=>{
    if(getClanMemberCount(clan)<MAX_CLAN_MEMBERS){
      let btn=document.createElement("button");
      btn.innerText=`${b.name} requests to join your clan`;
      btn.onclick=()=>{b.clan=clan; pendingRequests.splice(i,1); updateUI();};
      reqDiv.appendChild(btn);
    }
  });

  let memDiv=document.getElementById("clanMembers"); memDiv.innerHTML="";
  if(clan){
    botData.filter(b=>b.clan===clan).slice(0,50).forEach((b,i)=>{
      let div=document.createElement("div"); div.style.display="flex"; div.style.justifyContent="space-between";
      div.innerText=b.name;
      let kickBtn=document.createElement("button"); kickBtn.innerText="Kick"; kickBtn.onclick=()=>{b.clan=null; updateUI();};
      div.appendChild(kickBtn);
      memDiv.appendChild(div);
    });
  }

  // LEADERBOARD
  let leaderboard=document.getElementById("leaderboardList"); leaderboard.innerHTML="";
  let topClansDiv=document.getElementById("topClans"); topClansDiv.innerHTML="";
  // Calculate clan energy totals
  let clans={};
  botData.forEach(b=>{if(b.clan) clans[b.clan]=(clans[b.clan]||0)+b.energy;});
  if(clan) clans[clan]=(clans[clan]||0)+energy;
  let sortedClans=Object.entries(clans).sort((a,b)=>b[1]-a[1]);
  sortedClans.slice(0,10).forEach(c=>{ let div=document.createElement("div"); div.innerText=`${c[0]}: ${Math.floor(c[1])}`; topClansDiv.appendChild(div); });

  let sortedPlayers=[...botData];
  sortedPlayers.push({name:"Player",energy,clan});
  sortedPlayers.sort((a,b)=>b.energy-a.energy);
  sortedPlayers.slice(0,10).forEach(p=>{ let div=document.createElement("div"); div.innerText=`${p.name} [${p.clan||"-"}]: ${Math.floor(p.energy)}`; leaderboard.appendChild(div); });

  document.getElementById("rank").innerText=sortedPlayers.findIndex(p=>p.name==="Player")+1;
  if(clan) document.getElementById("clanRank").innerText=sortedClans.findIndex(c=>c[0]===clan)+1; else document.getElementById("clanRank").innerText="-";

  // STATS
  document.getElementById("statsList").innerHTML=
    `<li>Total Clicks: ${totalClicks}</li>
     <li>Total Drones: ${drones}</li>
     <li>Total Energy: ${Math.floor(totalEnergy)}</li>
     <li>Total Bots: ${BOT_COUNT}</li>`;

  // ACHIEVEMENTS
  let achList=document.getElementById("achievementList"); achList.innerHTML="";
  if(totalClicks>=1) achList.innerHTML+="<li>✅ First Click</li>";
  if(totalClicks>=100) achList.innerHTML+="<li>✅ Click Master</li>";
  if(level>=50) achList.innerHTML+="<li>✅ Level 50</li>";
  if(rebirths>=1) achList.innerHTML+="<li>✅ First Rebirth</li>";
  if(prestige>=1) achList.innerHTML+="<li>✅ First Prestige</li>";
}

// === CLICK ===
function clickCore(){
  let gain=1*multiplier; energy+=gain; totalEnergy+=gain; xp+=gain; totalClicks++;
  if(xp>=xpNeeded){ xp-=xpNeeded; level++; xpNeeded=Math.floor(xpNeeded*1.15); }
  updateXPBar(); updateUI();
}
function updateXPBar(){ document.getElementById("xpBar").style.width=Math.min(100,(xp/xpNeeded)*100)+"%"; }
document.getElementById("pulseButton").onclick=clickCore;

// === BOT SIMULATION ===
setInterval(()=>{
  botData.forEach(b=>{
    // Clicks
    if(Math.random()<b.personality.clickRate){ 
      let gain=b.click*b.level + b.drones; b.energy+=gain; b.xp+=gain; 
    }
    // Level up
    if(b.xp>=b.xpNeeded){ b.xp-=b.xpNeeded; b.level++; b.xpNeeded=Math.floor(b.xpNeeded*1.15); }
    // Rebirth
    let rebReq=20+b.rebirths*10;
    if(b.level>=rebReq && Math.random()<b.personality.rebirthFocus){ b.level=1; b.xp=0; b.xpNeeded=100; b.rebirths++; b.multiplier=(b.multiplier||1)+0.5; }
    // Prestige
    let preReq=5+b.prestige*5;
    if(b.rebirths>=preReq && Math.random()<b.personality.rebirthFocus){ b.rebirths=0; b.prestige++; b.multiplier+=2; }
    // Upgrades
    upgrades.forEach((u,i)=>{ if(b.level>=u.milestone && !b.upgrades.includes(i)){ b.upgrades.push(i); u.effect(b); } });

    // BOT CLAN CREATION
    if(!b.clan && Math.random()<0.01){
      let newName="BotClan"+Math.floor(Math.random()*100000);
      if(!botClans.includes(newName)) botClans.push(newName);
      if(getClanMemberCount(newName)<MAX_CLAN_MEMBERS) b.clan=newName;
    }

    // BOT JOIN STRATEGY
    if(!b.clan && botClans.length>0){
      let topClan=botClans[Math.floor(Math.random()*botClans.length)];
      if(Math.random()<b.personality.joinClan && getClanMemberCount(topClan)<MAX_CLAN_MEMBERS) b.clan=topClan;
    }

    // BOT LEAVE STRATEGY
    if(b.clan && Math.random()<0.0002) b.clan=null;

    // Passive growth
    b.click+=0.01; b.drones+=0.001;
  });
  // Player drones
  energy+=drones*multiplier; totalEnergy+=drones*multiplier;
  updateUI();
},1000);

// === TABS ===
function showTab(name){ document.querySelectorAll(".tab").forEach(t=>t.classList.add("hidden")); document.getElementById(name).classList.remove("hidden"); }

// === REBIRTH / PRESTIGE ===
function rebirth(){ let req=20+rebirths*10; if(level>=req){ rebirths++; multiplier+=0.5; level=1; xp=0; xpNeeded=100; updateUI(); } }
function prestigeReset(){ let req=5+prestige*5; if(rebirths>=req){ prestige++; multiplier+=2; rebirths=0; updateUI(); } }

// === CLAN ===
function createClan(){
  let name=document.getElementById("clanInput").value.trim();
  if(name!="" && getClanMemberCount(name)<=MAX_CLAN_MEMBERS) clan=name;
  updateUI();
}

// === SAVE / LOAD ===
function saveGame(){ 
  const saveData={energy,level,xp,xpNeeded,rebirths,prestige,multiplier,drones,clan,pendingRequests,totalClicks,totalEnergy};
  localStorage.setItem('idleEmpireSave',JSON.stringify(saveData)); 
}
function loadGame(){ 
  const s=JSON.parse(localStorage.getItem('idleEmpireSave')); 
  if(s){ Object.assign(window,s); }
  updateXPBar(); updateUI(); 
}
setInterval(saveGame,1000); window.onload=loadGame;

// === RESET ===
function resetGame(){ if(confirm("Are you sure you want to reset all progress?")){ localStorage.removeItem('idleEmpireSave'); location.reload(); } }

updateUI(); updateXPBar();
