
const height = 50
const width = 50

function randint(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1)) + min;

}

function getdirection() {
	var direction = [0, 0]
	while ((direction[0] == 0) && (direction[1] == 0)) {
		direction[0] = randint(-1, 1)
		direction[1] = randint(-1, 1)
	}
	return direction

}

$(document).ready(function() {
	var canvas = document.getElementById('stepping');
	var ctx = canvas.getContext('2d');

	var matrix = []
	for (var i = 0; i < height; i++) {
		matrix[i] = []
		for (var j = 0; j < width; j++) {
			matrix[i][j] = randint(0, 1);
		}
	}

	console.log(matrix);

	var scale_x = (canvas.width / width);
	var scale_y = (canvas.height / height);

	setInterval(function(){
		var x = randint(0, width - 1);
		var y = randint(0, height - 1);

		var direction = getdirection();

		while ((direction[0] + x >= width) || (direction[1] + y >= height) || (direction[0] + x < 0) || (direction[1] + y < 0)) {
			direction = getdirection();
		} 

		matrix[x][y] = matrix[x + direction[0]][y + direction[1]];
		for (var i = 0; i < height; i++) {
			for (var j = 0; j < width; j++) {
				if (matrix[i][j] == 1) {
					ctx.fillStyle = "black";
					ctx.fillRect(i * scale_x, j * scale_y , scale_x , scale_y);
				} else {
					ctx.fillStyle = "white";
					ctx.fillRect(i * scale_x, j * scale_y , scale_x , scale_y);
				}
			}
	}
	}, 0);


});

