// JavaScript source code

/* -----------------------------
        USER INTERFACE
   ----------------------------- */
//  Divs
var welomeDiv;
var stationDiv;
var gameworldDiv;
var interfaceDivs = [];

//station view divs
var gameworldListDiv; //should rename to stationGameworldListDiv
var stationMoneyDiv;
var stationDetailsDiv;

//gameworld view divs
var selectedDiv;



var minerMoneyDiv;
var minerHealthDiv;
var minerMoneyProg;
var minerHealthProg;

//  Buttons
var playButton;
var clearButton;
var backToMenuButton;
var backToStationButton;
var startNewWorldButton;

var gameworldCancelButton;
var buildButton;

// Game Canvas
var worldView;
var targetFrameRate = 60;
var tstep = 1000 / targetFrameRate;


var uiupdatecounter = 0;

/* ------------------------------
            USER INFORMATION
   ------------------------------ */
var curPlayer;

var playWorld = function (event) {
    //console.log(event.target.value);
    curPlayer.playing = event.target.value;
    goToView("gameworld");
    goToActionState();
    //alert("want to play world " + event);
}

var goToActionState = function (event) {
    if (runningStation) {
        clearInterval(runningStation);
        runningStation = 0;
    }
    selectedDiv.innerHTML = "";
    selectedDiv.textContent = "depth: " + curPlayer.gameworlds[curPlayer.playing].depth;
    if (event != null) {
        if (event.target.id == "build-btn") {
            //console.log("time to build stuff!");
            curPlayer.gameworlds[curPlayer.playing].actionState = ActionState.BUILDING;
            curPlayer.gameworlds[curPlayer.playing].selected = null;
            curPlayer.gameworlds[curPlayer.playing].building = new Turret(curMouseX, curMouseY);
            //console.log(curPlayer.gameworlds[curPlayer.playing].building);
        }
        else if (event.target.id == "gameworld-cancel-btn") {
            //console.log("cancelled stuff!");
            curPlayer.gameworlds[curPlayer.playing].actionState = ActionState.NONE;
            curPlayer.gameworlds[curPlayer.playing].building = null;
            curPlayer.gameworlds[curPlayer.playing].selected = null;
        }
    }

    // set up view for correct action state
    if (curPlayer.gameworlds[curPlayer.playing].actionState == ActionState.NONE) {
        gameworldCancelButton.style.display = "none";
        buildButton.style.display = "block";
    }
    else if (curPlayer.gameworlds[curPlayer.playing].actionState == ActionState.SELECTED) {
        gameworldCancelButton.style.display = "block";
        buildButton.style.display = "block";
        var curmoney = curPlayer.gameworlds[curPlayer.playing].miner.money;
        //add in the info of the selected unit!
        var temp = curPlayer.gameworlds[curPlayer.playing].selected;
        for (var k in temp.upgradable) {
            var cost = 25 * Math.pow(2, temp[temp.upgradable[k]]);
            var newdiv = document.createElement("div");
            newdiv.textContent = temp.upgradable[k] + ": " + temp[temp.upgradable[k]] + " cost: " + cost;
            var newbtn = document.createElement("button");
            newbtn.textContent = "+";
            newbtn.id = "upgrade-btn-" + k;
            newbtn.name = temp.upgradable[k];
            newbtn.addEventListener("click", upgradeController);
            if (curmoney >= cost) {
                newdiv.appendChild(newbtn);
            }
            selectedDiv.appendChild(newdiv);
        }
        // we need to make little divs for displaying and upgrading
        // your stats
        //selectedDiv.innerHTML = keys;
    }
    else if (curPlayer.gameworlds[curPlayer.playing].actionState == ActionState.BUILDING) {
        gameworldCancelButton.style.display = "block";
        buildButton.style.display = "none";
    }
}
var runningStation = 0;
var goToView = function (view) {
    uiupdatecounter = 1000;
    //hide all divs
    for (var k in interfaceDivs) {
        interfaceDivs[k].style.display = "none";
    }
    //stop the station update if we are leaving the station view
    if (view != "station") {
        clearInterval(runningStation);
        runningStation = 0;
    }

    if (view == null || view == "welcome") {
        welcomeDiv.style.display = "block";
    }
    else if(view == "station") {
        stationDiv.style.display = "block";
        if (curPlayer && !runningStation) {
            runningStation = setInterval("RunCurrentStation()", tstep);
        }
        else if (curPlayer) {
            console.log("ERROR: station was already running!!");
        }
    }
    else if (view == "gameworld") {
        gameworldDiv.style.display = "block";
        // if player is playing a game then we
        // should probably start displaying it and playing it!
        if (curPlayer.playing != null) {
            console.log("should play game " + curPlayer.playing);
            curPlayer.gameworlds[curPlayer.playing].startPlaying(worldView, tstep);
            if (runningStation) {
                clearInterval(runningStation);
                runningStation = 0;
            }
        }
        else {
            console.log("ERROR: we aren't playing a game! -> back to the station!");
            goToView("station");
        }
    }
}
//update function for current game world
var RunCurrentGameWorld = function () {
    curPlayer.gameworlds[curPlayer.playing].update(worldView, tstep);
    minerHealthProg.max = curPlayer.gameworlds[curPlayer.playing].miner.getMaxHealth();
    minerHealthProg.value = curPlayer.gameworlds[curPlayer.playing].miner.curHP;
    minerMoneyProg.value = curPlayer.gameworlds[curPlayer.playing].miner.money;
    minerMoneyProg.max = curPlayer.gameworlds[curPlayer.playing].miner.getMaxMoney();

    minerHealthDiv.innerHTML = curPlayer.gameworlds[curPlayer.playing].miner.curHP;
    minerMoneyDiv.innerHTML = curPlayer.gameworlds[curPlayer.playing].miner.money;

    var cost = 100 * (curPlayer.gameworlds[curPlayer.playing].turrets.length + 1);
    buildButton.textContent = "Build Turret for " + cost;

    uiupdatecounter++;
    if (uiupdatecounter > 50) {
        uiupdatecounter = 0;
        goToActionState();
    }
}

var RunCurrentStation = function () {
    //console.log("running station");
    //display station money and details
    stationMoneyDiv.textContent = "Money: " + curPlayer.money;
    stationDetailsDiv.textContent = "Upgrades: ";
    var time = new Date().getTime();
    for (var k in curPlayer.gameworlds) {
        curPlayer.gameworlds[k].catchUpToNow(time, tstep);
    }

    uiupdatecounter++;
    if (uiupdatecounter > 100) {
        uiupdatecounter = 0;
        //display the active games
        gameworldListDiv.innerHTML = "";
        for (var k in curPlayer.gameworlds) {
            if (curPlayer.gameworlds[k].miner.moneyTransfered > 0) {
                //console.log("world had " + curPlayer.gameworlds[k].miner.moneyTransfered + " money");
                curPlayer.money += curPlayer.gameworlds[k].miner.moneyTransfered;
                curPlayer.gameworlds[k].miner.moneyTransfered = 0;
            }
            if (curPlayer.gameworlds[k].lost) {
                continue;
            }

            var newdiv = document.createElement("div");
            newdiv.textContent = "World " + k + " ";
            var newbtn = document.createElement("button");
            newbtn.value = k;
            newbtn.textContent = "Play";
            newbtn.id = "play-world-" + k;
            newbtn.addEventListener("click", playWorld);
            newdiv.appendChild(newbtn);
            gameworldListDiv.appendChild(newdiv);
        }
    }
}

var init = function () {
    // Connect Interface Elements
    // Divs
    welcomeDiv = document.getElementById("welcome-div");
    stationDiv = document.getElementById("station-div");
    gameworldDiv = document.getElementById("gameworld-div");
    interfaceDivs.push(welcomeDiv, stationDiv, gameworldDiv);
    
    //station view elements
    gameworldListDiv = document.getElementById("gameworld-list-div");
    stationMoneyDiv = document.getElementById("station-money-div");
    stationDetailsDiv = document.getElementById("station-details-div");

    //gameworld view elements
    selectedDiv = document.getElementById("selected-div");
    minerMoneyDiv = document.getElementById("miner-money-div");
    minerHealthDiv = document.getElementById("miner-health-div");
    minerMoneyProg = document.getElementById("miner-money-prog");
    minerHealthProg = document.getElementById("miner-health-prog");

    // Buttons
    playButton = document.getElementById("play-btn");
    clearButton = document.getElementById("clear-btn");
    backToMenuButton = document.getElementById("back-to-menu-btn");
    backToStationButton = document.getElementById("back-to-station-btn");
    startNewWorldButton = document.getElementById("start-new-world-btn");
    gameworldCancelButton = document.getElementById("gameworld-cancel-btn");
    buildButton = document.getElementById("build-btn");

    // Button Clicks
    clearButton.onclick = function () { curPlayer = new Player(); goToView();}
    playButton.onclick = function () { goToView("station") };
    backToMenuButton.onclick = function () { goToView("welcome") };
    backToStationButton.onclick = function () { curPlayer.gameworlds[curPlayer.playing].stopPlaying(); curPlayer.playing = null; goToView("station"); };
    startNewWorldButton.onclick = function () {
        if (curPlayer) {
            curPlayer.gameworlds.push(new Gameworld(15));
            curPlayer.playing = curPlayer.gameworlds.length - 1;
            goToView("gameworld");
        }
        else { alert("no player!");}
    };
    buildButton.addEventListener("click", goToActionState);
    gameworldCancelButton.addEventListener("click", goToActionState);

    // Set up canvas and worldview
    var canvas = document.getElementById("gameworld-canvas");
    canvas.addEventListener("click", clickController);
    canvas.addEventListener("mousemove", hoverController);
    var context = canvas.getContext("2d");
    worldView = new worldView(1,200, 200, canvas, context);

    //this is where we would handle cookie stuff.... but for now lets ignore that!
    goToView();
    curPlayer = new Player("tom");
}

var upgradeController = function (event) {
    console.log("upgrade: " + event.target.name);
    var curlevel = curPlayer.gameworlds[curPlayer.playing].selected[event.target.name];
    var cost = 25 * Math.pow(2, curlevel);
    if (curPlayer.gameworlds[curPlayer.playing].miner.money >= cost) {
        curPlayer.gameworlds[curPlayer.playing].miner.money -= cost;
        curPlayer.gameworlds[curPlayer.playing].selected[event.target.name]++;
    }
    goToActionState();
}

var clickController = function (event) {
    var click = { x: (event.x - event.target.offsetLeft), y: (event.y - event.target.offsetTop), radius: 0 };
    if (curPlayer.gameworlds[curPlayer.playing].actionState == ActionState.NONE || curPlayer.gameworlds[curPlayer.playing].actionState == ActionState.SELECTED) {
        //console.log("tried to select unit");
        // go through and see if we clicked on any units!
        var clicked = curPlayer.gameworlds[curPlayer.playing].checkClickCollision(click);
        //console.log(clicked);
        if (clicked != null) {
            curPlayer.gameworlds[curPlayer.playing].actionState = ActionState.SELECTED;
            curPlayer.gameworlds[curPlayer.playing].selected = clicked;
            curPlayer.gameworlds[curPlayer.playing].building = null;
            goToActionState();
        }
        else {
            //console.log("tried to unselect a unit");
            curPlayer.gameworlds[curPlayer.playing].actionState = ActionState.NONE;
            curPlayer.gameworlds[curPlayer.playing].selected = null;
            goToActionState();
        }
    }

    else if (curPlayer.gameworlds[curPlayer.playing].actionState == ActionState.BUILDING) {
        //check if there are enough resources to place a turret!
        var cost = 100 * (curPlayer.gameworlds[curPlayer.playing].turrets.length + 1);
        if (curPlayer.gameworlds[curPlayer.playing].miner.money >= cost) {
            //check if it collides with anything!
            if (curPlayer.gameworlds[curPlayer.playing].checkClickCollision(curPlayer.gameworlds[curPlayer.playing].building) == null) {
                curPlayer.gameworlds[curPlayer.playing].turrets.push(new Turret(click.x, click.y));
                curPlayer.gameworlds[curPlayer.playing].miner.money -= cost;
            }
            else {
                console.log("turret overlaps! can't build!");
            }
        }
        curPlayer.gameworlds[curPlayer.playing].building = null;
        curPlayer.gameworlds[curPlayer.playing].actionState = ActionState.NONE;
        goToActionState();
    }
}

// used for showing units before building
var curMouseX = 0;
var curMouseY = 0;
var hoverController = function (event) {
    curMouseX = event.x - event.target.offsetLeft;
    curMouseY = event.y - event.target.offsetTop;
    if (curPlayer.gameworlds[curPlayer.playing].building != null) {
        curPlayer.gameworlds[curPlayer.playing].building.x = curMouseX;
        curPlayer.gameworlds[curPlayer.playing].building.y = curMouseY;
    }
}