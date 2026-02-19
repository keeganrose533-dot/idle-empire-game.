// === BULLETPROOF SAVE/LOAD PATCH ===
(function(){

  // Backup old functions if they exist
  const oldSave = window.saveGame;
  const oldLoad = window.loadGame;

  // Override saveGame
  window.saveGame = function(){
    try {
      const saveData = {
        energy: window.energy || 0,
        level: window.level || 1,
        xp: window.xp || 0,
        xpNeeded: window.xpNeeded || 100,
        rebirths: window.rebirths || 0,
        prestige: window.prestige || 0,
        multiplier: window.multiplier || 1,
        drones: window.drones || 0,
        totalClicks: window.totalClicks || 0,
        totalEnergy: window.totalEnergy || 0,
        clan: window.clan || null,
        upgrades: (window.upgrades || []).map(u => u.level || 0),
        pendingRequests: (window.pendingRequests || []).map(b => ({
          name: b.name, level: b.level, xp: b.xp,
          rebirths: b.rebirths, prestige: b.prestige
        }))
      };
      localStorage.setItem('idleEmpireSave', JSON.stringify(saveData));
      if(oldSave) oldSave(); // call old save too
    } catch(e){ console.error("Save failed:", e); }
  }

  // Override loadGame
  window.loadGame = function(){
    try {
      const data = JSON.parse(localStorage.getItem('idleEmpireSave'));
      if(data){
        window.energy = data.energy;
        window.level = data.level;
        window.xp = data.xp;
        window.xpNeeded = data.xpNeeded;
        window.rebirths = data.rebirths;
        window.prestige = data.prestige;
        window.multiplier = data.multiplier;
        window.drones = data.drones;
        window.totalClicks = data.totalClicks;
        window.totalEnergy = data.totalEnergy;
        window.clan = data.clan;
        if(window.upgrades && data.upgrades){
          window.upgrades.forEach((u,i)=>{ u.level = data.upgrades[i] || 0; if(u.level>0) u.effect(window); });
        }
        if(window.pendingRequests && data.pendingRequests){
          window.pendingRequests = data.pendingRequests.map(b=>{
            return {name:b.name, level:b.level, xp:b.xp, rebirths:b.rebirths, prestige:b.prestige};
          });
        }
      }
      if(oldLoad) oldLoad();
      if(window.updateUI) window.updateUI();
    } catch(e){ console.error("Load failed:", e); }
  }

  // Force autosave every second
  setInterval(window.saveGame, 1000);

  // Load immediately
  window.loadGame();

})();
