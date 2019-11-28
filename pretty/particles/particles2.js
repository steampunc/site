
const frequency = 0.001;
var canvas_width = 100;
var canvas_height = 100;
var img = new Image();
img.src = "https://images.unsplash.com/photo-1485423036251-8b2a2909899f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80";

class Particle {
	constructor(position) {
		if (position != null) {
			this.position = position;
		} else {
			this.position = [Math.random() * canvas_width, Math.random() * canvas_height];
		}
		this.velocity = [0, 0];
	}

	update(accel) {

		if (accel != null) {
			this.velocity[0] += accel[0] * frequency; 
			this.velocity[1] += accel[1] * frequency; 
		} else {
			this.velocity[0] += (Math.random() - 0.5) * 100; 
			this.velocity[1] += (Math.random() - 0.5) * 100; 
		}

		this.position[0] += this.velocity[0] * frequency;
		this.position[1] += this.velocity[1] * frequency;

		this.position[0] = this.position[0] % canvas_width;
		this.position[1] = this.position[1] % canvas_height;
	}

	render(ctx) {
		ctx.globalAlpha = 0.1;
		ctx.fillStyle = "hsl(" + Math.sqrt((this.velocity[0] * this.velocity[0]) + (this.velocity[1] * this.velocity[1])) + ", 99%, 50%)";
		ctx.fillRect(this.position[0], this.position[1], 1, 1);
		ctx.globalAlpha = 1.0;

	}
}

$(document).ready(function() {
	var img_canvas = document.createElement('canvas');
	var context = img_canvas.getContext('2d');
	var canvas = document.getElementById('particles');
	canvas_width = canvas.width;
	canvas_height = canvas.height;
	var ctx = canvas.getContext('2d');

	context.drawImage(img, 0, 0);
  	console.log(context.getImageData(1, 2, 1, 1).data);

	var particles = [];
	for (var i = 0; i < 1000; i++) {
		particles.push(new Particle());
	}
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	setInterval(function () {
		for (var i = 0; i < 1000; i++) {
			particles[i].update();
			particles[i].render(ctx);
		}
	}, frequency * 1000);
});
