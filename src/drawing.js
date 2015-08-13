// JavaScript source code
function worldView(scale, centerX, centerY, canvas, context) {
    this.scale = scale;
    this.centerX = centerX;
    this.centerY = centerY;
    this.canvas = canvas;
    this.context = context;

    this.worldToCanvas = function (worldX, worldY) {
        return { x: this.scale * (worldX - (this.centerX)) + (this.canvas.width / 2), y: this.scale * (worldY - (this.centerY)) + (this.canvas.height / 2) };
    };

    this.drawCircle = function (radius, color, worldX, worldY) {
        var c = this.worldToCanvas(worldX, worldY);
        this.context.beginPath();
        this.context.arc(c.x, c.y, radius * this.scale, 0, 2 * Math.PI, false);
        this.context.fillStyle = color;
        this.context.fill();
    };

    this.makeRot = function (dir) {
        //this.context.setTransform()
    }

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