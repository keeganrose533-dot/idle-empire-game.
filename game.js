// ====== GLOBAL VARIABLES ======
let energy = 0, level = 1, xp = 0, xpNeeded = 100;
let rebirths = 0, prestige = 0, multiplier = 1, drones = 0, totalClicks = 0;

let bots = [], factions = [], achievements = [];
let upgrades = [
    {name:"Click Boost", cost:10, level:0, effect:function(){multiplier += 1}}, // doubled
    {name:"Drone", cost:50, level:0, effect:function(){drones += 2}} // doubled
];

// ====== INITIALIZE BOTS ======
function initBots(count=500){
    const personalities = ["Grindy","Casual","Lazy","Strategic"];
    for(let i=0;i<count;i++){
        bots.push({
            name:"Bot"+(i+1),
            energy:Math.floor(Math.random()*1000),
            level:Math.floor(Math.random()*5)+1,
            xp:Math.floor(Math.random()*50),
            rebirths:0,
            prestige:0,
            personality: personalities[Math.floor(Math.random()*personalities.length)],
            faction:null
        });
    }
}

// ====== CLICK CORE ======
document.getElementById("click-core").addEventListener("click",()=>{
    let gain = 1*multiplier;
    energy += gain;
    xp += gain;
    totalClicks++;
    checkLevelUp();
    updateUI();
});

// ====== LEVEL UP ======
function checkLevelUp(){
    while(xp >= xpNeeded){
        xp -= xpNeeded;
        level++;
        xpNeeded = Math.floor(xpNeeded*1.1);
    }
}

// ====== TAB MANAGEMENT ======
const tabs = document.querySelectorAll(".tab-btn");
tabs.forEach(tab=>{
    tab.addEventListener("click",()=>{
        document.querySelectorAll(".tab-content").forEach(tc=>tc.style.display="none");
        document.getElementById(tab.dataset.tab).style.display="block";
        renderTab(tab.dataset.tab);
    });
});

// ====== RENDER TABS ======
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
        <p>Prestige: ${prestige}</p>`;
    }
    if(tab=="achievements"){
        let html = "<ul>";
        achievements.forEach(a=>{html+=`<li>${a}</li>`});
        html+="</ul>";
        document.getElementById("achievements").innerHTML = html;
    }
    if(tab=="factions"){
        updateFactionEnergy();
        let html = "<ul>";
        factions.forEach(f=>{
            html += `<li>${f.name} (${f.members.length}/25) - Energy: ${Math.floor(f.energy)}</li>`;
        });
        html+="</ul>";
        document.getElementById("factions").innerHTML = html;
    }
}

// ====== BUY UPGRADE ======
function buyUpgrade(i){
    let u = upgrades[i];
    if(energy >= u.cost){
        energy -= u.cost;
        u.level++;
        u.effect(); // doubled effect
        u.cost = Math.floor(u.cost*1.5);
        updateUI();
    }
}

// ====== UPDATE UI ======
function updateUI(){
    document.getElementById("energy-display").innerText = "Energy: "+Math.floor(energy);
    document.getElementById("level-display").innerText = "Level: "+level;
    document.getElementById("rebirth-display").innerText = "Rebirths: "+rebirths;
    document.getElementById("prestige-display").innerText = "Prestige: "+prestige;
    let xpPercent = Math.min(100, xp/xpNeeded*100);
    document.getElementById("xp-fill").style.width = xpPercent+"%";
    document.getElementById("xp-text").innerText = `XP: ${Math.floor(xp)}/${xpNeeded}`;
}

// ====== AUTOPROGRESS FOR DRONES ======
setInterval(()=>{
    energy += drones*1; // doubled
    xp += drones*1;
    checkLevelUp();
    updateUI();
},1000);

// ====== BOT AI ======
setInterval(()=>{
    bots.forEach(b=>{
        let gain = 1*(Math.random()+0.5);
        b.energy += gain;
        b.xp += gain;
        while(b.xp >= 50){
            b.xp -= 50;
            b.level++;
        }
        // Bot faction join
        if(!b.faction && Math.random()<0.02 && factions.length){
            let f = factions[Math.floor(Math.random()*factions.length)];
            if(f.members.length<25){
                b.faction = f.name;
                f.members.push(b);
            }
        }
        // Bot rebirth/prestige
        if(b.level>=25 && Math.random()<0.005){ b.level=1; b.xp=0; b.rebirths=(b.rebirths||0)+1; }
        if(b.level>=50 && Math.random()<0.002){ b.level=1; b.xp=0; b.prestige=(b.prestige||0)+1; }
    });
    renderTab("leaderboard");
},2000);

// ====== ACHIEVEMENTS & EVENTS ======
function checkAchievements(){
    if(totalClicks >= 100 && !achievements.includes("100 Clicks")) achievements.push("100 Clicks");
    if(level >= 10 && !achievements.includes("Level 10")) achievements.push("Level 10");
    // Random bonus
    if(Math.random()<0.01){
        let bonus = Math.floor(Math.random()*50+10);
        energy += bonus;
        updateUI();
    }
}
setInterval(checkAchievements,2000);

// ====== PRESTIGE & REBIRTH FUNCTIONS ======
function prestigeGame(){
    if(level>=50){ prestige++; multiplier += 1 + prestige*0.2; energy=0; xp=0; level=1; xpNeeded=100; updateUI(); alert("Prestige!"); saveGame();}
}
function rebirthGame(){
    if(level>=25){ rebirths++; multiplier += 0.5; energy=0; xp=0; level=1; xpNeeded=100; updateUI(); alert("Rebirth!"); saveGame();}
}

// ====== FACTIONS ======
function createFaction(name){
    if(!factions.find(f=>f.name==name)) factions.push({name:name, members:[], energy:0});
}
function joinFaction(player,factionName){
    const f = factions.find(f=>f.name==factionName);
    if(f && f.members.length<25){ f.members.push(player); player.faction=f.name; }
}
function leaveFaction(player,factionName){
    const f = factions.find(f=>f.name==factionName);
    if(f){ f.members = f.members.filter(m=>m!=player); player.faction=null; }
}
function updateFactionEnergy(){ factions.forEach(f=>{f.energy = f.members.reduce((acc,m)=>acc + (m.energy||0),0);}); }

// ====== SAVE/LOAD ======
function saveGame(){ const saveData={energy,level,xp,xpNeeded,rebirths,prestige,multiplier,drones,totalClicks,bots,factions,achievements}; localStorage.setItem("cyberClashSave",JSON.stringify(saveData));}
function loadGame(){ const data=JSON.parse(localStorage.getItem("cyberClashSave")); if(data) Object.assign(window,data);}
setInterval(saveGame,1000);
loadGame();

// ====== INITIALIZE ======
initBots();
updateUI();
renderTab("upgrades");
