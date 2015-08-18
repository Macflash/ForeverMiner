// JavaScript source code

var Radius = {PROJECTILE: 3, TURRET: 15, MINER: 30, ENEMY: 10};

var Explosion = function (x, y, r, dmg) {
    this.x = x;
    this.y = y;
    this.radius = r;
    this.damage = dmg;
    this.firstHit = null;
    this.exploded = false; // only check damage before it exploded, afterwards its just playing an animation
    this.animationCounter = 0;
    this.maxAnimation = .5;
    this.donePlaying = false;
    this.update = function (tstep) {
        if (!this.exploded) {
            this.exploded = true;
        }
        else if (this.exploded) {
            this.animationCounter += 1 / tstep;
            if (this.animationCounter > this.maxAnimation) {
                this.donePlaying = true;
            }
        }
    }
    this.draw = function (c) {
        if (this.exploded) {
            c.drawCircle("orange", this.radius, this.x, this.y);
        }
        else {
            c.drawCircle("black", this.radius, this.x, this.y);
        }
        //c.drawCircle("rgba(150,50,0," + (250 * (this.maxAnimation - this.animationCounter)) + ")", this.radius, this.x, this.y);
    }
}

var Projectile = function (x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = 1;
    this.damage = 1;
    this.splash = 0;
    this.augment = null;
    this.radius = Radius.PROJECTILE;
    this.upgradable = [];

    this.makeExplosion = function () {
        var expl = new Explosion(this.x, this.y, 5 * Math.pow(1.5, this.splash), .5 * this.splash);
        return expl;
    }

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
    this.splash = 0; //how big the splash is and how much it does

    this.upgradable = ["speed", "precision", "damage", "splash"];

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
        if (curPlayer.gameworlds[curPlayer.playing].selected == this) {
            c.drawCircle("lightblue", this.radius + 3, this.x, this.y);
        }
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
                    var noise = Math.random() - .5;
                    noise *= .3;
                    noise /= Math.pow(.9, this.precision);
                    var bdir = this.dir + noise;
                    var bullet = new Projectile(this.x, this.y, bdir);
                    bullet.damage = Math.pow(1.2, this.damage);
                    bullet.splash = this.splash;
                    bullet.speed = Math.pow(1.01, this.precision);
                    return bullet;
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

    this.upgradable = [];

    this.draw = function (c) {
        if (curPlayer.gameworlds[curPlayer.playing].selected == this) {
            c.drawCircle("lightblue", this.radius + 3, this.x, this.y);
        }
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
    this.moneyTransfered = 0;

    // CORE STAT LEVELS
    this.speed = 1; // how fast it mines minerals
    this.storage = 1; // how much it can store at one time
    this.transfer = 1; // how fast it can transfer minerals to orbit
    this.health = 1;
    this.armor = 1;

    this.upgradable = ["speed", "storage", "transfer", "health", "armor"];

    this.miningDepth = 1;
    this.curMiningProgress = 0;
    this.curTransferProgress = 0;

    // AUGMENT SLOT
    this.augment = null;

    // WORLD INFO
    this.x = x;
    this.y = y;
    this.radius = Radius.MINER;
    this.draw = function (c) {
        if (curPlayer.gameworlds[curPlayer.playing].selected == this) {
            c.drawCircle("lightblue", this.radius + 3, this.x, this.y);
        }
        c.drawCircle("gray", this.radius, this.x, this.y);
    };
    this.getMaxMoney = function () {
        return 100 * Math.pow(2, this.storage) + this.getTransferAmt() + 1;
    };
    this.getMaxHealth = function () {
        return 100 * Math.pow(1.1, this.health);
    };
    this.getTransferAmt = function (){
        return .5 * Math.pow(2, this.transfer);
    };
    //returns the depth? for enemy difficulty?
    this.update = function (tstep) {
        //check if we are not dead
        if (this.curHP <= 0) {
            console.log("miner died: game over!");
            //alert("gameover!");
            return -1;
        }
        // if we have space for more money
        if (this.money < this.getMaxMoney()) {
            this.curMiningProgress += tstep * Math.pow(2, this.speed);
        }
        if (this.curMiningProgress > this.miningDepth) {
            this.curMiningProgress -= this.miningDepth;
            this.miningDepth++;
            this.money += 1;
        }

        this.curTransferProgress++;
        if (this.money > 0 && this.curTransferProgress > 100) {
            //transfer some money
            var amt = this.getTransferAmt();
            this.moneyTransfered += amt;
            this.money -= amt;
            this.curTransferProgress = 0;
        }

        return this.miningDepth;
    }
}