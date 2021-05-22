
var canvas=document.getElementById("display");
var ctx=canvas.getContext("2d");
ctx.fillStyle = "#ff0000"
var deltaT = 0.1 

function drawCircle(x, y, radius, angle) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
    ctx.arc(x, y, radius, angle, angle + 2 * Math.PI);
    ctx.stroke();
}

function drawPoint(x, y, radius, angle) {
    ctx.beginPath();
    ctx.fillRect(x + radius * Math.cos(angle), y + radius * Math.sin(angle), 2, 2);
}

function drawLine(p1, p2) {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
}

function drawCursor(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
}

class Path {
    constructor(x, y, persist) {
    	this.start = [x, y];
	this.persist = persist;
	this.points = [this.start];
    }

    add(x, y) {
    	this.points.push([x, y]);	
    }

    draw() {
    	for (var i = 0; i < this.points.length - 1; i++) {
	    drawLine(this.points[i], this.points[i + 1]);
	}
    }

    reset(x, y) {
    	this.points = [[x, y]];
    }

}

class Circler {
    constructor(x, y, radius, ang_vel, n) {
	this.x = x;
	this.y = y;
	this.r = radius;
	this.w = ang_vel;
	this.theta = 0;
	console.log(radius)

	if (n > 0 && radius > 30) {
	    this.child = new Circler(x + this.r * Math.cos(this.theta), y + this.r * Math.sin(this.theta), radius / 2, ang_vel * 2, n - 1);
	} else {
	    this.path = new Path(x + this.r * Math.cos(this.theta), y + this.r * Math.sin(this.theta), true);
	}
    }

    update(x, y) {
	this.x = x;
	this.y = y;
    }


    process() {
	ctx.lineWidth = 1;
	this.theta += this.w * deltaT;
	console.log(this.theta);
	ctx.fillStyle = "hsl(" + this.theta / Math.PI * 180 % 360 + ", 100%, 50%)";
	drawCircle(this.x, this.y, this.r, this.theta);
	var newPos = [this.x + this.r * Math.cos(this.theta), this.y + this.r * Math.sin(this.theta)];
	if (this.child != null) {
	    this.child.update(newPos[0], newPos[1]);
	    this.child.process();
	} else {
	    this.path.add(newPos[0], newPos[1]);
	    this.path.draw();
	}
    }
}

var circle = new Circler(canvas.width / 2, canvas.height / 2, 200, 0.1, 10);

var currRun = setInterval(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circle.process();
}, 10);
