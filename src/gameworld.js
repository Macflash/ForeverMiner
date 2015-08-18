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
    this.totalTransferred = 0;
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
    this.depth = 1;
    this.spawnCounter = 0;

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
    
    this.getQuadrant = function (ix, iy) {
        var wh = TILESIZE * this.map.size;
        var x = ix - wh / 2;
        var y = iy - wh / 2;
        if (x < 0) {
            if (y < 0) { return 1; }
            else { return 2; }
        }
        else {
            if (y < 0) { return 3; }
            else { return 4; }
        }
    }

    this.spawnEnemy = function () {
        var wh = TILESIZE * this.map.size;
        var tx = Math.random() * wh;
        var ty = Math.random() * wh;
        // if the miner is near the center 1/3 all sides are fair game
        if (Dist(this.miner, { x: wh / 2, y: wh / 2 }) < (wh / 4)) {
            console.log("middle mode!")
            if (Math.random() > .5) {
                if (Math.random() > .5) {
                    tx = 0;
                }
                else {
                    tx = wh;
                }
            }
            else {
                if (Math.random() > .5) {
                    ty = 0;
                }
                else {
                    ty = wh;
                }
            }
            this.enemies.push(new Enemy(tx, ty));
        }
        else {
            // make sure the enemy doesn't spawn in the same quadrant
            if (this.getQuadrant(tx, ty) == this.getQuadrant(this.miner.x, this.miner.y)) {
                this.spawnEnemy();
            }
            else {
                var oldx = tx;
                var oldy = ty;
                //push it randomly out to a side, and make sure its still in the same quadrant
                if (Math.random() > .5) {
                    if (Math.random() > .5) {
                        tx = 0;
                    }
                    else {
                        tx = wh;
                    }
                }
                else {
                    if (Math.random() > .5) {
                        ty = 0;
                    }
                    else {
                        ty = wh;
                    }
                }
                if (this.getQuadrant(tx, ty) != this.getQuadrant(oldx, oldy)) {
                    this.spawnEnemy();
                }
                else {
                    this.enemies.push(new Enemy(tx, ty));
                }
            }
        }
    }

    this.updateUnits = function (tstep) {
        //go through all the units and call their update functions

        // enemies
        // spawn chance is like depth / 1000000 kind of...
        this.spawnCounter += Math.random() * Math.log(this.depth);

        //console.log(r);
        if (this.spawnCounter > 1000) {
            this.spawnCounter = 0;
            this.spawnEnemy();
        }

        for (var e in this.enemies) {
            this.enemies[e].update(tstep, this.miner);
        }
        // turrets
        for (var t in this.turrets) {
            var bullet = this.turrets[t].update(tstep, this.enemies, this.miner);
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
                        this.enemies.splice(e, 1);
                        this.miner.money += 5; // this should be adjusted somewhere
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