// JavaScript source code

/* -----------------------------
        USER INTERFACE
   ----------------------------- */
//  Divs
var welomeDiv;
var stationDiv;
var gameworldDiv;
var interfaceDivs = [];

var gameworldListDiv;
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
    selectedDiv.innerHTML = "";
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

        //add in the info of the selected unit!
        var temp = curPlayer.gameworlds[curPlayer.playing].selected;
        for (var k in temp.upgradable) {
            var newdiv = document.createElement("div");
            newdiv.innerText = temp.upgradable[k] + ": " + temp[temp.upgradable[k]];
            var newbtn = document.createElement("button");
            newbtn.innerText = "+";
            newbtn.id = "upgrade-btn-" + k;
            newbtn.name = temp.upgradable[k];
            newbtn.addEventListener("click", upgradeController);
            newdiv.appendChild(newbtn);
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

var goToView = function (view) {
    //hide all divs
    for (var k in interfaceDivs) {
        interfaceDivs[k].style.display = "none";
    }
    if (view == null || view == "welcome") {
        welcomeDiv.style.display = "block";
    }
    else if(view == "station") {
        stationDiv.style.display = "block";
        if (curPlayer) {
            //display the active games
            gameworldListDiv.innerHTML = "";
            for (var k in curPlayer.gameworlds) {
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
    else if (view == "gameworld") {
        gameworldDiv.style.display = "block";
        // if player is playing a game then we
        // should probably start displaying it and playing it!
        if (curPlayer.playing != null) {
            console.log("should play game " + curPlayer.playing);
            curPlayer.gameworlds[curPlayer.playing].startPlaying(worldView, tstep);
        }
        else {
            console.log("ERROR: we aren't playing a game! -> back to the station!");
            goToView("station");
        }
    }
}

var RunCurrentGameWorld = function () {
    curPlayer.gameworlds[curPlayer.playing].update(worldView, tstep);
    minerHealthProg.max = curPlayer.gameworlds[curPlayer.playing].miner.getMaxHealth();
    minerHealthProg.value = curPlayer.gameworlds[curPlayer.playing].miner.curHP;
    minerMoneyProg.value = curPlayer.gameworlds[curPlayer.playing].miner.money;
    minerMoneyProg.max = curPlayer.gameworlds[curPlayer.playing].miner.getMaxMoney();

    minerHealthDiv.innerHTML = curPlayer.gameworlds[curPlayer.playing].miner.curHP;
    minerMoneyDiv.innerHTML = curPlayer.gameworlds[curPlayer.playing].miner.money;
}

var init = function () {
    // Connect Interface Elements
    // Divs
    welcomeDiv = document.getElementById("welcome-div");
    stationDiv = document.getElementById("station-div");
    gameworldDiv = document.getElementById("gameworld-div");
    interfaceDivs.push(welcomeDiv, stationDiv, gameworldDiv);
    gameworldListDiv = document.getElementById("gameworld-list-div");
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
        if (curPlayer) { curPlayer.gameworlds.push(new Gameworld(15)); goToView("station"); }
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
    curPlayer.gameworlds[curPlayer.playing].selected[event.target.name]++;
    goToActionState();
}

var clickController = function (event) {
    var click = { x: (event.x - event.target.offsetLeft), y: (event.y - event.target.offsetTop), radius: 0 };
    if (curPlayer.gameworlds[curPlayer.playing].actionState == ActionState.NONE || curPlayer.gameworlds[curPlayer.playing].actionState == ActionState.SELECTED) {
        console.log("tried to select unit");
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
            console.log("tried to unselect a unit");
            curPlayer.gameworlds[curPlayer.playing].actionState = ActionState.NONE;
            curPlayer.gameworlds[curPlayer.playing].selected = null;
            goToActionState();
        }
    }

    else if (curPlayer.gameworlds[curPlayer.playing].actionState == ActionState.BUILDING) {
        //check if there are enough resources to place a turret!
        if (curPlayer.gameworlds[curPlayer.playing].miner.money >= 100) {
            //check if it collides with anything!
            if (curPlayer.gameworlds[curPlayer.playing].checkClickCollision(curPlayer.gameworlds[curPlayer.playing].building) == null) {
                curPlayer.gameworlds[curPlayer.playing].turrets.push(new Turret(click.x, click.y));
                curPlayer.gameworlds[curPlayer.playing].miner.money -= 100;
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