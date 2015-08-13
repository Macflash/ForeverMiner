// JavaScript source code
var TILESIZE = 25;

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

    //place miner somewhere
    this.miner = new Miner(Math.random() * size * TILESIZE, Math.random() * size * TILESIZE);

    this.update = function (t) {
        // t is the time to advance by
    }

    this.draw = function (c) {
        c.clear();
        //draw map
        this.map.draw(c);

        //draw units
        this.drawUnits(c, this.enemies);
        this.drawUnits(c, this.turrets);

        //draw the miner
        this.miner.draw(c);
    };

    this.drawUnits = function (c, units) {
        for(var k in units){
            k.draw(c);
        }
    };
}