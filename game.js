function manualSave(){
  localStorage.setItem("idleEmpire", JSON.stringify({
    money, level, xp, rebirths, ascensions,
    clickPower, autoClick, clickCost, autoCost,
    tokens, tokenUpgrade, tokenCost,
    totalClicks, totalMoney, totalAuto,
    achievements: achievements.map(a=>a.unlocked)
  }));
  showToast("Game Saved!");
}

function resetGame(){
  if(confirm("Are you sure you want to reset?")){
    localStorage.removeItem("idleEmpire");
    location.reload();
  }
}
