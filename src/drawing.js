// JavaScript source code
class WorldView {
    constructor(scale, centerX, centerY, canvas, context) {
        this.scale = scale;
        this.centerX = centerX;
        this.centerY = centerY;
        this.canvas = canvas;
        this.context = context;

        this.clear = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            //this.drawCircle(10, "black", 0, 0);
        };

        this.worldToCanvas = function (worldX, worldY) {
            return { x: this.scale * (worldX - (this.centerX)) + (this.canvas.width / 2), y: this.scale * (worldY - (this.centerY)) + (this.canvas.height / 2) };
        };

        this.drawCircle = function (color, radius, worldX, worldY) {
            var c = this.worldToCanvas(worldX, worldY);
            this.context.beginPath();
            this.context.arc(c.x, c.y, radius * this.scale, 0, 2 * Math.PI, false);
            this.context.fillStyle = color;
            this.context.fill();
        };

        this.makeRot = function (dir) {
            //this.context.setTransform()
        };

        this.drawRect = function (worldX, worldY, w, h, rotation, color) {
            var c = this.worldToCanvas(worldX, worldY);
            this.context.beginPath();
            this.context.lineWidth = 1;
            this.context.strokeStyle = "black";
            this.context.rect(c.x, c.y, w * this.scale, h * this.scale);
            if (color) {
                this.context.fillStyle = color;
                this.context.fill();
            }
            this.context.stroke();
        };
        this.drawBox = function (worldX, worldY, size) {
            var c = this.worldToCanvas(worldX, worldY);
            this.context.beginPath();
            this.context.lineWidth = 1;
            this.context.strokeStyle = "black";
            this.context.rect(c.x, c.y, size * this.scale, size * this.scale);
            this.context.stroke();
        };
    }
    
    fill(color){
        this.context.fillStyle = color;
        this.context.rect(0,0,this.canvas.width, this.canvas.height);
        this.context.fill();
    }
}

var Dist = function (e1, e2) {
    return Math.sqrt(Math.pow(e1.x - e2.x, 2) + Math.pow(e1.y - e2.y, 2));
}

var DirFromXY = function (x, y) {
    return Math.atan(y / x);
}

var XYFromDir = function (dir) {
    return { x: Math.cos(dir), y: Math.sin(dir) };
}

var DirToTarget = function (e1, e2) {
    if (e1.x < e2.x) {
        return DirFromXY(e1.x - e2.x, e1.y - e2.y);
    }
    else {
        return DirFromXY(e1.x - e2.x, e1.y - e2.y) + Math.PI;
    }
}

var Collision = function (e1, e2) {
    if (Dist(e1, e2) < (e1.radius + e2.radius)) {
        return true;
    }
    else { return false; }
}