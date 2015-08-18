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
    this.explosions = [];
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
            this.catchUpToNow(d.getTime(), tstep);
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
        //console.log("catchin up....");
        while (this.lastPlayedTime < curGameTime && !this.lost) {
            this.updateUnits(tstep);
            this.lastPlayedTime += tstep;
        }
        //console.log("caught up! it took " + (startTime - d.getTime()) / 1000 + " seconds");
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

        for (var e in this.explosions) {
            this.explosions[e].update(tstep);

            //remove the explosion if it is done playing its animation
            if(this.explosions[e].donePlaying){
                this.explosions.splice(e,1);
            }
        }

        // check collisions!
        for (var p in this.projectiles) {
            for (var e in this.enemies) {
                if (Collision(this.projectiles[p], this.enemies[e])) {
                    //we had a bullet hit an enemy!
                    //check if we should spawn a splash particle!?
                    if (this.projectiles[p].splash > 0) {
                        var expl = this.projectiles[p].makeExplosion();
                        expl.firstHit = this.enemies[e];
                        this.explosions.push(expl);
                    }

                    this.enemies[e].curHP -= this.projectiles[p].damage;

                    //remove the projectile
                    this.projectiles.splice(p, 1);

                    //check if the enemy is dead
                    if (this.enemies[e].curHP <= 0) {
                        this.enemies.splice(e,1);
                    }

                    break;
                }
            }
        }

        for (var e in this.enemies) {
            for (var b in this.explosions) {
                if(this.explosions[b].exploded || this.explosions[b].firstHit == this.enemies[e]){continue;}
                else if(Collision(this.enemies[e], this.explosions[b])){
                    //do damage!
                    // todo, actually make each unit handle taking and calculating damage!
                    this.enemies[e].curHP -= this.explosions[b].damage;
                }
            }

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

        //draw the miner
        this.miner.draw(c);

        this.drawUnits(c, this.turrets);
        this.drawUnits(c, this.explosions);
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