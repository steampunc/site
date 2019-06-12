
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
	tenor_notes = [notes[1]+4]; 
	alto_notes = [notes[2]+4];
	soprano_notes = [];
	for (var i = 1; i < chords.length; i++) {
		notes = chord_tool.getNotes(chords[i]);

		bass_notes.push(notes[0] + 3);
		tenor_notes.push(chord_tool.closestChordTone(tenor_notes[tenor_notes.length - 1], notes));
		alto_notes.push(chord_tool.closestChordTone(alto_notes[alto_notes.length - 1], notes));
		
	}
	console.log(bass_notes);
	console.log(tenor_notes);
	console.log(alto_notes);
	return [bass_notes, tenor_notes, alto_notes, soprano_notes];
}

function MakeLoop(synth, notes) {
	let loop = new Tone.Loop(time => {
		var note = notes[Math.floor(time) % notes.length];
		synth.triggerAttackRelease(note, 0.8);

	}, "1m");
	return loop;

}

$(document).ready(function() {
	let bass = new Tone.MonoSynth(options);
	let tenor = new Tone.MonoSynth(options);
	let alto = new Tone.MonoSynth(options);
	let soprano = new Tone.MonoSynth(options);
	bass.toMaster();
	tenor.toMaster();
	alto.toMaster();
	soprano.toMaster();

	var chords = ["Dm", "Am", "E", "Am"];
	[bass_notes, tenor_notes, alto_notes, soprano_notes] = GetNotes(chords);
	
	let bassloop = MakeLoop(bass, bass_notes);
	let tenorloop = MakeLoop(tenor, tenor_notes);
	let altoloop = MakeLoop(alto, alto_notes);
	let sopranoloop = MakeLoop(soprano, soprano_notes);


	$( "#startcanon").click(function () {

		bassloop.start();
		tenorloop.start();
		altoloop.start();
		sopranoloop.start();

		Tone.Transport.start();
	});
	$( "#stopcanon" ).click(function() {
		Tone.Transport.stop();
	});



});
