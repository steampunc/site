var chord_tool = new Chordify();
console.log(chord_tool.closestChordTone("A4", ["C", "E", "G"]));

var options =  {
	"oscillator" : {
		"type" : "sawtooth"
	},
	"envelope" : {
		"attack" : 0.1,
		"decay" : 0.1
	},
	volume: 1,
};


function GetNotes(chords) {
	var notes = chord_tool.getNotes(chords[0]);
	bass_notes = [notes[0] + 3];
	tenor_notes = [notes[1]+ 3]; 
	alto_notes = [notes[2]+ 4];
	soprano_notes = [];
	for (var i = 1; i < chords.length; i++) {
		notes = chord_tool.getNotes(chords[i]);

		bass_notes.push(chord_tool.closestChordTone(bass_notes[bass_notes.length - 1], notes[0]));
		tenor_notes.push(chord_tool.closestChordTone(tenor_notes[tenor_notes.length - 1], notes));
		alto_notes.push(chord_tool.closestChordTone(alto_notes[alto_notes.length - 1], notes));
		
	}
	return [bass_notes, tenor_notes, alto_notes, soprano_notes];
}

$(document).ready(function() {

	Soundfont.instrument(new AudioContext(), 'acoustic_grand_piano').then(function (piano) {
	var canvas = document.getElementById("piano-viz");
	var ctx = canvas.getContext('2d');
	var img = new Image();
	img.onload = function() {
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);
	};
	img.src = 'piano.jpg';

	let synth = new Tone.PolySynth(options);
	synth.toMaster();

	var chords = ["Dm", "C", "F", "G", "A#m", "C", "F", "A"];
	[bass_notes, tenor_notes, alto_notes, soprano_notes] = GetNotes(chords);
	console.log(bass_notes);
	console.log(tenor_notes);
	console.log(alto_notes);

		var happened = false;

	let loop = new Tone.Loop(time => {
		var notes = [bass_notes[Math.floor(time / 2) % chords.length], tenor_notes[Math.floor(time /2) % chords.length], alto_notes[Math.floor(time /2) % chords.length], soprano_notes[Math.floor(time /2) % chords.length]];
		if (happened) {
			console.log("Here");
			piano.stop();
		}
		for (var i = 0; i < notes.length; i++) {
			piano.play(notes[i]);
		}
		happened = true;
	}, "1m");
	

	Tone.Transport.scheduleRepeat(function(time){
		Tone.Draw.schedule(function(){
			// each note is 12 pixels wide
			var index = Math.floor(time/2) % chords.length;
			bass_pos = chord_tool.noteToNumber(bass_notes[index]) * 12;
			tenor_pos = chord_tool.noteToNumber(tenor_notes[index]) * 12;
			alto_pos = chord_tool.noteToNumber(alto_notes[index]) * 12;
			ctx.drawImage(img, 0, 0);
			ctx.fillStyle = 'gray';
			ctx.fillRect(bass_pos - 107, 4, 12, img.height - 8);
			ctx.fillRect(tenor_pos - 107, 4, 12, img.height - 8);
			ctx.fillRect(alto_pos - 107, 4, 12, img.height - 8);
		}, time)
	}, "1m")


	loop.start();

	Tone.Transport.start("+0.01");
	$( "#stopcanon" ).click(function() {
		Tone.Transport.stop();
	});
	});



});
