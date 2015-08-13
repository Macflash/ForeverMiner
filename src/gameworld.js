// JavaScript source code
var TILESIZE = 25;

var ActionState = { NONE: "none", BUILDING: "building", SELECTED: "selected" };

var Map = function (size) {
    this.tiles = [];
    this.size = size;
    for (var i = 0; i < size; i++) {
        this.tiles[i] = [];
    }
    this.draw = function (c) {
        for (var i = 0; i < this.size; i++) {
            for (var j = 0; j < this.size; j++) {
                c.drawBox(i * TILESIZE, j * TILESIZE, TILESIZE);
            }
        }
    }
}

var Gameworld = function (size) {
    this.currentTime = 0;
    this.map = new Map(size);
    this.enemies = [];
    this.turrets = [];
    this.running = 0;
    this.lastPlayedTime = null;
    this.actionState = ActionState.NONE;
    this.building = null;
    this.selected = null;

    //place miner somewhere
    this.miner = new Miner(Math.random() * size * TILESIZE, Math.random() * size * TILESIZE);

    this.startPlaying = function (c, tstep) {
        if (this.lastPlayedTime != null) {
            //run until we catch up or until the base is destroyed
            var d = new Date();
            console.log("its been " + (d.getTime() - this.lastPlayedTime)/ 1000 + " seconds since you last played");
        }
        this.update(c, tstep);
        this.running = setInterval("RunCurrentGameWorld()", tstep);
    };

    this.stopPlaying = function () {
        if (this.running) {
            console.log("stopped playing");
            clearInterval(this.running);
            this.lastPlayedTime = new Date().getTime();
            this.running = 0;
        }
        else { console.log("ERROR: This game was not running but tried to stop"); }
    };

    this.catchUpToNow = function (curTime, tstep) {

    };

    this.updateUnits = function (tstep) {
        //go through all the units and call their update functions
    };

    this.update = function (c, tstep) {
        // tstep is the time to advance by

        //update the game world
        this.updateUnits(tstep);

        //draw current gameworld
        this.draw(c);
    };

    this.draw = function (c) {
        c.clear();

        //draw map
        this.map.draw(c);

        //draw units
        this.drawUnits(c, this.enemies);
        this.drawUnits(c, this.turrets);

        //draw the miner
        this.miner.draw(c);
        
        // draw whats being built
        if (this.actionState == ActionState.BUILDING) {
            this.building.draw(c);
        }
        if (this.actionState == ActionState.SELECTED) {
            this.selected.highlight(c); // this doesnt exist right now...
        }
    };

    this.drawUnits = function (c, units) {
        for(var k in units){
            units[k].draw(c);
        }
    };
}