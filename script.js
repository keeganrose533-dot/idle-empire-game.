// === GAME VARIABLES ===
let energy = 0, level = 1, xp = 0, xpNeeded = 100;
let rebirths = 0, prestige = 0;
let drones = 0, droneCost = 50;
let multiplier = 1;
let clan = null;
let bots = [];

// === UI UPDATE ===
function updateUI() {
  document.getElementById("energy").innerText = Math.floor(energy);
  document.getElementById("level").innerText = level;
  document.getElementById("rebirths").innerText = rebirths;
  document.getElementById("prestige").innerText = prestige;
  document.getElementById("multiplier").innerText = multiplier.toFixed(2);
  document.getElementById("droneCost").innerText = droneCost;
  document.getElementById("xpBar").style.width = (xp/xpNeeded*100) + "%";

  document.getElementById("clanName").innerText = clan || "None";
  document.getElementById("clanMembers").innerHTML = clan ? bots.filter(b=>b.clan===clan).map(b=>b.name).join("<br>") : "";
  updateLeaderboard();
}

// === CLICK BUTTON ===
document.getElementById("pulseButton").onclick = () => {
  let gain = 1 * multiplier;
  energy += gain; xp += gain;
  if (xp >= xpNeeded){ xp=0; level++; xpNeeded*=1.2; }
  updateUI();
};

// === SHOP ===
function buyDrone(){
  if(energy>=droneCost){ energy-=droneCost; drones++; droneCost*=1.5; updateUI(); }
}

// === AUTOPROGRESS ===
setInterval(()=>{
  energy+=drones*multiplier; xp+=drones;
  if(xp>=xpNeeded){ xp=0; level++; xpNeeded*=1.2; }
  updateUI();
},1000);

// === REBIRTH/PRESTIGE ===
function rebirth(){
  if(level>=20){ rebirths++; multiplier+=0.5; level=1; xp=0; xpNeeded=100; updateUI(); }
}
function prestigeReset(){
  if(rebirths>=5){ prestige++; multiplier+=2; rebirths=0; updateUI(); }
}

// === TABS ===
function showTab(name){
  document.querySelectorAll(".tab").forEach(tab=>tab.classList.add("hidden"));
  document.getElementById(name).classList.remove("hidden");
}

// === CLAN ===
function createClan(){
  if(!clan){ clan="PlayerClan"; updateUI(); }
}

// === BOTS ===
function generateBots(){
  for(let i=0;i<5;i++){
    bots.push({name:"Bot_"+i,power:Math.random()*1000,clan:null});
  }
}
generateBots();

// === LEADERBOARD ===
function updateLeaderboard(){
  let list = bots.map(b=>`${b.name}: ${Math.floor(b.power)}`).join("<br>");
  document.getElementById("leaderboardList").innerHTML = list;
}

// === BOT LOGIC ===
setInterval(()=>{
  bots.forEach(b=>{
    b.power += Math.random()*2; // bots grind
    if(!b.clan && Math.random()<0.02){ b.clan="BotClan_"+Math.floor(Math.random()*10); } // random clans
  });
  updateUI();
},1000);

// === SAVE/LOAD ===
function saveGame(){
  const saveData = {energy, level, xp, xpNeeded, rebirths, prestige, drones, multiplier, clan, bots};
  localStorage.setItem('idleEmpireSave', JSON.stringify(saveData));
}
function loadGame(){
  const saved = JSON.parse(localStorage.getItem('idleEmpireSave'));
  if(saved){ Object.assign(window, saved); }
  updateUI();
}
setInterval(saveGame,5000);
loadGame();

// === MANUAL RESET ===
function resetGame(){
  if(confirm("Are you sure you want to reset all progress?")){
    localStorage.removeItem('idleEmpireSave'); location.reload();
  }
}

// === INITIAL UI ===
updateUI();
