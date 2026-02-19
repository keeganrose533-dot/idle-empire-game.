// ===== Prestige & Rebirth Module =====
function prestigeGame(){
    if(level >= 50){ // example threshold
        prestige++;
        multiplier += 1 + prestige*0.2;
        energy = 0; xp = 0; level = 1; xpNeeded = 100;
        alert("Prestige activated! Multiplier increased.");
        saveGame();
        updateUI();
    } else alert("Reach level 50 to prestige.");
}

function rebirthGame(){
    if(level >= 25){ // example threshold
        rebirths++;
        multiplier += 0.5;
        energy = 0; xp = 0; level = 1; xpNeeded = 100;
        alert("Rebirth complete! Temporary multiplier applied.");
        saveGame();
        updateUI();
    } else alert("Reach level 25 to rebirth.");
}
