// JavaScript source code
var Player = function (name) {
    // Username and other basic info
    this.username = name;

    // Current Station details
    this.money = 0;
    
    // Current game world details
    this.gameworlds = []; // all game worlds active - deactivate when miner is destroyed
    this.playing = null;  // the current game world that needs to be drawn and interacted with 
}