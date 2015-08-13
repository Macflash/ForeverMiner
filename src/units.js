// JavaScript source code

var Radius = {PROJECTILE: 3, TURRET: 15, MINER: 30, ENEMY: 10};

var Projectile = function (x, y, dir, stats) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = 1;
    this.damage = 1;
    this.splash = 1;
    this.augment = null;
    this.radius = Radius.PROJECTILE;
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

    // AUGMENT SLOT
    this.augment = null;

    // WORLD INFO
    this.x = x;
    this.y = y;
    this.dir = 0;
    this.radius = Radius.TURRET;

    this.draw = function (c) {
        c.drawCircle("red", this.radius, this.x, this.y);
    }
}

var Enemy = function (x, y) {
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
}

var Miner = function (x, y) {
    // EXP AND LEVEL
    this.level = 0;
    this.curHP = 1;

    // CORE STAT LEVELS
    this.speed = 1; // how fast it mines minerals
    this.storage = 1; // how much it can store at one time
    this.transfer = 1; // how fast it can transfer minerals to orbit
    this.health = 1;
    this.armor = 1;

    // AUGMENT SLOT
    this.augment = null;

    // WORLD INFO
    this.x = x;
    this.y = y;
    this.radius = Radius.MINER;
    this.draw = function (c) {
        c.drawCircle("gray", this.radius, this.x, this.y);
    };
}