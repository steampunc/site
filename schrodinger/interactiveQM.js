
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
var density = canvas.width / 3;
var stretch = canvas.width / density;

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
	/*    new Point(width / 3, height / 2, true),
	    new Point(width / 3, height / 3, true),
	    new Point(width * 2 / 3, height / 3, true),
	    new Point(width * 2 / 3, height / 2, true), */
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

class Complex {
    constructor(r, im) {
	this.r = r;
	this.im = im;
    }
    
    mag() {
	return Math.sqrt(this.r * this.r + this.im * this.im);
    }

    conj() {
	return new Complex(this.r, -this.im);
    }

    add(num) {
	return new Complex(this.r + num.r, this.im + num.im);
    }

    multiply(num) {
	return new Complex(this.r * num, this.im * num);
    }
}

class Wavefunction {
    constructor() {
	this.wf = [];
	for (var x = 0; x < density; x++) {
	    var pos = (x / density - 1/2);
	    var width = 0.01;
	    //this.wf.push(new Complex(Math.sin(x * 3.1415926 / density), 0));
	    this.wf.push(new Complex(Math.pow(EXP, - pos * pos / width), 0));
	    //var coord = ((x * 10 / density) - 0.9) * 2;
	    //this.wf.push(new Complex(Math.pow(EXP, - coord * coord), Math.pow(EXP, -coord * coord)));
	    this.time = 0;
	}
    }

    evolve() {
	var newWf = [];
	for (var i = 0; i < density; i++) {
	    var step = 0; 
	    if (i == 0) {
		step = this.wf[i + 1].add(this.wf[i + 1]).add(this.wf[i].multiply(-2).multiply(0.5)); 
	    } else if (i == density - 1) {
		step = this.wf[i - 1].add(this.wf[i - 1]).add(this.wf[i].multiply(-2).multiply(0.5)); 
	    } else {
		step = this.wf[i - 1].add(this.wf[i + 1]).add(this.wf[i].multiply(-2).multiply(0.5)); 
	    }
	    step = step.multiply(0.01);
	    newWf.push(this.wf[i].add(new Complex(-step.im, step.r)));	    
	}
	newWf.push(newWf[density - 1]);
	this.wf = newWf;
	this.time += 0.01;
    }

    display(prob) {
	var mags = [];
	for (var i = 0; i < this.wf.length; i++) {
	    mags.push(Math.pow(this.wf[i].mag(), 2));
	}
	var scale = canvas.height / (2.5 * Math.max.apply(Math, mags));

	for (var i = 0; i < this.wf.length - 1; i++) {
	    if (prob) {
		var p1 = new Point(stretch * i, canvas.height / 2 - 70 * mags[i]);
		var p2 = new Point(stretch * (i + 1), canvas.height / 2 - 70 * mags[i + 1]);
		lines.drawSegment(p1, p2);
	    } else {
		var p1 = new Point(stretch * i, canvas.height / 2 - scale * this.wf[i].r);
		var p2 = new Point(stretch * (i + 1), canvas.height / 2 - scale * this.wf[i + 1].r);
		lines.drawSegment(p1, p2);
	    }
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
var wavefunction = new Wavefunction();

var showingProbs = true;
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.draw();
    wavefunction.display(showingProbs);
}

redraw();



$("#display").mousedown(function(e){handleMouseDown(e);});
$("#display").mousemove(function(e){handleMouseMove(e);});
$("#display").mouseup(function(e){handleMouseUp(e);});
$("#display").mouseout(function(e){handleMouseOut(e);});

$("#dispProbs").click(function() {
    showingProbs = !showingProbs;    
    redraw();
});

var currRun = null;
$("#fire").click(function() {
    clearInterval(currRun);
    wavefunction = new Wavefunction();
    wavefunction.time = 0;
    currRun = setInterval(function () {
	wavefunction.evolve();
	redraw();
    }, 0.01);
});
