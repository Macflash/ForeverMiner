// JavaScript source code
var TILESIZE = 10;

var Map = function (size) {
    this.tiles = [];
    this.size = size;
    for (var i = 0; i < size; i++) {
        tiles[i] = [];
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

    this.draw = function (c) {
        //draw map
        this.map.draw(c);

    }
}