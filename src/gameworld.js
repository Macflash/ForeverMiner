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
    this.moneyToTransfer = 0;
    this.currentTime = 0;
    this.map = new Map(size);
    this.enemies = [];
    this.turrets = [];
    this.projectiles = [];
    this.running = 0;
    this.lastPlayedTime = null;
    this.actionState = ActionState.NONE;
    this.building = null;
    this.selected = null;
    this.lost = false;
    this.depth = 0;

    //place miner somewhere
    this.miner = new Miner(Math.random() * size * TILESIZE, Math.random() * size * TILESIZE);

    this.startPlaying = function (c, tstep) {
        if (this.lost) { return false; }
        if (this.lastPlayedTime != null) {
            //run until we catch up or until the base is destroyed
            var d = new Date();
            console.log("its been " + (d.getTime() - this.lastPlayedTime) / 1000 + " seconds since you last played");
            this.catchUpToNow(this.lastPlayedTime, tstep);
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

    this.catchUpToNow = function (curGameTime, tstep) {
        console.log("catchin up....");
        var d = new Date();
        var startTime = d.getTime();
        while (curGameTime < d.getTime() && !this.lost) {
            this.updateUnits(tstep);
            curGameTime += tstep;
        }
        console.log("caught up! it took " + (startTime - d.getTime()) / 1000 + " seconds");
    };

    this.updateUnits = function (tstep) {
        //go through all the units and call their update functions

        // enemies
        // spawn chance is like depth / 1000000 kind of...
        var r = Math.pow(.999, Math.log(this.depth + 1));
        //console.log(r);
        if ( Math.random() > r) {
            var tx = Math.random() * TILESIZE * this.map.size;
            var ty = Math.random() * TILESIZE * this.map.size;
            if (Math.abs(this.miner.x, tx) > Math.abs(this.miner.y, ty)) {
                tx = 0;
            }
            else {
                ty = 0;
            }

            //console.log("spawned enemy! " + tx + "," + ty);
            this.enemies.push(new Enemy(tx, ty));
        }
        for (var e in this.enemies) {
            this.enemies[e].update(tstep, this.miner);
        }
        // turrets
        for (var t in this.turrets) {
            var bullet = this.turrets[t].update(tstep, this.enemies);
            if (bullet != null) {
                this.projectiles.push(bullet);
            }
        }
        // projectiles
        for (var p in this.projectiles) {
            this.projectiles[p].update(tstep);
        }

        // check collisions!
        for (var p in this.projectiles) {
            for (var e in this.enemies) {
                if (Collision(this.projectiles[p], this.enemies[e])) {
                    //console.log("collision!" + this.enemies[e].curHP);
                    this.enemies[e].curHP -= this.projectiles[p].damage;
                    this.projectiles.splice(p, 1);
                    if (this.enemies[e].curHP <= 0) {
                        //console.log("dead!");
                        this.enemies.splice(e,1);
                    }
                    break;
                }
            }
        }

        for (var e in this.enemies) {
            if (Collision(this.miner, this.enemies[e])) {
                this.miner.curHP -= this.enemies[e].damage * 10;
                this.enemies.splice(e, 1);
            }
        }

        // miner
        this.depth = this.miner.update(tstep);
        if (this.depth == -1) {
            //the game is over!
            this.lost = true;
            this.stopPlaying();
        }
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
        this.drawUnits(c, this.turrets);

        //draw the miner
        this.miner.draw(c);
        
        this.drawUnits(c, this.enemies);

        this.drawUnits(c, this.projectiles);

        // draw whats being built
        if (this.actionState == ActionState.BUILDING) {
            this.building.draw(c);
        }
        if (this.actionState == ActionState.SELECTED) {
            //this.selected.highlight(c); // this doesnt exist right now...
        }
    };

    this.drawUnits = function (c, units) {
        for(var k in units){
            units[k].draw(c);
        }
    };

    this.checkClickCollision = function (click) {
        if(Collision(click, this.miner)){
            return this.miner;
        }
        for (var k in this.turrets) {
            if (Collision(click, this.turrets[k])) {
                return this.turrets[k];
            }
        }
        for (var k in this.enemies) {
            if (Collision(click, this.enemies[k])) {
                return this.enemies[k];
            }
        }
        return null;
    }
}