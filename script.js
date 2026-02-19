let energy = 0;
let level = 1;
let xp = 0;
let xpNeeded = 100;
let rebirths = 0;
let prestige = 0;
let drones = 0;
let droneCost = 50;
let multiplier = 1;
let clan = null;

let bots = [];

function updateUI() {
  document.getElementById("energy").innerText = Math.floor(energy);
  document.getElementById("level").innerText = level;
  document.getElementById("rebirths").innerText = rebirths;
  document.getElementById("prestige").innerText = prestige;
  document.getElementById("multiplier").innerText = multiplier.toFixed(2);
  document.getElementById("droneCost").innerText = droneCost;
  document.getElementById("xpBar").style.width = (xp / xpNeeded * 100) + "%";
}

document.getElementById("pulseButton").onclick = function () {
  let gain = 1 * multiplier;
  energy += gain;
  xp += gain;

  if (xp >= xpNeeded) {
    xp = 0;
    level++;
    xpNeeded *= 1.2;
  }

  updateUI();
};

function buyDrone() {
  if (energy >= droneCost) {
    energy -= droneCost;
    drones++;
    droneCost *= 1.5;
  }
}

setInterval(() => {
  energy += drones * multiplier;
  xp += drones;

  if (xp >= xpNeeded) {
    xp = 0;
    level++;
    xpNeeded *= 1.2;
  }

  updateUI();
}, 1000);

function rebirth() {
  if (level >= 20) {
    rebirths++;
    multiplier += 0.5;
    level = 1;
    xp = 0;
    xpNeeded = 100;
  }
}

function prestigeReset() {
  if (rebirths >= 5) {
    prestige++;
    multiplier += 2;
    rebirths = 0;
  }
}

function showTab(name) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.add("hidden"));
  document.getElementById(name).classList.remove("hidden");
}

function createClan() {
  if (!clan) {
    clan = "PlayerClan";
    document.getElementById("clanName").innerText = clan;
  }
}

function generateBots() {
  for (let i = 0; i < 5; i++) {
    bots.push({
      name: "Bot_" + i,
      power: Math.random() * 1000
    });
  }
}

function updateLeaderboard() {
  let list = bots.map(b => `${b.name}: ${Math.floor(b.power)}`).join("<br>");
  document.getElementById("leaderboardList").innerHTML = list;
}

generateBots();
setInterval(updateLeaderboard, 2000);
updateUI();
