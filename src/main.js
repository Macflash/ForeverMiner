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
var targetFrameRate = 20;
var tstep = 1000 / targetFrameRate;

/* ------------------------------
            USER INFORMATION
   ------------------------------ */
var curPlayer;

var playWorld = function (event) {
    //console.log(event.target.value);
    curPlayer.playing = event.target.value;
    goToView("gameworld");
    //alert("want to play world " + event);
}

var goToActionState = function (state) {
    if (state == ActionState.NONE) {
        //we should see the build button, or be able to click, no cancel button
        gameworldCancelButton.style.display = "none";
        buildButton.style.display = "block";
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

var init = function () {
    // Connect Interface Elements
    // Divs
    welcomeDiv = document.getElementById("welcome-div");
    stationDiv = document.getElementById("station-div");
    gameworldDiv = document.getElementById("gameworld-div");
    interfaceDivs.push(welcomeDiv, stationDiv, gameworldDiv);
    gameworldListDiv = document.getElementById("gameworld-list-div");

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

    // Set up canvas and worldview
    var canvas = document.getElementById("gameworld-canvas");
    canvas.addEventListener("click", clickController);
    canvas.addEventListener("mousemove", hoverController);
    var context = canvas.getContext("2d");
    worldView = new worldView(1,250,250, canvas, context);

    //this is where we would handle cookie stuff.... but for now lets ignore that!
    goToView();
    curPlayer = new Player("tom");
}

var clickController = function (event) {
    console.log("click: " + event.x + "," + event.y);
}

// used for showing units before building
var curMouseX = 0;
var curMouseY = 0;
var hoverController = function (event) {
    curMouseX = event.x;
    curMouseY = event.y;
}