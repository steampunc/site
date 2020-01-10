// Copying some stuff from my QM thingy
var canvas=document.getElementById("display");
var ctx=canvas.getContext("2d");
var canvasOffset=$("#display").offset();
var offsetX=canvasOffset.left;
var offsetY=canvasOffset.top;
var tolerance=25;
var numDegrees = 3;
ctx.font= "1em Arial";

function prettify(coeffs) {
    var str = "y = " + coeffs[0].toFixed(3);
    for (var i = 1; i < coeffs.length; i++) {
	str += " + " + coeffs[i].toFixed(3) + " x ^ " + i;
    }
    return str;
}

class Point {
    constructor(x, y, draggable) {
	this.x = Math.floor(x);
	this.y = Math.floor(y);
	this.draggable = draggable;
	this.size = 6;
    }

    draw() {
	ctx.beginPath();
	ctx.rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
	ctx.fill();
	ctx.stroke();
    }
}

class PointSet {
    constructor(width, height) {
	this.height = height;
	this.width = width;
	this.pointList = [];
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
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < this.pointList.length; i++) {
	    this.pointList[i].draw();
	}
	this.interpolate(numDegrees);
    }

    interpolate(optdegree) {
	var matrix = [];
	var yvals = [];
	var degree = Math.min(optdegree, this.pointList.length - 1);
	for (var point = 0; point < this.pointList.length; point++) {
	    matrix.push([]);
	    yvals.push((canvas.height - this.pointList[point].y) / 100);
	    for (var i = 0; i <= degree; i++) {
		matrix[point].push(Math.pow(this.pointList[point].x / 100, i));
	    }
	}
	if (this.pointList.length > 0) {
	    var coeffs = math.multiply(math.inv(math.multiply(math.transpose(matrix), matrix)), math.multiply(math.transpose(matrix), yvals));
	    var niceString = prettify(coeffs);
	    ctx.fillText(niceString, 10, 20);
	    this.plotPolynom(coeffs);
	}
    }

    plotPolynom(coeffs) {
	ctx.beginPath();
	ctx.moveTo(0, canvas.height - coeffs[0] * 100);
	for (var x = 0; x < canvas.width; x+=5) {
	    var y = 0;
	    for (var pow = 0; pow < coeffs.length; pow++) {
		y += Math.pow(x / 100, pow) * coeffs[pow];
	    }
	    ctx.lineTo(x, canvas.height - y * 100);
	}
	ctx.stroke();
    }

}

var pointList = new PointSet(canvas.width, canvas.height);
var dragging = false;

function getCanvCoord(e) {
    var x;
    var y;
    if (e.pageX || e.pageY) { 
	x = e.pageX;
	y = e.pageY;
    }
    else { 
	x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
	y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
    } 
    x -= offsetX;
    y -= offsetY;
    return [x, y];
}

var coords = [0, 0];
function handleMouseDown(e){
    coords = getCanvCoord(e);
    dragging = true;
    rightClick = e.which == 3;
    pointList.doClick(coords[0], coords[1], rightClick);
}

function handleMouseUp(e){
    coords = getCanvCoord(e);
    dragging = false;
}

function handleMouseOut(e){
    coords = getCanvCoord(e);
    dragging = false;
}

function handleMouseMove(e){
    coords = getCanvCoord(e);
    if (dragging) {
	pointList.doDrag(coords[0], coords[1], rightClick);
    }
}

$("#display").mousedown(function(e){handleMouseDown(e);});
$("#display").mousemove(function(e){handleMouseMove(e);});
$("#display").mouseup(function(e){handleMouseUp(e);});
$("#display").mouseout(function(e){handleMouseOut(e);});

$("#degrees").val(numDegrees);
$("#degrees").change(function() {
    numDegrees = parseInt($("#degrees").val());
    pointList.draw();
});

$("#1random").click(function() {
    coords[0] = Math.floor((Math.random() * canvas.width) + 1);
    coords[1] = Math.floor((Math.random() * canvas.height) + 1);
    pointList.doClick(coords[0], coords[1], false);
});

$("#10random").click(function() {
    for (var i = 0; i < 10; i++) {
	coords[0] = Math.floor((Math.random() * canvas.width) + 1);
	coords[1] = Math.floor((Math.random() * canvas.height) + 1);
	pointList.doClick(coords[0], coords[1], false);
    }
});

$("#linear").click(function() {
    var num = 5;
    var extremum = -1;
    var slope = 0;
    var yInc = 0;
    while (extremum <= 0) {
	slope = (Math.random()-0.5);
	yInc = canvas.height / 2 + (Math.random() - 0.5) * canvas.height / 4; 
	extremum = canvas.width * slope + yInc;
    }
    for (var x = 0; x < canvas.width; x+= canvas.width / num) {
	pointList.doClick(x, x * slope + yInc, false);
    }
});

$("#gaussian").click(function() {
    var num = 70;
    for (var x = 0; x < canvas.width; x += canvas.width / num) {
	var y = canvas.height - Math.exp( - (x - canvas.width / 2) * (x - canvas.width / 2) / (canvas.width * 50)) * canvas.height * 2 / 3;
	pointList.doClick(x, y, false);
    }

});

$("#clear").click(function() {
    pointList = new PointSet(canvas.width, canvas.height);
    pointList.draw();
});
