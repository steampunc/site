var mtools = new MusicTools();
var num_voices = 4;
var bpm = 120;

console.log(mtools.step("C4", -7));

function UpdateLoop(chords) {
	chord_notes = [];
	voices = [];
	for (var i = 0; i < chords.length; i++) {
		chord_notes[i] = mtools.chordNotes(chords[i]);
	}

	for (var i = 0; i < num_voices; i++) {
		voices.push([]);
	}

	// Restrictions 
	// - No overlapping of voices
	// - The order of precedence is that 1, 5, 3, (7), repeat
	
	// To simplify, we'll always start with the bass line on the 1 of the chord
	console.log(voices);
	
	for (var voice_index = 0; voice_index < num_voices; voice_index++) {
		
		voices[voice_index][0] = 0;
		for (var i = 1; i < chord_notes.length; i++) {


		}
	}

	console.log(voices);
	
	
}

function Visualize(current_notes) {
	ctx.drawImage(img, 0, 0);
	ctx.fillStyle = 'gray';
	for (var i = 0; i < current_notes.length; i++) {
		ctx.fillRect(mtools.noteToNumber(current_notes[i]) - 107, 4, 12, img.height - 8);
	}
	
}

function MakeLoop(notes) {
	var played_all_notes = false;
	let loop = new Tone.Loop(time => {
		if (played_all_notes) {
			piano.stop();
		}
		for (var i = 0; i < notes.length; i++) {
			piano.play(notes[i]);
		}
		played_all_notes = true;
	}, "1m");
	return loop;
}

var chords = ["Dm", "Am", "E", "Am"];

$(document).ready(function() {
	Tone.Transport.bpm.value = bpm;
	UpdateLoop(chords);

	var canvas = document.getElementById("piano-viz");
	var ctx = canvas.getContext('2d');
	var img = new Image();
	img.src = 'piano.jpg';

	img.onload = function() {
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);
	};

	$("#chords").on("keydown",function (event) {
		if(event.key === 'Enter') {
			chords = $("#chords").val().replace(/\s+/g, '').split(",");
			UpdateLoop(chords);
			console.log(chords);
		}
	});

	Soundfont.instrument(new AudioContext(), 'acoustic_grand_piano').then(function (piano) {
		piano.play("B3");
		
		Tone.Transport.start("+0.01");

	});
});
