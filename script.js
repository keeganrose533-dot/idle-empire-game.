// === GAME VARIABLES ===
let energy=0, level=1, xp=0, xpNeeded=100;
let rebirths=0, prestige=0;
let multiplier=1;
let drones=0;
let clan=null;
let pendingRequests=[];
let totalClicks=0, totalEnergy=0;

// === BOT SIMULATION ===
const BOT_COUNT = 200000;
let botData = [];
for(let i=0;i<BOT_COUNT;i++){
  botData.push({
    id:i+1,
    name:"Bot"+(i+1),
    energy:Math.random()*50,
    level:1,
    xp:0,
    xpNeeded:100,
    drones:Math.floor(Math.random()*2),
    click:1,
    rebirths:0,
    prestige:0,
    clan:null,
    unlockedUpgrades:[0]
  });
}

// === UPGRADES (with milestone unlocks) ===
let upgrades=[
  {name:"Reactor Drone",baseCost:50,milestone:1,effect:(p)=>{p.drones++;}},
  {name:"Power Boost",baseCost:100,milestone:5,effect:(p)=>{p.multiplier=p.multiplier? p.multiplier+0.5 : 1.5;}},
  {name:"Energy Multiplier",baseCost:200,milestone:10,effect:(p)=>{p.multiplier*=1.1;}},
  {name:"Auto Clicker",baseCost:500,milestone:20,effect:(p)=>{setInterval(()=>{clickCore();},1000);}}
];

// === UI UPDATE ===
function updateUI(){
  document.getElementById("energy").innerText=Math.floor(energy);
  document.getElementById("level").innerText=level;
  document.getElementById("xp").innerText=Math.floor(xp);
  document.getElementById("xpNeeded").innerText=xpNeeded;
  document.getElementById("rebirths").innerText=rebirths;
  document.getElementById("prestige").innerText=prestige;
  document.getElementById("multiplier").innerText=multiplier.toFixed(2);

  // Upgrade list
  let list=document.getElementById("shop");
  list.innerHTML="";
  upgrades.forEach((u,i)=>{
    if(level>=u.milestone){
      let cost=Math.floor(u.baseCost*Math.pow(1.5,(u.level||0)));
      let btn=document.createElement("button");
      btn.innerText=`${u.name} (Level ${u.level||0}) - Cost: ${cost}`;
      btn.onclick=()=>{if(energy>=cost){energy-=cost; u.level=(u.level||0)+1; u.effect(window); updateUI();}};
      list.appendChild(btn);
    }
  });

  // Clan
  document.getElementById("clanName").innerText=clan||"None";

  // Pending requests
  let reqDiv=document.getElementById("pendingRequests");
  reqDiv.innerHTML="";
  pendingRequests.forEach((b,i)=>{
    let btn=document.createElement("button");
    btn.innerText=`${b.name} requests to join your clan`;
    btn.onclick=()=>{b.clan=clan; pendingRequests.splice(i,1); updateUI();};
    reqDiv.appendChild(btn);
  });

  // Clan members
  let memDiv=document.getElementById("clanMembers");
  memDiv.innerHTML="";
  if(clan){
    botData.filter(b=>b.clan===clan).slice(0,50).forEach(b=>{
      let div=document.createElement("div");
      div.innerText=b.name;
      memDiv.appendChild(div);
    });
  }

  // Leaderboard
  let leaderboard=document.getElementById("leaderboardList");
  leaderboard.innerHTML="";
  let sortedBots=[...botData].sort((a,b)=>b.energy-a.energy);
  let top10=sortedBots.slice(0,10);
  top10.forEach(b=>{
    let div=document.createElement("div");
    div.innerText=`${b.name} [${b.clan||"-"}]: ${Math.floor(b.energy)}`;
    leaderboard.appendChild(div);
  });
  let playerRank=sortedBots.findIndex(b=>energy>b.energy)+1;
  document.getElementById("rank").innerText=playerRank>0?playerRank:1;

  // Clan rank
  if(clan){
    let clans={};
    botData.forEach(b=>{if(b.clan){clans[b.clan]=(clans[b.clan]||0)+b.energy;}});
    clans[clan]=(clans[clan]||0)+energy;
    let sortedClans=Object.entries(clans).sort((a,b)=>b[1]-a[1]);
    let clanRank=sortedClans.findIndex(c=>c[0]===clan)+1;
    document.getElementById("clanRank").innerText=clanRank;
  } else document.getElementById("clanRank").innerText="-";

  // Stats
  let stats=document.getElementById("statsList");
  stats.innerHTML=`<li>Total Clicks: ${totalClicks}</li>
                   <li>Total Drones: ${drones}</li>
                   <li>Total Energy: ${Math.floor(totalEnergy)}</li>
                   <li>Total Bots: ${BOT_COUNT}</li>`;

  // Achievements
  let achList=document.getElementById("achievementList");
  achList.innerHTML="";
  if(totalClicks>=1) achList.innerHTML+="<li>✅ First Click</li>";
  if(totalClicks>=100) achList.innerHTML+="<li>✅ Click Master</li>";
}

// === CLICK & LEVELING ===
function clickCore(){
  let gain=1*multiplier;
  energy+=gain; totalEnergy+=gain; xp+=gain; totalClicks++;

  // Level up infinitely
  if(xp>=xpNeeded){
    xp-=xpNeeded;
    level++;
    xpNeeded=Math.floor(xpNeeded*1.15); // scaling XP
  }
  updateXPBar();
  updateUI();
}

function updateXPBar(){
  const bar=document.getElementById("xpBar");
  const percent=Math.min(100,(xp/xpNeeded)*100);
  bar.style.width=percent+"%";
  document.getElementById("xp").innerText=Math.floor(xp);
  document.getElementById("xpNeeded").innerText=xpNeeded;
}
document.getElementById("pulseButton").onclick=clickCore;

// === BOT AUTOPROGRESS ===
setInterval(()=>{
  energy+=drones*multiplier; totalEnergy+=drones*multiplier;
  botData.forEach(b=>{
    let botGain=b.click*b.level + b.drones;
    b.energy+=botGain;

    // Bot level scaling
    b.xp+=botGain;
    if(b.xp>=b.xpNeeded){
      b.xp-=b.xpNeeded;
      b.level++;
      b.xpNeeded=Math.floor(b.xpNeeded*1.15);
    }

    // Bot Rebirth
    let rebirthReq=20 + b.rebirths*10;
    if(b.level>=rebirthReq){ b.level=1; b.xp=0; b.xpNeeded=100; b.rebirths++; b.multiplier=(b.multiplier||1)+0.5; }

    // Bot Prestige
    let prestigeReq=5+b.prestige*5;
    if(b.rebirths>=prestigeReq){ b.rebirths=0; b.prestige++; b.multiplier+=2; }

    // Bot upgrades
    upgrades.forEach((u,i)=>{
      if(b.level>=u.milestone && !b.unlockedUpgrades.includes(i)){
        b.unlockedUpgrades.push(i); u.effect(b);
      }
    });

    // Bot clan actions
    if(!b.clan && clan && Math.random()<0.0005 && !pendingRequests.includes(b)) pendingRequests.push(b);
    if(b.clan && Math.random()<0.0002) b.clan=null;

    // Small random upgrade
    if(Math.random()<0.0007){ b.click+=0.05; b.drones+=0.01; }
  });
  updateUI();
},1000);

// === TABS ===
function showTab(name){ document.querySelectorAll(".tab").forEach(t=>t.classList.add("hidden")); document.getElementById(name).classList.remove("hidden"); }

// === REBIRTH / PRESTIGE ===
function rebirth(){ let req=20+rebirths*10; if(level>=req){ rebirths++; multiplier+=0.5; level=1; xp=0; xpNeeded=100; updateUI(); } }
function prestigeReset(){ let req=5+prestige*5; if(rebirths>=req){ prestige++; multiplier+=2; rebirths=0; updateUI(); } }

// === CLAN ===
function createClan(){ if(!clan){ clan="PlayerClan"; updateUI(); } }

// === SAVE / LOAD ===
function saveGame(){ localStorage.setItem('idleEmpireSave',JSON.stringify({energy,level,xp,xpNeeded,rebirths,prestige,multiplier,drones,clan,totalClicks,totalEnergy})); }
function loadGame(){ let s=JSON.parse(localStorage.getItem('idleEmpireSave')); if(s){ Object.assign(window,s); } updateXPBar(); updateUI(); }
setInterval(saveGame,1000); loadGame();

// === RESET ===
function resetGame(){ if(confirm("Are you sure you want to reset all progress?")){ localStorage.removeItem('idleEmpireSave'); location.reload(); } }

updateUI();
updateXPBar();
