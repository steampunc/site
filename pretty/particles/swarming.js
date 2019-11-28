
const frequency = 0.001;
var canvas_width = 100;
var canvas_height = 100;
var cohesionRadius = 70;
var separationDistance = 60;
var max_v = 4000;

class Vector2d {
	constructor(x, y) {
		if (x != null) {
			this.x = x;
		} else {
			this.x = 0;
		}
		if (y != null) {
			this.y = y;
		} else {
			this.y = 0;
		}
		
	}

	add(vector) {
		return new Vector2d(this.x + vector.x, this.y + vector.y);
	}

	scale(value) {
		return new Vector2d(this.x * value, this.y * value);
	}

	addD(vector) {
		this.x = this.x + vector.x;
		this.y = this.y + vector.y;
	}

	scaleD(value) {
		this.x = this.x * value;
		this.y = this.y * value;
	}

	magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	toAngle() {
		var ang = Math.acos(this.x/this.magnitude()) * 180/Math.PI;
		if (this.y < 0) {
			return ang + 180;
		} else {
			return ang;
		}
	}
}


class Particle {
	constructor(position) {
		if (position != null) {
			this.position = position;
		} else {
			this.position = new Vector2d(Math.random() * canvas_width, Math.random() * canvas_height);
		}
		this.velocity = new Vector2d((5000 - Math.random() * 10000), 5000 - Math.random() * 10000);
		this.escapingSwarm = false;
		this.inSwarmTimer = 0;
		this.color = 0;
	}

	update() {
		if (this.inSwarmTimer > 2000 && !this.escapingSwarm) {
			this.escapingSwarm = true;
			this.velocity = new Vector2d(this.velocity.x + 5000 - Math.random() * 10000, this.velocity.y + 5000 - Math.random() * 10000);
		}
		if (!this.escapingSwarm) {
			var cohesion = new Vector2d();
			var alignment = new Vector2d();
			var separation = new Vector2d();
			var separations = 0;
			var num = 1;

			for (var i = 0; i < particles.length; i++) {
				var dist = this.position.add(particles[i].position.scale(-1));
				if (dist.magnitude() < cohesionRadius && dist.magnitude() > 0.1) {
					cohesion.addD(particles[i].position);
					alignment.addD(particles[i].velocity);
					if (dist.magnitude() < separationDistance) {
						separation.add(dist.scale(1 / dist.magnitude()));
						separations++;
					}
					num++;
					this.inSwarmTimer++;
				}
			}

			cohesion.scaleD(1 / num);
			cohesion.addD(this.position.scale(-1));
			if (cohesion.magnitude() > max_v) {
				cohesion.scaleD(max_v / cohesion.magnitude());
			}

			alignment.scaleD(1 / num);
			if (alignment.magnitude() > max_v) {
				alignment.scaleD(max_v / alignment.magnitude());
			}

			if (separations > 0) {
				separation.scaleD( 1 / separations);
				if (separation.magnitude() > max_v) {
					separation.scaleD(max_v / separation.magnitude());
				}
			}
			this.velocity = this.velocity.add(cohesion.scale(1)).add(alignment.scale(1.5)).add(separation.scale(10));
		} else {
			this.inSwarmTimer--;
			if(this.inSwarmTimer <= 1950) {
				this.escapingSwarm = false;
				this.inSwarmTimer = 0;
			}
		}
		if (this.velocity.magnitude() > max_v) {
			this.velocity.scaleD(max_v / this.velocity.magnitude());
		}

		this.position = this.position.add(this.velocity.scale(frequency));

		if (this.position.x < 0 || this.position.x > canvas_width) {
			this.position.x = (this.position.x + 3 * canvas_width) % canvas_width;
		}
		if (this.position.y < 0 || this.position.y > canvas_height) {
			this.position.y = (this.position.y + 3 * canvas_height) % canvas_height;
		}
	}

	render(ctx, time) {
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = "hsl(" + this.velocity.toAngle() % 360 + ", 100%, 50%)";
		ctx.fillRect(this.position.x, this.position.y, 4, 4);
	}
}

var particles = [];


$(document).ready(function() {
	var canvas = document.getElementById('swarm');
	var ctx = canvas.getContext('2d');
	var scale = 0.999;
	ctx.canvas.width = window.innerWidth * scale;
	ctx.canvas.height = window.innerHeight * scale;
	canvas_width = window.innerWidth * scale;
	canvas_height = window.innerHeight * scale;
	for (var i = 0; i < 1000; i++) {
		particles.push(new Particle());
	}

	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	var counter = 0;
	setInterval(function () {
		for (var i = 0; i < particles.length; i++) {
			particles[i].update();
			particles[i].render(ctx, counter / 7);
		}
		ctx.globalAlpha = 0.1;
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		counter++;
	}, frequency * 1000);
});
