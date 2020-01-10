
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
var density = canvas.width / 50;
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

    draw() {
	for (var i = 0; i < this.pointList.length - 1; i++) {
	    drawSegment(this.pointList[i], this.pointList[i + 1]);	    
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

function drawSegment(p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}


function dispCArray(array, vertPos, scale) {
    var reals = [];
    for (var i = 0; i < array.length; i++) {
	reals.push(array[i].r);
    }
    displayArray(reals, vertPos, scale);
}

function displayDenseArray(array, vertPos, scale) {
    var step = array.length / canvas.width
    for (var i = 0; i < canvas.width; i++) {
	ctx.fillRect(i, canvas.height * (1 - vertPos) - array[Math.floor(step * i)] * scale, 1, 1);
    }
}

function displayArray(array, vertPos, scale) {
    var stretchingFactor = canvas.width / (array.length - 1);
    var step = 1;
    if (stretchingFactor <= 1) {
	displayDenseArray(array, vertPos, scale);	
	return;
    }
    for (var i = 0; i < array.length - 1; i += step) {
	var p1 = new Point(i * stretchingFactor, canvas.height * (1 - vertPos) - array[i] * scale, false);
	var p2 = new Point((i + 1) * stretchingFactor, canvas.height * (1 - vertPos) - array[i + 1] * scale, false);
	drawSegment(p1, p2);
    }
}

class Wavefunction {
    constructor(array) {
	this.wf = array;
	var sum = 0;
	for (var x = 0; x < density + 1; x++) {
	    this.time = 0;
	    this.dt = 1.0;
	    sum += this.wf[x].mag();
	}

	for (var i = 0; i < density + 1; i++) {
	    this.wf[i] = this.wf[i].multiply(1/sum);    
	}
    }

    setWf(array) {
	this.wf = array;
	var sum = 0;
	for (var i = 0; i < density + 1; i++) {
	    sum += this.wf[i].mag();
	}
	for (var i = 0; i < density + 1; i++) {
	    this.wf[i] = this.wf[i].multiply(1/sum);    
	}
    }

    secDer(wf, i, diff, scale) {
	var nums = [];
	var lower = -3;
	var upper = 3;
	if (i == 0) {
	    lower = 0;
	    var d = wf[0].sub(wf[1]);
	    var left = wf[0].add(d);
	    var lleft = left.add(d);
	    nums.push(lleft.add(d));
	    nums.push(lleft);
	    nums.push(left);
	}
	if (i == 1) {
	    var d = wf[0].sub(wf[1]);
	    var left = wf[0].add(wf[0].sub(wf[1]));
	    nums.push(left.add(d));
	    nums.push(left);
	    lower = -1;
	}
	if (i == 2) {
	    var left = wf[0].add(wf[0].sub(wf[1]));
	    nums.push(left);
	    lower = -2;
	}
	if (i == density - 2) {
	    upper = 2;

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
	    var rright = right.add(d);
	    nums.push(right);
	    nums.push(rright);
	    nums.push(rright.add(d));
	} else if (upper == 1) {
	    var d = wf[i + 1].sub(wf[i]);
	    var right = wf[i+1].add(d);
	    nums.push(right);
	    nums.push(right.add(d));
	} else if (upper == 2) {
	    var d = wf[i + 2].sub(wf[i + 1]);
	    var right = wf[i + 2].add(d);
	    nums.push(right);
	}

	return this.calcSecDir(nums).multiply(scale * 1/density);
    }

    calcSecDir(nums) {
	var lll = nums[0].multiply(2);
	var ll = nums[1].multiply(-27);
	var l = nums[2].multiply(270);
	var m = nums[3].multiply(-490);
	var r = nums[4].multiply(270);
	var rr = nums[5].multiply(-27);
	var rrr = nums[6].multiply(2);
	var fd = (lll.add(ll).add(l).add(m).add(r).add(rr).add(rrr)).multiply(1/180)
	var ffd = ((nums[1].multiply(-1)).add(nums[2].multiply(16)).add(nums[3].multiply(-30)).add(nums[4].multiply(16)).add(nums[5].multiply(-1))).multiply(1/12);
	return ffd;
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
	for (var i = 0; i < density + 1; i++) {
	    k2.push(this.secDer(this.wf, i, k1, 1).multiply(this.dt));
	}
	var sum = 0;
	// Calculate steps;
	for (var i = 0; i < density + 1; i++) {
	    var heun = (k1[i].add(k2[i])).multiply(0.5);
	    dbg.push(heun.r);
	    var euler = k1[i]
	    var heunDiff = this.wf[i].addInv(heun);
	    var eulerDiff = this.wf[i].addInv(euler);
	    var error = heunDiff.sub(eulerDiff).mag();
	    if (error > errorTol) {
		// Adjusting error and recalculating if it's too bad
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

	// Renormalize the wf
	for (var i = 0; i < density + 1; i++) {
	    this.wf[i] = this.wf[i].multiply(1/Math.sqrt(sum));    
	}

	this.time += this.dt;
    }

    display(prob) {
	var mags = [];
	for (var i = 0; i < this.wf.length; i++) {
	    mags.push(Math.pow(this.wf[i].mag(), 2));
	}
	var scale = canvas.height / (2.5 * Math.max.apply(Math, mags));
	if (prob) {
	    displayArray(mags, 0.5, scale);
	} else {
	    dispCArray(this.wf, 0.5, 10 * Math.sqrt(scale));
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
var gaussianCentered = [];
var gaussianOff = [];
var sine = [];
var fullsine = [];
for (var i = 0; i < density + 1; i++) {
    var pos = (i / density - 1/2);
    gaussianCentered.push(new Complex(Math.pow(EXP, - pos * pos / 0.01), 0));
    sine.push(new Complex(Math.sin(i * Math.PI / density), 0));
    fullsine.push(new Complex(Math.sin(2 * i * Math.PI / density), 0))
    var offsetCoord = ((i * 10 / density) - 0.9) * 2;
    gaussianOff.push(new Complex(Math.pow(EXP, - offsetCoord * offsetCoord), Math.pow(EXP, -offsetCoord * offsetCoord)));
}

var wfs = [['Centered "Gaussian"', gaussianCentered], ['Offset "Gaussian"', gaussianOff], ["Ground Frequency", sine], ["Second Frequency", fullsine]]
var currWf = 3;

var lines = new Line(canvas.width, canvas.height);
var wavefunction = new Wavefunction(wfs[currWf][1]);


function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.draw();
    wavefunction.display(showingProbs);
}

$("#display").mousedown(function(e){handleMouseDown(e);});
$("#display").mousemove(function(e){handleMouseMove(e);});
$("#display").mouseup(function(e){handleMouseUp(e);});
$("#display").mouseout(function(e){handleMouseOut(e);});

var showingProbs = true;
var currRun = null;

$("#dispProbs").click(function() {
    showingProbs = !showingProbs;    
    redraw();
    $(this).text(showingProbs ? "Click to display real component of wavefunction" : "Click to display probability");
});
$("#dispProbs").text(showingProbs ? "Click to display real component of wavefunction" : "Click to display probability");

$("#changeWavefunction").click(function() {
    clearInterval(currRun);
    currWf = (currWf + 1) % wfs.length;
    wavefunction = new Wavefunction(wfs[currWf][1]);
    $("#currWf").text("Current Wavefunction: " + wfs[currWf][0]);
    redraw();
});

$("#currWf").text("Current Wavefunction: " + wfs[currWf][0]);

redraw();
$("#fire").click(function() {
    clearInterval(currRun);
    wavefunction = new Wavefunction(wfs[currWf][1]);
    wavefunction.time = 0;
    clearInterval(currRun);
    currRun = setInterval(function() {
	wavefunction.evolve();
	redraw();
    }, 10);
});
