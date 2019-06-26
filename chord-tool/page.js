
var chord_indices = [...data_indices];
const arrSum = arr => arr.reduce((a,b) => a + b, 0);
function divide(array, divisor) {
	divided = []
	for (let i = 0; i < array.length; i++) {
		divided.push(array[i] / divisor);
	}
	return divided;
}

function remove_nth(matr, i) {
	console.log(matr, i)
	matr.splice(i, 1);
	for (let j = 0; j < matr.length; j++) {
		matr[j].splice(i, 1);
	}
	return matr;
}

// These two functions are from http://codetheory.in/weighted-biased-random-number-generation-with-javascript-based-on-probability/
function rand(min, max) {
	return Math.random() * (max - min) + min;
}
 
var getRandomItem = function(list, weight) {
	var total_weight = weight.reduce(function (prev, cur, i, arr) {
		return prev + cur;
	});

	var random_num = rand(0, total_weight);
	var weight_sum = 0;
	//console.log(random_num)

	for (var i = 0; i < list.length; i++) {
		weight_sum += weight[i];
		weight_sum = +weight_sum.toFixed(2);

		if (random_num <= weight_sum) {

			return list[i];
		}
	}
}

var chooseRandom = function(matr, chord) {
	row_index = chord_indices.indexOf(chord);
	row_probs = matr[row_index];
	chord = getRandomItem(chord_indices, row_probs); 
	return chord;
}

let common_chords = ["C", "G", "D", "F", "A"];

let app = new Vue({
	el: "#suggestor-app",
	data: {
		chords: [],
		avoids: null,
		initial_chord: null,
		num_chords: 10,
	},
	methods: {
		generate: function() {
			let matrix = data_matrix.map(function(arr) {
				return [...arr];
			});
			chord_indices = [...data_indices];



			let avoid_chords = [];
			if (this.avoids) {
				avoid_chords = this.avoids.replace(/\s/g, '').split(",");	
			}

			for (let av_i = 0; av_i < avoid_chords.length; av_i++) {
				index = chord_indices.indexOf(avoid_chords[av_i]);
				if (index >= 0) {
					matrix = remove_nth(matrix, index);
					chord_indices.splice(index, 1);
				}
			}

			let norms = [];
			for (let row_index = 0; row_index < matrix.length; row_index++) {
				norms.push(arrSum(matrix[row_index]));
			}

			let norm_matr = [];
			for (let row_index = 0; row_index < matrix.length; row_index++) {
				norm_matr.push(divide(matrix[row_index], norms[row_index]));
			}

			if (this.initial_chord && chord_indices.includes(this.initial_chord)) {
			this.chords = [this.initial_chord];
			let current_chord = this.initial_chord;
			for (let i = 0; i < this.num_chords - 1; i++) {
				let temp_chord = null;
				while (!temp_chord) {
					temp_chord = chooseRandom(norm_matr, current_chord);
				}
				current_chord = temp_chord;
				this.chords.push(current_chord);
			}
			} else {
				this.chords = ["Hey! I need an initial chord that exists, ya doofus!"];
			}

		},
	},
});

