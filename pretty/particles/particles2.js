
const frequency = 0.001;
var canvas_width = 100;
var canvas_height = 100;

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
		this.velocity[0] = this.velocity[0] * 0.999;
		this.velocity[1] = this.velocity[1] * 0.999;

		this.position[0] += this.velocity[0] * frequency;
		this.position[1] += this.velocity[1] * frequency;

		this.position[0] = this.position[0] % canvas_width;
		this.position[1] = this.position[1] % canvas_height;
	}

	render(ctx, brightness) {
		ctx.globalAlpha = (brightness) / 441;
		ctx.fillStyle = "hsl(" + Math.sqrt((this.velocity[0] * this.velocity[0]) + (this.velocity[1] * this.velocity[1])) + ", " + (441 - brightness) / 4.41 + "%, 50%)";
		ctx.fillRect(this.position[0], this.position[1], 1, 1);
		ctx.globalAlpha = 1.0;

	}
}

$(document).ready(function() {
	var img_canvas = document.getElementById('filler');
	var context = img_canvas.getContext('2d');
	var canvas = document.getElementById('particles');
	var img = new Image();
	img.src = "baby.jpeg";
	img.onload = function() {

		canvas.width = img.width;
		canvas.height = img.height;
		canvas_width = canvas.width;
		canvas_height = canvas.height;

		var ctx = canvas.getContext('2d');

		context.drawImage(img, 0, 0);
		ctx.drawImage(img, 0, 0);


		var particles = [];
		for (var i = 0; i < 1500; i++) {
			particles.push(new Particle());
		}
		$( ".filler" ).hide();
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		setInterval(function () {
			for (var i = 0; i < 1500; i++) {
				ctx.globalAlpha = 0.000001;
				ctx.fillStyle = "#000000";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.globalAlpha = 1;
				var p = context.getImageData(particles[i].position[0], particles[i].position[1], 1, 1).data; 
				var brightness = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
				var velocity = [(Math.random() - 0.5) * brightness* 100, (Math.random() - 0.5) * brightness* 100]; 
				particles[i].update(velocity);
				particles[i].render(ctx, brightness);
			}
		}, frequency * 1000);
	}
});
