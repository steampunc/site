
var canvas=document.getElementById("display");
var ctx=canvas.getContext("2d");
var canvasOffset=$("#display").offset();
var offsetX=canvasOffset.left;
var offsetY=canvasOffset.top;
var tolerance=50;
var dragging=false;
var rightClick=false;
var px = 0;
var py = 0;
var EXP = 2.71828;
var density = canvas.width / 2;
var length = 4;

function sorter(p1, p2) {
    return p1.x - p2.x;
}


class Point {
    constructor(x, y, draggable) {
	this.x = x;
	this.y = y;
	this.draggable = draggable;
    }
}

class Line {
    constructor(width, height) {
	this.height = height;
	this.width = width;
	this.pointList = [new Point(0, height / 2, false), 
	    new Point(width / 3, height / 2, true),
	    new Point(width / 3, height / 3, true),
	    new Point(width * 2 / 3, height / 3, true),
	    new Point(width * 2 / 3, height / 2, true),
	    new Point(width, height / 2, false)];
    }

    deletePoint(point) {
	var copy = [];
	for (var i = 0; i < this.pointList.length; i++) {
	    if (this.pointList[i] != point) {
		copy.push(this.pointList[i]);
	    }
	}
	this.pointList = copy;
    }

    doClick(x, y, right) {
	this.closestP = this.getClosestPoint(x, y); 
	if (right) {
	    if (this.closestP[1] < tolerance) {
		this.deletePoint(this.closestP[0]);
	    }
	} else {
	    if (this.closestP[1] > tolerance) {
		this.pointList.push(new Point(x, y, true));
		this.closestP = this.getClosestPoint(x, y);
	    }
	}
	this.pointList.sort(sorter);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	this.draw();
	
    }

    doDrag(x, y, right) {
	if (right) {
	    this.closestP = this.getClosestPoint(x, y);
	    if (this.closestP[1] < tolerance) {
		this.deletePoint(this.closestP[0]);
	    }
	} else {
	    this.closestP[0].x = x;
	    this.closestP[0].y = y;
	}
	this.pointList.sort(sorter);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	this.draw();
    }

    getClosestPoint(x, y) {
	var closest = null;
	var cDist = Number.MAX_SAFE_INTEGER;
	for (var i = 0; i < this.pointList.length; i++) {
	    var pt = this.pointList[i];
	    if (pt.draggable) {
		var dist = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));
		if (dist < cDist) {
		    closest = pt;
		    cDist = dist;
		}
	    }
	}
	return [closest, cDist];
    }

    drawSegment(p1, p2) {
	ctx.beginPath();
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.stroke();
    }

    draw() {
	for (var i = 0; i < this.pointList.length - 1; i++) {
	    this.drawSegment(this.pointList[i], this.pointList[i + 1]);	    
	}
    }

    asPotential(x) {
	return 0;
    }

}

class Wavefunction {
    constructor() {
	this.wf = [];
	for (var x = 0; x < density; x++) {
	    var pos = (x / density - 1/2);
	    var width = 0.01;
	    this.wf.push(10 * Math.pow(EXP, - pos * pos / width));
	    this.dt = 0.5;
	    this.time = 0;
	}
    }

    evolve() {
	var prev = this.wf[1];
	if (this.time < 1) {
	    prev = 10 * Math.pow(EXP, 2 - this.time * this.time);
	}
	
	var prevstep = 0;
	var makesmall = false
	for (var i = 1; i < this.wf.length; i++) {
	    var mid = this.wf[i];
	    var next = this.wf[i+1];
	    if (next == null) {
		next = prev;
	    }
	    var step = (2 * mid - next - prev) * this.dt;
	    this.wf[i] += -step;
	    prev = mid;
	}
	this.time += 0.001;
    }

    displayProbs() {
	var stretch = canvas.width / density;
	for (var i = 0; i < this.wf.length; i++) {
	    ctx.fillRect(stretch * i, canvas.height / 2 - (this.wf[i] * this.wf[i]), stretch, 1);
	}
    }
}

function handleMouseDown(e){
    canMouseX=parseInt(e.clientX-offsetX);
    canMouseY=parseInt(e.clientY-offsetY);
    px = canMouseX;
    py = canMouseY;
    dragging = true;
    rightClick = e.which == 3;
    lines.doClick(canMouseX, canMouseY, rightClick);
}

function handleMouseUp(e){
    canMouseX=parseInt(e.clientX-offsetX);
    canMouseY=parseInt(e.clientY-offsetY);
    dragging = false;
}

function handleMouseOut(e){
    canMouseX=parseInt(e.clientX-offsetX);
    canMouseY=parseInt(e.clientY-offsetY);
    dragging = false;
}

function handleMouseMove(e){
    canMouseX=parseInt(e.clientX-offsetX);
    canMouseY=parseInt(e.clientY-offsetY);
    if (dragging) {
	lines.doDrag(canMouseX, canMouseY, rightClick);
    }
}

var lines = new Line(canvas.width, canvas.height);
lines.draw();
var wavefunction = new Wavefunction();
wavefunction.displayProbs();


$("#display").mousedown(function(e){handleMouseDown(e);});
$("#display").mousemove(function(e){handleMouseMove(e);});
$("#display").mouseup(function(e){handleMouseUp(e);});
$("#display").mouseout(function(e){handleMouseOut(e);});
$("#fire").click(function() {
    wavefunction.time = 0;
    setInterval(function () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	lines.draw();
	wavefunction.evolve();
	wavefunction.displayProbs();
    }, 0.001);
});
