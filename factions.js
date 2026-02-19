// ===== Factions / Clans Module =====
factions = factions || [];

function createFaction(name){
    if(!factions.find(f=>f.name==name)){
        factions.push({name:name, members:[], energy:0});
        alert("Faction "+name+" created!");
    } else alert("Faction name exists!");
}

function joinFaction(player, factionName){
    const f = factions.find(f=>f.name==factionName);
    if(f && f.members.length < 25){
        f.members.push(player);
        alert(player+" joined "+factionName);
    } else alert("Faction full or not found.");
}

function leaveFaction(player, factionName){
    const f = factions.find(f=>f.name==factionName);
    if(f){
        f.members = f.members.filter(m=>m!=player);
        alert(player+" left "+factionName);
    }
}

function updateFactionEnergy(){
    factions.forEach(f=>{
        f.energy = f.members.reduce((acc,m)=>acc + (m.energy||0),0);
    });
}
