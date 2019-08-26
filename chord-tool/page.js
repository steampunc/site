"use strict";

var chord_indices = [...data_indices];
const arrSum = arr => arr.reduce((a,b) => a + b, 0);
function divide(array, divisor) {
	let divided = []
	for (let i = 0; i < array.length; i++) {
		divided.push(array[i] / divisor);
	}
	return divided;
}

function remove_nth(matr, i) {
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
	let row_index = chord_indices.indexOf(chord);
	let row_probs = matr[row_index];
	chord = getRandomItem(chord_indices, row_probs); 
	return chord;
}

function getPath(prev_stop, dest) {
	if (prev_stop[dest] == null) {
		return []
	}
	let path = getPath(prev_stop, prev_stop[dest])
	path.push(chord_indices[dest]);
	return path;
}

function min_dist(to_visit, distances) {
	let min_distance = Infinity;
	let min_index = null;
	to_visit.forEach(function(node_index) {
		if (distances[node_index] < min_distance) {
			min_distance = distances[node_index];
			min_index = node_index;
		}

	});
	return min_index;
}

var dijkstra = function (matr, source, dest) {
	let distances = new Array(matr.length).fill(Infinity);
	let prev_stop = new Array(matr.length).fill(null);
	let to_visit = [];

	for (let i = 0; i < matr.length; i++) {
		to_visit.push(i);
	}

	distances[source] = 0;


	while (to_visit.length > 0) {
		let current_node = min_dist(to_visit, distances);
		to_visit.splice(to_visit.indexOf(current_node), 1);

		to_visit.forEach(function(neighbor) {
			let alternative_dist = distances[current_node] + matr[current_node][neighbor];
			if (alternative_dist < distances[neighbor]) {
				distances[neighbor] = alternative_dist;
				prev_stop[neighbor] = current_node;
			}
		});
	}

	return getPath(prev_stop, dest);
};

let common_chords = "A, B, C, D, E, F, G, A#, Ab, B#, Bb, C#, Cb, D#, Db, E#, Eb, F#, Fb, G#, Gb, Am, Bm, Cm, Dm, Em, Fm, Gm, A#m, Abm, B#m, Bbm, C#m, Cbm, D#m, Dbm, E#m, Ebm, F#m, Fbm, G#m, Gbm";

let markov_app = new Vue({
	el: "#markov-app",
	data: {
		chords: [],
		avoids: null,
		init_chord: null,
		dest_chord: null,
		ignore_clicked: false,
		num_chords: 10,
	},
	methods: {
		clicked_check: function() {
			if (!this.ignore_clicked) {
				if (this.avoids) {
					this.avoids = this.avoids + ", " + common_chords;
				} else {
					this.avoids = common_chords;
				}
			} else {
				this.avoids = null;
			}
		},
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
				let index = chord_indices.indexOf(avoid_chords[av_i]);
				if (index >= 0) {
					matrix = remove_nth(matrix, index);
					chord_indices.splice(index, 1);
				}
			}

			let norms = [];
			for (let row_index = 0; row_index < matrix.length; row_index++) {
				norms.push(arrSum(matrix[row_index]));
			}

			if (this.dest_chord != null && this.dest_chord != "") {
				if (chord_indices.includes(this.dest_chord) && chord_indices.includes(this.init_chord)) {
					for (let row_index = 0; row_index < matrix.length; row_index++) {
						for (let cell_index = 0; cell_index < matrix[0].length; cell_index++) { 
							matrix[row_index][cell_index] =  1 / ((matrix[row_index][cell_index] / norms[row_index]) + 0.00001);
						}
					}
					let path = dijkstra(matrix, chord_indices.indexOf(this.init_chord), chord_indices.indexOf(this.dest_chord));
					path.unshift(this.init_chord);
					this.chords = [...path];
				} else {
					this.chords = ["Hey! I need an initial chord and a final chord that exist, ya doofus!"];
				}
			} else {

				let norm_matr = [];
				for (let row_index = 0; row_index < matrix.length; row_index++) {
					norm_matr.push(divide(matrix[row_index], norms[row_index]));
				}

				if (this.init_chord && chord_indices.includes(this.init_chord)) {
					this.chords = [this.init_chord];
					let current_chord = this.init_chord;
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
			}

		},
	},
});
