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

	rotate(angle) {
		var rad_ang = angle * Math.PI / 180.0;
		return new Vector2d(this.x * Math.cos(rad_ang) - this.y * Math.sin(rad_ang),
			this.x * Math.sin(rad_ang) + this.y * Math.cos(rad_ang));
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

	normalized() {
		return this.scale( 1 / this.magnitude());
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

class Turtle {
	constructor(direction, offset, centering) {
		this.position = new Vector2d(0.0, 0.0);
		this.direction = direction;
		this.position_buffer = [];
		this.color_buffer = [];
		this.stack = [];
		this.x_range = [];
		this.y_range = [];
		this.COM = new Vector2d(0.0, 0.0);
		this.centering = centering;
		this.color = 0.0;
		this.colorscale = 360.0;
		this.coloroffset = 180.0;
		this.offset = offset;
	}

	reset() {
		this.position = new Vector2d(0.0, 0.0);
		this.direction = new Vector2d(-1.0, 0).normalized();
		this.position_buffer = [];
		this.color_buffer = [];
		this.stack = [];
		this.x_range = [];
		this.y_range = [];
		this.COM = new Vector2d(0.0, 0.0);
	}

	randomize() {
		this.colorscale = Math.floor(Math.random() * 300);
		this.coloroffset = Math.floor(Math.random() * 300);
	}

	rotate(angle) {
		this.direction = this.direction.rotate(angle);
	}

	push() {
		this.stack.push([this.position, this.direction, this.color]);
	}

	pop() {
		var state = this.stack.pop();
		this.position = state[0];
		this.direction = state[1];
		this.color = state[2];
	}

	makeLine(dist) {
		var newPos = this.position.add(this.direction.scale(dist));
		this.position_buffer.push([this.position, newPos]);
		this.color += 1;
		this.color_buffer.push(this.color);
		if (this.x_range.length == 0) {
			this.x_range = [newPos.x, newPos.x];
			this.y_range = [newPos.y, newPos.y];
		}
		this.x_range = [Math.max(this.x_range[0], newPos.x), Math.min(this.x_range[1], newPos.x)];
		this.y_range = [Math.max(this.y_range[0], newPos.y), Math.min(this.y_range[1], newPos.y)];
		this.COM = this.COM.add(newPos);

		this.position = newPos;
	}

	render(ctx) {
		ctx.lineWidth = 2;
		ctx.strokeStyle = this.color;
		var scale = 1.0;
		var x_diff = (this.x_range[0] - this.x_range[1]);
		var y_diff = (this.y_range[0] - this.y_range[1]);
		if (this.centering == true) {

			this.COM = this.COM.scale(1/this.position_buffer.length);
			scale = 0.45 * Math.min(Math.min(Math.abs(window.innerWidth / (this.x_range[0] - this.COM.x)), Math.abs(window.innerWidth / (this.x_range[1] - this.COM.x))), Math.min(Math.abs(window.innerHeight / (this.y_range[0] - this.COM.y)), Math.abs(window.innerHeight / (this.y_range[1] - this.COM.y))));
			this.offset = new Vector2d(window.innerWidth / 2, window.innerHeight / 2).add(this.COM.scale(-scale));

		}
		var max_color = Math.max(...this.color_buffer);
		for (var i = 0; i < this.position_buffer.length; i++) {
			ctx.beginPath();
			var linecol = (this.color_buffer[i] * this.colorscale / max_color + this.coloroffset) % 360 
			ctx.strokeStyle = "hsl(" + linecol + ", 100%, 70%)";

			var start = this.position_buffer[i][0].scale(scale).add(this.offset);
			var end = this.position_buffer[i][1].scale(scale).add(this.offset);

			ctx.moveTo(start.x, start.y);
			ctx.lineTo(end.x, end.y);
			ctx.stroke();
		
		}
	
	}
}

class LSystem {
	constructor(alphabet, constants, axiom, rules, centering) {
		if (alphabet != null) {
			this.alph = alphabet;
		} else {
			this.alph = null;
		}
		if (axiom != null) {
			this.axiom = axiom;
		} else {
			this.axiom = null;
		}
		if (rules != null) {
			this.rules = rules
		} else {
			this.rules = null;
		}
		this.consts = constants;
		this.centering = centering;

		this.turtle = new Turtle(
			new Vector2d(-1.0, 0).normalized(),
			new Vector2d(window.innerWidth / 2, window.innerHeight / 2 ),
			this.centering
		);
		var angles = Object.keys(this.consts);
		this.angleDeltas = {}
		for (var i = 0; i < angles.length; i++) {
			this.angleDeltas[angles[i]] = Math.random() * 0.1
		}

	}

	randomize(alphabet) {
		this.turtle.randomize();
		var alphkeys = Object.keys(this.alph)
		var lines = [];
		var angles = [];
		for (var i = 0; i < alphkeys.length; i++) {
			var item = this.alph[alphkeys[i]]
			if (item == "line") {
				lines.push(alphkeys[i]);
			} else if (item == "rot") {
				angles.push(alphkeys[i]);
			}
		}
		var num_arms = [3, 4, 5, 6, 5, 6];
		var randomIndex = Math.floor(Math.random() * num_arms.length);
		var num_arms = num_arms[randomIndex];

		this.axiom = "p[F]"
		this.consts["c"] = 360 / num_arms

		for (var i = 0; i < num_arms - 1; i++) {
			this.axiom += "c[F]";
		}

		var samplingList = ["[", "[", "[", "["]
		samplingList.push(...lines);
		samplingList.push(...lines);
		samplingList.push(...lines);
		samplingList.push(...angles);
		console.log(samplingList);

		for (var i = 0; i < lines.length; i++) {
			this.rules[lines[i]] = lines[(i + 1) % lines.length];
			var ruleLen = Math.floor(Math.random() * 5 + 4);
			var needPop = 0;
			for (var j = 1; j < ruleLen; j++) {
				var randIndex = Math.floor(Math.random() * samplingList.length);
				var randElem = samplingList[randIndex];
				for (var k = 0; k < needPop; k++) {
					if (Math.random() > 0.4 * needPop) {
						randElem = "]-"
						needPop -= 1;
						j -= 1;
					}
				}
				if (randElem == "[") {
					needPop += 1;
				}
				this.rules[lines[i]] += randElem;
			}
			for (var j = 0; j < needPop; j++) {
				this.rules[lines[i]] += "]";
			}
		}
	}

	updateRules(rules) {
		this.rules = rules;
	}
	
	updateConstants(constants) {
		this.consts = constants
	}

	generate(depth, string) {
		if (string.length > 1000) { 
			console.log(string.length);
			return string; 
		}

		var newstring = "";
		for (let i = 0; i < string.length; i++)	{
			var ch = string[i];
			if (this.rules[ch] != null) {
				newstring += this.rules[ch]	
			} else {
				newstring += ch;
			}

		}
		return this.generate(depth - 1, newstring);
	}

	render(ctx) {
		this.turtle.reset()
		var system = this.generate(4, this.axiom)
		for (let i = 0; i < system.length; i++) {
			var alph_res = this.alph[system[i]];
			if (alph_res == "line") {
				this.turtle.makeLine(3);
			}
			if (alph_res == "push") {
				this.turtle.push();
			}
			if (alph_res == "pop") {
				this.turtle.pop();
			}
			if (alph_res == "rot") {
				var const_res = this.consts[system[i]];
				this.turtle.rotate(const_res);
			}
		}
		this.turtle.render(ctx)
	}

	varyTurtleParams() {
		turtle.color = "#ffffff"; 
	}

}


$(document).ready(function() {
	var canvas = document.getElementById("musicviz");
	var ctx = canvas.getContext('2d');

	/*var lsys = new LSystem({"F":"line", "G":"line", "+":"rot", "p":"rot", "-": "rot", "[":"push", "]":"pop"},
		{"+":90, "-":-90, "p":0}, 
		"pF",//p[-0]-[+0]+[+0]", 
		{"F":"F+G", "G":"F-G"},
		centering=true
	);*/
	
	var lsys = new LSystem({"F":"line", "G":"line", "c":"rot", "p":"rot", "+": "rot", "-":"rot", "[":"push", "]":"pop"},
		{"+":120, "-":-100, "c":0, "p":0}, 
		"",//p[-0]-[+0]+[+0]", 
		{"F":"F-[GqF]+GqF", "G":"F-G"},
		centering=true
	);
	lsys.randomize();
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	var frequency = 0.02;
	var bgcolor = 0;
	var counter = 0;
	var nextReset = Math.floor(Math.random() * 400 + 400);
	var dangles = [
		(Math.random() - 0.5) * 0.8,
		(Math.random() - 0.5) * 0.1,
		(Math.random() - 0.5) * 0.1,
		(Math.random() - 0.5) * 0.1,
	];
	var loop = function() {
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = "hsl(" + bgcolor + ", 80%, 4%)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		var newConsts = lsys.consts;
		// For the Serpinski Triangle depth 6
		// newConsts["p"] = newConsts["p"] - 1.82;
		newConsts["p"] = newConsts["p"] - dangles[0];
		newConsts["q"] = newConsts["c"] - dangles[1];
		newConsts["+"] = newConsts["+"] + dangles[2];
		newConsts["-"] = newConsts["-"] - dangles[3];
		

		lsys.updateConstants(newConsts);
		lsys.render(ctx);

		bgcolor += 0.2;
		bgcolor = bgcolor % 360;
		counter += 1;
		if (counter > nextReset) {
			dangles = [
				(Math.random() - 0.5) * 0.8,
				(Math.random() - 0.5) * 0.1,
				(Math.random() - 0.5) * 0.1,
				(Math.random() - 0.5) * 0.1,
			];
			counter = 0;
			nextReset = Math.floor(Math.random() * 400 + 400);
			lsys.randomize();
		}
		setTimeout(loop, 10);
	};
	loop();
});
