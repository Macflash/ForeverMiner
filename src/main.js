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

// Game Canvas
var worldView;

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
            curPlayer.gameworlds[curPlayer.playing].draw(worldView);
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

    // Button Clicks
    clearButton.onclick = function () { curPlayer = new Player(); goToView();}
    playButton.onclick = function () { goToView("station") };
    backToMenuButton.onclick = function () { goToView("welcome") };
    backToStationButton.onclick = function () { curPlayer.playing = null; goToView("station"); };
    startNewWorldButton.onclick = function () {
        if (curPlayer) { curPlayer.gameworlds.push(new Gameworld(15)); goToView("station"); }
        else { alert("no player!");}
    };
    var canvas = document.getElementById("gameworld-canvas");
    var context = canvas.getContext("2d");
    worldView = new worldView(1,250,250, canvas, context);

    //this is where we would handle cookie stuff.... but for now lets ignore that!
    goToView();
    curPlayer = new Player("tom");
}