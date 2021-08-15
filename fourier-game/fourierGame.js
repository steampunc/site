
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
    constructor(x, y) {
    	this.start = [x, y];
	this.points = [this.start];
    }

    add(x, y) {
    	this.points.push([x, y]);	
	if (this.points.length > 700) {
	    this.points.shift();
	}
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

$(document).on('input', '.slider', function() {
    var id = $(this).attr("id"); 
    mags[id] = $(this).val();
    var passedMags = [...mags]
    circle = new Circler(canvas.width / 2, canvas.height / 2, passedMags.shift(), 0.1, 1, passedMags);
});

$("#num-sliders").on("input", function () {
    mags = []
    var num_circles = $("#num-sliders").val()
    $("#num-indicator").text(num_circles);
    $("#sliderholder").empty();   
    for (var i = 1; i <= num_circles; i++) {
	$("#sliderholder").append("<tr><td>Magnitude of F" + i + ': <input type="range" class="slider" id="' + i + '" min="-100" max="100"></td></tr>');
	mags.push(30);
    }
    circle = new Circler(canvas.width / 2, canvas.height / 2, mags.shift(), 0.1, 1, mags);
});



class Circler {
    constructor(x, y, radius, ang_vel, n, mags) {
	this.x = x;
	this.y = y;
	this.r = mags.shift();
	this.w = ang_vel * n;
	this.theta = 0;
	if (this.r <= 0) {
	    this.r = Math.abs(this.r);
	    this.theta = Math.PI;
	}

	if (mags.length > 0) {
	    this.child = new Circler(x + this.r * Math.cos(this.theta), y + this.r * Math.sin(this.theta), radius / 2, ang_vel, n + 1, mags);
	} else {
	    this.path = new Path(x + this.r * Math.cos(this.theta), y + this.r * Math.sin(this.theta));
	}
    }

    update(x, y) {
	this.x = x;
	this.y = y;
    }

    process() {
	ctx.lineWidth = 1;
	this.theta += this.w * deltaT;
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

var mags = [200, 100, -50];
var circle = new Circler(canvas.width / 2, canvas.height / 2, 200, 0.1, 1, mags);

var currRun = setInterval(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circle.process();
}, 10);
