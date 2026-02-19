// ===== Save/Load & Autosave Upgrade =====
function saveGame(){
    const saveData = {energy, level, xp, xpNeeded, rebirths, prestige, multiplier, drones, totalClicks, bots, factions, achievements};
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
