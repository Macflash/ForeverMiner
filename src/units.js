// JavaScript source code

var Radius = {PROJECTILE: 3, TURRET: 15, MINER: 30, ENEMY: 10};

var Projectile = function (x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = 1;
    this.damage = 1;
    this.splash = 1;
    this.augment = null;
    this.radius = Radius.PROJECTILE;
    this.draw = function (c) {
        c.drawCircle("yellow", this.radius, this.x, this.y);
    }
    this.update = function (tstep) {
        var xy = XYFromDir(this.dir);
        this.x += xy.x * (this.speed / 5) * tstep;
        this.y += xy.y * (this.speed / 5) * tstep;
    }
}

var Turret = function (x, y) {
    // EXP AND LEVEL
    this.exp = 0;
    this.level = 0;

    // CORE STAT LEVELS
    this.speed = 1; //how fast you shoot
    this.precision = 1; //how far and accurate you shoot
    this.damage = 1; //how much you do to the first hit target
    this.splash = 1; //how big the splash is and how much it does

    this.curShotCounter = 0;

    // AUGMENT SLOT
    this.augment = null;

    // WORLD INFO
    this.x = x;
    this.y = y;
    this.dir = 0;
    this.radius = Radius.TURRET;

    this.getMaxRange = function () {
        return 100 * Math.pow(1.1, this.precision);
    }

    this.getMaxShotCounter = function () {
        return (500 * Math.pow(1.01, this.damage)) / Math.pow(1.1, this.speed);
    }

    this.draw = function (c) {
        c.drawCircle("green", this.radius, this.x, this.y);
    }

    this.update = function (tstep, enemies) {
        //increment shot timer
        this.curShotCounter += tstep;
        if (this.curShotCounter > this.getMaxShotCounter()) {
            //shoot at first enemy!
            for (var e in enemies) {
                if (Dist(this, enemies[e]) < this.getMaxRange()) {
                    this.curShotCounter = 0;
                    this.dir = DirToTarget(this, enemies[e]);
                    return new Projectile(this.x, this.y, this.dir);
                }
            }
        }
        return null;
    }

}

var Enemy = function (x, y) {
    this.x = x;
    this.y = y;

    // LEVEL
    this.level = 0;

    // CORE STAT LEVELS
    this.health = 1;
    this.dodge = 1;
    this.armor = 1;
    this.moveSpeed = 1;
    this.damage = 1;
    this.regen = 1;
    this.attackSpeed = 1;
    this.radius = Radius.ENEMY;
    this.curHP = 5;

    this.draw = function (c) {
        c.drawCircle("red", this.radius, this.x, this.y);
    }

    this.getMaxHealth = function () {
        return 5 * Math.pow(this.health);
    }

    this.update = function (tstep, miner) {
        var dist = Dist(this, miner);
        var dx = this.x - miner.x;
        var dy = this.y - miner.y;
        this.x -= (tstep * dx) / (dist * 30);
        this.y -= (tstep * dy) / (dist * 30);
    }
}

var Miner = function (x, y) {
    // EXP AND LEVEL
    this.level = 0;
    this.curHP = 100;
    this.money = 0;

    // CORE STAT LEVELS
    this.speed = 1; // how fast it mines minerals
    this.storage = 1; // how much it can store at one time
    this.transfer = 1; // how fast it can transfer minerals to orbit
    this.health = 1;
    this.armor = 1;

    this.miningDepth = 1;
    this.curMiningProgress = 0;

    // AUGMENT SLOT
    this.augment = null;

    // WORLD INFO
    this.x = x;
    this.y = y;
    this.radius = Radius.MINER;
    this.draw = function (c) {
        c.drawCircle("gray", this.radius, this.x, this.y);
    };
    this.getMaxMoney = function () {
        return 1000 * Math.pow(1.1, this.storage);
    };
    this.getMaxHealth = function () {
        return 100 * Math.pow(1.1, this.health);
    };
    //returns the depth? for enemy difficulty?
    this.update = function (tstep) {
        //check if we are not dead
        if (this.curHP <= 0) {
            alert("gameover!");
            return -1;
        }
        // if we have space for more money
        if (this.money < this.getMaxMoney()) {
            this.curMiningProgress += tstep * Math.pow(1.1, this.speed);
        }
        if (this.curMiningProgress > this.miningDepth) {
            this.curMiningProgress -= this.miningDepth;
            this.miningDepth++;
            this.money += 1;
        }
        return this.miningDepth;
    }
}