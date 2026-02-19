// ======= Variables =======
let energy = 0;
let level = 1;
let xp = 0;
let xpNeeded = 100;
let rebirths = 0;
let prestige = 0;
let multiplier = 1;
let drones = 0;
let totalClicks = 0;

let upgrades = [
  {name:"Click Boost", cost:10, level:0, effect:function(){multiplier += 0.5}},
  {name:"Drone", cost:50, level:0, effect:function(){drones +=1}}
];

let bots = [];
let factions = [];
let achievements = [];

// ======= Initialize Bots =======
function initBots(count=500){
  const personalities = ["Grindy","Casual","Lazy","Strategic"];
  for(let i=0;i<count;i++){
    bots.push({
      name:"Bot"+(i+1),
      energy:Math.floor(Math.random()*1000),
      level:Math.floor(Math.random()*5)+1,
      xp:Math.floor(Math.random()*50),
      rebirths:Math.floor(Math.random()*2),
      prestige:0,
      personality: personalities[Math.floor(Math.random()*personalities.length)]
    });
  }
}

// ======= Click Core =======
document.getElementById("click-core").addEventListener("click",()=>{
  let gain = 1*multiplier;
  energy += gain;
  xp += gain;
  totalClicks++;
  checkLevelUp();
  updateUI();
});

// ======= Level Up =======
function checkLevelUp(){
  while(xp >= xpNeeded){
    xp -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded*1.1);
  }
}

// ======= Tabs =======
const tabs = document.querySelectorAll(".tab-btn");
tabs.forEach(tab => {
  tab.addEventListener("click",()=>{
    document.querySelectorAll(".tab-content").forEach(tc=>tc.style.display="none");
    document.getElementById(tab.dataset.tab).style.display="block";
    renderTab(tab.dataset.tab);
  });
});

// ======= Render Tabs =======
function renderTab(tab){
  if(tab=="upgrades"){
    let html = "";
    upgrades.forEach((u,i)=>{
      html += `<button onclick="buyUpgrade(${i})">${u.name} Lvl ${u.level} - Cost: ${u.cost}</button><br>`;
    });
    document.getElementById("upgrades").innerHTML = html;
  }
  if(tab=="leaderboard"){
    let sorted = [...bots].sort((a,b)=>b.energy-a.energy);
    sorted.unshift({name:"You", energy});
    let html = "<ol>";
    sorted.slice(0,10).forEach(p=>html+=`<li>${p.name}: ${Math.floor(p.energy)}</li>`);
    html+="</ol>";
    document.getElementById("leaderboard").innerHTML = html;
  }
  if(tab=="stats"){
    document.getElementById("stats").innerHTML = `
      <p>Total Clicks: ${totalClicks}</p>
      <p>Level: ${level}</p>
      <p>XP: ${Math.floor(xp)}/${xpNeeded}</p>
      <p>Energy: ${Math.floor(energy)}</p>
      <p>Drones: ${drones}</p>
      <p>Rebirths: ${rebirths}</p>
      <p>Prestige: ${prestige}</p>
    `;
  }
}

// ======= Buy Upgrade =======
function buyUpgrade(i){
  let u = upgrades[i];
  if(energy >= u.cost){
    energy -= u.cost;
    u.level++;
    u.effect();
    u.cost = Math.floor(u.cost*1.5);
    updateUI();
  }
}

// ======= Update UI =======
function updateUI(){
  document.getElementById("energy-display").innerText = "Energy: "+Math.floor(energy);
  document.getElementById("level-display").innerText = "Level: "+level;
  document.getElementById("rebirth-display").innerText = "Rebirths: "+rebirths;
  document.getElementById("prestige-display").innerText = "Prestige: "+prestige;
  let xpPercent = Math.min(100, xp/xpNeeded*100);
  document.getElementById("xp-fill").style.width = xpPercent+"%";
  document.getElementById("xp-text").innerText = `XP: ${Math.floor(xp)}/${xpNeeded}`;
}

// ======= Auto Energy from Drones =======
setInterval(()=>{
  energy += drones*0.5;
  xp += drones*0.5;
  checkLevelUp();
  updateUI();
},1000);

// ======= Bots Auto Progress =======
setInterval(()=>{
  bots.forEach(b=>{
    let gain = 1*(Math.random()+0.5);
    b.energy += gain;
    b.xp += gain;
    while(b.xp >= 50){
      b.xp -= 50;
      b.level++;
    }
  });
  renderTab("leaderboard");
},2000);

// ======= Autosave =======
function saveGame(){
  const saveData = {energy, level, xp, xpNeeded, rebirths, prestige, multiplier, drones, totalClicks};
  localStorage.setItem("cyberClashSave",JSON.stringify(saveData));
}
function loadGame(){
  const data = JSON.parse(localStorage.getItem("cyberClashSave"));
  if(data){
    Object.assign(window, data);
  }
}
setInterval(saveGame,1000);
loadGame();

// ======= Initialize =======
initBots();
updateUI();
renderTab("upgrades");
