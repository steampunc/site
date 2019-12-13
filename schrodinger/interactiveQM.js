
var canvas=document.getElementById("display");
var ctx=canvas.getContext("2d");
var canvasOffset=$("#display").offset();
var offsetX=canvasOffset.left;
var offsetY=canvasOffset.top;
var tolerance=50;
var errorTol = 0.001;
var dragging=false;
var rightClick=false;
var px = 0;
var py = 0;
var EXP = 2.71828;
var density = canvas.width / 10;
var stretch = canvas.width / density;

function sorter(p1, p2) {
    return p1.x - p2.x;
}

class Point {
    constructor(x, y, draggable) {
	this.x = Math.floor(x);
	this.y = Math.floor(y);
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

    asWavefunction(x) {
	var array = [];
	var p1 = this.pointList[0];
	var p2 = this.pointList[1];
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

    add(cNum) {
	return new Complex(this.r + cNum.r, this.im + cNum.im);
    }

    addInv(cNum) {
	return new Complex(this.r - cNum.im, this.im + cNum.r);
	
    }

    sub(cNum) {
	return new Complex(this.r - cNum.r, this.im - cNum.im);
    }

    multiply(num) {
	return new Complex(this.r * num, this.im * num);
    }

    dot(cNum) {
	return this.r * cNum.r + this.im * cNum.im;
    }

    copy() {
	return new Complex(this.r, this.im);
    }
}

function plotArray(array, height, scale) {
    for (var i = 0; i < density + 1; i++) {
	var p1 = new Point(stretch * i, canvas.height * height - scale * array[i]);
	var p2 = new Point(stretch * (i + 1), canvas.height * height - scale * array[i + 1]);
	lines.drawSegment(p1, p2);
    }

}


class Wavefunction {
    constructor() {
	this.wf = [];
	var sum = 0;
	for (var x = 0; x < density + 1; x++) {
	    var pos = (x / density - 1/2);
	    var width = 0.01;
	    //this.wf.push(new Complex(Math.sin(x * 3.1415926 / density), 0));
	    //this.wf.push(new Complex(Math.pow(EXP, - pos * pos / width), 0));
	    var coord = ((x * 10 / density) - 0.9) * 2;
	    this.wf.push(new Complex(Math.pow(EXP, - coord * coord), Math.pow(EXP, -coord * coord)));
	    this.time = 0;
	    this.dt = 1.0;
	    sum += this.wf[x].mag();
	}

	for (var i = 0; i < density + 1; i++) {
	    this.wf[i] = this.wf[i].multiply(1/sum);    
	}
    }

    secDer(wf, i, diff, scale) {
	var nums = [];
	var lower = -2;
	var upper = 2;
	if (i == 0) {
	    lower = 0;
	    var d = wf[0].sub(wf[1]);
	    var left = wf[0].add(d);
	    nums.push(left.add(d));
	    nums.push(left);
	}
	if (i == 1) {
	    var left = wf[0].add(wf[0].sub(wf[1]));
	    nums.push(left);
	    lower = -1;
	}
	if (i == density - 1) {
	    upper = 1;
	    
	}
	if (i == density) {
	    upper = 0;
	}
	for (var j = lower; j <= upper; j++) {
	    var d = new Complex(0, 0);
	    if (diff != 0) {
		d = diff[i + j];
	    }
	    nums.push(wf[i + j].addInv(d));
	}
	if (upper == 0) {
	    var d = wf[i].sub(wf[i-1]);
	    var right = wf[i].add(d);
	    nums.push(right);
	    nums.push(right.add(d));
	} else if (upper == 1) {
	    var d = wf[i + 1].sub(wf[i]);
	    var right = wf[i + 1].add(d);
	    nums.push(right);
	}

	return this.calcSecDir(nums).multiply(scale * 1/density);
    }

    calcSecDir(nums) {
	var ll = nums[0].multiply(-1);
	var l = nums[1].multiply(16);
	var m = nums[2].multiply(-30);
	var r = nums[3].multiply(16);
	var rr = nums[4].multiply(-1);
	var ld = nums[0].add(nums[2]).add(nums[1].multiply(-2));
	var rd = nums[4].add(nums[2]).add(nums[3].multiply(-2));
	var md = nums[1].add(nums[3]).add(nums[2].multiply(-2));
	var fd = (ll.add(l).add(m).add(r).add(rr)).multiply(1/12);
	return md;
    }

    smoothify(array) {
	var window = [array[0], array[1], array[2]];
	var smoothed = [array[0]];
	for (var i = 1; i < array.length - 2; i++) {
	    smoothed.push(this.avg(window));
	    window.shift();
	    window.push(array[i + 2]);
	}
	smoothed.push(this.avg(window));
	smoothed.push(array[array.length - 1]);
	console.log(smoothed);
	return smoothed;
    }

    avg(arr) {
	var a = new Complex(0, 0);
	for (var i = 0; i < arr.length; i++) {
	    a = a.add(arr[i]);
	}
	return a.multiply(1/arr.length);
    }

    evolve() {
	// Using a super simple runge-kutta numerical approximation of second order
	var k1 = [];
	var dbg = [];
	var k2 = [];
	var tempWf = [];
	for (var i = 0; i < density + 1; i++) {
	    k1.push(this.secDer(this.wf, i, 0, 1).multiply(this.dt));
	}
	k1 = this.smoothify(k1);
	for (var i = 0; i < density + 1; i++) {
	    k2.push(this.secDer(this.wf, i, k1, 1).multiply(this.dt));
	}
	k2 = this.smoothify(k2);
	var sum = 0;
	// Calculate steps;
	for (var i = 0; i < density + 1; i++) {
	    var heun = (k1[i].add(k2[i])).multiply(0.5);
	    dbg.push(heun.r);
	    var euler = k1[i]
	    var heunDiff = this.wf[i].addInv(heun).multiply(0.999);
	    var eulerDiff = this.wf[i].addInv(euler);
	    var error = heunDiff.sub(eulerDiff).mag();
	    if (error > errorTol) {
		console.log("Adjusting error");
		this.dt = 0.9 * this.dt * Math.min(
		    Math.max(Math.sqrt(errorTol / (2 * error)), 0.3), 1.3)
		this.evolve();
		return;
	    } else {
		tempWf.push(heunDiff);
		sum += heunDiff.mag();
	    }
	}
	this.dt = 0.9 * this.dt * Math.min(
	    Math.max(Math.sqrt(errorTol / (2 * error)), 0.3), 1.3)
	this.wf = tempWf;
	// Renormalize
	for (var i = 0; i < density + 1; i++) {
	    this.wf[i] = this.wf[i].multiply(1/Math.sqrt(sum));    
	}
	console.log(sum);
	this.time += this.dt;
    }

    display(prob) {
	var mags = [];
	for (var i = 0; i < this.wf.length; i++) {
	    mags.push(Math.pow(this.wf[i].mag(), 2));
	}
	var scale = canvas.height / (2.5 * Math.max.apply(Math, mags));

	for (var i = 0; i < this.wf.length; i++) {
	    if (i < this.wf.length - 1) {
		if (prob) {
		    var p1 = new Point(stretch * i, canvas.height / 2 - scale * mags[i]);
		    var p2 = new Point(stretch * (i + 1), canvas.height / 2 - scale * mags[i + 1]);
		    lines.drawSegment(p1, p2);
		} else {
		    var p1 = new Point(stretch * i, canvas.height / 2 - 10 * Math.sqrt(scale) * this.wf[i].r);
		    var p2 = new Point(stretch * (i + 1), canvas.height / 2 - 10 * Math.sqrt(scale) * this.wf[i + 1].r);
		    lines.drawSegment(p1, p2);
		}
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

var showingProbs = false;
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
    waveFunction = new Wavefunction();
    console.log("RESET");
    clearInterval(currRun);
    currRun = setInterval(function() {
	wavefunction.evolve();
	redraw();
    }, 1);
});
