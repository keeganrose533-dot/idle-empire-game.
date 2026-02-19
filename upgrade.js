let upgrades = [
    {name:"Click Boost I", cost:10, level:0, effect:function(){multiplier += 1}}, // double effect
    {name:"Click Boost II", cost:50, level:0, effect:function(){multiplier += 2}},
    {name:"Click Boost III", cost:200, level:0, effect:function(){multiplier += 5}},
    {name:"Drone I", cost:50, level:0, effect:function(){drones += 2}}, // double effect
    {name:"Drone II", cost:200, level:0, effect:function(){drones += 5}},
    {name:"Drone III", cost:1000, level:0, effect:function(){drones += 10}},
    {name:"XP Booster I", cost:500, level:0, effect:function(){xp += 10}}, // instant boost per click
    {name:"XP Booster II", cost:1500, level:0, effect:function(){xp += 25}},
    {name:"XP Booster III", cost:5000, level:0, effect:function(){xp += 50}},
    {name:"Energy Multiplier I", cost:1000, level:0, effect:function(){multiplier += 5}},
    {name:"Energy Multiplier II", cost:5000, level:0, effect:function(){multiplier += 10}},
    {name:"Event Magnet", cost:2000, level:0, effect:function(){ /* triggers +10% chance of random event */ }},
    {name:"Legendary Clicker", cost:10000, level:0, effect:function(){multiplier += 50}},
    {name:"Legendary Drone Fleet", cost:20000, level:0, effect:function(){drones += 100}},
    {name:"Ultimate XP Surge", cost:50000, level:0, effect:function(){xp += 500}},
    {name:"Cosmic Multiplier", cost:100000, level:0, effect:function(){multiplier += 200}},
    {name:"Galactic Drones", cost:250000, level:0, effect:function(){drones += 1000}},
];
