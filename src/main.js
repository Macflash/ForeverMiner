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

/* ------------------------------
            USER INFORMATION
   ------------------------------ */
var curPlayer;


var playWorld = function (num) {
    alert("want to play world " + num);
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
                var newbtn = document.createElement("input");
                newbtn.type = "button";
                newbtn.value = "Play";
                newbtn.onclick = function () { playWorld(k); };
                newdiv.textContent = "World " + k;
                newdiv.appendChild(newbtn);
                gameworldListDiv.appendChild(newdiv);
            }
        }
    }
    else if (view == "gameworld") {
        gameworldDiv.style.display = "block";
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
    playButton.onclick = function () { goToView("station") };
    backToMenuButton.onclick = function () { goToView("welcome") };
    backToStationButton.onclick = function () { goToView("station") };
    startNewWorldButton.onclick = function () { curPlayer.gameworlds.push(new Gameworld(15)); goToView("station"); };

    goToView();

    //this is where we would handle cookie stuff.... but for now lets ignore that!
    curPlayer = new Player();

}